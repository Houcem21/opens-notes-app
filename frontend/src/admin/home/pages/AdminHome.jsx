import { Outlet } from "react-router-dom"

const AdminHome = () => {
  return (
    <div className="adminHome">
      <h2>Admin Home</h2>

      <Outlet />
    </div>
    
  )
}

export default AdminHome