export const SPORT_TYPE_CODES = {
  badminton: "BD",
  volleyball: "VB",
  cricket: "CR",
  "table-tennis": "TT",
  tabletennis: "TT",
  football: "FB",
  basketball: "BB",
};

export const getTypeCodeForSport = (sportNameOrSlug) => {
  if (!sportNameOrSlug) return "N/A";
  const str = String(sportNameOrSlug).toLowerCase().trim();
  if (SPORT_TYPE_CODES[str]) return SPORT_TYPE_CODES[str];
  const slugified = str.replace(/[\s_]+/g, "-");
  if (SPORT_TYPE_CODES[slugified]) return SPORT_TYPE_CODES[slugified];
  const alphaNumericOnly = str.replace(/[^a-z0-9]/g, "");
  if (SPORT_TYPE_CODES[alphaNumericOnly]) return SPORT_TYPE_CODES[alphaNumericOnly];
  return "N/A";
};

export const SPORTS_CONFIG = [
  { id: "badminton", name: "Badminton", slug: "badminton", icon: "🏸", code: "BD" },
  { id: "volleyball", name: "Volleyball", slug: "volleyball", icon: "🏐", code: "VB" },
  { id: "cricket", name: "Cricket", slug: "cricket", icon: "🏏", code: "CR" },
  { id: "football", name: "Football", slug: "football", icon: "⚽", code: "FB" },
  { id: "basketball", name: "Basketball", slug: "basketball", icon: "🏀", code: "BB" },
  { id: "other-sports", name: "Other Sports", slug: "other-sports", icon: "🏆", code: "OS" },
];

export const getSportBySlug = (slug) => {
  if (!slug) return SPORTS_CONFIG[0];
  const normalized = String(slug).toLowerCase().trim();
  return (
    SPORTS_CONFIG.find(
      (s) => s.slug.toLowerCase() === normalized || s.name.toLowerCase() === normalized
    ) || {
      id: normalized,
      name: normalized.charAt(0).toUpperCase() + normalized.slice(1).replace(/-/g, " "),
      slug: normalized,
      icon: "🏆",
      code: getTypeCodeForSport(normalized),
    }
  );
};

