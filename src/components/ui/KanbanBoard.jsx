import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { Star, Clock, GripVertical } from 'lucide-react'
import Avatar from './Avatar'
import Badge from './Badge'
import { PIPELINE_STAGES } from '../../data/seedData'
import { useApp } from '../../context/AppContext'

function CandidateCard({ candidate, isDragging = false }) {
  const navigate = useNavigate()
  const daysInStage = candidate.timeline.length > 0
    ? Math.floor((Date.now() - new Date(candidate.timeline[candidate.timeline.length - 1].date).getTime()) / 86400000)
    : 0

  return (
    <div
      onClick={() => !isDragging && navigate(`/candidates/${candidate.id}`)}
      className={`bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all ${isDragging ? 'shadow-lg rotate-1 opacity-90' : ''}`}
    >
      <div className="flex items-start gap-2 mb-2">
        <Avatar initials={candidate.avatar} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {candidate.firstName} {candidate.lastName}
          </p>
          <p className="text-xs text-gray-500 truncate">{candidate.email}</p>
        </div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(s => (
            <Star
              key={s}
              size={10}
              className={s <= candidate.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {candidate.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="tag">{tag}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={10} />
          {daysInStage}d
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        via {candidate.source}
      </div>
    </div>
  )
}

function SortableCard({ candidate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: candidate.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab z-10 p-1"
      >
        <GripVertical size={12} className="text-gray-400" />
      </div>
      <CandidateCard candidate={candidate} />
    </div>
  )
}

function Column({ stage, candidates, color }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-64 shrink-0 rounded-xl border-2 transition-colors ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-transparent bg-gray-100'
      }`}
    >
      {/* Column Header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{stage}</h3>
          <span className="text-xs font-semibold bg-white text-gray-600 rounded-full px-2 py-0.5 border border-gray-200">
            {candidates.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 px-2 pb-3 space-y-2 min-h-[120px]">
          {candidates.map(c => (
            <SortableCard key={c.id} candidate={c} />
          ))}
          {candidates.length === 0 && (
            <div className="flex items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-xs text-gray-400">Drop here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default function KanbanBoard({ candidates }) {
  const { dispatch } = useApp()
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const grouped = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = candidates.filter(c => c.stage === stage)
    return acc
  }, {})

  const activeCandidate = activeId ? candidates.find(c => c.id === activeId) : null

  function findStageByCardId(id) {
    return PIPELINE_STAGES.find(stage => grouped[stage].some(c => c.id === id))
  }

  function handleDragStart({ active }) {
    setActiveId(active.id)
  }

  function handleDragEnd({ active, over }) {
    setActiveId(null)
    if (!over) return

    const fromStage = findStageByCardId(active.id)
    const toStage = PIPELINE_STAGES.includes(over.id)
      ? over.id
      : findStageByCardId(over.id)

    if (toStage && fromStage !== toStage) {
      dispatch({ type: 'MOVE_CANDIDATE_STAGE', payload: { candidateId: active.id, newStage: toStage } })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
        {PIPELINE_STAGES.map(stage => (
          <Column
            key={stage}
            stage={stage}
            candidates={grouped[stage]}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCandidate && <CandidateCard candidate={activeCandidate} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}
