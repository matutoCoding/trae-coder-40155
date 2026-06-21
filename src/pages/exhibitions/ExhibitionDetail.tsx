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
} from "lucide-react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import {
  EXHIBITION_STATUS_LABELS,
  APPROVAL_STATUS_LABELS,
} from "@/types";
import type { FireSafetyStatus, ExhibitionStatus } from "@/types";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

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
  const { exhibitions, halls, approvalRequests } = useStore();
  const exhibition = exhibitions.find((e) => e.id === id);

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

  const fireInfo = FIRE_STATUS[exhibition.fireSafetyStatus];
  const FireIcon = fireInfo.icon;

  return (
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
  );
}
