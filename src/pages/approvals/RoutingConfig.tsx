import { useState } from "react";
import { ChevronDown, ChevronUp, GitBranch, Plus, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/stores/useStore";
import { PageHeader, PageContainer } from "@/components/PageHeader";
import { OPERATOR_LABELS, FIELD_LABELS } from "@/utils/routeEngine";
import type { ApprovalRoute, RouteCondition, ApprovalBranch, ApprovalNode } from "@/types";
import { cn } from "@/lib/utils";

export default function RoutingConfig() {
  const routes = useStore((s) => s.approvalRoutes);
  const updateRoute = useStore((s) => s.updateApprovalRoute);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<ApprovalRoute | null>(null);

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  const startEdit = (route: ApprovalRoute) => {
    setEditing(route.id);
    setEditData(JSON.parse(JSON.stringify(route)));
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditData(null);
  };

  const save = () => {
    if (!editData) return;
    updateRoute(editData.id, editData);
    setEditing(null);
    setEditData(null);
  };

  const isEditing = (id: string) => editing === id;

  return (
    <>
      <PageHeader title="审批路由配置" showBack />
      <PageContainer>
        <div className="space-y-3 mt-2">
          {routes.map((route) => {
            const open = expanded === route.id;
            const editingThis = isEditing(route.id);
            const data = editingThis && editData ? editData : route;

            return (
              <motion.div
                key={route.id}
                layout
                className="bg-surface rounded-xl border border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => toggle(route.id)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch size={16} className="text-accent" />
                    <span className="text-slate-100 font-medium text-sm">{data.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{data.branches.length} 分支</span>
                    {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-white/5 pt-3">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {data.conditions.length === 0 ? (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <AlertCircle size={12} /> 无条件，走默认分支
                            </span>
                          ) : (
                            data.conditions.map((c) => (
                              <ConditionTag key={c.id} condition={c} />
                            ))
                          )}
                        </div>

                        {editingThis ? (
                          <EditPanel data={editData!} setData={setEditData} />
                        ) : (
                          <BranchList branches={data.branches} defaultBranchId={data.defaultBranchId} />
                        )}

                        <div className="flex gap-2 mt-4">
                          {editingThis ? (
                            <>
                              <button onClick={cancelEdit} className="flex-1 py-2 text-sm text-slate-400 bg-surface-light rounded-lg">取消</button>
                              <button onClick={save} className="flex-1 py-2 text-sm text-primary-dark bg-accent font-medium rounded-lg">保存</button>
                            </>
                          ) : (
                            <button onClick={() => startEdit(route)} className="flex-1 py-2 text-sm text-accent bg-accent/10 rounded-lg font-medium">编辑路由</button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </PageContainer>
    </>
  );
}

function ConditionTag({ condition }: { condition: RouteCondition }) {
  return (
    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
      {FIELD_LABELS[condition.field] ?? condition.field} {OPERATOR_LABELS[condition.operator]} {String(condition.value)}
    </span>
  );
}

function BranchList({ branches, defaultBranchId }: { branches: ApprovalBranch[]; defaultBranchId: string }) {
  return (
    <div className="space-y-2">
      {branches.map((b) => (
        <div key={b.id} className={cn(
          "bg-surface-light rounded-lg p-3",
          b.id === defaultBranchId && "ring-1 ring-accent/30"
        )}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-200">{b.name}</span>
            {b.id === defaultBranchId && <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded">默认</span>}
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {b.nodes.map((n) => (
              <span key={n.id} className="text-[11px] bg-primary-dark/60 text-slate-400 px-1.5 py-0.5 rounded">
                {n.order}. {n.role}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EditPanel({ data, setData }: { data: ApprovalRoute; setData: (d: ApprovalRoute) => void }) {
  const addCondition = () => {
    setData({
      ...data,
      conditions: [...data.conditions, {
        id: `cond-${Date.now()}`,
        field: "scale",
        operator: "gt",
        value: 0,
        branchId: data.defaultBranchId,
      }],
    });
  };

  const removeCondition = (id: string) => {
    setData({ ...data, conditions: data.conditions.filter((c) => c.id !== id) });
  };

  const updateCondition = (id: string, patch: Partial<RouteCondition>) => {
    setData({
      ...data,
      conditions: data.conditions.map((c) => c.id === id ? { ...c, ...patch } : c),
    });
  };

  const addBranch = () => {
    const newBranch: ApprovalBranch = {
      id: `branch-${Date.now()}`,
      name: "新分支",
      nodes: [{ id: `n-${Date.now()}`, title: "审核", role: "审核人", order: 1 }],
    };
    setData({ ...data, branches: [...data.branches, newBranch] });
  };

  const removeBranch = (id: string) => {
    if (data.branches.length <= 1) return;
    setData({ ...data, branches: data.branches.filter((b) => b.id !== id) });
  };

  const updateBranch = (id: string, patch: Partial<ApprovalBranch>) => {
    setData({
      ...data,
      branches: data.branches.map((b) => b.id === id ? { ...b, ...patch } : b),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">条件</span>
          <button onClick={addCondition} className="text-accent text-xs flex items-center gap-0.5">
            <Plus size={12} /> 添加
          </button>
        </div>
        {data.conditions.map((c) => (
          <div key={c.id} className="flex gap-1.5 mb-1.5 items-center">
            <select value={c.field} onChange={(e) => updateCondition(c.id, { field: e.target.value })} className="flex-1 bg-primary-dark text-xs text-slate-300 rounded px-2 py-1.5 border border-white/10">
              {Object.entries(FIELD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={c.operator} onChange={(e) => updateCondition(c.id, { operator: e.target.value as RouteCondition["operator"] })} className="w-16 bg-primary-dark text-xs text-slate-300 rounded px-1 py-1.5 border border-white/10">
              {Object.entries(OPERATOR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input value={String(c.value)} onChange={(e) => updateCondition(c.id, { value: e.target.value })} className="w-16 bg-primary-dark text-xs text-slate-300 rounded px-2 py-1.5 border border-white/10" />
            <button onClick={() => removeCondition(c.id)} className="text-danger p-1"><X size={14} /></button>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-medium">分支</span>
          <button onClick={addBranch} className="text-accent text-xs flex items-center gap-0.5">
            <Plus size={12} /> 添加
          </button>
        </div>
        {data.branches.map((b) => (
          <div key={b.id} className="bg-primary-dark/50 rounded-lg p-2.5 mb-2">
            <div className="flex items-center gap-2 mb-1.5">
              <input
                value={b.name}
                onChange={(e) => updateBranch(b.id, { name: e.target.value })}
                className="flex-1 bg-surface text-xs text-slate-200 rounded px-2 py-1 border border-white/10"
              />
              <button onClick={() => removeBranch(b.id)} className="text-danger p-0.5"><X size={12} /></button>
            </div>
            <div className="flex flex-wrap gap-1">
              {b.nodes.map((n) => (
                <span key={n.id} className="text-[11px] bg-surface text-slate-400 px-1.5 py-0.5 rounded">
                  {n.order}. {n.role}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
