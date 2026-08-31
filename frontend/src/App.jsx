import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import client from './api/client'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import PostsPage from './pages/PostsPage'
import MessagesPage from './pages/MessagesPage'
import AdminPage from './pages/AdminPage'
import DirectoryPage from './pages/DirectoryPage'

// Components
import Navbar from './components/Navbar'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      setIsAuthenticated(true)
      setUser(JSON.parse(savedUser))
    }
    
    setLoading(false)
  }, [])

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <Router>
      {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
      
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage onRegister={handleLogin} />} 
        />
        
        {/* Authenticated Routes */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <DashboardPage user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile/:userId" 
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/posts" 
          element={isAuthenticated ? <PostsPage user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/messages" 
          element={isAuthenticated ? <MessagesPage user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/directory" 
          element={isAuthenticated ? <DirectoryPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin" 
          element={isAuthenticated && user?.role === 'admin' ? <AdminPage user={user} /> : <Navigate to="/dashboard" />} 
        />
        
        {/* Default */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
