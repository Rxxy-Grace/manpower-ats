import React, { createContext, useContext, useReducer, useEffect } from 'react'
import {
  seedJobs,
  seedCandidates,
  seedInterviews,
  seedTeam,
  seedEmailTemplates,
} from '../data/seedData'

const AppContext = createContext(null)

const initialState = {
  jobs: seedJobs,
  candidates: seedCandidates,
  interviews: seedInterviews,
  team: seedTeam,
  emailTemplates: seedEmailTemplates,
  settings: {
    companyName: 'HQS Manpower Supply Co., Ltd.',
    companyLogo: '',
    defaultCurrency: 'MMK',
    exchangeRate: 3500,       // 1 USD = X MMK
    timezone: 'Asia/Yangon',
    currentBranch: 'ALL',     // 'ALL', 'HQS', 'AQS', 'QSL'
    currentClient: 'ALL',     // 'ALL', 'PTTEP', 'SLB', 'POSCO'
    currentUser: 't1',
  },
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function reducer(state, action) {
  switch (action.type) {
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
    const version = localStorage.getItem('hqs_data_version')
    if (version !== CURRENT_DATA_VERSION) {
      // Automatically replace old demo data with new real recruitment data
      localStorage.setItem('hqs_data_version', CURRENT_DATA_VERSION)
      localStorage.removeItem('hqs_ats_state')
      return initialState
    }

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

      return {
        ...parsed,
        jobs,
        candidates,
        emailTemplates,
        settings: {
          ...initialState.settings,
          ...parsed.settings,
          currentBranch: parsed.settings?.currentBranch || 'ALL',
          currentClient: parsed.settings?.currentClient || 'ALL',
        },
      }
    }
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

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
