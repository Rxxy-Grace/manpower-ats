/**
 * resumeParser.js
 * Client-side CV/Resume parser — supports PDF and DOCX.
 * Extracts: firstName, lastName, email, phone, location, linkedIn, tags, summary
 */

import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Set local bundled worker via Vite ?url import (works 100% offline and matches exact version)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

// ─── Text Extraction ────────────────────────────────────────────────────────

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }
  return fullText
}

async function extractTextFromDOCX(file) {
  // Dynamically import mammoth to avoid bundle issues
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return extractTextFromPDF(file)
  if (ext === 'docx' || ext === 'doc') return extractTextFromDOCX(file)
  throw new Error(`Unsupported file type: .${ext}. Please upload a PDF or DOCX file.`)
}

// ─── Field Parsers ──────────────────────────────────────────────────────────

function parseEmail(text) {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/i)
  return match ? match[0] : ''
}

function parsePhone(text) {
  // Covers Myanmar (+95 9...), international, and local formats
  const patterns = [
    /(?:\+95[\s\-]?9[\s\-]?\d{7,9})/,               // Myanmar mobile +95 9...
    /(?:\+95[\s\-]?[0-9]{8,10})/,                    // Myanmar other
    /(?:09[\s\-]?\d{7,9})/,                           // Myanmar 09...
    /(?:\+?1?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4})/, // US/international
    /(?:\+?[\d\s\-().]{10,17})/,                      // Generic
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[0].trim()
  }
  return ''
}

function parseLinkedIn(text) {
  const match = text.match(/(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([a-zA-Z0-9\-_%]+)/i)
  return match ? `linkedin.com/in/${match[1]}` : ''
}

function parseName(text) {
  // Strategy: find the first line(s) that look like a person's name
  // A name line: 2–4 words, each capitalized, no numbers or special chars
  const lines = text
    .split(/\n/)
    .map(l => l.trim())
    .filter(l => l.length > 1 && l.length < 60)

  for (const line of lines.slice(0, 15)) {
    // Skip lines with email, phone, URL, or common resume headers
    if (/@|http|linkedin|\.com|Phone|Email|Address|Resume|CV|Curriculum|Objective|Summary|Experience|Education|Skills|Profile|Page \d/i.test(line)) continue
    if (/\d{4}/.test(line)) continue // Skip lines with years
    if (line.split(/\s+/).length < 2 || line.split(/\s+/).length > 5) continue

    // Check each word is mostly alphabetical and plausibly capitalized
    const words = line.split(/\s+/)
    const looksLikeName = words.every(w =>
      /^[A-Za-zÀ-ÿ''\-]{2,}$/.test(w) &&
      /[A-Z]/.test(w[0])
    )
    if (looksLikeName) return line
  }
  return ''
}

function parseLocation(text) {
  // Look for city, state or city, country patterns
  const patterns = [
    // Myanmar cities
    /\b(Yangon|Mandalay|Naypyidaw|Bago|Pathein|Mawlamyine|Taunggyi|Sagaing|Monywa|Pyay)\b(?:[,\s]+Myanmar)?/i,
    // Generic city, country/state
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*([A-Z][a-zA-Z\s]{2,20})\b/,
    // Address with "Location:" or "Address:" label
    /(?:Location|Address|City)[:\s]+([A-Za-z\s,]+?)(?:\n|$)/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return (match[1] + (match[2] ? `, ${match[2]}` : '')).trim()
  }
  return ''
}

function parseTags(text) {
  const skillKeywords = [
    // Manpower / factory
    'Forklift', 'QC', 'Quality Control', 'Welding', 'Electrical', 'Mechanical',
    'Warehouse', 'Logistics', 'Assembly', 'Production', 'Inventory', 'Shift work',
    // Office
    'MS Office', 'Excel', 'Word', 'PowerPoint', 'English', 'Data Entry',
    'Administration', 'Accounting', 'HR', 'Payroll',
    // General
    'Leadership', 'Teamwork', 'Communication', 'Management',
    // Tech
    'JavaScript', 'Python', 'React', 'SQL', 'Java', 'PHP', 'HTML', 'CSS',
    'AutoCAD', 'SAP', 'ERP',
    // Myanmar specific
    'Myanmar', 'Driving License', 'Security', 'GMP', 'ISO', 'HACCP',
  ]
  const found = []
  const lowerText = text.toLowerCase()
  for (const skill of skillKeywords) {
    if (lowerText.includes(skill.toLowerCase())) found.push(skill)
    if (found.length >= 6) break
  }
  return found
}

function parseExperience(text) {
  // Extract years of experience
  const match = text.match(/(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/i)
  if (match) return `${match[1]}+ years exp`
  return ''
}

function parseSummary(text) {
  // Look for a summary/objective/profile section
  const sectionMatch = text.match(
    /(?:Summary|Objective|Profile|About Me|Professional Summary)[:\s\n]+([^\n]{30,400})/i
  )
  if (sectionMatch) return sectionMatch[1].trim().slice(0, 300)
  return ''
}

// ─── Main Parse Function ─────────────────────────────────────────────────────

/**
 * parseResumeText(text)
 * Returns an object with extracted candidate fields ready to pre-fill the form.
 */
export function parseResumeText(text) {
  const email = parseEmail(text)
  const phone = parsePhone(text)
  const linkedIn = parseLinkedIn(text)
  const location = parseLocation(text)
  const fullName = parseName(text)
  const tags = parseTags(text)
  const experience = parseExperience(text)
  const summary = parseSummary(text)

  // Split full name into first + last
  const nameParts = fullName.trim().split(/\s+/)
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Build avatar initials
  const avatar = `${firstName[0] || '?'}${lastName[0] || '?'}`.toUpperCase()

  // Combine experience into tags if found
  if (experience && !tags.includes(experience)) tags.unshift(experience)

  return {
    firstName,
    lastName,
    email,
    phone,
    location,
    linkedIn,
    avatar,
    tags,
    summary,
    rawText: text,
  }
}

/**
 * parseResumeFile(file)
 * Full pipeline: file → text → parsed fields
 */
export async function parseResumeFile(file) {
  const text = await extractTextFromFile(file)
  return parseResumeText(text)
}
