import React, { useState } from 'react'
import { Plus, Edit, Trash2, Mail, Phone, Briefcase, Search, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'

function TeamMemberForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    phone: initial.phone || '',
    role: initial.role || '',
    department: initial.department || 'HR',
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
          <input required value={form.role} onChange={e => set('role', e.target.value)}
            placeholder="e.g. Technical Recruiter"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <input value={form.department} onChange={e => set('department', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial.id ? 'Save Changes' : 'Add Member'}</Button>
      </div>
    </form>
  )
}

export default function Team() {
  const { state, dispatch } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [search, setSearch] = useState('')

  const filteredTeam = state.team.filter(m => {
    if (!search.trim()) return true
    const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean)
    const text = `${m.name} ${m.role} ${m.email} ${m.phone || ''} ${m.department || ''} ${m.branch || ''}`.toLowerCase()
    return words.every(w => text.includes(w))
  })

  const handleAdd = (data) => {
    dispatch({ type: 'ADD_TEAM_MEMBER', payload: data })
    setShowModal(false)
  }

  const handleUpdate = (data) => {
    dispatch({ type: 'UPDATE_TEAM_MEMBER', payload: { ...data, id: editMember.id } })
    setEditMember(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Remove this team member?')) {
      dispatch({ type: 'DELETE_TEAM_MEMBER', payload: id })
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team</h2>
          <p className="text-sm text-gray-500 mt-0.5">{filteredTeam.length} shown · {state.team.length} total members</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>Add Member</Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-sm">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeam.map(member => {
          const assignedJobs = state.jobs.filter(j => j.recruiter === member.id)
          const assignedCandidates = state.candidates.filter(c =>
            assignedJobs.some(j => j.id === c.jobId)
          )

          return (
            <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={member.avatar} size="lg" />
                  <div>
                    <p className="font-semibold text-gray-900">{member.name}</p>
                    <p className="text-sm text-blue-600">{member.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditMember(member)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600">
                  <Mail size={12} /> {member.email}
                </a>
                {member.phone && (
                  <span className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={12} /> {member.phone}
                  </span>
                )}
                <span className="flex items-center gap-2 text-xs text-gray-500">
                  <Briefcase size={12} /> {member.department}
                </span>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{assignedJobs.length}</p>
                  <p className="text-xs text-gray-500">Active Jobs</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{assignedCandidates.length}</p>
                  <p className="text-xs text-gray-500">Candidates</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Joined</p>
                  <p className="text-xs font-medium text-gray-600">{member.joinedAt}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Team Member">
        <TeamMemberForm onSubmit={handleAdd} onCancel={() => setShowModal(false)} />
      </Modal>

      <Modal isOpen={!!editMember} onClose={() => setEditMember(null)} title="Edit Team Member">
        {editMember && (
          <TeamMemberForm initial={editMember} onSubmit={handleUpdate} onCancel={() => setEditMember(null)} />
        )}
      </Modal>
    </div>
  )
}
