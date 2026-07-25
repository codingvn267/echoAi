import {
  LayoutDashboard,
  MessageSquareText,
  CalendarCheck,
  Users,
  BarChart3,
  Settings,
  TrendingUp,
} from "lucide-react";

/**
 * A static, on-brand mock of the Helora admin dashboard. Pure presentation —
 * no live data. Built as a self-contained SVG/CSS composition so it stays
 * crisp at any size, ships zero network requests, and carries no third-party
 * imagery or watermarks. Decorative: the parent provides the accessible label.
 */
export const DashboardMock = () => {
  const bars = [42, 58, 51, 73, 64, 88, 79];
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div
      aria-hidden="true"
      className="w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl"
    >
      {/* window chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
        <span className="size-3 rounded-full bg-zinc-700" />
        <span className="size-3 rounded-full bg-zinc-700" />
        <span className="size-3 rounded-full bg-zinc-700" />
        <span className="ml-3 truncate text-xs text-zinc-500">
          app.helora.ai/conversations
        </span>
      </div>

      <div className="flex">
        {/* sidebar */}
        <div className="hidden w-40 shrink-0 border-r border-white/5 p-3 sm:block">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="flex size-6 items-center justify-center rounded-md bg-white text-[11px] font-bold text-zinc-950">
              H
            </span>
            <span className="text-xs font-semibold tracking-tight text-zinc-200">
              Lumière
            </span>
          </div>
          <nav className="mt-4 space-y-1">
            {[
              { icon: LayoutDashboard, label: "Overview", active: false },
              { icon: MessageSquareText, label: "Conversations", active: true },
              { icon: CalendarCheck, label: "Appointments", active: false },
              { icon: Users, label: "Leads", active: false },
              { icon: BarChart3, label: "Analytics", active: false },
              { icon: Settings, label: "Settings", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium " +
                  (item.active ? "bg-white/10 text-white" : "text-zinc-500")
                }
              >
                <item.icon className="size-3.5" />
                {item.label}
              </div>
            ))}
          </nav>
        </div>

        {/* main panel */}
        <div className="min-w-0 flex-1 p-4">
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Booked today", value: "18", trend: "+24%" },
              { label: "New leads", value: "47", trend: "+12%" },
              { label: "Avg. reply", value: "2.4s", trend: "Live" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <p className="truncate text-[10px] text-zinc-500">
                  {kpi.label}
                </p>
                <div className="mt-1 flex items-end justify-between gap-1">
                  <span className="font-display text-xl tracking-tight text-white">
                    {kpi.value}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-400">
                    <TrendingUp className="size-3" />
                    {kpi.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* chart */}
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-zinc-300">
                Bookings this week
              </p>
              <span className="text-[10px] text-zinc-500">+38% vs last</span>
            </div>
            <div className="mt-3 flex h-24 items-end gap-2">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <div className="flex w-full items-end justify-center">
                    <div
                      style={{ height: `${h}%` }}
                      className="w-full rounded-md bg-gradient-to-t from-zinc-700 to-zinc-300"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-600">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* recent conversation row */}
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            {[
              {
                name: "Sofia R.",
                msg: "Booked Botox · Fri 2:00 PM",
                dot: "bg-emerald-400",
              },
              {
                name: "Marcus T.",
                msg: "Asked about pricing · captured",
                dot: "bg-zinc-400",
              },
            ].map((row) => (
              <div
                key={row.name}
                className="flex items-center gap-2.5 rounded-lg px-1.5 py-2"
              >
                <span className={"size-1.5 shrink-0 rounded-full " + row.dot} />
                <span className="text-[11px] font-medium text-zinc-200">
                  {row.name}
                </span>
                <span className="truncate text-[11px] text-zinc-500">
                  {row.msg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
