import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Families from "./pages/Families";
import Members from "./pages/Members";
import Registrations from "./pages/Registrations";
import Draw from "./pages/Draw";
import Assignments from "./pages/Assignments";
import Settings from "./pages/Settings";
import PrintSlip from "./pages/PrintSlip";
import Register from "./pages/Register";
import Layout from "./components/Layout";

function useIsLoggedIn() {
  return !!sessionStorage.getItem("adminPassword");
}

function RequireAuth({ children }) {
  return useIsLoggedIn() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/print-slip/:memberId" element={
        <RequireAuth><PrintSlip /></RequireAuth>
      } />
      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="families" element={<Families />} />
        <Route path="members" element={<Members />} />
        <Route path="registrations" element={<Registrations />} />
        <Route path="draw" element={<Draw />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
