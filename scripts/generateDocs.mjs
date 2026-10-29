import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType, convertInchesToTwip, UnderlineType,
} from 'docx'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Helper Builders ──────────────────────────────────────────────────────────

const H1 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 40, color: '1E3A8A', font: 'Calibri' })],
  spacing: { before: 360, after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '3B82F6' } },
})

const H2 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 28, color: '1D4ED8', font: 'Calibri' })],
  spacing: { before: 280, after: 100 },
})

const H3 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 24, color: '1E40AF', font: 'Calibri' })],
  spacing: { before: 200, after: 80 },
})

const P = (text, color = '1F2937') => new Paragraph({
  children: [new TextRun({ text, size: 20, color, font: 'Calibri' })],
  spacing: { after: 100 },
})

const Bold = (text, size = 20) => new TextRun({ text, bold: true, size, font: 'Calibri', color: '111827' })
const Normal = (text, size = 20, color = '374151') => new TextRun({ text, size, font: 'Calibri', color })
const Green = (text) => new TextRun({ text, bold: true, size: 20, color: '15803D', font: 'Calibri' })
const Red = (text) => new TextRun({ text, bold: true, size: 20, color: 'DC2626', font: 'Calibri' })
const Blue = (text) => new TextRun({ text, size: 20, color: '2563EB', font: 'Calibri' })
const Gray = (text) => new TextRun({ text, size: 18, color: '6B7280', font: 'Calibri', italics: true })

const Bullet = (text, indent = 0.2) => new Paragraph({
  children: [Normal(`• ${text}`)],
  indent: { left: convertInchesToTwip(indent) },
  spacing: { after: 80 },
})

const SubBullet = (text) => new Paragraph({
  children: [Gray(`    ◦ ${text}`)],
  indent: { left: convertInchesToTwip(0.5) },
  spacing: { after: 60 },
})

const CodeLine = (text) => new Paragraph({
  children: [new TextRun({ text, font: 'Courier New', size: 18, color: '1F2937' })],
  indent: { left: convertInchesToTwip(0.3) },
  shading: { type: ShadingType.SOLID, color: 'F3F4F6' },
  spacing: { after: 40 },
})

const Divider = () => new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' } },
  spacing: { before: 160, after: 160 },
})

const StatusRow = (label, value, valueColor = '059669') => new Paragraph({
  children: [
    new TextRun({ text: `${label}: `, bold: true, size: 20, font: 'Calibri', color: '374151' }),
    new TextRun({ text: value, size: 20, font: 'Calibri', color: valueColor, bold: true }),
  ],
  spacing: { after: 100 },
  indent: { left: convertInchesToTwip(0.2) },
})

const TableHeaderCell = (text) => new TableCell({
  children: [new Paragraph({
    children: [new TextRun({ text, bold: true, size: 18, color: 'FFFFFF', font: 'Calibri' })],
    alignment: AlignmentType.CENTER,
  })],
  shading: { type: ShadingType.SOLID, color: '1D4ED8' },
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
})

const TableDataCell = (text, shade = 'FFFFFF') => new TableCell({
  children: [new Paragraph({
    children: [new TextRun({ text, size: 18, font: 'Calibri', color: '1F2937' })],
  })],
  shading: { type: ShadingType.SOLID, color: shade },
  margins: { top: 60, bottom: 60, left: 120, right: 120 },
})

const Space = () => new Paragraph({ children: [Normal('')], spacing: { after: 80 } })

