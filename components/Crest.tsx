export default function Crest({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 6 L26 20 L24 42 L22 20 Z"
        fill="currentColor"
      />
      <path
        d="M24 10c-4 2-9 2-13-1 1 5 4 9 9 11-3 2-6 5-7 9 5-1 9-4 11-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M24 10c4 2 9 2 13-1-1 5-4 9-9 11 3 2 6 5 7 9-5-1-9-4-11-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="24" cy="8" r="2.5" fill="currentColor" />
    </svg>
  );
}
