/* =========================================================================
   PMUN Portal - Shared Database Client & Authentication Guards
   ========================================================================= */

const SUPABASE_URL = "https://ctmjsfhdhwwpbbmjaodx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_57GN-JIABrjWpwnZpvuOqg_HH-fJZN5";

let supabaseInstance = null;
let isDemoMode = true;

const DB_DEFAULT_COMMITTEES = {
  "ecosoc": {
    id: "ecosoc",
    name: "Economic and Social Council (ECOSOC)",
    grade: 10,
    description: "ECOSOC deals with international economic, social, cultural, educational, and health matters. This year, ECOSOC simulates online trade dynamics and digital economies.",
    agenda: "Food Supply Chains in the Age of Online Commerce",
    eb_chair: "Aanya Sharma",
    eb_vice_chair: "Kabir Mehta",
    eb_rapporteur: "Sneha Iyer",
    rules: "Standard UN Rules of Procedure (RoP) apply. Formal debate consists of a General Speakers List (GSL), Moderated Caucuses, and Unmoderated Caucuses. Resolutions require a simple majority to pass.",
    prepare_info: "Research global food supply chain structures, the impact of ecommerce on agriculture logistics, and trade policies. Draft a 1-page Position Paper addressing the agenda.",
    resources: [
      { title: "ECOSOC Background Guide 2026", url: "#" },
      { title: "Guide to Drafting Position Papers", url: "#" }
    ],
    schedule: "Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)",
    capacity: 50,
    status: "OPEN"
  },
  "un-women": {
    id: "un-women",
    name: "UN Women",
    grade: 8,
    description: "UN Women is the UN entity dedicated to gender equality and the empowerment of women. This committee addresses international gender disparities and empowerment programs.",
    agenda: "Women's Rights and Empowerment",
    eb_chair: "Kiara Sen",
    eb_vice_chair: "Rohan Joshi",
    eb_rapporteur: "Aditya Patel",
    rules: "Standard UN Rules of Procedure (RoP) apply. Respectful, inclusive diplomatic dialogue is strictly enforced. Working papers must reflect multi-stakeholder collaboration.",
    prepare_info: "Examine national gender parity statistics, human rights conventions, and structural barriers facing women globally. Draft a 1-page Position Paper addressing the agenda.",
    resources: [
      { title: "UN Women Background Guide 2026", url: "#" },
      { title: "Beijing Declaration Reference Manual", url: "#" }
    ],
    schedule: "Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)",
    capacity: 50,
    status: "OPEN"
  },
  "unhrc": {
    id: "unhrc",
    name: "United Nations Human Rights Council (UNHRC)",
    grade: 10,
    description: "The UNHRC promotes and protects human rights globally. This session focuses on civil rights, freedom of speech, and digital rights in conflict zones.",
    agenda: "Protecting Digital Rights during Conflicts",
    eb_chair: "Dev Shah",
    eb_vice_chair: "Rhea Kapoor",
    eb_rapporteur: "Arjun Nair",
    rules: "Standard UN Rules of Procedure (RoP) apply. Formal debate focuses on international humanitarian law and digital privacy conventions.",
    prepare_info: "Analyze your country's policy on surveillance, internet shutdowns in conflict areas, and cyber sovereignty. Draft a 1-page Position Paper addressing the agenda.",
    resources: [
      { title: "UNHRC Background Guide 2026", url: "#" },
      { title: "Geneva Conventions & Digital Rights Factsheet", url: "#" }
    ],
    schedule: "Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)",
    capacity: 50,
    status: "OPEN"
  },
  "fao": {
    id: "fao",
    name: "Food and Agriculture Organization (FAO)",
    grade: 8,
    description: "The FAO leads international efforts to defeat hunger and improve nutrition and food security globally.",
    agenda: "Food Insecurity in Conflict Areas",
    eb_chair: "Aarav Patel",
    eb_vice_chair: "Sanya Gupta",
    eb_rapporteur: "Rohan Sen",
    rules: "Standard UN Rules of Procedure (RoP) apply. Cooperation and logistics coordination are heavily valued.",
    prepare_info: "Explore food security metrics, conflicts disrupt logistics paths, and agricultural support policies in target states.",
    resources: [
      { title: "FAO Background Guide 2026", url: "#" },
      { title: "Global Report on Food Crises 2026", url: "#" }
    ],
    schedule: "Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)",
    capacity: 50,
    status: "OPEN"
  },
  "unep": {
    id: "unep",
    name: "United Nations Environment Programme (UNEP)",
    grade: 8,
    description: "UNEP coordinates the United Nations' environmental activities and assists developing countries in implementing environmentally sound policies.",
    agenda: "Equitable Access to Solar Energy",
    eb_chair: "Vihaan Patel",
    eb_vice_chair: "Diya Mehta",
    eb_rapporteur: "Arjun Rao",
    rules: "Standard UN Rules of Procedure (RoP) apply. Resolving environmental disputes and policy planning are key.",
    prepare_info: "Examine solar capacity metrics, climate financing systems, and clean energy tech transfer incentives.",
    resources: [
      { title: "UNEP Background Guide 2026", url: "#" },
      { title: "COP Solar Agreements Summary", url: "#" }
    ],
    schedule: "Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)",
    capacity: 50,
    status: "OPEN"
  },
  "unicef": {
    id: "unicef",
    name: "United Nations Children's Fund (UNICEF)",
    grade: 10,
    description: "UNICEF provides humanitarian and developmental aid to children worldwide, advocating for their safety, education, and health.",
    agenda: "Foreign Aid Reductions and Child Healthcare",
    eb_chair: "Kabir Roy",
    eb_vice_chair: "Isha Joshi",
    eb_rapporteur: "Aanya Patel",
    rules: "Standard UN Rules of Procedure (RoP) apply. High-stakes negotiation on funding deficits and resource allocation.",
    prepare_info: "Examine public healthcare funding, children mortality rates, and impact of international aid cuts.",
    resources: [
      { title: "UNICEF Background Guide 2026", url: "#" },
      { title: "WHO Report on Child Healthcare Trends", url: "#" }
    ],
    schedule: "Day 1 - Session 1: Opening & GSL Setup (9:00 AM - 12:30 PM) | Day 1 - Session 2: Moderated Caucus (1:30 PM - 4:00 PM) | Day 2 - Session 3: Resolution Drafting (9:00 AM - 12:00 PM) | Day 2 - Session 4: Voting & Closing Ceremony (1:00 PM - 3:30 PM)",
    capacity: 40,
    status: "OPEN"
  }
};

