export const LogoMark = ({ className = "h-9 w-9" }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="#050B14" />
    <path
      d="M17 27c7.5-6.5 18.5-6.5 26 0l7 5.5-7 5.5c-7.5 6.5-18.5 6.5-26 0l-7-5.5 7-5.5z"
      stroke="#00F0FF"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <circle cx="43.5" cy="32.5" r="2.2" fill="#00F0FF" />
    <path
      d="M13 48c6-4.5 12-4.5 18 0s12 4.5 18 0"
      stroke="#00B4D8"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export const Logo = ({ className = "" }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <LogoMark className="h-9 w-9 shrink-0" />
    <span className="text-xl font-extrabold tracking-tight text-white">
      Aqua<span className="text-aqua">Palhada</span>
    </span>
  </span>
);
