'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface GalleryImage {
  url: string;
  alt?: string;
}

export function GalleryCarousel({ images }: { images: GalleryImage[] }) {
  const [activeIdx, setActiveIdx] = useState(Math.floor(images.length / 2));
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemWidth, setItemWidth] = useState(320);
  const GAP = 24; // Matches gap-6 (6 * 4px)

  // Responsive item width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 400) {
        setItemWidth(window.innerWidth - 60);
      } else {
        setItemWidth(320);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate the shift needed to center the active item
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const centerPoint = containerWidth / 2;
      const itemCenterPoint = (activeIdx * (itemWidth + GAP)) + (itemWidth / 2);
      setOffset(centerPoint - itemCenterPoint);
    }
  }, [activeIdx, itemWidth]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500px] md:h-[700px] overflow-hidden flex items-center bg-transparent cursor-grab active:cursor-grabbing"
    >
      <div
        className="flex gap-6 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform"
        style={{
          transform: `translate3d(${offset}px, 0, 0)`,
          paddingLeft: '0px'
        }}
      >
        {images.map((img, i) => {
          const isCenter = i === activeIdx;
          const distance = Math.abs(i - activeIdx);

          return (
            <div
              key={i}
              onClick={() => setActiveIdx(i)}
              style={{ width: `${itemWidth}px` }}
              className={`relative shrink-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] will-change-transform
                h-[350px] md:h-[400px]
                ${isCenter ? 'z-30 scale-105 md:scale-110 opacity-100' : 'z-10 opacity-40'}
                ${distance === 1 ? 'scale-90 opacity-60' : ''}
                ${distance >= 2 ? 'scale-75 opacity-20 blur-[2px]' : ''}
              `}
            >
              <div className={`relative w-full h-full rounded-[2.5rem] overflow-hidden border-2 transition-all duration-700
                ${isCenter
                  ? 'border-[#00FFCC] shadow-[0_0_50px_rgba(0,255,204,0.4)]'
                  : 'border-white/10'}`}>
                <Image
                  src={img.url}
                  alt={img.alt || 'Gallery image'}
                  fill
                  className="object-cover pointer-events-none"
                  unoptimized
                  priority={isCenter}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Overlays (Optional: Gradient fade on edges) */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#013A33] to-transparent z-40 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#013A33] to-transparent z-40 pointer-events-none" />
    </div>
  );
}