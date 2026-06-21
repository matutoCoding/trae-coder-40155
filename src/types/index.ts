export interface Hall {
  id: string;
  name: string;
  area: number;
  height: number;
  loadBearing: number;
  location: string;
  facilities: string[];
  availableHours: { start: string; end: string };
  status: "available" | "occupied" | "maintenance";
}

export type OccupancyType = "investment_meeting" | "exhibition" | "setup" | "teardown" | "maintenance";

export interface Occupancy {
  id: string;
  hallId: string;
  exhibitionId?: string;
  title: string;
  type: OccupancyType;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  cycleRuleId?: string;
  contactPerson?: string;
  contactPhone?: string;
  isAdjusted: boolean;
}

export type CycleType = "weekly" | "biweekly" | "monthly";

export interface CycleRule {
  id: string;
  name: string;
  hallIds: string[];
  cycleType: CycleType;
  weekDays: number[];
  timeSlots: { start: string; end: string }[];
  startDate: string;
  endDate: string;
  skipHolidays: boolean;
  isActive: boolean;
  title: string;
  type: OccupancyType;
}

export type ConditionOperator = "gt" | "gte" | "lt" | "lte" | "eq" | "in" | "contains";

export interface RouteCondition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: string | number | string[];
  branchId: string;
}

export interface ApprovalNode {
  id: string;
  title: string;
  role: string;
  order: number;
}

export interface ApprovalBranch {
  id: string;
  name: string;
  nodes: ApprovalNode[];
}

export interface ApprovalRoute {
  id: string;
  name: string;
  conditions: RouteCondition[];
  branches: ApprovalBranch[];
  defaultBranchId: string;
}

export type ApprovalRequestStatus = "pending" | "approved" | "rejected" | "returned";
export type ApprovalType = "setup" | "fire_safety" | "other";
export type NodeStatus = "pending" | "approved" | "rejected" | "current";

export interface ApprovalNodeStatus {
  nodeId: string;
  title: string;
  role: string;
  status: NodeStatus;
  operator?: string;
  operatedAt?: string;
  comment?: string;
}

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  exhibitionId: string;
  exhibitionName: string;
  routeId: string;
  branchId: string;
  currentNodeIndex: number;
  status: ApprovalRequestStatus;
  nodes: ApprovalNodeStatus[];
  formData: Record<string, string | number>;
  createdAt: string;
  updatedAt: string;
}

export type ExhibitionStatus = "preparing" | "setup" | "running" | "teardown" | "ended";
export type FireSafetyStatus = "not_submitted" | "pending" | "approved" | "rejected";

export interface FireSafetyPlan {
  extinguisherCount: number;
  hydrantCount: number;
  evacuationRoutes: string[];
  emergencyContact: string;
  emergencyPhone: string;
  additionalMeasures: string;
}

export interface Exhibition {
  id: string;
  name: string;
  organizer: string;
  scale: number;
  type: string;
  categories: string[];
  expectedVisitors: number;
  hallIds: string[];
  startDate: string;
  endDate: string;
  status: ExhibitionStatus;
  attachments: string[];
  fireSafetyStatus: FireSafetyStatus;
  fireSafetyPlan?: FireSafetyPlan;
}

export const OCCUPANCY_TYPE_LABELS: Record<OccupancyType, string> = {
  investment_meeting: "招商例会",
  exhibition: "展会",
  setup: "布展",
  teardown: "撤展",
  maintenance: "维护",
};

export const OCCUPANCY_TYPE_COLORS: Record<OccupancyType, string> = {
  investment_meeting: "bg-accent/80",
  exhibition: "bg-blue-500/80",
  setup: "bg-purple-500/80",
  teardown: "bg-orange-500/80",
  maintenance: "bg-gray-500/80",
};

export const EXHIBITION_STATUS_LABELS: Record<ExhibitionStatus, string> = {
  preparing: "筹备中",
  setup: "布展中",
  running: "开展中",
  teardown: "撤展中",
  ended: "已结束",
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalRequestStatus, string> = {
  pending: "审批中",
  approved: "已通过",
  rejected: "已驳回",
  returned: "已退回",
};

export const HALL_STATUS_LABELS: Record<Hall["status"], string> = {
  available: "空闲",
  occupied: "占用",
  maintenance: "维护",
};
