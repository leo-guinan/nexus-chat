"use server";

import type {Stripe} from "stripe";
import {stripe} from "@/lib/stripe";
import {prisma} from "@/lib/utils";
import {auth} from "@/auth";
import {Subscription} from "@prisma/client/edge"

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};

export async function createCheckoutSession(
    annual: boolean,
    tier: string
): Promise<CheckoutResponse> {

    let customer: string;
    try {
        const attemptedCustomer = await createOrRetrieveCustomer();
        if (!attemptedCustomer) throw new Error("Unable to create stripe customer")
        customer = attemptedCustomer
    } catch (err) {
        console.error(err);
        throw new Error('Unable to access customer record.');
    }
    const product = await prisma.product.findFirst({where: {name: tier}})
    if (!product) throw new Error("Invalid product")
    const where = annual ? {where: {interval: "annual", productId: product.id}} :   {where: {interval: "monthly", productId: product.id}}
    const price = await prisma.price.findFirst(where)
    if (!price || !price.stripePriceId) throw new Error("Invalid price")
    //
      let params: Stripe.Checkout.SessionCreateParams = {
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        customer,
        customer_update: {
          address: 'auto'
        },
        line_items: [
          {
            price: price.stripePriceId,
            quantity: 1
          }
        ],
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade?success=false`,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade?success=true`,
           mode: 'subscription',
      };
    //
    //   console.log(
    //     'Trial end:',
    //     calculateTrialEndUnixTimestamp(price.trial_period_days)
    //   );

    //
      // Create a checkout session in Stripe
      let session;
      try {
        session = await stripe.checkout.sessions.create(params);
      } catch (err) {
        console.error(err);
        throw new Error('Unable to create checkout session.');
      }
    //
      // Instead of returning a Response, just return the data or error.
      if (session) {
        return { sessionId: session.id };
      } else {
        throw new Error('Unable to create checkout session.');
      }
    // } catch (error) {
    //   if (error instanceof Error) {
    //     return {
    //       errorRedirect: getErrorRedirect(
    //         redirectPath,
    //         error.message,
    //         'Please try again later or contact a system administrator.'
    //       )
    //     };
    //   } else {
    //     return {
    //       errorRedirect: getErrorRedirect(
    //         redirectPath,
    //         'An unknown error occurred.',
    //         'Please try again later or contact a system administrator.'
    //       )
    //     };
    //   }

}

export async function createOrRetrieveCustomer() {

    const session = await auth();

    if (!session?.user?.id) {
        return null

    }

    const existingUser = await prisma.user.findFirst({
        where: {
            id: session.user.id
        },
    })

    if (!existingUser) {
        return null
    }


    let stripeCustomerId: string | undefined;
    let subscription: Subscription | undefined;

    console.log(existingUser)


    if (!existingUser?.stripeCustomerId) {
        const stripeCustomers = await stripe.customers.list({email: existingUser.email});
        stripeCustomerId =
            stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined;
        if (!stripeCustomerId) {
            stripeCustomerId = await createCustomerInStripe(existingUser.id, existingUser.email)
        }
    } else {
        const existingStripeCustomer = await stripe.customers.retrieve(
            existingUser.stripeCustomerId
        );
        stripeCustomerId = existingStripeCustomer.id;

    }

    if (!stripeCustomerId) throw new Error('Stripe customer creation failed.');

    if (existingUser.stripeCustomerId !== stripeCustomerId) {
        await prisma.user.update({
            where: {
                id: existingUser.id
            },
            data: {
                stripeCustomerId
            }
        })
    }
    return stripeCustomerId;

}

const createCustomerInStripe = async (userId: string, email: string) => {
    const customerData = {metadata: {userId}, email: email};
    const newCustomer = await stripe.customers.create(customerData);
    if (!newCustomer) throw new Error('Stripe customer creation failed.');

    return newCustomer.id;
};
