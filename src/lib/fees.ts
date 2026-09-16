// The expected conference fee for a registrant, from their type and level.
// JHS & SHS: 300 · Tertiary/Postgraduate: 350 · Workers: 450.
// (Kept in one place so the admin form and the server action agree.)
export function expectedFee(attendeeType?: string | null, educationLevel?: string | null): number {
  if ((attendeeType || "").toLowerCase() === "worker") return 450;
  const lvl = (educationLevel || "").toLowerCase();
  if (lvl === "jhs" || lvl === "shs") return 300;
  if (lvl === "tertiary" || lvl === "postgraduate") return 350;
  return 350; // sensible default for a student whose level isn't recorded
}
