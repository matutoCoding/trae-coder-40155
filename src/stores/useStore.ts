import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Hall,
  Occupancy,
  CycleRule,
  ApprovalRoute,
  ApprovalRequest,
  Exhibition,
} from "@/types";

interface AppState {
  halls: Hall[];
  occupancies: Occupancy[];
  cycleRules: CycleRule[];
  approvalRoutes: ApprovalRoute[];
  approvalRequests: ApprovalRequest[];
  exhibitions: Exhibition[];

  addHall: (hall: Hall) => void;
  updateHall: (id: string, hall: Partial<Hall>) => void;

  addOccupancy: (occupancy: Occupancy) => void;
  addOccupancies: (occupancies: Occupancy[]) => void;
  updateOccupancy: (id: string, data: Partial<Occupancy>) => void;
  deleteOccupancy: (id: string) => void;

  addCycleRule: (rule: CycleRule) => void;
  updateCycleRule: (id: string, data: Partial<CycleRule>) => void;

  addApprovalRoute: (route: ApprovalRoute) => void;
  updateApprovalRoute: (id: string, data: Partial<ApprovalRoute>) => void;

  addApprovalRequest: (request: ApprovalRequest) => void;
  updateApprovalRequest: (id: string, data: Partial<ApprovalRequest>) => void;

  addExhibition: (exhibition: Exhibition) => void;
  updateExhibition: (id: string, data: Partial<Exhibition>) => void;
}

