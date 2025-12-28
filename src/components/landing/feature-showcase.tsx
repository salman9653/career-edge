'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FeatureShowcaseProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
  children?: ReactNode;
}

export function FeatureShowcase({
  title,
  description,
  imageSrc,
  imageAlt,
  imagePosition = 'left',
  children,
}: FeatureShowcaseProps) {
  const imageOrder = imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2';
  const contentOrder = imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1';
  const xDirection = imagePosition === 'left' ? -50 : 50;

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, x: xDirection }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={imageOrder}
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-background/50 backdrop-blur">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={600}
            height={400}
            className="object-cover w-full"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -xDirection }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className={contentOrder}
      >
        <h3 className="text-3xl font-bold mb-4">{title}</h3>
        <p className="text-muted-foreground text-lg mb-6">
          {description}
        </p>
        {children}
      </motion.div>
    </div>
  );
}
