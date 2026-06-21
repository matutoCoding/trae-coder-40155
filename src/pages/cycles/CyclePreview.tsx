import { useState, useMemo } from "react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import { OCCUPANCY_TYPE_LABELS, OCCUPANCY_TYPE_COLORS } from "@/types";
import type { Occupancy } from "@/types";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, Check, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { generateOccupanciesFromRule } from "@/utils/dateUtils";

export default function CyclePreview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { cycleRules, occupancies, halls, addOccupancies } = useStore();
  const rule = cycleRules.find((r) => r.id === id);
  const hallMap = Object.fromEntries(halls.map((h) => [h.id, h.name]));

  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const { normal, conflicts } = useMemo(() => {
    if (!rule) return { normal: [], conflicts: [] };
    const hallNames = Object.fromEntries(halls.map((h) => [h.id, h.name]));
    const result = generateOccupanciesFromRule(rule, occupancies, hallNames);
    return { normal: result.occupancies, conflicts: result.conflicts };
  }, [rule, occupancies, halls]);

  const all = [...normal, ...conflicts];
  const total = all.length;
  const conflictCount = conflicts.length;
  const excludedCount = excluded.size;

  const toggleExclude = (occId: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(occId)) next.delete(occId);
      else next.add(occId);
      return next;
    });

  const handleConfirm = () => {
    const selected = all.filter((o) => !excluded.has(o.id));
    if (selected.length > 0) {
      addOccupancies(selected);
    }
    navigate(-1);
  };

  if (!rule) {
    return (
      <>
        <PageHeader title="生成预览" showBack />
        <PageContainer>
          <p className="pt-10 text-center text-sm text-slate-500">
            规则不存在
          </p>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <PageHeader title="生成预览" showBack />
      <PageContainer className="pb-32">
        <div className="mt-3 mb-2 flex gap-3 text-[11px] text-slate-400">
          <span>共 {total} 项</span>
          <span className="text-danger">冲突 {conflictCount}</span>
          <span className="text-warning">排除 {excludedCount}</span>
        </div>

        <div className="space-y-2">
          {all.map((occ, i) => {
            const isConflict = conflicts.some((c) => c.id === occ.id);
            const isExcluded = excluded.has(occ.id);
            return (
              <motion.div
                key={occ.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => toggleExclude(occ.id)}
                className={cn(
                  "relative flex items-start gap-3 rounded-xl bg-surface p-3 transition-opacity",
                  isConflict && "border border-danger/50",
                  isExcluded && "opacity-40"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                    isExcluded
                      ? "border-slate-500"
                      : "border-accent bg-accent"
                  )}
                >
                  {!isExcluded && (
                    <Check size={12} className="text-primary-dark" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white",
                        OCCUPANCY_TYPE_COLORS[occ.type]
                      )}
                    >
                      {OCCUPANCY_TYPE_LABELS[occ.type]}
                    </span>
                    {isConflict && (
                      <AlertTriangle size={12} className="text-danger" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-200 truncate">
                    {occ.title}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {dayjs(occ.startDate).format("MM-DD")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {occ.startTime}-{occ.endTime}
                    </span>
                    <span>{hallMap[occ.hallId] ?? occ.hallId}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </PageContainer>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-primary-dark/95 backdrop-blur-lg px-4 py-3 safe-bottom z-40">
        <button
          onClick={handleConfirm}
          disabled={total - excludedCount === 0}
          className={cn(
            "w-full rounded-xl py-3 text-sm font-semibold transition-colors",
            total - excludedCount > 0
              ? "bg-accent text-primary-dark active:bg-accent-light"
              : "bg-surface-light text-slate-500 cursor-not-allowed"
          )}
        >
          确认生成 ({total - excludedCount})
        </button>
      </div>
    </>
  );
}
