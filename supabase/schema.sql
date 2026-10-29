-- ==============================================================================
-- HQS Manpower Supply ATS — Supabase Database Schema
-- Run this script in the Supabase SQL Editor (supabase.com -> SQL Editor -> New query)
-- ==============================================================================

-- 1. JOBS TABLE
create table if not exists public.jobs (
  id text primary key,
  code text,
  title text not null,
  client_company text not null,
  branch text not null default 'HQS',
  department text not null,
  location text not null,
  employment_type text not null default 'Permanent Worker',
  contract_duration text,
  status text not null default 'Open',
  headcount integer not null default 1,
  recruiter text,
  hiring_manager text,
  posted_at date default current_date,
  closing_date date,
  salary jsonb default '{"currency": "MMK", "min": "", "max": "", "rateType": "Monthly Rate"}'::jsonb,
  description text default '',
  requirements text[] default '{}'::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CANDIDATES TABLE
create table if not exists public.candidates (
  id text primary key,
  first_name text not null,
  last_name text not null default '',
  email text not null,
  phone text default '',
  location text default '',
  job_id text references public.jobs(id) on delete set null,
  stage text not null default 'Applied',
  source text default 'In-house CV Bank',
  rating integer default 0,
  avatar text default '',
  resume_url text default '',
  resume_file_name text default '',
  tags text[] default '{}'::text[],
  notes jsonb default '[]'::jsonb,
  timeline jsonb default '[]'::jsonb,
  applied_at date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. INTERVIEWS TABLE
create table if not exists public.interviews (
  id text primary key,
  candidate_id text references public.candidates(id) on delete cascade,
  job_id text references public.jobs(id) on delete cascade,
  type text not null default 'Technical Interview',
  date date not null,
  time time not null,
  duration text default '45 min',
  interviewers text[] default '{}'::text[],
  status text not null default 'Scheduled',
  location text default 'HQS Head Office',
  link text default '',
  feedback text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. EMAIL TEMPLATES TABLE
create table if not exists public.email_templates (
  id text primary key,
  name text not null,
  subject text not null,
  stage text not null,
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TEAM MEMBERS TABLE
create table if not exists public.team_members (
  id text primary key,
  name text not null,
  role text not null,
  email text not null,
  phone text default '',
  branch text not null default 'HQS',
  avatar text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.jobs enable row level security;
alter table public.candidates enable row level security;
alter table public.interviews enable row level security;
alter table public.email_templates enable row level security;
alter table public.team_members enable row level security;

-- Development policies: Allow full access for anon/authenticated clients
create policy "Allow all access to jobs" on public.jobs for all using (true) with check (true);
create policy "Allow all access to candidates" on public.candidates for all using (true) with check (true);
create policy "Allow all access to interviews" on public.interviews for all using (true) with check (true);
create policy "Allow all access to email_templates" on public.email_templates for all using (true) with check (true);
create policy "Allow all access to team_members" on public.team_members for all using (true) with check (true);

-- Enable Realtime subscriptions
alter publication supabase_realtime add table public.jobs;
alter publication supabase_realtime add table public.candidates;
alter publication supabase_realtime add table public.interviews;

-- 6. CV RESUMES STORAGE BUCKET
insert into storage.buckets (id, name, public)
values ('cv_resumes', 'cv_resumes', true)
on conflict (id) do nothing;

create policy "Allow public view cv_resumes" on storage.objects
for select using (bucket_id = 'cv_resumes');

create policy "Allow public upload cv_resumes" on storage.objects
for insert with check (bucket_id = 'cv_resumes');
