'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Briefcase, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface CallToActionCardProps {
  title: string;
  subtitle: string;
  iconName: 'Briefcase' | 'Users';
  features: string[];
  ctaText: string;
  ctaHref: string;
  gradient: string;
}

export function CallToActionCard({
  title,
  subtitle,
  iconName,
  features,
  ctaText,
  ctaHref,
  gradient,
}: CallToActionCardProps) {
  const Icon = iconName === 'Briefcase' ? Briefcase : Users;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Card className="h-full border-2 hover:border-primary/50 transition-colors relative overflow-hidden group">
        <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg ${gradient}`}>
              <Icon className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Button className="w-full sm:w-auto" variant="outline" asChild>
            <Link href={ctaHref}>
              {ctaText} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
