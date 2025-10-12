
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const gradientButtonVariants = cva(
    'text-white border-0 bg-gradient-to-br from-purple-500 to-pink-500 hover:shadow-lg transition-shadow',
    {
        variants: {
            variant: {
                default: 'bg-gradient-to-br from-purple-500 to-pink-500',
            },
             size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

interface GradientButtonProps extends ButtonProps {
  tooltip?: string;
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, size, tooltip, ...props }, ref) => {
    
    const button = (
        <Button
            className={cn(gradientButtonVariants({ variant, size }), className)}
            ref={ref}
            {...props}
        />
    );

    if (tooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {button}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return button;
  }
);
GradientButton.displayName = 'GradientButton';

export { GradientButton, gradientButtonVariants };
