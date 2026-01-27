'use client';

import { useEffect, useState, useRef, JSX } from 'react';

// Individual Bubble Counter
const CounterBubble = ({ value, label, className, iconPath }: { value: number, label: string, className: string, iconPath: JSX.Element }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const bubbleRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setHasStarted(true);
    }, { threshold: 0.5 });

    if (bubbleRef.current) observer.observe(bubbleRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);

    const animate = () => {
      start += increment;
      if (start < value) {
        setDisplayValue(Math.floor(start));
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animate();
  }, [hasStarted, value]);

  return (
    <div
      ref={bubbleRef}
      // Adjusted bubble base size for better fit on very small screens
      className={`absolute rounded-full flex flex-col items-center justify-center text-black bg-teal-400/60 backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(45,212,191,0.2)] transition-all duration-500 hover:scale-110 hover:z-50 ${className}`}
    >
      <div className="mb-1">
        <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-9 md:h-9 fill-current opacity-90">
          {iconPath}
        </svg>
      </div>
      <div className="text-sm md:text-3xl font-bold leading-none tracking-tight">{displayValue}+</div>
      <div className="text-[8px] md:text-sm font-bold uppercase tracking-tight mt-0.5 md:mt-1 px-2 md:px-3 text-center leading-tight">
        {label}
      </div>
    </div>
  );
};

export const StatsSection = ({ stats }: { stats: any }) => {
  return (
    <section className="py-20 bg-[#002A28] overflow-hidden">
      <div className="mx-auto text-center max-w-7xl px-4">
        <h2 className="mb-10 md:mb-16 text-3xl md:text-5xl font-bold text-white">Our Numbers</h2>

        {/* Main relative container - height adjusted for tighter cluster */}
        <div className="relative h-[400px] md:h-[600px] w-full max-w-4xl mx-auto">

          {/* Citations - Center Large (z-40 to stay on top) */}
          <CounterBubble
            value={stats.citations}
            label="Citations"
            className="w-32 h-32 md:w-72 md:h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-teal-400/80"
            iconPath={<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />}
          />

          {/* Patents - Top Left */}
          <CounterBubble
            value={stats.patents}
            label="Patents"
            className="w-20 h-20 md:w-44 md:h-44 top-[8%] left-[15%] md:top-[15%] md:left-[22%] z-30"
            iconPath={<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />}
          />

          {/* Staff - Middle Left */}
          <CounterBubble
            value={stats.staff}
            label="Staff"
            className="w-20 h-20 md:w-40 md:h-40 top-[38%] left-[2%] md:left-[12%] z-20"
            iconPath={<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />}
          />

          {/* Ph.D Produced - Bottom Left (Tucked under) */}
          <CounterBubble
            value={stats.phd_produced}
            label="Ph.D Produced"
            className="w-18 h-18 md:w-36 md:h-36 bottom-[12%] left-[12%] md:bottom-[20%] md:left-[25%] z-10"
            iconPath={<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />}
          />

          {/* Students - Bottom Center */}
          <CounterBubble
            value={stats.students}
            label="Students"
            className="w-20 h-20 md:w-40 md:h-40 bottom-[2%] left-[40%] md:bottom-[10%] md:left-[42%] z-30"
            iconPath={<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />}
          />

          {/* Faculties - Top Right */}
          <CounterBubble
            value={stats.faculties}
            label="Faculties"
            className="w-20 h-20 md:w-40 md:h-40 top-[8%] right-[15%] md:top-[12%] md:right-[22%] z-30"
            iconPath={<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2z" />}
          />

          {/* Publications - Middle Right */}
          <CounterBubble
            value={stats.publications}
            label="Publications"
            className="w-24 h-24 md:w-48 md:h-48 top-[33%] right-[2%] md:right-[10%] z-20"
            iconPath={<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />}
          />

          {/* Departments - Bottom Right */}
          <CounterBubble
            value={stats.departments}
            label="Departments"
            className="w-18 h-18 md:w-36 md:h-36 bottom-[12%] right-[12%] md:bottom-[20%] md:right-[25%] z-10"
            iconPath={<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />}
          />

        </div>
      </div>
    </section>
  );
};