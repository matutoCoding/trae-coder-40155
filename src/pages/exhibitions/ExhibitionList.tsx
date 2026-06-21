import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import { EXHIBITION_STATUS_LABELS } from "@/types";
import type { ExhibitionStatus, FireSafetyStatus } from "@/types";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

const TABS: { key: ExhibitionStatus | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "preparing", label: "筹备中" },
  { key: "setup", label: "布展中" },
  { key: "running", label: "开展中" },
  { key: "teardown", label: "撤展中" },
  { key: "ended", label: "已结束" },
];

const STATUS_COLORS: Record<ExhibitionStatus, string> = {
  preparing: "bg-blue-500/80 text-blue-100",
  setup: "bg-purple-500/80 text-purple-100",
  running: "bg-green-500/80 text-green-100",
  teardown: "bg-orange-500/80 text-orange-100",
  ended: "bg-gray-500/80 text-gray-100",
};

const FIRE_ICONS: Record<FireSafetyStatus, { icon: typeof CheckCircle; color: string }> = {
  approved: { icon: CheckCircle, color: "text-green-400" },
  pending: { icon: Clock, color: "text-yellow-400" },
  rejected: { icon: XCircle, color: "text-red-400" },
  not_submitted: { icon: AlertCircle, color: "text-gray-500" },
};

export default function ExhibitionList() {
  const navigate = useNavigate();
  const { exhibitions, halls } = useStore();
  const [tab, setTab] = useState<ExhibitionStatus | "all">("all");
  const [query, setQuery] = useState("");

  const hallMap = new Map(halls.map((h) => [h.id, h.name]));

  const filtered = exhibitions.filter((e) => {
    if (tab !== "all" && e.status !== tab) return false;
    if (query && !e.name.includes(query) && !e.organizer.includes(query)) return false;
    return true;
  });

  return (
    <PageContainer>
      <PageHeader title="展会登记" />

      <div className="px-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索展会名称或主办方"
            className="w-full pl-9 pr-3 py-2.5 bg-surface rounded-lg text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                tab === t.key
                  ? "bg-accent text-primary-dark"
                  : "bg-surface text-slate-400"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-3 space-y-3">
        {filtered.map((ex, i) => {
          const FireIcon = FIRE_ICONS[ex.fireSafetyStatus];
          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/exhibitions/${ex.id}`)}
              className="bg-surface rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif font-semibold text-slate-100 text-[15px] leading-snug">
                  {ex.name}
                </h3>
                <span className={cn("shrink-0 px-2 py-0.5 rounded text-[10px] font-medium", STATUS_COLORS[ex.status])}>
                  {EXHIBITION_STATUS_LABELS[ex.status]}
                </span>
              </div>

              <div className="mt-2 space-y-1 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span>主办方：{ex.organizer}</span>
                  <span>{ex.scale.toLocaleString()} ㎡</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>展厅：{ex.hallIds.map((id) => hallMap.get(id)).join("、")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{dayjs(ex.startDate).format("MM/DD")} - {dayjs(ex.endDate).format("MM/DD")}</span>
                  <FireIcon.icon size={14} className={FireIcon.color} />
                </div>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-500">暂无展会数据</div>
        )}
      </div>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => navigate("/exhibitions/new")}
        className="fixed bottom-24 right-6 w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/30 z-30"
        style={{ maxWidth: "430px" }}
      >
        <Plus size={22} className="text-primary-dark" />
      </motion.button>
    </PageContainer>
  );
}
