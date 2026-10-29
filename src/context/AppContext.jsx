import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'
import {
  seedJobs,
  seedCandidates,
  seedInterviews,
  seedTeam,
  seedEmailTemplates,
} from '../data/seedData'

export const SYSTEM_ROLES = {
  admin: {
    id: 'admin',
    name: 'Administrator',
    badge: 'System Admin',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    description: 'Full uninhibited access across all branches, jobs, candidates, salary configurations, and system danger zone.',
    permissions: {
      canManageJobs: true,
      canDeleteJobs: true,
      canManageCandidates: true,
      canDeleteCandidates: true,
      canViewSalary: true,
      canManageSettings: true,
      canAccessDangerZone: true,
      canAccessAllBranches: true,
      canManageTeam: true,
      canManageTemplates: true,
    },
  },
  recruiter: {
    id: 'recruiter',
    name: 'Talent Acquisition Recruiter',
    badge: 'Recruiter',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Can manage requisitions and candidates in assigned branch. Cannot permanently delete jobs/candidates or reset databases.',
    permissions: {
      canManageJobs: true,
      canDeleteJobs: false,
      canManageCandidates: true,
      canDeleteCandidates: false,
      canViewSalary: true,
      canManageSettings: false,
      canAccessDangerZone: false,
      canAccessAllBranches: false,
      canManageTeam: false,
      canManageTemplates: true,
    },
  },
  client_reviewer: {
    id: 'client_reviewer',
    name: 'Client Hiring Reviewer (External)',
    badge: 'Client Reviewer',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Read-only shortlisted candidate viewer for client review (e.g. PTTEP / SLB). Commercial salary fields are redacted.',
    permissions: {
      canManageJobs: false,
      canDeleteJobs: false,
      canManageCandidates: false,
      canDeleteCandidates: false,
      canViewSalary: false,
      canManageSettings: false,
      canAccessDangerZone: false,
      canAccessAllBranches: false,
      canManageTeam: false,
      canManageTemplates: false,
    },
  },
}

export const DEFAULT_USERS = [
  {
    id: 'u_admin',
    name: 'Daw Hnin Yu Maw',
    title: 'Managing Director & Lead Admin',
    email: 'hnin.yumaw@hqsmanpower.com',
    role: 'admin',
    branch: 'ALL',
    avatar: 'HY',
    pin: '1234',
  },
  {
    id: 'u_recruiter_hqs',
    name: 'U Aung Kyaw Kyaw',
    title: 'Senior Recruiter (HQS Branch)',
    email: 'aungkyaw.kyaw@hqsmanpower.com',
    role: 'recruiter',
    branch: 'HQS',
    avatar: 'AK',
    pin: '1234',
  },
  {
    id: 'u_recruiter_aqs',
    name: 'Daw Thae Nu San',
    title: 'Recruitment Specialist (AQS Branch)',
    email: 'thae.nusan@hqsmanpower.com',
    role: 'recruiter',
    branch: 'AQS',
    avatar: 'TN',
    pin: '1234',
  },
  {
    id: 'u_client_pttep',
    name: 'Dr. Somchai (PTTEP Reviewer)',
    title: 'Hiring Manager · PTTEP Myanmar',
    email: 'reviewer@pttep.com',
    role: 'client_reviewer',
    branch: 'HQS',
    avatar: 'SC',
    pin: '1234',
  },
]

const AppContext = createContext(null)

