'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { getDrupalDomain } from '@/lib/drupal/customFetch';
import { CalendarEvent } from '@/types/drupal';
import Image from 'next/image';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

interface ContinuousCalendarProps {
    onClick?: (_day: number, _month: number, _year: number) => void;
}

export const Calendar: React.FC<ContinuousCalendarProps> = ({ onClick }) => {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === 'administrator';
    const DRUPAL_DOMAIN = getDrupalDomain();

    const today = new Date();
    const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(0);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const monthOptions = monthNames.map((month, index) => ({ name: month, value: `${index}` }));

    // Fetch events when year changes
    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/calendar-events?year=${year}`);
                if (response.ok) {
                    const data = await response.json();
                    setEvents(data);
                } else {
                    console.error('Failed to fetch calendar events:', response.statusText);
                }
            } catch (error) {
                console.error('Failed to fetch calendar events:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [year]);

    // Create a Map for quick event lookup by date
    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        for (const event of events) {
            const existing = map.get(event.date) || [];
            existing.push(event);
            map.set(event.date, existing);
        }
        return map;
    }, [events]);

    const handleCreateEvent = () => {
        window.open(`${DRUPAL_DOMAIN}/node/add/calendar_event`, '_blank');
    };

    const scrollToDay = (monthIndex: number, dayIndex: number) => {
        const targetDayIndex = dayRefs.current.findIndex(
            (ref) => ref && ref.getAttribute('data-month') === `${monthIndex}` && ref.getAttribute('data-day') === `${dayIndex}`,
        );

        const targetElement = dayRefs.current[targetDayIndex];

        if (targetDayIndex !== -1 && targetElement) {
            const container = document.querySelector('.calendar-container');
            const elementRect = targetElement.getBoundingClientRect();
            const is2xl = window.matchMedia('(min-width: 1536px)').matches;
            const offsetFactor = is2xl ? 3 : 2.5;

            if (container) {
                const containerRect = container.getBoundingClientRect();
                const offset = elementRect.top - containerRect.top - (containerRect.height / offsetFactor) + (elementRect.height / 2);

                container.scrollTo({
                    top: container.scrollTop + offset,
                    behavior: 'smooth',
                });
            } else {
                const offset = window.scrollY + elementRect.top - (window.innerHeight / offsetFactor) + (elementRect.height / 2);

                window.scrollTo({
                    top: offset,
                    behavior: 'smooth',
                });
            }
        }
    };

    const handlePrevYear = () => setYear((prevYear) => prevYear - 1);
    const handleNextYear = () => setYear((prevYear) => prevYear + 1);

    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const monthIndex = parseInt(event.target.value, 10);
        setSelectedMonth(monthIndex);
        scrollToDay(monthIndex, 1);
    };

    const handleTodayClick = () => {
        setYear(today.getFullYear());
        setTimeout(() => scrollToDay(today.getMonth(), today.getDate()), 100);
    };

    const handleDayClick = (day: number, month: number, year: number) => {
        if (!onClick) return;
        onClick(day, month < 0 ? 11 : month, month < 0 ? year - 1 : year);
    };

    const formatDateKey = (year: number, month: number, day: number): string => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const daysInYear = (): { month: number; day: number }[] => {
        const days = [];
        const startDayOfWeek = new Date(year, 0, 1).getDay();

        if (startDayOfWeek > 0) {
            for (let i = 0; i < startDayOfWeek; i++) {
                days.push({ month: -1, day: 31 - startDayOfWeek + i + 1 });
            }
        }

        for (let month = 0; month < 12; month++) {
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                days.push({ month, day });
            }
        }

        const lastWeekDayCount = days.length % 7;
        if (lastWeekDayCount > 0) {
            const extraDaysNeeded = 7 - lastWeekDayCount;
            for (let day = 1; day <= extraDaysNeeded; day++) {
                days.push({ month: 0, day });
            }
        }
        return days;
    };

    const calendarDays = daysInYear();
    const calendarWeeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        calendarWeeks.push(calendarDays.slice(i, i + 7));
    }

    useEffect(() => {
        const calendarContainer = document.querySelector('.calendar-container');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const month = parseInt(entry.target.getAttribute('data-month')!, 10);
                        if (month >= 0) setSelectedMonth(month);
                    }
                });
            },
            {
                root: calendarContainer,
                rootMargin: '-45% 0px -45% 0px',
                threshold: 0,
            },
        );

        dayRefs.current.forEach((ref) => {
            if (ref && ref.getAttribute('data-day') === '15') {
                observer.observe(ref);
            }
        });

        return () => observer.disconnect();
    }, [year]);

    return (
        <>
            <div className="calendar-container no-scrollbar mx-auto h-[750px] max-w-7xl overflow-y-scroll rounded-[2.5rem] bg-[#013A33] pb-20 text-white shadow-2xl border border-[#006A58]">
                {/* Sticky Header */}
                <div className="sticky top-0 z-50 w-full bg-[#002A28]/95 backdrop-blur-md px-5 py-6 sm:px-8 border-b border-[#006A58]">
                    <div className="flex flex-wrap items-center justify-between w-full gap-4 mb-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Select
                                name="month"
                                value={`${selectedMonth}`}
                                options={monthOptions}
                                onChange={handleMonthChange}
                            />
                            <button
                                onClick={handleTodayClick}
                                type="button"
                                className="rounded-xl border border-[#00FFCC]/30 bg-transparent px-4 py-2 text-sm font-bold text-[#00FFCC] hover:bg-[#00FFCC] hover:text-[#002A28] transition-all"
                            >
                                Today
                            </button>
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={handleCreateEvent}
                                    className="whitespace-nowrap rounded-xl bg-gradient-to-r from-[#00FFCC] to-[#006A58] px-5 py-2 text-center text-sm font-bold text-[#002A28] hover:brightness-110 transition-all shadow-lg shadow-[#00FFCC]/10"
                                >
                                    + Add Event
                                </button>
                            )}
                            {isLoading && (
                                <span className="text-xs text-[#00FFCC]/60 animate-pulse">Loading events...</span>
                            )}
                        </div>

                        <div className="flex items-center gap-4 bg-[#013A33] px-3 py-1 rounded-2xl border border-[#006A58]">
                            <button onClick={handlePrevYear} className="p-1 transition-colors hover:text-[#00FFCC]">
                                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m15 19-7-7 7-7" /></svg>
                            </button>
                            <h1 className="text-xl font-black min-w-[80px] text-center tracking-tighter">{year}</h1>
                            <button onClick={handleNextYear} className="p-1 transition-colors hover:text-[#00FFCC]">
                                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m9 5 7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="grid w-full grid-cols-7 text-[#00FFCC] opacity-80">
                        {daysOfWeek.map((day) => (
                            <div key={day} className="py-4 text-xs font-black tracking-widest text-center uppercase">{day}</div>
                        ))}
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="w-full px-4 pt-6 sm:px-6">

                    <div className="flex flex-col w-full gap-12 px-4 pt-6 sm:px-6">
                        {Array.from({ length: 12 }).map((_, monthIdx) => {
                            const monthDays = calendarDays.filter((d, idx) => {
                                const isActualMonth = d.month === monthIdx;
                                if (monthIdx === 0) return isActualMonth && idx < 40;
                                if (monthIdx === 11) return isActualMonth && idx > 300;
                                return isActualMonth;
                            });

                            if (monthDays.length === 0) return null;

                            return (
                                <div key={`month-section-${year}-${monthIdx}`} className="flex flex-col gap-4">
                                    <h3 className="text-2xl font-black text-[#00FFCC] uppercase tracking-widest pl-2 border-l-4 border-[#00FFCC]">
                                        {monthNames[monthIdx]}
                                    </h3>

                                    <div className="grid grid-cols-7 border-t border-l border-[#006A58]/40 shadow-xl">
                                        {Array.from({ length: new Date(year, monthIdx, 1).getDay() }).map((_, i) => (
                                            <div key={`pad-${year}-${monthIdx}-${i}`} className="aspect-square border-r border-b border-[#006A58]/40 bg-[#002A28]/30" />
                                        ))}

                                        {monthDays.map(({ month, day }) => {
                                            const globalIndex = calendarDays.findIndex((d, idx) => d.month === month && d.day === day &&
                                                (monthIdx === 0 ? idx < 40 : monthIdx === 11 ? idx > 300 : true));
                                            const isToday = today.getMonth() === month && today.getDate() === day && today.getFullYear() === year;
                                            const dateKey = formatDateKey(year, month, day);
                                            const dayEvents = eventsByDate.get(dateKey) || [];
                                            const hasEvents = dayEvents.length > 0;

                                            return (
                                                <div
                                                    key={`day-cell-${year}-${month}-${day}-${globalIndex}`}
                                                    ref={(el) => { if (globalIndex !== -1) dayRefs.current[globalIndex] = el; }}
                                                    data-month={month}
                                                    data-day={day}
                                                    onClick={() => {
                                                        if (hasEvents) {
                                                            setSelectedEvents(dayEvents);
                                                            setCurrentEventIndex(0); // Reset to first event
                                                        } else {
                                                            handleDayClick(day, month, year);
                                                        }
                                                    }}
                                                    className={`
                                                        relative group aspect-square w-full cursor-pointer transition-all duration-200
                                                        bg-[#013A33] border-r border-b border-[#006A58]/40 
                                                        hover:bg-[#00FFCC]/10 group
                                                        ${isToday ? 'bg-[#00FFCC]/20 text-[#00FFCC] ring-2 ring-inset ring-[#00FFCC]/50' : 'text-white'}
                                                        ${hasEvents ? '' : ''}
                                                    `}
                                                >
                                                    <div className={`flex flex-col h-full w-full items-center justify-center p-8 ${isToday ? 'text-[#00FFCC] bg-[#00FFCC]/10' : 'text-white'}`}>
                                                        <span className="text-lg font-black sm:text-xl lg:text-2xl w-12 text-center">{day}</span>
                                                        {hasEvents && (
                                                            <div className="flex flex-col items-center w-full gap-1 mt-1">
                                                                <div className="flex gap-1">
                                                                    {dayEvents.slice(0, 3).map((_, i) => (
                                                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00FFCC]" />
                                                                    ))}
                                                                </div>
                                                                {/* <span className="text-[8px] font-bold text-[#00FFCC] truncate max-w-full px-1 hidden sm:block">
                                                                    {dayEvents[0].title}
                                                                </span> */}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Hover Tooltip */}
                                                    {hasEvents && (
                                                        <div className="absolute z-[60] mb-2 transition-opacity -translate-x-1/2 opacity-0 pointer-events-none left-1/2 bottom-full group-hover:opacity-100 group-hover:z-50">
                                                            <div className="bg-[#002A28] border border-[#00FFCC]/30 rounded-xl p-4 shadow-2xl min-w-[200px] max-w-[260px] overflow-hidden flex flex-col gap-3">
                                                                {dayEvents.map((event, index) => (
                                                                    <React.Fragment key={event.id}>
                                                                        {/* Event Content */}
                                                                        <div className="space-y-2">
                                                                            {event.images && event.images.length > 0 && event.images[0]?.url && (
                                                                                <div className="relative w-full h-24 overflow-hidden rounded-md border border-[#00FFCC]/20">
                                                                                    <Image
                                                                                        src={event.images[0].url}
                                                                                        alt={event.images[0].alt || event.title}
                                                                                        fill
                                                                                        className="object-cover"
                                                                                        unoptimized={process.env.NODE_ENV === 'development'}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            <div className="text-center px-1">
                                                                                <p className="font-bold text-[#00FFCC] text-[11px] leading-tight mb-1">{event.title}</p>
                                                                                {event.location && (
                                                                                    <p className="text-white/40 text-[9px] uppercase tracking-tighter truncate">{event.location}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Divider: Only show between items */}
                                                                        {index < dayEvents.length - 1 && (
                                                                            <div className="relative flex items-center justify-center py-1">
                                                                                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00FFCC]/30 to-transparent" />
                                                                                <div className="absolute w-1 h-1 rounded-full bg-[#00FFCC]/50" />
                                                                            </div>
                                                                        )}
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Event Detail Modal with Slider */}
            {selectedEvents.length > 0 && (() => {
                const currentEvent = selectedEvents[currentEventIndex];
                const totalEvents = selectedEvents.length;

                const handleNext = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setCurrentEventIndex((prev) => (prev + 1) % totalEvents);
                };

                const handlePrev = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setCurrentEventIndex((prev) => (prev - 1 + totalEvents) % totalEvents);
                };

                return (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all"
                        onClick={() => setSelectedEvents([])}
                    >
                        <div
                            className="bg-[#013A33] border border-[#006A58] rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header & Navigation */}
                            <div className="bg-[#002A28] px-8 py-6 border-b border-[#006A58] flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#00FFCC] font-bold mb-1">
                                        {totalEvents > 1 ? `Event ${currentEventIndex + 1} of ${totalEvents}` : 'Event Detail'}
                                    </span>
                                    <h2 className="text-xl font-black text-white leading-tight">{currentEvent.title}</h2>
                                </div>

                                <div className="flex items-center gap-3">
                                    {totalEvents > 1 && (
                                        <div className="flex items-center gap-2 mr-4 bg-[#013A33] p-1 rounded-full border border-[#006A58]">
                                            <button onClick={handlePrev} className="p-2 hover:text-[#00FFCC] transition-colors text-white/50">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <div className="w-[1px] h-4 bg-[#006A58]" />
                                            <button onClick={handleNext} className="p-2 hover:text-[#00FFCC] transition-colors text-white/50">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setSelectedEvents([])}
                                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                                <div className="flex flex-wrap gap-6 text-xs font-bold tracking-wider">
                                    <div className="flex items-center gap-2 text-[#00FFCC]">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="uppercase">{new Date(currentEvent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    {currentEvent.location && (
                                        <div className="flex items-center gap-2 text-white/60">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                            <span className="uppercase">{currentEvent.location}</span>
                                        </div>
                                    )}
                                </div>

                                {currentEvent.images && currentEvent.images.length > 0 && (
                                    <div className="relative w-full h-64 overflow-hidden rounded-[1.5rem] border border-[#006A58]/50 group">
                                        <Image
                                            src={currentEvent.images[0].url}
                                            alt={currentEvent.images[0].alt || currentEvent.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            unoptimized={process.env.NODE_ENV === 'development'}
                                        />
                                    </div>
                                )}

                                {currentEvent.editor && (
                                    <div
                                        className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed font-medium"
                                        dangerouslySetInnerHTML={{ __html: currentEvent.editor }}
                                    />
                                )}

                                {isAdmin && (
                                    <div className="pt-6 border-t border-[#006A58]/30">
                                        <button
                                            onClick={() => window.open(`${DRUPAL_DOMAIN}/node/${currentEvent.nid}/edit`, '_blank')}
                                            className="text-xs font-black uppercase tracking-widest text-[#00FFCC] hover:underline underline-offset-4"
                                        >
                                            Edit Entry →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </>
    );
};

export const Select = ({ name, value, options = [], onChange }: any) => (
    <div className="relative">
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="appearance-none cursor-pointer rounded-xl border border-[#006A58] bg-[#013A33] py-2 pl-4 pr-10 text-sm font-bold text-white hover:border-[#00FFCC] transition-colors focus:outline-none"
        >
            {options.map((option: any) => (
                <option key={option.value} value={option.value} className="bg-[#013A33]">
                    {option.name}
                </option>
            ))}
        </select>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="size-4 text-[#00FFCC]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
        </span>
    </div>
);