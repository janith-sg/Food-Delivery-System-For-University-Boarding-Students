import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingSupportChat from '../components/FloatingSupportChat';
import riceAndCurry1 from '../assets/riceandcurry1.png';
import lunchbox from '../assets/lunchbox.png';

const HERO_IMG = riceAndCurry1;
const MENU_IMG = lunchbox;

const HOME_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    title: 'Fresh Meals Daily',
    subtitle: 'Hot breakfast, lunch, and dinner ready for campus',
  },
  {
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1600&q=80',
    title: 'Healthy Choices',
    subtitle: 'Balanced food options for every student',
  },
  {
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1600&q=80',
    title: 'Quick Snacks and Drinks',
    subtitle: 'Order fast and enjoy between lectures',
  },
];

const LIMITED_OFFERS = [
  {
    id: 'offer-1',
    icon: '💰',
    title: 'Student Budget Meals',
    subtitle: 'Save More on Your Daily Meals',
    description: 'Get up to 40% OFF on budget-friendly meals. Perfect for university students.',
    buttonLabel: 'Shop now →',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'offer-2',
    icon: '⚡',
    title: 'Flash Food Deals',
    subtitle: 'Hurry Up! Limited Offers',
    description: "Get exclusive discounts for a short time. Don't miss out!",
    buttonLabel: 'Shop now →',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'offer-3',
    icon: '🍱',
    title: 'Combo Meal Offers',
    subtitle: 'More Food, Less Price',
    description: 'Get Rice + Drink + Snack combo deals. Save more with combos.',
    buttonLabel: 'Shop now →',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
  },
];

const HOME_FEATURE_CARDS = [
  {
    title: 'Everyday Fresh & Clean',
    description: 'Premium quality ingredients',
    emoji: '🥗',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
  },
  {
    title: 'Healthy Breakfast',
    description: 'Start your day right',
    emoji: '🍳',
    gradient: 'from-sky-500 via-blue-500 to-indigo-600',
  },
  {
    title: 'Affordable Meals',
    description: 'Student budget friendly',
    emoji: '💰',
    gradient: 'from-lime-500 via-emerald-500 to-green-600',
  },
];

function LeafIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
    </svg>
  );
}

