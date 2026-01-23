'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

const deptLinks = [
  { label: 'Civil Engineering', href: '/department/civil-engineering' },
  { 
    label: 'People', 
    href: '#',
    children: [
      { label: 'Faculty', href: '/department/civil-engineering/faculty' },
      { label: 'Staff', href: '/department/civil-engineering/staff' },
      { label: 'Students', href: '/department/civil-engineering/students' },
    ]
  },
  { 
    label: 'Academics', 
    href: '#',
    children: [
      { label: 'Course Structure', href: '/department/civil-engineering/course-structure' },
      { label: 'Syllabus', href: '/department/civil-engineering/syllabus' },
      { label: 'Time-Table', href: '/department/civil-engineering/timetable' },
    ]
  },
  { 
    label: 'Research', 
    href: '#',
    children: [
      { label: 'Projects', href: '/department/civil-engineering/projects' },
      { label: 'Publications', href: '/department/civil-engineering/publications' },
    ]
  },
];

interface DeptNavbarProps {
  scrolled: boolean;
  mounted: boolean;
}

export function DeptNavbar({ scrolled, mounted }: DeptNavbarProps) {
  const pathname = usePathname();

  return (
    <nav className={`w-full transition-all duration-500 border-t border-[#00FFCC]/30 py-3 z-[100] ${mounted && scrolled
                        ? 'bg-[#013A33]/95 backdrop-blur-xl z-[100]'
                        : 'bg-[#013A33]/60'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center h-12">
          <ul className="flex items-center gap-1 md:gap-8 whitespace-nowrap">
            {deptLinks.map((link) => (
              <li key={link.label} className="relative group py-3">
                <Link 
                  href={link.href}
                  className={`text-[12px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${
                    pathname === link.href ? 'text-[#00FFCC]' : 'text-white/70 hover:text-[#00FFCC]'
                  }`}
                >
                  {link.label}
                  {link.children && <ChevronDown size={10} className="group-hover:rotate-180 transition-transform" />}
                </Link>

                {link.children && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <div className="bg-[#002A28]/98 backdrop-blur-2xl border border-white/10 rounded-xl p-2 shadow-2xl">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-[12px] font-medium text-gray-300 hover:text-[#00FFCC] hover:bg-white/5 rounded-lg transition-all"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}