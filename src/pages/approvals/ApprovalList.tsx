import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import { APPROVAL_STATUS_LABELS } from "@/types";
import type { ApprovalType } from "@/types";
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

export default function ApprovalList() {
  const navigate = useNavigate();
  const requests = useStore((s) => s.approvalRequests);
  const [tab, setTab] = useState<"pending" | "done">("pending");

  const pending = requests.filter((r) => r.status === "pending");
  const done = requests.filter((r) => r.status !== "pending");
  const list = tab === "pending" ? pending : done;

  return (
    <>
      <PageHeader
        title="审批中心"
        right={
          <button
            onClick={() => navigate("/routing/config")}
            className="p-2 rounded-full active:bg-white/10"
          >
            <Settings size={20} className="text-slate-400" />
          </button>
        }
      />
      <PageContainer>
        <div className="flex gap-1 p-1 mt-2 bg-surface rounded-xl">
          {(["pending", "done"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
                tab === t
                  ? "bg-accent text-primary-dark"
                  : "text-slate-400"
              )}
            >
              {t === "pending" ? `待办 (${pending.length})` : `已办 (${done.length})`}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {list.map((req) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/approvals/${req.id}`)}
                className="bg-surface rounded-xl p-4 active:bg-surface-light cursor-pointer border border-white/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-100 font-medium truncate">
                      {req.exhibitionName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {TYPE_LABELS[req.type]}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2",
                      STATUS_COLORS[req.status]
                    )}
                  >
                    {APPROVAL_STATUS_LABELS[req.status]}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {req.createdAt}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {list.length === 0 && (
          <div className="text-center text-slate-500 mt-20 text-sm">
            暂无{tab === "pending" ? "待办" : "已办"}审批
          </div>
        )}
      </PageContainer>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/approvals/new")}
        className="fixed bottom-24 right-6 w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/30 z-30"
      >
        <Plus size={24} className="text-primary-dark" />
      </motion.button>
    </>
  );
}