export default function HomePage() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % HOME_SLIDES.length);
    }, 3500);

    return () => window.clearInterval(timerId);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-emerald-200/60 selection:text-emerald-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/75 backdrop-blur-xl shadow-sm shadow-zinc-900/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-600 ring-1 ring-emerald-600/15 transition group-hover:bg-emerald-600/15">
              <LeafIcon className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-emerald-700 sm:text-2xl">UNI EATS</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium text-zinc-600 md:flex">
            <a
              href="#home"
              className="rounded-full px-3 py-2 no-underline transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              Home
            </a>
            <Link
              to="/menu"
              className="rounded-full px-3 py-2 no-underline transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              Food Menu
            </Link>
            <a
              href="#menu"
              className="rounded-full px-3 py-2 no-underline transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              Our Menu
            </a>
            <a
              href="#cart"
              className="rounded-full px-3 py-2 no-underline transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              Cart
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/register"
              className="text-sm font-semibold text-zinc-700 no-underline transition hover:text-zinc-900"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 sm:px-5"
            >
              Order Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden pb-20 pt-10 md:pb-28 md:pt-14">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/80 via-white to-zinc-50" />
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 left-1/3 h-48 w-48 rounded-full bg-teal-200/20 blur-3xl" />
        <div className="pointer-events-none absolute left-6 top-24 text-emerald-600/10 md:left-16">
          <LeafIcon className="h-28 w-28 md:h-36 md:w-36" />
        </div>
        <div className="pointer-events-none absolute right-8 top-36 rotate-12 text-emerald-600/10">
          <LeafIcon className="h-20 w-20" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="order-2 lg:order-1">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              Campus dining
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-emerald-800 sm:text-5xl lg:text-[3.15rem]">
              Fresh &amp; healthy meals for campus life
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-zinc-600 sm:text-lg">
              Discover organic ingredients, wholesome bowls, and balanced nutrition delivered to your boarding. Pure
              taste, zero compromise — every single day.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
              >
                Explore menu
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                Browse food menu
              </Link>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-emerald-400/20 via-transparent to-amber-300/20 blur-xl" />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl shadow-zinc-900/10 ring-1 ring-zinc-900/5">
                <img src={HERO_IMG} alt="Healthy food bowl" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating search bar */}
        <div className="relative z-10 mx-auto -mb-6 max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-xl shadow-zinc-900/10 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
            <div className="flex items-center gap-3 sm:border-r sm:border-zinc-100 sm:pr-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Location</p>
                <p className="text-sm font-semibold text-emerald-800">Campus — Block A</p>
              </div>
            </div>
            <div className="hidden h-10 w-px bg-zinc-200 sm:block" />
            <div className="flex flex-1 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <select
                className="w-full cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-2.5 text-sm font-medium text-emerald-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                defaultValue="today"
              >
                <option value="today">Today · Lunch window</option>
                <option value="tomorrow">Tomorrow · Dinner</option>
                <option value="week">This week</option>
              </select>
            </div>
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Carousel */}
      <section className="mx-auto mt-4 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Campus highlights</h2>
            <p className="mt-1 text-sm text-zinc-500">Rotating picks from today&apos;s kitchen</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-900 shadow-2xl shadow-zinc-900/20 ring-1 ring-zinc-900/5">
          <div className="relative h-64 w-full sm:h-80 lg:h-[22rem]">
            {HOME_SLIDES.map((slide, idx) => (
              <div
                key={slide.title}
                className={`absolute inset-0 transition-opacity duration-700 ${idx === activeSlideIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/45 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                  <h3 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">{slide.title}</h3>
                  <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">{slide.subtitle}</p>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setActiveSlideIndex((prev) => (prev - 1 + HOME_SLIDES.length) % HOME_SLIDES.length)}
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setActiveSlideIndex((prev) => (prev + 1) % HOME_SLIDES.length)}
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
              aria-label="Next slide"
            >
              →
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {HOME_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === activeSlideIndex ? 'w-8 bg-white' : 'w-2 bg-white/45'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Limited offers */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Limited-time offers</h2>
          <p className="mt-2 text-zinc-500">Grab these deals before they&apos;re gone.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {LIMITED_OFFERS.map((offer) => (
            <article
              key={offer.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-900/5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-900/10"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/10 to-transparent" />
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    Limited time
                  </span>
                </div>
                <div className="absolute right-3 top-3 text-2xl drop-shadow">{offer.icon}</div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-zinc-900">{offer.title}</h3>
                <p className="mt-1 text-sm font-medium text-emerald-700">{offer.subtitle}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600">{offer.description}</p>
                <Link
                  to="/menu"
                  className="mt-5 block w-full rounded-full bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white no-underline shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  {offer.buttonLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Feature gradient cards */}
      <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {HOME_FEATURE_CARDS.map((card) => (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-7 text-white shadow-xl shadow-zinc-900/15 ring-1 ring-white/10`}
            >
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="mb-4 text-4xl drop-shadow-sm">{card.emoji}</div>
                <h3 className="text-xl font-bold tracking-tight">{card.title}</h3>
                <p className="mt-2 text-sm text-white/90">{card.description}</p>
                <Link to="/menu" className="mt-5 inline-block text-sm font-semibold text-white no-underline hover:underline">
                  Shop now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="menu" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-emerald-800 md:text-4xl">Pure &amp; healthy</h2>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
            Wholesome ingredients, mindful recipes, and a commitment to your wellbeing.
          </p>
        </div>
        <div className="mt-14 grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-emerald-800">Crafted for students who care</h3>
            <p className="mt-4 leading-relaxed text-zinc-600">
              We partner with local farms and use seasonal produce to build meals that fuel your studies. No artificial
              additives — just honest flavor in every bite, from breakfast bowls to late-night snacks.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-block rounded-full bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              Learn more
            </Link>
          </div>
          <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-100 shadow-xl shadow-zinc-900/10 ring-1 ring-zinc-900/5">
            <img
              src={MENU_IMG}
              alt="Our menu — lunch box meal"
              className="h-full w-full scale-[1.08] object-cover object-[42%_40%]"
            />
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="border-y border-zinc-200/80 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Daily menu',
                text: 'Rotating specials every day — salads, warm bowls, and comfort food made fresh.',
                icon: (
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
              },
              {
                title: 'Organic picks',
                text: 'Vegetables and grains sourced with care — traceable, sustainable, and delicious.',
                icon: (
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
              },
              {
                title: 'Fast delivery',
                text: 'Order from your phone and get meals delivered to your hall in minutes.',
                icon: (
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
            ].map((card) => (
              <div
                key={card.title}
                className="flex flex-col rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-8 shadow-sm transition hover:border-emerald-200/80 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-zinc-200/80">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold tracking-tight text-emerald-800">{card.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-600">{card.text}</p>
                <button
                  type="button"
                  className="mt-6 flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-medium text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50/50"
                >
                  <span>Choose option</span>
                  <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="team" className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-zinc-900 py-20 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Join thousands of happy eaters</h2>
          <p className="mt-4 text-emerald-100/90">
            Start ordering today and taste the difference of meals made with intention.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-emerald-200/90">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white">4.9</span>
              <span className="text-sm">★ rating</span>
            </div>
            <div className="hidden h-8 w-px bg-white/20 sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white">12k+</span>
              <span className="text-sm">orders</span>
            </div>
          </div>
          <Link
            to="/login"
            className="mt-10 inline-block rounded-full bg-white px-10 py-4 text-sm font-semibold text-emerald-900 shadow-lg shadow-zinc-900/30 transition hover:bg-emerald-50"
          >
            Get started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="cart" className="bg-zinc-950 text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <LeafIcon className="h-5 w-5" />
                </div>
                <span className="text-lg font-semibold text-white">UNI EATS</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed">
                Fresh, balanced meals for university boarding — simple ordering, honest ingredients, care in every box.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Company</h4>
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Resources</h4>
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Policies</h4>
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
            © {new Date().getFullYear()} UNI EATS. All rights reserved.
          </div>
        </div>
      </footer>

      <FloatingSupportChat />
    </div>
  );
}
