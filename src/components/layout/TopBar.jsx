import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, X, LogOut, Shield, Lock } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const pageTitles = {
  '/': 'Dashboard',
  '/jobs': 'Jobs',
  '/candidates': 'Candidates',
  '/interviews': 'Interviews',
  '/team': 'Team',
  '/templates': 'Email Templates',
  '/settings': 'Settings',
}

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state, dispatch, logout, currentUser, userRoleConfig } = useApp()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)

  const currentBranch = state.settings.currentBranch || 'ALL'
  const currentClient = state.settings.currentClient || 'ALL'
  const isFiltered = currentBranch !== 'ALL' || currentClient !== 'ALL'

  const title = Object.entries(pageTitles).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1] || 'TalentFlow'

  const handleSearch = (e) => {
    const q = e.target.value
    setQuery(q)
    if (q.trim().length < 1) {
      setResults([])
      setShowResults(false)
      return
    }
    const ql = q.toLowerCase().trim()
    const words = ql.split(/\s+/).filter(Boolean)

    const candidateResults = state.candidates
      .filter(c => {
        const job = state.jobs.find(j => j.id === c.jobId)
        const str = `${c.firstName} ${c.lastName} ${c.email} ${c.phone || ''} ${c.location || ''} ${(c.tags || []).join(' ')} ${job?.title || ''} ${job?.code || ''} ${job?.clientCompany || ''} ${c.stage}`.toLowerCase()
        return words.every(w => str.includes(w))
      })
      .slice(0, 4)
      .map(c => {
        const job = state.jobs.find(j => j.id === c.jobId)
        return {
          type: 'candidate',
          label: `${c.firstName} ${c.lastName}`,
          sub: `${job?.clientCompany ? `[${job.clientCompany}] ` : ''}${job?.title || c.email} · ${c.stage}`,
          id: c.id,
        }
      })

    const jobResults = state.jobs
      .filter(j => {
        const str = `${j.title} ${j.code || ''} ${j.department} ${j.clientCompany} ${j.branch} ${j.location} ${(j.requirements || []).join(' ')}`.toLowerCase()
        return words.every(w => str.includes(w))
      })
      .slice(0, 4)
      .map(j => ({
        type: 'job',
        label: `${j.code ? `[${j.code}] ` : ''}${j.title}`,
        sub: `${j.clientCompany} (${j.branch} Branch) · ${j.department}`,
        id: j.id,
      }))

    setResults([...candidateResults, ...jobResults])
    setShowResults(true)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = query.trim()
      if (!trimmed) return

      setShowResults(false)

      // Context-aware navigation on Enter:
      if (location.pathname.startsWith('/jobs')) {
        navigate(`/jobs?search=${encodeURIComponent(trimmed)}`)
        return
      }
      if (location.pathname.startsWith('/candidates')) {
        navigate(`/candidates?search=${encodeURIComponent(trimmed)}`)
        return
      }
      if (location.pathname.startsWith('/interviews')) {
        navigate(`/interviews?search=${encodeURIComponent(trimmed)}`)
        return
      }
      if (location.pathname.startsWith('/team')) {
        navigate(`/team?search=${encodeURIComponent(trimmed)}`)
        return
      }
      if (location.pathname.startsWith('/templates')) {
        navigate(`/templates?search=${encodeURIComponent(trimmed)}`)
        return
      }

      // If user typed keywords and results matched:
      if (results.length > 0) {
        const top = results[0]
        navigate(top.type === 'candidate' ? `/candidates/${top.id}` : `/jobs/${top.id}`)
        return
      }

      // Default: search in candidates
      navigate(`/candidates?search=${encodeURIComponent(trimmed)}`)
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 sticky top-0 z-30">
      <h2 className="text-lg font-semibold text-gray-800 min-w-0 mr-2">{title}</h2>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowResults(false), 250)}
          onFocus={() => query.trim().length >= 1 && setShowResults(true)}
          placeholder="Search candidates, skills, jobs, clients… (Press Enter)"
          className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}

        {/* Live Dropdown Results */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
            <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Matching results ({results.length})</span>
              <span className="font-semibold text-blue-600">Press Enter to select</span>
            </div>
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-left border-b border-gray-50 transition-colors cursor-pointer"
                onMouseDown={() => {
                  navigate(r.type === 'candidate' ? `/candidates/${r.id}` : `/jobs/${r.id}`)
                  setQuery('')
                  setShowResults(false)
                }}
              >
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${r.type === 'candidate' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {r.type === 'candidate' ? 'Candidate' : 'Job'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{r.label}</p>
                  <p className="text-xs text-gray-500 truncate">{r.sub}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filter Indicators */}
      {isFiltered && (
        <div className="hidden lg:flex items-center gap-2 bg-blue-50/80 border border-blue-200/80 px-3 py-1 rounded-lg text-xs">
          <span className="text-blue-700 font-semibold text-[11px] uppercase tracking-wider">Filtered:</span>
          {currentBranch !== 'ALL' && (
            <span className="inline-flex items-center gap-1 bg-white border border-blue-300 text-blue-800 font-bold px-2 py-0.5 rounded shadow-2xs">
              {currentBranch} Branch
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_BRANCH_FILTER', payload: 'ALL' })}
                className="hover:text-red-600 font-extrabold ml-0.5 text-xs cursor-pointer"
                title="Remove branch filter"
              >
                ×
              </button>
            </span>
          )}
          {currentClient !== 'ALL' && (
            <span className="inline-flex items-center gap-1 bg-white border border-indigo-300 text-indigo-800 font-bold px-2 py-0.5 rounded shadow-2xs">
              {currentClient}
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_CLIENT_FILTER', payload: 'ALL' })}
                className="hover:text-red-600 font-extrabold ml-0.5 text-xs cursor-pointer"
                title="Remove client filter"
              >
                ×
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_FILTERS' })}
            className="text-[11px] text-blue-600 hover:text-blue-800 underline ml-1 font-medium cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        {/* User Role & Profile Pill */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {currentUser.avatar}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-xs font-bold text-gray-900">{currentUser.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${userRoleConfig.badgeColor}`}>
                  {userRoleConfig.badge}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 leading-none mt-0.5">
                {currentUser.branch === 'ALL' ? 'All Branches' : `${currentUser.branch} Branch`}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          title="Sign out & lock software"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-red-700 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          <span className="hidden md:inline">Lock / Sign Out</span>
        </button>

        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
