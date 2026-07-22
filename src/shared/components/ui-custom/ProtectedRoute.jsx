'use client'

/**
 * Prior react-router wrapper; unused after Next.js migration. Renders children only.
 */
export default function ProtectedRoute({ children }) {
  return children ?? null;
}
