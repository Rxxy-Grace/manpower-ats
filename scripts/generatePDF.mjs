import PDFDocument from 'pdfkit'
import { createWriteStream } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const outputPath = join(__dir, 'Demo_Resume_Ko_Aung_Kyaw_Zin.pdf')

const doc = new PDFDocument({ margin: 50, size: 'A4' })
doc.pipe(createWriteStream(outputPath))

// ── Color palette ─────────────────────────────────────────────────────────
const BLUE      = '#1D4ED8'
const DARK      = '#1F2937'
const GRAY      = '#6B7280'
const LIGHT     = '#F3F4F6'
const GREEN     = '#15803D'
const ACCENT    = '#3B82F6'

// ── Helper: horizontal rule ───────────────────────────────────────────────
const rule = (color = ACCENT, thickness = 1) => {
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(color).lineWidth(thickness).stroke()
  doc.moveDown(0.4)
}

// ── HEADER ────────────────────────────────────────────────────────────────
doc.rect(0, 0, 595, 110).fill(BLUE)

doc.fillColor('white')
   .font('Helvetica-Bold').fontSize(26)
   .text('Ko Aung Kyaw Zin', 50, 28)

doc.font('Helvetica').fontSize(13).fillColor('#BFDBFE')
   .text('Production & Quality Control Worker', 50, 62)

// Contact info row
doc.fontSize(9).fillColor('#DBEAFE')
   .text('📧 aungkyawzin.work@gmail.com', 50, 84)
   .text('📞 +95 9 765 432 101', 215, 84)
   .text('📍 Hlaing Township, Yangon', 330, 84)
   .text('🔗 linkedin.com/in/aungkyawzin', 50, 96)

doc.moveDown(4.2)

// ── PROFESSIONAL SUMMARY ─────────────────────────────────────────────────
doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(11)
   .text('PROFESSIONAL SUMMARY')
rule(ACCENT, 2)

doc.fillColor(DARK).font('Helvetica').fontSize(10)
   .text(
     'Dedicated and physically fit production worker with 4+ years of experience in ' +
     'factory operations, quality control inspection, and warehouse management. ' +
     'Proven track record of meeting production targets and maintaining GMP and ISO standards. ' +
     'Willing to work rotating shifts and committed to team-oriented workplace environments.',
     { align: 'justify' }
   )
doc.moveDown(0.8)

// ── WORK EXPERIENCE ───────────────────────────────────────────────────────
doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(11)
   .text('WORK EXPERIENCE')
rule(ACCENT, 2)

// Job 1
doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10.5)
   .text('QC Inspector / Line Supervisor', { continued: true })
doc.fillColor(GRAY).font('Helvetica').fontSize(10)
   .text('   —   Golden Star Garment Factory, Yangon')
doc.fillColor(GRAY).fontSize(9).font('Helvetica-Oblique')
   .text('January 2022 – August 2026  (4 years 8 months)')
doc.moveDown(0.3)
const bullets1 = [
  'Supervised production line of 25 workers ensuring quality standards are met',
  'Conducted daily QC inspections and documented non-conformance reports',
  'Trained new workers on GMP procedures and safety protocols',
  'Consistently achieved 98% on-time delivery rate for assigned production batches',
  'Operated forklift for raw material movement within the factory premises',
]
bullets1.forEach(b => {
  doc.fillColor(DARK).font('Helvetica').fontSize(10)
     .text(`•  ${b}`, { indent: 12 })
})
doc.moveDown(0.6)

// Job 2
doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10.5)
   .text('Warehouse Operator', { continued: true })
doc.fillColor(GRAY).font('Helvetica').fontSize(10)
   .text('   —   Myanmar Logistics Co., Ltd., Thilawa SEZ')
doc.fillColor(GRAY).fontSize(9).font('Helvetica-Oblique')
   .text('March 2020 – December 2021  (1 year 9 months)')
doc.moveDown(0.3)
const bullets2 = [
  'Managed incoming and outgoing goods, maintaining accurate inventory records',
  'Operated forklift and pallet jack for goods movement and stacking',
  'Coordinated with logistics team to ensure timely dispatch of shipments',
]
bullets2.forEach(b => {
  doc.fillColor(DARK).font('Helvetica').fontSize(10)
     .text(`•  ${b}`, { indent: 12 })
})
doc.moveDown(0.8)

// ── SKILLS ────────────────────────────────────────────────────────────────
doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(11)
   .text('SKILLS & COMPETENCIES')
rule(ACCENT, 2)

const skills = [
  ['Quality Control (QC)', 'ISO 9001 certified'],
  ['GMP Compliance', 'Good Manufacturing Practice certified'],
  ['Forklift Operation', 'Licensed — Category B'],
  ['Warehouse Management', 'Inventory & dispatch coordination'],
  ['Production Supervision', 'Team of up to 25 workers'],
  ['MS Office', 'Excel, Word — Basic level'],
  ['Shift Work', 'Day, Evening, and Night shifts'],
  ['Teamwork & Leadership', 'Proven team leader'],
]

// 2-column skill table
const colW = 240
const startX = 50
let sx = startX, sy = doc.y

skills.forEach(([ skill, detail ], i) => {
  if (i > 0 && i % 2 === 0) {
    sy += 22
    sx = startX
  }
  const xPos = sx + (i % 2) * (colW + 15)
  doc.rect(xPos, sy, colW, 18).fill(LIGHT)
  doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(9)
     .text(skill, xPos + 6, sy + 4, { width: 100 })
  doc.fillColor(GRAY).font('Helvetica').fontSize(9)
     .text(detail, xPos + 115, sy + 4, { width: 125 })
  if (i % 2 === 1 || i === skills.length - 1) sy += 22
})

doc.y = sy + 10
doc.moveDown(0.4)

// ── EDUCATION ────────────────────────────────────────────────────────────
doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(11)
   .text('EDUCATION')
rule(ACCENT, 2)

doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10.5)
   .text('Bachelor of Arts (B.A.) — Geography', { continued: true })
doc.fillColor(GRAY).font('Helvetica').fontSize(10)
   .text('   |   University of Yangon')
doc.fillColor(GRAY).font('Helvetica-Oblique').fontSize(9).text('2015 – 2019')
doc.moveDown(0.5)

doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10.5)
   .text('QC Inspector Certificate', { continued: true })
doc.fillColor(GRAY).font('Helvetica').fontSize(10)
   .text('   |   Myanmar Skill Development Center')
doc.fillColor(GRAY).font('Helvetica-Oblique').fontSize(9)
   .text('2021  —  Cert. No: MSDC-QC-2021-0478')
doc.moveDown(0.8)

// ── LANGUAGES ────────────────────────────────────────────────────────────
doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(11)
   .text('LANGUAGES')
rule(ACCENT, 2)
doc.fillColor(DARK).font('Helvetica').fontSize(10)
   .text('• Myanmar (Native)     • English (Basic — Reading & Writing)')
doc.moveDown(0.8)

// ── REFERENCES ───────────────────────────────────────────────────────────
doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(11)
   .text('REFERENCES')
rule(ACCENT, 2)
doc.fillColor(GRAY).font('Helvetica-Oblique').fontSize(10)
   .text('Available upon request')

// ── FOOTER ───────────────────────────────────────────────────────────────
const pageH = doc.page.height
doc.rect(0, pageH - 30, 595, 30).fill(BLUE)
doc.fillColor('#BFDBFE').font('Helvetica').fontSize(8)
   .text('Demo Resume — HQS ATS Test File  |  September 2026', 50, pageH - 20, { align: 'center', width: 495 })

doc.end()
console.log(`✅ PDF created: ${outputPath}`)
