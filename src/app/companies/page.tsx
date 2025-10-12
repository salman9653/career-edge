
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Search, CheckCircle, Bot, BookUser, ClipboardList, Library, ShieldCheck, FileCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function CompanyLandingPage() {
  const FADE_IN_UP_ANIMATION_SETTINGS = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
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
            <Button asChild>
              <Link href="/signup/company">Sign Up</Link>
            </Button>
          </div>
        </div>
      </motion.header>
      <main className="flex-1">
        <section className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-secondary/40 py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.h1 
              {...FADE_IN_UP_ANIMATION_SETTINGS}
              className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Hire Top Talent, Screened by AI.
            </motion.h1>
            <motion.p 
              {...FADE_IN_UP_ANIMATION_SETTINGS}
              transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.2}}
              className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              Our AI-powered platform streamlines your hiring process, from smart screening to seamless applicant tracking, so you can build the perfect team, faster.
            </motion.p>
            <motion.div 
              {...FADE_IN_UP_ANIMATION_SETTINGS}
              transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.4}}
              className="mt-10">
              <Button size="lg" asChild>
                <Link href="/signup/company">Request a Demo</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              {...FADE_IN_UP_ANIMATION_SETTINGS}
              className="text-center mb-16">
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">Hire Smarter, Not Harder</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">A simple, three-step process to find your next great hire.</p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-3">
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.1}}>
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline mt-4">1. Post a Job</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Easily create and publish job openings to reach a wide pool of qualified candidates instantly.</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.2}}>
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Search className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline mt-4">2. AI Screens & Matches</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Our intelligent system analyzes resumes and skills to bring the best-matched candidates to the top.</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.3}}>
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline mt-4">3. Hire with Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Use our built-in tools to manage applicants, schedule interviews, and make the right hire.</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-secondary/40 py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              {...FADE_IN_UP_ANIMATION_SETTINGS}
              className="text-center mb-16">
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">The Ultimate Hiring Toolkit</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Tools designed to make your recruitment process efficient and effective.</p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.1}}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot /> AI Resume Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Automatically screen and rank candidates based on your job requirements, saving you hours of manual review. <Badge variant="default" className="ml-2">New</Badge></p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.2}}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search /> Intelligent Candidate Matching
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Our AI goes beyond keywords to match candidates based on skills, experience, and potential cultural fit. <Badge variant="outline" className="ml-2">Coming Soon</Badge></p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.3}}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck /> Seamless ATS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Manage your entire hiring pipeline, from application to offer, with our intuitive Applicant Tracking System.</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.4}}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookUser /> Candidate CRM
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Build and nurture your talent pipeline and manage candidate relationships effectively with our built-in CRM. <Badge variant="outline" className="ml-2">Coming Soon</Badge></p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.5}}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList /> Custom Assessments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Create and send custom skills assessments to objectively evaluate candidate abilities and streamline screening. <Badge variant="outline" className="ml-2">Coming Soon</Badge></p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.6}}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Library /> Company Question Bank
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Build a library of your favorite interview questions to ensure a consistent, fair, and effective interview process.</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <motion.footer 
        {...FADE_IN_UP_ANIMATION_SETTINGS}
        className="bg-background">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 px-4 py-6 md:px-6">
          <Logo />
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Career Edge. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
}
