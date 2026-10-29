import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType, convertInchesToTwip,
} from 'docx'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Helper builders ──────────────────────────────────────────────────────────

const bold = (text, size = 22) =>
  new TextRun({ text, bold: true, size, font: 'Calibri' })

const normal = (text, size = 20) =>
  new TextRun({ text, size, font: 'Calibri' })

const italic = (text, size = 18) =>
  new TextRun({ text, italics: true, size, color: '555555', font: 'Calibri' })

const divider = () =>
  new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '3B82F6' } },
    spacing: { after: 100 },
  })

const sectionHeading = (text) =>
  new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: '1E40AF', font: 'Calibri' })],
    spacing: { before: 240, after: 80 },
  })

const bullet = (text) =>
  new Paragraph({
    children: [normal(`• ${text}`)],
    spacing: { after: 60 },
    indent: { left: convertInchesToTwip(0.2) },
  })

const infoLine = (label, value) =>
  new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 20, font: 'Calibri' }),
      normal(value),
    ],
    spacing: { after: 80 },
  })

// ── Document ──────────────────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Calibri', size: 20 } } },
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.8),
            bottom: convertInchesToTwip(0.8),
            left: convertInchesToTwip(0.9),
            right: convertInchesToTwip(0.9),
          },
        },
      },
      children: [

        // ── NAME ────────────────────────────────────────────────────────────
        new Paragraph({
          children: [new TextRun({ text: 'Ko Aung Kyaw Zin', bold: true, size: 52, color: '1E3A8A', font: 'Calibri' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        }),

        new Paragraph({
          children: [new TextRun({ text: 'Production & Quality Control Worker', size: 26, color: '3B82F6', font: 'Calibri' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 140 },
        }),

        // ── CONTACT INFO ─────────────────────────────────────────────────────
        new Paragraph({
          children: [
            normal('📧 aungkyawzin.work@gmail.com   '),
            normal('📞 +95 9 765 432 101   '),
            normal('📍 Hlaing Township, Yangon   '),
            new TextRun({ text: '🔗 linkedin.com/in/aungkyawzin', size: 20, color: '2563EB', font: 'Calibri' }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        }),

        divider(),

        // ── OBJECTIVE ────────────────────────────────────────────────────────
        sectionHeading('Professional Summary'),

        new Paragraph({
          children: [
            normal(
              'Dedicated and physically fit production worker with 4 years of experience in factory operations, ' +
              'quality control inspection, and warehouse management. Proven track record of meeting production ' +
              'targets and maintaining GMP and ISO standards. Willing to work rotating shifts and committed to ' +
              'team-oriented workplace environments.'
            ),
          ],
          spacing: { after: 120 },
        }),

        divider(),

        // ── WORK EXPERIENCE ──────────────────────────────────────────────────
        sectionHeading('Work Experience'),

        new Paragraph({
          children: [
            bold('QC Inspector / Line Supervisor'),
            normal('   —   '),
            new TextRun({ text: 'Golden Star Garment Factory, Yangon', size: 20, italics: true, font: 'Calibri' }),
          ],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [italic('January 2022 – August 2026  (4 years 8 months)')],
          spacing: { after: 80 },
        }),
        bullet('Supervised production line of 25 workers ensuring quality standards are met'),
        bullet('Conducted daily QC inspections and documented non-conformance reports'),
        bullet('Trained new workers on GMP procedures and safety protocols'),
        bullet('Consistently achieved 98% on-time delivery rate for assigned production batches'),
        bullet('Operated forklift for raw material movement within the factory premises'),

        new Paragraph({ spacing: { after: 100 } }),

        new Paragraph({
          children: [
            bold('Warehouse Operator'),
            normal('   —   '),
            new TextRun({ text: 'Myanmar Logistics Co., Ltd., Thilawa SEZ', size: 20, italics: true, font: 'Calibri' }),
          ],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [italic('March 2020 – December 2021  (1 year 9 months)')],
          spacing: { after: 80 },
        }),
        bullet('Managed incoming and outgoing goods, maintaining accurate inventory records'),
        bullet('Operated forklift and pallet jack for goods movement and stacking'),
        bullet('Coordinated with logistics team to ensure timely dispatch of shipments'),

        divider(),

        // ── SKILLS ───────────────────────────────────────────────────────────
        sectionHeading('Skills & Competencies'),

        bullet('Quality Control (QC) — ISO 9001 standards'),
        bullet('GMP (Good Manufacturing Practice) certified'),
        bullet('Forklift Operation — Licensed (Category B)'),
        bullet('Warehouse & Inventory Management'),
        bullet('Production Line Supervision'),
        bullet('MS Office (Excel, Word) — Basic level'),
        bullet('Shift work — Day, Evening, and Night shifts'),
        bullet('Teamwork and Leadership'),

        divider(),

        // ── EDUCATION ────────────────────────────────────────────────────────
        sectionHeading('Education'),

        new Paragraph({
          children: [
            bold('Bachelor of Arts (B.A.) — Geography'),
            normal('   |   '),
            normal('University of Yangon'),
          ],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [italic('2015 – 2019')],
          spacing: { after: 120 },
        }),

        new Paragraph({
          children: [
            bold('QC Inspector Certificate'),
            normal('   |   '),
            normal('Myanmar Skill Development Center'),
          ],
          spacing: { after: 40 },
        }),
        new Paragraph({
          children: [italic('2021 — Certificate No. MSDC-QC-2021-0478')],
          spacing: { after: 120 },
        }),

        divider(),

        // ── LANGUAGES ────────────────────────────────────────────────────────
        sectionHeading('Languages'),

        bullet('Myanmar (Native)'),
        bullet('English (Basic — Reading & Writing)'),

        divider(),

        // ── REFERENCES ───────────────────────────────────────────────────────
        sectionHeading('References'),

        new Paragraph({
          children: [italic('Available upon request')],
          spacing: { after: 100 },
        }),

      ],
    },
  ],
})

// ── Output ───────────────────────────────────────────────────────────────────

const outputPath = join(__dirname, 'sample_resume_Ko_Aung_Kyaw_Zin.docx')

Packer.toBuffer(doc).then((buffer) => {
  writeFileSync(outputPath, buffer)
  console.log(`✅ DOCX resume created: ${outputPath}`)
})
