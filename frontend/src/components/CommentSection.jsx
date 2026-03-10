import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

/**
 * Props:
 *   type — 'cfd_project' | 'project' | 'simulation'
 *   id   — numeric DB id of the resource
 */
export default function CommentSection({ type, id }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const qKey = ['comments', type, id]

  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState(null) // { id, authorName }
  const [replyContent, setReplyContent] = useState('')

  // ─── Fetch comments ───────────────────────────────────────────────────────
  const { data: comments = [], isLoading } = useQuery({
    queryKey: qKey,
    queryFn: async () => {
      const { data } = await api.get('/comments', {
        params: { commentable_type: type, commentable_id: id },
      })
      return data.data
    },
  })

  // ─── Post comment / reply ─────────────────────────────────────────────────
  const { mutate: postComment, isPending: posting } = useMutation({
    mutationFn: (payload) => api.post('/comments', payload),
    onSuccess: () => {
      setContent('')
      setReplyTo(null)
      setReplyContent('')
      queryClient.invalidateQueries({ queryKey: qKey })
    },
  })

  // ─── Delete comment ───────────────────────────────────────────────────────
  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentId) => api.delete(`/comments/${commentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qKey }),
  })

  const submitComment = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    postComment({
      commentable_type: type,
      commentable_id: id,
      content: content.trim(),
    })
  }

  const submitReply = (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    postComment({
      commentable_type: type,
      commentable_id: id,
      content: replyContent.trim(),
      parent_id: replyTo.id,
    })
  }

  return (
    <div className="bg-white rounded-xl shadow p-8">
      <h2 className="text-xl font-bold mb-6">
        💬 Comments
        <span className="ml-2 text-sm font-normal text-gray-400">({comments.length})</span>
      </h2>

      {/* ── New comment form ── */}
      {user ? (
        <form onSubmit={submitComment} className="mb-8">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a comment…"
                rows={3}
                maxLength={2000}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">{content.length}/2000</span>
                <button
                  type="submit"
                  disabled={posting || !content.trim()}
                  className="bg-blue-600 text-white px-5 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-500 mb-6 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <a href="/login" className="text-blue-600 hover:underline">Log in</a> to leave a comment.
        </p>
      )}

      {/* ── Comment list ── */}
      {isLoading ? (
        <p className="text-gray-400 text-sm">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">
          No comments yet. Be the first! 🎉
        </p>
      ) : (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                user={user}
                onDelete={deleteComment}
                onReply={(c) => setReplyTo({ id: c.id, authorName: c.author.name })}
              />

              {/* ── Nested replies ── */}
              {comment.replies?.length > 0 && (
                <ul className="ml-12 mt-3 space-y-4 border-l-2 border-gray-100 pl-4">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentItem
                        comment={reply}
                        user={user}
                        onDelete={deleteComment}
                        isReply
                      />
                    </li>
                  ))}
                </ul>
              )}

              {/* ── Reply form ── */}
              {replyTo?.id === comment.id && user && (
                <div className="ml-12 mt-3">
                  <form onSubmit={submitReply} className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        autoFocus
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Reply to ${replyTo.authorName}…`}
                        rows={2}
                        maxLength={2000}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                      <div className="flex gap-2 mt-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg border"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={posting || !replyContent.trim()}
                          className="bg-blue-600 text-white text-xs px-4 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                          {posting ? 'Posting…' : 'Reply'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Single comment card ────────────────────────────────────────────────────
function CommentItem({ comment, user, onDelete, onReply, isReply = false }) {
  const canDelete =
    user && (user.id === comment.author?.id || user.role === 'admin')

  return (
    <div className="flex gap-3">
      <div
        className={`rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0 ${
          isReply ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
        }`}
      >
        {comment.author?.name?.[0]?.toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`font-semibold ${isReply ? 'text-sm' : ''}`}>
            {comment.author?.name}
          </span>
          <span className="text-xs text-gray-400">{comment.created_at}</span>
        </div>
        <p className={`text-gray-700 leading-relaxed ${isReply ? 'text-sm' : ''}`}>
          {comment.content}
        </p>
        <div className="flex gap-3 mt-1.5">
          {!isReply && onReply && user && (
            <button
              onClick={() => onReply(comment)}
              className="text-xs text-gray-400 hover:text-blue-600 transition"
            >
              ↩ Reply
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-xs text-gray-400 hover:text-red-500 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
