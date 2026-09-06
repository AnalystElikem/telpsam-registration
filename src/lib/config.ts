// ---------------------------------------------------------------------------
// One place to edit everything about the conference. Change these values and
// the whole site updates. The three placeholders marked TODO are the only
// things I'm missing from you — fill them in (or tell me and I'll drop them in).
// ---------------------------------------------------------------------------
export const CONFERENCE = {
  name: "TELPSAM Conference 2026",
  dates: "September 18–21, 2026",
  venue: "Pentecost Convention Center, Millennium City Road, Kasoa",
  anniversary: "25th Anniversary",
  theme: "Raising Memorials of His Faithfulness",
  verse: "Joshua 4:6–7",

  // Mobile Money payment details.
  momo: {
    number: "054 376 0511",
    name: "TELPSAM",
  },

  // Fee schedule (GHS).
  fees: [
    { label: "JHS & SHS", amount: 300 },
    { label: "Tertiary", amount: 350 },
    { label: "Workers", amount: 450 },
  ] as { label: string; amount: number }[],
};

export const EDUCATION_LEVELS = ["JHS", "SHS", "Tertiary", "Postgraduate"] as const;
export const GENDERS = ["Male", "Female"] as const;
export const ATTENDEE_TYPES = ["Student", "Worker"] as const;

// Year-of-completion dropdown range (planned or actual).
export const COMPLETION_YEARS: number[] = (() => {
  const now = new Date().getFullYear();
  const years: number[] = [];
  for (let y = now + 8; y >= now - 60; y--) years.push(y);
  return years;
})();