const initialState = {
  jobs: seedJobs,
  candidates: seedCandidates,
  interviews: seedInterviews,
  team: seedTeam,
  emailTemplates: seedEmailTemplates,
  authUsers: DEFAULT_USERS,
  auth: {
    isAuthenticated: false,
    user: null,
  },
  settings: {
    companyName: 'HQS Manpower Supply Co., Ltd.',
    companyLogo: '',
    defaultCurrency: 'MMK',
    exchangeRate: 3500,       // 1 USD = X MMK
    timezone: 'Asia/Yangon',
    currentBranch: 'ALL',     // 'ALL', 'HQS', 'AQS', 'QSL'
    currentClient: 'ALL',     // 'ALL', 'PTTEP', 'SLB', 'POSCO'
    currentUser: 'u_admin',
  },
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function reducer(state, action) {
  switch (action.type) {
    // ── AUTHENTICATION ────────────────────────────────────
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload,
        },
        settings: {
          ...state.settings,
          currentUser: action.payload.id,
          // If recruiter has restricted branch, enforce it
          currentBranch: action.payload.branch !== 'ALL' ? action.payload.branch : state.settings.currentBranch,
        },
      }

    case 'LOGOUT':
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
        },
      }

    case 'UPDATE_USER_PIN': {
      const { userId, newPin } = action.payload
      const updatedUsers = state.authUsers.map(u => (u.id === userId ? { ...u, pin: newPin } : u))
      const updatedAuthUser = state.auth.user?.id === userId ? { ...state.auth.user, pin: newPin } : state.auth.user
      return {
        ...state,
        authUsers: updatedUsers,
        auth: {
          ...state.auth,
          user: updatedAuthUser,
        },
      }
    }

    // ── JOBS ──────────────────────────────────────────────
    case 'ADD_JOB':
      return { ...state, jobs: [...state.jobs, { ...action.payload, id: generateId('j'), postedAt: new Date().toISOString().split('T')[0], applicantCount: 0 }] }
    case 'UPDATE_JOB':
      return { ...state, jobs: state.jobs.map(j => j.id === action.payload.id ? { ...j, ...action.payload } : j) }
    case 'DELETE_JOB':
      return { ...state, jobs: state.jobs.filter(j => j.id !== action.payload) }

    // ── CANDIDATES ────────────────────────────────────────
    case 'ADD_CANDIDATE': {
      const initialStage = action.payload.stage || 'Applied'
      const todayStr = new Date().toISOString().split('T')[0]
      return {
        ...state,
        candidates: [
          {
            ...action.payload,
            id: generateId('c'),
            appliedAt: action.payload.appliedAt || todayStr,
            stage: initialStage,
            notes: action.payload.notes || [],
            timeline: [{ stage: initialStage, date: todayStr }],
            rating: action.payload.rating || 0,
          },
          ...state.candidates,
        ],
      }
    }
    case 'UPDATE_CANDIDATE':
      return { ...state, candidates: state.candidates.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) }
    case 'DELETE_CANDIDATE':
      return { ...state, candidates: state.candidates.filter(c => c.id !== action.payload) }
    case 'MOVE_CANDIDATE_STAGE': {
      const { candidateId, newStage } = action.payload
      return {
        ...state,
        candidates: state.candidates.map(c => {
          if (c.id !== candidateId) return c
          const alreadyInStage = c.timeline.some(t => t.stage === newStage)
          return {
            ...c,
            stage: newStage,
            timeline: alreadyInStage
              ? c.timeline
              : [...c.timeline, { stage: newStage, date: new Date().toISOString().split('T')[0] }],
          }
        }),
      }
    }
    case 'ADD_NOTE': {
      const { candidateId, note } = action.payload
      return {
        ...state,
        candidates: state.candidates.map(c =>
          c.id === candidateId
            ? { ...c, notes: [...c.notes, { ...note, id: generateId('n'), createdAt: new Date().toISOString().split('T')[0] }] }
            : c
        ),
      }
    }
    case 'DELETE_NOTE': {
      const { candidateId, noteId } = action.payload
      return {
        ...state,
        candidates: state.candidates.map(c =>
          c.id === candidateId ? { ...c, notes: c.notes.filter(n => n.id !== noteId) } : c
        ),
      }
    }
    case 'UPDATE_RATING':
      return {
        ...state,
        candidates: state.candidates.map(c =>
          c.id === action.payload.candidateId ? { ...c, rating: action.payload.rating } : c
        ),
      }

    // ── INTERVIEWS ────────────────────────────────────────
    case 'ADD_INTERVIEW':
      return { ...state, interviews: [...state.interviews, { ...action.payload, id: generateId('i') }] }
    case 'UPDATE_INTERVIEW':
      return { ...state, interviews: state.interviews.map(i => i.id === action.payload.id ? { ...i, ...action.payload } : i) }
    case 'DELETE_INTERVIEW':
      return { ...state, interviews: state.interviews.filter(i => i.id !== action.payload) }

    // ── TEAM ──────────────────────────────────────────────
    case 'ADD_TEAM_MEMBER':
      return { ...state, team: [...state.team, { ...action.payload, id: generateId('t'), joinedAt: new Date().toISOString().split('T')[0] }] }
    case 'UPDATE_TEAM_MEMBER':
      return { ...state, team: state.team.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t) }
    case 'DELETE_TEAM_MEMBER':
      return { ...state, team: state.team.filter(t => t.id !== action.payload) }

    // ── EMAIL TEMPLATES ───────────────────────────────────
    case 'ADD_TEMPLATE':
      return { ...state, emailTemplates: [...state.emailTemplates, { ...action.payload, id: generateId('et') }] }
    case 'UPDATE_TEMPLATE':
      return { ...state, emailTemplates: state.emailTemplates.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t) }
    case 'DELETE_TEMPLATE':
      return { ...state, emailTemplates: state.emailTemplates.filter(t => t.id !== action.payload) }

    // ── SETTINGS & FILTERS ────────────────────────────────
    case 'SET_BRANCH_FILTER':
      return {
        ...state,
        settings: {
          ...state.settings,
          currentBranch: action.payload,
        },
      }
    case 'SET_CLIENT_FILTER':
      return {
        ...state,
        settings: {
          ...state.settings,
          currentClient: action.payload,
        },
      }
    case 'RESET_FILTERS':
      return {
        ...state,
        settings: {
          ...state.settings,
          currentBranch: 'ALL',
          currentClient: 'ALL',
        },
      }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    case 'RESET_DEMO_DATA':
      return {
        ...initialState,
        jobs: seedJobs,
        candidates: seedCandidates,
        interviews: seedInterviews,
        team: seedTeam,
        emailTemplates: seedEmailTemplates,
      }

    default:
      return state
  }
}

