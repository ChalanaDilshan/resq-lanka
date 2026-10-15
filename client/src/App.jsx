```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/shared/Navbar';

import HomePage from './pages/home/HomePage';
import ShelterListPage from './pages/shelter-directory/ShelterListPage';
import LoginPage from './pages/auth/LoginPage';
import SupplyBoardPage from './pages/supply-board/SupplyBoardPage';

import SOSRequestForm from './pages/sos-reporting/SOSRequestForm';
import SOSDashboard from './pages/sos-reporting/SOSDashboard';

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
              <Route path="/alerts" element={<HomePage />} />
              <Route path="/volunteer" element={<HomePage />} />
              <Route path="/about" element={<HomePage />} />

              {/* Module 2: Shelter Directory */}
              <Route path="/shelters" element={<ShelterListPage />} />

              {/* Authentication */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<LoginPage />} />

              {/* Module 3: Relief Supplies & Donor Pledges */}
              <Route path="/supplies" element={<SupplyBoardPage />} />
              <Route path="/donate" element={<SupplyBoardPage />} />
              <Route path="/coordinator" element={<SupplyBoardPage />} />

              {/* Module 1: SOS Reporting */}
              <Route path="/sos" element={<SOSRequestForm />} />
              <Route path="/sos-dashboard" element={<SOSDashboard />} />

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
```