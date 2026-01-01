import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MainLayout } from '@/components/layout/MainLayout';
import { LandingPage } from '@/components/pages/LandingPage';
import { AdvisorPage } from '@/components/pages/AdvisorPage';
import { TemplatesPage } from '@/components/pages/TemplatesPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { SetupPage } from '@/pages/SetupPage';
import { InterviewPage } from '@/pages/InterviewPage';
import { ResultsPage } from '@/pages/ResultsPage';

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route element={<MainLayout />}>
            <Route path="/advisor" element={<AdvisorPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
