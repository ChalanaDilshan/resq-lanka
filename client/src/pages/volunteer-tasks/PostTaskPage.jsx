import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createTask } from '../../services/taskService';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  SRI_LANKA_DISTRICTS,
} from '../../utils/taskConstants';

export default function PostTaskPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Dry Rations & Food Packing',
    priority: 'Medium',
    district: user?.district || 'Ampara',
    location: '',
    requiredVolunteers: 10,
    description: '',
    skillsRequired: '',
    safetyInstructions:
      'Volunteers must follow site safety protocols, wear protective footwear and high-visibility vests. Hazardous water rescues, structural demolition, or electrical operations are strictly prohibited for civilian volunteers.',
    scheduledDate: '',
    deadline: '',
    contactPerson: user?.name || 'Relief Coordinator',
    contactPhone: user?.phone || '+94 63 222 2341',
  });

  const [safetyCompliance, setSafetyCompliance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Task title is required.');
      return;
    }

    if (formData.title.trim().length < 5) {
      setErrorMessage('Task title must be at least 5 characters long.');
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setErrorMessage('Please provide a detailed task description (at least 10 characters).');
      return;
    }

    if (!formData.location.trim()) {
      setErrorMessage('Location / assembly point is required.');
      return;
    }

    if (Number(formData.requiredVolunteers) < 1) {
      setErrorMessage('Required volunteer capacity must be at least 1.');
      return;
    }

    if (!safetyCompliance) {
      setErrorMessage(
        'You must certify that this task complies with civilian non-hazardous safety protocols.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const skillsArray = formData.skillsRequired
        ? formData.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        ...formData,
        requiredVolunteers: Number(formData.requiredVolunteers),
        skillsRequired: skillsArray,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : null,
        deadline: formData.deadline ? new Date(formData.deadline) : null,
      };

      const result = await createTask(payload);
      const newTaskId = result.task?._id || result._id;

      if (newTaskId) {
        navigate(`/tasks/${newTaskId}`);
      } else {
        navigate('/tasks');
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Failed to publish task. Please check server connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Back Navigation */}
      <div>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Volunteer Task Board</span>
        </Link>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <PlusCircle size={14} />
            <span>Relief Coordinator Form</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Publish New Volunteer Task
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create an emergency community relief opportunity for registered volunteers.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-700">
            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Dry Ration Packing for Flood Evacuees at Central Hall"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm font-medium"
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Relief Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Priority Level <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* District & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Affected District <span className="text-red-500">*</span>
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                {SRI_LANKA_DISTRICTS.map((dst) => (
                  <option key={dst} value={dst}>
                    {dst} District
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Assembly Location Point <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Ampara Central College Staging Hall, Gate 2"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>
          </div>

          {/* Required Volunteers & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Volunteers Needed <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="requiredVolunteers"
                min={1}
                max={500}
                value={formData.requiredVolunteers}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Scheduled Operation Date
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Sign-Up Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Detailed Task Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Outline what volunteers will do, shift timings, reporting instructions, and required gear..."
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
            />
          </div>

          {/* Skills Required */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Skills / Qualifications (comma separated)
            </label>
            <input
              type="text"
              name="skillsRequired"
              placeholder="e.g. Food Packing, Tamil Fluency, Basic First Aid, Driving"
              value={formData.skillsRequired}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Coordinator Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Site Coordinator Name
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Coordinator Phone Hotline
              </label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Safety Instructions */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Safety Instructions &amp; Restrictions
            </label>
            <textarea
              name="safetyInstructions"
              rows={3}
              value={formData.safetyInstructions}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Mandatory Safety Compliance Checkbox */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900">
                  DMC Civilian Volunteer Protocol Compliance
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  I certify as relief coordinator that this task does not direct civilian volunteers
                  into deep floodwaters, unstable collapsed structures, or hazardous power line zones.
                </p>
                <label className="mt-3 flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={safetyCompliance}
                    onChange={(e) => setSafetyCompliance(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-amber-300 focus:ring-blue-500"
                  />
                  <span className="font-bold text-amber-900 text-xs">
                    I verify and confirm civilian safety protocol compliance.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link
              to="/tasks"
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !safetyCompliance}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
                isSubmitting || !safetyCompliance
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Publishing Task...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={15} />
                  <span>Publish Relief Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
