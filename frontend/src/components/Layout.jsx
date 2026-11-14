import { NavLink, Outlet, useNavigate } from 'react-router-dom'

function Layout() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('access')
    navigate('/login')
  }

  return (
    <div className="app">
      <aside>
        <h3>Task Manager</h3>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/staff">Staff</NavLink>
        <NavLink to="/categories">Categories</NavLink>
        <NavLink to="/tasks/assign">Assign Task</NavLink>
        <NavLink to="/tasks" end>Task Overview</NavLink>
        <button onClick={logout}>Logout</button>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout