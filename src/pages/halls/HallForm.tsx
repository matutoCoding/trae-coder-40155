import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Ruler, Weight, MapPin, Clock } from "lucide-react";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import type { Hall } from "@/types";
import { cn } from "@/lib/utils";

const FACILITIES = ["水电接口", "网络", "消防栓", "空调", "货梯", "音响", "投影"];

const STATUSES: { value: Hall["status"]; label: string }[] = [
  { value: "available", label: "空闲" },
  { value: "occupied", label: "占用" },
  { value: "maintenance", label: "维护" },
];

const inputCls =
  "w-full bg-primary-light/60 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-accent/50";

export default function HallForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { halls, addHall, updateHall } = useStore();
  const existing = id ? halls.find((h) => h.id === id) : null;

  const [form, setForm] = useState<Hall>(
    existing ?? {
      id: `hall-${Date.now()}`,
      name: "",
      area: 0,
      height: 0,
      loadBearing: 0,
      location: "",
      facilities: [],
      availableHours: { start: "08:00", end: "22:00" },
      status: "available",
    }
  );

  const toggleFacility = (f: string) =>
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x) => x !== f)
        : [...prev.facilities, f],
    }));

  const set = <K extends keyof Hall>(key: K, value: Hall[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (existing) {
      updateHall(id!, form);
    } else {
      addHall({ ...form, id: `hall-${Date.now()}` });
    }
    navigate(-1);
  };

  return (
    <PageContainer>
      <PageHeader title={existing ? "编辑展厅" : "新增展厅"} showBack />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 py-2"
      >
        <Field label="展厅名称" icon={<Building2 size={14} />}>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
            placeholder="请输入展厅名称"
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="面积(㎡)" icon={<Ruler size={14} />}>
            <input
              type="number"
              value={form.area || ""}
              onChange={(e) => set("area", +e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="层高(m)" icon={<Ruler size={14} />}>
            <input
              type="number"
              value={form.height || ""}
              onChange={(e) => set("height", +e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="承重(t/㎡)" icon={<Weight size={14} />}>
            <input
              type="number"
              value={form.loadBearing || ""}
              onChange={(e) => set("loadBearing", +e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="位置" icon={<MapPin size={14} />}>
          <input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className={inputCls}
            placeholder="请输入位置"
          />
        </Field>

        <Field label="可用时间" icon={<Clock size={14} />}>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={form.availableHours.start}
              onChange={(e) =>
                set("availableHours", {
                  ...form.availableHours,
                  start: e.target.value,
                })
              }
              className={cn(inputCls, "flex-1")}
            />
            <span className="text-slate-500 text-xs">至</span>
            <input
              type="time"
              value={form.availableHours.end}
              onChange={(e) =>
                set("availableHours", {
                  ...form.availableHours,
                  end: e.target.value,
                })
              }
              className={cn(inputCls, "flex-1")}
            />
          </div>
        </Field>

        <Field label="设施">
          <div className="flex flex-wrap gap-2">
            {FACILITIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFacility(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs transition-colors",
                  form.facilities.includes(f)
                    ? "bg-accent text-primary-dark font-medium"
                    : "bg-surface text-slate-400"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </Field>

        <Field label="状态">
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => set("status", s.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs transition-colors",
                  form.status === s.value
                    ? "bg-accent text-primary-dark font-medium"
                    : "bg-surface text-slate-400"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-accent text-primary-dark font-semibold rounded-xl active:scale-[0.98] transition-transform mt-4"
        >
          保存
        </button>
      </motion.div>
    </PageContainer>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1 text-xs text-slate-400 mb-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
