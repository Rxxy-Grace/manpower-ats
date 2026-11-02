import React, { useState } from 'react'
import { Users, Check } from 'lucide-react'
import Button from '../ui/Button'
import { useApp } from '../../context/AppContext'

const INTERVIEW_TYPES = ['Phone Screen', 'Technical Interview', 'Final Interview', 'Culture Fit', 'HR Interview']
const LOCATIONS = ['Google Meet', 'Zoom', 'Microsoft Teams', 'On-site', 'Phone Call']
const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No Show']

export default function InterviewForm({ initial = {}, candidateId, jobId, onSubmit, onCancel }) {
  const { state } = useApp()
  const [form, setForm] = useState({
    candidateId: initial.candidateId || candidateId || '',
    jobId: initial.jobId || jobId || '',
    type: initial.type || 'Technical Interview',
    date: initial.date || '',
    time: initial.time || '10:00',
    duration: initial.duration || 60,
    location: initial.location || 'Google Meet',
    link: initial.link || '',
    interviewers: initial.interviewers || [],
    status: initial.status || 'Scheduled',
    notes: initial.notes || '',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleInterviewer = (id) => {
    setForm(f => ({
      ...f,
      interviewers: f.interviewers.includes(id)
        ? f.interviewers.filter(i => i !== id)
        : [...f.interviewers, id],
    }))
  }

  const candidate = state.candidates.find(c => c.id === form.candidateId)
  const job = state.jobs.find(j => j.id === form.jobId)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Candidate & Job (readonly if pre-filled) */}
      {!candidateId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Candidate *</label>
          <select
            required
            value={form.candidateId}
            onChange={e => {
              const c = state.candidates.find(c => c.id === e.target.value)
              set('candidateId', e.target.value)
              if (c) set('jobId', c.jobId)
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select candidate…</option>
            {state.candidates.map(c => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
            ))}
          </select>
        </div>
      )}

      {candidate && (
        <div className="bg-blue-50 rounded-lg p-3 text-sm">
          <p className="font-medium text-blue-900">{candidate.firstName} {candidate.lastName}</p>
          <p className="text-blue-600 text-xs">{job?.title || 'Unknown Role'}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
          <select
            value={form.type}
            onChange={e => set('type', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {INTERVIEW_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input
            required
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
          <input
            required
            type="time"
            value={form.time}
            onChange={e => set('time', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
          <select
            value={form.duration}
            onChange={e => set('duration', Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            value={form.location}
            onChange={e => set('location', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
          <input
            type="url"
            value={form.link}
            onChange={e => set('link', e.target.value)}
            placeholder="https://meet.google.com/..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Interview Panel Section */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Users size={14} className="text-blue-600" />
            Interview Panel Members ({form.interviewers.length} Selected)
          </label>
          {job && (job.hiringManager || job.reviewer || job.approvalPerson) && (
            <button
              type="button"
              onClick={() => {
                const govIds = [
                  job.hiringManager && `hm:${job.hiringManager}`,
                  job.reviewer && `rev:${job.reviewer}`,
                  job.approvalPerson && `appr:${job.approvalPerson}`,
                ].filter(Boolean)
                setForm(f => {
                  const set = new Set([...f.interviewers, ...govIds])
                  return { ...f, interviewers: Array.from(set) }
                })
              }}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
            >
              + Select All 3 Key Reviewers
            </button>
          )}
        </div>

        {/* 1. Job Review & Approval Governance Panel */}
        {job && (job.hiringManager || job.reviewer || job.approvalPerson) && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Position Review & Approval Authorities:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {job.hiringManager && (
                <button
                  type="button"
                  onClick={() => toggleInterviewer(`hm:${job.hiringManager}`)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    form.interviewers.includes(`hm:${job.hiringManager}`)
                      ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-400 text-indigo-900'
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="text-base">👔</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-indigo-600 leading-none">Hiring Manager</p>
                    <p className="text-xs font-bold truncate mt-0.5">{job.hiringManager}</p>
                  </div>
                  {form.interviewers.includes(`hm:${job.hiringManager}`) && (
                    <Check size={14} className="text-indigo-600 shrink-0" />
                  )}
                </button>
              )}

              {job.reviewer && (
                <button
                  type="button"
                  onClick={() => toggleInterviewer(`rev:${job.reviewer}`)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    form.interviewers.includes(`rev:${job.reviewer}`)
                      ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-400 text-purple-900'
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="text-base">📑</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-purple-600 leading-none">Reviewer (Dept Head)</p>
                    <p className="text-xs font-bold truncate mt-0.5">{job.reviewer}</p>
                  </div>
                  {form.interviewers.includes(`rev:${job.reviewer}`) && (
                    <Check size={14} className="text-purple-600 shrink-0" />
                  )}
                </button>
              )}

              {job.approvalPerson && (
                <button
                  type="button"
                  onClick={() => toggleInterviewer(`appr:${job.approvalPerson}`)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    form.interviewers.includes(`appr:${job.approvalPerson}`)
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-400 text-emerald-900'
                      : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="text-base">✍️</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-emerald-600 leading-none">Approval Person</p>
                    <p className="text-xs font-bold truncate mt-0.5">{job.approvalPerson}</p>
                  </div>
                  {form.interviewers.includes(`appr:${job.approvalPerson}`) && (
                    <Check size={14} className="text-emerald-600 shrink-0" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. HR Recruitment Team Members */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            HR Team & Recruiters:
          </p>
          <div className="flex flex-wrap gap-2">
            {state.team.map(m => {
              const isSelected = form.interviewers.includes(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleInterviewer(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <span>👤 {m.name}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                    ({m.branch || m.department})
                  </span>
                  {isSelected && <Check size={12} className="shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Interview focus areas, specific questions to cover..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">
          {initial.id ? 'Save Changes' : 'Schedule Interview'}
        </Button>
      </div>
    </form>
  )
}
