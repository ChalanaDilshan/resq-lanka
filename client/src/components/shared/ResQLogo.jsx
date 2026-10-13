export default function ResQLogo({ className = '', subtitle = 'Together for a Safer Sri Lanka' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* ResQ Sri Lanka Map Silhouette + Caring Hands & Heart */}
      <div className="relative w-10 h-10 flex-shrink-0 drop-shadow-sm transition-transform hover:scale-105">
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sri Lanka Landmass Silhouette */}
          <path
            d="M52 4 C58 7 60 13 58 18 C56 22 53 25 55 30 C58 36 67 44 71 55 C76 68 77 82 72 95 C66 107 53 116 41 116 C30 116 22 108 20 97 C18 84 21 72 26 60 C30 50 33 41 35 31 C36 21 40 12 45 6 C48 2 50 2 52 4 Z"
            fill="#0f2b5c"
          />
          {/* Sri Lanka subtle outline */}
          <path
            d="M52 4 C58 7 60 13 58 18 C56 22 53 25 55 30 C58 36 67 44 71 55 C76 68 77 82 72 95 C66 107 53 116 41 116 C30 116 22 108 20 97 C18 84 21 72 26 60 C30 50 33 41 35 31 C36 21 40 12 45 6 C48 2 50 2 52 4 Z"
            stroke="#1d4ed8"
            strokeWidth="1.2"
          />

          {/* Caring Hands cupping the heart */}
          <path
            d="M32 77 C34 83 40 88 47 89 C45 85 44 80 45 74 C42 75 37 76 32 77 Z"
            fill="#ffffff"
          />
          <path
            d="M60 77 C58 83 52 88 45 89 C47 85 48 80 47 74 C50 75 55 76 60 77 Z"
            fill="#ffffff"
          />

          {/* Central Compassionate Red Heart */}
          <path
            d="M46 63 C42 59 36 60 35 65 C34 70 38 75 46 82 C54 75 58 70 57 65 C56 60 50 59 46 63 Z"
            fill="#ef4444"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center text-xl font-black tracking-tight leading-none">
          <span className="text-[#0f172a]">ResQ</span>
          <span className="text-red-600">-Lanka</span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 tracking-tight mt-1">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
