import React, { useState } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Search,
  X,
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  syncTeamMemberToSupabase,
  deleteTeamMemberFromSupabase,
  syncLocalStateToSupabase,
  fetchTeamFromSupabase,
} from '../services/supabaseSync'
import { BRANCHES } from '../data/seedData'

function TeamMemberForm({ initial = {}, onSubmit, onCancel, isSaving }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    phone: initial.phone || '',
    role: initial.role || '',
    department: initial.department || 'Human Resources',
    branch: initial.branch || 'HQS',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const initials = form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    onSubmit({ ...form, avatar: initials })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Daw Zin Mar Aung"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="name@hqsmanpower.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="+95 9 123456789"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Role / Position *
          </label>
          <input
            required
            value={form.role}
            onChange={e => set('role', e.target.value)}
            placeholder="e.g. Senior Recruiter"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Assigned Branch *
          </label>
          <select
            value={form.branch}
            onChange={e => set('branch', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
          >
            {BRANCHES.map(b => (
              <option key={b} value={b}>{b} Branch</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Department
          </label>
          <input
            value={form.department}
            onChange={e => set('department', e.target.value)}
            placeholder="e.g. Technical Recruitment / Energy Operations"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-[11px] text-gray-500 flex items-center gap-1">
          <Cloud size={13} className={isSupabaseConfigured ? "text-emerald-500" : "text-gray-400"} />
          {isSupabaseConfigured ? "Syncs to Supabase Cloud automatically" : "Stored locally (Supabase offline)"}
        </span>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isSaving}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Syncing…' : (initial.id ? 'Save Changes' : 'Add Member')}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default function Team() {
  const { state, dispatch } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [search, setSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null) // { type: 'success' | 'error' | 'syncing', msg: string }
  const [syncingAll, setSyncingAll] = useState(false)

  const filteredTeam = state.team.filter(m => {
    if (!search.trim()) return true
    const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean)
    const text = `${m.name} ${m.role} ${m.email} ${m.phone || ''} ${m.department || ''} ${m.branch || ''}`.toLowerCase()
    return words.every(w => text.includes(w))
  })

  // Add Member with live Supabase sync
  const handleAdd = async (data) => {
    const newId = `t_${Date.now()}`
    const member = {
      ...data,
      id: newId,
      branch: data.branch || 'HQS',
      joinedAt: new Date().toISOString().split('T')[0],
    }

    // 1. Immediate optimistic UI update
    dispatch({ type: 'ADD_TEAM_MEMBER', payload: member })
    setShowModal(false)

    // 2. Direct Supabase Cloud Sync
    if (isSupabaseConfigured) {
      setIsSaving(true)
      setSyncStatus({ type: 'syncing', msg: `Syncing ${member.name} to Supabase…` })
      const res = await syncTeamMemberToSupabase(member)
      setIsSaving(false)
      if (res.success) {
        setSyncStatus({ type: 'success', msg: `✓ Successfully synced "${member.name}" to Supabase Cloud!` })
      } else {
        setSyncStatus({ type: 'error', msg: `⚠ Supabase sync error: ${res.error}` })
      }
      setTimeout(() => setSyncStatus(null), 5000)
    }
  }

  // Update Member with live Supabase sync
  const handleUpdate = async (data) => {
    const updated = { ...editMember, ...data }
    dispatch({ type: 'UPDATE_TEAM_MEMBER', payload: updated })
    setEditMember(null)

    if (isSupabaseConfigured) {
      setIsSaving(true)
      setSyncStatus({ type: 'syncing', msg: `Updating ${updated.name} in Supabase…` })
      const res = await syncTeamMemberToSupabase(updated)
      setIsSaving(false)
      if (res.success) {
        setSyncStatus({ type: 'success', msg: `✓ Updated "${updated.name}" in Supabase Cloud!` })
      } else {
        setSyncStatus({ type: 'error', msg: `⚠ Supabase update error: ${res.error}` })
      }
      setTimeout(() => setSyncStatus(null), 5000)
    }
  }

  // Delete Member with live Supabase sync
  const handleDelete = async (member) => {
    if (window.confirm(`Remove team member "${member.name}"?`)) {
      dispatch({ type: 'DELETE_TEAM_MEMBER', payload: member.id })

      if (isSupabaseConfigured) {
        setSyncStatus({ type: 'syncing', msg: `Deleting ${member.name} from Supabase…` })
        const res = await deleteTeamMemberFromSupabase(member.id)
        if (res.success) {
          setSyncStatus({ type: 'success', msg: `✓ Removed "${member.name}" from Supabase Cloud.` })
        } else {
          setSyncStatus({ type: 'error', msg: `⚠ Supabase delete error: ${res.error}` })
        }
        setTimeout(() => setSyncStatus(null), 5000)
      }
    }
  }

  // 1-Click Sync All Team Members to Supabase
  const handleSyncAllToSupabase = async () => {
    if (!isSupabaseConfigured) {
      alert('Supabase is not configured. Please check your .env file.')
      return
    }

    setSyncingAll(true)
    setSyncStatus({ type: 'syncing', msg: 'Syncing all team members to Supabase…' })

    try {
      let syncedCount = 0
      for (const m of state.team) {
        const res = await syncTeamMemberToSupabase(m)
        if (res.success) syncedCount++
      }
      setSyncStatus({ type: 'success', msg: `✓ Successfully synced all ${syncedCount} team members to Supabase Cloud!` })
    } catch (err) {
      setSyncStatus({ type: 'error', msg: `⚠ Sync error: ${err.message}` })
    } finally {
      setSyncingAll(false)
      setTimeout(() => setSyncStatus(null), 6000)
    }
  }

  const branchBadgeColor = {
    HQS: 'bg-blue-100 text-blue-700 border-blue-200',
    AQS: 'bg-purple-100 text-purple-700 border-purple-200',
    QSL: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Top Banner Status */}
      {syncStatus && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
            syncStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : syncStatus.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncStatus.type === 'syncing' ? (
              <RefreshCw size={14} className="animate-spin text-blue-600" />
            ) : syncStatus.type === 'success' ? (
              <CheckCircle2 size={15} className="text-emerald-600" />
            ) : (
              <AlertCircle size={15} className="text-red-600" />
            )}
            <span>{syncStatus.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncStatus(null)}
            className="text-gray-400 hover:text-gray-600 p-0.5"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">Team Directory</h2>
            {isSupabaseConfigured && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Cloud size={12} className="text-emerald-600" /> Supabase Live
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredTeam.length} shown · {state.team.length} total recruitment team members
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isSupabaseConfigured && (
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} className={syncingAll ? 'animate-spin' : ''} />}
              onClick={handleSyncAllToSupabase}
              disabled={syncingAll}
              title="Push all current team members to Supabase database"
            >
              {syncingAll ? 'Syncing to Cloud…' : 'Sync All to Supabase'}
            </Button>
          )}

          <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Add Member
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-sm">
        <form onSubmit={e => e.preventDefault()} className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search member by name, role, email… (Enter)"
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </form>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeam.map(member => {
          const assignedJobs = state.jobs.filter(j => j.recruiter === member.id)
          const assignedCandidates = state.candidates.filter(c =>
            assignedJobs.some(j => j.id === c.jobId)
          )

          return (
            <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar initials={member.avatar} size="lg" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                    <p className="text-xs text-blue-600 font-medium truncate">{member.role}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded border inline-block mt-1 ${branchBadgeColor[member.branch] || 'bg-gray-100 text-gray-700'}`}>
                      {member.branch || 'HQS'} Branch
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEditMember(member)}
                    title={`Edit ${member.name}`}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    title={`Delete ${member.name}`}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 mb-4 text-xs text-gray-500">
                <a href={`mailto:${member.email}`} className="flex items-center gap-2 hover:text-blue-600 truncate">
                  <Mail size={12} className="shrink-0 text-gray-400" />
                  <span className="truncate">{member.email}</span>
                </a>
                {member.phone && (
                  <span className="flex items-center gap-2 truncate">
                    <Phone size={12} className="shrink-0 text-gray-400" />
                    <span className="truncate">{member.phone}</span>
                  </span>
                )}
                <span className="flex items-center gap-2 truncate">
                  <Briefcase size={12} className="shrink-0 text-gray-400" />
                  <span className="truncate">{member.department || 'Human Resources'}</span>
                </span>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <div className="text-center flex-1">
                  <p className="text-lg font-bold text-gray-900">{assignedJobs.length}</p>
                  <p className="text-xs text-gray-500">Active Jobs</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-lg font-bold text-gray-900">{assignedCandidates.length}</p>
                  <p className="text-xs text-gray-500">Candidates</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-400">Joined</p>
                  <p className="text-xs font-medium text-gray-600 truncate">{member.joinedAt || '2024'}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Team Member" size="md">
        <TeamMemberForm onSubmit={handleAdd} onCancel={() => setShowModal(false)} isSaving={isSaving} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editMember} onClose={() => setEditMember(null)} title="Edit Team Member" size="md">
        {editMember && (
          <TeamMemberForm initial={editMember} onSubmit={handleUpdate} onCancel={() => setEditMember(null)} isSaving={isSaving} />
        )}
      </Modal>
    </div>
  )
}
