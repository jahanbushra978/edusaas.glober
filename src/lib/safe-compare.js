/**
 * Constant-time string comparison to avoid timing-attack side channels.
 * Shared by session-signature checks and password/secret comparisons.
 *
 * NOTE: This intentionally does NOT early-return on length mismatch in a way
 * that leaks length via timing beyond what is unavoidable (comparing two
 * different-length strings must eventually reveal they differ). The loop
 * still walks the full length of the longer string so that per-character
 * timing does not leak the position of the first mismatch.
 */
export function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;

  const lenA = a.length;
  const lenB = b.length;
  const maxLen = Math.max(lenA, lenB);

  let result = lenA === lenB ? 0 : 1;
  for (let i = 0; i < maxLen; i++) {
    const charA = i < lenA ? a.charCodeAt(i) : 0;
    const charB = i < lenB ? b.charCodeAt(i) : 0;
    result |= charA ^ charB;
  }
  return result === 0;
}

export default safeCompare;