const DB_DEFAULT_COUNTRIES = [
  // UNEP
  { committee_id: "unep", country_name: "Germany", category: "Renewable-energy leaders / potential technical donors" },
  { committee_id: "unep", country_name: "France", category: "Renewable-energy leaders / potential technical donors" },
  { committee_id: "unep", country_name: "Norway", category: "Renewable-energy leaders / potential technical donors" },
  { committee_id: "unep", country_name: "Denmark", category: "Renewable-energy leaders / potential technical donors" },
  { committee_id: "unep", country_name: "Australia", category: "Renewable-energy leaders / potential technical donors" },
  { committee_id: "unep", country_name: "Japan", category: "Renewable-energy leaders / potential technical donors" },
  { committee_id: "unep", country_name: "Kenya", category: "Developing countries seeking greater energy access" },
  { committee_id: "unep", country_name: "Nigeria", category: "Developing countries seeking greater energy access" },
  { committee_id: "unep", country_name: "Ethiopia", category: "Developing countries seeking greater energy access" },
  { committee_id: "unep", country_name: "Tanzania", category: "Developing countries seeking greater energy access" },
  { committee_id: "unep", country_name: "Uganda", category: "Developing countries seeking greater energy access" },
  { committee_id: "unep", country_name: "Bangladesh", category: "Developing countries seeking greater energy access" },
  { committee_id: "unep", country_name: "Pakistan", category: "Developing countries seeking greater energy access" },
  { committee_id: "unep", country_name: "Nepal", category: "Developing countries seeking greater energy access" },
  { committee_id: "unep", country_name: "India", category: "Major emerging renewable-energy players" },
  { committee_id: "unep", country_name: "China", category: "Major emerging renewable-energy players" },
  { committee_id: "unep", country_name: "Brazil", category: "Major emerging renewable-energy players" },
  { committee_id: "unep", country_name: "Morocco", category: "Major emerging renewable-energy players" },
  { committee_id: "unep", country_name: "South Africa", category: "Major emerging renewable-energy players" },
  { committee_id: "unep", country_name: "Chile", category: "Major emerging renewable-energy players" },
  { committee_id: "unep", country_name: "Mexico", category: "Major emerging renewable-energy players" },
  { committee_id: "unep", country_name: "United States", category: "Energy-transition / fossil-fuel-heavy economies" },
  { committee_id: "unep", country_name: "Canada", category: "Energy-transition / fossil-fuel-heavy economies" },
  { committee_id: "unep", country_name: "Indonesia", category: "Energy-transition / fossil-fuel-heavy economies" },
  { committee_id: "unep", country_name: "Saudi Arabia", category: "Energy-transition / fossil-fuel-heavy economies" },
  { committee_id: "unep", country_name: "United Arab Emirates", category: "Energy-transition / fossil-fuel-heavy economies" },
  { committee_id: "unep", country_name: "Switzerland", category: "Neutral / balancing voices" },
  { committee_id: "unep", country_name: "Singapore", category: "Neutral / balancing voices" },
  { committee_id: "unep", country_name: "New Zealand", category: "Neutral / balancing voices" },
  { committee_id: "unep", country_name: "South Korea", category: "Neutral / balancing voices" },

  // UNICEF
  { committee_id: "unicef", country_name: "United States", category: "Major donor countries" },
  { committee_id: "unicef", country_name: "United Kingdom", category: "Major donor countries" },
  { committee_id: "unicef", country_name: "Germany", category: "Major donor countries" },
  { committee_id: "unicef", country_name: "France", category: "Major donor countries" },
  { committee_id: "unicef", country_name: "Japan", category: "Major donor countries" },
  { committee_id: "unicef", country_name: "Canada", category: "Major donor countries" },
  { committee_id: "unicef", country_name: "Australia", category: "Major donor countries" },
  { committee_id: "unicef", country_name: "Norway", category: "Major donor countries" },
  { committee_id: "unicef", country_name: "India", category: "Healthcare / development partners" },
  { committee_id: "unicef", country_name: "China", category: "Healthcare / development partners" },
  { committee_id: "unicef", country_name: "Brazil", category: "Healthcare / development partners" },
  { committee_id: "unicef", country_name: "South Africa", category: "Healthcare / development partners" },
  { committee_id: "unicef", country_name: "Türkiye", category: "Healthcare / development partners" },
  { committee_id: "unicef", country_name: "United Arab Emirates", category: "Healthcare / development partners" },
  { committee_id: "unicef", country_name: "South Sudan", category: "Aid-dependent / highly vulnerable countries" },
  { committee_id: "unicef", country_name: "Sudan", category: "Aid-dependent / highly vulnerable countries" },
  { committee_id: "unicef", country_name: "Somalia", category: "Aid-dependent / highly vulnerable countries" },
  { committee_id: "unicef", country_name: "Yemen", category: "Aid-dependent / highly vulnerable countries" },
  { committee_id: "unicef", country_name: "Afghanistan", category: "Aid-dependent / highly vulnerable countries" },
  { committee_id: "unicef", country_name: "Democratic Republic of the Congo", category: "Aid-dependent / highly vulnerable countries" },
  { committee_id: "unicef", country_name: "Ethiopia", category: "Aid-dependent / highly vulnerable countries" },
  { committee_id: "unicef", country_name: "Haiti", category: "Aid-dependent / highly vulnerable countries" },
  { committee_id: "unicef", country_name: "Kenya", category: "Developing / recipient countries" },
  { committee_id: "unicef", country_name: "Nigeria", category: "Developing / recipient countries" },
  { committee_id: "unicef", country_name: "Tanzania", category: "Developing / recipient countries" },
  { committee_id: "unicef", country_name: "Uganda", category: "Developing / recipient countries" },
  { committee_id: "unicef", country_name: "Bangladesh", category: "Developing / recipient countries" },
  { committee_id: "unicef", country_name: "Indonesia", category: "Balancing / other stakeholders" },
  { committee_id: "unicef", country_name: "Mexico", category: "Balancing / other stakeholders" },
  { committee_id: "unicef", country_name: "Philippines", category: "Balancing / other stakeholders" },

  // FAO
  { committee_id: "fao", country_name: "Sudan", category: "Directly conflict-affected / food-insecure" },
  { committee_id: "fao", country_name: "South Sudan", category: "Directly conflict-affected / food-insecure" },
  { committee_id: "fao", country_name: "Yemen", category: "Directly conflict-affected / food-insecure" },
  { committee_id: "fao", country_name: "Democratic Republic of the Congo", category: "Directly conflict-affected / food-insecure" },
  { committee_id: "fao", country_name: "Syria", category: "Directly conflict-affected / food-insecure" },
  { committee_id: "fao", country_name: "Haiti", category: "Directly conflict-affected / food-insecure" },
  { committee_id: "fao", country_name: "Ukraine", category: "Directly conflict-affected / food-insecure" },
  { committee_id: "fao", country_name: "Palestine", category: "Directly conflict-affected / food-insecure" },
  { committee_id: "fao", country_name: "Afghanistan", category: "Directly conflict-affected / food-insecure" },
  { committee_id: "fao", country_name: "Somalia", category: "Directly conflict-affected / food-insecure" },
  { committee_id: "fao", country_name: "Egypt", category: "Regionally affected / humanitarian stakeholders" },
  { committee_id: "fao", country_name: "Jordan", category: "Regionally affected / humanitarian stakeholders" },
  { committee_id: "fao", country_name: "Lebanon", category: "Regionally affected / humanitarian stakeholders" },
  { committee_id: "fao", country_name: "Türkiye", category: "Regionally affected / humanitarian stakeholders" },
  { committee_id: "fao", country_name: "Kenya", category: "Regionally affected / humanitarian stakeholders" },
  { committee_id: "fao", country_name: "Ethiopia", category: "Regionally affected / humanitarian stakeholders" },
  { committee_id: "fao", country_name: "United States", category: "Major food-aid / humanitarian donors" },
  { committee_id: "fao", country_name: "United Kingdom", category: "Major food-aid / humanitarian donors" },
  { committee_id: "fao", country_name: "Germany", category: "Major food-aid / humanitarian donors" },
  { committee_id: "fao", country_name: "France", category: "Major food-aid / humanitarian donors" },
  { committee_id: "fao", country_name: "Canada", category: "Major food-aid / humanitarian donors" },
  { committee_id: "fao", country_name: "Japan", category: "Major food-aid / humanitarian donors" },
  { committee_id: "fao", country_name: "India", category: "Major agricultural / food-producing powers" },
  { committee_id: "fao", country_name: "China", category: "Major agricultural / food-producing powers" },
  { committee_id: "fao", country_name: "Brazil", category: "Major agricultural / food-producing powers" },
  { committee_id: "fao", country_name: "Russia", category: "Major agricultural / food-producing powers" },
  { committee_id: "fao", country_name: "Switzerland", category: "Neutral / balancing countries" },
  { committee_id: "fao", country_name: "Norway", category: "Neutral / balancing countries" },
  { committee_id: "fao", country_name: "Australia", category: "Neutral / balancing countries" },
  { committee_id: "fao", country_name: "South Africa", category: "Neutral / balancing countries" },

  // UNHRC
  { committee_id: "unhrc", country_name: "Ukraine", category: "Conflict-affected states" },
  { committee_id: "unhrc", country_name: "Palestine", category: "Conflict-affected states" },
  { committee_id: "unhrc", country_name: "Syria", category: "Conflict-affected states" },
  { committee_id: "unhrc", country_name: "Yemen", category: "Conflict-affected states" },
  { committee_id: "unhrc", country_name: "Sudan", category: "Conflict-affected states" },
  { committee_id: "unhrc", country_name: "Afghanistan", category: "Conflict-affected states" },
  { committee_id: "unhrc", country_name: "China", category: "Security-focused / strong state-security perspectives" },
  { committee_id: "unhrc", country_name: "Russia", category: "Security-focused / strong state-security perspectives" },
  { committee_id: "unhrc", country_name: "Iran", category: "Security-focused / strong state-security perspectives" },
  { committee_id: "unhrc", country_name: "Saudi Arabia", category: "Security-focused / strong state-security perspectives" },
  { committee_id: "unhrc", country_name: "United Arab Emirates", category: "Security-focused / strong state-security perspectives" },
  { committee_id: "unhrc", country_name: "Türkiye", category: "Security-focused / strong state-security perspectives" },
  { committee_id: "unhrc", country_name: "Germany", category: "Strong rights / privacy perspectives" },
  { committee_id: "unhrc", country_name: "France", category: "Strong rights / privacy perspectives" },
  { committee_id: "unhrc", country_name: "United Kingdom", category: "Strong rights / privacy perspectives" },
  { committee_id: "unhrc", country_name: "Canada", category: "Strong rights / privacy perspectives" },
  { committee_id: "unhrc", country_name: "Norway", category: "Strong rights / privacy perspectives" },
  { committee_id: "unhrc", country_name: "Sweden", category: "Strong rights / privacy perspectives" },
  { committee_id: "unhrc", country_name: "Netherlands", category: "Strong rights / privacy perspectives" },
  { committee_id: "unhrc", country_name: "United States", category: "Major technology / cyber powers" },
  { committee_id: "unhrc", country_name: "Japan", category: "Major technology / cyber powers" },
  { committee_id: "unhrc", country_name: "South Korea", category: "Major technology / cyber powers" },
  { committee_id: "unhrc", country_name: "Israel", category: "Major technology / cyber powers" },
  { committee_id: "unhrc", country_name: "India", category: "Major technology / cyber powers" },
  { committee_id: "unhrc", country_name: "Brazil", category: "Regional / balancing voices" },
  { committee_id: "unhrc", country_name: "South Africa", category: "Regional / balancing voices" },
  { committee_id: "unhrc", country_name: "Nigeria", category: "Regional / balancing voices" },
  { committee_id: "unhrc", country_name: "Indonesia", category: "Regional / balancing voices" },
  { committee_id: "unhrc", country_name: "Mexico", category: "Regional / balancing voices" },
  { committee_id: "unhrc", country_name: "Philippines", category: "Regional / balancing voices" },

  // UN WOMEN
  { committee_id: "un-women", country_name: "Sweden", category: "Gender-equality policy leaders" },
  { committee_id: "un-women", country_name: "Norway", category: "Gender-equality policy leaders" },
  { committee_id: "un-women", country_name: "Denmark", category: "Gender-equality policy leaders" },
  { committee_id: "un-women", country_name: "Finland", category: "Gender-equality policy leaders" },
  { committee_id: "un-women", country_name: "Iceland", category: "Gender-equality policy leaders" },
  { committee_id: "un-women", country_name: "Canada", category: "Gender-equality policy leaders" },
  { committee_id: "un-women", country_name: "India", category: "Developing countries making progress / policy reform" },
  { committee_id: "un-women", country_name: "Brazil", category: "Developing countries making progress / policy reform" },
  { committee_id: "un-women", country_name: "South Africa", category: "Developing countries making progress / policy reform" },
  { committee_id: "un-women", country_name: "Mexico", category: "Developing countries making progress / policy reform" },
  { committee_id: "un-women", country_name: "Indonesia", category: "Developing countries making progress / policy reform" },
  { committee_id: "un-women", country_name: "Philippines", category: "Developing countries making progress / policy reform" },
  { committee_id: "un-women", country_name: "Kenya", category: "Developing countries making progress / policy reform" },
  { committee_id: "un-women", country_name: "Nigeria", category: "Developing countries making progress / policy reform" },
  { committee_id: "un-women", country_name: "Afghanistan", category: "Countries facing significant structural challenges" },
  { committee_id: "un-women", country_name: "Yemen", category: "Countries facing significant structural challenges" },
  { committee_id: "un-women", country_name: "Sudan", category: "Countries facing significant structural challenges" },
  { committee_id: "un-women", country_name: "South Sudan", category: "Countries facing significant structural challenges" },
  { committee_id: "un-women", country_name: "Somalia", category: "Countries facing significant structural challenges" },
  { committee_id: "un-women", country_name: "Democratic Republic of the Congo", category: "Countries facing significant structural challenges" },
  { committee_id: "un-women", country_name: "Ethiopia", category: "Countries facing significant structural challenges" },
  { committee_id: "un-women", country_name: "Saudi Arabia", category: "Different legal / cultural approaches" },
  { committee_id: "un-women", country_name: "Iran", category: "Different legal / cultural approaches" },
  { committee_id: "un-women", country_name: "Pakistan", category: "Different legal / cultural approaches" },
  { committee_id: "un-women", country_name: "Egypt", category: "Different legal / cultural approaches" },
  { committee_id: "un-women", country_name: "Türkiye", category: "Different legal / cultural approaches" },
  { committee_id: "un-women", country_name: "United States", category: "Major international / balancing actors" },
  { committee_id: "un-women", country_name: "United Kingdom", category: "Major international / balancing actors" },
  { committee_id: "un-women", country_name: "France", category: "Major international / balancing actors" },
  { committee_id: "un-women", country_name: "Germany", category: "Major international / balancing actors" },

  // ECOSOC
  { committee_id: "ecosoc", country_name: "Brazil", category: "Major food exporters / agricultural powers" },
  { committee_id: "ecosoc", country_name: "United States", category: "Major food exporters / agricultural powers" },
  { committee_id: "ecosoc", country_name: "China", category: "Major food exporters / agricultural powers" },
  { committee_id: "ecosoc", country_name: "India", category: "Major food exporters / agricultural powers" },
  { committee_id: "ecosoc", country_name: "Russia", category: "Major food exporters / agricultural powers" },
  { committee_id: "ecosoc", country_name: "Australia", category: "Major food exporters / agricultural powers" },
  { committee_id: "ecosoc", country_name: "Canada", category: "Major food exporters / agricultural powers" },
  { committee_id: "ecosoc", country_name: "Netherlands", category: "Major food exporters / agricultural powers" },
  { committee_id: "ecosoc", country_name: "Indonesia", category: "Major digital / e-commerce economies" },
  { committee_id: "ecosoc", country_name: "Vietnam", category: "Major digital / e-commerce economies" },
  { committee_id: "ecosoc", country_name: "Thailand", category: "Major digital / e-commerce economies" },
  { committee_id: "ecosoc", country_name: "Malaysia", category: "Major digital / e-commerce economies" },
  { committee_id: "ecosoc", country_name: "Singapore", category: "Major digital / e-commerce economies" },
  { committee_id: "ecosoc", country_name: "Japan", category: "Major digital / e-commerce economies" },
  { committee_id: "ecosoc", country_name: "South Korea", category: "Major digital / e-commerce economies" },
  { committee_id: "ecosoc", country_name: "Kenya", category: "Developing / smallholder-farmer perspectives" },
  { committee_id: "ecosoc", country_name: "Nigeria", category: "Developing / smallholder-farmer perspectives" },
  { committee_id: "ecosoc", country_name: "Tanzania", category: "Developing / smallholder-farmer perspectives" },
  { committee_id: "ecosoc", country_name: "Uganda", category: "Developing / smallholder-farmer perspectives" },
  { committee_id: "ecosoc", country_name: "Bangladesh", category: "Developing / smallholder-farmer perspectives" },
  { committee_id: "ecosoc", country_name: "Philippines", category: "Developing / smallholder-farmer perspectives" },
  { committee_id: "ecosoc", country_name: "France", category: "Regional / regulatory powers" },
  { committee_id: "ecosoc", country_name: "Germany", category: "Regional / regulatory powers" },
  { committee_id: "ecosoc", country_name: "Spain", category: "Regional / regulatory powers" },
  { committee_id: "ecosoc", country_name: "Italy", category: "Regional / regulatory powers" },
  { committee_id: "ecosoc", country_name: "United Arab Emirates", category: "Regional / regulatory powers" },
  { committee_id: "ecosoc", country_name: "South Africa", category: "Balancing / emerging economies" },
  { committee_id: "ecosoc", country_name: "Mexico", category: "Balancing / emerging economies" },
  { committee_id: "ecosoc", country_name: "Türkiye", category: "Balancing / emerging economies" },
  { committee_id: "ecosoc", country_name: "Saudi Arabia", category: "Balancing / emerging economies" }
];

