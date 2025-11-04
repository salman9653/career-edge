
import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-3">
      <Image
        src="/logo.png"
        alt="Career Edge Logo"
        width={40}
        height={40}
        className="rounded-full"
      />
      <span className="font-headline text-2xl font-bold text-foreground">
        Career Edge
      </span>
    </Link>
  );
}
