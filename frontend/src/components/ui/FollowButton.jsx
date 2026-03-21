import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function FollowButton({ userId, isFollowing }) {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/users/${userId}/follow`)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries(['user-profile', String(userId)]),
  })

  // If not logged in, we don't show the follow button or could show a disabled one
  if (!token) return null

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={`px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
        isFollowing
          ? 'border border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {mutation.isPending ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  )
}
