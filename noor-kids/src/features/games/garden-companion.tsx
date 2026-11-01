import type { GameFeedback } from "@/types/game";

export function GardenCompanion({ feedback }: { feedback: GameFeedback }) {
  const message =
    feedback === "correct"
      ? "দারুণ! তুমি পেরেছো!"
      : feedback === "try-again"
        ? "কোনো সমস্যা নেই, আবার চেষ্টা করো!"
        : "চলো, একসাথে খুঁজি!";

  return (
    <div className={`garden-companion garden-companion-${feedback}`} aria-hidden="true">
      <div className="garden-companion-art">
        <svg className="garden-nuri" viewBox="0 0 180 190" fill="none">
          <ellipse cx="90" cy="177" rx="54" ry="8" fill="#70936F" opacity=".18" />
          <path d="M48 124c0-22 18-39 42-39s42 17 42 39v31H48z" fill="#668A66" />
          <path d="M57 130c-13 3-22 12-24 23 10 5 24 2 34-7" fill="#A9684D" className="nuri-arm nuri-arm-left" />
          <path d="M123 130c13 3 22 12 24 23-10 5-24 2-34-7" fill="#A9684D" className="nuri-arm nuri-arm-right" />
          <path d="M78 112h24l-4 42H82z" fill="#E5C77C" />
          <path d="m90 122 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#FFF6D8" />
          <circle cx="55" cy="61" r="20" fill="#A9684D" />
          <circle cx="125" cy="61" r="20" fill="#A9684D" />
          <circle cx="55" cy="61" r="10" fill="#E1A37C" />
          <circle cx="125" cy="61" r="10" fill="#E1A37C" />
          <ellipse cx="90" cy="74" rx="43" ry="40" fill="#BD7C5A" />
          <ellipse cx="75" cy="72" rx="3" ry="4" fill="#3C342F" />
          <ellipse cx="105" cy="72" rx="3" ry="4" fill="#3C342F" />
          <ellipse cx="90" cy="87" rx="14" ry="10" fill="#F4D6B8" />
          <ellipse cx="90" cy="83" rx="4" ry="3" fill="#574138" />
          <path d="M84 91c3 4 9 4 12 0" stroke="#574138" strokeWidth="2" strokeLinecap="round" />
          <circle cx="68" cy="84" r="5" fill="#D98E79" opacity=".72" />
          <circle cx="112" cy="84" r="5" fill="#D98E79" opacity=".72" />
          <path d="M68 43c5-18 25-26 43-17 8 4 13 10 15 18-18-8-39-8-58-1" fill="#668A66" />
          <path d="m119 39 5 10 11 2-8 7 2 11-10-5-10 5 2-11-8-7 11-2z" fill="#F3D47C" />
        </svg>
      </div>
      <p className="garden-companion-message">{message}</p>
    </div>
  );
}
