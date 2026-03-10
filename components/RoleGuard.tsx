'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getUserRoles } from '@/app/utils/user';
import Cookies from 'js-cookie';

type Props = {
  children: React.ReactNode;
};

export default function RoleGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkRole = async () => {
      try {
        const mobile = Cookies.get('mobile');

        if (pathname === '/login') {
          if (isMounted) {
            setAllowed(true);
            setLoading(false);
          }
          return;
        }

        if (!mobile) {
          router.replace('/login');
          return;
        }

        const roles = await getUserRoles();

        const hasAllowedRole =
          roles.includes('CLF') ||
          roles.includes('VO') ||
          roles.includes('SHG');

        if (!hasAllowedRole && pathname !== '/no-permission') {
          router.replace('/no-permission');
          return;
        }

        if (hasAllowedRole && pathname === '/no-permission') {
          router.replace('/dashboard');
          return;
        }

        if (isMounted) {
          setAllowed(true);
        }
      } catch {
        router.replace('/no-permission');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkRole();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (loading) return null;
  if (!allowed) return null;

  return <>{children}</>;
}
