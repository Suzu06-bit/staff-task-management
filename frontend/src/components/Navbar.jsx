import { NavLink, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // staff submit page (opened from email) has no navbar
  if (location.pathname.startsWith("/submit/")) {
    return null;
  }

  // checks login status again whenever the route changes
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  const linkClass = ({ isActive }) =>
    `rounded-md px-4 py-2 transition-colors ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <NavLink
          to={isLoggedIn ? "/dashboard" : "/login"}
          className="text-xl font-bold text-blue-600"
        >
          Task Manager
        </NavLink>

        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
          ) : (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/staff" className={linkClass}>
                Staff
              </NavLink>

              <NavLink to="/categories" className={linkClass}>
                Categories
              </NavLink>

              <NavLink to="/tasks/assign" className={linkClass}>
                Assign Task
              </NavLink>

              <NavLink to="/tasks" end className={linkClass}>
                Task Overview
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;