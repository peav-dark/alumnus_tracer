/**
 * Centralized dropdown preset options for survey builder and profile forms.
 * Admins can quickly load these into select/radio/checkbox questions.
 */

export const DROPDOWN_PRESETS: Record<string, string[]> = {
  Sex: ["Male", "Female"],

  "Civil Status": ["Single", "Married", "Widowed", "Separated", "Divorced"],

  Suffix: ["Jr.", "Sr.", "II", "III", "IV", "V"],

  "Employment Status": [
    "Employed",
    "Self-Employed",
    "Unemployed",
    "Freelancer",
  ],

  "Employment Type": [
    "Full-time",
    "Part-time",
    "Contractual",
    "Temporary",
    "Casual",
    "Probationary",
  ],

  "Job Level": [
    "Rank/Clerical",
    "Professional/Technical/Supervisory",
    "Managerial/Executive",
    "Self-Employed/Entrepreneur",
  ],

  "Salary Range": [
    "Below ₱10,000",
    "₱10,000 - ₱19,999",
    "₱20,000 - ₱29,999",
    "₱30,000 - ₱49,999",
    "₱50,000 - ₱99,999",
    "₱100,000+",
  ],

  Industry: [
    "Agriculture, Forestry, and Fishing",
    "Manufacturing",
    "Construction",
    "Wholesale and Retail Trade",
    "Transportation and Storage",
    "Information and Communication",
    "Education",
    "Healthcare and Social Work",
    "Financial and Insurance",
    "Public Administration and Defense",
    "Other Service Activities",
  ],

  "Degree Program": [
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate Degree",
    "Post-Baccalaureate",
    "Diploma",
  ],

  Honors: [
    "None",
    "Summa Cum Laude",
    "Magna Cum Laude",
    "Cum Laude",
    "With Distinction",
    "With Honors",
    "Academic Achiever",
  ],

  "Yes / No": ["Yes", "No"],

  "Agree / Disagree": [
    "Strongly Agree",
    "Agree",
    "Neutral",
    "Disagree",
    "Strongly Disagree",
  ],

  "Satisfaction": [
    "Very Satisfied",
    "Satisfied",
    "Neutral",
    "Dissatisfied",
    "Very Dissatisfied",
  ],
};

/** All preset names, sorted alphabetically */
export const PRESET_NAMES = Object.keys(DROPDOWN_PRESETS).sort();
