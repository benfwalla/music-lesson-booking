'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Calendar, Users, Clock, BookOpen, UserCheck, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Dashboard', icon: Music },
  { href: '/availability', label: 'Availability', icon: Clock },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/instructors', label: 'Instructors', icon: UserCheck },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/announcements', label: 'Announcements', icon: Megaphone },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-card">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Music className="h-6 w-6" />
            <span className="hidden sm:inline">MusicBook</span>
          </Link>
          <div className="flex gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
