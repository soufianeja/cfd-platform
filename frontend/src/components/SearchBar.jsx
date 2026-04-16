import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false)
    // Optional: clear query if not on search page
    if (location.pathname !== '/search') {
        setQuery('')
    }
  }, [location.pathname])

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)
    return () => clearTimeout(timer)
  }, [query])

  // Fetch results
  const { data, isLoading } = useQuery({
    queryKey: ['search', 'preview', debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return null
      const res = await api.get(`/search?q=${encodeURIComponent(debouncedQuery)}`)
      return res.data.data
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 60000,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim().length > 0) {
      setIsOpen(false)
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const hasResults = data && (
    data.cfd_projects.length > 0 ||
    data.projects.length > 0 ||
    data.users.length > 0 ||
    data.tags.length > 0
  )

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md ml-4 mr-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search projects, users, tags..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <svg
          className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </form>

      {/* Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto z-50">
          {isLoading && (
            <div className="p-4 text-center text-sm text-gray-500">
              Searching...
            </div>
          )}

          {!isLoading && data && !hasResults && (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          )}

          {!isLoading && data && hasResults && (
            <div className="py-2">
              {data.cfd_projects.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    CFD Projects
                  </div>
                  {data.cfd_projects.slice(0, 3).map(p => (
                    <div 
                      key={`cfd-${p.id}`} 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer block text-sm string-truncate"
                      onClick={() => { setIsOpen(false); navigate(`/cfd/${p.slug}`); }}
                    >
                      <div className="font-medium text-blue-600">{p.title}</div>
                      {p.user && <div className="text-xs text-gray-500">by {p.user.name}</div>}
                    </div>
                  ))}
                </div>
              )}

              {data.projects.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Academic Projects
                  </div>
                  {data.projects.slice(0, 3).map(p => (
                    <div 
                      key={`proj-${p.id}`} 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer block text-sm"
                      onClick={() => { setIsOpen(false); navigate(`/projects/${p.slug}`); }}
                    >
                      <div className="font-medium text-indigo-600">{p.title}</div>
                      {p.user && <div className="text-xs text-gray-500">by {p.user.name}</div>}
                    </div>
                  ))}
                </div>
              )}

              {data.users.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Researchers
                  </div>
                  {data.users.slice(0, 3).map(u => (
                    <div 
                      key={`user-${u.id}`} 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      onClick={() => { setIsOpen(false); navigate(`/users/${u.id}`); }}
                    >
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                        {u.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{u.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div 
                className="px-4 py-3 text-sm text-center text-blue-600 hover:bg-gray-50 font-medium cursor-pointer border-t"
                onClick={() => { setIsOpen(false); navigate(`/search?q=${encodeURIComponent(query)}`); }}
              >
                View all results for "{query}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
