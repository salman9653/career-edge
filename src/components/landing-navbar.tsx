'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { motion } from 'framer-motion';
import { ModeToggle } from '@/components/mode-toggle';

interface LandingNavbarProps {
  onSignUpClick?: () => void;
  signUpHref?: string;
}

export function LandingNavbar({ onSignUpClick, signUpHref }: LandingNavbarProps) {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/30 backdrop-blur-xl supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-background/40 supports-[backdrop-filter]:to-background/20 shadow-lg shadow-black/5"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Logo />
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link 
            href="/" 
            className={`transition-colors hover:text-primary ${pathname === '/' ? 'text-primary font-semibold border-b-2 border-primary' : ''}`}
          >
            Home
          </Link>
          <Link 
            href="/companies" 
            className={`transition-colors hover:text-primary ${pathname === '/companies' ? 'text-primary font-semibold border-b-2 border-primary' : ''}`}
          >
            For Companies
          </Link>
          <Link 
            href="/candidates" 
            className={`transition-colors hover:text-primary ${pathname === '/candidates' ? 'text-primary font-semibold border-b-2 border-primary' : ''}`}
          >
            For Candidates
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          {onSignUpClick ? (
            <Button size="sm" onClick={onSignUpClick}>
              Sign Up
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link href={signUpHref || '/signup'}>Sign Up</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
