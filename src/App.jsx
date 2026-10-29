import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Candidates from './pages/Candidates'
import CandidateDetail from './pages/CandidateDetail'
import Interviews from './pages/Interviews'
import Team from './pages/Team'
import EmailTemplates from './pages/EmailTemplates'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto scrollbar-thin">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/candidates" element={<Candidates />} />
                <Route path="/candidates/:id" element={<CandidateDetail />} />
                <Route path="/interviews" element={<Interviews />} />
                <Route path="/team" element={<Team />} />
                <Route path="/templates" element={<EmailTemplates />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
