import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff";
import StaffDetails from "./pages/StaffDetails";
import Categories from "./pages/Categories";
import TaskAssign from "./pages/TaskAssign";
import TaskOverview from "./pages/TaskOverview";
import TaskDetails from "./pages/TaskDetails";
import SubmitTask from "./pages/SubmitTask";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />

          {/* public page, staff opens it from the email */}
          <Route path="/submit/:token" element={<SubmitTask />} />

          {/* admin pages, login required */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/staff/:id" element={<StaffDetails />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/tasks/assign" element={<TaskAssign />} />
            <Route path="/tasks" element={<TaskOverview />} />
            <Route path="/tasks/:id" element={<TaskDetails />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;