import type { ApprovalRoute, RouteCondition } from "@/types";

export function resolveBranch(
  route: ApprovalRoute,
  formData: Record<string, string | number>
) {
  for (const condition of route.conditions) {
    if (evaluateCondition(condition, formData)) {
      return route.branches.find((b) => b.id === condition.branchId);
    }
  }
  return route.branches.find((b) => b.id === route.defaultBranchId);
}

export function evaluateCondition(
  condition: RouteCondition,
  data: Record<string, string | number>
): boolean {
  const fieldValue = data[condition.field];
  if (fieldValue === undefined || fieldValue === null) return false;
  switch (condition.operator) {
    case "gt":
      return Number(fieldValue) > Number(condition.value);
    case "gte":
      return Number(fieldValue) >= Number(condition.value);
    case "lt":
      return Number(fieldValue) < Number(condition.value);
    case "lte":
      return Number(fieldValue) <= Number(condition.value);
    case "eq":
      return String(fieldValue) === String(condition.value);
    case "in":
      return (condition.value as string[]).includes(String(fieldValue));
    case "contains":
      return String(fieldValue).includes(String(condition.value));
    default:
      return false;
  }
}

export const OPERATOR_LABELS: Record<string, string> = {
  gt: "大于",
  gte: "大于等于",
  lt: "小于",
  lte: "小于等于",
  eq: "等于",
  in: "属于",
  contains: "包含",
};

export const FIELD_LABELS: Record<string, string> = {
  scale: "展会规模(㎡)",
  type: "展会类型",
  expectedVisitors: "预计人流量",
  categories: "展会类别",
};
