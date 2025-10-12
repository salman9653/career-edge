import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#667EEA] to-[#764BA2] text-white">
        <Briefcase className="h-6 w-6" />
      </div>
      <span className="font-headline text-2xl font-bold text-foreground">
        Career Edge
      </span>
    </Link>
  );
}
