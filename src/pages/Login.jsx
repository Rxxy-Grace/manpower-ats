import React, { useState } from 'react'
import {
  Lock,
  Building2,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Briefcase,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { useApp, SYSTEM_ROLES } from '../context/AppContext'

export default function Login() {
  const { state, login } = useApp()
  const users = state.authUsers || []

  const [loginMethod, setLoginMethod] = useState('select') // 'select' | 'input'
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || 'u_admin')
  const [emailInput, setEmailInput] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0]
  const roleConfig = SYSTEM_ROLES[selectedUser?.role] || SYSTEM_ROLES.admin

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    let targetUserId = selectedUserId

    if (loginMethod === 'input') {
      const trimmedEmail = emailInput.trim().toLowerCase()
      if (!trimmedEmail) {
        setError('Please enter your email or name.')
        return
      }
      const matched = users.find(
        u => u.email.toLowerCase() === trimmedEmail ||
             u.name.toLowerCase().includes(trimmedEmail) ||
             u.id.toLowerCase() === trimmedEmail
      )
      if (!matched) {
        setError('No account found with this email or username.')
        return
      }
      targetUserId = matched.id
    }

    if (!pin.trim()) {
      setError('Please enter your 4-digit security PIN.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const success = login(targetUserId, pin.trim())
      if (!success) {
        setError('Incorrect PIN. (Default demo PIN is 1234)')
      }
      setLoading(false)
    }, 250)
  }

  const handleQuickLogin = (user) => {
    setSelectedUserId(user.id)
    setPin(user.pin || '1234')
    setError('')
    login(user.id, user.pin || '1234')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center items-center p-4 selection:bg-blue-500 selection:text-white">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Company Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-2xl mb-3 border border-blue-400/30">
            <Building2 size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">HQS MANPOWER SUPPLY</h1>
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mt-1">
            Applicant Tracking System · Energy & Offshore
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 backdrop-blur-md space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                <Lock size={16} className="text-blue-600" />
                Sign in to Talent Portal
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Enter PIN to access your authorized workspace</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              PIN Protected
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Profile Selection / Email Mode Switch */}
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setLoginMethod('select'); setError(''); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  loginMethod === 'select'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Choose Profile
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('input'); setError(''); }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  loginMethod === 'input'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Type Email
              </button>
            </div>

            {loginMethod === 'select' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Select User Account
                </label>
                <select
                  value={selectedUserId}
                  onChange={e => {
                    setSelectedUserId(e.target.value)
                    setError('')
                  }}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-900 shadow-2xs"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.title}
                    </option>
                  ))}
                </select>

                {/* Profile Card Preview */}
                {selectedUser && (
                  <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {selectedUser.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{selectedUser.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{selectedUser.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${roleConfig.badgeColor}`}>
                      {roleConfig.badge}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Email Address or Recruiter Name
                </label>
                <input
                  type="text"
                  value={emailInput}
                  onChange={e => {
                    setEmailInput(e.target.value)
                    setError('')
                  }}
                  placeholder="e.g. hnin.yumaw@hqsmanpower.com"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-900 shadow-2xs"
                  autoFocus
                />
              </div>
            )}

            {/* Security PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Security PIN / Password
                </label>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                  Default PIN: 1234
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={16}
                  value={pin}
                  onChange={e => {
                    setPin(e.target.value)
                    setError('')
                  }}
                  placeholder="Enter PIN (1234)"
                  className="w-full border border-gray-300 rounded-xl pl-3.5 pr-11 py-2.5 text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-gray-900 text-center shadow-2xs"
                  autoFocus={loginMethod === 'select'}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-xl animate-shake">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound size={16} />
              <span>{loading ? 'Verifying Credentials…' : 'Unlock & Sign In'}</span>
            </button>
          </form>

          {/* Quick Demo 1-Click Role Switcher */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                1-Click Quick Demo Sign-In:
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                <Sparkles size={11} /> Instant Access
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {users.map(u => {
                const r = SYSTEM_ROLES[u.role] || SYSTEM_ROLES.recruiter
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="p-2.5 text-left bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer text-xs group"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-gray-900 group-hover:text-blue-700 truncate">{u.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {r.badge} · {u.branch === 'ALL' ? 'All Branches' : `${u.branch} Branch`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Permission Matrix Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1">
              <Shield size={12} className="text-blue-600" /> Software Access Control
            </p>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              • <strong>Admin:</strong> Full control, danger zone & database reset.<br />
              • <strong>Recruiter:</strong> Candidate & requisition management locked to assigned branch.<br />
              • <strong>Client Reviewer:</strong> Read-only CVs with commercial salary masked.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-4">
          HQS Manpower Supply Co., Ltd. · Licensed Offshore Recruitment Agency
        </p>
      </div>
    </div>
  )
}
