import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingSupportChat from '../components/FloatingSupportChat';
import riceAndCurry1 from '../assets/riceandcurry1.png';
import lunchbox from '../assets/lunchbox.png';

const HERO_IMG = riceAndCurry1;
const MENU_IMG = lunchbox;
const HERO_TITLE = 'Fresh & Healthy Meals for Campus Life';

const HOME_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    title: 'Fresh Meals Daily',
    subtitle: 'Hot breakfast, lunch, and dinner ready for campus.',
  },
  {
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1600&q=80',
    title: 'Healthy Choices',
    subtitle: 'Balanced food options designed for every student routine.',
  },
  {
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=80',
    title: 'Quick Snacks and Drinks',
    subtitle: 'Order fast and enjoy fresh bites between lectures.',
  },
];

const LIMITED_OFFERS = [
  {
    id: 'offer-1',
    badge: 'Save 40%',
    title: 'Student Budget Meals',
    subtitle: 'Save more on your daily meals',
    description: 'Get up to 40% off on budget-friendly meals that fit packed student schedules.',
    buttonLabel: 'Shop now ->',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    glow: 'from-lime-300/80 via-emerald-400/45 to-transparent',
  },
  {
    id: 'offer-2',
    badge: 'Fast Deal',
    title: 'Flash Food Deals',
    subtitle: 'Hurry up for limited offers',
    description: "Get exclusive discounts for a short time and catch today's best-value dishes.",
    buttonLabel: 'Shop now ->',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
    glow: 'from-teal-300/75 via-emerald-400/45 to-transparent',
  },
  {
    id: 'offer-3',
    badge: 'Combo',
    title: 'Combo Meal Offers',
    subtitle: 'More food, less price',
    description: 'Pick rice, drinks, and snacks together for easy meal bundles that save more.',
    buttonLabel: 'Shop now ->',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    glow: 'from-emerald-300/80 via-teal-400/45 to-transparent',
  },
];

const HOME_FEATURE_CARDS = [
  {
    title: 'Everyday Fresh',
    description: 'Premium ingredients handled with care each day.',
    number: '01',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    title: 'Healthy Breakfast',
    description: 'Bright, balanced meals to start lectures strong.',
    number: '02',
    gradient: 'from-lime-400 via-emerald-500 to-teal-500',
  },
  {
    title: 'Affordable Meals',
    description: 'Student-friendly pricing without sacrificing quality.',
    number: '03',
    gradient: 'from-teal-500 via-emerald-500 to-lime-500',
  },
];