const CURRENT_DATA_VERSION = 'hqs_data_real_v4'

function loadState() {
  try {
    let base = initialState
    const serialized = localStorage.getItem('hqs_ats_state')
    if (serialized) {
      const parsed = JSON.parse(serialized)
      const candidates = (Array.isArray(parsed.candidates) && parsed.candidates.length > 0)
        ? parsed.candidates
        : seedCandidates
      const jobs = (Array.isArray(parsed.jobs) && parsed.jobs.length > 0)
        ? parsed.jobs
        : seedJobs
      const hasBurmese = parsed.emailTemplates?.some(t => /[\u1000-\u109F]/.test(t.body || ''))
      const emailTemplates = (!parsed.emailTemplates || parsed.emailTemplates.length === 0 || hasBurmese)
        ? seedEmailTemplates
        : parsed.emailTemplates

      // Ensure authUsers has all default users plus any saved custom pins
      const savedUsers = Array.isArray(parsed.authUsers) && parsed.authUsers.length > 0
        ? parsed.authUsers
        : DEFAULT_USERS

      base = {
        ...parsed,
        jobs,
        candidates,
        emailTemplates,
        authUsers: savedUsers,
        auth: {
          isAuthenticated: false,
          user: null,
        },
        settings: {
          ...initialState.settings,
          ...parsed.settings,
          currentBranch: parsed.settings?.currentBranch || 'ALL',
          currentClient: parsed.settings?.currentClient || 'ALL',
        },
      }
    }

    // Check for saved session in localStorage
    const savedSession = localStorage.getItem('hqs_auth_session')
    if (savedSession) {
      try {
        const sessionUser = JSON.parse(savedSession)
        const matched = (base.authUsers || DEFAULT_USERS).find(u => u.id === sessionUser.id)
        if (matched) {
          base.auth = {
            isAuthenticated: true,
            user: matched,
          }
          if (matched.branch && matched.branch !== 'ALL') {
            base.settings.currentBranch = matched.branch
          }
        }
      } catch {
        // ignore invalid session
      }
    }

    return base
  } catch {
    // ignore
  }
  return initialState
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    try {
      localStorage.setItem('hqs_ats_state', JSON.stringify(state))
    } catch {
      // ignore quota errors
    }
  }, [state])

  // Sync auth session to localStorage
  useEffect(() => {
    try {
      if (state.auth?.isAuthenticated && state.auth?.user) {
        localStorage.setItem('hqs_auth_session', JSON.stringify(state.auth.user))
      } else {
        localStorage.removeItem('hqs_auth_session')
      }
    } catch {
      // ignore
    }
  }, [state.auth])

  const login = useCallback((userId, pin) => {
    const user = (state.authUsers || DEFAULT_USERS).find(u => u.id === userId)
    if (!user) return false
    const expectedPin = user.pin || '1234'
    if (String(pin).trim() !== String(expectedPin).trim()) {
      return false
    }

    dispatch({ type: 'LOGIN_SUCCESS', payload: user })
    return true
  }, [state.authUsers])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('hqs_auth_session')
    } catch {
      // ignore
    }
    dispatch({ type: 'LOGOUT' })
  }, [])

  const updateUserPin = useCallback((userId, newPin) => {
    dispatch({ type: 'UPDATE_USER_PIN', payload: { userId, newPin } })
  }, [])

  const currentUser = state.auth?.user || null
  const currentRole = currentUser?.role || 'admin'
  const userRoleConfig = SYSTEM_ROLES[currentRole] || SYSTEM_ROLES.admin

  const hasPermission = useCallback((permissionName) => {
    if (!state.auth?.isAuthenticated || !state.auth?.user) return false
    const role = state.auth.user.role
    if (role === 'admin') return true
    const roleObj = SYSTEM_ROLES[role]
    if (!roleObj) return false
    return Boolean(roleObj.permissions?.[permissionName])
  }, [state.auth])

  const value = useMemo(() => ({
    state,
    dispatch,
    login,
    logout,
    updateUserPin,
    currentUser,
    userRoleConfig,
    hasPermission,
  }), [state, login, logout, updateUserPin, currentUser, userRoleConfig, hasPermission])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
