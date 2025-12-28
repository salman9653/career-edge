'use client';

import { motion } from 'framer-motion';
import { Briefcase, Users, UserCheck, Search, Zap } from 'lucide-react';

type IconName = 'Briefcase' | 'Users' | 'UserCheck' | 'Search' | 'Zap';

interface StepCardProps {
  iconName: IconName;
  title: string;
  description: string;
  index: number;
  colorScheme?: 'blue' | 'orange';
}

const iconMap = {
  Briefcase,
  Users,
  UserCheck,
  Search,
  Zap,
};

export function StepCard({ iconName, title, description, index, colorScheme = 'blue' }: StepCardProps) {
  const Icon = iconMap[iconName];
  const colorClasses = colorScheme === 'blue' 
    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className="flex flex-col items-center text-center bg-background p-8 rounded-2xl shadow-sm border relative z-10"
    >
      <div className={`h-16 w-16 rounded-full ${colorClasses} flex items-center justify-center mb-6`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
