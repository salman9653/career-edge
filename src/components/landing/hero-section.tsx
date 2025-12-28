'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface HeroSectionProps {
  badge: {
    text: string;
    bgColor: string;
    textColor: string;
  };
  title: {
    before: string;
    highlight: string;
    gradientFrom: string;
    gradientTo: string;
  };
  description: string;
  primaryCta: {
    text: string;
    href: string;
    bgColor: string;
    hoverColor: string;
  };
  secondaryCta: {
    text: string;
    href: string;
  };
  image: {
    src: string;
    alt: string;
    gradientFrom: string;
    gradientTo: string;
  };
}

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

export function HeroSection({
  badge,
  title,
  description,
  primaryCta,
  secondaryCta,
  image,
}: HeroSectionProps) {
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
                className={`px-4 py-2 text-sm rounded-full mb-4 ${badge.bgColor} ${badge.textColor}`}
              >
                {badge.text}
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl"
            >
              {title.before} <br className="hidden sm:inline" />
              <span className={`bg-clip-text text-transparent bg-gradient-to-r ${title.gradientFrom} ${title.gradientTo}`}>
                {title.highlight}
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-[700px] text-lg text-muted-foreground md:text-xl"
            >
              {description}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 min-w-[200px]"
            >
              <Button
                size="lg"
                className={`h-12 px-8 text-lg ${primaryCta.bgColor} ${primaryCta.hoverColor}`}
                asChild
              >
                <Link href={primaryCta.href}>
                  {primaryCta.text} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-lg"
                asChild
              >
                <Link href={secondaryCta.href}>{secondaryCta.text}</Link>
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
              <div className={`absolute inset-0 bg-gradient-to-tr ${image.gradientFrom} ${image.gradientTo} rounded-full blur-3xl animate-pulse`} />
              <div className="relative z-10 mix-blend-screen">
                <Image
                  src={image.src}
                  alt={image.alt}
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
