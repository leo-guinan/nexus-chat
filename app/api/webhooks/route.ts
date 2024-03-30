import type {Stripe} from "stripe";

import {NextResponse} from "next/server";

import {stripe} from "@/lib/stripe";
import {prisma} from "@/lib/utils";
import {Price, Subscription} from "@prisma/client/edge";

export async function POST(req: Request) {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            await (await req.blob()).text(),
            req.headers.get("stripe-signature") as string,
            process.env.STRIPE_WEBHOOK_SECRET as string,
        );
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        // On error, log and return the error message.
        if (err! instanceof Error) console.log(err);
        console.log(`❌ Error message: ${errorMessage}`);
        return NextResponse.json(
            {message: `Webhook Error: ${errorMessage}`},
            {status: 400},
        );
    }

    // Successfully constructed event.
    console.log("✅ Success:", event.id);

    const permittedEvents: string[] = [
        "checkout.session.completed",
        "payment_intent.succeeded",
        "payment_intent.payment_failed",
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted"
    ];

    if (permittedEvents.includes(event.type)) {
        let data;
        let subscription: Subscription | null | undefined;
        let price: Price | null | undefined;
        try {
            switch (event.type) {
                case "checkout.session.completed":
                    data = event.data.object as Stripe.Checkout.Session;
                    console.log(data);

                    // need to activate the subscription when the checkout session is completed
                    subscription = await prisma.subscription.findFirst({
                        where: {
                            stripeSubscriptionId: data.subscription as string
                        }
                    })

                    if (!subscription) {
                        throw new Error("Subscription not found")
                    }

                    await prisma.subscription.update({
                        where: {
                            id: subscription.id
                        },
                        data: {
                            active: true
                        }
                    })


                    console.log(`💰 CheckoutSession status: ${data.payment_status}`);
                    break;
                case "payment_intent.payment_failed":
                    data = event.data.object as Stripe.PaymentIntent;
                    console.log(`❌ Payment failed: ${data.last_payment_error?.message}`);
                    break;
                case "payment_intent.succeeded":
                    data = event.data.object as Stripe.PaymentIntent;
                    console.log(`💰 PaymentIntent status: ${data.status}`);
                    break;
                case "customer.subscription.created":
                    data = event.data.object as Stripe.Subscription;
                    console.log(data)
                    console.log(`🔔 Subscription created: ${data.id}`);
                    const user = await prisma.user.findFirst({
                        where: {
                            stripeCustomerId: data.customer as string
                        }
                    })

                    price = await prisma.price.findFirst({
                        where: {
                            stripePriceId: data.items.data[0].price.id
                        }
                    })
                    if (!user || !price) {
                        throw new Error("User or price not found")
                    }


                    subscription = await prisma.subscription.create({
                        data: {
                            stripeSubscriptionId: data.id,
                            active: false,
                            price: {
                                connect: {
                                    id: price.id
                                }
                            },
                            user: {
                                connect: {
                                    id: user?.id
                                }
                            }
                        }
                    })
                    break;
                case "customer.subscription.updated":
                    data = event.data.object as Stripe.Subscription;

                    subscription = await prisma.subscription.findFirst({
                        where: {
                            stripeSubscriptionId: data.id
                        }
                    })
                    if (!subscription) {
                        throw new Error("Subscription not found")
                    }

                    price = await prisma.price.findFirst({
                        where: {
                            stripePriceId: data.items.data[0].price.id
                        }
                    })
                    if (!price) {
                        throw new Error("Price not found")
                    }

                    await prisma.subscription.update({
                        where: {
                            id: subscription.id
                        },
                        data: {
                            active: data.status === "active",
                            price: {
                                connect: {
                                    id: price.id
                                }
                            }
                        }
                    })

                    console.log(data)
                    console.log(`🔔 Subscription updated: ${data.id}`);
                    break;
                case "customer.subscription.deleted":
                    data = event.data.object as Stripe.Subscription;

                    subscription = await prisma.subscription.findFirst({
                        where: {
                            stripeSubscriptionId: data.id
                        }
                    })
                    if (!subscription) {
                        throw new Error("Subscription not found")
                    }

                    await prisma.subscription.delete({
                        where: {
                            id: subscription.id
                        }
                    })

                    console.log(data)
                    console.log(`🔔 Subscription deleted: ${data.id}`);
                    break;
                default:
                    throw new Error(`Unhandled event: ${event.type}`);
            }
        } catch
            (error)
            {
                console.log(error);
                return NextResponse.json(
                    {message: "Webhook handler failed"},
                    {status: 500},
                );
            }
        }
        // Return a response to acknowledge receipt of the event.
        return NextResponse.json({message: "Received"}, {status: 200});
    }