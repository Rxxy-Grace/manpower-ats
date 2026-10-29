import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, Star, Filter, X, Edit, Trash2, FolderUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import CandidateForm from '../components/forms/CandidateForm'
import BatchFolderUploadModal from '../components/forms/BatchFolderUploadModal'
import { PIPELINE_STAGES, SOURCES, CLIENT_COMPANIES, BRANCHES } from '../data/seedData'

export default function Candidates() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [showModal, setShowModal] = useState(false)
  const [showBatchFolderModal, setShowBatchFolderModal] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [filterStage, setFilterStage] = useState(searchParams.get('stage') || '')
  const [filterSource, setFilterSource] = useState('')
  const [filterJob, setFilterJob] = useState('')

  useEffect(() => {
    const q = searchParams.get('search')
    if (q !== null && q !== search) {
      setSearch(q)
    }
    const st = searchParams.get('stage')
    if (st !== null && st !== filterStage) {
      setFilterStage(st)
    }
  }, [searchParams])

  const currentBranch = state.settings.currentBranch || 'ALL'
  const currentClient = state.settings.currentClient || 'ALL'
  const isFiltered = currentBranch !== 'ALL' || currentClient !== 'ALL'

  const filtered = state.candidates.filter(c => {
    const job = state.jobs.find(j => j.id === c.jobId)

    // Branch filter
    if (currentBranch !== 'ALL' && job && job.branch !== currentBranch) return false

    // Client filter
    if (currentClient !== 'ALL' && job && job.clientCompany !== currentClient) return false

    // Stage filter
    if (filterStage && c.stage !== filterStage) return false

    // Source filter
    if (filterSource && c.source !== filterSource) return false

    // Job filter
    if (filterJob && c.jobId !== filterJob) return false

    // Search query matching (supports multi-term matching on Enter)
    if (search.trim()) {
      const terms = search.toLowerCase().trim().split(/\s+/)
      const searchable = [
        c.firstName,
        c.lastName,
        `${c.firstName} ${c.lastName}`,
        c.email,
        c.phone,
        c.location,
        c.stage,
        c.source,
        c.resumeFileName,
        ...(c.tags || []),
        ...(c.notes || []).map(n => n.text),
        job?.title,
        job?.code,
        job?.clientCompany,
        job?.branch,
        job?.department,
        job?.location,
      ].filter(Boolean).join(' ').toLowerCase()

      const matchesAllTerms = terms.every(term => searchable.includes(term))
      if (!matchesAllTerms) return false
    }

    return true
  })

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (search.trim()) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.set('search', search.trim())
        return next
      })
    } else {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.delete('search')
        return next
      })
    }
  }

  const handleClearSearch = () => {
    setSearch('')
    setSearchParams({})
  }

  const handleAdd = (data) => {
    dispatch({ type: 'ADD_CANDIDATE', payload: data })
    setShowModal(false)
  }

  const handleUpdate = (data) => {
    if (editingCandidate) {
      dispatch({ type: 'UPDATE_CANDIDATE', payload: { ...data, id: editingCandidate.id } })
      setEditingCandidate(null)
    }
  }

  const handleDelete = (c) => {
    if (window.confirm(`Delete candidate "${c.firstName} ${c.lastName}"? This cannot be undone.`)) {
      dispatch({ type: 'DELETE_CANDIDATE', payload: c.id })
    }
  }

  const clientBadgeColor = {
    PTTEP: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    SLB: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    POSCO: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  const branchBadgeColor = {
    HQS: 'bg-blue-100 text-blue-700',
    AQS: 'bg-purple-100 text-purple-700',
    QSL: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Candidates</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} shown · {state.candidates.length} total in talent pool
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={<FolderUp size={15} />}
            onClick={() => setShowBatchFolderModal(true)}
            title="Batch import all CVs from a folder"
          >
            Upload Folder
          </Button>
          <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Active Filter Banner */}
      {(isFiltered || search || filterStage) && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-blue-900 flex items-center gap-1">
              <Filter size={13} className="text-blue-600" /> Active Search & Filters:
            </span>
            {search && (
              <span className="bg-white border border-blue-300 text-blue-800 font-bold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1">
                Keyword: "{search}"
                <button onClick={handleClearSearch} className="hover:text-red-500 ml-1">×</button>
              </span>
            )}
            {currentBranch !== 'ALL' && (
              <span className="bg-white border border-blue-300 text-blue-800 font-semibold px-2 py-0.5 rounded shadow-2xs">
                Branch: {currentBranch}
              </span>
            )}
            {currentClient !== 'ALL' && (
              <span className="bg-white border border-indigo-300 text-indigo-800 font-semibold px-2 py-0.5 rounded shadow-2xs">
                Client: {currentClient}
              </span>
            )}
            {filterStage && (
              <span className="bg-white border border-gray-300 text-gray-800 font-semibold px-2 py-0.5 rounded shadow-2xs">
                Stage: {filterStage}
              </span>
            )}
            <span className="text-blue-700 font-medium">({filtered.length} matches)</span>
          </div>
          <button
            type="button"
            onClick={() => {
              handleClearSearch()
              setFilterStage('')
              setFilterSource('')
              setFilterJob('')
              dispatch({ type: 'RESET_FILTERS' })
            }}
            className="text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer shrink-0"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        {/* Search Input with Form & Enter Support */}
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
            placeholder="Search name, skills, role, client, phone, location... (Enter)"
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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

        {/* Global Client Filter */}
        <select
          value={currentClient}
          onChange={e => dispatch({ type: 'SET_CLIENT_FILTER', payload: e.target.value })}
          className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
            currentClient !== 'ALL' ? 'border-indigo-400 bg-indigo-50/50 text-indigo-900' : 'border-gray-300'
          }`}
        >
          <option value="ALL">All Clients (PTTEP, SLB, POSCO)</option>
          {CLIENT_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Global Branch Filter */}
        <select
          value={currentBranch}
          onChange={e => dispatch({ type: 'SET_BRANCH_FILTER', payload: e.target.value })}
          className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
            currentBranch !== 'ALL' ? 'border-blue-400 bg-blue-50/50 text-blue-900' : 'border-gray-300'
          }`}
        >
          <option value="ALL">All Branches (HQS, AQS, QSL)</option>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <select
          value={filterStage}
          onChange={e => setFilterStage(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Stages</option>
          {PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}
        </select>

        <select
          value={filterJob}
          onChange={e => setFilterJob(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
        >
          <option value="">All Requisitions</option>
          {state.jobs.map(j => <option key={j.id} value={j.id}>{j.code ? `[${j.code}] ` : ''}{j.title}</option>)}
        </select>

        <select
          value={filterSource}
          onChange={e => setFilterSource(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sources</option>
          {SOURCES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Candidate</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Target Requisition & Client</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Source</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Rating</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Applied</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                  <p className="font-medium text-gray-600">No candidates match your keywords and filters</p>
                  <p className="text-xs text-gray-400 mt-1">Try broadening your keywords or resetting filters</p>
                  <button
                    onClick={() => {
                      handleClearSearch()
                      setFilterStage('')
                      setFilterSource('')
                      setFilterJob('')
                      dispatch({ type: 'RESET_FILTERS' })
                    }}
                    className="mt-3 text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    Reset All Filters & Search
                  </button>
                </td>
              </tr>
            ) : (
              filtered.map(c => {
                const job = state.jobs.find(j => j.id === c.jobId)
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/candidates/${c.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={c.avatar} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-gray-500">{c.email} · {c.phone}</p>
                          {c.location && <p className="text-[11px] text-gray-400">{c.location}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-900 line-clamp-1">{job?.title || 'Unknown Role'}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {job?.code && (
                            <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                              {job.code}
                            </span>
                          )}
                          {job?.clientCompany && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${clientBadgeColor[job.clientCompany] || 'bg-gray-100 text-gray-700'}`}>
                              {job.clientCompany}
                            </span>
                          )}
                          {job?.branch && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${branchBadgeColor[job.branch] || 'bg-gray-100 text-gray-700'}`}>
                              {job.branch}
                            </span>
                          )}
                        </div>
                        {c.tags && c.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                            {c.tags.slice(0, 3).map((tag, tIdx) => (
                              <span key={tIdx} className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.2">
                                {tag}
                              </span>
                            ))}
                            {c.tags.length > 3 && (
                              <span className="text-[10px] text-gray-400">+{c.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="stage" value={c.stage}>{c.stage}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {c.source}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={12}
                            className={star <= (c.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {c.appliedAt}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingCandidate(c)}
                          title={`Edit ${c.firstName} ${c.lastName}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          title={`Delete ${c.firstName} ${c.lastName}`}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Candidate Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          title="Add New Candidate Profile & CV"
          onClose={() => setShowModal(false)}
          size="lg"
        >
          <CandidateForm
            jobs={state.jobs}
            onSave={handleAdd}
            onSubmit={handleAdd}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}

      {/* Edit Candidate Modal */}
      {editingCandidate && (
        <Modal
          isOpen={Boolean(editingCandidate)}
          title={`Edit Candidate: ${editingCandidate.firstName} ${editingCandidate.lastName}`}
          onClose={() => setEditingCandidate(null)}
          size="lg"
        >
          <CandidateForm
            initial={editingCandidate}
            jobs={state.jobs}
            onSave={handleUpdate}
            onSubmit={handleUpdate}
            onCancel={() => setEditingCandidate(null)}
          />
        </Modal>
      )}

      {/* Batch Folder Upload Modal */}
      {showBatchFolderModal && (
        <BatchFolderUploadModal
          isOpen={showBatchFolderModal}
          onClose={() => setShowBatchFolderModal(false)}
        />
      )}
    </div>
  )
}
