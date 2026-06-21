import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Building2 } from "lucide-react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import type { Exhibition } from "@/types";
import { cn } from "@/lib/utils";

const STEPS = ["基本信息", "展厅时段", "附件"];

const MOCK_ATTACHMENTS = ["展位规划图.pdf", "安保方案.docx", "消防预案.pdf"];

interface Form {
  name: string; organizer: string; scale: number; type: string;
  categories: string; expectedVisitors: number;
  hallIds: string[]; startDate: string; endDate: string;
}

const init: Form = {
  name: "", organizer: "", scale: 0, type: "",
  categories: "", expectedVisitors: 0,
  hallIds: [], startDate: "", endDate: "",
};

export default function ExhibitionForm() {
  const navigate = useNavigate();
  const { halls, addExhibition, addOccupancies } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(init);

  const set = (k: keyof Form, v: string | number | string[]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleHall = (id: string) =>
    setForm((f) => ({
      ...f,
      hallIds: f.hallIds.includes(id)
        ? f.hallIds.filter((h) => h !== id)
        : [...f.hallIds, id],
    }));

  const handleSubmit = () => {
    const id = `ex-${Date.now()}`;
    const categories = form.categories.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    const exhibition: Exhibition = {
      id, name: form.name, organizer: form.organizer,
      scale: form.scale, type: form.type, categories,
      expectedVisitors: form.expectedVisitors,
      hallIds: form.hallIds, startDate: form.startDate, endDate: form.endDate,
      status: "preparing", attachments: MOCK_ATTACHMENTS,
      fireSafetyStatus: "not_submitted",
    };
    addExhibition(exhibition);
    addOccupancies(
      form.hallIds.map((hid, i) => ({
        id: `occ-${Date.now()}-${i}`,
        hallId: hid, exhibitionId: id,
        title: `${form.name}`, type: "exhibition" as const,
        startDate: form.startDate, endDate: form.endDate,
        startTime: "09:00", endTime: "18:00", isAdjusted: false,
      }))
    );
    navigate(`/exhibitions/${id}`);
  };

  const canNext = () => {
    if (step === 0) return form.name && form.organizer && form.scale > 0;
    if (step === 1) return form.hallIds.length > 0 && form.startDate && form.endDate;
    return true;
  };

  const inputCls = "w-full px-3 py-2.5 bg-primary-dark rounded-lg text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-accent/50";

  return (
    <PageContainer>
      <PageHeader title="展会登记" showBack />

      <div className="px-4 mt-2">
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                i <= step ? "bg-accent text-primary-dark" : "bg-surface text-slate-500"
              )}>
                {i + 1}
              </div>
              <span className="text-[10px] text-slate-400">{label}</span>
            </div>
          ))}
          <div className="absolute" style={{ display: "none" }} />
        </div>
        <div className="h-0.5 bg-surface rounded-full mb-6 -mt-8 mx-8">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(step / 2) * 100}%` }} />
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {step === 0 && (
            <>
              <Field label="展会名称"><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="请输入" /></Field>
              <Field label="主办方"><input className={inputCls} value={form.organizer} onChange={(e) => set("organizer", e.target.value)} placeholder="请输入" /></Field>
              <Field label="规模(㎡)"><input type="number" className={inputCls} value={form.scale || ""} onChange={(e) => set("scale", +e.target.value)} placeholder="请输入" /></Field>
              <Field label="展会类型"><input className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)} placeholder="如：汽车、科技" /></Field>
              <Field label="类别(逗号分隔)"><input className={inputCls} value={form.categories} onChange={(e) => set("categories", e.target.value)} placeholder="汽车, 工业" /></Field>
              <Field label="预计人流量"><input type="number" className={inputCls} value={form.expectedVisitors || ""} onChange={(e) => set("expectedVisitors", +e.target.value)} placeholder="请输入" /></Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="选择展厅">
                <div className="space-y-2">
                  {halls.map((h) => (
                    <label key={h.id} className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                      form.hallIds.includes(h.id) ? "bg-accent/15 ring-1 ring-accent/50" : "bg-primary-dark"
                    )}>
                      <input type="checkbox" checked={form.hallIds.includes(h.id)} onChange={() => toggleHall(h.id)} className="accent-accent" />
                      <Building2 size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-200">{h.name}</span>
                      <span className="text-xs text-slate-500 ml-auto">{h.area}㎡</span>
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="开始日期"><input type="date" className={inputCls} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
              <Field label="结束日期"><input type="date" className={inputCls} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></Field>
            </>
          )}

          {step === 2 && (
            <Field label="附件列表">
              <div className="space-y-2">
                {MOCK_ATTACHMENTS.map((name) => (
                  <div key={name} className="flex items-center gap-2 px-3 py-2.5 bg-primary-dark rounded-lg">
                    <FileText size={14} className="text-accent" />
                    <span className="text-sm text-slate-300">{name}</span>
                  </div>
                ))}
              </div>
            </Field>
          )}
        </motion.div>

        <div className="flex gap-3 mt-8 pb-8">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-2.5 rounded-lg bg-surface text-slate-300 text-sm font-medium">上一步</button>
          )}
          {step < 2 ? (
            <button onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()} className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors",
              canNext() ? "bg-accent text-primary-dark" : "bg-surface text-slate-500"
            )}>下一步</button>
          ) : (
            <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-accent text-primary-dark text-sm font-medium">提交</button>
          )}
        </div>
      </div>
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