const DB = {
  async init() {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.role) {
          localStorage.setItem("pmun_session_role", data.role);
          if (data.registration_id) {
            localStorage.setItem("pmun_registration_id", data.registration_id);
          }
        } else {
          const myRegId = localStorage.getItem("pmun_registration_id");
          if (myRegId) {
            await this.verifyPassword("delegate", myRegId);
          }
        }
      }
    } catch (e) {
      console.warn("Using offline / local storage initialization fallback:", e);
      const myRegId = localStorage.getItem("pmun_registration_id");
      if (myRegId) {
        await this.verifyPassword("delegate", myRegId);
      }
    }
  },

  async getConfig() {
    try {
      const res = await fetch("/api/config");
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Fallback to offline config:", e);
    }
    let config = localStorage.getItem("pmun_mock_config");
    if (!config) {
      const defaultVal = {
        allow_switch_committee: true,
        registration_status: "OPEN",
        deadline: "2026-10-31T23:59:59.000Z"
      };
      localStorage.setItem("pmun_mock_config", JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(config);
  },

  async updateConfig(newConfig) {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn("Fallback updateConfig:", e);
    }
    let config = await this.getConfig();
    config = { ...config, ...newConfig };
    localStorage.setItem("pmun_mock_config", JSON.stringify(config));
    return true;
  },

  async getRegistrations() {
    try {
      const res = await fetch("/api/registrations");
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Fallback getRegistrations:", e);
    }
    let regs = localStorage.getItem("pmun_mock_registrations");
    return regs ? JSON.parse(regs) : [];
  },

  async getCommittees() {
    try {
      const res = await fetch("/api/committees");
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Fallback getCommittees:", e);
    }
    let comms = localStorage.getItem("pmun_mock_committees");
    if (!comms) {
      const defaultComms = Object.values(DB_DEFAULT_COMMITTEES);
      localStorage.setItem("pmun_mock_committees", JSON.stringify(defaultComms));
      return defaultComms;
    }
    return JSON.parse(comms);
  },

  async updateCommittee(commId, updateData) {
    try {
      const res = await fetch(`/api/committees/${commId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn("Fallback updateCommittee:", e);
    }
    let comms = await this.getCommittees();
    let idx = comms.findIndex(c => c.id === commId);
    if (idx !== -1) {
      comms[idx] = { ...comms[idx], ...updateData };
      localStorage.setItem("pmun_mock_committees", JSON.stringify(comms));
      return true;
    }
    return false;
  },

  async getCountries() {
    try {
      const res = await fetch("/api/countries");
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Fallback getCountries:", e);
    }
    let countries = localStorage.getItem("pmun_mock_countries");
    if (!countries) {
      const formatted = DB_DEFAULT_COUNTRIES.map((c, i) => ({
        id: i + 1,
        ...c,
        available: true,
        assigned_to: null,
        preference_count: 0
      }));
      localStorage.setItem("pmun_mock_countries", JSON.stringify(formatted));
      return formatted;
    }
    return JSON.parse(countries);
  },

  async updateCountry(countryId, updateData) {
    try {
      const res = await fetch(`/api/countries/${countryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn("Fallback updateCountry:", e);
    }
    let countries = await this.getCountries();
    let idx = countries.findIndex(c => c.id === parseInt(countryId));
    if (idx !== -1) {
      countries[idx] = { ...countries[idx], ...updateData };
      localStorage.setItem("pmun_mock_countries", JSON.stringify(countries));
      return true;
    }
    return false;
  },

  async updateRegistration(regId, updateData) {
    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn("Fallback updateRegistration:", e);
    }
    let regs = await this.getRegistrations();
    let idx = regs.findIndex(r => r.id === regId);
    if (idx !== -1) {
      regs[idx] = { ...regs[idx], ...updateData };
      localStorage.setItem("pmun_mock_registrations", JSON.stringify(regs));
      return true;
    }
    return false;
  },

  async submitRegistration(registrationData) {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData)
      });
      if (res.ok) return await res.json();
      if (res.status === 400) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit registration");
      }
    } catch (e) {
      if (e.message && e.message.includes("Failed to submit")) throw e;
      console.warn("Fallback submitRegistration:", e);
    }
    let regs = localStorage.getItem("pmun_mock_registrations");
    let regsList = regs ? JSON.parse(regs) : [];
    const regId = "PIS-2026-" + Math.floor(1000 + Math.random() * 9000);
    const newReg = {
      id: regId,
      ...registrationData,
      assigned_country: "NOT ASSIGNED",
      committee: "NOT ASSIGNED",
      status: "NOT ASSIGNED",
      created_at: new Date().toISOString()
    };
    regsList.push(newReg);
    localStorage.setItem("pmun_mock_registrations", JSON.stringify(regsList));
    return newReg;
  },

  async verifyPassword(roleName, inputPassword) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleName, password: inputPassword })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("pmun_session_role", data.role);
        if (data.registration_id) {
          localStorage.setItem("pmun_registration_id", data.registration_id);
        }
        return true;
      }
    } catch (e) {
      console.warn("Fallback verifyPassword:", e);
    }
    if (roleName === "coordinator" && inputPassword === "admin2026") {
      localStorage.setItem("pmun_session_role", "coordinator");
      return true;
    }
    if (roleName === "in_charge") {
      if (inputPassword === "staff8_2026") {
        localStorage.setItem("pmun_session_role", "in_charge_8");
        return true;
      }
      if (inputPassword === "staff9_2026") {
        localStorage.setItem("pmun_session_role", "in_charge_9");
        return true;
      }
      if (inputPassword === "staff10_2026") {
        localStorage.setItem("pmun_session_role", "in_charge_10");
        return true;
      }
    }
    if (roleName === "delegate") {
      let regs = await this.getRegistrations();
      let found = regs.find(r => r.id === inputPassword);
      if (found) {
        localStorage.setItem("pmun_session_role", "delegate");
        localStorage.setItem("pmun_registration_id", found.id);
        return true;
      }
    }
    return false;
  },

  async updatePasswords(newPasswords) {
    try {
      const res = await fetch("/api/auth/passwords/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwords: newPasswords })
      });
      if (res.ok) return true;
    } catch (e) {
      console.warn("Fallback updatePasswords:", e);
    }
    return true;
  }
};

const AppState = {
  registrations: [],
  committees: [],
  countries: [],
  config: {},

  async loadData() {
    try {
      this.registrations = await DB.getRegistrations();
      this.committees = await DB.getCommittees();
      this.countries = await DB.getCountries();
      this.config = await DB.getConfig();
    } catch (err) {
      console.error("Error loading AppState data:", err);
    }
  },

  checkAuth(role) {
    const currentSession = localStorage.getItem("pmun_session_role");
    if (!currentSession) return false;
    if (currentSession === "coordinator") return true;
    if (currentSession === role) return true;
    if (role === "in_charge" && (currentSession === "in_charge_8" || currentSession === "in_charge_9" || currentSession === "in_charge_10")) {
      return true;
    }
    return false;
  },

  async logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Server logout warning:", e);
    }
    localStorage.removeItem("pmun_session_role");
    localStorage.removeItem("pmun_session_incharge_grade");
    window.location.href = "index.html";
  }
};
