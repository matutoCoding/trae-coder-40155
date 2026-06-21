import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import { OCCUPANCY_TYPE_LABELS, OCCUPANCY_TYPE_COLORS } from "@/types";
import type { Occupancy } from "@/types";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, Check, Calendar, Clock, Info } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);

  const { normal, conflicts } = useMemo(() => {
    if (!rule) return { normal: [], conflicts: [] };
    const hallNames = Object.fromEntries(halls.map((h) => [h.id, h.name]));
    const result = generateOccupanciesFromRule(rule, occupancies, hallNames);
    return { normal: result.occupancies, conflicts: result.conflicts };
  }, [rule, occupancies, halls]);

  useEffect(() => {
    setExcluded(new Set(conflicts.map((c) => c.id)));
  }, [conflicts]);

  const all = [...normal, ...conflicts];
  const total = all.length;
  const conflictCount = conflicts.length;
  const excludedCount = excluded.size;
  const conflictIds = new Set(conflicts.map((c) => c.id));
  const savableCount = all.filter(
    (o) => !excluded.has(o.id) && !conflictIds.has(o.id)
  ).length;

  const toggleExclude = (occId: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(occId)) next.delete(occId);
      else next.add(occId);
      return next;
    });

  const handleConfirm = () => {
    setError(null);
    const safeToSave = all.filter(
      (o) => !excluded.has(o.id) && !conflictIds.has(o.id)
    );

    if (safeToSave.length === 0) {
      if (conflictCount === total) {
        setError("全部为冲突项，请先排除冲突后再生成");
      } else {
        setError("没有可生成的排期，请先取消排除无冲突的记录");
      }
      return;
    }

    addOccupancies(safeToSave);
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
        <div className="mt-3 mb-2 flex flex-col gap-2">
          <div className="flex gap-3 text-[11px] text-slate-400">
            <span>共 {total} 项</span>
            <span className="text-danger">冲突 {conflictCount}</span>
            <span className="text-warning">排除 {excludedCount}</span>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-danger/15 border border-danger/30 rounded-lg px-3 py-2 text-[11px] text-danger flex items-center gap-2"
            >
              <AlertTriangle size={12} />
              {error}
            </motion.div>
          )}
          {conflictCount > 0 && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg px-3 py-2 text-[11px] text-accent/90 flex items-center gap-2">
              <Info size={12} />
              冲突项已默认排除，且不会被保存
            </div>
          )}
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
                onClick={() => !isConflict && toggleExclude(occ.id)}
                className={cn(
                  "relative flex items-start gap-3 rounded-xl bg-surface p-3 transition-opacity",
                  isConflict && "border border-danger/50 opacity-60",
                  !isConflict && isExcluded && "opacity-40",
                  isConflict && "cursor-not-allowed",
                  !isConflict && "cursor-pointer"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                    isConflict
                      ? "border-danger/50 bg-danger/10"
                      : isExcluded
                        ? "border-slate-500"
                        : "border-accent bg-accent"
                  )}
                >
                  {isConflict ? (
                    <AlertTriangle size={10} className="text-danger" />
                  ) : !isExcluded ? (
                    <Check size={12} className="text-primary-dark" />
                  ) : null}
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
          disabled={savableCount === 0}
          className={cn(
            "w-full rounded-xl py-3 text-sm font-semibold transition-colors",
            savableCount > 0
              ? "bg-accent text-primary-dark active:bg-accent-light"
              : "bg-surface-light text-slate-500 cursor-not-allowed"
          )}
        >
          确认生成 ({savableCount})
        </button>
      </div>
    </>
  );
}