// ── Document ──────────────────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Calibri', size: 20 } } },
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1),
          bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(1.1),
          right: convertInchesToTwip(1.1),
        },
      },
    },
    children: [

      // ════════════════════════════════════════════════════════════════
      // COVER
      // ════════════════════════════════════════════════════════════════

      new Paragraph({
        children: [new TextRun({ text: 'HQS MANPOWER SUPPLY', bold: true, size: 56, color: '1E3A8A', font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Applicant Tracking System (ATS)', size: 32, color: '3B82F6', font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'System Status & Technical Documentation', size: 24, color: '6B7280', font: 'Calibri', italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Prepared for: Recruitment Officers', size: 20, color: '374151', font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Date: September 17, 2026', size: 20, color: '374151', font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        border: { bottom: { style: BorderStyle.THICK, size: 12, color: '1D4ED8' } },
        spacing: { after: 400 },
      }),

      // ════════════════════════════════════════════════════════════════
      // SECTION 1 — SYSTEM STATUS
      // ════════════════════════════════════════════════════════════════

      H1('🟢  Section 1: System Status — All Running'),

      H2('Dev Server'),
      StatusRow('Status', '🟢 RUNNING'),
      StatusRow('URL', 'http://localhost:5173/', '2563EB'),
      StatusRow('Engine', 'Vite v5.4.21', '374151'),
      StatusRow('Last Hot Reload', '3:29 PM — pdfjs-dist + mammoth optimized', '374151'),
      StatusRow('Last Build', 'Exit Code 0 — ✓ Built in 3.60s', '059669'),
      StatusRow('Modules Transformed', '2,753 modules', '374151'),

      Space(),

      H2('Build Output'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('File'), TableHeaderCell('Size'), TableHeaderCell('Gzip')] }),
          new TableRow({ children: [TableDataCell('dist/index.html'), TableDataCell('0.49 kB'), TableDataCell('0.33 kB')] }),
          new TableRow({ children: [TableDataCell('dist/assets/index.css', 'F9FAFB'), TableDataCell('27.70 kB', 'F9FAFB'), TableDataCell('5.40 kB', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('dist/assets/index.js (chunk 1)'), TableDataCell('497.71 kB'), TableDataCell('130.61 kB')] }),
          new TableRow({ children: [TableDataCell('dist/assets/index.js (chunk 2)', 'F9FAFB'), TableDataCell('1,243.79 kB', 'F9FAFB'), TableDataCell('356.64 kB', 'F9FAFB')] }),
        ],
      }),

      Space(),

      H2('Installed Packages (12 Production Dependencies)'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('Package'), TableHeaderCell('Version'), TableHeaderCell('Purpose')] }),
          new TableRow({ children: [TableDataCell('react + react-dom'), TableDataCell('^18.3.1'), TableDataCell('UI Framework')] }),
          new TableRow({ children: [TableDataCell('react-router-dom', 'F9FAFB'), TableDataCell('^6.23.1', 'F9FAFB'), TableDataCell('Page Navigation', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('@dnd-kit/core + sortable'), TableDataCell('^6.1.0'), TableDataCell('Kanban Drag & Drop')] }),
          new TableRow({ children: [TableDataCell('recharts', 'F9FAFB'), TableDataCell('^2.12.7', 'F9FAFB'), TableDataCell('Dashboard Charts', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('lucide-react'), TableDataCell('^0.376.0'), TableDataCell('Icons')] }),
          new TableRow({ children: [TableDataCell('tailwindcss', 'F9FAFB'), TableDataCell('^3.4.4', 'F9FAFB'), TableDataCell('CSS Styling', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('pdfjs-dist'), TableDataCell('^6.3.289'), TableDataCell('PDF Text Extraction (Resume Parser)')] }),
          new TableRow({ children: [TableDataCell('mammoth', 'F9FAFB'), TableDataCell('^1.12.3', 'F9FAFB'), TableDataCell('DOCX Text Extraction (Resume Parser)', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('date-fns'), TableDataCell('^3.6.0'), TableDataCell('Date Utilities')] }),
          new TableRow({ children: [TableDataCell('docx', 'F9FAFB'), TableDataCell('^9.x', 'F9FAFB'), TableDataCell('DOCX File Generation (this document)', 'F9FAFB')] }),
        ],
      }),

      Divider(),

      // ════════════════════════════════════════════════════════════════
      // SECTION 2 — PROJECT STRUCTURE
      // ════════════════════════════════════════════════════════════════

      H1('📂  Section 2: Project Structure — 27 Source Files'),

      P('All source files live inside happy-planck/src/. Below is the complete file tree with each file\'s role.'),

      H2('Root & Entry'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('File'), TableHeaderCell('Role')] }),
          new TableRow({ children: [TableDataCell('src/App.jsx'), TableDataCell('Root component — wraps router + layout shell (Sidebar + TopBar + pages)')] }),
          new TableRow({ children: [TableDataCell('src/main.jsx', 'F9FAFB'), TableDataCell('React entry point — mounts <App/> into index.html #root', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('src/index.css'), TableDataCell('Tailwind CSS directives + custom scrollbar utilities')] }),
          new TableRow({ children: [TableDataCell('index.html', 'F9FAFB'), TableDataCell('HTML shell — loads main.jsx as ES module', 'F9FAFB')] }),
        ],
      }),

      Space(),

      H2('Context & Data'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('File'), TableHeaderCell('Role')] }),
          new TableRow({ children: [TableDataCell('context/AppContext.jsx'), TableDataCell('Global state using useReducer — all CRUD actions, localStorage auto-save')] }),
          new TableRow({ children: [TableDataCell('data/seedData.js', 'F9FAFB'), TableDataCell('Demo data — HQS jobs, Myanmar candidates, interviews, email templates', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('utils/resumeParser.js'), TableDataCell('🆕 CV parsing engine — PDF & DOCX text extraction + regex field detection')] }),
        ],
      }),

      Space(),

      H2('Layout Components'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('File'), TableHeaderCell('Role')] }),
          new TableRow({ children: [TableDataCell('components/layout/Sidebar.jsx'), TableDataCell('Left nav — HQS logo, branch badges, client companies, exchange rate ticker, user footer')] }),
          new TableRow({ children: [TableDataCell('components/layout/TopBar.jsx', 'F9FAFB'), TableDataCell('Top bar — page title, global search across candidates + jobs', 'F9FAFB')] }),
        ],
      }),

      Space(),

      H2('UI Components'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('File'), TableHeaderCell('Role')] }),
          new TableRow({ children: [TableDataCell('ui/Button.jsx'), TableDataCell('Reusable button — variants: primary, secondary, danger, ghost, success')] }),
          new TableRow({ children: [TableDataCell('ui/Modal.jsx', 'F9FAFB'), TableDataCell('Dialog overlay with backdrop blur, scroll, size variants (sm/md/lg/xl)', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('ui/Badge.jsx'), TableDataCell('Colored label chips — auto-colors by stage, status, or tag')] }),
          new TableRow({ children: [TableDataCell('ui/Avatar.jsx', 'F9FAFB'), TableDataCell('Initials-based avatar with deterministic color from initials hash', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('ui/StatsCard.jsx'), TableDataCell('KPI card with icon, value, trend arrow for Dashboard')] }),
          new TableRow({ children: [TableDataCell('ui/KanbanBoard.jsx', 'F9FAFB'), TableDataCell('Full drag-and-drop pipeline board with 7 stages using @dnd-kit', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('ui/ResumeDropzone.jsx'), TableDataCell('🆕 CV drop zone — 5 states: idle/dragging/parsing/success/error')] }),
        ],
      }),

      Space(),

      H2('Form Components'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('File'), TableHeaderCell('Role')] }),
          new TableRow({ children: [TableDataCell('forms/JobForm.jsx'), TableDataCell('Job creation/edit — Employment Type, Client (TTA/TTC), Branch, MMK/USD salary with conversion preview')] }),
          new TableRow({ children: [TableDataCell('forms/CandidateForm.jsx', 'F9FAFB'), TableDataCell('🆕 Candidate form with resume dropzone at top — auto-fills 7 fields from CV', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('forms/InterviewForm.jsx'), TableDataCell('Interview scheduler — date/time, duration, location, interviewers multi-select')] }),
        ],
      }),

      Space(),

      H2('Pages (9 Routes)'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('Page File'), TableHeaderCell('Route'), TableHeaderCell('Key Feature')] }),
          new TableRow({ children: [TableDataCell('Dashboard.jsx'), TableDataCell('/'), TableDataCell('KPI cards, bar/pie/line charts, pipeline funnel')] }),
          new TableRow({ children: [TableDataCell('Jobs.jsx', 'F9FAFB'), TableDataCell('/jobs', 'F9FAFB'), TableDataCell('Job grid, filters, create new job', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('JobDetail.jsx'), TableDataCell('/jobs/:id'), TableDataCell('Kanban pipeline board for that job')] }),
          new TableRow({ children: [TableDataCell('Candidates.jsx', 'F9FAFB'), TableDataCell('/candidates', 'F9FAFB'), TableDataCell('Searchable/filterable candidate table', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('CandidateDetail.jsx'), TableDataCell('/candidates/:id'), TableDataCell('Full profile, notes, stage mover, interview history, timeline')] }),
          new TableRow({ children: [TableDataCell('Interviews.jsx', 'F9FAFB'), TableDataCell('/interviews', 'F9FAFB'), TableDataCell('Date-grouped list, Join meeting links', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('Team.jsx'), TableDataCell('/team'), TableDataCell('Recruitment officer cards with assigned jobs/candidate counts')] }),
          new TableRow({ children: [TableDataCell('EmailTemplates.jsx', 'F9FAFB'), TableDataCell('/templates', 'F9FAFB'), TableDataCell('Template CRUD with copy-to-clipboard and preview', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('Settings.jsx'), TableDataCell('/settings'), TableDataCell('Exchange rate, branch selector, currency, data reset')] }),
        ],
      }),

      Divider(),

      // ════════════════════════════════════════════════════════════════
      // SECTION 3 — HOW THE SYSTEM WORKS
      // ════════════════════════════════════════════════════════════════

      H1('⚙️  Section 3: How the Full System Works'),

      // ── 3.1 DATA FLOW ────────────────────────────────────────────────

      H2('3.1 — Data Flow: How State Works'),

      P('The entire application uses React\'s built-in state management (Context + useReducer). No external database is needed — all data is stored in the browser\'s localStorage.'),

      H3('Step-by-Step Flow:'),

      new Paragraph({ children: [Bold('Step 1: User Action')], spacing: { after: 60 }, indent: { left: convertInchesToTwip(0.2) } }),
      SubBullet('User clicks a button, fills a form, or drags a candidate card'),
      SubBullet('This triggers a React event handler in the component'),

      new Paragraph({ children: [Bold('Step 2: Dispatch Action')], spacing: { after: 60, before: 80 }, indent: { left: convertInchesToTwip(0.2) } }),
      SubBullet('The component calls dispatch({ type: \'ACTION_NAME\', payload: { ...data } })'),
      SubBullet('Example: dispatch({ type: \'ADD_CANDIDATE\', payload: { firstName: \'Aung\', ... } })'),

      new Paragraph({ children: [Bold('Step 3: Reducer Processes')], spacing: { after: 60, before: 80 }, indent: { left: convertInchesToTwip(0.2) } }),
      SubBullet('AppContext.jsx contains the reducer() function'),
      SubBullet('It receives the action, creates a new state object, and returns it'),
      SubBullet('State is NEVER mutated directly — always replaced with a new copy'),

      new Paragraph({ children: [Bold('Step 4: UI Re-renders')], spacing: { after: 60, before: 80 }, indent: { left: convertInchesToTwip(0.2) } }),
      SubBullet('All components that use useApp() hook automatically receive the new state'),
      SubBullet('React re-renders only the components whose data changed'),

      new Paragraph({ children: [Bold('Step 5: localStorage Auto-Save')], spacing: { after: 60, before: 80 }, indent: { left: convertInchesToTwip(0.2) } }),
      SubBullet('A useEffect in AppContext watches for any state change'),
      SubBullet('It serializes the entire state to JSON and saves to localStorage key: hqs_ats_state'),
      SubBullet('On next page load, state is restored from localStorage automatically'),

      Space(),

      H3('Action Types (All 20 Supported):'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('Category'), TableHeaderCell('Action Types')] }),
          new TableRow({ children: [TableDataCell('Jobs'), TableDataCell('ADD_JOB, UPDATE_JOB, DELETE_JOB')] }),
          new TableRow({ children: [TableDataCell('Candidates', 'F9FAFB'), TableDataCell('ADD_CANDIDATE, UPDATE_CANDIDATE, DELETE_CANDIDATE, MOVE_CANDIDATE_STAGE, ADD_NOTE, DELETE_NOTE, UPDATE_RATING', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('Interviews'), TableDataCell('ADD_INTERVIEW, UPDATE_INTERVIEW, DELETE_INTERVIEW')] }),
          new TableRow({ children: [TableDataCell('Team', 'F9FAFB'), TableDataCell('ADD_TEAM_MEMBER, UPDATE_TEAM_MEMBER, DELETE_TEAM_MEMBER', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('Templates'), TableDataCell('ADD_TEMPLATE, UPDATE_TEMPLATE, DELETE_TEMPLATE')] }),
          new TableRow({ children: [TableDataCell('Settings', 'F9FAFB'), TableDataCell('UPDATE_SETTINGS', 'F9FAFB')] }),
        ],
      }),

      Divider(),

      // ── 3.2 RESUME AUTO-FILL ─────────────────────────────────────────

      H2('3.2 — Resume Auto-Fill Pipeline'),

      P('When a recruiter uploads or drops a PDF or DOCX file, the system parses it entirely in the browser — no file is sent to any server. Here is the full pipeline:'),

      H3('Stage 1: File Drop / Selection'),
      Bullet('Recruiter drags a CV onto the dropzone OR clicks to browse'),
      Bullet('ResumeDropzone.jsx detects the file type (.pdf, .docx, .doc)'),
      Bullet('Unsupported types show an error immediately'),

      H3('Stage 2: Text Extraction'),
      Bullet('PDF files → pdfjs-dist library reads every page → joins all text content'),
      SubBullet('Uses a CDN-hosted PDF.js worker thread so the UI stays responsive'),
      Bullet('DOCX files → mammoth library converts Word XML → raw text'),
      SubBullet('Works entirely offline once the library is loaded'),

      H3('Stage 3: Field Parsing (resumeParser.js)'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('Field'), TableHeaderCell('Detection Method')] }),
          new TableRow({ children: [TableDataCell('Email'), TableDataCell('Regex: name@domain.com pattern')] }),
          new TableRow({ children: [TableDataCell('Phone', 'F9FAFB'), TableDataCell('+95 9... / 09... (Myanmar) + international formats', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('Full Name'), TableDataCell('Scans first 15 lines — finds 2-4 capitalized words with no numbers or symbols')] }),
          new TableRow({ children: [TableDataCell('Location', 'F9FAFB'), TableDataCell('Myanmar city names (Yangon, Mandalay...) + generic City, Country pattern', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('LinkedIn URL'), TableDataCell('Regex: linkedin.com/in/... pattern')] }),
          new TableRow({ children: [TableDataCell('Skills/Tags', 'F9FAFB'), TableDataCell('Keyword scan: Forklift, QC, GMP, ISO, MS Office, Warehouse, Security...', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('Experience'), TableDataCell('"X years experience" phrase → added as first tag')] }),
        ],
      }),

      Space(),

      H3('Stage 4: Form Auto-Fill'),
      Bullet('Parsed data is injected into CandidateForm state'),
      Bullet('Each auto-filled field gets a GREEN highlight border'),
      Bullet('"✓ auto-filled" label appears next to the field name'),
      Bullet('A banner shows: "6 fields auto-filled from resume"'),
      Bullet('Skills are MERGED with any existing tags (no duplicates)'),
      Bullet('ALL fields remain fully editable — recruiter reviews before saving'),

      Space(),

      H3('Stage 5: Dropzone Visual States'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('State'), TableHeaderCell('Appearance'), TableHeaderCell('Trigger')] }),
          new TableRow({ children: [TableDataCell('Idle'), TableDataCell('Dashed gray border, upload icon'), TableDataCell('Default')] }),
          new TableRow({ children: [TableDataCell('Dragging', 'F9FAFB'), TableDataCell('Blue border, scales up slightly', 'F9FAFB'), TableDataCell('File dragged over zone', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('Parsing'), TableDataCell('Blue border, spinning loader, progress bar'), TableDataCell('File dropped / selected')] }),
          new TableRow({ children: [TableDataCell('Success', 'F9FAFB'), TableDataCell('Green border, checkmark, field preview', 'F9FAFB'), TableDataCell('Parse completed', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('Error'), TableDataCell('Red border, alert icon, error message'), TableDataCell('Unsupported file or parse failure')] }),
        ],
      }),

      Divider(),

      // ── 3.3 KANBAN ───────────────────────────────────────────────────

      H2('3.3 — Kanban Pipeline: Drag & Drop'),

      P('The pipeline board uses @dnd-kit — a modern, accessible drag-and-drop library for React. It is rendered on the Job Detail page for each specific job.'),

      H3('The 7 Pipeline Stages:'),
      new Paragraph({
        children: [
          Normal('Applied  →  Screening  →  Interview  →  Medical Check  →  Offer Sent  →  Deployed  →  Rejected'),
        ],
        shading: { type: ShadingType.SOLID, color: 'EFF6FF' },
        spacing: { after: 160, before: 80 },
        indent: { left: convertInchesToTwip(0.3) },
        border: { left: { style: BorderStyle.THICK, size: 12, color: '3B82F6' } },
      }),

      H3('How Drag Works:'),
      Bullet('DndContext wraps all 7 column components'),
      Bullet('Each candidate card is a SortableItem (useSortable hook)'),
      Bullet('Each column is a Droppable zone (useDroppable hook)'),
      Bullet('PointerSensor activates after 5px movement — prevents accidental drags'),
      Bullet('DragOverlay shows a floating ghost copy of the card while dragging'),

      H3('What Happens After Drop:'),
      Bullet('onDragEnd finds the source stage (from active card\'s current stage)'),
      Bullet('Finds the target stage (from the column the card was dropped onto)'),
      Bullet('Dispatches MOVE_CANDIDATE_STAGE action'),
      Bullet('Reducer updates candidate.stage to the new stage'),
      Bullet('Adds a new timeline entry: { stage: "Interview", date: "2026-09-17" }'),
      Bullet('localStorage saves automatically'),

      H3('Alternative: Click-to-Move'),
      Bullet('On the Candidate Detail page, a horizontal stage bar shows all 7 stages'),
      Bullet('Clicking any stage instantly moves the candidate to that stage'),
      Bullet('The current stage is highlighted in blue; past stages in green'),

      Divider(),

      // ── 3.4 CURRENCY ─────────────────────────────────────────────────

      H2('3.4 — Currency System (MMK & USD)'),

      P('The system supports two currencies: Myanmar Kyat (MMK) and US Dollar (USD). The exchange rate is configurable in Settings and used throughout the app.'),

      H3('How Exchange Rate Works:'),
      Bullet('Recruiter sets the rate in Settings → "1 USD = _____ MMK"'),
      Bullet('Default rate: 3,500 MMK per 1 USD'),
      Bullet('Rate is saved to localStorage and used across all salary displays'),
      Bullet('A live preview table in Settings shows $100 / $500 / $1000 equivalents in MMK'),

      Space(),

      H3('Job Form — Salary Input:'),
      Bullet('Recruiter selects currency: MMK or USD'),
      Bullet('Enters minimum and maximum salary'),
      Bullet('A yellow preview box instantly shows the equivalent in the other currency'),
      SubBullet('Example (MMK input): "≈ $71 – $114 USD (at 3,500 MMK/USD)"'),
      SubBullet('Example (USD input): "≈ 1,400,000 – 2,100,000 MMK (at 3,500 MMK/USD)"'),

      Space(),

      H3('Sidebar Exchange Rate Ticker:'),
      Bullet('Bottom of the sidebar always shows the current rate in yellow text'),
      Bullet('Example: "1 USD = 3,500 MMK"'),
      Bullet('Updates immediately when rate is changed in Settings and saved'),

      Space(),

      H3('Currency Summary in Settings:'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('Currency'), TableHeaderCell('# of Jobs'), TableHeaderCell('Used For')] }),
          new TableRow({ children: [TableDataCell('MMK'), TableDataCell('4 jobs'), TableDataCell('Factory workers, warehouse, security, QC')] }),
          new TableRow({ children: [TableDataCell('USD', 'F9FAFB'), TableDataCell('1 job', 'F9FAFB'), TableDataCell('Admin / office / professional roles', 'F9FAFB')] }),
        ],
      }),

      Divider(),

      // ── 3.5 COMPANY STRUCTURE ────────────────────────────────────────

      H2('3.5 — Company Structure in the App'),

      P('The ATS is designed around the exact structure of HQS Manpower Supply Co., Ltd. with its two branches and two client companies.'),

      H3('Organisation Hierarchy:'),
      new Paragraph({
        children: [Normal('HQS Manpower Supply Co., Ltd. (Headquarters)')],
        shading: { type: ShadingType.SOLID, color: 'DBEAFE' },
        spacing: { after: 40, before: 80 },
        indent: { left: convertInchesToTwip(0.3) },
        border: { left: { style: BorderStyle.THICK, size: 12, color: '1D4ED8' } },
      }),
      new Paragraph({ children: [Normal('    ├──  AQS Branch (Sub-Company)')], spacing: { after: 40 }, indent: { left: convertInchesToTwip(0.5) } }),
      new Paragraph({ children: [Normal('    └──  QSL Branch (Sub-Company)')], spacing: { after: 160 }, indent: { left: convertInchesToTwip(0.5) } }),

      H3('Client Companies:'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('Client'), TableHeaderCell('Jobs Assigned'), TableHeaderCell('Branches Serving')] }),
          new TableRow({ children: [TableDataCell('TTA'), TableDataCell('Production Line Worker, Security Guard, QC Inspector (3 jobs)'), TableDataCell('HQS, QSL, AQS')] }),
          new TableRow({ children: [TableDataCell('TTC', 'F9FAFB'), TableDataCell('Warehouse Operator, Administrative Assistant (2 jobs)', 'F9FAFB'), TableDataCell('AQS, HQS', 'F9FAFB')] }),
        ],
      }),

      Space(),

      H3('Recruitment Officers (Team):'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('Name'), TableHeaderCell('Role'), TableHeaderCell('Branch'), TableHeaderCell('Assigned Jobs')] }),
          new TableRow({ children: [TableDataCell('Thida Kyaw'), TableDataCell('Recruitment Officer'), TableDataCell('HQS'), TableDataCell('Production Line, QC Inspector')] }),
          new TableRow({ children: [TableDataCell('Aung Zaw', 'F9FAFB'), TableDataCell('Recruitment Officer', 'F9FAFB'), TableDataCell('AQS', 'F9FAFB'), TableDataCell('Warehouse Operator', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('Su Su Win'), TableDataCell('Recruitment Officer'), TableDataCell('QSL'), TableDataCell('Security Guard')] }),
          new TableRow({ children: [TableDataCell('Kyaw Zin', 'F9FAFB'), TableDataCell('Senior Recruitment Officer', 'F9FAFB'), TableDataCell('HQS', 'F9FAFB'), TableDataCell('Administrative Assistant', 'F9FAFB')] }),
        ],
      }),

      Space(),

      H3('How Branch Selection Works:'),
      Bullet('Active branch is set in Settings → "Active Branch" dropdown (HQS / AQS / QSL)'),
      Bullet('The Sidebar shows the active branch with a colored badge'),
      SubBullet('HQS = Blue   |   AQS = Purple   |   QSL = Green'),
      Bullet('Each job posting is assigned to a specific branch that is handling recruitment'),
      Bullet('Recruiters are assigned to a branch — shown on Team cards'),

      Space(),

      H3('Applicant Sources (Configured for Myanmar):'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [TableHeaderCell('Source'), TableHeaderCell('Description')] }),
          new TableRow({ children: [TableDataCell('Facebook'), TableDataCell('Facebook job posts and groups — most common in Myanmar')] }),
          new TableRow({ children: [TableDataCell('LinkedIn', 'F9FAFB'), TableDataCell('Professional network — used for admin/office roles', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('Referral'), TableDataCell('Referred by existing employees or network contacts')] }),
          new TableRow({ children: [TableDataCell('JobNet', 'F9FAFB'), TableDataCell('Myanmar\'s leading online job portal', 'F9FAFB')] }),
          new TableRow({ children: [TableDataCell('Alote'), TableDataCell('Myanmar jobs platform — popular for blue-collar roles')] }),
          new TableRow({ children: [TableDataCell('TikTok', 'F9FAFB'), TableDataCell('Social media job posts — increasingly popular in Myanmar', 'F9FAFB')] }),
        ],
      }),

      Divider(),

      // ════════════════════════════════════════════════════════════════
      // FOOTER
      // ════════════════════════════════════════════════════════════════

      new Paragraph({
        children: [
          new TextRun({ text: 'HQS Manpower Supply Co., Ltd.  |  ATS System Documentation  |  Confidential', size: 16, color: '9CA3AF', font: 'Calibri', italics: true }),
        ],
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' } },
        spacing: { before: 400, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Generated: September 17, 2026  |  Version 1.0', size: 16, color: '9CA3AF', font: 'Calibri', italics: true })],
        alignment: AlignmentType.CENTER,
      }),

    ],
  }],
})

// ── Output ────────────────────────────────────────────────────────────────────

const outputPath = join(__dirname, 'HQS_ATS_System_Status_Documentation.docx')

Packer.toBuffer(doc).then((buffer) => {
  writeFileSync(outputPath, buffer)
  console.log(`✅ Documentation DOCX created:\n   ${outputPath}`)
})
