import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import HomePage from './pages/home/HomePage';
import SOSRequestForm from './pages/sos-reporting/SOSRequestForm';
import SOSDashboard from './pages/sos-reporting/SOSDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-800 antialiased selection:bg-red-500 selection:text-white">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shelters" element={<HomePage />} />
            <Route path="/alerts" element={<HomePage />} />
            <Route path="/donate" element={<HomePage />} />
            <Route path="/volunteer" element={<HomePage />} />
            <Route path="/about" element={<HomePage />} />
            <Route path="/sos" element={<SOSRequestForm />} />
            <Route path="/sos-dashboard" element={<SOSDashboard />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;