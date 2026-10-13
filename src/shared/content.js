const STACK_PATTERN =
  /(^|[.!?]\s+)(?:Used|Tech stack is|Tech stack:|Built with|Using)\s+(.+?)\.?\s*$/;

// "Built X. Used .NET 6, Angular and Docker." → { summary: "Built X.", stack: [".NET 6", "Angular", "Docker"] }
export const splitRoleDescription = (text = "") => {
  const match = text.match(STACK_PATTERN);
  if (!match) return { summary: text, stack: [] };
  const summary = text.slice(0, match.index + match[1].length).trim();
  const stack = match[2]
    .split(/,\s*|\s+and\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return { summary: summary || text, stack };
};
