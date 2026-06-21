import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Calendar,
  Users,
  Shield,
  FileText,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  CalendarDays,
  Clock as ClockIcon,
} from "lucide-react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import {
  EXHIBITION_STATUS_LABELS,
  APPROVAL_STATUS_LABELS,
  OCCUPANCY_TYPE_LABELS,
  OCCUPANCY_TYPE_COLORS,
} from "@/types";
import type { FireSafetyStatus, ExhibitionStatus, Occupancy } from "@/types";
import { checkTimeConflict } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";

const STATUS_COLORS: Record<ExhibitionStatus, string> = {
  preparing: "bg-blue-500/20 text-blue-300",
  setup: "bg-purple-500/20 text-purple-300",
  running: "bg-green-500/20 text-green-300",
  teardown: "bg-orange-500/20 text-orange-300",
  ended: "bg-gray-500/20 text-gray-300",
};

const FIRE_STATUS: Record<
  FireSafetyStatus,
  { label: string; icon: typeof CheckCircle; color: string }
> = {
  approved: { label: "消防已通过", icon: CheckCircle, color: "text-green-400" },
  pending: { label: "消防审批中", icon: Clock, color: "text-yellow-400" },
  rejected: { label: "消防已驳回", icon: XCircle, color: "text-red-400" },
  not_submitted: { label: "未提交消防报批", icon: AlertCircle, color: "text-slate-500" },
};

