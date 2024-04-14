import Link from 'next/link';
import { getSignInUrl, getUser, signOut } from '@workos-inc/authkit-nextjs';

export default async function HomePage() {
  // Retrieves the user from the session or returns `null` if no user is signed in
  const { user } = await getUser();

  // Get the URL to redirect the user to AuthKit to sign in
  const signInUrl = await getSignInUrl();

  /**
   * If a signed-in user is mandatory, you can use the `ensureSignedIn`
   * configuration option. If logged out, the below will immediately redirect
   * the user to AuthKit. After signing in, the user will automatically
   * be redirected back to this page.
   * */
  // const { user } = await getUser({ ensureSignedIn: true });

  if (!user) {
    return <Link href={signInUrl}>Sign in</Link>;
  }

  return (
    <form
      action={async () => {
        'use server';
        await signOut();
      }}
    >
      <p>Welcome back{user.firstName && `, ${user.firstName}`}</p>
      <button type="submit">Sign out</button>
    </form>
  );
}
