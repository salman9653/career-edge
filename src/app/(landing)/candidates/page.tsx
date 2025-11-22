'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Search, FileText, TrendingUp, Briefcase, UserCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function CandidatesPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
         <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
         <div className="absolute left-0 top-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#00000000_70%,transparent_100%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,#ffffff0a_70%,transparent_100%)]"></div>

        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8"
            >
              <motion.div variants={itemVariants}>
                 <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  For Job Seekers
                </Badge>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl"
              >
                Your Next Career Move <br className="hidden sm:inline" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Starts Here</span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="max-w-[700px] text-lg text-muted-foreground md:text-xl"
              >
                Unlock your potential with AI-driven insights. We help you build a standout profile, match with top companies, and land the job you deserve.
              </motion.p>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 min-w-[200px]"
              >
                <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/signup/candidate">Build Your Profile <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg" asChild>
                  <Link href="#how-it-works">How It Works</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
               <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                  <div className="relative z-10 rounded-3xl overflow-hidden border border-white/20 bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-xl shadow-2xl">
                    <Image 
                      src="/images/candidates-hero.png" 
                      alt="Career Growth" 
                      width={500} 
                      height={500} 
                      className="object-contain"
                    />
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="how-it-works" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Your Journey to Success</h2>
            <p className="mt-4 text-muted-foreground text-lg">Three simple steps to land your dream job.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
             <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 dark:from-blue-800 dark:via-purple-800 dark:to-blue-800 -z-10" />
            {[
              { icon: UserCheck, title: "1. Create Profile", desc: "Build a comprehensive profile that highlights your unique skills and experiences." },
              { icon: Search, title: "2. Get Matched", desc: "Our AI analyzes your profile to find roles that perfectly align with your goals." },
              { icon: Briefcase, title: "3. Apply & Track", desc: "Apply with a single click and track your application status in real-time." }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center bg-background p-8 rounded-2xl shadow-sm border relative z-10"
              >
                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Zig Zag */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 space-y-24">
          
          {/* Feature 1: Resume Analysis */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
             <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
             >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-background/50 backdrop-blur">
                  <Image 
                    src="/images/resume-analysis.png" 
                    alt="AI Resume Analysis" 
                    width={800} 
                    height={600} 
                    className="w-full h-auto object-cover"
                  />
                </div>
             </motion.div>
             <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 space-y-6"
             >
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-bold">Smart Resume Analysis</h3>
                <p className="text-lg text-muted-foreground">
                  Get instant feedback on your resume. Our AI scans your CV against industry standards and job descriptions to suggest improvements that increase your chances of getting hired.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /> <span>Keyword Optimization</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /> <span>Formatting Suggestions</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /> <span>ATS Compatibility Check</span></li>
                </ul>
             </motion.div>
          </div>

          {/* Feature 2: Application Tracking */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
             <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
             >
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-bold">Track Every Opportunity</h3>
                <p className="text-lg text-muted-foreground">
                  Never lose track of an application again. Our intuitive dashboard lets you monitor the status of every job you've applied to, from submission to offer letter.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /> <span>Real-time Status Updates</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /> <span>Interview Scheduling</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /> <span>Application History</span></li>
                </ul>
             </motion.div>
             <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
             >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-background/50 backdrop-blur">
                  <Image 
                    src="/images/job-dashboard.png" 
                    alt="Job Dashboard" 
                    width={800} 
                    height={600} 
                    className="w-full h-auto object-cover"
                  />
                </div>
             </motion.div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Accelerate Your Career?</h2>
            <p className="text-blue-100 text-lg md:text-xl">
              Join thousands of professionals who have found their dream jobs through Career Edge.
            </p>
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg" asChild>
              <Link href="/signup/candidate">Join Now - It's Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
