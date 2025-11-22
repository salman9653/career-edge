'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { RoleSelectionDialog } from '@/components/role-selection-dialog';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  
  // Determine if we're on login or signup page
  const isLoginPage = pathname === '/login';
  const isSignupPage = pathname?.startsWith('/signup');
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Auth Navbar */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Logo />
          </motion.div>
          
          {/* Right side - Theme toggle and Auth buttons */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Theme Toggle */}
            <ModeToggle />
            
            {/* Auth Button - Show Login on signup pages, Show Signup on login page */}
            {isLoginPage ? (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setIsRoleDialogOpen(true)}
                className="relative overflow-hidden group"
              >
                <span className="relative z-10">Sign Up</span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            ) : isSignupPage ? (
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              >
                <Link href="/login">
                  Log In
                </Link>
              </Button>
            ) : null}
          </motion.div>
        </div>
      </motion.header>
      
      {/* Role Selection Dialog */}
      <RoleSelectionDialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen} />
      
      {/* Main Content with animated background */}
      <main className="flex-1 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/30 dark:from-primary/10 dark:via-background dark:to-secondary/20" />
        
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <motion.footer
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative z-10 border-t bg-background/60 backdrop-blur-sm py-6"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="text-center md:text-left">
              © 2024 Career Edge. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link 
                href="/privacy" 
                className="hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4"
              >
                Terms of Service
              </Link>
              <Link 
                href="/contact" 
                className="hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
