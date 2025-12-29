'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development environment
    if (process.env.NODE_ENV === 'development') {
        switch (metric.name) {
            case 'FCP': 
                console.log('⚡ First Contentful Paint:', metric.value);
                break;
            case 'LCP': 
                console.log('🚀 Largest Contentful Paint:', metric.value);
                break;
            case 'CLS': 
                console.log('Layout Shift:', metric.value);
                break;
            case 'FID': 
                console.log('Interaction Delay:', metric.value);
                break;
            case 'INP': 
                console.log('Interaction Next Paint:', metric.value);
                break;
            default:
                console.log(metric.name, metric.value);
        }
    }
  });

  return null;
}
