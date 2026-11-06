import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/shared/Navbar';
import MobileTabBar from './components/shared/MobileTabBar';

// Critical landing page loaded synchronously for immediate FCP/LCP
import HomePage from './pages/home/HomePage';

// Lazy-loaded routes to minimize initial bundle size and boost PageSpeed
const AboutPage = lazy(() => import('./pages/about/AboutPage'));
const ShelterListPage = lazy(() => import('./pages/shelter-directory/ShelterListPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SupplyBoardPage = lazy(() => import('./pages/supply-board/SupplyBoardPage'));

const SOSRequestForm = lazy(() => import('./pages/sos-reporting/SOSRequestForm'));
const SOSDashboard = lazy(() => import('./pages/sos-reporting/SOSDashboard'));
const ProtectedRoute = lazy(() => import('./components/shared/ProtectedRoute'));

const TaskBoardPage = lazy(() => import('./pages/volunteer-tasks/TaskBoardPage'));
const TaskDetailPage = lazy(() => import('./pages/volunteer-tasks/TaskDetailPage'));
const PostTaskPage = lazy(() => import('./pages/volunteer-tasks/PostTaskPage'));

const NoticeBoardPage = lazy(() => import('./pages/noticeboard/NoticeBoardPage'));
const AlertDetailPage = lazy(() => import('./pages/noticeboard/AlertDetailPage'));
const PostAlertPage = lazy(() => import('./pages/noticeboard/PostAlertPage'));

const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardRedirect = lazy(() => import('./pages/dashboards/DashboardRedirect'));
const CitizenDashboard = lazy(() => import('./pages/dashboards/CitizenDashboard'));
const VolunteerDashboard = lazy(() => import('./pages/dashboards/VolunteerDashboard'));
const AdministratorDashboard = lazy(() => import('./pages/dashboards/AdministratorDashboard'));

// Lightweight routing fallback to avoid layout flashes
const PageLoadingFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center" aria-label="Loading page content">
    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-800 antialiased selection:bg-red-500 selection:text-white">
          <Navbar />

          <main className="flex-grow flex flex-col pb-20 sm:pb-0">
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Home & General */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Module 5: Emergency Alerts & Noticeboard */}
                <Route path="/alerts" element={<NoticeBoardPage />} />
                <Route path="/notices" element={<NoticeBoardPage />} />
                <Route path="/alerts/new" element={<PostAlertPage />} />
                <Route path="/notices/new" element={<PostAlertPage />} />
                <Route path="/alerts/:id" element={<AlertDetailPage />} />
                <Route path="/notices/:id" element={<AlertDetailPage />} />

                {/* Module 4: Volunteer Task Board */}
                <Route path="/tasks" element={<TaskBoardPage />} />
                <Route path="/volunteer" element={<TaskBoardPage />} />
                <Route
                  path="/tasks/new"
                  element={
                    <ProtectedRoute allowedRoles={['administrator', 'coordinator']}>
                      <PostTaskPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/tasks/:id" element={<TaskDetailPage />} />

                {/* Module 2: Shelter Directory */}
                <Route path="/shelters" element={<ShelterListPage />} />

                {/* Authentication */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<LoginPage />} />

                {/* Module 3: Relief Supplies & Donor Pledges */}
                <Route path="/supplies" element={<SupplyBoardPage />} />
                <Route path="/donate" element={<SupplyBoardPage />} />
                <Route
                  path="/coordinator"
                  element={
                    <ProtectedRoute allowedRoles={['administrator', 'coordinator']}>
                      <SupplyBoardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Module 1: SOS Reporting - Protected: Requires Login & 2FA */}
                <Route
                  path="/sos"
                  element={
                    <ProtectedRoute>
                      <SOSRequestForm />
                    </ProtectedRoute>
                  }
                />
                <Route path="/sos-dashboard" element={<SOSDashboard />} />

                {/* Module 6: Shared Dashboards & Role-Aware Operations */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardRedirect />} />
                  <Route
                    path="citizen"
                    element={
                      <ProtectedRoute allowedRoles={['citizen', 'administrator', 'coordinator']}>
                        <CitizenDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="volunteer"
                    element={
                      <ProtectedRoute allowedRoles={['volunteer', 'administrator', 'coordinator']}>
                        <VolunteerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="administrator"
                    element={
                      <ProtectedRoute allowedRoles={['administrator', 'coordinator']}>
                        <AdministratorDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Suspense>
          </main>

          {/* Native iOS Bottom Tab Bar on Mobile */}
          <MobileTabBar />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
