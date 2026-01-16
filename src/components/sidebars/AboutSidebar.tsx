// components/AboutSidebar.tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SidebarLink {
  label: string;
  href: string;
  active?: boolean;
}

interface AboutSidebarProps {
  links: SidebarLink[];
  title?: string;
}

export function AboutSidebar({ links, title = "Quick Links" }: AboutSidebarProps) {
  return (
    <aside className="w-full lg:w-[35%] order-1 lg:order-2">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm sticky top-32 overflow-hidden">
        <h2 className="text-2xl font-bold text-white mb-6 py-3 border-b-2 border-[#00FFCC] text-center bg-[#013a33]">
          {title}
        </h2>
        
        <nav className="flex flex-col gap-2 px-6 pb-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
                link.active
                  ? 'bg-[#013a33] text-white shadow-md'
                  : 'hover:bg-[#0b6d6267] text-gray-700 border border-transparent hover:border-gray-200'
              }`}
            >
              <span className="font-medium">{link.label}</span>
              <ChevronRight
                size={18}
                className={`transition-transform duration-200 group-hover:translate-x-1 ${
                  link.active ? 'text-[#00FFCC]' : 'text-gray-400'
                }`}
              />
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}