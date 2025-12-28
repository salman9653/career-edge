'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function HeroSection() {
  return (
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
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm rounded-full mb-4"
              >
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
              Streamline your hiring process or find your dream job with our
              AI-powered platform. Smart matching, seamless applications, and
              powerful tools for everyone.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 min-w-[200px]"
            >
              <Button size="lg" asChild className="h-12 px-8 text-lg">
                <Link href="/signup">
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-lg"
                asChild
              >
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
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative z-10 mix-blend-screen">
                <Image
                  src="/images/hero-home-black.png"
                  alt="Future of Hiring"
                  width={600}
                  height={600}
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
