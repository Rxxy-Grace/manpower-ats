import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Calendar, Clock, MapPin, ExternalLink, Trash2, Edit, Video, Filter, Search, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import InterviewForm from '../components/forms/InterviewForm'

const STATUS_OPTIONS = ['All', 'Scheduled', 'Completed', 'Cancelled', 'No Show']

export default function Interviews() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [showModal, setShowModal] = useState(false)
  const [editInterview, setEditInterview] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const q = searchParams.get('search')
    if (q !== null && q !== search) {
      setSearch(q)
    }
  }, [searchParams])

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

  const filtered = state.interviews.filter(i => {
    const job = state.jobs.find(j => j.id === i.jobId)
    const candidate = state.candidates.find(c => c.id === i.candidateId)
    const interviewers = i.interviewers?.map(tid => state.team.find(t => t.id === tid)).filter(Boolean) || []

    const matchJob = filteredJobIds.has(i.jobId)
    const matchStatus = filterStatus === 'All' || i.status === filterStatus

    let matchSearch = true
    if (search.trim()) {
      const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean)
      const interviewText = [
        candidate ? `${candidate.firstName} ${candidate.lastName}` : '',
        candidate?.email,
        candidate?.phone,
        job?.title,
        job?.code,
        job?.clientCompany,
        job?.branch,
        i.type,
        i.location,
        i.status,
        i.notes,
        i.date,
        ...interviewers.map(m => m.name),
      ].filter(Boolean).join(' ').toLowerCase()

      matchSearch = words.every(word => interviewText.includes(word))
    }

    return matchJob && matchStatus && matchSearch
  }).sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (search.trim()) {
      setSearchParams({ search: search.trim() })
    } else {
      setSearchParams({})
    }
  }

  const handleClearSearch = () => {
    setSearch('')
    setSearchParams({})
  }

  const handleAdd = (data) => {
    dispatch({ type: 'ADD_INTERVIEW', payload: data })
    setShowModal(false)
  }

  const handleUpdate = (data) => {
    dispatch({ type: 'UPDATE_INTERVIEW', payload: { ...data, id: editInterview.id } })
    setEditInterview(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this interview?')) {
      dispatch({ type: 'DELETE_INTERVIEW', payload: id })
    }
  }

  const groupByDate = filtered.reduce((acc, iv) => {
    const date = iv.date || 'TBD'
    if (!acc[date]) acc[date] = []
    acc[date].push(iv)
    return acc
  }, {})

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Interviews</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.filter(i => i.status === 'Scheduled').length} scheduled · {filtered.length} shown
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
          Schedule Interview
        </Button>
      </div>

      {/* Active Filter Banner */}
      {(isFiltered || search || filterStatus !== 'All') && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-blue-900 flex items-center gap-1">
              <Filter size={13} className="text-blue-600" /> Active Search & Filters:
            </span>
            {search && (
              <span className="bg-white border border-blue-300 text-blue-800 font-bold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                Keywords: "{search}"
                <button type="button" onClick={handleClearSearch} className="hover:text-red-600 font-extrabold cursor-pointer">×</button>
              </span>
            )}
            {filterStatus !== 'All' && (
              <span className="bg-white border border-gray-300 text-gray-800 font-semibold px-2 py-0.5 rounded shadow-2xs">
                Status: {filterStatus}
              </span>
            )}
            {currentBranch !== 'ALL' && (
              <span className="bg-white border border-blue-300 text-blue-800 font-bold px-2 py-0.5 rounded shadow-2xs">
                Branch: {currentBranch}
              </span>
            )}
            {currentClient !== 'ALL' && (
              <span className="bg-white border border-indigo-300 text-indigo-800 font-bold px-2 py-0.5 rounded shadow-2xs">
                Client: {currentClient}
              </span>
            )}
            <span className="text-blue-600 font-medium">({filtered.length} matching interviews)</span>
          </div>
          <button
            type="button"
            onClick={() => {
              handleClearSearch()
              setFilterStatus('All')
              dispatch({ type: 'RESET_FILTERS' })
            }}
            className="text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer shrink-0"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        {/* Keyword Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSearchSubmit(e)
              }
            }}
            placeholder="Search candidate, role, client, interviewer… (Enter)"
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Status Filter Buttons */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterStatus === s
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Interview List by Date */}
      {Object.keys(groupByDate).length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white border border-gray-200 rounded-xl">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">No interviews found</p>
          <p className="text-xs text-gray-400 mt-1">
            {search ? 'Try clearing or changing your search keywords.' : 'No interviews match the current filters.'}
          </p>
          {(isFiltered || search || filterStatus !== 'All') && (
            <button
              onClick={() => {
                handleClearSearch()
                setFilterStatus('All')
                dispatch({ type: 'RESET_FILTERS' })
              }}
              className="mt-3 text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupByDate).map(([date, interviews]) => {
            const isToday = date === today
            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {date}
                  </span>
                  {isToday && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Today
                    </span>
                  )}
                  <span className="text-xs text-gray-400">({interviews.length})</span>
                </div>

                <div className="space-y-3">
                  {interviews.map(iv => {
                    const candidate = state.candidates.find(c => c.id === iv.candidateId)
                    const job = state.jobs.find(j => j.id === iv.jobId)
                    const interviewers = iv.interviewers?.map(tid => state.team.find(t => t.id === tid)).filter(Boolean) || []

                    return (
                      <div key={iv.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-start gap-4">
                            {/* Time block */}
                            <div className="text-center bg-gray-50 rounded-lg px-3 py-2 min-w-[64px] shrink-0 border border-gray-100">
                              <p className="text-sm font-bold text-gray-800">{iv.time}</p>
                              <p className="text-xs text-gray-400">{iv.duration}min</p>
                            </div>

                            {/* Info */}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-gray-900">{iv.type}</p>
                                <Badge variant="status" value={iv.status}>{iv.status}</Badge>
                                {job?.clientCompany && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {job.clientCompany}
                                  </span>
                                )}
                                {job?.branch && (
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                    {job.branch}
                                  </span>
                                )}
                              </div>
                              {candidate && (
                                <button
                                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                                  className="flex items-center gap-2 mt-1.5 hover:text-blue-600 text-left"
                                >
                                  <Avatar initials={candidate.avatar} size="xs" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">
                                      {candidate.firstName} {candidate.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">{job?.title || '—'}</p>
                                  </div>
                                </button>
                              )}
                              <div className="flex items-center gap-4 mt-2 flex-wrap">
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin size={11} /> {iv.location}
                                </span>
                                {interviewers.length > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock size={11} />
                                    {interviewers.map(m => m.name).join(', ')}
                                  </span>
                                )}
                              </div>
                              {iv.notes && (
                                <p className="text-xs text-gray-500 mt-1.5 italic">"{iv.notes}"</p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {iv.link && (
                              <a
                                href={iv.link}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100"
                              >
                                <Video size={12} /> Join
                              </a>
                            )}
                            <button
                              onClick={() => setEditInterview(iv)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(iv.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Schedule / Edit Modal */}
      {(showModal || editInterview) && (
        <Modal
          isOpen={true}
          title={editInterview ? 'Edit Interview' : 'Schedule Interview'}
          onClose={() => { setShowModal(false); setEditInterview(null) }}
          size="md"
        >
          <InterviewForm
            initial={editInterview || {}}
            onSave={editInterview ? handleUpdate : handleAdd}
            onCancel={() => { setShowModal(false); setEditInterview(null) }}
          />
        </Modal>
      )}
    </div>
  )
}
