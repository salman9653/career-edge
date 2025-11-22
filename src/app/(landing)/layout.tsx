'use client';

import { LandingNavbar } from '@/components/landing-navbar';
import { LandingFooter } from '@/components/landing-footer';
import { RoleSelectionDialog } from '@/components/role-selection-dialog';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRoleSelectionOpen, setIsRoleSelectionOpen] = useState(false);
  const pathname = usePathname();

  // Determine signup behavior based on current page
  const getSignUpProps = () => {
    if (pathname === '/') {
      return { onSignUpClick: () => setIsRoleSelectionOpen(true) };
    } else if (pathname === '/candidates') {
      return { signUpHref: '/signup/candidate' };
    } else if (pathname === '/companies') {
      return { signUpHref: '/signup/company' };
    }
    return { signUpHref: '/signup' };
  };

  return (
    <>
      <RoleSelectionDialog open={isRoleSelectionOpen} onOpenChange={setIsRoleSelectionOpen} />
      <div className="flex min-h-screen flex-col bg-background">
        <LandingNavbar {...getSignUpProps()} />
        <main className="flex-grow">
          {children}
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
