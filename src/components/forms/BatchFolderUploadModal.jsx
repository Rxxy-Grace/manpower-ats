import React, { useState, useRef } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Folder, FolderOpen, Upload, Loader2, CheckCircle2, FileText, Check, AlertCircle } from 'lucide-react'
import { parseResumeFile } from '../../utils/resumeParser'
import { useApp } from '../../context/AppContext'

// Recursively extract all files from drag-and-drop items (handles dropped folders)
async function extractFilesFromItems(dataTransfer) {
  const files = []
  const items = dataTransfer.items

  if (items && items.length > 0 && items[0].webkitGetAsEntry) {
    const queue = []
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.()
      if (entry) queue.push(entry)
    }

    while (queue.length > 0) {
      const entry = queue.shift()
      if (entry.isFile) {
        await new Promise(resolve => {
          entry.file(f => {
            files.push(f)
            resolve()
          }, () => resolve())
        })
      } else if (entry.isDirectory) {
        const reader = entry.createReader()
        const readEntries = async () => {
          const results = await new Promise(resolve => {
            reader.readEntries(r => resolve(r), () => resolve([]))
          })
          if (results.length > 0) {
            queue.push(...results)
            await readEntries()
          }
        }
        await readEntries()
      }
    }
  } else if (dataTransfer.files && dataTransfer.files.length > 0) {
    files.push(...Array.from(dataTransfer.files))
  }

  return files.filter(f => {
    const ext = f.name.split('.').pop().toLowerCase()
    return ['pdf', 'docx', 'doc'].includes(ext)
  })
}

