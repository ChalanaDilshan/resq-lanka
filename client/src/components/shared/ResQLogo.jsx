export default function ResQLogo({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* ResQ Shield Icon */}
      <div className="relative w-10 h-10 flex-shrink-0 drop-shadow-sm transition-transform hover:scale-105">
        <svg
          viewBox="0 0 100 115"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield Base */}
          <path
            d="M50 0C50 0 85 10 96 24C97 48 95 80 50 114C5 80 3 48 4 24C15 10 50 0 50 0Z"
            fill="url(#shieldGradient)"
          />
          {/* Inner Golden Border / Accent */}
          <path
            d="M50 6C50 6 81 15 90 27C91 48 89 75 50 106C11 75 9 48 10 27C19 15 50 6 50 6Z"
            stroke="#fbbf24"
            strokeWidth="3"
            strokeOpacity="0.85"
            fill="none"
          />
          {/* Golden Lion Silhouette / Emblem */}
          <path
            d="M50 24C44 24 38 28 36 34C34 40 37 46 35 52C33 58 28 62 30 68C32 74 38 77 44 76C47 80 52 83 58 82C64 81 68 76 68 70C72 68 75 64 74 59C73 54 69 51 68 46C67 40 64 35 59 31C58 26 55 24 50 24ZM48 37C50.2 37 52 38.8 52 41C52 43.2 50.2 45 48 45C45.8 45 44 43.2 44 41C44 38.8 45.8 37 48 37ZM41 55C43.2 55 45 56.8 45 59C45 61.2 43.2 63 41 63C38.8 63 37 61.2 37 59C37 56.8 38.8 55 41 55ZM58 55C60.2 55 62 56.8 62 59C62 61.2 60.2 63 58 63C55.8 63 54 61.2 54 59C54 56.8 55.8 55 58 55Z"
            fill="#fef08a"
            fillOpacity="0.95"
          />
          {/* Gradients */}
          <defs>
            <linearGradient id="shieldGradient" x1="10" y1="5" x2="90" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="#e11d48" />
              <stop offset="0.5" stopColor="#dc2626" />
              <stop offset="1" stopColor="#991b1b" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center text-xl font-black tracking-tight leading-none">
          <span className="text-red-600">ResQ</span>
          <span className="text-slate-900">-Lanka</span>
        </div>
        <span className="text-[10.5px] font-medium text-slate-500 tracking-tight mt-0.5">
          Safer Communities, Stronger Sri Lanka
        </span>
      </div>
    </div>
  );
}