const PILLAR_CARDS = [
  {
    title: 'Daily menu',
    text: 'Rotating specials every day with salads, warm bowls, and comfort food made fresh.',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    title: 'Organic picks',
    text: 'Vegetables and grains sourced with care to keep meals traceable, sustainable, and delicious.',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21c4.418 0 8-3.582 8-8 0-3.866-2.743-7.09-6.391-7.835A5.002 5.002 0 003 9.999C3 15.522 7.477 21 12 21z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c0-7.18 2.55-11.18 7.65-15" />
      </svg>
    ),
  },
  {
    title: 'Fast delivery',
    text: 'Order from your phone and get meals delivered quickly to your hall or pickup point.',
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

function LeafIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function ChevronLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function HomePage() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [typedHeading, setTypedHeading] = useState('');

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % HOME_SLIDES.length);
    }, 3500);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    let currentIndex = 0;
    const timerId = window.setInterval(() => {
      currentIndex += 1;
      setTypedHeading(HERO_TITLE.slice(0, currentIndex));

      if (currentIndex >= HERO_TITLE.length) {
        window.clearInterval(timerId);
      }
    }, 55);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const revealElements = document.querySelectorAll('[data-reveal]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4fff8] text-zinc-900 antialiased selection:bg-emerald-200/70 selection:text-emerald-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[45rem] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.26),transparent_34%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.20),transparent_28%),linear-gradient(180deg,_rgba(236,253,245,0.96),rgba(240,253,250,0.68)_42%,rgba(244,255,248,1)_100%)]" />
      <div className="pointer-events-none absolute -left-24 top-20 -z-10 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-36 -z-10 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[28rem] left-1/3 -z-10 h-60 w-60 rounded-full bg-lime-200/30 blur-3xl" />

      <header
        className={`sticky top-0 z-50 border-b transition-all duration-500 ${
          isScrolled
            ? 'border-emerald-100/80 bg-white/78 shadow-lg shadow-emerald-950/8 backdrop-blur-2xl'
            : 'border-white/20 bg-white/10 backdrop-blur-xl'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/55 text-emerald-600 shadow-lg shadow-emerald-900/5 backdrop-blur-md transition duration-300 group-hover:scale-105 group-hover:shadow-emerald-500/10">
              <LeafIcon className="h-6 w-6" />
            </div>
            <span className="display-font text-xl font-bold tracking-tight text-emerald-900 sm:text-2xl">UNI EATS</span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium text-zinc-700 md:flex">
            <a href="#home" className="rounded-full px-4 py-2.5 transition hover:bg-white/60 hover:text-emerald-900">
              Home
            </a>
            <Link to="/menu" className="rounded-full px-4 py-2.5 transition hover:bg-white/60 hover:text-emerald-900">
              Food Menu
            </Link>
            <a href="#menu" className="rounded-full px-4 py-2.5 transition hover:bg-white/60 hover:text-emerald-900">
              Our Menu
            </a>
            <a href="#cart" className="rounded-full px-4 py-2.5 transition hover:bg-white/60 hover:text-emerald-900">
              Cart
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/register" className="text-sm font-semibold text-zinc-700 transition hover:text-emerald-900">
              Register
            </Link>
            <Link to="/login" className="glow-button inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white sm:px-5">
              Order Now
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden pb-24 pt-10 md:pb-32 md:pt-16">
        <div className="pointer-events-none absolute left-8 top-24 text-emerald-600/10 md:left-16">
          <LeafIcon className="h-28 w-28 md:h-40 md:w-40" />
        </div>
        <div className="pointer-events-none absolute right-10 top-32 rotate-12 text-teal-600/10">
          <LeafIcon className="h-20 w-20 md:h-28 md:w-28" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
          <div className="order-2 lg:order-1">
            <div className="fade-up-enter inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-800 shadow-lg shadow-emerald-950/5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-lime-400 to-emerald-500" aria-hidden />
              Campus dining
            </div>

            <div className="mt-6 max-w-2xl">
              <h1
                aria-label={HERO_TITLE}
                className="display-font min-h-[8.5rem] text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-zinc-950 sm:min-h-[10rem] sm:text-5xl lg:min-h-[11.5rem] lg:text-[4.35rem]"
              >
                <span className="bg-gradient-to-r from-emerald-950 via-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  {typedHeading}
                </span>
                <span className="typewriter-cursor ml-1 inline-block text-emerald-500">|</span>
              </h1>
            </div>

            <p className="fade-up-enter delay-1 mt-5 max-w-xl text-base leading-8 text-zinc-600 sm:text-lg">
              Discover organic ingredients, wholesome bowls, and balanced nutrition delivered to your boarding.
              Fresh taste, clean energy, and zero compromise every single day.
            </p>

            <div className="fade-up-enter delay-2 mt-9 flex flex-wrap items-center gap-4">
              <Link to="/login" className="glow-button inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white">
                Explore menu
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-6 py-3.5 text-sm font-semibold text-zinc-800 shadow-lg shadow-emerald-950/5 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-900 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                Browse food menu
              </Link>
            </div>

            <div className="fade-up-enter delay-3 mt-10 flex flex-wrap gap-4 text-sm text-zinc-600">
              <div className="glass-panel rounded-2xl px-4 py-3">
                <span className="display-font text-lg font-bold text-emerald-900">12k+</span>
                <p className="mt-1">Meals served across campus</p>
              </div>
              <div className="glass-panel rounded-2xl px-4 py-3">
                <span className="display-font text-lg font-bold text-emerald-900">4.9/5</span>
                <p className="mt-1">Loved for quality and speed</p>
              </div>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-end" data-reveal="right">
            <div className="relative w-full max-w-xl">
              <div className="pointer-events-none absolute -left-10 top-10 h-32 w-32 rounded-full bg-lime-300/35 blur-3xl" />
              <div className="pointer-events-none absolute -right-6 bottom-16 h-40 w-40 rounded-full bg-teal-300/30 blur-3xl" />

              <div className="float-hero relative mx-auto max-w-lg">
                <div className="absolute inset-0 translate-x-4 translate-y-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-400/15 via-teal-400/15 to-lime-300/20 blur-2xl" />
                <div className="glass-panel relative overflow-hidden rounded-[2.5rem] border border-white/70 p-4 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.45)]">
                  <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-white/30 blur-3xl" />
                  <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/40">
                    <img src={HERO_IMG} alt="Healthy food bowl" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="glass-panel float-slow absolute -left-4 top-12 hidden rounded-2xl px-4 py-3 text-sm text-zinc-700 shadow-xl shadow-emerald-950/10 sm:block">
                <p className="display-font text-base font-bold text-emerald-900">Organic picks</p>
                <p className="mt-1 text-zinc-600">Fresh greens every day</p>
              </div>
              <div className="glass-panel float-delayed absolute -right-2 bottom-16 hidden rounded-2xl px-4 py-3 text-sm text-zinc-700 shadow-xl shadow-emerald-950/10 sm:block">
                <p className="display-font text-base font-bold text-emerald-900">Fast pickup</p>
                <p className="mt-1 text-zinc-600">Ready between classes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto -mb-6 mt-12 max-w-5xl px-4 sm:px-6" data-reveal="up">
          <div className="glass-panel grid gap-4 rounded-[2rem] border border-white/65 p-4 shadow-[0_30px_70px_-35px_rgba(16,24,40,0.35)] sm:grid-cols-[1.1fr_1.1fr_auto] sm:items-center sm:p-5">
            <div className="flex items-center gap-3 rounded-2xl bg-white/55 px-4 py-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Location</p>
                <p className="display-font mt-1 text-base font-bold text-emerald-900">Campus - Block A</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/55 px-4 py-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <select
                className="w-full cursor-pointer rounded-2xl border border-emerald-100 bg-white/75 px-4 py-3 text-sm font-semibold text-emerald-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-300/25"
                defaultValue="today"
              >
                <option value="today">Today - Lunch window</option>
                <option value="tomorrow">Tomorrow - Dinner</option>
                <option value="week">This week</option>
              </select>
            </div>

            <button
              type="button"
              className="glow-button flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-reveal="up">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Today&apos;s spotlight</p>
            <h2 className="display-font mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-[2.2rem]">
              Campus highlights
            </h2>
            <p className="mt-2 text-sm text-zinc-500">Rotating picks from today&apos;s kitchen.</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/65 bg-zinc-950 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] ring-1 ring-emerald-950/10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
          <div className="relative h-72 w-full sm:h-96 lg:h-[28rem]">
            {HOME_SLIDES.map((slide, idx) => (
              <div
                key={slide.title}
                className={`absolute inset-0 transition-opacity duration-700 ${idx === activeSlideIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                  <div className="max-w-2xl rounded-[1.75rem] border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Now serving</p>
                    <h3 className="display-font mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      {slide.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-white/85 sm:text-base">{slide.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setActiveSlideIndex((prev) => (prev - 1 + HOME_SLIDES.length) % HOME_SLIDES.length)}
              className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlideIndex((prev) => (prev + 1) % HOME_SLIDES.length)}
              className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>

            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-md">
              {HOME_SLIDES.map((slide, idx) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeSlideIndex ? 'w-8 bg-white' : 'w-2 bg-white/45'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8" data-reveal="up">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Limited offers</p>
          <h2 className="display-font mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-[2.2rem]">
            Limited-time offers
          </h2>
          <p className="mt-2 text-zinc-500">Grab these deals before they&apos;re gone.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {LIMITED_OFFERS.map((offer) => (
            <article
              key={offer.id}
              data-reveal="up"
              className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_22px_60px_-30px_rgba(15,23,42,0.22)] backdrop-blur-md transition duration-500 hover:-translate-y-2 hover:shadow-[0_35px_80px_-35px_rgba(16,185,129,0.35)]"
            >
              <div className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-r ${offer.glow} opacity-80`} />
              <div className="relative h-56 overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-zinc-950/15 to-transparent" />
                <div className="absolute left-4 top-4">
                  <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                    {offer.badge}
                  </span>
                </div>
              </div>

              <div className="relative flex flex-1 flex-col px-6 pb-6 pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">{offer.subtitle}</p>
                <h3 className="display-font mt-3 text-2xl font-bold tracking-tight text-zinc-950">{offer.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-zinc-600">{offer.description}</p>
                <Link
                  to="/menu"
                  className="glow-button mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
                >
                  {offer.buttonLabel}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-reveal="up">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {HOME_FEATURE_CARDS.map((card) => (
            <div
              key={card.title}
              className={`group relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${card.gradient} p-7 text-white shadow-[0_25px_60px_-30px_rgba(15,23,42,0.45)] transition duration-500 hover:-translate-y-1.5`}
            >
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15 blur-3xl transition duration-500 group-hover:scale-125" />
              <div className="relative">
                <span className="display-font text-sm font-bold uppercase tracking-[0.3em] text-white/70">{card.number}</span>
                <h3 className="display-font mt-5 text-2xl font-bold tracking-tight">{card.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-7 text-white/88">{card.description}</p>
                <Link to="/menu" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/95 transition hover:text-white">
                  Shop now
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[0.95fr_1.05fr] md:items-center md:gap-16">
          <div data-reveal="left">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Pure and healthy</p>
            <h2 className="display-font mt-4 text-4xl font-bold tracking-tight text-zinc-950 md:text-[3rem]">
              Crafted for students who care about how they eat
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-zinc-600">
              We partner with local farms and use seasonal produce to build meals that fuel your studies. No artificial
              additives, just honest flavor in every bite from breakfast bowls to late-night snacks.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-2xl px-4 py-4">
                <p className="display-font text-lg font-bold text-emerald-900">Seasonal produce</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">Menus evolve around fresh ingredients and local availability.</p>
              </div>
              <div className="glass-panel rounded-2xl px-4 py-4">
                <p className="display-font text-lg font-bold text-emerald-900">Balanced portions</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">Meals are designed to feel nourishing without feeling heavy.</p>
              </div>
            </div>

            <Link to="/login" className="glow-button mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white">
              Learn more
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative" data-reveal="right">
            <div className="pointer-events-none absolute -left-6 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-lime-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 top-8 h-44 w-44 rounded-full bg-teal-300/25 blur-3xl" />
            <div className="glass-panel overflow-hidden rounded-[2.5rem] border border-white/70 p-4 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
              <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-zinc-100">
                <img
                  src={MENU_IMG}
                  alt="Our menu lunch box meal"
                  className="h-full w-full scale-[1.08] object-cover object-[42%_40%] transition duration-700 hover:scale-[1.12]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-emerald-100/70 bg-white/55 py-20 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8" data-reveal="up">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">How it feels</p>
            <h2 className="display-font mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-[2.2rem]">
              Better meals, smoother campus routines
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PILLAR_CARDS.map((card, index) => (
              <div
                key={card.title}
                data-reveal={index === 0 ? 'left' : index === 1 ? 'up' : 'right'}
                className="group flex flex-col rounded-[2rem] border border-white/75 bg-white/80 p-8 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.22)] backdrop-blur-md transition duration-500 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_30px_70px_-35px_rgba(16,185,129,0.25)]"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
                  {card.icon}
                </div>
                <h3 className="display-font text-2xl font-bold tracking-tight text-zinc-950">{card.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-zinc-600">{card.text}</p>
                <button
                  type="button"
                  className="mt-6 flex w-full items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-left text-sm font-semibold text-emerald-900 transition duration-300 hover:border-emerald-300 hover:bg-emerald-100/70"
                >
                  <span>Choose option</span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-emerald-700 transition group-hover:translate-x-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="team"
        className="relative overflow-hidden bg-[linear-gradient(135deg,_rgba(2,44,34,1)_0%,_rgba(6,78,59,1)_42%,_rgba(15,118,110,1)_100%)] py-20 text-white"
      >
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute right-0 top-12 h-64 w-64 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-lime-300/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6" data-reveal="up">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">Join the movement</p>
          <h2 className="display-font mt-4 text-4xl font-bold tracking-tight md:text-[3.25rem]">
            Join thousands of happy eaters
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-emerald-50/88">
            Start ordering today and feel the difference of meals made with intention, freshness, and student life in
            mind.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-left">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-md">
              <p className="display-font text-3xl font-bold text-white">4.9</p>
              <p className="mt-1 text-sm text-emerald-100/80">Average rating</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-md">
              <p className="display-font text-3xl font-bold text-white">12k+</p>
              <p className="mt-1 text-sm text-emerald-100/80">Orders delivered</p>
            </div>
          </div>

          <Link
            to="/login"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-sm font-semibold text-emerald-900 shadow-[0_20px_45px_-20px_rgba(255,255,255,0.5)] transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-50"
          >
            Get started
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer id="cart" className="bg-zinc-950 text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <LeafIcon className="h-5 w-5" />
                </div>
                <span className="display-font text-lg font-bold text-white">UNI EATS</span>
              </div>
              <p className="mt-4 text-sm leading-7">
                Fresh, balanced meals for university boarding with simple ordering, honest ingredients, and care in every
                box.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Company</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="#menu" className="text-zinc-300 transition hover:text-white">
                    About us
                  </a>
                </li>
                <li>
                  <a href="#team" className="text-zinc-300 transition hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-zinc-300 transition hover:text-white">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Resources</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="#menu" className="text-zinc-300 transition hover:text-white">
                    Menu
                  </a>
                </li>
                <li>
                  <a href="#cart" className="text-zinc-300 transition hover:text-white">
                    Nutrition info
                  </a>
                </li>
                <li>
                  <Link to="/admin/dashboard" className="text-zinc-300 transition hover:text-white">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Policies</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="#" className="text-zinc-300 transition hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-zinc-300 transition hover:text-white">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-zinc-300 transition hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-zinc-800 pt-8 text-center text-xs text-zinc-500">
            Copyright {new Date().getFullYear()} UNI EATS. All rights reserved.
          </div>
        </div>
      </footer>

      <FloatingSupportChat />
    </div>
  );
}
