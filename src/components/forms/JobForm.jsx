import React, { useState, useRef, useEffect } from 'react'
import Button from '../ui/Button'
import {
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
  JOB_STATUSES,
  CURRENCIES,
  CLIENT_COMPANIES,
  BRANCHES,
  STANDARD_LOCATIONS,
  CONTRACT_DURATIONS,
} from '../../data/seedData'
import { useApp } from '../../context/AppContext'
import {
  Clock,
  Calendar,
  UserCheck,
  Building2,
  MapPin,
  Briefcase,
  FileCode,
  DollarSign,
  FileText,
  Users,
  ChevronDown,
  Check,
} from 'lucide-react'

// ── Clean Combobox: Allows both selecting from dropdown and direct custom typing ──
// Does NOT cover or obscure the typed text; uses a clean dropdown below the input.
function Combobox({
  label,
  required = false,
  value = '',
  onChange,
  options = [],
  placeholder = '',
  highlight = false,
  icon: Icon,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter options based on input text if user is typing; if exact match or empty, show all options
  const isExactMatch = options.includes(value)
  const filteredOptions = value && !isExactMatch
    ? options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()))
    : options

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center justify-between mb-1.5">
        <label
          className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            highlight ? 'text-amber-900' : 'text-gray-700'
          }`}
        >
          {Icon && <Icon size={13} className={highlight ? 'text-amber-600' : 'text-gray-400'} />}
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      </div>

      <div className="relative">
        <input
          type="text"
          required={required}
          value={value}
          onChange={e => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full border rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
            highlight
              ? 'border-amber-300 bg-amber-50/60 focus:ring-amber-500 text-amber-900 font-medium placeholder-amber-400'
              : 'border-gray-300 bg-white focus:ring-blue-500 text-gray-900 placeholder-gray-400'
          }`}
        />

        {/* Standard chevron arrow button on the far right (never covers text) */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsOpen(prev => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <ChevronDown
            size={15}
            className={`transition-transform duration-150 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
          />
        </button>

        {/* Dropdown Menu below input */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-56 overflow-y-auto py-1 text-sm">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault()
                    onChange(opt)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition-colors ${
                    value === opt ? 'bg-blue-50/80 font-bold text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check size={14} className="text-blue-600 shrink-0 ml-2" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-400 italic">
                Custom value: "{value}" (press Tab or click away to save)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function JobForm({ initial = {}, onSubmit, onSave, onCancel }) {
  const { state } = useApp()
  const submitFn = onSubmit || onSave

  const [form, setForm] = useState({
    code: initial.code || '',
    title: initial.title || '',
    department: initial.department || '',
    employmentType: initial.employmentType || 'Permanent Worker',
    contractDuration: initial.contractDuration || '',
    clientCompany: initial.clientCompany || 'PTTEP',
    branch: initial.branch || (state.settings.currentBranch !== 'ALL' ? state.settings.currentBranch : 'HQS'),
    location: initial.location || '',
    status: initial.status || 'Open',
    recruiter: initial.recruiter || state.team[0]?.id || 't1',
    hiringManager: initial.hiringManager || '',
    postedAt: initial.postedAt || new Date().toISOString().split('T')[0],
    closingDate: initial.closingDate || '',
    headcount: initial.headcount || 1,
    salary: {
      min: initial.salary?.min || '',
      max: initial.salary?.max || '',
      currency: initial.salary?.currency || state.settings.defaultCurrency || 'MMK',
      rateType: initial.salary?.rateType || 'Monthly Rate',
    },
    description: initial.description || '',
    requirements: (initial.requirements || ['']).join('\n'),
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setSalary = (key, val) => setForm(f => ({ ...f, salary: { ...f.salary, [key]: val } }))

  const exchangeRate = Number(state.settings.exchangeRate) || 3500

  // Live conversion preview
  const salaryPreview = () => {
    if (!form.salary.min && !form.salary.max) return null
    const min = Number(form.salary.min)
    const max = Number(form.salary.max)
    const suffix = form.salary.rateType === 'Daily Rate' ? '/ day' : '/ month'
    if (form.salary.currency === 'USD') {
      return `≈ ${(min * exchangeRate).toLocaleString()} – ${(max * exchangeRate).toLocaleString()} MMK ${suffix}`
    } else {
      return `≈ $${(min / exchangeRate).toFixed(0)} – $${(max / exchangeRate).toFixed(0)} USD ${suffix}`
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (submitFn) {
      submitFn({
        ...form,
        headcount: Number(form.headcount) || 1,
        requirements: form.requirements.split('\n').map(r => r.trim()).filter(Boolean),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Panel 1: Requisition & Client Account ── */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Building2 size={14} className="text-blue-600" />
          1. Requisition & Client Account
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
              <FileCode size={12} className="text-gray-400" />
              Requisition Code
            </label>
            <input
              value={form.code}
              onChange={e => set('code', e.target.value)}
              placeholder="e.g. HR-1287, PMB-BMS-01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold bg-white text-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Head of Building Management and Security"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Client Company <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.clientCompany}
              onChange={e => set('clientCompany', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            >
              {CLIENT_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Handling Branch <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.branch}
              onChange={e => set('branch', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            >
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Job Status <span className="text-red-500">*</span>
            </label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold text-gray-800"
            >
              {JOB_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Panel 2: Role Details, Location & Contract Duration ── */}
      {(() => {
        const isTempWorker = form.employmentType?.trim().toLowerCase().includes('temp')
        return (
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Briefcase size={14} className="text-blue-600" />
              2. Role Classification, Location & Contract
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Department: Combobox */}
              <Combobox
                label="Department"
                required={true}
                value={form.department}
                onChange={val => set('department', val)}
                options={DEPARTMENTS}
                placeholder="Select or type department…"
              />

              {/* Employment Type: Combobox */}
              <Combobox
                label="Employment Type"
                required={true}
                value={form.employmentType}
                onChange={val => set('employmentType', val)}
                options={EMPLOYMENT_TYPES}
                placeholder="Select or type employment type…"
              />

              {/* Location: Combobox */}
              <div className={isTempWorker ? 'md:col-span-1' : 'md:col-span-2'}>
                <Combobox
                  label="Location"
                  required={true}
                  icon={MapPin}
                  value={form.location}
                  onChange={val => set('location', val)}
                  options={STANDARD_LOCATIONS}
                  placeholder="Select or type project location…"
                />
              </div>

              {/* Contract Duration: Only shown when Temp Worker */}
              {isTempWorker && (
                <div className="md:col-span-1">
                  <Combobox
                    label="Contract Duration"
                    required={true}
                    highlight={true}
                    icon={Clock}
                    value={form.contractDuration}
                    onChange={val => set('contractDuration', val)}
                    options={CONTRACT_DURATIONS}
                    placeholder="e.g. 6 Months, 28/28 Days Rotation…"
                  />
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* ── Panel 3: Ownership, Headcount & Schedule Dates ── */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <UserCheck size={14} className="text-blue-600" />
          3. Ownership, Headcount & Key Dates
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Recruiter Assigned */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
              <UserCheck size={12} className="text-gray-400" />
              Recruiter Assigned
            </label>
            <select
              value={form.recruiter}
              onChange={e => set('recruiter', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            >
              {state.team.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.branch || m.department})
                </option>
              ))}
            </select>
          </div>

          {/* Hiring Manager */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Hiring Manager
            </label>
            <input
              value={form.hiringManager}
              onChange={e => set('hiringManager', e.target.value)}
              placeholder="e.g. General Administration Manager"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Headcount Required */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
              <Users size={12} className="text-gray-400" />
              Headcount Required
            </label>
            <input
              type="number"
              min="1"
              value={form.headcount}
              onChange={e => set('headcount', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            />
          </div>

          {/* Posted Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
              <Calendar size={12} className="text-gray-400" />
              Posted Date
            </label>
            <input
              type="date"
              value={form.postedAt}
              onChange={e => set('postedAt', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Closing Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
              <Calendar size={12} className="text-gray-400" />
              Closing Date
            </label>
            <input
              type="date"
              value={form.closingDate}
              onChange={e => set('closingDate', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── Panel 4: Salary & Compensation ── */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <DollarSign size={14} className="text-emerald-600" />
            4. Salary Range & Compensation
          </h4>

          {/* Monthly Rate vs Daily Rate Toggle */}
          <div className="flex items-center bg-gray-200 p-0.5 rounded-lg text-xs font-semibold">
            {['Monthly Rate', 'Daily Rate'].map(rate => {
              const isSelected = form.salary.rateType === rate
              return (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setSalary('rateType', rate)}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-transparent'}`} />
                  {rate}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Currency</label>
            <select
              value={form.salary.currency}
              onChange={e => setSalary('currency', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            >
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Minimum ({form.salary.currency} {form.salary.rateType === 'Daily Rate' ? '/ day' : '/ mo'})
            </label>
            <input
              type="number"
              value={form.salary.min}
              onChange={e => setSalary('min', e.target.value)}
              placeholder={
                form.salary.rateType === 'Daily Rate'
                  ? (form.salary.currency === 'MMK' ? '20000' : '50')
                  : (form.salary.currency === 'MMK' ? '1000000' : '1500')
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Maximum ({form.salary.currency} {form.salary.rateType === 'Daily Rate' ? '/ day' : '/ mo'})
            </label>
            <input
              type="number"
              value={form.salary.max}
              onChange={e => setSalary('max', e.target.value)}
              placeholder={
                form.salary.rateType === 'Daily Rate'
                  ? (form.salary.currency === 'MMK' ? '35000' : '100')
                  : (form.salary.currency === 'MMK' ? '2500000' : '2500')
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Live Conversion Preview */}
        {salaryPreview() && (
          <div className="mt-2 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            <span className="text-yellow-600 text-sm">💱</span>
            <p className="text-xs text-yellow-800">
              <span className="font-bold">Equivalent ({form.salary.rateType}):</span> {salaryPreview()}
              <span className="text-yellow-600 ml-1">(Live Rate: 1 USD = {Number(exchangeRate).toLocaleString()} MMK)</span>
            </p>
          </div>
        )}
      </div>

      {/* ── Panel 5: Description & Requirements ── */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <FileText size={14} className="text-slate-600" />
          5. Job Description & Candidate Requirements
        </h4>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Job Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe the role, key responsibilities, and tasks at the client project site…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Key Requirements <span className="text-gray-400 font-normal normal-case">(one per line)</span>
          </label>
          <textarea
            rows={4}
            value={form.requirements}
            onChange={e => set('requirements', e.target.value)}
            placeholder={"B.E. or AGTI in Electrical/Mechanical Power\nMinimum 5 years offshore experience\nNEBOSH or BOSIET safety certification preferred"}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono bg-white leading-relaxed"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">
          {initial.id ? 'Save Changes' : 'Create Job Requisition'}
        </Button>
      </div>
    </form>
  )
}
