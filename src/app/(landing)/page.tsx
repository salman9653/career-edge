'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Briefcase, Users, CheckCircle2, Zap, Shield, Globe, Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function Home() {
  
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
                    <Badge variant="secondary" className="px-4 py-2 text-sm rounded-full mb-4">
                      🚀 The Future of Hiring is Here
                    </Badge>
                  </motion.div>
                  
                  <motion.h1 
                    variants={itemVariants}
                    className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
                  >
                    Where Top Talent Meets <br className="hidden sm:inline" />
                    World-Class Opportunity
                  </motion.h1>
                  
                  <motion.p 
                    variants={itemVariants}
                    className="max-w-[700px] text-lg text-muted-foreground md:text-xl"
                  >
                    Streamline your hiring process or find your dream job with our AI-powered platform. 
                    Smart matching, seamless applications, and powerful tools for everyone.
                  </motion.p>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 min-w-[200px]"
                  >
                    <Button size="lg" onClick={() => setIsRoleSelectionOpen(true)} className="h-12 px-8 text-lg">
                      Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 px-8 text-lg" asChild>
                      <Link href="#features">Learn More</Link>
                    </Button>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative hidden lg:block"
                >
                   <div className="relative w-full aspect-square max-w-[600px] mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                      <Image 
                        src="/images/landing-hero.png" 
                        alt="Future of Hiring" 
                        width={800} 
                        height={800} 
                        className="relative z-10 object-contain drop-shadow-2xl"
                      />
                   </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features Section - Zig Zag */}
          <section id="features" className="py-20 bg-secondary/30">
            <div className="container mx-auto px-4 md:px-6">
              <div className="text-center mb-20">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose Career Edge?</h2>
                <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                  We provide the tools you need to succeed, whether you're hiring or hunting.
                </p>
              </div>

              <div className="space-y-24">
                {/* Feature 1: AI Matching */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                   <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="order-2 lg:order-1"
                   >
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-background/50 backdrop-blur">
                        <Image 
                          src="/images/ai-matching.png" 
                          alt="AI Matching" 
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
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Zap className="h-6 w-6" />
                      </div>
                      <h3 className="text-3xl font-bold">AI-Powered Precision Matching</h3>
                      <p className="text-lg text-muted-foreground">
                        Stop wasting time on irrelevant listings. Our advanced AI algorithms analyze skills, experience, and cultural fit to connect the right candidates with the right companies instantly.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /> <span>95% Matching Accuracy</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /> <span>Real-time Recommendations</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /> <span>Bias-free Screening</span></li>
                      </ul>
                   </motion.div>
                </div>

                {/* Feature 2: Global Reach */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                   <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                   >
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Globe className="h-6 w-6" />
                      </div>
                      <h3 className="text-3xl font-bold">Global Talent, Local Impact</h3>
                      <p className="text-lg text-muted-foreground">
                        Access a worldwide pool of talent and opportunities without geographical limits. Whether you're looking for remote work or relocating, we've got you covered.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /> <span>Access to 100+ Countries</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /> <span>Remote-first Opportunities</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-500" /> <span>Seamless Cross-border Hiring</span></li>
                      </ul>
                   </motion.div>
                   <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                   >
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-background/50 backdrop-blur">
                        <Image 
                          src="/images/global-reach.png" 
                          alt="Global Reach" 
                          width={800} 
                          height={600} 
                          className="w-full h-auto object-cover"
                        />
                      </div>
                   </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials / Social Proof */}
          <section className="py-20">
            <div className="container mx-auto px-4 md:px-6">
               <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Trusted by Industry Leaders</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { name: "Sarah J.", role: "Software Engineer", quote: "Career Edge helped me find a job that perfectly aligns with my career goals in less than a week!" },
                  { name: "TechCorp Inc.", role: "Hiring Partner", quote: "The quality of candidates we receive through this platform is unmatched. It has revolutionized our hiring." },
                  { name: "David M.", role: "Product Manager", quote: "The AI resume analysis gave me insights I never considered. Highly recommended for any job seeker." }
                ].map((testimonial, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="h-full bg-secondary/10 border-none">
                      <CardContent className="pt-6">
                        <Quote className="h-8 w-8 text-primary/40 mb-4" />
                        <p className="text-lg italic mb-6 text-muted-foreground">"{testimonial.quote}"</p>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                            {testimonial.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Dual CTA Section */}
          <section className="py-20 md:py-32 bg-secondary/30">
            <div className="container mx-auto px-4 md:px-6">
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Candidates CTA */}
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative group overflow-hidden rounded-3xl border bg-background p-8 lg:p-12 hover:border-primary/50 transition-colors shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                      <Users className="h-7 w-7" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">For Candidates</h3>
                    <p className="text-muted-foreground mb-6">
                      Ready to take the next step in your career? Get personalized job matches and tools to help you stand out.
                    </p>
                    <ul className="space-y-3 mb-8 text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> AI Resume Analysis</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Smart Job Recommendations</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> One-Click Applications</li>
                    </ul>
                    <Button className="w-full sm:w-auto" asChild>
                      <Link href="/candidates">Find Your Dream Job <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </motion.div>

                {/* Companies CTA */}
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative group overflow-hidden rounded-3xl border bg-background p-8 lg:p-12 hover:border-primary/50 transition-colors shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="h-14 w-14 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400">
                      <Briefcase className="h-7 w-7" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4">For Companies</h3>
                    <p className="text-muted-foreground mb-6">
                      Building a world-class team? Streamline your hiring process with our AI-powered recruitment suite.
                    </p>
                    <ul className="space-y-3 mb-8 text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Automated Screening</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Advanced Applicant Tracking</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Quality Talent Pool</li>
                    </ul>
                    <Button className="w-full sm:w-auto" variant="outline" asChild>
                      <Link href="/companies">Hire Top Talent <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
      </section>
    </>
  );
}
