import React from 'react';
import AdminPageShell from '../../components/AdminPageShell';
import { TAB_DESCRIPTIONS } from '../../constants/adminTabs';

const salesHeights = [82, 95, 76, 88, 110, 72, 105, 84, 98, 120, 90, 0];
const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
/** Matches LandingPage primary green */
const salesBarGreen = '#354A3F';

export default function AdminDashboardPage() {
  return (
    <AdminPageShell
      title="Admin Dashboard"
      description={TAB_DESCRIPTIONS.Dashboard}
      stripClassName="mx-auto"
      titleClassName="text-center text-3xl md:text-4xl"
      descriptionClassName="text-center"
    >
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="rounded-xl border border-[#86efac]/70 bg-gradient-to-br from-[#ecfdf5] to-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#4ade80]/35">
              <div className="text-sm font-normal text-black">Registered customers</div>
              <div className="mt-2 text-4xl font-normal text-black">2,847</div>
              <div className="mt-2 inline-block rounded-full bg-[#bbf7d0] px-3 py-1 text-xs font-normal text-black ring-1 ring-[#16a34a]/25 transition-all duration-300 hover:scale-105">
                +4.2% MoM
              </div>
            </div>

            <div className="rounded-xl border border-[#93c5fd]/60 bg-gradient-to-br from-[#eff6ff] to-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#60a5fa]/40">
              <div className="text-sm font-normal text-black">Pending registrations</div>
              <div className="mt-2 text-4xl font-normal text-black">18</div>
              <div className="mt-2 inline-block rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-normal text-black transition-all duration-300 hover:scale-105">
                +3 this week
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#a7f3d0]/60 bg-gradient-to-br from-white to-[#f0fdf4]/80 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#354A3F]/20">
            <h2 className="text-xl font-normal font-serif text-black">Monthly Sales</h2>
            <div className="mt-4 h-[210px] rounded-xl border border-[#bfdbfe]/50 bg-gradient-to-b from-[#f8fafc]/95 to-[#eff6ff]/60 px-3 py-3">
              <div className="h-[160px] flex items-end gap-2">
                {salesHeights.map((height, index) => (
                  <div key={months[index]} className="flex-1 flex flex-col items-center justify-end gap-2">
                    <div
                      className={
                        height > 0
                          ? 'w-full max-w-[22px] rounded-t-md shadow-sm transition-all duration-300 hover:scale-105 hover:brightness-110'
                          : 'w-full max-w-[22px]'
                      }
                      style={{
                        height: `${height}px`,
                        backgroundColor: height > 0 ? salesBarGreen : 'transparent',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-12 gap-2 text-[11px] font-normal text-black">
                {months.map((month) => (
                  <div key={month} className="text-center">
                    {month}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-fit rounded-xl border border-[#93c5fd]/50 bg-gradient-to-b from-[#eff6ff]/90 via-white to-[#f0fdf4]/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#3b82f6]/25">
          <h2 className="text-xl font-normal font-serif text-black">Monthly Target</h2>
          <p className="mt-1 text-sm font-normal text-black">Target you have set for each month</p>

          <div className="mt-6 flex justify-center rounded-2xl bg-gradient-to-r from-[#dbeafe]/50 to-[#d1fae5]/40 py-4">
            <div className="relative h-[120px] w-[220px] rounded-t-full border-[14px] border-[#60a5fa]/50 border-b-0">
              <div className="absolute left-[-14px] top-[-14px] h-[120px] w-[220px] rounded-t-full border-[14px] border-[#354A3F] border-b-0 border-r-transparent" />
            </div>
          </div>

          <div className="-mt-4 text-center">
            <div className="text-5xl font-normal text-black">75.55%</div>
            <div className="mt-2 inline-block rounded-full bg-gradient-to-r from-[#dcfce7] to-[#dbeafe] px-3 py-1 text-xs font-normal text-black ring-1 ring-[#3b82f6]/25 transition-all duration-300 hover:scale-105">
              +10%
            </div>
          </div>

          <p className="mt-5 text-center text-sm font-normal text-black">
            You earn $3287 today, it's higher than last month.
            <br />
            Keep up your good work!
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg border border-[#86efac]/50 bg-[#ecfdf5]/90 p-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="text-xs font-normal text-black">Target</div>
              <div className="text-xl font-normal text-black">$20K</div>
            </div>
            <div className="rounded-lg border border-[#93c5fd]/50 bg-[#eff6ff]/90 p-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="text-xs font-normal text-black">Revenue</div>
              <div className="text-xl font-normal text-black">$20K</div>
            </div>
            <div className="rounded-lg border border-[#5eead4]/45 bg-[#f0fdfa]/90 p-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="text-xs font-normal text-black">Today</div>
              <div className="text-xl font-normal text-black">$20K</div>
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
