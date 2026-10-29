import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, Users, Edit, Trash2, Plus, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import JobForm from '../components/forms/JobForm'
import CandidateForm from '../components/forms/CandidateForm'
import KanbanBoard from '../components/ui/KanbanBoard'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddCandidate, setShowAddCandidate] = useState(false)
  const [activeTab, setActiveTab] = useState('pipeline')

  const job = state.jobs.find(j => j.id === id)
  if (!job) return (
    <div className="p-6">
      <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Jobs
      </button>
      <p className="text-gray-500">Job not found.</p>
    </div>
  )

  const candidates = state.candidates.filter(c => c.jobId === id)
  const recruiter = state.team.find(t => t.id === job.recruiter)

  const handleUpdate = (data) => {
    dispatch({ type: 'UPDATE_JOB', payload: { ...data, id } })
    setShowEditModal(false)
  }

  const handleDelete = () => {
    if (window.confirm('Delete this job posting? This cannot be undone.')) {
      dispatch({ type: 'DELETE_JOB', payload: id })
      navigate('/jobs')
    }
  }

  const handleAddCandidate = (data) => {
    dispatch({ type: 'ADD_CANDIDATE', payload: { ...data, jobId: id } })
    setShowAddCandidate(false)
  }

  const formatSalary = (s) => {
    if (!s?.min && !s?.max) return 'Not specified'
    const cur = s.currency || 'MMK'
    const rate = s.rateType === 'Daily Rate' ? 'Daily' : 'Monthly'
    const suffix = s.rateType === 'Daily Rate' ? '/ day' : '/ month'
    const exchangeRate = Number(state.settings.exchangeRate) || 3500

    if (cur === 'USD') {
      const minMmk = (Number(s.min) * exchangeRate).toLocaleString()
      const maxMmk = (Number(s.max) * exchangeRate).toLocaleString()
      return `$${Number(s.min).toLocaleString()} – $${Number(s.max).toLocaleString()} USD ${suffix} (≈ ${minMmk} – ${maxMmk} MMK, ${rate})`
    }

    const minUsd = (Number(s.min) / exchangeRate).toFixed(0)
    const maxUsd = (Number(s.max) / exchangeRate).toFixed(0)
    return `${Number(s.min).toLocaleString()} – ${Number(s.max).toLocaleString()} MMK ${suffix} (≈ $${minUsd} – $${maxUsd} USD, ${rate})`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {job.code && (
                <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200">
                  {job.code}
                </span>
              )}
              {job.clientCompany && (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                  {job.clientCompany}
                </span>
              )}
              {job.branch && (
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                  {job.branch} Branch
                </span>
              )}
              {job.employmentType === 'Temp Worker' && job.contractDuration && (
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded flex items-center gap-1">
                  ⏳ {job.contractDuration}
                </span>
              )}
              <Badge variant="status" value={job.status}>{job.status}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-500 mt-0.5 font-medium">{job.department}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Edit size={14} />} onClick={() => setShowEditModal(true)}>
              Edit Job
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-1">Location</p>
            <p className="text-sm font-medium flex items-center gap-1"><MapPin size={13} className="text-gray-400 shrink-0" />{job.location}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Employment Type</p>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-sm font-medium flex items-center gap-1">
                <Clock size={13} className="text-gray-400 shrink-0" />
                {job.employmentType || job.type || 'Permanent Worker'}
              </span>
              {job.contractDuration && (
                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-semibold ml-0.5">
                  ({job.contractDuration})
                </span>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-gray-400 mb-1">Salary ({job.salary?.rateType || 'Monthly Rate'})</p>
            <p className="text-sm font-semibold text-gray-900">{formatSalary(job.salary)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Headcount Required</p>
            <p className="text-sm font-medium">{job.headcount ? `${job.headcount} ${job.headcount === 1 ? 'position' : 'positions'}` : '1 position'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Hiring Manager</p>
            <p className="text-sm font-medium">{job.hiringManager || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Recruiter Assigned</p>
            <p className="text-sm font-medium text-blue-700 font-semibold">{recruiter?.name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Posted Date</p>
            <p className="text-sm font-medium">{job.postedAt || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Closing Date</p>
            <p className="text-sm font-medium">{job.closingDate || '—'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['pipeline', 'description', 'requirements'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'pipeline' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''} in pipeline</p>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAddCandidate(true)}>
              Add Candidate
            </Button>
          </div>
          <KanbanBoard candidates={candidates} />
        </div>
      )}

      {activeTab === 'description' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Job Description</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{job.description || 'No description provided.'}</p>
        </div>
      )}

      {activeTab === 'requirements' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Requirements</h3>
          {job.requirements?.length > 0 ? (
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                  {req}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No requirements listed.</p>
          )}
        </div>
      )}

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Job Requisition" size="xl">
        <JobForm initial={job} onSubmit={handleUpdate} onCancel={() => setShowEditModal(false)} />
      </Modal>

      <Modal isOpen={showAddCandidate} onClose={() => setShowAddCandidate(false)} title="Add Candidate" size="lg">
        <CandidateForm jobs={[job]} onSubmit={handleAddCandidate} onCancel={() => setShowAddCandidate(false)} />
      </Modal>
    </div>
  )
}
