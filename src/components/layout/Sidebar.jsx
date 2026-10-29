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
  Lock,
  LogOut,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/candidates', icon: Users, label: 'Candidates' },
  { to: '/interviews', icon: Calendar, label: 'Interviews' },
  { to: '/team', icon: UserCircle, label: 'Team', perm: 'canManageTeam' },
  { to: '/templates', icon: Mail, label: 'Email Templates', perm: 'canManageTemplates' },
  { to: '/settings', icon: Settings, label: 'Settings', perm: 'canManageSettings' },
]

export default function Sidebar() {
  const { state, dispatch, logout, currentUser, userRoleConfig, hasPermission } = useApp()
  const canAllBranches = hasPermission('canAccessAllBranches')

  const currentBranch = state.settings.currentBranch || 'ALL'
  const currentClient = state.settings.currentClient || 'ALL'

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
    if (!canAllBranches && currentUser?.branch && branch !== currentUser.branch) {
      return // locked to assigned branch
    }
    const next = currentBranch === branch ? 'ALL' : branch
    dispatch({ type: 'SET_BRANCH_FILTER', payload: next })
  }

  const handleClientClick = (client) => {
    if (client === 'ALL') {
      dispatch({ type: 'SET_CLIENT_FILTER', payload: 'ALL' })
      return
    }
    const next = currentClient === client ? 'ALL' : client
    dispatch({ type: 'SET_CLIENT_FILTER', payload: next })
  }

  const visibleNavItems = navItems.filter(item => {
    if (!item.perm) return true
    return hasPermission(item.perm)
  })

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0 shrink-0 select-none">
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
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              Branch Filter {!canAllBranches && <Lock size={10} className="text-amber-400" />}
            </span>
            {currentBranch !== 'ALL' && canAllBranches && (
              <button
                type="button"
                onClick={() => handleBranchClick('ALL')}
                className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                Reset
              </button>
            )}
            {!canAllBranches && (
              <span className="text-[10px] text-amber-300/90 font-bold">Assigned</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {['ALL', 'HQS', 'AQS', 'QSL'].map(branch => {
              const isAssigned = canAllBranches || (currentUser?.branch === branch)
              const isActive = currentBranch === branch
              const count = branch === 'ALL'
                ? state.jobs.length
                : state.jobs.filter(j => j.branch === branch).length

              return (
                <button
                  key={branch}
                  type="button"
                  disabled={!isAssigned}
                  onClick={() => handleBranchClick(branch)}
                  title={!isAssigned ? `Restricted to ${currentUser?.branch} branch` : `Filter by ${branch === 'ALL' ? 'All branches' : branch} (${count} jobs)`}
                  className={`py-1.5 px-1 rounded-lg font-bold text-xs transition-all flex flex-col items-center justify-center ${
                    !isAssigned
                      ? 'opacity-30 cursor-not-allowed bg-gray-800/40 text-gray-500'
                      : 'cursor-pointer ' + (isActive
                        ? branch === 'ALL'
                          ? 'bg-slate-700 text-white shadow-md ring-2 ring-slate-400'
                          : `${branchColors[branch]} text-white shadow-md ring-2 ring-white/30`
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white')
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
              className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              All Clients
            </button>
          )}
        </div>
        <div className="space-y-1">
          {[
            { id: 'ALL', name: 'All Clients', sub: 'All Corporate Partners' },
            { id: 'PTTEP', name: 'PTTEP', sub: 'Offshore Exploration' },
            { id: 'SLB', name: 'SLB (Schlumberger)', sub: 'Oilfield Services' },
            { id: 'POSCO', name: 'POSCO International', sub: 'Gas Pipeline' },
          ].map(client => {
            const count = client.id === 'ALL'
              ? state.jobs.length
              : state.jobs.filter(j => j.clientCompany === client.id).length
            const isSelected = currentClient === client.id
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => handleClientClick(client.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/30 border border-blue-500/50 text-blue-200'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className={`font-semibold truncate ${isSelected ? 'text-white' : ''}`}>{client.name}</p>
                  <p className="text-[10px] text-gray-400 leading-none truncate">{client.sub}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                  isSelected ? 'bg-blue-500 text-white font-bold' : 'bg-gray-800 text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map(({ to, icon: Icon, label }) => (
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

      {/* Footer — Current User Session */}
      <div className="px-4 py-3.5 border-t border-gray-800 bg-gray-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            {currentUser?.avatar || 'HY'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Daw Hnin Yu Maw'}</p>
            <p className="text-[10px] text-gray-400 truncate">{currentUser?.title || 'Managing Director'}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
