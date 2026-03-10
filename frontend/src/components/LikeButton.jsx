import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

/**
 * Props:
 *   type  — 'cfd_project' | 'project' | 'simulation'
 *   id    — numeric DB id of the resource
 *   initialCount — optional pre-populated count from parent query
 */
export default function LikeButton({ type, id, initialCount = 0 }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const qKey = ['likes', type, id]

  // Fetch current like state for the logged-in user
  // We optimistically seed from the toggle response instead of a separate endpoint.
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)

  const { mutate: toggle, isPending } = useMutation({
    mutationFn: () =>
      api.post('/likes', { likeable_type: type, likeable_id: id }),
    onSuccess: ({ data }) => {
      setLiked(data.liked)
      setCount(data.likes_count)
      queryClient.invalidateQueries({ queryKey: qKey })
    },
  })

  const handleClick = () => {
    if (!user) {
      alert('You need to be logged in to like this.')
      return
    }
    toggle()
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all
        ${liked
          ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
        } disabled:opacity-50`}
    >
      <span className="text-base">{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  )
}
