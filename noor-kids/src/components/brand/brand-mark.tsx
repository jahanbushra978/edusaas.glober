import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="Noor Kids হোম">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 42 42" fill="none">
          <path
            d="M21 4.5 24.7 14l9.8-4.3-4.3 9.8 9.3 3.5-9.3 3.6 4.3 9.7-9.8-4.2L21 41l-3.6-8.9-9.7 4.2 4.2-9.7-9.4-3.6 9.4-3.5-4.2-9.8 9.7 4.3L21 4.5Z"
            fill="currentColor"
          />
          <circle cx="21" cy="24" r="5.1" fill="#FFF9ED" />
          <path d="M21 19.8a4.2 4.2 0 1 0 4.1 6.4 4.4 4.4 0 0 1-4.1-6.4Z" fill="#F5C451" />
        </svg>
      </span>
      {!compact && (
        <span className="brand-copy">
          <span className="brand-name">noor kids</span>
          <span className="brand-tagline">শিখি, খেলি, বেড়ে উঠি</span>
        </span>
      )}
    </Link>
  );
}
