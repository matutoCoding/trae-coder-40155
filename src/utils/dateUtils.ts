import dayjs from "dayjs";
import type { CycleRule, Occupancy } from "@/types";

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
        const occupancy: Occupancy = {
          id: `gen-${rule.id}-${current.format("YYYYMMDD")}-${slot.start}`,
          hallId: rule.hallIds[0],
          title: rule.title,
          type: rule.type,
          startDate: current.format("YYYY-MM-DD"),
          endDate: current.format("YYYY-MM-DD"),
          startTime: slot.start,
          endTime: slot.end,
          cycleRuleId: rule.id,
          isAdjusted: false,
        };

        const conflict = existingOccupancies.find(
          (o) =>
            o.hallId === occupancy.hallId &&
            o.startDate === occupancy.startDate &&
            !(o.endTime <= occupancy.startTime || o.startTime >= occupancy.endTime)
        );

        if (conflict) {
          conflicts.push(occupancy);
        } else {
          occupancies.push(occupancy);
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
  startTime: string,
  endTime: string,
  existingOccupancies: Occupancy[],
  excludeId?: string
): Occupancy | undefined {
  return existingOccupancies.find(
    (o) =>
      o.id !== excludeId &&
      o.hallId === hallId &&
      o.startDate === startDate &&
      !(o.endTime <= startTime || o.startTime >= endTime)
  );
}