export default function BatchFolderUploadModal({ isOpen, onClose }) {
  const { state, dispatch } = useApp()
  const [targetJobId, setTargetJobId] = useState(state.jobs[0]?.id || '')
  const [folderName, setFolderName] = useState('')
  const [parsing, setParsing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: '' })
  const [parsedCandidates, setParsedCandidates] = useState([])
  const [errorMsg, setErrorMsg] = useState('')
  const folderInputRef = useRef(null)

  const handleFiles = async (fileList, nameOfFolder = '') => {
    const validFiles = Array.from(fileList).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase()
      return ['pdf', 'docx', 'doc'].includes(ext)
    })

    if (validFiles.length === 0) {
      setErrorMsg('No PDF or DOCX resume files found in the chosen folder.')
      return
    }

    setErrorMsg('')
    setParsing(true)
    setFolderName(nameOfFolder || validFiles[0]?.webkitRelativePath?.split('/')[0] || 'Uploaded Folder')
    setProgress({ current: 0, total: validFiles.length, fileName: validFiles[0].name })

    const results = []
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      setProgress({ current: i + 1, total: validFiles.length, fileName: file.name })
      try {
        const parsed = await parseResumeFile(file)
        const firstName = parsed.firstName || file.name.replace(/\.[^/.]+$/, '').split(/[-_ ]/)[0] || 'Candidate'
        const lastName = parsed.lastName || ''
        const avatar = `${firstName[0] || '?'}${lastName[0] || '?'}`.toUpperCase()

        results.push({
          file,
          parsed,
          candidate: {
            firstName,
            lastName,
            email: parsed.email || `${firstName.toLowerCase().replace(/[^a-z]/g, '')}@talentpool.ats`,
            phone: parsed.phone || '+95 9 ...',
            location: parsed.location || 'Yangon / Offshore',
            jobId: targetJobId,
            stage: 'Applied',
            source: 'Batch Folder Upload',
            tags: parsed.tags && parsed.tags.length > 0 ? parsed.tags : ['Folder Import'],
            avatar,
            resumeFileName: file.name,
            notes: [{ text: `Imported via Folder Upload (${file.name})`, author: state.settings?.currentUser || 't1' }],
          },
        })
      } catch (err) {
        console.error('Failed to parse:', file.name, err)
        // Add fallback candidate from filename so no CV is lost
        const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/^[0-9]+[\.\-_ ]*/, '')
        const parts = rawName.split(/[-_]/)[0].trim().split(/\s+/)
        const fName = parts[0] || 'Candidate'
        const lName = parts.slice(1).join(' ') || ''
        results.push({
          file,
          parsed: null,
          candidate: {
            firstName: fName,
            lastName: lName,
            email: `${fName.toLowerCase().replace(/[^a-z]/g, '')}@talentpool.ats`,
            phone: '+95 9 ...',
            location: 'Yangon / Offshore',
            jobId: targetJobId,
            stage: 'Applied',
            source: 'Batch Folder Upload',
            tags: ['Folder Import'],
            avatar: `${fName[0] || '?'}${lName[0] || '?'}`.toUpperCase(),
            resumeFileName: file.name,
            notes: [{ text: `Imported via Folder Upload (${file.name})`, author: state.settings?.currentUser || 't1' }],
          },
        })
      }
    }

    setParsedCandidates(results)
    setParsing(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const files = await extractFilesFromItems(e.dataTransfer)
    if (files.length > 0) {
      handleFiles(files, 'Dropped Folder')
    }
  }

  const handleImportAll = () => {
    if (parsedCandidates.length === 0) return

    parsedCandidates.forEach(item => {
      dispatch({
        type: 'ADD_CANDIDATE',
        payload: {
          ...item.candidate,
          jobId: targetJobId, // Use final selected target requisition
        },
      })
    })

    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Batch Upload Candidates from Folder" size="xl">
      <div className="space-y-4">
        {/* Requisition selector */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Assign to Target Job Requisition
            </label>
            <p className="text-xs text-gray-500">
              Imported candidates will be linked to this requisition in the talent pool
            </p>
          </div>
          <select
            value={targetJobId}
            onChange={e => setTargetJobId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium min-w-[280px]"
          >
            {state.jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.code ? `[${j.code}] ` : ''}{j.title} · {j.clientCompany} ({j.branch})
              </option>
            ))}
          </select>
        </div>

        {/* Folder Picker / Dropzone */}
        {parsedCandidates.length === 0 && !parsing && (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 hover:border-amber-400 bg-amber-50/30 rounded-2xl p-8 text-center transition-all"
          >
            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              onChange={(e) => {
                if (e.target.files?.length) {
                  const firstPath = e.target.files[0]?.webkitRelativePath || ''
                  const folderBase = firstPath.split('/')[0] || 'Selected Folder'
                  handleFiles(e.target.files, folderBase)
                }
              }}
              className="hidden"
            />

            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600">
              <FolderOpen size={28} />
            </div>

            <h4 className="text-base font-bold text-gray-800 mb-1">
              Select or Drop a CV Folder
            </h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
              Select an entire folder from your computer containing candidate CVs (PDF, DOCX). The system will scan, parse, and prepare candidate profiles automatically.
            </p>

            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all"
            >
              <Folder size={16} />
              <span>Choose Folder to Upload</span>
            </button>

            {errorMsg && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-red-600 font-semibold bg-red-50 py-1.5 px-3 rounded-lg max-w-sm mx-auto">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Live Parsing Progress */}
        {parsing && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
            <Loader2 size={32} className="text-blue-600 animate-spin mx-auto mb-3" />
            <h4 className="text-sm font-bold text-blue-900 mb-1">
              Scanning & Parsing CVs in "{folderName}"…
            </h4>
            <p className="text-xs text-blue-700 mb-4 font-mono">
              Processing {progress.current} of {progress.total}: {progress.fileName}
            </p>
            <div className="w-full max-w-md bg-blue-200 rounded-full h-2.5 mx-auto overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-200"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Parsed Candidates Preview List */}
        {parsedCandidates.length > 0 && !parsing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-600" />
                <span className="text-xs font-bold text-green-900">
                  Folder "{folderName}": {parsedCandidates.length} candidate CVs parsed and ready to import
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setParsedCandidates([])
                  setFolderName('')
                }}
                className="text-xs text-green-800 hover:underline font-semibold cursor-pointer"
              >
                Choose Different Folder
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-white">
              {parsedCandidates.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                      {item.candidate.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {item.candidate.firstName} {item.candidate.lastName}
                      </p>
                      <p className="text-gray-500 truncate text-[11px]">
                        {item.candidate.email} · {item.candidate.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-gray-400 truncate max-w-[150px] font-mono">
                      {item.file.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold text-[10px] flex items-center gap-1">
                      <Check size={11} /> Ready
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                All candidates will be added with stage <span className="font-semibold text-gray-700">Applied</span> and attached CVs.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleImportAll} icon={<CheckCircle2 size={15} />}>
                  Import All {parsedCandidates.length} Candidates
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
