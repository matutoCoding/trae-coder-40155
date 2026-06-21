import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import { OCCUPANCY_TYPE_LABELS, OCCUPANCY_TYPE_COLORS } from "@/types";
import type { Occupancy } from "@/types";
import { Calendar, Clock, User, Phone, AlertTriangle, Save } from "lucide-react";
import { motion } from "framer-motion";
import { checkTimeConflict } from "@/utils/dateUtils";
import dayjs from "dayjs";

export default function OccupancyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { occupancies, halls, updateOccupancy } = useStore();
  const occupancy = occupancies.find((o) => o.id === id);
  const hall = occupancy ? halls.find((h) => h.id === occupancy.hallId) : null;

  const [editing, setEditing] = useState(false);
  const [startDate, setStartDate] = useState(occupancy?.startDate || "");
  const [startTime, setStartTime] = useState(occupancy?.startTime || "");
  const [endTime, setEndTime] = useState(occupancy?.endTime || "");

  if (!occupancy) {
    return (
      <PageContainer>
        <PageHeader title="占用详情" showBack />
        <div className="flex items-center justify-center h-64 text-slate-500">
          未找到占用记录
        </div>
      </PageContainer>
    );
  }

  const conflict = checkTimeConflict(
    occupancy.hallId,
    editing ? startDate : occupancy.startDate,
    editing ? startTime : occupancy.startTime,
    editing ? endTime : occupancy.endTime,
    occupancies,
    occupancy.id
  );

  const handleSave = () => {
    if (conflict) return;
    updateOccupancy(occupancy.id, {
      startDate,
      startTime,
      endTime,
      isAdjusted: true,
    });
    setEditing(false);
  };

  return (
    <PageContainer>
      <PageHeader
        title="占用详情"
        showBack
        right={
          !editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-accent text-xs font-medium"
            >
              调整
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="text-success text-xs font-medium flex items-center gap-1"
            >
              <Save size={14} />
              保存
            </button>
          )
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 mt-2"
      >
        <div className="bg-surface rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h2 className="font-serif text-lg font-semibold text-slate-100">
              {occupancy.title}
            </h2>
            <span
              className={`${OCCUPANCY_TYPE_COLORS[occupancy.type]} text-white text-[10px] px-2 py-0.5 rounded-full`}
            >
              {OCCUPANCY_TYPE_LABELS[occupancy.type]}
            </span>
          </div>

          {occupancy.isAdjusted && (
            <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full">
              已调整
            </span>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <BuildingIcon />
              <span className="text-slate-300">{hall?.name || "未知展厅"}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={14} />
              {editing ? (
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-primary-light rounded px-2 py-0.5 text-slate-200 text-sm border border-white/10"
                />
              ) : (
                <span className="text-slate-300">
                  {dayjs(occupancy.startDate).format("YYYY年MM月DD日")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={14} />
              {editing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-primary-light rounded px-2 py-0.5 text-slate-200 text-sm border border-white/10"
                  />
                  <span>—</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-primary-light rounded px-2 py-0.5 text-slate-200 text-sm border border-white/10"
                  />
                </div>
              ) : (
                <span className="text-slate-300">
                  {occupancy.startTime} — {occupancy.endTime}
                </span>
              )}
            </div>

            {occupancy.contactPerson && (
              <div className="flex items-center gap-2 text-slate-400">
                <User size={14} />
                <span className="text-slate-300">{occupancy.contactPerson}</span>
              </div>
            )}

            {occupancy.contactPhone && (
              <div className="flex items-center gap-2 text-slate-400">
                <Phone size={14} />
                <span className="text-slate-300">{occupancy.contactPhone}</span>
              </div>
            )}
          </div>
        </div>

        {conflict && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-start gap-3 animate-pulse-danger"
          >
            <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-danger text-sm font-medium">时段冲突</p>
              <p className="text-slate-400 text-xs mt-1">
                与「{conflict.title}」({conflict.startTime}-{conflict.endTime}) 存在时段重叠
              </p>
            </div>
          </motion.div>
        )}

        {occupancy.cycleRuleId && (
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
            <p className="text-accent text-xs font-medium">周期生成</p>
            <p className="text-slate-400 text-xs mt-1">
              此占用由周期规则自动生成，可单独调整日期和时段
            </p>
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}

function BuildingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
  );
}
