import { Link, useNavigate } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container flex items-center justify-between py-4">
        <Link to="/dashboard" className="text-2xl font-bold">
          CampusHub
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">Home</Link>
          <Link to="/posts" className="hover:bg-blue-700 px-3 py-2 rounded">Posts</Link>
          <Link to="/messages" className="hover:bg-blue-700 px-3 py-2 rounded">Messages</Link>
          <Link to="/directory" className="hover:bg-blue-700 px-3 py-2 rounded">Directory</Link>
          
          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:bg-blue-700 px-3 py-2 rounded font-bold">Admin</Link>
          )}
          
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-blue-500">
            <span className="text-sm">{user?.username}</span>
            <Link to={`/profile/${user?.id}`} className="hover:bg-blue-700 px-3 py-2 rounded">Profile</Link>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
