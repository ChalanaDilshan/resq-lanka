import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import SOSRequestForm from './pages/sos-reporting/SOSRequestForm';
import SOSDashboard from './pages/sos-reporting/SOSDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="container mx-auto p-4 flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/sos" replace />} />
            <Route path="/sos" element={<SOSRequestForm />} />
            <Route path="/sos-dashboard" element={<SOSDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;