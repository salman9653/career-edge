import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface GlassCardProps extends React.ComponentProps<typeof Card> {
  gradient?: boolean
}

export function GlassCard({ className, gradient, ...props }: GlassCardProps) {
  return (
    <Card
      className={cn(
        "bg-background/40 backdrop-blur-xl border-white/10 shadow-lg",
        gradient && "bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
