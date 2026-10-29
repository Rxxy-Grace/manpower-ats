import React, { useState } from 'react'
import Button from '../ui/Button'
import ResumeDropzone from '../ui/ResumeDropzone'
import { SOURCES, PIPELINE_STAGES } from '../../data/seedData'
import { useApp } from '../../context/AppContext'
import { Sparkles, FileText, CheckCircle2, User, Mail, Phone, MapPin, Briefcase, Tag, FileSpreadsheet } from 'lucide-react'

export default function CandidateForm({ initial = {}, jobs = [], onSubmit, onSave, onCancel }) {
  const { state } = useApp()
  const availableJobs = jobs && jobs.length > 0 ? jobs : state.jobs
  const submitFn = onSubmit || onSave

  const [form, setForm] = useState({
    firstName: initial.firstName || '',
    lastName: initial.lastName || '',
    email: initial.email || '',
    phone: initial.phone || '',
    location: initial.location || '',
    jobId: initial.jobId || (availableJobs[0]?.id || ''),
    stage: initial.stage || 'Applied',
    source: initial.source || 'In-house CV Bank',
    linkedIn: initial.linkedIn || '',
    resumeUrl: initial.resumeUrl || '',
    tags: (initial.tags || []).join(', '),
    avatar: initial.avatar || '',
    resumeFileName: initial.resumeFileName || '',
    notesText: '',
  })

  const [autoFilledFields, setAutoFilledFields] = useState([])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // ── Called when ResumeDropzone finishes parsing ──────────────────────────
  const handleResumeParsed = (parsed, file) => {
    const filled = []

    setForm(prev => {
      const next = { ...prev }

      const tryFill = (key, value) => {
        if (value) {
          next[key] = value
          filled.push(key)
        }
      }

      tryFill('firstName', parsed.firstName)
      tryFill('lastName', parsed.lastName)
      tryFill('email', parsed.email)
      tryFill('phone', parsed.phone)
      tryFill('location', parsed.location)
      tryFill('linkedIn', parsed.linkedIn)
      if (parsed.jobId) tryFill('jobId', parsed.jobId)

      // Tags: merge existing + new
      const existingTags = prev.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
      const newTags = parsed.tags || []
      const mergedTags = [...new Set([...existingTags, ...newTags])].join(', ')
      if (mergedTags) {
        next.tags = mergedTags
        filled.push('tags')
      }

      // Avatar initials
      const f = parsed.firstName || prev.firstName
      const l = parsed.lastName || prev.lastName
      if (f || l) {
        next.avatar = `${f[0] || '?'}${l[0] || '?'}`.toUpperCase()
      }

      // Store filename as resume reference
      if (file) {
        next.resumeFileName = file.name
        next.resumeUrl = '#'
        filled.push('resumeFileName')
      }

      return next
    })

    setAutoFilledFields(filled)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const avatarStr = form.avatar || `${form.firstName[0] || '?'}${form.lastName[0] || '?'}`
    const payload = {
      ...form,
      avatar: avatarStr.toUpperCase(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      notes: form.notesText ? [{ text: form.notesText, author: state.settings?.currentUser || 't1' }] : [],
    }

    if (submitFn) {
      submitFn(payload)
    }
  }

  const isAutoFilled = (key) => autoFilledFields.includes(key)

  // Highlight class for auto-filled fields
  const fieldClass = (key) => `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
    isAutoFilled(key)
      ? 'border-green-400 bg-green-50 ring-1 ring-green-300'
      : 'border-gray-300 bg-white'
  }`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── CV / Resume Dropzone Template ─────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600" />
            <h4 className="text-sm font-bold text-gray-800">CV / Resume Drop Zone (Auto-Fill Engine)</h4>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
            PDF & DOCX Support
          </span>
        </div>

        <ResumeDropzone onParsed={handleResumeParsed} />

        {/* Auto-fill notification */}
        {autoFilledFields.length > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle2 size={16} className="text-green-600 shrink-0" />
            <p className="text-xs text-green-800">
              <span className="font-bold">{autoFilledFields.length} fields</span> successfully auto-filled from CV! Fields highlighted in green can be adjusted below.
            </p>
          </div>
        )}
      </div>

      {/* ── Candidate Information Template ─────────────────────────── */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
            <User size={13} className="text-blue-600" />
            Candidate Profile Template
          </p>
          <span className="text-xs text-gray-400">* Required fields</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name * {isAutoFilled('firstName') && <span className="text-xs text-green-600 font-semibold">✓ auto-filled</span>}
            </label>
            <input
              required
              value={form.firstName}
              onChange={e => set('firstName', e.target.value)}
              placeholder="e.g. Kyaw Lin"
              className={fieldClass('firstName')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name * {isAutoFilled('lastName') && <span className="text-xs text-green-600 font-semibold">✓ auto-filled</span>}
            </label>
            <input
              required
              value={form.lastName}
              onChange={e => set('lastName', e.target.value)}
              placeholder="e.g. Tun"
              className={fieldClass('lastName')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email * {isAutoFilled('email') && <span className="text-xs text-green-600 font-semibold">✓ auto-filled</span>}
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="e.g. candidate@gmail.com"
              className={fieldClass('email')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number {isAutoFilled('phone') && <span className="text-xs text-green-600 font-semibold">✓ auto-filled</span>}
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="e.g. +95 9 420 188 231"
              className={fieldClass('phone')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location / Township {isAutoFilled('location') && <span className="text-xs text-green-600 font-semibold">✓ auto-filled</span>}
            </label>
            <input
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="e.g. Yangon, Mandalay, Dawei"
              className={fieldClass('location')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Requisition & Client *
            </label>
            <select
              required
              value={form.jobId}
              onChange={e => set('jobId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            >
              {availableJobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.code ? `[${j.code}] ` : ''}{j.title} — {j.clientCompany} ({j.branch})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Pipeline Stage</label>
            <select
              value={form.stage}
              onChange={e => set('stage', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            >
              {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Sourcing Channel</label>
            <select
              value={form.source}
              onChange={e => set('source', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Profile URL {isAutoFilled('linkedIn') && <span className="text-xs text-green-600 font-semibold">✓ auto-filled</span>}
            </label>
            <input
              value={form.linkedIn}
              onChange={e => set('linkedIn', e.target.value)}
              placeholder="linkedin.com/in/..."
              className={fieldClass('linkedIn')}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills & Tags {isAutoFilled('tags') && <span className="text-xs text-green-600 font-semibold">✓ auto-filled from CV</span>}
              <span className="text-gray-400 font-normal ml-1">(comma separated)</span>
            </label>
            <input
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="e.g. Electrical Power, B.Tech, Loop Calibration, PTTEP Yadana"
              className={fieldClass('tags')}
            />
          </div>

          {/* Initial Recruiter Screening Note */}
          {!initial.id && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recruiter Screening Remark / Initial Note
              </label>
              <textarea
                rows={2}
                value={form.notesText}
                onChange={e => set('notesText', e.target.value)}
                placeholder="e.g. Reviewed CV, meets PTTEP offshore technical requirements. Scheduled for telephone screening."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
              />
            </div>
          )}

          {/* Resume filename display */}
          {form.resumeFileName && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attached Resume Document</label>
              <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-200 rounded-lg px-3 py-2">
                <FileText size={16} className="text-blue-600 shrink-0" />
                <span className="text-sm font-medium text-blue-900 flex-1 truncate">{form.resumeFileName}</span>
                <span className="text-xs text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded">Ready to Save</span>
                <button
                  type="button"
                  onClick={() => set('resumeFileName', '')}
                  className="text-xs text-gray-400 hover:text-red-500 cursor-pointer ml-1"
                  title="Remove attached resume"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">
          {initial.id ? 'Save Changes' : 'Create Candidate Profile'}
        </Button>
      </div>
    </form>
  )
}
