import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ScanSearch,
  Briefcase,
  FlaskConical,
  BookOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/",          label: "Dashboard",  Icon: LayoutDashboard },
  { to: "/cases",     label: "Research",   Icon: BookOpen },
  { to: "/screener",  label: "Screener",   Icon: ScanSearch },
  { to: "/portfolio", label: "Portfolio",  Icon: Briefcase },
  { to: "/backtest",  label: "Backtest",   Icon: FlaskConical },
];

export default function NavBar() {
  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-card border-r border-border px-4 py-6 gap-1 fixed top-0 left-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-8">
          <span className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">QP</span>
          </span>
          <span className="font-semibold text-ink-primary text-base tracking-tight">
            QuantPath
          </span>
        </div>

        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-500"
                  : "text-ink-secondary hover:bg-surface hover:text-ink-primary",
              ].join(" ")
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-border flex justify-around py-2 px-2">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              [
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-xs font-medium transition-colors",
                isActive ? "text-brand-500" : "text-ink-secondary",
              ].join(" ")
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
