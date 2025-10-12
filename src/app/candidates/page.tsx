
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Search, CheckCircle, Bot, BrainCircuit, Mic, FileQuestion, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function CandidateLandingPage() {
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
              <Link href="/signup/candidate">Sign Up</Link>
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
              Your next career move starts here.
            </motion.h1>
            <motion.p 
              {...FADE_IN_UP_ANIMATION_SETTINGS}
              transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.2}}
              className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
              Discover personalized job recommendations, track your applications, and land your dream job with our AI-powered toolkit.
            </motion.p>
            <motion.div 
              {...FADE_IN_UP_ANIMATION_SETTINGS}
              transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.4}}
              className="mt-10">
              <Button size="lg" asChild>
                <Link href="/signup/candidate">Get Started For Free</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center py-20 md:py-28">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              {...FADE_IN_UP_ANIMATION_SETTINGS}
              className="text-center mb-16">
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">A Simple Path to Your Dream Job</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Follow these three simple steps to unlock your potential.</p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-3">
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.1}}>
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline mt-4">1. Build Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Create a standout profile and upload your resume to showcase your skills and experience to top employers.</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.2}}>
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Search className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline mt-4">2. Get Matched by AI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Our AI analyzes your profile to suggest jobs that are a perfect fit for your skills and career goals.</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.3}}>
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <CardTitle className="font-headline mt-4">3. Apply and Track</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Apply to jobs with a single click and monitor all your application statuses in one convenient place.</p>
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
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">Your Complete Career Toolkit</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Everything you need to stand out and get hired.</p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.1}}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot /> AI-Powered Job Matching
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Stop endlessly searching. Our AI brings you roles that perfectly match your skills and ambitions. <Badge variant="outline" className="ml-2">Coming Soon</Badge></p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.2}}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BrainCircuit /> Resume Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Get instant AI feedback on how well your resume aligns with a specific job description to optimize your chances. <Badge variant="default" className="ml-2">New</Badge></p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.3}}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic /> AI Mock Interview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Build confidence by practicing your interview skills with an AI-powered mock interviewer that gives you real-time feedback. <Badge variant="outline" className="ml-2">Coming Soon</Badge></p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.4}}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <FileQuestion /> Question Library
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Prepare for any scenario by reviewing common interview questions from our extensive, community-driven library.</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.5}}>
                 <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star /> One-Click Apply
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Apply to your dream jobs faster than ever. No more filling out the same tedious forms over and over. <Badge variant="outline" className="ml-2">Coming Soon</Badge></p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div {...FADE_IN_UP_ANIMATION_SETTINGS} transition={{...FADE_IN_UP_ANIMATION_SETTINGS.transition, delay: 0.6}}>
                 <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck /> Application Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Stay organized and track the status of all your job applications from one central, easy-to-use dashboard. <Badge variant="outline" className="ml-2">Coming Soon</Badge></p>
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
