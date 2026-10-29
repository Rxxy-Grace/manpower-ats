import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  UserCircle,
  Mail,
  Settings,
  Building2,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/candidates', icon: Users, label: 'Candidates' },
  { to: '/interviews', icon: Calendar, label: 'Interviews' },
  { to: '/team', icon: UserCircle, label: 'Team' },
  { to: '/templates', icon: Mail, label: 'Email Templates' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { state, dispatch } = useApp()
  const currentUser = state.team.find(t => t.id === state.settings.currentUser) || state.team[0]

  const currentBranch = state.settings.currentBranch || 'ALL'
  const currentClient = state.settings.currentClient || 'ALL'
  const isFiltered = currentBranch !== 'ALL' || currentClient !== 'ALL'

  // Filter jobs matching current branch & client
  const filteredJobs = state.jobs.filter(j => {
    const matchBranch = currentBranch === 'ALL' || j.branch === currentBranch
    const matchClient = currentClient === 'ALL' || j.clientCompany === currentClient
    return matchBranch && matchClient
  })
  const filteredJobIds = new Set(filteredJobs.map(j => j.id))

  const openJobsCount = filteredJobs.filter(j => j.status === 'Open').length
  const filteredCandidatesCount = state.candidates.filter(c => filteredJobIds.has(c.jobId)).length
  const filteredInterviewsCount = state.interviews.filter(i => filteredJobIds.has(i.jobId) && i.status === 'Scheduled').length

  const branchColors = {
    ALL: 'bg-slate-700',
    HQS: 'bg-blue-600',
    AQS: 'bg-purple-600',
    QSL: 'bg-emerald-600',
  }
  const branchColor = branchColors[currentBranch] || 'bg-blue-600'

  const handleBranchClick = (branch) => {
    const next = currentBranch === branch ? 'ALL' : branch
    dispatch({ type: 'SET_BRANCH_FILTER', payload: next })
  }

  const handleClientClick = (client) => {
    const next = currentClient === client ? 'ALL' : client
    dispatch({ type: 'SET_CLIENT_FILTER', payload: next })
  }

  const handleResetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' })
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo & Header */}
      <div className="px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${branchColor} rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm`}>
            <Building2 size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold leading-none text-white">HQS Manpower</h1>
            <p className="text-xs text-gray-400 leading-none mt-1 truncate">
              {currentBranch === 'ALL' ? 'All Branches' : `${currentBranch} Branch`} · ATS
            </p>
          </div>
        </div>

        {/* Branch switcher buttons */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Branch Filter</span>
            {currentBranch !== 'ALL' && (
              <button
                type="button"
                onClick={() => handleBranchClick('ALL')}
                className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {['ALL', 'HQS', 'AQS', 'QSL'].map(branch => {
              const isActive = currentBranch === branch
              const count = branch === 'ALL'
                ? state.jobs.length
                : state.jobs.filter(j => j.branch === branch).length
              return (
                <button
                  key={branch}
                  type="button"
                  onClick={() => handleBranchClick(branch)}
                  title={`Filter by ${branch === 'ALL' ? 'All branches' : branch} (${count} jobs)`}
                  className={`py-1.5 px-1 rounded-lg font-bold text-xs transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isActive
                      ? branch === 'ALL'
                        ? 'bg-slate-700 text-white shadow-md ring-2 ring-slate-400'
                        : `${branchColors[branch]} text-white shadow-md ring-2 ring-white/30`
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {branch !== 'ALL' && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-gray-600'}`} />
                    )}
                    <span>{branch}</span>
                  </div>
                  <span className={`text-[9px] ${isActive ? 'text-white/90' : 'text-gray-500'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Client Companies interactive filter */}
      <div className="px-5 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Client Companies</p>
          {currentClient !== 'ALL' && (
            <button
              type="button"
              onClick={() => handleClientClick('ALL')}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1">
          {['ALL', 'PTTEP', 'SLB', 'POSCO'].map(client => {
            const isActive = currentClient === client
            const count = client === 'ALL'
              ? state.jobs.length
              : state.jobs.filter(j => j.clientCompany === client).length
            const activeStyles = {
              ALL: 'bg-slate-700 text-white shadow-md ring-2 ring-slate-400',
              PTTEP: 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/60',
              SLB: 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-400/60',
              POSCO: 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/60',
            }
            return (
              <button
                key={client}
                type="button"
                onClick={() => handleClientClick(client)}
                title={`Filter by ${client === 'ALL' ? 'All Clients' : client} (${count} jobs)`}
                className={`py-1.5 px-1 rounded-lg font-bold text-xs transition-all flex flex-col items-center justify-center cursor-pointer ${
                  isActive
                    ? activeStyles[client]
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700/60'
                }`}
              >
                <div className="flex items-center gap-1">
                  {client !== 'ALL' && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-emerald-400'}`} />
                  )}
                  <span className="truncate">{client}</span>
                </div>
                <span className={`text-[9px] ${isActive ? 'text-white/90' : 'text-gray-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Filter Pill */}
      {isFiltered && (
        <div className="mx-3 mt-3 px-3 py-2 bg-blue-950/80 border border-blue-700/60 rounded-lg flex items-center justify-between text-xs">
          <div className="min-w-0 flex items-center gap-1.5">
            <Filter size={12} className="text-blue-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-semibold text-blue-300 block">Filtered Flow</span>
              <p className="text-white truncate text-xs font-bold">
                {currentBranch !== 'ALL' && <span>{currentBranch}</span>}
                {currentBranch !== 'ALL' && currentClient !== 'ALL' && <span className="text-blue-400"> · </span>}
                {currentClient !== 'ALL' && <span>{currentClient}</span>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            title="Clear all filters"
            className="text-[10px] bg-blue-800/80 hover:bg-blue-700 text-blue-200 px-2 py-0.5 rounded cursor-pointer shrink-0 ml-1 flex items-center gap-0.5"
          >
            <X size={10} /> Clear
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {label === 'Jobs' && (
              <span className="text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold">
                {openJobsCount}
              </span>
            )}
            {label === 'Candidates' && (
              <span className="text-xs bg-gray-800 text-gray-300 border border-gray-700 rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-medium">
                {filteredCandidatesCount}
              </span>
            )}
            {label === 'Interviews' && filteredInterviewsCount > 0 && (
              <span className="text-xs bg-orange-500 text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold">
                {filteredInterviewsCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Exchange Rate ticker */}
      <div className="px-5 py-2.5 border-t border-gray-800 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">1 USD =</span>
          <span className="text-xs font-bold text-yellow-400">
            {Number(state.settings.exchangeRate).toLocaleString()} MMK
          </span>
        </div>
      </div>

      {/* Footer — current user */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
            {currentUser?.avatar || 'RO'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{currentUser?.name || 'Recruitment Officer'}</p>
            <p className="text-xs text-gray-400 truncate">{currentUser?.role || 'Recruitment Officer'}</p>
          </div>
          <ChevronRight size={14} className="text-gray-500 shrink-0" />
        </div>
      </div>
    </aside>
  )
}
