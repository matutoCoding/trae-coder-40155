import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import { resolveBranch } from "@/utils/routeEngine";
import type { ApprovalType, ApprovalNodeStatus } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: { value: ApprovalType; label: string }[] = [
  { value: "setup", label: "布展申请" },
  { value: "fire_safety", label: "消防报批" },
];

export default function ApprovalNew() {
  const navigate = useNavigate();
  const exhibitions = useStore((s) => s.exhibitions);
  const routes = useStore((s) => s.approvalRoutes);
  const addRequest = useStore((s) => s.addApprovalRequest);

  const [step, setStep] = useState(0);
  const [exhibitionId, setExhibitionId] = useState("");
  const [approvalType, setApprovalType] = useState<ApprovalType>("setup");
  const [form, setForm] = useState<Record<string, string | number>>({});

  const selected = exhibitions.find((e) => e.id === exhibitionId);
  const routeId = approvalType === "setup" ? "route-1" : "route-2";
  const route = routes.find((r) => r.id === routeId);

  const handleSubmit = () => {
    if (!selected || !route) return;
    const formData = { ...form, scale: selected.scale, type: selected.type };
    const branch = resolveBranch(route, formData);
    if (!branch) return;

    const now = new Date().toISOString().split("T")[0];
    const nodes: ApprovalNodeStatus[] = branch.nodes.map((n, i) => ({
      nodeId: n.id,
      title: n.title,
      role: n.role,
      status: i === 0 ? "current" as const : "pending" as const,
    }));

    const id = `apr-${Date.now()}`;
    addRequest({
      id,
      type: approvalType,
      exhibitionId: selected.id,
      exhibitionName: selected.name,
      routeId: route.id,
      branchId: branch.id,
      currentNodeIndex: 0,
      status: "pending",
      nodes,
      formData,
      createdAt: now,
      updatedAt: now,
    });
    navigate(`/approvals/${id}`);
  };

  return (
    <>
      <PageHeader title="新建审批" showBack />
      <PageContainer>
        <div className="flex items-center gap-2 mt-4 mb-6">
          {[0, 1].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  step > s
                    ? "bg-success text-white"
                    : step === s
                    ? "bg-accent text-primary-dark"
                    : "bg-surface text-slate-500"
                )}
              >
                {step > s ? <Check size={14} /> : s + 1}
              </div>
              {s === 0 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    step > 0 ? "bg-success" : "bg-surface"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">选择展会</label>
                <select
                  value={exhibitionId}
                  onChange={(e) => setExhibitionId(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none focus:border-accent/50"
                >
                  <option value="">请选择展会</option>
                  {exhibitions.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">审批类型</label>
                <div className="flex gap-3">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setApprovalType(opt.value)}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-medium border transition-colors",
                        approvalType === opt.value
                          ? "bg-accent/15 border-accent text-accent"
                          : "bg-surface border-white/10 text-slate-400"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                disabled={!exhibitionId}
                onClick={() => setStep(1)}
                className="w-full mt-6 py-3 bg-accent text-primary-dark font-semibold rounded-xl disabled:opacity-40 transition-opacity"
              >
                下一步
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {approvalType === "setup" && (
                <>
                  <Field label="布展规模(㎡)" value={form.scale ?? ""} onChange={(v) => setForm({ ...form, scale: Number(v) || 0 })} />
                  <Field label="布展类型" value={form.setupType ?? ""} onChange={(v) => setForm({ ...form, setupType: v })} placeholder="如：标准展位/特装" />
                  <Field label="布展说明" value={form.description ?? ""} onChange={(v) => setForm({ ...form, description: v })} textarea />
                </>
              )}
              {approvalType === "fire_safety" && (
                <>
                  <Field label="灭火器数量" value={form.extinguisherCount ?? ""} onChange={(v) => setForm({ ...form, extinguisherCount: Number(v) || 0 })} />
                  <Field label="消防栓数量" value={form.hydrantCount ?? ""} onChange={(v) => setForm({ ...form, hydrantCount: Number(v) || 0 })} />
                  <Field label="疏散路线" value={form.evacuationRoutes ?? ""} onChange={(v) => setForm({ ...form, evacuationRoutes: v })} placeholder="多个路线用逗号分隔" />
                  <Field label="应急联系人" value={form.emergencyContact ?? ""} onChange={(v) => setForm({ ...form, emergencyContact: v })} />
                  <Field label="应急联系电话" value={form.emergencyPhone ?? ""} onChange={(v) => setForm({ ...form, emergencyPhone: v })} />
                  <Field label="补充措施" value={form.additionalMeasures ?? ""} onChange={(v) => setForm({ ...form, additionalMeasures: v })} textarea />
                </>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 py-3 bg-surface text-slate-300 font-medium rounded-xl border border-white/10"
                >
                  上一步
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-accent text-primary-dark font-semibold rounded-xl"
                >
                  提交审批
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </PageContainer>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const cls = "w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none focus:border-accent/50 resize-none";
  return (
    <div>
      <label className="text-sm text-slate-400 mb-1.5 block">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}
