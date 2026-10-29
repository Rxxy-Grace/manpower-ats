import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { Briefcase, Users, Calendar, Award, Filter, X, ArrowRight, CheckCircle2, ChevronRight, TrendingUp } from 'lucide-react'
import StatsCard from '../components/ui/StatsCard'
import { useApp } from '../context/AppContext'
import { PIPELINE_STAGES } from '../data/seedData'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444']

const STAGE_GRADIENTS = {
  'Applied': 'from-blue-500 to-blue-600',
  'Screening': 'from-indigo-500 to-purple-600',
  'Interview': 'from-emerald-500 to-teal-600',
  'Medical Check': 'from-amber-500 to-orange-500',
  'Offer Sent': 'from-orange-500 to-rose-500',
  'Deployed': 'from-cyan-500 to-blue-600',
}

const STAGE_ICONS = {
  'Applied': '📥',
  'Screening': '🔍',
  'Interview': '💬',
  'Medical Check': '🩺',
  'Offer Sent': '📄',
  'Deployed': '🚀',
}

const STAGE_CONFIG = [
  { stage: 'Applied', color: 'bg-gray-100 text-gray-800 border-gray-300', dot: 'bg-gray-500' },
  { stage: 'Screening', color: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  { stage: 'Interview', color: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  { stage: 'Medical Check', color: 'bg-orange-50 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  { stage: 'Offer Sent', color: 'bg-yellow-50 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
  { stage: 'Deployed', color: 'bg-green-50 text-green-800 border-green-200', dot: 'bg-green-600' },
  { stage: 'Rejected', color: 'bg-red-50 text-red-800 border-red-200', dot: 'bg-red-500' },
]

export default function Dashboard() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const currentBranch = state.settings.currentBranch || 'ALL'
  const currentClient = state.settings.currentClient || 'ALL'
  const isFiltered = currentBranch !== 'ALL' || currentClient !== 'ALL'

  // Filter jobs by currentBranch and currentClient
  const filteredJobs = state.jobs.filter(j => {
    const matchBranch = currentBranch === 'ALL' || j.branch === currentBranch
    const matchClient = currentClient === 'ALL' || j.clientCompany === currentClient
    return matchBranch && matchClient
  })
  const filteredJobIds = new Set(filteredJobs.map(j => j.id))

  // Filter candidates whose job matches the filtered jobs
  const filteredCandidates = state.candidates.filter(c => filteredJobIds.has(c.jobId))
  const filteredCandidateIds = new Set(filteredCandidates.map(c => c.id))

  // Filter interviews belonging to filtered jobs or candidates
  const filteredInterviews = state.interviews.filter(i =>
    filteredJobIds.has(i.jobId) || filteredCandidateIds.has(i.candidateId)
  )

  const openJobs = filteredJobs.filter(j => j.status === 'Open').length
  const totalCandidates = filteredCandidates.length
  const scheduledInterviews = filteredInterviews.filter(i => i.status === 'Scheduled').length
  const hiredCount = filteredCandidates.filter(c => c.stage === 'Deployed' || c.stage === 'Hired').length

  // Applications per job
  const appsByJob = filteredJobs.map(j => ({
    name: j.code ? `${j.code}` : j.title.split(' ').slice(0, 2).join(' '),
    fullName: `${j.code || ''} ${j.title} (${j.clientCompany})`,
    count: filteredCandidates.filter(c => c.jobId === j.id).length,
  }))

  // Pipeline funnel data
  const funnelData = PIPELINE_STAGES.filter(s => !['Rejected'].includes(s)).map((stage, i) => ({
    name: stage,
    value: filteredCandidates.filter(c => c.stage === stage).length,
    fill: COLORS[i % COLORS.length],
  }))

  // Source breakdown
  const sourceCounts = filteredCandidates.reduce((acc, c) => {
    acc[c.source] = (acc[c.source] || 0) + 1
    return acc
  }, {})
  const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }))

  // Applications over time (by applied month)
  const appsByMonth = filteredCandidates.reduce((acc, c) => {
    const month = c.appliedAt?.slice(0, 7) || 'Unknown'
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})
  const timelineData = Object.entries(appsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month: month.slice(5) + '/' + month.slice(2, 4), count }))

  // Recent candidates
  const recentCandidates = [...filteredCandidates]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
    .slice(0, 5)

  // Upcoming interviews
  const upcomingInterviews = filteredInterviews
    .filter(i => i.status === 'Scheduled')
    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
    .slice(0, 4)

  return (
    <div className="p-6 space-y-6">
      {/* Active Filter Banner */}
      {isFiltered ? (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              <Filter size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Active View Filter:</span>
                {currentBranch !== 'ALL' && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                    {currentBranch} Branch
                  </span>
                )}
                {currentClient !== 'ALL' && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                    Client: {currentClient}
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-800 mt-1">
                Showing <strong>{filteredJobs.length}</strong> jobs · <strong>{totalCandidates}</strong> candidates · <strong>{filteredInterviews.length}</strong> interviews in this ATS workflow
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_FILTERS' })}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <X size={14} /> Clear Filter (Show All)
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-gray-700">Master View:</span>
            <span>All Branches (HQS, AQS, QSL) · All Clients (PTTEP, SLB, POSCO)</span>
          </div>
          <span className="text-gray-400">Click any Branch or Client Company in the sidebar to filter the ATS flow</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Open Roles"
          value={openJobs}
          icon={Briefcase}
          color="blue"
          trend={openJobs}
          trendLabel="active openings"
        />
        <StatsCard
          label="Active Candidates"
          value={totalCandidates}
          icon={Users}
          color="purple"
          trend={totalCandidates}
          trendLabel="in current talent pool"
        />
        <StatsCard
          label="Interviews Scheduled"
          value={scheduledInterviews}
          icon={Calendar}
          color="orange"
          trend={scheduledInterviews}
          trendLabel="upcoming"
        />
        <StatsCard
          label="Deployed Workers"
          value={hiredCount}
          icon={Award}
          color="green"
          trend={hiredCount}
          trendLabel="placed at client sites"
        />
      </div>

      {/* ATS Recruitment Flow Stepper */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              ATS Recruitment Workflow & Talent Pipeline
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Live candidate count across all recruitment milestones {isFiltered ? `for ${currentBranch !== 'ALL' ? currentBranch : ''} ${currentClient !== 'ALL' ? currentClient : ''}` : 'across all clients'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/candidates')}
            className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Manage Candidates <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {STAGE_CONFIG.map(({ stage, color, dot }) => {
            const count = filteredCandidates.filter(c => c.stage === stage).length
            const pct = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0
            return (
              <div
                key={stage}
                onClick={() => navigate('/candidates')}
                className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${color} flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className="text-[10px] font-bold opacity-75">{pct}%</span>
                </div>
                <div>
                  <p className="text-xl font-extrabold leading-none">{count}</p>
                  <p className="text-xs font-semibold mt-1 truncate">{stage}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications per Job */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Applications by Requisition</h3>
            <span className="text-xs text-gray-400">{filteredJobs.length} jobs</span>
          </div>
          {appsByJob.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
              No jobs matching active filter
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={appsByJob} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Source Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Candidate Sourcing Channels</h3>
          {sourceData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
              No candidate sourcing data
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                    {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                {sourceData.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-600 flex-1 truncate">{s.name}</span>
                    <span className="text-xs font-semibold text-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-blue-600" />
                  Recruitment Conversion Funnel
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Pipeline stage distribution & progression</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {totalCandidates} Total
              </span>
            </div>

            <div className="space-y-3">
              {funnelData.map((stage) => {
                const maxStageCount = Math.max(...funnelData.map(d => d.value), 1)
                const barWidth = stage.value > 0 ? Math.min(Math.round((stage.value / maxStageCount) * 100), 100) : 0
                const sharePct = totalCandidates > 0 ? Math.round((stage.value / totalCandidates) * 100) : 0
                const gradient = STAGE_GRADIENTS[stage.name] || 'from-blue-500 to-indigo-600'
                const icon = STAGE_ICONS[stage.name] || '•'

                return (
                  <div
                    key={stage.name}
                    onClick={() => navigate(`/candidates?stage=${encodeURIComponent(stage.name)}`)}
                    className="group cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition-all"
                    title={`View ${stage.value} candidates in ${stage.name}`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5 font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        <span className="text-xs">{icon}</span>
                        <span className="font-semibold">{stage.name}</span>
                        {stage.value > 0 && (
                          <span className="text-[10px] text-gray-400 font-normal">
                            ({sharePct}%)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold px-2 py-0.2 rounded-full ${
                          stage.value > 0 ? 'bg-slate-100 text-slate-800' : 'bg-gray-50 text-gray-400'
                        }`}>
                          {stage.value}
                        </span>
                        <ChevronRight size={12} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>

                    {/* Progress Track with Guaranteed Containment (No Overflow) */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Funnel Highlights Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
              <span className="text-[10px] text-gray-500 uppercase font-semibold block">Screening Pass</span>
              <span className="text-sm font-bold text-indigo-700">
                {funnelData.find(d => d.name === 'Screening')?.value || 0}
              </span>
            </div>
            <div className="bg-emerald-50/70 rounded-lg p-2 border border-emerald-100">
              <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Deployed / Hired</span>
              <span className="text-sm font-bold text-emerald-700">
                {hiredCount}
              </span>
            </div>
          </div>
        </div>

        {/* Applications Over Time */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Application Velocity Over Time</h3>
          {timelineData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-gray-400">
              No application history available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={timelineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Candidates */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Recent Candidates</h3>
            <button onClick={() => navigate('/candidates')} className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          {recentCandidates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No candidates matching active filter</p>
          ) : (
            <div className="space-y-3">
              {recentCandidates.map(c => {
                const job = state.jobs.find(j => j.id === c.jobId)
                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/candidates/${c.id}`)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Avatar initials={c.avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {job?.clientCompany && <span className="font-semibold text-gray-700">[{job.clientCompany}] </span>}
                        {job?.title || 'Unknown Role'}
                      </p>
                    </div>
                    <Badge variant="stage" value={c.stage}>{c.stage}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Upcoming Interviews</h3>
            <button onClick={() => navigate('/interviews')} className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          {upcomingInterviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No scheduled interviews matching active filter</p>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map(iv => {
                const candidate = state.candidates.find(c => c.id === iv.candidateId)
                const job = state.jobs.find(j => j.id === iv.jobId)
                return (
                  <div
                    key={iv.id}
                    onClick={() => navigate('/interviews')}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {job?.clientCompany ? `[${job.clientCompany}] ` : ''}{iv.type} · {iv.date} at {iv.time}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{iv.duration}min</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
