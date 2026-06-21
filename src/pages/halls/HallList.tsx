import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Building2, MapPin, Clock, Filter } from "lucide-react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import { HALL_STATUS_LABELS } from "@/types";
import type { Hall } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<Hall["status"], string> = {
  available: "bg-green-500",
  occupied: "bg-amber-500",
  maintenance: "bg-red-500",
};

const filters = [
  { key: "all", label: "全部" },
  { key: "available", label: "空闲" },
  { key: "occupied", label: "占用" },
  { key: "maintenance", label: "维护" },
] as const;

export default function HallList() {
  const navigate = useNavigate();
  const halls = useStore((s) => s.halls);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered =
    activeFilter === "all"
      ? halls
      : halls.filter((h) => h.status === activeFilter);

  return (
    <PageContainer>
      <PageHeader
        title="展厅管理"
        right={<Filter size={18} className="text-slate-400" />}
      />

      <div className="flex gap-2 py-3 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              activeFilter === f.key
                ? "bg-accent text-primary-dark"
                : "bg-surface text-slate-400"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 pb-4">
        {filtered.map((hall, i) => (
          <motion.div
            key={hall.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/halls/${hall.id}`)}
            className="bg-surface rounded-xl p-4 active:bg-surface-light cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-accent" />
                <span className="font-serif font-semibold text-slate-100">
                  {hall.name}
                </span>
              </div>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium text-white",
                  STATUS_COLORS[hall.status]
                )}
              >
                {HALL_STATUS_LABELS[hall.status]}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {hall.location}
              </span>
              <span>{hall.area.toLocaleString()}㎡</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
              <Clock size={12} />
              <span>
                {hall.availableHours.start} - {hall.availableHours.end}
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {hall.facilities.map((f) => (
                <span
                  key={f}
                  className="px-1.5 py-0.5 bg-primary-light/60 rounded text-[10px] text-slate-400"
                >
                  {f}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
        onClick={() => navigate("/halls/new")}
        className="fixed bottom-24 right-6 w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/30 active:scale-95 z-30"
      >
        <Plus size={24} className="text-primary-dark" />
      </motion.button>
    </PageContainer>
  );
}
