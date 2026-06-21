import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Plus, X } from "lucide-react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import type { FireSafetyPlan, ApprovalRequest } from "@/types";
import { cn } from "@/lib/utils";
import { resolveBranch } from "@/utils/routeEngine";
import dayjs from "dayjs";

export default function FireSafetyForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { exhibitions, halls, approvalRoutes, addApprovalRequest, updateExhibition } = useStore();

  const exhibition = exhibitions.find((e) => e.id === id);
  const hallNames = exhibition
    ? exhibition.hallIds.map((hid) => halls.find((h) => h.id === hid)?.name).filter(Boolean).join("、")
    : "";

  const [extCount, setExtCount] = useState(0);
  const [hydCount, setHydCount] = useState(0);
  const [routes, setRoutes] = useState<string[]>([""]);
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [measures, setMeasures] = useState("");

  const addRoute = () => setRoutes([...routes, ""]);
  const removeRoute = (i: number) => setRoutes(routes.filter((_, idx) => idx !== i));
  const updateRoute = (i: number, v: string) =>
    setRoutes(routes.map((r, idx) => (idx === i ? v : r)));

  const handleSubmit = () => {
    if (!exhibition) return;

    const plan: FireSafetyPlan = {
      extinguisherCount: extCount,
      hydrantCount: hydCount,
      evacuationRoutes: routes.filter(Boolean),
      emergencyContact: contact,
      emergencyPhone: phone,
      additionalMeasures: measures,
    };

    const route = approvalRoutes.find((r) => r.id === "route-2");
    if (!route) return;

    const branch = resolveBranch(route, {});
    if (!branch) return;

    const today = dayjs().format("YYYY-MM-DD");
    const request: ApprovalRequest = {
      id: `apr-${Date.now()}`,
      type: "fire_safety",
      exhibitionId: exhibition.id,
      exhibitionName: exhibition.name,
      routeId: "route-2",
      branchId: branch.id,
      currentNodeIndex: 0,
      status: "pending",
      nodes: branch.nodes.map((n) => ({
        nodeId: n.id,
        title: n.title,
        role: n.role,
        status: "pending" as const,
      })),
      formData: { extinguisherCount: extCount, hydrantCount: hydCount },
      createdAt: today,
      updatedAt: today,
    };

    addApprovalRequest(request);
    updateExhibition(exhibition.id, {
      fireSafetyStatus: "pending",
      fireSafetyPlan: plan,
    });
    navigate(`/exhibitions/${exhibition.id}`);
  };

  const inputCls = "w-full px-3 py-2.5 bg-primary-dark rounded-lg text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-accent/50";
  const valid = extCount > 0 && hydCount > 0 && routes.some(Boolean) && contact && phone;

  if (!exhibition) {
    return (
      <PageContainer>
        <PageHeader title="消防报批" showBack />
        <div className="py-16 text-center text-sm text-slate-500">展会不存在</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="消防报批" showBack />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-4 space-y-4 mt-2">
        <div className="bg-surface rounded-xl p-4 space-y-1.5">
          <h3 className="font-serif font-semibold text-slate-100 text-[15px]">{exhibition.name}</h3>
          <div className="text-xs text-slate-400">
            <span>展厅：{hallNames}</span>
            <span className="ml-4">{dayjs(exhibition.startDate).format("MM/DD")} - {dayjs(exhibition.endDate).format("MM/DD")}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-accent">
          <Shield size={16} />
          <span className="text-sm font-medium">消防方案信息</span>
        </div>

        <Field label="灭火器数量">
          <input type="number" className={inputCls} value={extCount || ""} onChange={(e) => setExtCount(+e.target.value)} placeholder="请输入" />
        </Field>
        <Field label="消防栓数量">
          <input type="number" className={inputCls} value={hydCount || ""} onChange={(e) => setHydCount(+e.target.value)} placeholder="请输入" />
        </Field>

        <Field label="疏散通道">
          <div className="space-y-2">
            {routes.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className={cn(inputCls, "flex-1")} value={r} onChange={(e) => updateRoute(i, e.target.value)} placeholder={`疏散通道 ${i + 1}`} />
                {routes.length > 1 && (
                  <button onClick={() => removeRoute(i)} className="p-2 text-red-400"><X size={16} /></button>
                )}
              </div>
            ))}
            <button onClick={addRoute} className="flex items-center gap-1 text-xs text-accent py-1">
              <Plus size={12} /> 添加通道
            </button>
          </div>
        </Field>

        <Field label="紧急联系人">
          <input className={inputCls} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="请输入姓名" />
        </Field>
        <Field label="紧急联系电话">
          <input type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入电话" />
        </Field>
        <Field label="附加措施">
          <textarea className={cn(inputCls, "min-h-[80px] resize-none")} value={measures} onChange={(e) => setMeasures(e.target.value)} placeholder="请描述附加消防措施" />
        </Field>

        <button
          onClick={handleSubmit}
          disabled={!valid}
          className={cn(
            "w-full py-3 rounded-lg text-sm font-medium mt-4 mb-8 transition-colors",
            valid ? "bg-accent text-primary-dark" : "bg-surface text-slate-500"
          )}
        >
          提交审批
        </button>
      </motion.div>
    </PageContainer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}
