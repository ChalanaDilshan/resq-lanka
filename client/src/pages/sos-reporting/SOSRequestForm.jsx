import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import {
  AlertTriangle,
  Waves,
  MapPin,
  MessageSquare,
  Send,
  LocateFixed,
  PhoneCall,
  CheckCircle2,
  Zap,
  Users,
  ShieldCheck,
  Navigation,
  Compass,
  ChevronDown,
  Loader2,
  Phone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createSOSRequest } from '../../services/sosService';
import { useAuth } from '../../context/AuthContext';
import themeBg from '../../assets/theme_bg.webp';

const mapContainerStyle = {
  width: '100%',
  height: '225px',
  borderRadius: '1rem',
};

// Default map viewport center for Sri Lanka (Colombo)
const defaultViewportCenter = { lat: 6.9271, lng: 79.8612 };

export default function SOSRequestForm() {
  const { user } = useAuth();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [formData, setFormData] = useState({
    hazardType: 'Flood',
    urgency: 'Critical',
    locationText: '',
    description: '',
    contactNumber: user?.phone || '',
    coordinates: null, // Only set when user actually pins or detects location
  });

  // Track if user explicitly confirmed map/GPS coordinates
  const [isLocationPinned, setIsLocationPinned] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultViewportCenter);
  const [mapZoom, setMapZoom] = useState(13);

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const mapRef = useRef(null);

  // Automatically collect location when client visits this page
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const userCoords = {
            lat,
            lng,
            hasCoordinates: true,
            isGPSVerified: true,
            accuracyMeters: position.coords.accuracy ? Math.round(position.coords.accuracy) : null,
          };

          setFormData((prev) => ({
            ...prev,
            coordinates: userCoords,
          }));
          setMapCenter({ lat, lng });
          setMapZoom(16);
          setIsLocationPinned(true);

          if (mapRef.current) {
            mapRef.current.panTo({ lat, lng });
            mapRef.current.setZoom(16);
          }

          // Auto reverse-geocode address if available
          if (typeof window !== 'undefined' && window.google?.maps?.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                setFormData((prev) => ({
                  ...prev,
                  coordinates: userCoords,
                  locationText: prev.locationText ? prev.locationText : results[0].formatted_address,
                }));
              }
            });
          }
        },
        (err) => {
          // If location is denied or unavailable, silent fallback allows user to manually mark the map
          console.log('Automatic location skipped:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Pre-fill user contact if user identity resolves after initial render
  const userPhone = user?.phone;
  const [prevUserPhone, setPrevUserPhone] = useState(userPhone);

  if (userPhone && userPhone !== prevUserPhone) {
    setPrevUserPhone(userPhone);
    if (!formData.contactNumber) {
      setFormData((prev) => ({ ...prev, contactNumber: userPhone }));
    }
  }

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Manual map marking & pin dragging fallback
  const handleMapClick = useCallback((e) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const coords = {
        lat,
        lng,
        hasCoordinates: true,
        isGPSVerified: true,
      };
      setFormData((prev) => ({
        ...prev,
        coordinates: coords,
        locationText:
          prev.locationText ||
          `Map Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      }));
      setIsLocationPinned(true);
      setErrors((prev) => ({ ...prev, locationText: null }));
    }
  }, []);

  const handleMarkerDragEnd = useCallback((e) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setFormData((prev) => ({
        ...prev,
        coordinates: {
          lat,
          lng,
          hasCoordinates: true,
          isGPSVerified: true,
        },
      }));
      setIsLocationPinned(true);
    }
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.locationText.trim()) {
      newErrors.locationText = 'Location address or landmark is required.';
    }

    const cleanedPhone = formData.contactNumber.replace(/[\s-]+/g, '');
    if (!cleanedPhone) {
      newErrors.contactNumber = 'Contact phone number is required.';
    } else if (cleanedPhone.length < 9 || cleanedPhone.length > 15) {
      newErrors.contactNumber =
        'Please enter a valid phone number (e.g. 077 123 4567).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const payload = {
        hazardType: formData.hazardType,
        urgency: formData.urgency,
        locationText: formData.locationText.trim(),
        description:
          formData.description.trim() ||
          `${formData.hazardType} emergency reported at ${formData.locationText}`,
        contactNumber: formData.contactNumber.trim(),
        coordinates: isLocationPinned ? formData.coordinates : null,
      };

      await createSOSRequest(payload);
      setSubmitted(true);
    } catch (err) {
      setApiError(
        err.message || 'Failed to submit SOS request to emergency server.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-10 px-4">
        <div
          className="absolute inset-0 bg-cover bg-left-bottom bg-no-repeat opacity-30 pointer-events-none"
          style={{ backgroundImage: `url(${themeBg})` }}
        />
        <div className="relative z-10 max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
            <CheckCircle2 size={38} className="stroke-[2.5]" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-1.5">
            Emergency Request Registered
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mb-5 leading-relaxed">
            Your emergency report for{' '}
            <strong className="text-red-600">{formData.hazardType}</strong> has
            been recorded in the ResQ-Lanka response system and published to the
            live incident dashboard for relief teams.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left text-xs text-slate-700 space-y-1.5 mb-5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans font-semibold">
                Landmark:
              </span>
              <span className="font-bold text-slate-900 truncate max-w-[230px]">
                {formData.locationText}
              </span>
            </div>
            {isLocationPinned && formData.coordinates && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans font-semibold">
                  Coordinates:
                </span>
                <span className="text-red-600 font-bold">
                  {formData.coordinates.lat.toFixed(4)},{' '}
                  {formData.coordinates.lng.toFixed(4)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans font-semibold">
                Priority Level:
              </span>
              <span className="text-red-600 font-bold">{formData.urgency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans font-semibold">
                Contact:
              </span>
              <span className="text-slate-900 font-bold">
                {formData.contactNumber}
              </span>
            </div>
          </div>

          {/* Official Emergency Contact Numbers Reminder */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-left mb-6">
            <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs mb-1">
              <PhoneCall size={15} />
              <span>National Emergency Direct Helplines:</span>
            </div>
            <p className="text-xs text-red-800">
              Disaster Management Centre: <strong>117</strong> | Police Emergency:{' '}
              <strong>119</strong> | Suwaseriya Ambulance: <strong>1990</strong>
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/sos-dashboard"
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition text-center"
            >
              View Live Incidents
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setIsLocationPinned(false);
                setFormData({
                  hazardType: 'Flood',
                  urgency: 'Critical',
                  locationText: '',
                  description: '',
                  contactNumber: user?.phone || '',
                  coordinates: null,
                });
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition text-center"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex items-start justify-center py-6 sm:py-8 lg:py-10 overflow-hidden">
      {/* Background artwork */}
      <div
        className="absolute inset-0 bg-cover bg-left-bottom bg-no-repeat pointer-events-none opacity-85"
        style={{
          backgroundImage: `url(${themeBg})`,
          backgroundPosition: 'left bottom',
          backgroundSize: 'cover',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-white/50 pointer-events-none" />

      {/* Main Content Grid */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-center pt-2 sm:pt-4">
            <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-1.5">
              EMERGENCY RESPONSE
            </span>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#1e293b] tracking-tight leading-[1.12] mb-3">
              Report an<br className="hidden sm:inline" /> Emergency
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 max-w-sm">
              Provide incident details to alert relief coordinators and responders across Sri Lanka.
            </p>

            <div className="space-y-3 max-w-sm">
              <div className="bg-white/80 backdrop-blur-md border border-white/90 shadow-sm rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 hover:bg-white/95 transition">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 flex-shrink-0">
                  <Zap size={18} className="fill-current" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Rapid Triage
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Prioritized rescue classification
                  </p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md border border-white/90 shadow-sm rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 hover:bg-white/95 transition">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Community Safety
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Coordinated ground response
                  </p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md border border-white/90 shadow-sm rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 hover:bg-white/95 transition">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Disaster Relief System
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Verified incident mapping
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT FORM CARD ================= */}
          <div className="lg:col-span-8 xl:col-span-8">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-300/40 border border-slate-100 p-6 sm:p-8 lg:p-9 relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    Emergency Incident Form
                  </h2>
                  <p className="text-xs text-slate-500">
                    Provide accurate location and contact details for responders.
                  </p>
                </div>
              </div>

              {/* Server Error Alert */}
              {apiError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2.5 rounded-xl mb-4 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Form Elements */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* ROW 1: Hazard Type & Urgency Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Hazard Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-500">
                        <Waves size={18} className="stroke-[2.2]" />
                      </div>
                      <select
                        name="hazardType"
                        value={formData.hazardType}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition shadow-xs cursor-pointer"
                      >
                        <option value="Flood">Flood</option>
                        <option value="Earthquake">Earthquake</option>
                        <option value="Landslide">Landslide</option>
                        <option value="Cyclone">Cyclone</option>
                        <option value="Tsunami">Tsunami</option>
                        <option value="Fire">Fire / Explosion</option>
                        <option value="Other">Other Emergency</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown size={15} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Urgency Level <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-500">
                        <AlertTriangle size={17} className="stroke-[2.2]" />
                      </div>
                      <select
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition shadow-xs cursor-pointer"
                      >
                        <option value="Critical">Critical (Immediate Life Danger)</option>
                        <option value="High">High (Severe Risk / Rising Water)</option>
                        <option value="Medium">Medium (Trapped / Need Supplies)</option>
                        <option value="Low">Low (Damage / Evacuated)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown size={15} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROW 2: Contact Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Emergency Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone size={17} />
                    </div>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="e.g. 077 123 4567"
                      className={`w-full bg-white border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition shadow-xs ${
                        errors.contactNumber
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-slate-200 focus:border-red-500'
                      }`}
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="text-red-500 text-[11px] font-semibold mt-1">
                      {errors.contactNumber}
                    </p>
                  )}
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    Your number will only be shared with authorized relief coordinators and emergency responders.
                  </p>
                </div>

                {/* ROW 3: Incident Location Map */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={17} className="text-red-500 stroke-[2.5]" />
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        Incident Location
                      </span>
                    </div>

                    {isLocationPinned && formData.coordinates && (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        <span>Pinned ({formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)})</span>
                      </span>
                    )}
                  </div>

                  {/* Map View */}
                  <div className="rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner bg-slate-100 h-[225px]">
                    {loadError ? (
                      <div className="h-full flex flex-col items-center justify-center p-4 text-center bg-slate-50">
                        <MapPin size={28} className="text-red-400 mb-1" />
                        <p className="text-xs font-semibold text-slate-700">Map Service Offline</p>
                        <p className="text-[11px] text-slate-500">
                          Please enter your detailed landmark below.
                        </p>
                      </div>
                    ) : isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={isLocationPinned && formData.coordinates ? formData.coordinates : mapCenter}
                        zoom={mapZoom}
                        onLoad={handleMapLoad}
                        onClick={handleMapClick}
                        options={{
                          disableDefaultUI: true,
                          zoomControl: true,
                          gestureHandling: "cooperative",
                        }}
                      >
                        {isLocationPinned && formData.coordinates && (
                          <Marker
                            position={formData.coordinates}
                            draggable={true}
                            onDragEnd={handleMarkerDragEnd}
                          />
                        )}
                      </GoogleMap>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Loading map...
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Click anywhere on the map or drag the pin to mark your location.
                  </p>
                </div>

                {/* ROW 4: Location Text & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Location Landmark / Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin size={17} />
                      </div>
                      <input
                        type="text"
                        name="locationText"
                        value={formData.locationText}
                        onChange={handleChange}
                        placeholder="e.g. Near Kalmunai Hospital Main Gate, Ampara"
                        className={`w-full bg-white border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition shadow-xs ${
                          errors.locationText
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-slate-200 focus:border-red-500'
                        }`}
                      />
                    </div>
                    {errors.locationText && (
                      <p className="text-red-500 text-[11px] font-semibold mt-1">
                        {errors.locationText}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Situation Description
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MessageSquare size={17} />
                      </div>
                      <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="e.g. 4 family members trapped on roof, elderly person needs medicine..."
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#d9232e] to-[#b91c1c] hover:from-[#c51c27] hover:to-[#991b1b] text-white font-bold text-sm sm:text-base py-3 px-6 rounded-2xl shadow-md shadow-red-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:transform-none disabled:cursor-not-allowed mt-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Transmitting Emergency Report...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} className="transform rotate-12 stroke-[2.5]" />
                      <span>Submit Emergency SOS Report</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}