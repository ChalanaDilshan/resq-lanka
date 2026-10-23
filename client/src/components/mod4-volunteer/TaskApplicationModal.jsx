import { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { applyForTask } from '../../services/taskService';

export default function TaskApplicationModal({ task, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();

  const [message, setMessage] = useState('');
  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [availability, setAvailability] = useState('Immediate');
  const [safetyAgreed, setSafetyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !task) return null;

  const standardSkills = [
    'Dry Rations Packing',
    'Inventory Logging',
    'First Aid Basics',
    'Driving / Light Vehicle',
    'Child & Elder Care',
    'Sinhala Fluency',
    'Tamil Fluency',
    'English Fluency',
    'Sanitation Support',
  ];

  const handleToggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!customSkill.trim()) return;
    if (!skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
    }
    setCustomSkill('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!safetyAgreed) {
      setErrorMessage(
        'You must acknowledge and agree to the civilian safety instructions before submitting an application.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await applyForTask(task._id, {
        message: message.trim(),
        skills,
        availability,
      });

      if (onSuccess) {
        onSuccess(response.application || response);
      }
      onClose();
    } catch (err) {
      setErrorMessage(
        err.message || 'Failed to submit application. Please check your network and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Volunteer Sign-Up
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {task.district} District
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 line-clamp-1">
              Apply: {task.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Volunteer Information Box */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">
                Applicant: {user?.name || 'Registered Volunteer'}
              </p>
              <p className="text-[11px] text-slate-500">
                Contact: {user?.phone || user?.email || 'Authenticated profile'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                {user?.role || 'volunteer'}
              </span>
            </div>
          </div>

          {/* Relevant Skills Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Relevant Skills / Qualifications:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {standardSkills.map((sk) => {
                const selected = skills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => handleToggleSkill(sk)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sk}
                  </button>
                );
              })}
            </div>

            {/* Custom Skill Input */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Other qualification (e.g. Heavy vehicle license)..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                className="flex-grow px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Availability Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Availability:
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="Immediate">Immediate (Ready on short notice)</option>
              <option value="Morning Shift (8 AM - 1 PM)">Morning Shift (8 AM - 1 PM)</option>
              <option value="Afternoon Shift (1 PM - 6 PM)">Afternoon Shift (1 PM - 6 PM)</option>
              <option value="Full Day On-Site">Full Day On-Site</option>
              <option value="Weekends Only">Weekends Only</option>
            </select>
          </div>

          {/* Motivation / Message Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note for Relief Coordinator (Optional):
            </label>
            <textarea
              rows={3}
              placeholder="Mention your transport availability, prior disaster relief experience, or specific assistance you can offer..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="text-right text-[10px] text-slate-400">
              {message.length} / 500 characters
            </div>
          </div>

          {/* Safety & Non-Hazardous Protocol Acknowledgment */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold text-amber-900">
                  ResQ-Lanka Civilian Volunteer Safety Protocol
                </h4>
                <p className="mt-1 text-[11px] text-amber-800 leading-relaxed">
                  Civilian volunteers are strictly deployed for non-hazardous relief operations
                  (packing rations, supply distribution, aid registration, and safe camp logistics).
                  Volunteers must <strong>NOT</strong> attempt swift-water rescues, structural demolition,
                  or hazardous boat operations without DMC authorization.
                </p>
                <label className="mt-3 flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={safetyAgreed}
                    onChange={(e) => setSafetyAgreed(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-amber-300 focus:ring-blue-500"
                  />
                  <span className="font-bold text-amber-900 text-xs">
                    I acknowledge and agree to follow all on-site safety instructions.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !safetyAgreed}
              className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                isSubmitting || !safetyAgreed
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Submit Volunteer Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