export default function ExhibitionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    exhibitions,
    halls,
    approvalRequests,
    occupancies,
    updateOccupancy,
  } = useStore();
  const exhibition = exhibitions.find((e) => e.id === id);

  const [editingOcc, setEditingOcc] = useState<Occupancy | null>(null);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  if (!exhibition) {
    return (
      <PageContainer>
        <PageHeader title="展会详情" showBack />
        <div className="flex items-center justify-center h-64 text-slate-500">
          未找到展会信息
        </div>
      </PageContainer>
    );
  }

  const hallNames = exhibition.hallIds
    .map((hid) => halls.find((h) => h.id === hid)?.name)
    .filter(Boolean)
    .join("、");

  const relatedApprovals = approvalRequests.filter(
    (a) => a.exhibitionId === exhibition.id
  );

  const relatedOccupancies = occupancies.filter(
    (o) => o.exhibitionId === exhibition.id
  );

  const fireInfo = FIRE_STATUS[exhibition.fireSafetyStatus];
  const FireIcon = fireInfo.icon;

  const hallMap = Object.fromEntries(halls.map((h) => [h.id, h.name]));

  const handleEditOcc = (occ: Occupancy) => {
    setEditingOcc(occ);
    setEditStartDate(occ.startDate);
    setEditEndDate(occ.endDate);
    setEditStartTime(occ.startTime);
    setEditEndTime(occ.endTime);
    setEditError(null);
  };

  const handleSaveOcc = () => {
    if (!editingOcc) return;
    setEditError(null);

    const conflict = checkTimeConflict(
      editingOcc.hallId,
      editStartDate,
      editEndDate,
      editStartTime,
      editEndTime,
      occupancies,
      editingOcc.id
    );

    if (conflict) {
      setEditError(
        `与「${conflict.title}」(${conflict.startDate} ${conflict.startTime}-${conflict.endTime}) 存在时段重叠，无法保存`
      );
      return;
    }

    updateOccupancy(editingOcc.id, {
      startDate: editStartDate,
      endDate: editEndDate,
      startTime: editStartTime,
      endTime: editEndTime,
      isAdjusted: true,
    });
    setEditingOcc(null);
  };

  return (
    <>
      <PageContainer>
        <PageHeader title="展会详情" showBack />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 mt-2"
      >
        <div className="bg-surface rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h2 className="font-serif text-lg font-semibold text-slate-100">
              {exhibition.name}
            </h2>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-medium shrink-0",
                STATUS_COLORS[exhibition.status]
              )}
            >
              {EXHIBITION_STATUS_LABELS[exhibition.status]}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Building2 size={14} />
              <span className="text-slate-300">主办方：{exhibition.organizer}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={14} />
              <span className="text-slate-300">
                {dayjs(exhibition.startDate).format("YYYY/MM/DD")} — {dayjs(exhibition.endDate).format("YYYY/MM/DD")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Users size={14} />
              <span className="text-slate-300">
                {exhibition.scale.toLocaleString()}㎡ · 预计{exhibition.expectedVisitors.toLocaleString()}人
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            展厅与类别
          </h3>
          <div className="flex flex-wrap gap-2">
            {exhibition.hallIds.map((hid) => {
              const hall = halls.find((h) => h.id === hid);
              return hall ? (
                <span
                  key={hid}
                  className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-xs font-medium"
                >
                  {hall.name}
                </span>
              ) : null;
            })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {exhibition.categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded bg-surface-light text-slate-400 text-[11px]"
              >
                {cat}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded bg-surface-light text-slate-400 text-[11px]">
              {exhibition.type}
            </span>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            消防安全
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FireIcon size={16} className={fireInfo.color} />
              <span className="text-sm text-slate-300">{fireInfo.label}</span>
            </div>
            {exhibition.fireSafetyStatus === "not_submitted" && (
              <button
                onClick={() => navigate(`/fire-safety/${exhibition.id}`)}
                className="flex items-center gap-1 text-xs text-accent font-medium active:opacity-70"
              >
                <Shield size={14} />
                去报批
                <ChevronRight size={14} />
              </button>
            )}
            {(exhibition.fireSafetyStatus === "pending" || exhibition.fireSafetyStatus === "rejected") && (
              <button
                onClick={() => navigate(`/fire-safety/${exhibition.id}`)}
                className="flex items-center gap-1 text-xs text-accent font-medium active:opacity-70"
              >
                <Shield size={14} />
                重新提交
                <ChevronRight size={14} />
              </button>
            )}
          </div>
          {exhibition.fireSafetyPlan && (
            <div className="mt-2 pt-2 border-t border-white/5 space-y-1 text-xs text-slate-400">
              <div>灭火器：{exhibition.fireSafetyPlan.extinguisherCount}个</div>
              <div>消防栓：{exhibition.fireSafetyPlan.hydrantCount}个</div>
              <div>疏散通道：{exhibition.fireSafetyPlan.evacuationRoutes.join("、")}</div>
              <div>紧急联系：{exhibition.fireSafetyPlan.emergencyContact} {exhibition.fireSafetyPlan.emergencyPhone}</div>
            </div>
          )}
        </div>

        <div className="bg-surface rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            关联排期
          </h3>
          {relatedOccupancies.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              暂无排期记录
            </p>
          ) : (
            <div className="space-y-2">
              {relatedOccupancies.map((occ) => {
                const hasConflict = checkTimeConflict(
                  occ.hallId,
                  occ.startDate,
                  occ.endDate,
                  occ.startTime,
                  occ.endTime,
                  occupancies,
                  occ.id
                );
                return (
                  <motion.div
                    key={occ.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "bg-primary-dark rounded-lg p-3 cursor-pointer active:bg-surface-light transition-colors",
                      hasConflict && "border border-danger/40"
                    )}
                    onClick={() => handleEditOcc(occ)}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-[10px] font-medium text-white px-1.5 py-0.5 rounded",
                            OCCUPANCY_TYPE_COLORS[occ.type]
                          )}
                        >
                          {OCCUPANCY_TYPE_LABELS[occ.type]}
                        </span>
                        {hasConflict && (
                          <AlertCircle size={11} className="text-danger" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {hallMap[occ.hallId] ?? occ.hallId}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 font-medium truncate">
                      {occ.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={10} />
                        {dayjs(occ.startDate).format("MM-DD")}
                        {occ.endDate !== occ.startDate &&
                          ` ~ ${dayjs(occ.endDate).format("MM-DD")}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClockIcon size={10} />
                        {occ.startTime}-{occ.endTime}
                      </span>
                    </div>
                    {hasConflict && (
                      <p className="text-[10px] text-danger mt-1.5">
                        ⚠ 与其他排期时段重叠
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
          <p className="text-[10px] text-slate-500 text-center">
            点击可调整单条排期
          </p>
        </div>

        {exhibition.attachments.length > 0 && (
          <div className="bg-surface rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              附件
            </h3>
            <div className="space-y-2">
              {exhibition.attachments.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 px-3 py-2 bg-primary-dark rounded-lg"
                >
                  <FileText size={14} className="text-accent" />
                  <span className="text-sm text-slate-300">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedApprovals.length > 0 && (
          <div className="bg-surface rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              关联审批
            </h3>
            <div className="space-y-2">
              {relatedApprovals.map((apr) => (
                <div
                  key={apr.id}
                  onClick={() => navigate(`/approvals/${apr.id}`)}
                  className="flex items-center justify-between px-3 py-2.5 bg-primary-dark rounded-lg cursor-pointer active:bg-surface-light"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300">
                      {apr.type === "setup" ? "布展申请" : apr.type === "fire_safety" ? "消防报批" : "其他"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        apr.status === "pending"
                          ? "bg-accent/20 text-accent"
                          : apr.status === "approved"
                            ? "bg-success/20 text-success"
                            : "bg-danger/20 text-danger"
                      )}
                    >
                      {APPROVAL_STATUS_LABELS[apr.status]}
                    </span>
                    <ChevronRight size={14} className="text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </PageContainer>

    <BottomSheet
      open={editingOcc !== null}
      onClose={() => setEditingOcc(null)}
      title="调整排期"
    >
      {editingOcc && (
        <div className="space-y-4">
          <div className="bg-surface-light rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-medium text-white px-1.5 py-0.5 rounded",
                  OCCUPANCY_TYPE_COLORS[editingOcc.type]
                )}
              >
                {OCCUPANCY_TYPE_LABELS[editingOcc.type]}
              </span>
              <span className="text-sm text-slate-200 font-medium">
                {editingOcc.title}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              展厅：{hallMap[editingOcc.hallId] ?? editingOcc.hallId}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1.5">
                开始日期
              </label>
              <input
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-accent/40"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1.5">
                结束日期
              </label>
              <input
                type="date"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-accent/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1.5">
                开始时间
              </label>
              <input
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-accent/40"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1.5">
                结束时间
              </label>
              <input
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-accent/40"
              />
            </div>
          </div>

          {editError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-danger/15 border border-danger/30 rounded-lg px-3 py-2 text-xs text-danger flex items-start gap-2"
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{editError}</span>
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setEditingOcc(null)}
              className="flex-1 py-3 bg-surface-light text-slate-300 rounded-xl font-medium text-sm border border-white/10 active:bg-surface"
            >
              取消
            </button>
            <button
              onClick={handleSaveOcc}
              className="flex-1 py-3 bg-accent text-primary-dark rounded-xl font-semibold text-sm active:bg-accent-light"
            >
              保存调整
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
    </>
  );
}
