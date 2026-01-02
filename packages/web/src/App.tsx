import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import { LandingPage } from '@/components/pages/LandingPage';
import { AdvisorPage } from '@/components/pages/AdvisorPage';
import { TemplatesPage } from '@/components/pages/TemplatesPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { SetupPage } from '@/pages/SetupPage';
import { InterviewPage } from '@/pages/InterviewPage';
import { ResultsPage } from '@/pages/ResultsPage';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SharedSessionPage } from '@/pages/SharedSessionPage';
import { TemplateEditorPage } from '@/pages/TemplateEditorPage';

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/share/:code" element={<SharedSessionPage />} />
          <Route path="/templates/edit/:id" element={<TemplateEditorPage />} />
          <Route element={<MainLayout />}>
            <Route path="/advisor" element={<AdvisorPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <SettingsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
