import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/shared/Navbar';

import HomePage from './pages/home/HomePage';
import AboutPage from './pages/about/AboutPage';
import ShelterListPage from './pages/shelter-directory/ShelterListPage';
import LoginPage from './pages/auth/LoginPage';
import SupplyBoardPage from './pages/supply-board/SupplyBoardPage';

import SOSRequestForm from './pages/sos-reporting/SOSRequestForm';
import SOSDashboard from './pages/sos-reporting/SOSDashboard';
import ProtectedRoute from './components/shared/ProtectedRoute';

import TaskBoardPage from './pages/volunteer-tasks/TaskBoardPage';
import TaskDetailPage from './pages/volunteer-tasks/TaskDetailPage';
import PostTaskPage from './pages/volunteer-tasks/PostTaskPage';

import NoticeBoardPage from './pages/noticeboard/NoticeBoardPage';
import AlertDetailPage from './pages/noticeboard/AlertDetailPage';
import PostAlertPage from './pages/noticeboard/PostAlertPage';

import DashboardLayout from './layouts/DashboardLayout';
import DashboardRedirect from './pages/dashboards/DashboardRedirect';
import CitizenDashboard from './pages/dashboards/CitizenDashboard';
import VolunteerDashboard from './pages/dashboards/VolunteerDashboard';
import AdministratorDashboard from './pages/dashboards/AdministratorDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-800 antialiased selection:bg-red-500 selection:text-white">
          <Navbar />

          <main className="flex-grow flex flex-col">
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

              {/* Module 1: SOS Reporting */}
              <Route path="/sos" element={<SOSRequestForm />} />
              <Route path="/sos-dashboard" element={<SOSDashboard />} />

              {/* Module 6: Shared Dashboards & Role-Aware Operations */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardRedirect />} />
                <Route path="citizen" element={<CitizenDashboard />} />
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
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;