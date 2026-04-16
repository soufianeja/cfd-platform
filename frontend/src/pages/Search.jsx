import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', 'full', query],
    queryFn: async () => {
      if (!query) return null
      const res = await api.get(`/search?q=${encodeURIComponent(query)}`)
      return res.data.data
    },
    enabled: query.length > 0,
    staleTime: 60000,
  })

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <p className="text-gray-600">Please enter a search term in the search bar above.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load search results. Please try again later.
        </div>
      </div>
    )
  }

  const hasResults = data && (
    data.cfd_projects.length > 0 ||
    data.projects.length > 0 ||
    data.users.length > 0 ||
    data.tags.length > 0
  )

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      <p className="text-gray-600 mb-8">Showing results for "{query}"</p>

      {!hasResults && (
        <div className="bg-gray-50 border rounded-xl p-8 text-center text-gray-500">
          No results found matching your query. Try different keywords.
        </div>
      )}

      {hasResults && (
        <div className="space-y-8">
          
          {/* CFD Projects Section */}
          {data.cfd_projects.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-blue-700">CFD Projects</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {data.cfd_projects.map(project => (
                  <Link 
                    key={project.id} 
                    to={`/cfd/${project.slug}`}
                    className="block p-4 border rounded-xl hover:shadow-md transition-shadow bg-white relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 group-hover:w-2 transition-all"></div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors ml-2">{project.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2 ml-2">{project.description}</p>
                    {project.user && (
                      <p className="text-gray-400 text-xs mt-3 ml-2">By {project.user.name}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Academic Projects Section */}
          {data.projects.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-indigo-700">Academic Projects</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {data.projects.map(project => (
                  <Link 
                    key={project.id} 
                    to={`/projects/${project.slug}`}
                    className="block p-4 border rounded-xl hover:shadow-md transition-shadow bg-white relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 group-hover:w-2 transition-all"></div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors ml-2">{project.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2 ml-2">{project.description}</p>
                    {project.user && (
                      <p className="text-gray-400 text-xs mt-3 ml-2">By {project.user.name}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Users Section */}
          {data.users.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Researchers</h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {data.users.map(user => (
                  <Link 
                    key={user.id} 
                    to={`/users/${user.id}`}
                    className="flex items-center gap-3 p-3 border rounded-xl hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center font-bold text-blue-700">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      {user.email && <p className="text-xs text-gray-500 truncate w-32">{user.email}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tags Section */}
          {data.tags.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {data.tags.map(tag => (
                  <span 
                    key={tag.id}
                    className="px-3 py-1 bg-gray-100 border rounded-full text-sm text-gray-700"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  )
}
