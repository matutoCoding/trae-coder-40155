import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
}

export function PageHeader({ title, showBack, right }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 bg-primary-dark/95 backdrop-blur-lg safe-top">
      <div className="flex items-center justify-between h-12 px-4">
        <div className="flex items-center gap-2 w-12">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 -ml-1 rounded-full active:bg-white/10"
            >
              <ChevronLeft size={22} className="text-slate-300" />
            </button>
          )}
        </div>
        <h1 className="font-serif text-base font-semibold text-slate-100 tracking-wide">
          {title}
        </h1>
        <div className="w-12 flex justify-end">{right}</div>
      </div>
    </header>
  );
}

export function PageContainer({
  children,
  className = "",
  noPadding = false,
}: {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <main
      className={`min-h-screen pb-20 ${
        noPadding ? "" : "px-4"
      } ${className}`}
    >
      {children}
    </main>
  );
}
