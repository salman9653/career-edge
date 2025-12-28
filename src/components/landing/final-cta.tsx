'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface FinalCTAProps {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  bgColor?: string;
}

export function FinalCTA({
  title,
  description,
  ctaText,
  ctaHref,
  bgColor = 'bg-primary',
}: FinalCTAProps) {
  return (
    <section className={`py-20 ${bgColor} text-white`}>
      <div className="container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {title}
          </h2>
          <p className="text-blue-100 text-lg md:text-xl">{description}</p>
          <Button size="lg" variant="secondary" className="h-14 px-8 text-lg" asChild>
            <Link href={ctaHref}>
              {ctaText} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
