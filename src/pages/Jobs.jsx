import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, MapPin, Clock, Users, Briefcase, Search, Building2, Filter, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import JobForm from '../components/forms/JobForm'
import { DEPARTMENTS, JOB_STATUSES, BRANCHES, CLIENT_COMPANIES } from '../data/seedData'

export default function Jobs() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    const q = searchParams.get('search')
    if (q !== null && q !== search) {
      setSearch(q)
    }
  }, [searchParams])

  const currentBranch = state.settings.currentBranch || 'ALL'
  const currentClient = state.settings.currentClient || 'ALL'
  const isFiltered = currentBranch !== 'ALL' || currentClient !== 'ALL'

  const filtered = state.jobs.filter(j => {
    let matchSearch = true
    if (search.trim()) {
      const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean)
      const jobText = [
        j.title,
        j.code,
        j.department,
        j.clientCompany,
        j.branch,
        j.location,
        j.employmentType,
        j.status,
        j.hiringManager,
        j.description,
        ...(j.requirements || []),
      ].filter(Boolean).join(' ').toLowerCase()

      matchSearch = words.every(word => jobText.includes(word))
    }

    const matchDept = !filterDept || j.department === filterDept
    const matchStatus = !filterStatus || j.status === filterStatus
    const matchBranch = currentBranch === 'ALL' || j.branch === currentBranch
    const matchClient = currentClient === 'ALL' || j.clientCompany === currentClient
    return matchSearch && matchDept && matchStatus && matchBranch && matchClient
  })

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

  const handleCreate = (data) => {
    dispatch({ type: 'ADD_JOB', payload: data })
    setShowModal(false)
  }

  const formatSalary = (salary) => {
    if (!salary?.min && !salary?.max) return 'Salary not specified'
    const cur = salary.currency || 'MMK'
    const suffix = salary.rateType === 'Daily Rate' ? '/ day' : '/ mo'
    if (cur === 'USD') {
      return `$${Number(salary.min).toLocaleString()} – $${Number(salary.max).toLocaleString()} ${suffix}`
    }
    return `${Number(salary.min).toLocaleString()} – ${Number(salary.max).toLocaleString()} MMK ${suffix}`
  }

  const branchBadgeColor = {
    HQS: 'bg-blue-100 text-blue-700 border-blue-200',
    AQS: 'bg-purple-100 text-purple-700 border-purple-200',
    QSL: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }

  const clientBadgeColor = {
    PTTEP: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    SLB: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    POSCO: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Job Postings</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} shown · {state.jobs.length} total across all clients & branches
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
          Post a Job
        </Button>
      </div>

      {/* Active Filter Banner */}
      {(isFiltered || search || filterDept || filterStatus) && (
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
            {filterDept && (
              <span className="bg-white border border-gray-300 text-gray-800 font-semibold px-2 py-0.5 rounded shadow-2xs">
                Dept: {filterDept}
              </span>
            )}
            {filterStatus && (
              <span className="bg-white border border-gray-300 text-gray-800 font-semibold px-2 py-0.5 rounded shadow-2xs">
                Status: {filterStatus}
              </span>
            )}
            <span className="text-blue-600 font-medium">({filtered.length} matching jobs)</span>
          </div>
          <button
            type="button"
            onClick={() => {
              handleClearSearch()
              setFilterDept('')
              setFilterStatus('')
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
            placeholder="Search title, req code, department, client, location… (Enter)"
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

        {/* Client dropdown connected to global state */}
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

        {/* Branch dropdown connected to global state */}
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
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {JOB_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>

        <select
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Job Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white border border-gray-200 rounded-xl">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-600">No jobs found matching your keywords and filters</p>
          <p className="text-xs text-gray-400 mt-1">Try broadening your search keywords or resetting filters</p>
          <button
            onClick={() => {
              handleClearSearch()
              setFilterDept('')
              setFilterStatus('')
              dispatch({ type: 'RESET_FILTERS' })
            }}
            className="mt-3 text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Reset All Filters & Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(job => {
            const applicantCount = state.candidates.filter(c => c.jobId === job.id).length
            const recruiter = state.team.find(t => t.id === job.recruiter)
            return (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {job.code && (
                      <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {job.code}
                      </span>
                    )}
                    {job.clientCompany && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${clientBadgeColor[job.clientCompany] || 'bg-gray-100 text-gray-700'}`}>
                        {job.clientCompany}
                      </span>
                    )}
                    {job.branch && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${branchBadgeColor[job.branch] || 'bg-gray-100 text-gray-700'}`}>
                        {job.branch} Branch
                      </span>
                    )}
                    {job.employmentType === 'Temp Worker' && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        ⏳ Temp {job.contractDuration ? `· ${job.contractDuration}` : ''}
                      </span>
                    )}
                    <Badge variant="status" value={job.status} className="ml-auto">
                      {job.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{job.department}</p>
                  <p className="text-xs font-semibold text-blue-700 mt-2 bg-blue-50/60 rounded px-2 py-1 inline-block">
                    {formatSalary(job.salary)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={13} className="text-gray-400 shrink-0" />
                    <span className="truncate max-w-[130px]">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-gray-700">
                    <Users size={13} className="text-blue-600" />
                    <span>{applicantCount} candidates</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Job Modal */}
      {showModal && (
        <Modal isOpen={showModal} title="Post a New Job Requisition" onClose={() => setShowModal(false)} size="xl">
          <JobForm onSave={handleCreate} onCancel={() => setShowModal(false)} />
        </Modal>
      )}
    </div>
  )
}
