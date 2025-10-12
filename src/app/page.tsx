'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Briefcase, Users } from 'lucide-react';
import { Logo } from '@/components/logo';
import { motion } from 'framer-motion';
import { ModeToggle } from '@/components/mode-toggle';
import { RoleSelectionDialog } from '@/components/role-selection-dialog';
import { useState } from 'react';

export default function Home() {
  const [isRoleSelectionOpen, setIsRoleSelectionOpen] = useState(false);
  
  const FADE_IN_ANIMATION_SETTINGS = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const FADE_IN_UP_ANIMATION_SETTINGS = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <>
    <RoleSelectionDialog open={isRoleSelectionOpen} onOpenChange={setIsRoleSelectionOpen} />
    <div className="flex min-h-screen flex-col">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <Logo />
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ModeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button onClick={() => setIsRoleSelectionOpen(true)} className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white">
              Sign Up
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="flex-grow">
        <section className="relative flex items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-r from-[#667EEA]/10 to-[#764BA2]/10 bg-[length:200%_200%] animate-background-pan">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.h1 
              {...FADE_IN_UP_ANIMATION_SETTINGS}
              className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Where Talent Meets Opportunity
            </motion.h1>
            <motion.p 
              {...FADE_IN_UP_ANIMATION_SETTINGS}
              transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.2}}
              className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              We bridge the gap between ambitious professionals and forward-thinking companies. Discover your perfect match with our AI-driven platform.
            </motion.p>
            <motion.div
              {...FADE_IN_UP_ANIMATION_SETTINGS}
              transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.4}}
              className="mt-10">
              <Button size="lg" onClick={() => setIsRoleSelectionOpen(true)}>
                Get Started
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="bg-secondary py-20 md:py-28 flex items-center min-h-screen">
          <div className="container mx-auto px-4 md:px-6 lg:px-16 xl:px-32">
            <motion.div {...FADE_IN_ANIMATION_SETTINGS} className="text-center">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to take the next step?
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Whether you're looking for your next role or your next great hire, Career Edge is for you.
                </p>
            </motion.div>
            <div className="mt-16 grid gap-8 md:grid-cols-2">
                <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.2}}>
                  <Card>
                      <CardHeader>
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Users className="h-6 w-6" />
                          </div>
                          <CardTitle className="font-headline mt-4 text-center">For Candidates</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                          <p className="text-muted-foreground mb-6">Find your dream job, get matched with top companies, and manage your applications all in one place.</p>
                          <Button asChild variant="secondary">
                              <Link href="/candidates">Explore <ArrowRight className="ml-2" /></Link>
                          </Button>
                      </CardContent>
                  </Card>
                </motion.div>
                <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.4}}>
                  <Card>
                      <CardHeader>
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Briefcase className="h-6 w-6" />
                          </div>
                          <CardTitle className="font-headline mt-4 text-center">For Companies</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                          <p className="text-muted-foreground mb-6">Post job openings, track applicants with our streamlined ATS, and find the perfect fit for your team.</p>
                          <Button asChild variant="secondary">
                              <Link href="/companies">Explore <ArrowRight className="ml-2" /></Link>
                          </Button>
                      </CardContent>
                  </Card>
                </motion.div>
            </div>
          </div>
        </section>
      </main>

      <motion.footer {...FADE_IN_ANIMATION_SETTINGS} className="bg-background">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 px-4 py-6 md:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Career Edge. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
    </>
  );
}
