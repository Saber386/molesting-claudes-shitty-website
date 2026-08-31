import { useState, useEffect } from 'react'
import client from '../api/client'

export default function PostsPage({ user }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [commentText, setCommentText] = useState({})
  const [expandedComments, setExpandedComments] = useState({})
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [page])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await client.get('/posts', { params: { page } })
      setPosts(response.data.posts || [])
      setError('')
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Title and content required')
      return
    }

    try {
      await client.post('/posts', {
        title: newPost.title,
        content: newPost.content,
        visibility: 'public'
      })
      setNewPost({ title: '', content: '' })
      setPage(1)
      fetchPosts()
    } catch (err) {
      setError('Failed to create post')
    }
  }

  const handleLike = async (postId) => {
    try {
      await client.post(`/posts/${postId}/like`)
      fetchPosts()
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  const handleAddComment = async (postId) => {
    const content = commentText[postId]
    if (!content?.trim()) return

    try {
      await client.post(`/posts/${postId}/comments`, { content })
      setCommentText({ ...commentText, [postId]: '' })
      setExpandedComments({ ...expandedComments, [postId]: true })
      fetchPosts()
    } catch (err) {
      console.error('Error adding comment:', err)
    }
  }

  const toggleComments = (postId) => {
    setExpandedComments({ ...expandedComments, [postId]: !expandedComments[postId] })
  }

  if (loading) return <div className="container mx-auto py-8"><p>Loading posts...</p></div>

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-bold mb-4">Share Something</h2>
          {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
          <form onSubmit={handleCreatePost}>
            <input type="text" placeholder="Post title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 mb-3" />
            <textarea placeholder="What's on your mind?" value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-2 mb-3" rows="4" />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium">Post</button>
          </form>
        </div>

        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-bold">{post.title}</h3>
                  <p className="text-sm text-gray-600">by <strong>{post.username}</strong></p>
                </div>
                <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
              </div>

              <p className="text-gray-800 my-4">{post.content}</p>

              <div className="flex gap-4 text-sm text-gray-600 border-t pt-3 mt-3">
                <button onClick={() => handleLike(post.id)} className="hover:text-blue-600 cursor-pointer">👍 {post.like_count || 0} Likes</button>
                <button onClick={() => toggleComments(post.id)} className="hover:text-blue-600 cursor-pointer">💬 {post.comment_count || 0} Comments</button>
              </div>

              {expandedComments[post.id] && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Add a comment..." value={commentText[post.id] || ''} onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })} className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm" />
                    <button onClick={() => handleAddComment(post.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Reply</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 border rounded disabled:opacity-50">Previous</button>
          <span className="px-4 py-2">Page {page}</span>
          <button onClick={() => setPage(page + 1)} className="px-4 py-2 border rounded hover:bg-gray-100">Next</button>
        </div>
      </div>
    </div>
  )
}
