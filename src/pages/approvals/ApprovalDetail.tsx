import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import { APPROVAL_STATUS_LABELS } from "@/types";
import type { ApprovalType, ApprovalNodeStatus } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<ApprovalType, string> = {
  setup: "布展申请",
  fire_safety: "消防报批",
  other: "其他",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-accent/20 text-accent",
  approved: "bg-success/20 text-success",
  rejected: "bg-danger/20 text-danger",
  returned: "bg-warning/20 text-warning",
};

export default function ApprovalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const requests = useStore((s) => s.approvalRequests);
  const updateRequest = useStore((s) => s.updateApprovalRequest);
  const req = requests.find((r) => r.id === id);
  if (!req) return <PageHeader title="未找到" showBack />;

  const hasCurrent = req.nodes.some((n) => n.status === "current");

  const handleApprove = () => {
    const idx = req.nodes.findIndex((n) => n.status === "current");
    if (idx === -1) return;
    const now = new Date().toISOString().split("T")[0];
    const newNodes = req.nodes.map((n, i) => {
      if (i === idx) return { ...n, status: "approved" as const, operator: "当前用户", operatedAt: now };
      if (i === idx + 1) return { ...n, status: "current" as const };
      return n;
    });
    const allDone = !newNodes.some((n) => n.status === "pending" || n.status === "current");
    updateRequest(req.id, {
      nodes: newNodes,
      currentNodeIndex: idx + 1,
      status: allDone ? "approved" : "pending",
      updatedAt: now,
    });
  };

  const handleReject = () => {
    const now = new Date().toISOString().split("T")[0];
    const idx = req.nodes.findIndex((n) => n.status === "current");
    const newNodes = req.nodes.map((n, i) =>
      i === idx ? { ...n, status: "rejected" as const, operator: "当前用户", operatedAt: now } : n
    );
    updateRequest(req.id, { nodes: newNodes, status: "rejected", updatedAt: now });
  };

  return (
    <>
      <PageHeader title="审批详情" showBack />
      <PageContainer className="pb-28">
        <div className="bg-surface rounded-xl p-4 mt-2 border border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-100 font-semibold text-base">{req.exhibitionName}</h2>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[req.status])}>
              {APPROVAL_STATUS_LABELS[req.status]}
            </span>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-slate-400">
            <span>{TYPE_LABELS[req.type]}</span>
            <span>{req.createdAt}</span>
          </div>
        </div>

        <h3 className="text-sm font-medium text-slate-300 mt-6 mb-4">审批流程</h3>
        <div className="relative pl-6">
          {req.nodes.map((node, i) => (
            <TimelineNode key={node.nodeId} node={node} isLast={i === req.nodes.length - 1} delay={i * 0.1} />
          ))}
        </div>
      </PageContainer>

      {hasCurrent && req.status === "pending" && (
        <div className="fixed bottom-0 left-0 right-0 z-30 max-w-[430px] mx-auto">
          <div className="bg-primary-dark/95 backdrop-blur-lg border-t border-white/10 px-4 py-3 safe-bottom flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReject}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-danger/15 text-danger rounded-xl font-medium text-sm border border-danger/20"
            >
              <X size={16} /> 驳回
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleApprove}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-primary-dark rounded-xl font-semibold text-sm"
            >
              <Check size={16} /> 同意
            </motion.button>
          </div>
        </div>
      )}
    </>
  );
}

function TimelineNode({
  node,
  isLast,
  delay,
}: {
  node: ApprovalNodeStatus;
  isLast: boolean;
  delay: number;
}) {
  const isApproved = node.status === "approved";
  const isCurrent = node.status === "current";
  const isRejected = node.status === "rejected";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative pb-6"
    >
      {!isLast && (
        <div className={cn(
          "absolute left-[-21px] top-6 w-0.5 h-full",
          isApproved ? "bg-success/40" : "bg-surface-light/60"
        )} />
      )}

      <div className={cn(
        "absolute left-[-26px] top-0.5 w-[10px] h-[10px] rounded-full",
        isApproved && "bg-success",
        isCurrent && "bg-accent animate-pulse-gold",
        isRejected && "bg-danger",
        node.status === "pending" && "bg-slate-600"
      )} />

      {isApproved && (
        <div className="absolute left-[-28px] top-[-1px]">
          <Check size={14} className="text-success" />
        </div>
      )}

      <div className={cn(
        "bg-surface rounded-xl p-3 border",
        isCurrent ? "border-accent/30" : "border-white/5"
      )}>
        <p className={cn(
          "text-sm font-medium",
          isCurrent ? "text-accent" : isApproved ? "text-slate-200" : "text-slate-500"
        )}>
          {node.title}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
          <span>{node.role}</span>
          {node.operator && <span className="text-slate-400">{node.operator}</span>}
          {node.operatedAt && <span>{node.operatedAt}</span>}
        </div>
      </div>
    </motion.div>
  );
}
