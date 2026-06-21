import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TabBar from "@/components/TabBar";
import Dashboard from "@/pages/Dashboard";
import HallList from "@/pages/halls/HallList";
import HallForm from "@/pages/halls/HallForm";
import HallDetail from "@/pages/halls/HallDetail";
import OccupancyDetail from "@/pages/schedule/OccupancyDetail";
import CycleList from "@/pages/cycles/CycleList";
import CycleForm from "@/pages/cycles/CycleForm";
import CyclePreview from "@/pages/cycles/CyclePreview";
import ApprovalList from "@/pages/approvals/ApprovalList";
import ApprovalNew from "@/pages/approvals/ApprovalNew";
import ApprovalDetail from "@/pages/approvals/ApprovalDetail";
import RoutingConfig from "@/pages/approvals/RoutingConfig";
import ExhibitionList from "@/pages/exhibitions/ExhibitionList";
import ExhibitionForm from "@/pages/exhibitions/ExhibitionForm";
import FireSafetyForm from "@/pages/exhibitions/FireSafetyForm";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/halls" element={<HallList />} />
        <Route path="/halls/new" element={<HallForm />} />
        <Route path="/halls/:id" element={<HallDetail />} />
        <Route path="/halls/:id/edit" element={<HallForm />} />
        <Route path="/occupancy/:id" element={<OccupancyDetail />} />
        <Route path="/cycles" element={<CycleList />} />
        <Route path="/cycles/new" element={<CycleForm />} />
        <Route path="/cycles/:id/edit" element={<CycleForm />} />
        <Route path="/cycles/:id/preview" element={<CyclePreview />} />
        <Route path="/approvals" element={<ApprovalList />} />
        <Route path="/approvals/new" element={<ApprovalNew />} />
        <Route path="/approvals/:id" element={<ApprovalDetail />} />
        <Route path="/routing/config" element={<RoutingConfig />} />
        <Route path="/exhibitions" element={<ExhibitionList />} />
        <Route path="/exhibitions/new" element={<ExhibitionForm />} />
        <Route path="/exhibitions/:id" element={<ExhibitionForm />} />
        <Route path="/fire-safety/:exhibitionId" element={<FireSafetyForm />} />
      </Routes>
      <TabBar />
    </Router>
  );
}
