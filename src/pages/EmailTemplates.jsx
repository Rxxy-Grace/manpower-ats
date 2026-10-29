import React, { useState } from 'react'
import { Plus, Edit, Trash2, Copy, Mail, ChevronRight, X, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'

const CATEGORIES = ['All', 'Acknowledgment', 'Scheduling', 'Rejection', 'Offer']

function TemplateForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    category: initial.category || 'Scheduling',
    subject: initial.subject || '',
    body: initial.body || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
        <input required value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="e.g. Phone Screen Invite"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select value={form.category} onChange={e => set('category', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {['Acknowledgment', 'Scheduling', 'Rejection', 'Offer', 'General'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line *</label>
        <input required value={form.subject} onChange={e => set('subject', e.target.value)}
          placeholder="Use {{firstName}}, {{jobTitle}} for variables"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Body *</label>
        <textarea required rows={10} value={form.body} onChange={e => set('body', e.target.value)}
          placeholder="Use {{firstName}}, {{jobTitle}}, {{recruiterName}}, etc. for dynamic variables"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono" />
      </div>
      <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
        <p className="font-semibold mb-1">Available Variables:</p>
        <p className="font-mono">{'{{firstName}}, {{lastName}}, {{jobTitle}}, {{recruiterName}}, {{interviewDate}}, {{interviewTime}}, {{meetingLink}}, {{salary}}, {{startDate}}'}</p>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial.id ? 'Save Changes' : 'Create Template'}</Button>
      </div>
    </form>
  )
}

export default function EmailTemplates() {
  const { state, dispatch } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editTemplate, setEditTemplate] = useState(null)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(null)

  const filtered = state.emailTemplates.filter(t => {
    const matchCategory = filterCategory === 'All' || t.category === filterCategory
    let matchSearch = true
    if (search.trim()) {
      const words = search.toLowerCase().trim().split(/\s+/).filter(Boolean)
      const text = `${t.name} ${t.subject} ${t.body} ${t.category}`.toLowerCase()
      matchSearch = words.every(w => text.includes(w))
    }
    return matchCategory && matchSearch
  })

  const handleAdd = (data) => {
    dispatch({ type: 'ADD_TEMPLATE', payload: data })
    setShowModal(false)
  }

  const handleUpdate = (data) => {
    dispatch({ type: 'UPDATE_TEMPLATE', payload: { ...data, id: editTemplate.id } })
    setEditTemplate(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this email template?')) {
      dispatch({ type: 'DELETE_TEMPLATE', payload: id })
    }
  }

  const handleCopy = (template) => {
    navigator.clipboard.writeText(`Subject: ${template.subject}\n\n${template.body}`)
    setCopied(template.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const categoryColors = {
    Acknowledgment: 'bg-blue-100 text-blue-700',
    Scheduling: 'bg-purple-100 text-purple-700',
    Rejection: 'bg-red-100 text-red-700',
    Offer: 'bg-green-100 text-green-700',
    General: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Email Templates</h2>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} shown · {state.emailTemplates.length} total templates</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>New Template</Button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <form onSubmit={e => e.preventDefault()} className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates by name, subject, body… (Enter)"
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

        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterCategory === c ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(template => (
          <div key={template.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[template.category] || 'bg-gray-100 text-gray-600'}`}>
                    {template.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">📧 {template.subject}</p>
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => handleCopy(template)}
                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                  title="Copy to clipboard"
                >
                  {copied === template.id ? <span className="text-xs text-green-600">✓</span> : <Copy size={14} />}
                </button>
                <button onClick={() => setEditTemplate(template)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(template.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setPreviewTemplate(template)}>
              <p className="text-xs text-gray-600 line-clamp-3 whitespace-pre-wrap leading-relaxed">{template.body}</p>
            </div>

            <button
              onClick={() => setPreviewTemplate(template)}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View full template <ChevronRight size={11} />
            </button>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <Modal isOpen={!!previewTemplate} onClose={() => setPreviewTemplate(null)} title={previewTemplate?.name} size="lg">
        {previewTemplate && (
          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">SUBJECT</p>
              <p className="text-sm font-medium text-gray-800">{previewTemplate.subject}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">BODY</p>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{previewTemplate.body}</pre>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" icon={<Copy size={14} />} onClick={() => handleCopy(previewTemplate)}>
                {copied === previewTemplate.id ? 'Copied!' : 'Copy Template'}
              </Button>
              <Button icon={<Edit size={14} />} onClick={() => { setEditTemplate(previewTemplate); setPreviewTemplate(null) }}>
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Email Template" size="lg">
        <TemplateForm onSubmit={handleAdd} onCancel={() => setShowModal(false)} />
      </Modal>

      <Modal isOpen={!!editTemplate} onClose={() => setEditTemplate(null)} title="Edit Template" size="lg">
        {editTemplate && (
          <TemplateForm initial={editTemplate} onSubmit={handleUpdate} onCancel={() => setEditTemplate(null)} />
        )}
      </Modal>
    </div>
  )
}
