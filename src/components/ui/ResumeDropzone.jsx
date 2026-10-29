import React, { useState, useRef, useCallback } from 'react'
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X, Folder, FolderOpen, ArrowRight, Check } from 'lucide-react'
import { parseResumeFile } from '../../utils/resumeParser'

const ACCEPTED_EXT = ['.pdf', '.docx', '.doc']

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

export default function ResumeDropzone({ onParsed, className = '' }) {
  const [status, setStatus] = useState('idle') // idle | dragging | parsing | success | error
  const [fileName, setFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [parsedFields, setParsedFields] = useState(null)
  const [folderFiles, setFolderFiles] = useState([])
  const [activeFolderIndex, setActiveFolderIndex] = useState(0)
  const [folderName, setFolderName] = useState('')

  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  const processFile = useCallback(async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx', 'doc'].includes(ext)) {
      setStatus('error')
      setErrorMsg('Only PDF and DOCX files are supported.')
      return
    }

    setFileName(file.name)
    setStatus('parsing')
    setErrorMsg('')

    try {
      const result = await parseResumeFile(file)
      setParsedFields(result)
      setStatus('success')
      onParsed?.(result, file)
    } catch (err) {
      console.error('Resume parse error:', err)
      setStatus('error')
      setErrorMsg(err.message || 'Failed to parse resume. Try a different file.')
    }
  }, [onParsed])

  const handleFilesSelected = (files, nameOfFolder = '') => {
    const valid = Array.from(files).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase()
      return ['pdf', 'docx', 'doc'].includes(ext)
    })

    if (valid.length === 0) {
      setStatus('error')
      setErrorMsg('No PDF or DOCX resume files found in the selected folder.')
      return
    }

    if (valid.length === 1) {
      setFolderFiles([])
      processFile(valid[0])
    } else {
      setFolderFiles(valid)
      setActiveFolderIndex(0)
      setFolderName(nameOfFolder || valid[0]?.webkitRelativePath?.split('/')[0] || 'Selected Folder')
      processFile(valid[0])
    }
  }

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setStatus('idle')
    const files = await extractFilesFromItems(e.dataTransfer)
    if (files.length > 0) {
      handleFilesSelected(files, 'Dropped Folder')
    } else if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }, [processFile])

  const handleDragOver = (e) => { e.preventDefault(); setStatus('dragging') }
  const handleDragLeave = () => setStatus('idle')

  const handleReset = () => {
    setStatus('idle')
    setFileName('')
    setErrorMsg('')
    setParsedFields(null)
    setFolderFiles([])
    setFolderName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (folderInputRef.current) folderInputRef.current.value = ''
  }

  const handleSelectFolderFile = (idx) => {
    setActiveFolderIndex(idx)
    const file = folderFiles[idx]
    if (file) {
      processFile(file)
    }
  }

  return (
    <div className={className}>
      {/* Hidden file & folder inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXT.join(',')}
        onChange={(e) => {
          if (e.target.files?.[0]) processFile(e.target.files[0])
        }}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        onChange={(e) => {
          if (e.target.files?.length) {
            const firstPath = e.target.files[0]?.webkitRelativePath || ''
            const folderBase = firstPath.split('/')[0] || 'Uploaded Folder'
            handleFilesSelected(e.target.files, folderBase)
          }
        }}
        className="hidden"
      />

      {/* Drop Zone Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-5 transition-all
          ${status === 'dragging' ? 'border-blue-500 bg-blue-50 scale-[1.01]' : ''}
          ${status === 'idle' ? 'border-gray-300 hover:border-blue-400 bg-white' : ''}
          ${status === 'parsing' ? 'border-blue-400 bg-blue-50 cursor-wait' : ''}
          ${status === 'success' ? 'border-green-400 bg-green-50/50' : ''}
          ${status === 'error' ? 'border-red-400 bg-red-50' : ''}
        `}
      >
        {/* IDLE / DRAGGING STATE */}
        {(status === 'idle' || status === 'dragging') && (
          <div className="flex flex-col items-center gap-3 text-center py-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              status === 'dragging' ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              <Upload size={22} className={status === 'dragging' ? 'text-blue-500' : 'text-slate-500'} />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">
                {status === 'dragging' ? '📂 Drop file or folder here!' : 'Drop CV file or an entire Folder here'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports PDF & DOCX resumes with automatic text parsing
              </p>
            </div>

            {/* Upload Buttons: File OR Folder */}
            <div className="flex items-center gap-2.5 mt-1 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
              >
                <FileText size={13} />
                <span>Upload File</span>
              </button>

              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                title="Select a whole folder of CVs from your computer"
              >
                <FolderOpen size={13} />
                <span>Upload Folder</span>
              </button>
            </div>
          </div>
        )}

        {/* PARSING STATE */}
        {status === 'parsing' && (
          <div className="flex flex-col items-center gap-3 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Loader2 size={24} className="text-blue-600 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Parsing candidate resume…</p>
              <p className="text-xs text-blue-600 mt-1 truncate max-w-[280px] font-medium">{fileName}</p>
            </div>
            <div className="w-full max-w-xs bg-blue-100 rounded-full h-1.5 overflow-hidden mt-1">
              <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && parsedFields && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600 shrink-0" />
                <p className="text-sm font-semibold text-green-800">CV auto-filled successfully!</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleReset() }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
                title="Clear and upload another"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-200">
              <FileText size={15} className="text-green-600 shrink-0" />
              <span className="text-xs font-medium text-gray-700 truncate flex-1">{fileName}</span>
              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                Auto-Filled
              </span>
            </div>

            {/* Extracted snapshot summary */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {parsedFields.firstName && (
                <div className="bg-white rounded-lg px-2.5 py-1.5 border border-green-100">
                  <span className="text-gray-400">Name: </span>
                  <span className="font-semibold text-gray-800">{parsedFields.firstName} {parsedFields.lastName}</span>
                </div>
              )}
              {parsedFields.email && (
                <div className="bg-white rounded-lg px-2.5 py-1.5 border border-green-100 truncate">
                  <span className="text-gray-400">Email: </span>
                  <span className="font-semibold text-gray-800">{parsedFields.email}</span>
                </div>
              )}
              {parsedFields.phone && (
                <div className="bg-white rounded-lg px-2.5 py-1.5 border border-green-100">
                  <span className="text-gray-400">Phone: </span>
                  <span className="font-semibold text-gray-800">{parsedFields.phone}</span>
                </div>
              )}
              {parsedFields.location && (
                <div className="bg-white rounded-lg px-2.5 py-1.5 border border-green-100">
                  <span className="text-gray-400">Location: </span>
                  <span className="font-semibold text-gray-800">{parsedFields.location}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1 text-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Change File
              </button>
              <span className="text-gray-300">·</span>
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="text-amber-700 hover:underline font-medium cursor-pointer"
              >
                Change Folder
              </button>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-3 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">Upload / Parse Failed</p>
              <p className="text-xs text-red-500 mt-1 max-w-[280px]">{errorMsg}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs bg-red-600 text-white font-medium px-3 py-1 rounded-md hover:bg-red-700 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MULTI-FILE / FOLDER EXPLORER SELECTOR */}
      {folderFiles.length > 1 && (
        <div className="mt-3 bg-amber-50/70 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Folder size={14} className="text-amber-700" />
              <span>Folder: {folderName}</span>
              <span className="bg-amber-200 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-mono">
                {folderFiles.length} CVs found
              </span>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Click a CV to load:</span>
          </div>

          <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
            {folderFiles.map((file, idx) => {
              const isSelected = idx === activeFolderIndex
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectFolderFile(idx)}
                  className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-200/90 text-amber-950 font-bold border border-amber-300'
                      : 'bg-white hover:bg-amber-100/60 text-gray-700 border border-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText size={12} className={isSelected ? 'text-amber-800' : 'text-gray-400'} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] text-green-700 font-bold flex items-center gap-0.5 shrink-0 ml-2">
                      <Check size={11} /> Loaded
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
