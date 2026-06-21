import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Building2,
  Filter,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import BottomSheet from "@/components/BottomSheet";
import {
  OCCUPANCY_TYPE_LABELS,
  OCCUPANCY_TYPE_COLORS,
  HALL_STATUS_LABELS,
} from "@/types";
import type {
  Occupancy,
  OccupancyType,
  Hall,
} from "@/types";
import { checkTimeConflict } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

export default function MonthlySchedule() {
  const navigate = useNavigate();
  const { occupancies, halls } = useStore();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedHall, setSelectedHall] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<OccupancyType | "all">("all");
  const [filterConflict, setFilterConflict] = useState<"all" | "conflict">(
    "all"
  );
  const [filterOpen, setFilterOpen] = useState(false);

  const hallMap = Object.fromEntries(halls.map((h) => [h.id, h]));
  const hallNames = Object.fromEntries(halls.map((h) => [h.id, h.name]));

  const monthStart = currentMonth.startOf("month");
  const monthEnd = currentMonth.endOf("month");
  const daysInMonth = monthEnd.daysInMonth();
  const firstDayWeekday = monthStart.day();

  const checkConflict = (occ: Occupancy): Occupancy | undefined => {
    return checkTimeConflict(
      occ.hallId,
      occ.startDate,
      occ.endDate,
      occ.startTime,
      occ.endTime,
      occupancies,
      occ.id
    );
  };

  const filteredOccupancies = useMemo(() => {
    return occupancies.filter((occ) => {
      const occStart = dayjs(occ.startDate);
      const occEnd = dayjs(occ.endDate);
      const inMonth =
        !(occEnd.isBefore(monthStart) || occStart.isAfter(monthEnd));
      if (!inMonth) return false;
      if (selectedHall !== "all" && occ.hallId !== selectedHall) return false;
      if (selectedType !== "all" && occ.type !== selectedType) return false;
      if (filterConflict === "conflict" && !checkConflict(occ)) return false;
      return true;
    });
  }, [occupancies, currentMonth, selectedHall, selectedType, filterConflict]);

  const prevMonth = () =>
    setCurrentMonth(currentMonth.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const daySlots: { day: number; date: string; items: Occupancy[] }[] = [];

  for (let i = 0; i < daysInMonth; i++) {
    const date = monthStart.add(i, "day");
    const dateStr = date.format("YYYY-MM-DD");
    const items = filteredOccupancies.filter((occ) => {
      const start = dayjs(occ.startDate);
      const end = dayjs(occ.endDate);
      return (
        date.isSame(start, "day") ||
        date.isSame(end, "day") ||
        (date.isAfter(start) && date.isBefore(end))
      );
    });
    daySlots.push({ day: i + 1, date: dateStr, items });
  }

  const weekStarts: number[] = [];
  for (let i = 0; i < firstDayWeekday; i++) {
    weekStarts.push(-1);
  }
  weekStarts.push(...Array.from({ length: daysInMonth }, (_, i) => i));

  const activeFilterCount =
    (selectedHall !== "all" ? 1 : 0) +
    (selectedType !== "all" ? 1 : 0) +
    (filterConflict !== "all" ? 1 : 0);

  return (
    <>
      <PageContainer>
        <PageHeader
          title="月度排期"
          right={
            <button
              onClick={() => setFilterOpen(true)}
              className="relative p-2 rounded-full active:bg-white/10"
            >
              <Filter size={18} className="text-slate-400" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-primary-dark text-[10px] rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          }
        />

        <div className="flex items-center justify-between px-1 py-2">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10"
          >
            <ChevronLeft size={18} className="text-slate-400" />
          </button>
          <h2 className="font-serif text-base font-semibold text-slate-100">
            {currentMonth.format("YYYY年MM月")}
          </h2>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full active:bg-white/10"
          >
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] text-slate-500 py-1 font-medium"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {weekStarts.map((dayIdx, i) => {
            if (dayIdx === -1) {
              return (
                <div
                  key={`empty-${i}`}
                  className="aspect-square bg-primary-dark/30 rounded"
                />
              );
            }
            const slot = daySlots[dayIdx];
            const isToday = dayjs(slot.date).isSame(dayjs(), "day");
            return (
              <motion.div
                key={slot.date}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.005 }}
                className={cn(
                  "aspect-square bg-surface rounded p-0.5 overflow-hidden relative",
                  isToday && "ring-1 ring-accent/50"
                )}
              >
                <div
                  className={cn(
                    "text-[9px] font-medium mb-0.5",
                    isToday ? "text-accent" : "text-slate-500"
                  )}
                >
                  {slot.day}
                </div>
                <div className="space-y-0.5">
                  {slot.items.slice(0, 2).map((occ) => {
                    const hasConflict = checkConflict(occ);
                    return (
                      <div
                        key={occ.id}
                        onClick={() => navigate(`/occupancy/${occ.id}`)}
                        className={cn(
                          "text-[8px] px-1 py-0.5 rounded overflow-hidden truncate cursor-pointer",
                          OCCUPANCY_TYPE_COLORS[occ.type],
                          hasConflict && "ring-1 ring-danger"
                        )}
                        title={occ.title}
                      >
                        {occ.title.slice(0, 4)}
                      </div>
                    );
                  })}
                  {slot.items.length > 2 && (
                    <div className="text-[8px] text-slate-500 px-1">
                      +{slot.items.length - 2}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 mb-2 flex items-center justify-between px-1">
          <h3 className="text-xs font-medium text-slate-400">
            本月排期明细
          </h3>
          <span className="text-[10px] text-slate-500">
            共 {filteredOccupancies.length} 条
          </span>
        </div>

        <div className="space-y-2 pb-4">
          {filteredOccupancies.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-500">
              暂无排期记录
            </div>
          ) : (
            filteredOccupancies.map((occ, i) => {
              const hasConflict = checkConflict(occ);
              return (
                <motion.div
                  key={occ.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => navigate(`/occupancy/${occ.id}`)}
                  className={cn(
                    "bg-surface rounded-xl p-3 cursor-pointer active:bg-surface-light transition-colors",
                    hasConflict && "border border-danger/40"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-block text-[10px] font-medium text-white px-1.5 py-0.5 rounded",
                            OCCUPANCY_TYPE_COLORS[occ.type]
                          )}
                        >
                          {OCCUPANCY_TYPE_LABELS[occ.type]}
                        </span>
                        {hasConflict && (
                          <AlertTriangle size={12} className="text-danger" />
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-200 truncate">
                        {occ.title}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 size={10} />
                          {hallNames[occ.hallId] ?? occ.hallId}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {dayjs(occ.startDate).format("MM-DD")}
                          {occ.endDate !== occ.startDate &&
                            ` ~ ${dayjs(occ.endDate).format("MM-DD")}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {occ.startTime}-{occ.endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  {hasConflict && (
                    <p className="mt-1.5 text-[11px] text-danger">
                      ⚠ 与其他排期时段重叠
                    </p>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </PageContainer>

      <BottomSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="筛选条件"
      >
        <div className="space-y-5">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-2 block">
              展厅
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={selectedHall === "all"}
                onClick={() => setSelectedHall("all")}
              >
                全部
              </FilterChip>
              {halls.map((hall) => (
                <FilterChip
                  key={hall.id}
                  active={selectedHall === hall.id}
                  onClick={() => setSelectedHall(hall.id)}
                >
                  {hall.name}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-2 block">
              占用类型
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={selectedType === "all"}
                onClick={() => setSelectedType("all")}
              >
                全部
              </FilterChip>
              {(
                Object.keys(OCCUPANCY_TYPE_LABELS) as OccupancyType[]
              ).map((t) => (
                <FilterChip
                  key={t}
                  active={selectedType === t}
                  onClick={() => setSelectedType(t)}
                >
                  {OCCUPANCY_TYPE_LABELS[t]}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-2 block">
              冲突状态
            </label>
            <div className="flex gap-2">
              <FilterChip
                active={filterConflict === "all"}
                onClick={() => setFilterConflict("all")}
              >
                全部
              </FilterChip>
              <FilterChip
                active={filterConflict === "conflict"}
                onClick={() => setFilterConflict("conflict")}
              >
                仅冲突
              </FilterChip>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedHall("all");
              setSelectedType("all");
              setFilterConflict("all");
            }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
          >
            <X size={12} /> 重置筛选
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
        active
          ? "bg-accent text-primary-dark"
          : "bg-surface-light text-slate-400 active:bg-surface"
      )}
    >
      {children}
    </button>
  );
}
