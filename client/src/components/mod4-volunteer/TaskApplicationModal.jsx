import { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Check,
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
        err.message || 'Failed to submit application. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70"
    >
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-lg border border-slate-300 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 pb-4 border-b border-slate-200 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-600">
              {task.district} District Relief Operation
            </span>
            <h2 id="modal-title" className="text-lg font-bold text-slate-900 mt-0.5 line-clamp-1">
              Apply: {task.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2.5 text-xs text-red-900"
            >
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Volunteer Information Box */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">
                Applicant: {user?.name || 'Registered Volunteer'}
              </p>
              <p className="text-slate-500 mt-0.5">
                Contact: {user?.phone || user?.email || 'Authenticated profile'}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {user?.role || 'volunteer'}
              </span>
            </div>
          </div>

          {/* Relevant Skills Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              Select Relevant Skills / Qualifications
            </label>
            <div className="flex flex-wrap gap-1.5">
              {standardSkills.map((sk) => {
                const selected = skills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => handleToggleSkill(sk)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
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
                className="flex-grow px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Availability Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Your Availability
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
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
            <label className="block text-xs font-bold text-slate-900 mb-1">
              Note for Relief Coordinator (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="State your transportation options, prior disaster relief experience, or specific assistance you can provide..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="text-right text-[11px] text-slate-500">
              {message.length} / 500 characters
            </div>
          </div>

          {/* Safety & Non-Hazardous Protocol Acknowledgment */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-amber-800 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h3 className="font-bold text-amber-950">
                  ResQ-Lanka Civilian Volunteer Safety Directive
                </h3>
                <p className="mt-1 text-amber-900 leading-relaxed">
                  Civilian volunteers are strictly assigned to non-hazardous relief operations
                  (rations packing, aid distribution, registration, and logistics). Volunteers must <strong>not</strong> attempt swift-water rescues, structural demolition, or hazardous operations.
                </p>
                <label className="mt-3 flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={safetyAgreed}
                    onChange={(e) => setSafetyAgreed(e.target.checked)}
                    className="w-4 h-4 text-slate-900 rounded border-amber-400 focus:ring-slate-900"
                  />
                  <span className="font-semibold text-amber-950 text-xs">
                    I acknowledge and agree to follow all official safety instructions.
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
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !safetyAgreed}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isSubmitting || !safetyAgreed
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 active:bg-black text-white focus:ring-2 focus:ring-slate-900'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
