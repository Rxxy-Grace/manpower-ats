import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Push current local state (jobs, candidates, interviews, email templates, team)
 * into Supabase database tables.
 */
export async function syncLocalStateToSupabase(state) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Please check your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  const results = {
    jobs: 0,
    candidates: 0,
    interviews: 0,
    emailTemplates: 0,
    team: 0,
  }

  // 1. Sync Jobs
  if (state.jobs?.length > 0) {
    const jobsPayload = state.jobs.map(j => ({
      id: j.id,
      code: j.code,
      title: j.title,
      client_company: j.clientCompany || 'PTTEP',
      branch: j.branch || 'HQS',
      department: j.department || 'General',
      location: j.location || '',
      employment_type: j.employmentType || 'Permanent Worker',
      contract_duration: j.contractDuration || null,
      status: j.status || 'Open',
      headcount: Number(j.headcount) || 1,
      recruiter: j.recruiter || null,
      hiring_manager: j.hiringManager || null,
      posted_at: j.postedAt || new Date().toISOString().split('T')[0],
      closing_date: j.closingDate || null,
      salary: j.salary || {},
      description: j.description || '',
      requirements: j.requirements || [],
    }))

    const { error: jobsErr } = await supabase.from('jobs').upsert(jobsPayload, { onConflict: 'id' })
    if (jobsErr) throw new Error(`Jobs sync error: ${jobsErr.message}`)
    results.jobs = jobsPayload.length
  }

  // 2. Sync Candidates
  if (state.candidates?.length > 0) {
    const candidatesPayload = state.candidates.map(c => ({
      id: c.id,
      first_name: c.firstName,
      last_name: c.lastName || '',
      email: c.email,
      phone: c.phone || '',
      location: c.location || '',
      job_id: c.jobId || null,
      stage: c.stage || 'Applied',
      source: c.source || 'In-house CV Bank',
      rating: c.rating || 0,
      avatar: c.avatar || '',
      resume_url: c.resumeUrl || '',
      resume_file_name: c.resumeFileName || '',
      tags: c.tags || [],
      notes: c.notes || [],
      timeline: c.timeline || [],
      applied_at: c.appliedAt || new Date().toISOString().split('T')[0],
    }))

    const { error: candErr } = await supabase.from('candidates').upsert(candidatesPayload, { onConflict: 'id' })
    if (candErr) throw new Error(`Candidates sync error: ${candErr.message}`)
    results.candidates = candidatesPayload.length
  }

  // 3. Sync Interviews
  if (state.interviews?.length > 0) {
    const interviewsPayload = state.interviews.map(i => ({
      id: i.id,
      candidate_id: i.candidateId,
      job_id: i.jobId,
      type: i.type || 'Technical Interview',
      date: i.date,
      time: i.time,
      duration: i.duration || '45 min',
      interviewers: i.interviewers || [],
      status: i.status || 'Scheduled',
      location: i.location || 'HQS Head Office',
      link: i.link || '',
      feedback: i.feedback || '',
    }))

    const { error: intErr } = await supabase.from('interviews').upsert(interviewsPayload, { onConflict: 'id' })
    if (intErr) throw new Error(`Interviews sync error: ${intErr.message}`)
    results.interviews = interviewsPayload.length
  }

  // 4. Sync Email Templates
  if (state.emailTemplates?.length > 0) {
    const templatesPayload = state.emailTemplates.map(t => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      stage: t.stage,
      body: t.body,
    }))

    const { error: tmplErr } = await supabase.from('email_templates').upsert(templatesPayload, { onConflict: 'id' })
    if (tmplErr) throw new Error(`Templates sync error: ${tmplErr.message}`)
    results.emailTemplates = templatesPayload.length
  }

  // 5. Sync Team Members
  if (state.team?.length > 0) {
    const teamPayload = state.team.map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      email: m.email,
      phone: m.phone || '',
      branch: m.branch || 'HQS',
      avatar: m.avatar || '',
    }))

    const { error: teamErr } = await supabase.from('team_members').upsert(teamPayload, { onConflict: 'id' })
    if (teamErr) throw new Error(`Team sync error: ${teamErr.message}`)
    results.team = teamPayload.length
  }

  return results
}

/**
 * Fetch all data from Supabase
 */
export async function fetchAllFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null

  const [
    { data: jobs, error: jErr },
    { data: candidates, error: cErr },
    { data: interviews, error: iErr },
    { data: emailTemplates, error: tErr },
    { data: team, error: mErr },
  ] = await Promise.all([
    supabase.from('jobs').select('*'),
    supabase.from('candidates').select('*'),
    supabase.from('interviews').select('*'),
    supabase.from('email_templates').select('*'),
    supabase.from('team_members').select('*'),
  ])

  if (jErr || cErr || iErr || tErr || mErr) {
    console.error('Supabase fetch error:', { jErr, cErr, iErr, tErr, mErr })
    return null
  }

  return {
    jobs: (jobs || []).map(j => ({
      id: j.id,
      code: j.code,
      title: j.title,
      clientCompany: j.client_company,
      branch: j.branch,
      department: j.department,
      location: j.location,
      employmentType: j.employment_type,
      contractDuration: j.contract_duration,
      status: j.status,
      headcount: j.headcount,
      recruiter: j.recruiter,
      hiringManager: j.hiring_manager,
      postedAt: j.posted_at,
      closingDate: j.closing_date,
      salary: j.salary,
      description: j.description,
      requirements: j.requirements,
    })),
    candidates: (candidates || []).map(c => ({
      id: c.id,
      firstName: c.first_name,
      lastName: c.last_name,
      email: c.email,
      phone: c.phone,
      location: c.location,
      jobId: c.job_id,
      stage: c.stage,
      source: c.source,
      rating: c.rating,
      avatar: c.avatar,
      resumeUrl: c.resume_url,
      resumeFileName: c.resume_file_name,
      tags: c.tags,
      notes: c.notes,
      timeline: c.timeline,
      appliedAt: c.applied_at,
    })),
    interviews: (interviews || []).map(i => ({
      id: i.id,
      candidateId: i.candidate_id,
      jobId: i.job_id,
      type: i.type,
      date: i.date,
      time: i.time,
      duration: i.duration,
      interviewers: i.interviewers,
      status: i.status,
      location: i.location,
      link: i.link,
      feedback: i.feedback,
    })),
    emailTemplates: (emailTemplates || []).map(t => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      stage: t.stage,
      body: t.body,
    })),
    team: (team || []).map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      email: m.email,
      phone: m.phone,
      branch: m.branch,
      avatar: m.avatar,
    })),
  }
}
