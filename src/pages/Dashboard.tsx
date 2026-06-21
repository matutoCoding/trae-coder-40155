import { useStore } from "@/stores/useStore";
import { PageContainer } from "@/components/PageHeader";
import type { Hall, Occupancy, ApprovalRequest, Exhibition } from "@/types";
import {
  OCCUPANCY_TYPE_LABELS,
  EXHIBITION_STATUS_LABELS,
  APPROVAL_STATUS_LABELS,
  HALL_STATUS_LABELS,
} from "@/types";
import { useNavigate } from "react-router-dom";
import { Calendar, AlertTriangle, ChevronRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

const APPROVAL_TYPE_LABELS: Record<string, string> = {
  setup: "布展审批",
  fire_safety: "消防报批",
  other: "其他审批",
};

const HALL_STATUS_DOT: Record<Hall["status"], string> = {
  available: "bg-emerald-400",
  occupied: "bg-amber-400",
  maintenance: "bg-red-400",
};

function findConflicts(occupancies: Occupancy[]) {
  const result: { hallId: string; a: Occupancy; b: Occupancy }[] = [];
  for (let i = 0; i < occupancies.length; i++) {
    for (let j = i + 1; j < occupancies.length; j++) {
      const a = occupancies[i];
      const b = occupancies[j];
      if (a.hallId !== b.hallId) continue;
      const aS = dayjs(a.startDate);
      const aE = dayjs(a.endDate);
      const bS = dayjs(b.startDate);
      const bE = dayjs(b.endDate);
      if (aE.isBefore(bS, "day") || aS.isAfter(bE, "day")) continue;
      if (!(a.endTime <= b.startTime || a.startTime >= b.endTime)) {
        result.push({ hallId: a.hallId, a, b });
      }
    }
  }
  return result;
}

const stagger = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  },
  item: {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { halls, occupancies, approvalRequests, exhibitions } = useStore();

  const pendingApprovals = approvalRequests.filter(
    (r) => r.status === "pending"
  );

  const upcomingExhibitions = exhibitions
    .filter((e) => {
      const diff = dayjs(e.startDate).diff(dayjs(), "day");
      return diff >= 0 && diff <= 7;
    })
    .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)));

  const conflicts = findConflicts(occupancies);
  const conflictHallIds = [...new Set(conflicts.map((c) => c.hallId))];
  const hallMap = Object.fromEntries(halls.map((h) => [h.id, h]));

  return (
    <PageContainer>
      <div className="pt-6 pb-5">
        <h1 className="font-serif text-[22px] font-bold text-slate-100 tracking-wide">
          会展排期
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-400/80">
          {dayjs().format("YYYY年M月D日 dddd")}
        </p>
      </div>

      {/* 排期概览 */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={15} className="text-accent" />
          <h2 className="font-serif text-[15px] font-semibold text-slate-200">
            排期概览
          </h2>
        </div>
        <motion.div
          className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory"
          variants={stagger.container}
          initial="hidden"
          animate="show"
        >
          {halls.map((hall) => (
            <motion.button
              key={hall.id}
              variants={stagger.item}
              onClick={() => navigate(`/halls/${hall.id}`)}
              className="snap-start shrink-0 w-[128px] rounded-xl p-3 text-left active:scale-[0.97] transition-transform border border-white/[0.04]"
              style={{
                background:
                  "linear-gradient(160deg, rgba(45,62,80,0.85) 0%, rgba(27,40,56,0.95) 100%)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    HALL_STATUS_DOT[hall.status]
                  )}
                />
                <span className="text-[11px] text-slate-400/90">
                  {HALL_STATUS_LABELS[hall.status]}
                </span>
              </div>
              <p className="text-[13px] font-semibold text-slate-100 truncate leading-snug">
                {hall.name}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {hall.area.toLocaleString()} m²
              </p>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* 冲突预警 */}
      {conflicts.length > 0 && (
        <section className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-xl p-3.5 animate-pulse-danger border border-red-500/20"
            style={{
              background:
                "linear-gradient(160deg, rgba(231,76,60,0.12) 0%, rgba(231,76,60,0.04) 100%)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-400" />
              <span className="font-serif text-[13px] font-semibold text-red-300">
                冲突预警
              </span>
              <span className="ml-auto text-[11px] text-red-400/70 bg-red-400/10 px-2 py-0.5 rounded-full">
                {conflicts.length}项
              </span>
            </div>
            <div className="space-y-1.5">
              {conflictHallIds.map((hallId) => {
                const hall = hallMap[hallId];
                const relatedConflicts = conflicts.filter(
                  (c) => c.hallId === hallId
                );
                return (
                  <div key={hallId} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-red-400/60 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-[12px] text-red-300/90">
                        {hall?.name ?? hallId}
                      </p>
                      {relatedConflicts.map((c, idx) => (
                        <p
                          key={idx}
                          className="text-[11px] text-red-300/60 mt-0.5"
                        >
                          {c.a.title}（{OCCUPANCY_TYPE_LABELS[c.a.type]}）与
                          {c.b.title}（{OCCUPANCY_TYPE_LABELS[c.b.type]}）时间冲突
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}

      {/* 待办审批 */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={15} className="text-accent" />
          <h2 className="font-serif text-[15px] font-semibold text-slate-200">
            待办审批
          </h2>
          {pendingApprovals.length > 0 && (
            <span className="ml-auto text-[11px] font-semibold text-primary-dark bg-accent rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
              {pendingApprovals.length}
            </span>
          )}
        </div>
        <motion.div
          className="space-y-2"
          variants={stagger.container}
          initial="hidden"
          animate="show"
        >
          {pendingApprovals.length === 0 ? (
            <p className="text-[13px] text-slate-500 py-6 text-center">
              暂无待办审批
            </p>
          ) : (
            pendingApprovals.map((req) => (
              <motion.button
                key={req.id}
                variants={stagger.item}
                onClick={() => navigate(`/approvals/${req.id}`)}
                className="w-full flex items-center gap-3 rounded-xl p-3 text-left active:bg-white/[0.03] transition-colors border border-white/[0.04]"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(45,62,80,0.6) 0%, rgba(27,40,56,0.75) 100%)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-200 truncate">
                    {req.exhibitionName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[11px] text-accent/90">
                      {APPROVAL_TYPE_LABELS[req.type] ?? req.type}
                    </span>
                    <span className="text-[11px] text-slate-600">·</span>
                    <span className="text-[11px] text-slate-400/70">
                      {APPROVAL_STATUS_LABELS[req.status]}
                    </span>
                    <span className="text-[11px] text-slate-600">·</span>
                    <span className="text-[11px] text-slate-500">
                      {dayjs(req.createdAt).format("M月D日")}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={15}
                  className="text-slate-500/60 shrink-0"
                />
              </motion.button>
            ))
          )}
        </motion.div>
      </section>

      {/* 即将开展 */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={15} className="text-accent" />
          <h2 className="font-serif text-[15px] font-semibold text-slate-200">
            即将开展
          </h2>
          {upcomingExhibitions.length > 0 && (
            <span className="text-[11px] text-slate-500 ml-1">
              近7天
            </span>
          )}
        </div>
        <motion.div
          className="relative pl-5"
          variants={stagger.container}
          initial="hidden"
          animate="show"
        >
          <div className="absolute left-[6px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/30 via-surface-light/60 to-transparent" />
          {upcomingExhibitions.length === 0 ? (
            <p className="text-[13px] text-slate-500 py-6 text-center">
              近7天暂无展会
            </p>
          ) : (
            upcomingExhibitions.map((ex) => {
              const hallNames = ex.hallIds
                .map((id) => hallMap[id]?.name)
                .filter(Boolean)
                .join("、");
              return (
                <motion.div
                  key={ex.id}
                  variants={stagger.item}
                  className="relative mb-3 last:mb-0"
                >
                  <div className="absolute left-[-18px] top-[7px] w-[9px] h-[9px] rounded-full bg-accent/80 border-[2.5px] border-primary-dark" />
                  <div
                    className="rounded-xl p-3 border border-white/[0.04]"
                    style={{
                      background:
                        "linear-gradient(160deg, rgba(45,62,80,0.6) 0%, rgba(27,40,56,0.75) 100%)",
                    }}
                  >
                    <p className="text-[13px] font-medium text-slate-200 leading-snug">
                      {ex.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400/80">
                        {hallNames}
                      </span>
                      <span className="text-[11px] text-slate-600">·</span>
                      <span className="text-[11px] text-accent/70">
                        {dayjs(ex.startDate).format("M月D日")} —{" "}
                        {dayjs(ex.endDate).format("M月D日")}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={cn(
                          "inline-block text-[11px] px-2 py-[2px] rounded-full",
                          ex.status === "preparing" &&
                            "bg-sky-500/10 text-sky-400/90",
                          ex.status === "setup" &&
                            "bg-violet-500/10 text-violet-400/90",
                          ex.status === "running" &&
                            "bg-emerald-500/10 text-emerald-400/90",
                          ex.status === "teardown" &&
                            "bg-orange-500/10 text-orange-400/90",
                          ex.status === "ended" &&
                            "bg-slate-500/10 text-slate-400/70"
                        )}
                      >
                        {EXHIBITION_STATUS_LABELS[ex.status]}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </section>
    </PageContainer>
  );
}
