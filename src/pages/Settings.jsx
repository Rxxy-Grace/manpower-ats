import React, { useState } from 'react'
import {
  Save,
  RefreshCw,
  DollarSign,
  Building2,
  Database,
  Cloud,
  CheckCircle,
  AlertCircle,
  UploadCloud,
  ExternalLink,
  Clock,
  UserCheck,
  ShieldAlert,
  BarChart3,
  Layers,
  CheckCircle2,
  Lock,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { useApp, SYSTEM_ROLES } from '../context/AppContext'
import Button from '../components/ui/Button'
import { BRANCHES } from '../data/seedData'
import { isSupabaseConfigured } from '../lib/supabase'
import { syncLocalStateToSupabase } from '../services/supabaseSync'

export default function Settings() {
  const { state, dispatch, currentUser, userRoleConfig, hasPermission, updateUserPin } = useApp()
  const canDangerZone = hasPermission('canAccessDangerZone')

  const [form, setForm] = useState({ ...state.settings })
  const [saved, setSaved] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [syncError, setSyncError] = useState('')

  // PIN change state
  const [newPin, setNewPin] = useState('')
  const [pinTargetUser, setPinTargetUser] = useState(currentUser?.id || 'u_admin')
  const [pinSuccess, setPinSuccess] = useState('')
  const [pinError, setPinError] = useState('')

  const handleUpdatePin = (e) => {
    e.preventDefault()
    setPinError('')
    setPinSuccess('')
    if (!newPin.trim() || newPin.trim().length < 4) {
      setPinError('PIN must be at least 4 digits/characters.')
      return
    }
    updateUserPin(pinTargetUser, newPin.trim())
    setPinSuccess(`PIN successfully updated for ${state.authUsers?.find(u => u.id === pinTargetUser)?.name}!`)
    setNewPin('')
    setTimeout(() => setPinSuccess(''), 3000)
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleSyncToSupabase = async () => {
    if (!isSupabaseConfigured) {
      alert('Please add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file first.')
      return
    }

    setSyncing(true)
    setSyncError('')
    setSyncResult(null)

    try {
      const res = await syncLocalStateToSupabase(state)
      setSyncResult(res)
    } catch (err) {
      console.error('Supabase sync error:', err)
      setSyncError(err.message || 'Failed to sync to Supabase')
    } finally {
      setSyncing(false)
    }
  }

  const handleResetData = () => {
    if (window.confirm('⚠️ Reset all data back to original HQS demo data? All local modifications will be removed.')) {
      localStorage.removeItem('hqs_ats_state')
      window.location.reload()
    }
  }

  // Compute USD & MMK salary counts
  const usdJobs = state.jobs.filter(j => j.salary?.currency === 'USD')
  const mmkJobs = state.jobs.filter(j => j.salary?.currency === 'MMK')
  const exchangeRateNum = Number(form.exchangeRate) || 3500

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings & Cloud Sync</h2>
          <p className="text-xs text-gray-500 mt-1">
            Configure company branch operations, currency exchange rate rules, and Supabase cloud synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg animate-in fade-in">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Settings Saved Successfully!
            </span>
          )}
          <Button icon={<Save size={15} />} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left 2 Columns: Core Configuration Panels ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Company & Branch Configuration */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Company & Branch Operation</h3>
                <p className="text-xs text-gray-500">HQS Manpower Supply organizational structure</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Company Legal Entity Name
                </label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={e => set('companyName', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-800"
                />
              </div>

              {/* Default Operational Branch: Modern 3-Card Segmented Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Default Operational Branch
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'HQS', name: 'HQS', badge: 'Headquarters', desc: 'Main Central Office (Yangon)' },
                    { id: 'AQS', name: 'AQS', badge: 'Branch Office', desc: 'AQS Technical Workforce' },
                    { id: 'QSL', name: 'QSL', badge: 'Branch Office', desc: 'QSL Operations & Field Staff' },
                  ].map((b) => {
                    const isSelected = form.currentBranch === b.id
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => set('currentBranch', b.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 text-blue-950 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-gray-900">{b.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {b.badge}
                          </span>
                        </div>
                        <p className={`text-[11px] ${isSelected ? 'text-blue-800 font-medium' : 'text-gray-400'}`}>
                          {b.desc}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Active Recruiter (Full Width, No Truncation) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Active Recruiter Profile</span>
                  <span className="text-[11px] text-gray-400 font-normal">Assigned by default to new requisitions</span>
                </label>
                <select
                  value={form.currentUser}
                  onChange={e => set('currentUser', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-900 cursor-pointer"
                >
                  {state.team.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.role} ({t.branch} Branch) · {t.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Clock size={13} className="text-gray-400" />
                  <span>Operational Timezone</span>
                </label>
                <select
                  value={form.timezone}
                  onChange={e => set('timezone', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-900 cursor-pointer"
                >
                  {[
                    { tz: 'Asia/Yangon', label: 'Asia/Yangon — Myanmar Standard Time (GMT+6:30)' },
                    { tz: 'Asia/Bangkok', label: 'Asia/Bangkok — Indochina Time (GMT+7:00)' },
                    { tz: 'Asia/Singapore', label: 'Asia/Singapore — Singapore Standard Time (GMT+8:00)' },
                    { tz: 'Asia/Tokyo', label: 'Asia/Tokyo — Japan Standard Time (GMT+9:00)' },
                    { tz: 'America/New_York', label: 'America/New_York — Eastern Time (EST/EDT)' },
                    { tz: 'Europe/London', label: 'Europe/London — Greenwich Mean Time (GMT/BST)' },
                  ].map(item => (
                    <option key={item.tz} value={item.tz}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Currency & Compensation Rates */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Currency & Compensation Rates</h3>
                <p className="text-xs text-gray-500">Live multi-currency equivalence rules for offshore oil & gas postings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Default Salary Currency
                </label>
                <select
                  value={form.defaultCurrency}
                  onChange={e => set('defaultCurrency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-gray-800"
                >
                  <option value="MMK">MMK — Myanmar Kyat</option>
                  <option value="USD">USD — US Dollar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Exchange Rate Rule</span>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded">
                    1 USD = {Number(form.exchangeRate).toLocaleString()} MMK
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={form.exchangeRate}
                    onChange={e => set('exchangeRate', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-3.5 pr-16 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold">
                    MMK
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time Exchange Rate Preview Matrix */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center justify-between">
                <span>Live Salary Conversion Matrix</span>
                <span className="text-[10px] text-amber-700 font-normal">Calculates equivalents dynamically in job postings</span>
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[500, 1000, 2500].map(usd => (
                  <div key={usd} className="bg-white rounded-xl p-3 border border-amber-100 shadow-2xs text-center">
                    <p className="text-xs text-gray-500 font-medium">${usd.toLocaleString()} USD</p>
                    <p className="text-base font-extrabold text-gray-900 mt-0.5">
                      {(usd * exchangeRateNum).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-0.5">MMK Equiv</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Salary Breakdown */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-700">MMK Job Postings</span>
                  <p className="text-[11px] text-gray-400">Domestic & local rate positions</p>
                </div>
                <span className="text-lg font-black text-gray-900 bg-white border border-gray-200 px-3 py-1 rounded-lg">
                  {mmkJobs.length}
                </span>
              </div>
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-700">USD Job Postings</span>
                  <p className="text-[11px] text-gray-400">Offshore & expatriate rate positions</p>
                </div>
                <span className="text-lg font-black text-blue-700 bg-white border border-blue-200 px-3 py-1 rounded-lg">
                  {usdJobs.length}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Supabase Cloud Database & Storage Sync */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Supabase Cloud Database & Storage</h3>
                  <p className="text-xs text-gray-500">Multi-user team sync and cloud CV storage</p>
                </div>
              </div>

              {isSupabaseConfigured ? (
                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected to Supabase
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Local Offline Storage
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connect your ATS to Supabase to enable real-time collaboration across <strong>HQS, AQS, and QSL</strong>, cloud storage for candidate CV documents, and team synchronization.
            </p>

            {isSupabaseConfigured ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-sm text-emerald-900">Cloud Endpoint Live</p>
                    <p className="font-mono text-xs text-emerald-700 mt-0.5">{import.meta.env.VITE_SUPABASE_URL}</p>
                  </div>
                  <Button
                    variant="primary"
                    icon={<UploadCloud size={15} />}
                    onClick={handleSyncToSupabase}
                    disabled={syncing}
                  >
                    {syncing ? 'Uploading to Supabase…' : 'Sync Local Data to Supabase'}
                  </Button>
                </div>

                {syncResult && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                    <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Synchronization Complete!</p>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        Uploaded <strong>{syncResult.jobs}</strong> jobs, <strong>{syncResult.candidates}</strong> candidates, <strong>{syncResult.interviews}</strong> scheduled interviews, and <strong>{syncResult.emailTemplates}</strong> email templates to your Supabase tables.
                      </p>
                    </div>
                  </div>
                )}

                {syncError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-800 flex items-center gap-2">
                    <AlertCircle size={18} className="text-red-600 shrink-0" />
                    <span className="font-medium">{syncError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Ready to Connect:</span>
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Open supabase.com <ExternalLink size={12} />
                  </a>
                </div>
                <p className="text-slate-600">
                  Follow these 2 quick steps to activate cloud sync:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                  <li>In Supabase SQL Editor, run the provided <code>supabase/schema.sql</code> script.</li>
                  <li>Copy your <strong>Project URL</strong> and <strong>anon key</strong> into your <code>.env</code> file:
                    <pre className="mt-1.5 p-2.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
                    </pre>
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Telemetry & System Status ── */}
        <div className="space-y-6">

          {/* Quick Action Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <Layers size={16} />
              Save Configuration
            </h4>
            <p className="text-xs text-blue-100 mt-1.5 leading-relaxed">
              Updates active company identity, operational branch filters, and compensation exchange rules.
            </p>
            <button
              type="button"
              onClick={handleSave}
              className="mt-4 w-full py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save size={14} />
              {saved ? '✓ Changes Saved!' : 'Save All Settings'}
            </button>
          </div>

          {/* Live Data Telemetry Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <BarChart3 size={17} className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">Talent Pool Telemetry</h3>
            </div>

            <dl className="space-y-3">
              {[
                ['Total Job Requisitions', state.jobs.length, 'text-gray-900 font-bold'],
                ['Active Open Jobs', state.jobs.filter(j => j.status === 'Open').length, 'text-blue-700 font-bold'],
                ['Total Candidates in Pool', state.candidates.length, 'text-indigo-700 font-black text-base'],
                ['Deployed / Hired Workers', state.candidates.filter(c => c.stage === 'Deployed').length, 'text-emerald-700 font-bold'],
                ['Scheduled Interviews', state.interviews.filter(i => i.status === 'Scheduled').length, 'text-amber-700 font-bold'],
                ['Recruitment Team Members', state.team.length, 'text-gray-800 font-medium'],
                ['English Email Templates', state.emailTemplates.length, 'text-gray-800 font-medium'],
              ].map(([label, value, valueClass]) => (
                <div key={label} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                  <dt className="text-gray-600">{label}</dt>
                  <dd className={valueClass}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Security & PIN Management */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <ShieldCheck size={18} className="text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900">Security & PIN Management</h3>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-gray-600">
                Logged in as: <strong className="text-gray-900">{currentUser?.name}</strong>{' '}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${userRoleConfig?.badgeColor}`}>
                  {userRoleConfig?.badge}
                </span>
              </div>

              {/* Change PIN Form */}
              <form onSubmit={handleUpdatePin} className="space-y-2.5 pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700">
                  Update Security PIN
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={pinTargetUser}
                    onChange={e => setPinTargetUser(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-800"
                  >
                    {(state.authUsers || []).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={16}
                      value={newPin}
                      onChange={e => setNewPin(e.target.value)}
                      placeholder="New PIN (e.g. 5678)"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Save PIN
                    </button>
                  </div>
                </div>

                {pinSuccess && (
                  <p className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">
                    ✓ {pinSuccess}
                  </p>
                )}
                {pinError && (
                  <p className="text-[11px] text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
                    ⚠ {pinError}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/60 rounded-2xl border border-red-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-800">
              <ShieldAlert size={17} className="text-red-600" />
              <h3 className="text-sm font-bold">System Danger Zone</h3>
              {!canDangerZone && (
                <span className="text-[10px] bg-red-200 text-red-800 font-bold px-2 py-0.5 rounded-full ml-auto">
                  Admin Only
                </span>
              )}
            </div>
            <p className="text-xs text-red-700/90 leading-relaxed">
              Reset all local recruitment data back to the clean initial demo dataset. This action cannot be undone.
            </p>
            {canDangerZone ? (
              <Button variant="danger" size="sm" icon={<RefreshCw size={13} />} onClick={handleResetData}>
                Reset to Clean Demo Data
              </Button>
            ) : (
              <div className="p-2.5 bg-red-100/60 border border-red-200 rounded-xl text-xs text-red-800 font-medium flex items-center gap-2">
                <Lock size={14} className="shrink-0 text-red-600" />
                <span>Locked. Danger Zone requires Administrator permission.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
