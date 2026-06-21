import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

const CYCLE_LABELS: Record<string, string> = {
  weekly: "周",
  biweekly: "双周",
  monthly: "月",
};

import type { CycleRule } from "@/types";

function getNextExec(rule: CycleRule) {
  const start = dayjs(rule.startDate);
  const end = dayjs(rule.endDate);
  let cur = dayjs();
  if (cur.isBefore(start)) cur = start;
  let weeks = 0;
  while (cur.isBefore(end) || cur.isSame(end, "day")) {
    weeks++;
    const include =
      rule.cycleType === "weekly"
        ? true
        : rule.cycleType === "biweekly"
          ? weeks % 2 === 1
          : rule.weekDays.includes(cur.day()) && cur.date() <= 7;
    if (include && rule.weekDays.includes(cur.day())) {
      return cur.format("MM-DD") + " " + rule.timeSlots[0]?.start;
    }
    cur = cur.add(1, "day");
  }
  return "无";
}

export default function CycleList() {
  const navigate = useNavigate();
  const { cycleRules, halls, updateCycleRule } = useStore();
  const hallMap = Object.fromEntries(halls.map((h) => [h.id, h.name]));

  return (
    <>
      <PageHeader title="周期生成" />
      <PageContainer>
        <div className="space-y-3 pt-3">
          {cycleRules.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl bg-surface p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-100 truncate">
                    {rule.name}
                  </h3>
                  <span className="mt-0.5 inline-block rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                    {CYCLE_LABELS[rule.cycleType]}
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateCycleRule(rule.id, { isActive: !rule.isActive })
                  }
                  className="shrink-0 ml-2"
                >
                  {rule.isActive ? (
                    <ToggleRight size={28} className="text-accent" />
                  ) : (
                    <ToggleLeft size={28} className="text-slate-500" />
                  )}
                </button>
              </div>

              <div className="mt-2 space-y-1 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>
                    {rule.hallIds.map((id) => hallMap[id] ?? id).join("、")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>下次执行: {getNextExec(rule)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/cycles/${rule.id}/preview`)}
                className={cn(
                  "mt-3 w-full rounded-lg py-2 text-xs font-medium",
                  "bg-accent/10 text-accent active:bg-accent/20",
                  "transition-colors"
                )}
              >
                生成预览
              </button>
            </motion.div>
          ))}

          {cycleRules.length === 0 && (
            <p className="pt-10 text-center text-sm text-slate-500">
              暂无周期规则
            </p>
          )}
        </div>

        <button
          onClick={() => navigate("/cycles/new")}
          className={cn(
            "fixed bottom-24 right-1/2 translate-x-1/2",
            "flex h-14 w-14 items-center justify-center",
            "rounded-full bg-accent shadow-lg shadow-accent/30",
            "active:scale-95 transition-transform z-30"
          )}
        >
          <Plus size={24} className="text-primary-dark" />
        </button>
      </PageContainer>
    </>
  );
}
