import { useState, useEffect } from 'react'
import client from '../api/client'

export default function DashboardPage({ user }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await client.get('/posts')
      setPosts(response.data.posts || [])
    } catch (err) {
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.trim()) return
    try {
      await client.post('/posts', { title: 'New Post', content: newPost, visibility: 'public' })
      setNewPost('')
      fetchPosts()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user?.username}!</h2>
          <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="What's on your mind?" className="w-full border rounded px-3 py-2 mb-4" rows="3" />
          <button onClick={handleCreatePost} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Post</button>
        </div>
        <div className="space-y-4">
          {posts.map(post => <div key={post.id} className="bg-white p-6 rounded-lg shadow"><h3 className="font-bold">{post.title}</h3><p className="text-sm text-gray-600">by {post.username}</p><p className="mt-2">{post.content}</p></div>)}
        </div>
      </div>
    </div>
  )
}
