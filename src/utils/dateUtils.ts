import dayjs from "dayjs";
import type { CycleRule, Occupancy } from "@/types";

function dateRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = dayjs(startA);
  const aEnd = dayjs(endA);
  const bStart = dayjs(startB);
  const bEnd = dayjs(endB);
  return !(aEnd.isBefore(bStart, "day") || aStart.isAfter(bEnd, "day"));
}

function timeOverlaps(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return !(endA <= startB || startA >= endB);
}

export function generateOccupanciesFromRule(
  rule: CycleRule,
  existingOccupancies: Occupancy[],
  hallNames: Record<string, string>
): { occupancies: Occupancy[]; conflicts: Occupancy[] } {
  const occupancies: Occupancy[] = [];
  const conflicts: Occupancy[] = [];
  const start = dayjs(rule.startDate);
  const end = dayjs(rule.endDate);
  let current = start;
  let weekCount = 0;

  while (current.isBefore(end) || current.isSame(end, "day")) {
    weekCount++;
    const shouldInclude =
      rule.cycleType === "weekly"
        ? true
        : rule.cycleType === "biweekly"
          ? weekCount % 2 === 1
          : rule.weekDays.includes(current.day()) && current.date() <= 7;

    if (shouldInclude && rule.weekDays.includes(current.day())) {
      for (const slot of rule.timeSlots) {
        for (const hallId of rule.hallIds) {
          const occDate = current.format("YYYY-MM-DD");
          const occupancy: Occupancy = {
            id: `gen-${rule.id}-${hallId}-${current.format("YYYYMMDD")}-${slot.start}`,
            hallId,
            title: rule.title,
            type: rule.type,
            startDate: occDate,
            endDate: occDate,
            startTime: slot.start,
            endTime: slot.end,
            cycleRuleId: rule.id,
            isAdjusted: false,
          };

          const conflict = existingOccupancies.find(
            (o) =>
              o.hallId === occupancy.hallId &&
              dateRangesOverlap(o.startDate, o.endDate, occupancy.startDate, occupancy.endDate) &&
              timeOverlaps(o.startTime, o.endTime, occupancy.startTime, occupancy.endTime)
          );

          if (conflict) {
            conflicts.push(occupancy);
          } else {
            occupancies.push(occupancy);
          }
        }
      }
    }

    current = current.add(1, "day");
  }

  return { occupancies, conflicts };
}

export function checkTimeConflict(
  hallId: string,
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string,
  existingOccupancies: Occupancy[],
  excludeId?: string
): Occupancy | undefined {
  return existingOccupancies.find(
    (o) =>
      o.id !== excludeId &&
      o.hallId === hallId &&
      dateRangesOverlap(o.startDate, o.endDate, startDate, endDate) &&
      timeOverlaps(o.startTime, o.endTime, startTime, endTime)
  );
}
