import { NavLink, useLocation } from "react-router-dom";
import { Home, CalendarCheck, GitBranch, ClipboardList } from "lucide-react";

const tabs = [
  { path: "/", icon: Home, label: "首页" },
  { path: "/halls", icon: CalendarCheck, label: "排期" },
  { path: "/approvals", icon: GitBranch, label: "审批" },
  { path: "/exhibitions", icon: ClipboardList, label: "登记" },
];

export default function TabBar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-primary-dark/95 backdrop-blur-lg border-t border-white/5 safe-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center gap-1 w-16 h-full"
            >
              <div
                className={`transition-all duration-200 ${
                  active ? "scale-110" : "scale-100"
                }`}
              >
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${
                    active ? "text-accent" : "text-slate-400"
                  }`}
                  strokeWidth={active ? 2.5 : 1.5}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  active ? "text-accent" : "text-slate-500"
                }`}
              >
                {tab.label}
              </span>
              {active && (
                <div className="absolute top-0 w-8 h-0.5 bg-accent rounded-full" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
