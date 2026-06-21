import { useState } from "react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import { OCCUPANCY_TYPE_LABELS } from "@/types";
import type { CycleRule, CycleType, OccupancyType } from "@/types";
import { useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

const CYCLE_OPTIONS: { value: CycleType; label: string }[] = [
  { value: "weekly", label: "每周" },
  { value: "biweekly", label: "双周" },
  { value: "monthly", label: "每月" },
];

const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

type FormState = Omit<CycleRule, "id">;

export default function CycleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { halls, cycleRules, addCycleRule, updateCycleRule } = useStore();
  const existing = id ? cycleRules.find((r) => r.id === id) : null;

  const [form, setForm] = useState<FormState>(
    existing ?? {
      name: "",
      title: "",
      hallIds: [],
      cycleType: "weekly",
      weekDays: [],
      timeSlots: [{ start: "09:00", end: "12:00" }],
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: dayjs().add(90, "day").format("YYYY-MM-DD"),
      skipHolidays: false,
      isActive: true,
      type: "investment_meeting",
    }
  );

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleDay = (d: number) =>
    set(
      "weekDays",
      form.weekDays.includes(d)
        ? form.weekDays.filter((x) => x !== d)
        : [...form.weekDays, d]
    );

  const toggleHall = (hid: string) =>
    set(
      "hallIds",
      form.hallIds.includes(hid)
        ? form.hallIds.filter((x) => x !== hid)
        : [...form.hallIds, hid]
    );

  const addSlot = () =>
    set("timeSlots", [...form.timeSlots, { start: "09:00", end: "12:00" }]);
  const removeSlot = (i: number) =>
    set("timeSlots", form.timeSlots.filter((_, idx) => idx !== i));
  const updateSlot = (
    i: number,
    field: "start" | "end",
    val: string
  ) => {
    const slots = form.timeSlots.map((s, idx) =>
      idx === i ? { ...s, [field]: val } : s
    );
    set("timeSlots", slots);
  };

  const handleSubmit = () => {
    if (id) {
      updateCycleRule(id, form);
    } else {
      addCycleRule({ id: `rule-${Date.now()}`, ...form });
    }
    navigate(-1);
  };

  return (
    <>
      <PageHeader
        title={id ? "编辑规则" : "新建规则"}
        showBack
        right={
          <button
            onClick={handleSubmit}
            className="text-accent text-sm font-semibold"
          >
            保存
          </button>
        }
      />
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-3"
        >
          <Field label="规则名称">
            <Input
              value={form.name}
              onChange={(v) => set("name", v)}
              placeholder="例: A1招商例会"
            />
          </Field>

          <Field label="占用标题">
            <Input
              value={form.title}
              onChange={(v) => set("title", v)}
              placeholder="生成的占用显示名称"
            />
          </Field>

          <Field label="关联展厅">
            <div className="flex flex-wrap gap-2">
              {halls.map((h) => (
                <button
                  key={h.id}
                  onClick={() => toggleHall(h.id)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    form.hallIds.includes(h.id)
                      ? "bg-accent text-primary-dark"
                      : "bg-surface-light text-slate-400"
                  )}
                >
                  {h.name}
                </button>
              ))}
            </div>
          </Field>

          <Field label="周期类型">
            <div className="flex gap-2">
              {CYCLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("cycleType", opt.value)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-medium transition-colors",
                    form.cycleType === opt.value
                      ? "bg-accent text-primary-dark"
                      : "bg-surface-light text-slate-400"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="执行日">
            <div className="flex justify-between gap-1">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    form.weekDays.includes(i)
                      ? "bg-accent text-primary-dark"
                      : "bg-surface-light text-slate-400"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="时间段">
            <div className="space-y-2">
              {form.timeSlots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateSlot(i, "start", e.target.value)}
                    className="rounded-lg bg-surface-light px-2 py-1.5 text-xs text-slate-200 outline-none"
                  />
                  <span className="text-xs text-slate-500">至</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateSlot(i, "end", e.target.value)}
                    className="rounded-lg bg-surface-light px-2 py-1.5 text-xs text-slate-200 outline-none"
                  />
                  {form.timeSlots.length > 1 && (
                    <button
                      onClick={() => removeSlot(i)}
                      className="text-xs text-danger"
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addSlot}
                className="text-xs text-accent font-medium"
              >
                + 添加时段
              </button>
            </div>
          </Field>

          <Field label="起始日期">
            <Input
              type="date"
              value={form.startDate}
              onChange={(v) => set("startDate", v)}
            />
          </Field>

          <Field label="截止日期">
            <Input
              type="date"
              value={form.endDate}
              onChange={(v) => set("endDate", v)}
            />
          </Field>

          <Field label="跳过节假日">
            <button
              onClick={() => set("skipHolidays", !form.skipHolidays)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                form.skipHolidays
                  ? "bg-accent text-primary-dark"
                  : "bg-surface-light text-slate-400"
              )}
            >
              {form.skipHolidays ? "已开启" : "已关闭"}
            </button>
          </Field>

          <Field label="占用类型">
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value as OccupancyType)}
              className="w-full rounded-lg bg-surface-light px-3 py-2 text-xs text-slate-200 outline-none"
            >
              {Object.entries(OCCUPANCY_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
        </motion.div>
      </PageContainer>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg bg-surface-light px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none"
    />
  );
}
