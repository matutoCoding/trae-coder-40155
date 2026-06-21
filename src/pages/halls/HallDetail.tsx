import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Edit, Building2 } from "lucide-react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import {
  OCCUPANCY_TYPE_LABELS,
  OCCUPANCY_TYPE_COLORS,
  HALL_STATUS_LABELS,
} from "@/types";
import type { Hall } from "@/types";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

const HOUR_START = 8;
const HOUR_END = 22;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const DAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];
const STATUS_BG: Record<Hall["status"], string> = {
  available: "bg-green-500",
  occupied: "bg-amber-500",
  maintenance: "bg-red-500",
};

function getWeekDates() {
  const today = dayjs();
  const monday =
    today.day() === 0
      ? today.subtract(6, "day")
      : today.subtract(today.day() - 1, "day");
  return Array.from({ length: 7 }, (_, i) => monday.add(i, "day"));
}

function timeToPercent(time: string) {
  const [h, m] = time.split(":").map(Number);
  const pct = ((h - HOUR_START + m / 60) / (HOUR_END - HOUR_START)) * 100;
  return Math.max(0, Math.min(100, pct));
}

export default function HallDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { halls, occupancies } = useStore();
  const hall = halls.find((h) => h.id === id);

  const weekDates = useMemo(getWeekDates, []);
  const hallOccs = occupancies.filter((o) => o.hallId === id);

  const getOccsForDay = (date: dayjs.Dayjs) =>
    hallOccs.filter((o) => {
      const start = dayjs(o.startDate);
      const end = dayjs(o.endDate);
      return (
        (date.isSame(start, "day") || date.isAfter(start, "day")) &&
        (date.isSame(end, "day") || date.isBefore(end, "day"))
      );
    });

  if (!hall)
    return (
      <PageContainer>
        <PageHeader title="未找到" showBack />
      </PageContainer>
    );

  return (
    <PageContainer noPadding>
      <PageHeader
        title={hall.name}
        showBack
        right={
          <button onClick={() => navigate(`/halls/${id}/edit`)} className="p-1">
            <Edit size={18} className="text-accent" />
          </button>
        }
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4"
      >
        <div className="bg-surface rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-accent" />
            <span className="font-serif font-semibold text-slate-100">
              {hall.name}
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] text-white",
                STATUS_BG[hall.status]
              )}
            >
              {HALL_STATUS_LABELS[hall.status]}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs text-slate-400 mb-3">
            <span>面积: {hall.area.toLocaleString()}㎡</span>
            <span>层高: {hall.height}m</span>
            <span>承重: {hall.loadBearing}t/㎡</span>
            <span>位置: {hall.location}</span>
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
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-300">本周排期</h3>
            <button
              onClick={() => navigate("/cycles")}
              className="text-xs text-accent"
            >
              周期规则 →
            </button>
          </div>

          <div className="bg-surface rounded-xl p-2 overflow-x-auto">
            <div className="flex ml-8">
              {weekDates.map((d, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 text-center py-1 min-w-[42px]",
                    d.isSame(dayjs(), "day")
                      ? "text-accent font-bold"
                      : "text-slate-500"
                  )}
                >
                  <div className="text-[10px]">{DAY_LABELS[i]}</div>
                  <div className="text-[10px]">{d.format("D")}</div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="text-[9px] text-slate-600 absolute -translate-y-1/2"
                    style={{
                      top: `${((h - HOUR_START) / (HOUR_END - HOUR_START)) * 100}%`,
                    }}
                  >
                    {h}:00
                  </div>
                ))}
              </div>

              <div className="ml-8 relative" style={{ height: 300 }}>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-white/5"
                    style={{
                      top: `${((h - HOUR_START) / (HOUR_END - HOUR_START)) * 100}%`,
                    }}
                  />
                ))}

                <div className="flex h-full">
                  {weekDates.map((d, i) => (
                    <div
                      key={i}
                      className="flex-1 relative border-l border-white/5 min-w-[42px]"
                    >
                      {getOccsForDay(d).map((occ) => (
                        <motion.div
                          key={occ.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => navigate(`/occupancy/${occ.id}`)}
                          className={cn(
                            "absolute left-0.5 right-0.5 rounded-sm cursor-pointer flex items-center justify-center overflow-hidden",
                            OCCUPANCY_TYPE_COLORS[occ.type]
                          )}
                          style={{
                            top: `${timeToPercent(occ.startTime)}%`,
                            height: `${timeToPercent(occ.endTime) - timeToPercent(occ.startTime)}%`,
                            minHeight: 14,
                          }}
                        >
                          <span className="text-[8px] text-white truncate px-0.5 leading-none">
                            {occ.title}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-2 px-2">
            {(Object.keys(OCCUPANCY_TYPE_LABELS) as Array<keyof typeof OCCUPANCY_TYPE_LABELS>).map(
              (type) => (
                <div key={type} className="flex items-center gap-1">
                  <div
                    className={cn("w-2.5 h-2.5 rounded-sm", OCCUPANCY_TYPE_COLORS[type])}
                  />
                  <span className="text-[10px] text-slate-500">
                    {OCCUPANCY_TYPE_LABELS[type]}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}
