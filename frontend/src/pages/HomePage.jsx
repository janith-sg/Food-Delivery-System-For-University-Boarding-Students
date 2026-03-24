import React from 'react';
import { Link } from 'react-router-dom';
import FloatingSupportChat from '../components/FloatingSupportChat';
import riceAndCurry1 from '../assets/riceandcurry1.png';
import lunchbox from '../assets/lunchbox.png';

const HERO_IMG = riceAndCurry1;
const MENU_IMG = lunchbox;

function LeafIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#2B2B2B]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#0B8E3A]/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
          
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B8E3A]/15 text-[#0B8E3A]">
              <LeafIcon className="h-6 w-6" />
            </div>
            <span className="font-sans text-2xl font-semibold tracking-tight text-[#0B8E3A]">UNI EATS</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-black md:flex">
            <a
              href="#home"
              className="text-black no-underline transition hover:text-black/80 visited:text-black"
            >
              Home
            </a>
            <a
              href="#menu"
              className="text-black no-underline transition hover:text-black/80 visited:text-black"
            >
              Our Menu
            </a>
            <a
              href="#team"
              className="text-black no-underline transition hover:text-black/80 visited:text-black"
            >
              Team
            </a>
            <a
              href="#cart"
              className="text-black no-underline transition hover:text-black/80 visited:text-black"
            >
              Cart
            </a>
          </nav>
          <Link
            to="/login"
            className="rounded-full bg-[#0B8E3A] px-5 py-2.5 text-sm font-semibold !text-white visited:!text-white shadow-md transition hover:bg-[#087532] hover:!text-white"
          >
            Order Now
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden pb-24 pt-8 md:pb-32">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(168deg, #E6EDE8 0%, #E6EDE8 42%, #F0EBE3 42%, #ffffff 100%)',
          }}
        />
        <div className="pointer-events-none absolute left-0 top-20 h-32 w-32 text-[#0B8E3A]/10 md:left-10">
          <LeafIcon className="h-full w-full" />
        </div>
        <div className="pointer-events-none absolute right-10 top-40 h-24 w-24 rotate-12 text-[#0B8E3A]/10">
          <LeafIcon className="h-full w-full" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pt-10 md:grid-cols-2 md:gap-16 md:px-8 lg:pt-16">
          <div className="order-2 md:order-1">
            <h1 className="font-sans text-4xl leading-tight text-[#0B8E3A] md:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
              Fresh &amp; Healthy Meals for Campus Life
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#4a4a4a] md:text-lg">
              Discover organic ingredients, Home likely food bowls, and balanced nutrition delivered straight to your
              boarding. Pure taste, zero compromise-every single day.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#0B8E3A] px-8 py-3.5 text-sm font-semibold !text-white visited:!text-white shadow-lg transition hover:bg-[#087532] hover:!text-white"
              >
                Explore Menu
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-[#C5D4C0]/40 blur-2xl" />
              <div className="relative h-72 w-72 overflow-hidden rounded-full border-4 border-white shadow-2xl md:h-96 md:w-96">
                <img src={HERO_IMG} alt="Healthy food bowl" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating search / filter bar */}
        <div className="relative z-10 mx-auto -mb-8 max-w-4xl px-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-xl backdrop-blur md:flex-row md:items-center md:justify-between md:gap-6 md:p-5">
            <div className="flex items-center gap-3 border-[#E6EDE8] md:border-r md:pr-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6EDE8] text-[#0B8E3A]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <div>
                <p className="text-xs font-semibold text-[#0B8E3A]/70">Location</p>
                <p className="text-sm font-medium text-[#0B8E3A]">Campus — Block A</p>
              </div>
            </div>
            <div className="hidden h-10 w-px bg-[#E6EDE8] md:block" />
            <div className="flex flex-1 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6EDE8] text-[#0B8E3A]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <select
                className="w-full cursor-pointer rounded-xl border border-[#E6EDE8] bg-white px-4 py-2.5 text-sm font-medium text-[#0B8E3A] outline-none focus:border-[#0B8E3A]"
                defaultValue="today"
              >
                <option value="today">Today · Lunch window</option>
                <option value="tomorrow">Tomorrow · Dinner</option>
                <option value="week">This week</option>
              </select>
            </div>
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B8E3A] text-white transition hover:bg-[#087532]"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* About / feature */}
      <section id="menu" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <h2 className="text-center font-sans text-3xl font-semibold text-[#0B8E3A] md:text-4xl">Pure &amp; Healthy</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[#5a5a5a]">
          Wholesome ingredients, mindful recipes, and a commitment to your wellbeing.
        </p>
        <div className="mt-14 grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <h3 className="font-sans text-2xl font-semibold text-[#0B8E3A]">Crafted for students who care</h3>
            <p className="mt-4 leading-relaxed text-[#4a4a4a]">
              We partner with local farms and use seasonal produce to build meals that fuel your studies. No
              artificial additives, just honest flavor in every bite, from breakfast bowls to late night snacks.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-block rounded-full bg-[#0B8E3A] px-8 py-3 text-sm font-semibold !text-white visited:!text-white transition hover:bg-[#087532] hover:!text-white"
            >
              Learn more
            </Link>
          </div>
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img
              src={MENU_IMG}
              alt="Our menu — lunch box meal"
              className="h-full w-full scale-[1.1] object-cover object-[42%_40%]"
            />
          </div>
        </div>
      </section>

      {/* Three cards */}
      <section className="bg-[#E6EDE8]/50 py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-8 md:grid-cols-3">
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
                className="flex flex-col rounded-[24px] border border-white/60 bg-[#EEF4EF] p-8 shadow-md transition hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0B8E3A] shadow-sm">
                  {card.icon}
                </div>
                <h3 className="font-sans text-xl font-semibold text-[#0B8E3A]">{card.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#4a4a4a]">{card.text}</p>
                <button
                  type="button"
                  className="mt-6 flex w-full items-center justify-between rounded-2xl border border-[#0B8E3A]/20 bg-white px-4 py-3 text-left text-sm font-medium text-[#0B8E3A] transition hover:border-[#0B8E3A]/40"
                >
                  <span>Choose option</span>
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section id="team" className="bg-[#F0EBE3]/80 py-20">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <h2 className="font-sans text-3xl font-semibold text-[#0B8E3A] md:text-4xl">Join thousands of happy eaters</h2>
          <p className="mt-4 text-[#5a5a5a]">
            Start ordering today and taste the difference of meals made with intention.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-[#0B8E3A]/60">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-sans font-bold text-[#0B8E3A]">4.9</span>
              <span className="text-sm">★ rating</span>
            </div>
            <div className="hidden h-8 w-px bg-[#0B8E3A]/20 sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-sans font-bold text-[#0B8E3A]">12k+</span>
              <span className="text-sm">orders</span>
            </div>
          </div>
          <Link
            to="/login"
            className="mt-10 inline-block rounded-full bg-[#0B8E3A] px-10 py-4 text-sm font-semibold !text-white visited:!text-white shadow-lg transition hover:bg-[#087532] hover:!text-white"
          >
            Get started
          </Link>
        </div>
      </section>

      {/* Footer with wave */}
      <footer id="cart" className="relative bg-[#C5D4C0] pt-20 text-[#087532]">
        <div className="absolute left-0 right-0 top-0 -translate-y-[99%] leading-0 text-[#C5D4C0]">
          <svg className="w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
            <path
              fill="currentColor"
              d="M0,40 C360,100 720,0 1080,40 C1260,60 1380,50 1440,45 L1440,80 L0,80 Z"
            />
          </svg>
        </div>
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-8 md:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div>
              <h3 className="font-sans text-xl font-semibold text-[#087532]">Pure &amp; Healthy</h3>
              <p className="mt-4 text-sm leading-relaxed opacity-90">
                UNI EATS brings fresh, balanced meals to university boarding students — simple ordering, honest
                ingredients, and care in every box.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-[#087532]">Company</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="#menu" className="opacity-90 hover:opacity-100">
                    About us
                  </a>
                </li>
                <li>
                  <a href="#team" className="opacity-90 hover:opacity-100">
                    Careers
                  </a>
                </li>
                <li>
                  <Link to="/login" className="opacity-90 hover:opacity-100">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-[#087532]">Resources</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="#menu" className="opacity-90 hover:opacity-100">
                    Menu
                  </a>
                </li>
                <li>
                  <a href="#cart" className="opacity-90 hover:opacity-100">
                    Nutrition info
                  </a>
                </li>
                <li>
                  <Link to="/admin/dashboard" className="opacity-90 hover:opacity-100">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wide text-[#087532]">Policies</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="#" className="opacity-90 hover:opacity-100">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="opacity-90 hover:opacity-100">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="opacity-90 hover:opacity-100">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-[#087532]/15 pt-8 text-center text-xs opacity-75">
            © {new Date().getFullYear()} UNI EATS. All rights reserved.
          </div>
        </div>
      </footer>

      <FloatingSupportChat />
    </div>
  );
}
