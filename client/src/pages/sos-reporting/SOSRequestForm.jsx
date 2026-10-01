import { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { AlertCircle, CheckCircle, PhoneCall, MapPin, Navigation, Flame, Loader2 } from 'lucide-react';
import { createSOSRequest } from '../../services/sosService';

const mapContainerStyle = { width: '100%', height: '240px', borderRadius: '0.5rem' };
const defaultCenter = { lat: 6.9271, lng: 79.8612 };

export default function SOSRequestForm() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [formData, setFormData] = useState({
    hazardType: 'Flood',
    urgency: 'Critical',
    locationText: '',
    contactNumber: '',
    description: '',
    coordinates: defaultCenter
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [locating, setLocating] = useState(false);

  const handleMapClick = useCallback((e) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setFormData((prev) => ({ ...prev, coordinates: { lat, lng } }));
    }
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setFormData((prev) => ({
          ...prev,
          coordinates: userCoords,
          locationText: prev.locationText || `GPS: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`
        }));
        setLocating(false);
      },
      () => {
        alert('Unable to detect location. Please click the map to pin.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.locationText.trim()) newErrors.locationText = 'Location / Landmark is required.';
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required.';
    } else if (!/^(?:0|94|\+94)?7\d{8}$/.test(formData.contactNumber.replace(/\s+/g, ''))) {
      newErrors.contactNumber = 'Enter a valid Sri Lankan mobile number (e.g., 0771234567).';
    }
    if (!formData.description.trim()) newErrors.description = 'Please describe the emergency assistance needed.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      await createSOSRequest(formData);
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || 'Failed to connect to emergency dispatch server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md border-t-4 border-green-500 mt-8 text-center">
        <CheckCircle className="text-green-500 mx-auto mb-4" size={54} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Help Request Broadcasted</h2>
        <p className="text-gray-600 mb-3">
          Your SOS incident has been stored in the national dispatch database.
        </p>
        <div className="bg-gray-100 p-3 rounded text-xs text-gray-700 font-mono mb-6">
          Coordinates: {formData.coordinates.lat.toFixed(5)}, {formData.coordinates.lng.toFixed(5)}
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-left mb-6">
          <div className="flex items-center space-x-2 text-red-700 font-bold mb-1">
            <PhoneCall size={18} />
            <span>Immediate Danger? Call Hotlines:</span>
          </div>
          <p className="text-sm text-red-600">Disaster Management Centre: <strong>117</strong> | Police: <strong>119</strong></p>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              hazardType: 'Flood',
              urgency: 'Critical',
              locationText: '',
              contactNumber: '',
              description: '',
              coordinates: defaultCenter
            });
          }}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition"
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md border-t-4 border-red-500 mt-8">
      <div className="flex items-center space-x-3 mb-6">
        <AlertCircle className="text-red-500" size={32} />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Submit Emergency Request</h2>
          <p className="text-xs text-gray-500">Live integration with ResQ-Lanka Incident Coordination</p>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm flex items-center space-x-2">
          <AlertCircle size={18} />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hazard Type</label>
            <select
              name="hazardType"
              value={formData.hazardType}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-red-200 outline-none"
            >
              <option value="Flood">Flood</option>
              <option value="Earthquake">Earthquake</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Flame size={15} className="text-red-500" />
              <span>Urgency Level</span>
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-red-200 outline-none font-semibold text-gray-800"
            >
              <option value="Critical" className="text-red-600 font-bold">Critical (Immediate Danger)</option>
              <option value="High" className="text-orange-600 font-semibold">High (Severe Risk)</option>
              <option value="Medium" className="text-yellow-600">Medium (Trapped / Supplies)</option>
              <option value="Low" className="text-blue-600">Low (Property Damage)</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <MapPin size={16} className="text-red-500" />
              <span>Pin Location on Map</span>
            </label>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locating}
              className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-bold bg-red-50 px-2 py-1 rounded border border-red-200"
            >
              <Navigation size={13} />
              <span>{locating ? 'Locating...' : 'Use My GPS'}</span>
            </button>
          </div>

          {loadError ? (
            <div className="h-40 bg-red-50 border border-red-200 rounded p-4 text-xs text-red-600 flex items-center justify-center">
              Map failed to load. Please enter your address details below.
            </div>
          ) : isLoaded ? (
            <div className="border border-gray-300 rounded-lg overflow-hidden mb-1 shadow-inner">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={formData.coordinates}
                zoom={14}
                onClick={handleMapClick}
                options={{ disableDefaultUI: true, zoomControl: true }}
              >
                <Marker position={formData.coordinates} draggable={true} onDragEnd={handleMapClick} />
              </GoogleMap>
            </div>
          ) : (
            <div className="h-40 bg-gray-100 border rounded flex items-center justify-center text-gray-400 text-sm">
              Loading map...
            </div>
          )}
          <p className="text-xs text-gray-500">Tap anywhere on the map or drag the pin to mark your exact spot.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Location Details / Landmark</label>
          <input
            type="text"
            name="locationText"
            value={formData.locationText}
            onChange={handleChange}
            placeholder="e.g., Near Clock Tower, Gampaha"
            className={`w-full border p-2.5 rounded outline-none ${errors.locationText ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.locationText && <p className="text-red-500 text-xs mt-1">{errors.locationText}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone Number</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="07XXXXXXXX"
            className={`w-full border p-2.5 rounded outline-none ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Required Emergency Assistance</label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your situation..."
            className={`w-full border p-2.5 rounded outline-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          ></textarea>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-600 text-white font-bold text-lg py-3 rounded-lg hover:bg-red-700 transition shadow flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Broadcasting SOS to Database...</span>
            </>
          ) : (
            <span>Broadcast Help Request</span>
          )}
        </button>
      </form>
    </div>
  );
}