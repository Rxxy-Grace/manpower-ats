import React, { useState } from 'react'
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

      {/* Interviewers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Interviewers</label>
        <div className="flex flex-wrap gap-2">
          {state.team.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => toggleInterviewer(m.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                form.interviewers.includes(m.id)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {m.name}
            </button>
          ))}
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
