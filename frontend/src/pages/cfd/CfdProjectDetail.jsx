import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function CfdProjectDetail() {
  const { slug } = useParams()
  const { user } = useAuthStore()


  const { data, isLoading, isError } = useQuery({
    queryKey: ['cfd-project', slug],
    queryFn: async () => {
      const { data } = await api.get(`/cfd-projects/${slug}`)
      return data.data
    },
  })

  if (isLoading) return <p className="p-8 text-gray-500">Loading...</p>
  if (isError) return <p className="p-8 text-red-500">Project not found.</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        ← Back to projects
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow p-8 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {data.software}
          </span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            {data.simulation_type}
          </span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            {data.turbulence_model}
          </span>
        </div>
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          {user?.id === data.author?.id && (
            <Link
              to={`/cfd/${data.slug}/edit`}
              className="text-sm bg-gray-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
            >
              ✏️ Edit Project
            </Link>
          )}
        </div>
        <p className="text-gray-600 leading-relaxed">{data.description}</p>
        <Link
          to={`/cfd/${data.slug}/geometries`}
          className="inline-block mt-4 text-sm text-gray-600 border px-4 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-2 w-fit"
        >
          📐 View Geometries ({data.geometries?.length ?? 0})
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Solver', value: data.solver },
          { label: 'Mesh Cells', value: data.mesh_cells?.toLocaleString() },
          { label: 'Reynolds', value: data.reynolds_number },
          { label: 'Views', value: data.views_count },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">{item.label}</p>
            <p className="font-semibold">{item.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Results Summary */}
      {data.results_summary && (
        <div className="bg-white rounded-xl shadow p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">Results Summary</h2>
          <p className="text-gray-600 leading-relaxed">{data.results_summary}</p>
        </div>
      )}

      {/* Simulations — now per geometry */}
      <div className="bg-white rounded-xl shadow p-8 mb-6">
        <h2 className="text-xl font-bold mb-2">Simulations</h2>
        <p className="text-gray-500 text-sm mb-4">Simulations are organised per geometry. Go to Geometries to view or create simulations.</p>
        <Link
          to={`/cfd/${data.slug}/geometries`}
          className="inline-flex items-center gap-2 text-sm border px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          📐 View Geometries & Simulations
        </Link>
      </div>

      {/* Author */}
      {data.author && (
        <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
            {data.author.name[0]}
          </div>
          <div>
            <p className="font-semibold">{data.author.name}</p>
            <p className="text-sm text-gray-400">Researcher</p>
          </div>
        </div>
      )}
    </div>
  )
}