import { useState, useCallback, useRef } from 'react';
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
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createSOSRequest } from '../../services/sosService';
import themeBg from '../../assets/theme_bg.jpg';

const mapContainerStyle = {
  width: '100%',
  height: '215px',
  borderRadius: '1rem',
};

// Center on Colombo, Sri Lanka (near Maradana / Lotus Tower)
const defaultCenter = { lat: 6.9271, lng: 79.8612 };

export default function SOSRequestForm() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    hazardType: 'Flood',
    urgency: 'Critical (Immediate Danger)',
    locationText: '',
    description: '',
    contactNumber: '0770000000',
    coordinates: defaultCenter,
  });

  const [mapZoom, setMapZoom] = useState(14);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef(null);

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleMapClick = useCallback((e) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setFormData((prev) => ({
        ...prev,
        coordinates: { lat, lng },
        locationText: prev.locationText || `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      }));
      if (errors.locationText) {
        setErrors((prev) => ({ ...prev, locationText: null }));
      }
    }
  }, [errors.locationText]);

  const handleMarkerDragEnd = useCallback((e) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setFormData((prev) => ({
        ...prev,
        coordinates: { lat, lng },
        locationText: prev.locationText || `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      }));
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
          lng: position.coords.longitude,
        };
        setFormData((prev) => ({
          ...prev,
          coordinates: userCoords,
          locationText: prev.locationText || `GPS: ${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`,
        }));
        if (mapRef.current) {
          mapRef.current.panTo(userCoords);
          mapRef.current.setZoom(15);
        }
        setMapZoom(15);
        setLocating(false);
        if (errors.locationText) {
          setErrors((prev) => ({ ...prev, locationText: null }));
        }
      },
      () => {
        alert('Unable to retrieve GPS coordinates. Please click on the map to pin your location.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.locationText.trim()) {
      newErrors.locationText = 'Location details / landmark is required.';
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

    // Map urgency level string for backend
    let mappedUrgency = 'Critical';
    if (formData.urgency.startsWith('Critical')) mappedUrgency = 'Critical';
    else if (formData.urgency.startsWith('High')) mappedUrgency = 'High';
    else if (formData.urgency.startsWith('Medium')) mappedUrgency = 'Medium';
    else if (formData.urgency.startsWith('Low')) mappedUrgency = 'Low';

    try {
      const payload = {
        hazardType: formData.hazardType,
        urgency: mappedUrgency,
        locationText: formData.locationText.trim(),
        description: formData.description.trim() || `${formData.hazardType} emergency reported at ${formData.locationText}`,
        contactNumber: formData.contactNumber || '0770000000',
        coordinates: formData.coordinates,
      };
      await createSOSRequest(payload);
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || 'Failed to submit SOS request to emergency server.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: 'Report Details' },
    { id: 2, label: 'Location' },
    { id: 3, label: 'Additional Info' },
    { id: 4, label: 'Review & Submit' },
  ];

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
            Emergency Request Dispatched
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mb-5 leading-relaxed">
            Your emergency report for <strong className="text-red-600">{formData.hazardType}</strong> has been transmitted to emergency dispatch.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left text-xs text-slate-700 space-y-1.5 mb-5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans font-semibold">Landmark:</span>
              <span className="font-bold text-slate-900 truncate max-w-[230px]">{formData.locationText}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans font-semibold">Coordinates:</span>
              <span className="text-red-600 font-bold">
                {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans font-semibold">Priority:</span>
              <span className="text-red-600 font-bold">{formData.urgency}</span>
            </div>
          </div>

          {/* Hotline contacts */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-left mb-6">
            <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs mb-1">
              <PhoneCall size={15} />
              <span>Direct Emergency Helpline Numbers:</span>
            </div>
            <p className="text-xs text-red-800">
              Disaster Management: <strong>117</strong> | Police: <strong>119</strong> | Ambulance: <strong>1990</strong>
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/sos-dashboard"
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition text-center"
            >
              Incident Dashboard
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  hazardType: 'Flood',
                  urgency: 'Critical (Immediate Danger)',
                  locationText: '',
                  description: '',
                  contactNumber: '0770000000',
                  coordinates: defaultCenter,
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
      
      {/* Background artwork: misty Sri Lanka mountain range + lighthouse & red waves */}
      <div
        className="absolute inset-0 bg-cover bg-left-bottom bg-no-repeat pointer-events-none opacity-85"
        style={{
          backgroundImage: `url(${themeBg})`,
          backgroundPosition: 'left bottom',
          backgroundSize: 'cover',
        }}
      />
      
      {/* Soft gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-white/50 pointer-events-none" />

      {/* Main Content Grid */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-center pt-2 sm:pt-4">
            {/* Tagline */}
            <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-1.5">
              EMERGENCY RESPONSE
            </span>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#1e293b] tracking-tight leading-[1.12] mb-3">
              Report an<br className="hidden sm:inline" /> Emergency
            </h1>

            {/* Subtext */}
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 max-w-sm">
              Help us respond faster and keep communities safer across Sri Lanka.
            </p>

            {/* 3 Information Cards */}
            <div className="space-y-3 max-w-sm">
              {/* Card 1 */}
              <div className="bg-white/80 backdrop-blur-md border border-white/90 shadow-sm rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 hover:bg-white/95 transition">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 flex-shrink-0">
                  <Zap size={18} className="fill-current" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Faster Response</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Reach the right team quickly</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white/80 backdrop-blur-md border border-white/90 shadow-sm rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 hover:bg-white/95 transition">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Safer Communities</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Support those in need</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white/80 backdrop-blur-md border border-white/90 shadow-sm rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 hover:bg-white/95 transition">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Together for a Safer Sri Lanka</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Your report makes a difference</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT FORM CARD ================= */}
          <div className="lg:col-span-8 xl:col-span-8">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-300/40 border border-slate-100 p-6 sm:p-8 lg:p-9 pb-7 sm:pb-8 lg:pb-9 relative">
              
              {/* Stepper Header */}
              <div className="relative mb-6">
                {/* Horizontal line behind step badges */}
                <div className="absolute top-3.5 left-[10%] right-[10%] h-[1px] bg-slate-200 -z-0" />
                
                <div className="grid grid-cols-4 relative z-10 text-center">
                  {steps.map((step) => {
                    const isActive = step.id === activeStep;
                    const isCompleted = step.id < activeStep;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setActiveStep(step.id)}
                        className="flex flex-col items-center group cursor-pointer focus:outline-none"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-red-600 text-white ring-4 ring-red-100 shadow-sm'
                              : isCompleted
                              ? 'bg-red-500 text-white'
                              : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'
                          }`}
                        >
                          {step.id}
                        </div>
                        <span
                          className={`text-[11px] sm:text-xs mt-1.5 font-semibold transition-colors ${
                            isActive
                              ? 'text-red-600 font-bold'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        >
                          {step.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Title & Icon */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    Emergency Request
                  </h2>
                  <p className="text-xs text-slate-500">
                    Provide the details below so we can coordinate a quick response.
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
                  
                  {/* Hazard Type */}
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
                        <option value="Other">Other Hazard</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown size={15} />
                      </div>
                    </div>
                  </div>

                  {/* Urgency Level */}
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
                        <option value="Critical (Immediate Danger)">Critical (Immediate Danger)</option>
                        <option value="High (Severe Risk)">High (Severe Risk)</option>
                        <option value="Medium (Trapped / Supplies)">Medium (Trapped / Supplies)</option>
                        <option value="Low (Property Damage)">Low (Property Damage)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown size={15} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROW 2: Select Location on Map */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={17} className="text-red-500 stroke-[2.5]" />
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-800">
                          Select Location on Map <span className="text-red-500">*</span>
                        </span>
                        <p className="text-[11px] text-slate-400 font-normal leading-none mt-0.5">
                          Click on the map or drag the pin to mark your exact location.
                        </p>
                      </div>
                    </div>

                    {/* Use My Current Location Pill */}
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={locating}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full px-3.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <LocateFixed size={13} className={locating ? 'animate-spin' : ''} />
                      <span>{locating ? 'Locating...' : 'Use My Current Location'}</span>
                    </button>
                  </div>

                  {/* Google Map Box */}
                  <div className="rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner bg-slate-100 h-[225px]">
                    {loadError ? (
                      <div className="h-full flex flex-col items-center justify-center p-4 text-center bg-slate-50">
                        <MapPin size={28} className="text-red-400 mb-1" />
                        <p className="text-xs font-semibold text-slate-700">Map View Available</p>
                        <p className="text-[11px] text-slate-500">
                          Coordinates: {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
                        </p>
                      </div>
                    ) : isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={formData.coordinates}
                        zoom={mapZoom}
                        onLoad={handleMapLoad}
                        onClick={handleMapClick}
                        options={{
                          disableDefaultUI: true,
                          zoomControl: true,
                          gestureHandling: 'cooperative',
                        }}
                      >
                        <Marker
                          position={formData.coordinates}
                          draggable={true}
                          onDragEnd={handleMarkerDragEnd}
                        />
                      </GoogleMap>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Loading map...
                      </div>
                    )}
                  </div>
                </div>

                {/* ROW 3: Two inputs (Location Details / Landmark & Additional Details) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Location Details / Landmark */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Location Details / Landmark <span className="text-red-500">*</span>
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
                        placeholder="e.g. Near Maradana Railway Station, Colombo 10"
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

                  {/* Additional Details (optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Additional Details (optional)
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
                        placeholder="e.g. Number of people affected, road condition, water level, any additional information..."
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* ROW 4: Full-width Red Gradient Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#d9232e] to-[#b91c1c] hover:from-[#c51c27] hover:to-[#991b1b] text-white font-bold text-sm sm:text-base py-3 px-6 rounded-2xl shadow-md shadow-red-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:transform-none disabled:cursor-not-allowed mt-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Transmitting Emergency Request...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} className="transform rotate-12 stroke-[2.5]" />
                      <span>Submit Emergency Request</span>
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