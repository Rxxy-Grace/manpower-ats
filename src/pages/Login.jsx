import React, { useState } from 'react'
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Building2,
  KeyRound,
  User,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login } = useApp()

  const [mode, setMode] = useState('pin') // 'pin' | 'email'
  const [pin, setPin] = useState('')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePinSubmit = (e) => {
    e.preventDefault()
    setError('')

    const code = pin.trim()
    if (!code) {
      setError('Please enter your 4-digit security PIN.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const ok = login('', code)
      if (!ok) {
        setError('Incorrect PIN. (Default Security PIN is 1234)')
      }
      setLoading(false)
    }, 180)
  }

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email or username.')
      return
    }
    if (!pin.trim()) {
      setError('Please enter your password / PIN.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const ok = login(email.trim(), pin.trim())
      if (!ok) {
        setError('Invalid credentials or PIN.')
      }
      setLoading(false)
    }, 180)
  }

  const quickUnlock = (demoEmail, demoPin = '1234') => {
    setError('')
    login(demoEmail, demoPin)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 space-y-4">
        {/* Header */}
        <div className="text-center space-y-1.5 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl border border-blue-400/30">
            <Building2 size={28} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">HQS MANPOWER SUPPLY</h1>
          <p className="text-xs text-blue-300 font-medium uppercase tracking-widest">
            Browser Protection Gate
          </p>
        </div>

        {/* Protection Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 border border-white/20">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock size={15} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Protected Workspace</h2>
                <p className="text-[11px] text-gray-500">Enter PIN to access in this browser</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck size={11} /> Locked
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('pin'); setError(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'pin'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Quick PIN Unlock
            </button>
            <button
              type="button"
              onClick={() => { setMode('email'); setError(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'email'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign in with Email
            </button>
          </div>

          {/* Form */}
          {mode === 'pin' ? (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Security PIN
                  </label>
                  <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                    Default PIN: 1234
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    maxLength={16}
                    value={pin}
                    onChange={e => {
                      setPin(e.target.value)
                      setError('')
                    }}
                    placeholder="Enter PIN (1234)"
                    className="w-full border border-gray-300 rounded-xl pl-3.5 pr-10 py-3 text-base tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-bold text-gray-900 shadow-2xs"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound size={16} />
                <span>{loading ? 'Verifying PIN…' : 'Unlock Workspace'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  placeholder="e.g. hnin.yumaw@hqsmanpower.com"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Password / PIN
                  </label>
                  <span className="text-[11px] text-blue-600 font-medium">Default: 1234</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pin}
                    onChange={e => {
                      setPin(e.target.value)
                      setError('')
                    }}
                    placeholder="Enter password"
                    className="w-full border border-gray-300 rounded-xl pl-3.5 pr-10 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating…' : 'Sign In'}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* Quick Demo Unlock Buttons */}
          <div className="pt-3 border-t border-gray-100 text-center space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
              <span>Quick Unlock:</span>
              <span className="text-emerald-600 flex items-center gap-1">
                <Sparkles size={11} /> 1-Click
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => quickUnlock('hnin.yumaw@hqsmanpower.com', '1234')}
                className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 border border-gray-200 hover:border-blue-300 rounded-lg text-xs font-semibold transition-all cursor-pointer truncate"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => quickUnlock('aungkyaw.kyaw@hqsmanpower.com', '1234')}
                className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 border border-gray-200 hover:border-blue-300 rounded-lg text-xs font-semibold transition-all cursor-pointer truncate"
              >
                Recruiter
              </button>
              <button
                type="button"
                onClick={() => quickUnlock('reviewer@pttep.com', '1234')}
                className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 border border-gray-200 hover:border-blue-300 rounded-lg text-xs font-semibold transition-all cursor-pointer truncate"
              >
                Client
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          🔒 Unauthorized access prohibited · HQS Manpower Supply
        </p>
      </div>
    </div>
  )
}
