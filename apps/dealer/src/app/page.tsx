import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { DEALER_AUTH_CONFIG } from '@trionyx/auth';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;

  if (token) {
    redirect('/overview');
  } else {
    redirect('/login');
  }
}
