import React, { useState } from 'react'
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login } = useApp()

  const [email, setEmail] = useState('hnin.yumaw@hqsmanpower.com')
  const [password, setPassword] = useState('1234')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email or username.')
      return
    }
    if (!password.trim()) {
      setError('Please enter your password / PIN.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const ok = login(email, password)
      if (!ok) {
        setError('Invalid credentials. (Demo PIN is 1234)')
      }
      setLoading(false)
    }, 200)
  }

  const fillQuick = (demoEmail, demoPin = '1234') => {
    setEmail(demoEmail)
    setPassword(demoPin)
    setError('')
    login(demoEmail, demoPin)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-7 sm:p-8 space-y-6 border border-gray-100">

        {/* Company Header */}
        <div className="text-center">
          <div className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-600/30">
            <Building2 size={26} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Sign in to HQS ATS</h1>
          <p className="text-xs text-gray-500 mt-1">HQS Manpower Supply Co., Ltd.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="name@hqsmanpower.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                required
                autoFocus
              />
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Password / PIN
              </label>
              <span className="text-[11px] text-blue-600 font-medium">Default: 1234</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-mono"
                required
              />
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
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
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Signing in…' : 'Sign In'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="pt-3 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 mb-2">Quick Sign-in:</p>
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => fillQuick('hnin.yumaw@hqsmanpower.com')}
              className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillQuick('aungkyaw.kyaw@hqsmanpower.com')}
              className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => fillQuick('reviewer@pttep.com')}
              className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              Client
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
