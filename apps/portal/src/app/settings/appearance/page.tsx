import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_CONFIG, requireInternalUser } from '@trionyx/auth';
import { InternalShell } from '../../../components/shell/InternalShell';
import { AppearanceSettings } from './AppearanceSettings';
export default async function AppearancePage() {
  const token = (await cookies()).get(AUTH_CONFIG.cookieName)?.value;
  const auth = await requireInternalUser(token).catch(() => null);
  if (!auth) redirect('/login');
  return <InternalShell user={auth.user}><AppearanceSettings /></InternalShell>;
}
