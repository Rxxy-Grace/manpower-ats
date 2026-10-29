import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, MapPin, ExternalLink, Star, Trash2, Plus,
  Edit, ChevronRight, Clock, Calendar, MessageSquare, Tag,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import CandidateForm from '../components/forms/CandidateForm'
import InterviewForm from '../components/forms/InterviewForm'
import { PIPELINE_STAGES } from '../data/seedData'

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            size={18}
            className={s <= (hover || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  )
}

export default function CandidateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const candidate = state.candidates.find(c => c.id === id)
  if (!candidate) return (
    <div className="p-6">
      <button onClick={() => navigate('/candidates')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Candidates
      </button>
      <p className="text-gray-500">Candidate not found.</p>
    </div>
  )

  const job = state.jobs.find(j => j.id === candidate.jobId)
  const interviews = state.interviews.filter(i => i.candidateId === id)
  const currentStageIdx = PIPELINE_STAGES.indexOf(candidate.stage)

  const handleUpdate = (data) => {
    dispatch({ type: 'UPDATE_CANDIDATE', payload: { ...data, id } })
    setShowEditModal(false)
  }

  const handleDelete = () => {
    if (window.confirm('Delete this candidate? This cannot be undone.')) {
      dispatch({ type: 'DELETE_CANDIDATE', payload: id })
      navigate('/candidates')
    }
  }

  const handleMoveStage = (stage) => {
    dispatch({ type: 'MOVE_CANDIDATE_STAGE', payload: { candidateId: id, newStage: stage } })
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return
    dispatch({ type: 'ADD_NOTE', payload: { candidateId: id, note: { text: newNote, author: 't1' } } })
    setNewNote('')
  }

  const handleDeleteNote = (noteId) => {
    dispatch({ type: 'DELETE_NOTE', payload: { candidateId: id, noteId } })
  }

  const handleRating = (rating) => {
    dispatch({ type: 'UPDATE_RATING', payload: { candidateId: id, rating } })
  }

  const handleAddInterview = (data) => {
    dispatch({ type: 'ADD_INTERVIEW', payload: data })
    setShowInterviewModal(false)
  }

  const getMemberName = (memberId) => state.team.find(t => t.id === memberId)?.name || memberId

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/candidates')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to Candidates
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <Avatar initials={candidate.avatar} size="xl" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {candidate.firstName} {candidate.lastName}
              </h1>
              <p className="text-blue-600 font-medium mt-0.5">{job?.title || 'Unknown Role'}</p>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <a href={`mailto:${candidate.email}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                  <Mail size={13} /> {candidate.email}
                </a>
                {candidate.phone && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Phone size={13} /> {candidate.phone}
                  </span>
                )}
                {candidate.location && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={13} /> {candidate.location}
                  </span>
                )}
                {candidate.linkedIn && (
                  <a href={`https://${candidate.linkedIn}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-500 hover:underline">
                    <ExternalLink size={13} /> LinkedIn
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {candidate.tags.map(tag => (
                  <Badge key={tag} variant="tag">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={<Edit size={14} />} onClick={() => setShowEditModal(true)}>Edit</Button>
              <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={handleDelete}>Delete</Button>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1 text-right">Rating</p>
              <StarRating value={candidate.rating} onChange={handleRating} />
            </div>
            <Badge variant="stage" value={candidate.stage}>{candidate.stage}</Badge>
          </div>
        </div>

        {/* Pipeline Progress */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Pipeline Stage</p>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {PIPELINE_STAGES.map((stage, i) => {
              const isActive = stage === candidate.stage
              const isPast = PIPELINE_STAGES.indexOf(stage) < currentStageIdx
              const isClickable = stage !== candidate.stage
              return (
                <React.Fragment key={stage}>
                  <button
                    onClick={() => isClickable && handleMoveStage(stage)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isPast
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {stage}
                  </button>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <ChevronRight size={12} className="text-gray-300 shrink-0" />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['overview', 'interviews', 'notes', 'timeline'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {tab === 'interviews' && interviews.length > 0 && (
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-600 rounded-full px-1.5 py-0.5">{interviews.length}</span>
            )}
            {tab === 'notes' && candidate.notes.length > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">{candidate.notes.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Candidate Details</h3>
            <dl className="space-y-3">
              {[
                ['Source', candidate.source],
                ['Applied', candidate.appliedAt],
                ['Location', candidate.location || '—'],
                ['Job Applied', job?.title || '—'],
                ['Department', job?.department || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" icon={<Calendar size={15} />} onClick={() => setShowInterviewModal(true)}>
                Schedule Interview
              </Button>
              <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                <Mail size={15} /> Send Email
              </a>
              {candidate.stage !== 'Hired' && candidate.stage !== 'Rejected' && (
                <Button
                  variant="success"
                  className="w-full justify-start"
                  icon={<ChevronRight size={15} />}
                  onClick={() => {
                    const nextStage = PIPELINE_STAGES[currentStageIdx + 1]
                    if (nextStage) handleMoveStage(nextStage)
                  }}
                >
                  Move to Next Stage
                </Button>
              )}
              {candidate.stage !== 'Rejected' && (
                <Button
                  variant="danger"
                  className="w-full justify-start"
                  onClick={() => handleMoveStage('Rejected')}
                >
                  Mark as Rejected
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'interviews' && (
        <div>
          <div className="flex justify-end mb-4">
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowInterviewModal(true)}>
              Schedule Interview
            </Button>
          </div>
          {interviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <Calendar size={36} className="mx-auto mb-3 opacity-30" />
              <p>No interviews scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map(iv => (
                <div key={iv.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{iv.type}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        📅 {iv.date} at {iv.time} · {iv.duration}min · {iv.location}
                      </p>
                      {iv.interviewers?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          Interviewers: {iv.interviewers.map(getMemberName).join(', ')}
                        </p>
                      )}
                      {iv.notes && <p className="text-sm text-gray-600 mt-2 italic">"{iv.notes}"</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="status" value={iv.status}>{iv.status}</Badge>
                      <button
                        onClick={() => dispatch({ type: 'DELETE_INTERVIEW', payload: iv.id })}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {iv.link && (
                    <a href={iv.link} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      <ExternalLink size={11} /> Join meeting
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Add Note */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <textarea
              rows={3}
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Add a note about this candidate…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button size="sm" icon={<Plus size={14} />} onClick={handleAddNote} disabled={!newNote.trim()}>
                Add Note
              </Button>
            </div>
          </div>

          {/* Notes List */}
          {candidate.notes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notes yet</p>
            </div>
          ) : (
            candidate.notes.map(note => {
              const author = state.team.find(t => t.id === note.author)
              return (
                <div key={note.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 leading-relaxed">{note.text}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {author?.name || 'Unknown'} · {note.createdAt}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-gray-300 hover:text-red-500 ml-3"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-5">Stage History</h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-5">
              {candidate.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 z-10">
                    <Clock size={14} className="text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-semibold text-gray-800">{event.stage}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Candidate" size="lg">
        <CandidateForm initial={candidate} jobs={state.jobs} onSubmit={handleUpdate} onCancel={() => setShowEditModal(false)} />
      </Modal>

      <Modal isOpen={showInterviewModal} onClose={() => setShowInterviewModal(false)} title="Schedule Interview" size="lg">
        <InterviewForm
          candidateId={id}
          jobId={candidate.jobId}
          onSubmit={handleAddInterview}
          onCancel={() => setShowInterviewModal(false)}
        />
      </Modal>
    </div>
  )
}