const defaultHalls: Hall[] = [
  {
    id: "hall-1",
    name: "A1展厅",
    area: 12000,
    height: 12,
    loadBearing: 5,
    location: "A区一层",
    facilities: ["水电接口", "网络", "消防栓", "空调"],
    availableHours: { start: "08:00", end: "22:00" },
    status: "occupied",
  },
  {
    id: "hall-2",
    name: "A2展厅",
    area: 8000,
    height: 10,
    loadBearing: 3,
    location: "A区二层",
    facilities: ["水电接口", "网络", "消防栓"],
    availableHours: { start: "08:00", end: "22:00" },
    status: "available",
  },
  {
    id: "hall-3",
    name: "B1展厅",
    area: 15000,
    height: 15,
    loadBearing: 8,
    location: "B区一层",
    facilities: ["水电接口", "网络", "消防栓", "空调", "货梯"],
    availableHours: { start: "07:00", end: "23:00" },
    status: "occupied",
  },
  {
    id: "hall-4",
    name: "B2展厅",
    area: 6000,
    height: 8,
    loadBearing: 2,
    location: "B区二层",
    facilities: ["水电接口", "网络"],
    availableHours: { start: "08:00", end: "20:00" },
    status: "maintenance",
  },
  {
    id: "hall-5",
    name: "C1多功能厅",
    area: 3000,
    height: 6,
    loadBearing: 1.5,
    location: "C区一层",
    facilities: ["水电接口", "网络", "音响", "投影"],
    availableHours: { start: "08:00", end: "22:00" },
    status: "available",
  },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const defaultOccupancies: Occupancy[] = [
  {
    id: "occ-1",
    hallId: "hall-1",
    exhibitionId: "ex-1",
    title: "国际汽车博览会",
    type: "exhibition",
    startDate: fmt(addDays(today, 3)),
    endDate: fmt(addDays(today, 6)),
    startTime: "09:00",
    endTime: "18:00",
    contactPerson: "张经理",
    contactPhone: "13800138001",
    isAdjusted: false,
  },
  {
    id: "occ-2",
    hallId: "hall-1",
    exhibitionId: "ex-1",
    title: "汽车博览会布展",
    type: "setup",
    startDate: fmt(addDays(today, 1)),
    endDate: fmt(addDays(today, 2)),
    startTime: "08:00",
    endTime: "20:00",
    isAdjusted: false,
  },
  {
    id: "occ-3",
    hallId: "hall-3",
    exhibitionId: "ex-2",
    title: "智能制造峰会",
    type: "exhibition",
    startDate: fmt(addDays(today, 5)),
    endDate: fmt(addDays(today, 7)),
    startTime: "09:00",
    endTime: "17:00",
    contactPerson: "李总",
    contactPhone: "13900139002",
    isAdjusted: false,
  },
  {
    id: "occ-4",
    hallId: "hall-1",
    cycleRuleId: "rule-1",
    title: "招商例会",
    type: "investment_meeting",
    startDate: fmt(today),
    endDate: fmt(today),
    startTime: "09:00",
    endTime: "12:00",
    isAdjusted: false,
  },
  {
    id: "occ-5",
    hallId: "hall-2",
    exhibitionId: "ex-3",
    title: "文创市集",
    type: "exhibition",
    startDate: fmt(addDays(today, 2)),
    endDate: fmt(addDays(today, 4)),
    startTime: "10:00",
    endTime: "20:00",
    contactPerson: "王女士",
    contactPhone: "13700137003",
    isAdjusted: false,
  },
  {
    id: "occ-6",
    hallId: "hall-3",
    exhibitionId: "ex-2",
    title: "智能制造峰会布展",
    type: "setup",
    startDate: fmt(addDays(today, 3)),
    endDate: fmt(addDays(today, 4)),
    startTime: "08:00",
    endTime: "20:00",
    isAdjusted: false,
  },
];

const defaultCycleRules: CycleRule[] = [
  {
    id: "rule-1",
    name: "A1招商例会",
    hallIds: ["hall-1"],
    cycleType: "weekly",
    weekDays: [3],
    timeSlots: [{ start: "09:00", end: "12:00" }],
    startDate: fmt(addDays(today, -30)),
    endDate: fmt(addDays(today, 90)),
    skipHolidays: true,
    isActive: true,
    title: "招商例会",
    type: "investment_meeting",
  },
  {
    id: "rule-2",
    name: "B1场地维护",
    hallIds: ["hall-3"],
    cycleType: "biweekly",
    weekDays: [1],
    timeSlots: [{ start: "08:00", end: "10:00" }],
    startDate: fmt(addDays(today, -14)),
    endDate: fmt(addDays(today, 60)),
    skipHolidays: false,
    isActive: true,
    title: "场地维护",
    type: "maintenance",
  },
];

const defaultApprovalRoutes: ApprovalRoute[] = [
  {
    id: "route-1",
    name: "布展审批路由",
    conditions: [
      {
        id: "cond-1",
        field: "scale",
        operator: "gt",
        value: 5000,
        branchId: "branch-1a",
      },
      {
        id: "cond-2",
        field: "type",
        operator: "in",
        value: ["危险化学品", "烟花炮竹"],
        branchId: "branch-1c",
      },
    ],
    branches: [
      {
        id: "branch-1a",
        name: "大型展会分支",
        nodes: [
          { id: "n1a-1", title: "运营主管审核", role: "运营主管", order: 1 },
          { id: "n1a-2", title: "运营总监审批", role: "运营总监", order: 2 },
          { id: "n1a-3", title: "总经理批准", role: "总经理", order: 3 },
        ],
      },
      {
        id: "branch-1b",
        name: "常规展会分支",
        nodes: [
          { id: "n1b-1", title: "运营主管审核", role: "运营主管", order: 1 },
          { id: "n1b-2", title: "运营总监审批", role: "运营总监", order: 2 },
        ],
      },
      {
        id: "branch-1c",
        name: "涉危展会分支",
        nodes: [
          { id: "n1c-1", title: "运营主管审核", role: "运营主管", order: 1 },
          { id: "n1c-2", title: "消防负责人审批", role: "消防负责人", order: 2 },
          { id: "n1c-3", title: "运营总监审批", role: "运营总监", order: 3 },
        ],
      },
    ],
    defaultBranchId: "branch-1b",
  },
  {
    id: "route-2",
    name: "消防报批路由",
    conditions: [],
    branches: [
      {
        id: "branch-2a",
        name: "消防审批",
        nodes: [
          { id: "n2a-1", title: "消防负责人审核", role: "消防负责人", order: 1 },
          { id: "n2a-2", title: "运营总监确认", role: "运营总监", order: 2 },
        ],
      },
    ],
    defaultBranchId: "branch-2a",
  },
];

const defaultApprovalRequests: ApprovalRequest[] = [
  {
    id: "apr-1",
    type: "setup",
    exhibitionId: "ex-1",
    exhibitionName: "国际汽车博览会",
    routeId: "route-1",
    branchId: "branch-1a",
    currentNodeIndex: 1,
    status: "pending",
    nodes: [
      { nodeId: "n1a-1", title: "运营主管审核", role: "运营主管", status: "approved", operator: "陈主管", operatedAt: fmt(addDays(today, -1)) },
      { nodeId: "n1a-2", title: "运营总监审批", role: "运营总监", status: "current" },
      { nodeId: "n1a-3", title: "总经理批准", role: "总经理", status: "pending" },
    ],
    formData: { scale: 12000, type: "汽车" },
    createdAt: fmt(addDays(today, -2)),
    updatedAt: fmt(addDays(today, -1)),
  },
  {
    id: "apr-2",
    type: "fire_safety",
    exhibitionId: "ex-2",
    exhibitionName: "智能制造峰会",
    routeId: "route-2",
    branchId: "branch-2a",
    currentNodeIndex: 0,
    status: "pending",
    nodes: [
      { nodeId: "n2a-1", title: "消防负责人审核", role: "消防负责人", status: "current" },
      { nodeId: "n2a-2", title: "运营总监确认", role: "运营总监", status: "pending" },
    ],
    formData: {},
    createdAt: fmt(today),
    updatedAt: fmt(today),
  },
];

const defaultExhibitions: Exhibition[] = [
  {
    id: "ex-1",
    name: "国际汽车博览会",
    organizer: "东方会展集团",
    scale: 12000,
    type: "汽车",
    categories: ["汽车", "工业"],
    expectedVisitors: 50000,
    hallIds: ["hall-1"],
    startDate: fmt(addDays(today, 3)),
    endDate: fmt(addDays(today, 6)),
    status: "preparing",
    attachments: ["展位规划图.pdf", "安保方案.docx"],
    fireSafetyStatus: "approved",
    fireSafetyPlan: {
      extinguisherCount: 120,
      hydrantCount: 30,
      evacuationRoutes: ["A1东门", "A1西门", "A1南门"],
      emergencyContact: "赵消防",
      emergencyPhone: "13600136001",
      additionalMeasures: "增设4处临时消防站",
    },
  },
  {
    id: "ex-2",
    name: "智能制造峰会",
    organizer: "科技产业联盟",
    scale: 6000,
    type: "科技",
    categories: ["智能制造", "AI"],
    expectedVisitors: 20000,
    hallIds: ["hall-3"],
    startDate: fmt(addDays(today, 5)),
    endDate: fmt(addDays(today, 7)),
    status: "preparing",
    attachments: ["布展方案.pdf"],
    fireSafetyStatus: "pending",
  },
  {
    id: "ex-3",
    name: "文创市集",
    organizer: "文创协会",
    scale: 2000,
    type: "文创",
    categories: ["文创", "艺术"],
    expectedVisitors: 8000,
    hallIds: ["hall-2"],
    startDate: fmt(addDays(today, 2)),
    endDate: fmt(addDays(today, 4)),
    status: "preparing",
    attachments: [],
    fireSafetyStatus: "not_submitted",
  },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      halls: defaultHalls,
      occupancies: defaultOccupancies,
      cycleRules: defaultCycleRules,
      approvalRoutes: defaultApprovalRoutes,
      approvalRequests: defaultApprovalRequests,
      exhibitions: defaultExhibitions,

      addHall: (hall) => set((s) => ({ halls: [...s.halls, hall] })),
      updateHall: (id, data) =>
        set((s) => ({
          halls: s.halls.map((h) => (h.id === id ? { ...h, ...data } : h)),
        })),

      addOccupancy: (occupancy) =>
        set((s) => ({ occupancies: [...s.occupancies, occupancy] })),
      addOccupancies: (ocs) =>
        set((s) => ({ occupancies: [...s.occupancies, ...ocs] })),
      updateOccupancy: (id, data) =>
        set((s) => ({
          occupancies: s.occupancies.map((o) =>
            o.id === id ? { ...o, ...data } : o
          ),
        })),
      deleteOccupancy: (id) =>
        set((s) => ({
          occupancies: s.occupancies.filter((o) => o.id !== id),
        })),

      addCycleRule: (rule) =>
        set((s) => ({ cycleRules: [...s.cycleRules, rule] })),
      updateCycleRule: (id, data) =>
        set((s) => ({
          cycleRules: s.cycleRules.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      addApprovalRoute: (route) =>
        set((s) => ({ approvalRoutes: [...s.approvalRoutes, route] })),
      updateApprovalRoute: (id, data) =>
        set((s) => ({
          approvalRoutes: s.approvalRoutes.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      addApprovalRequest: (request) =>
        set((s) => ({
          approvalRequests: [...s.approvalRequests, request],
        })),
      updateApprovalRequest: (id, data) =>
        set((s) => ({
          approvalRequests: s.approvalRequests.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      addExhibition: (exhibition) =>
        set((s) => ({ exhibitions: [...s.exhibitions, exhibition] })),
      updateExhibition: (id, data) =>
        set((s) => ({
          exhibitions: s.exhibitions.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        })),
    }),
    { name: "expo-venue-store" }
  )
);
