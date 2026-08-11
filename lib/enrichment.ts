// Curated career enrichment — India-first, with a global variant per career.
// Facts live here as data (not LLM output) so nothing is hallucinated. Salary bands are
// indicative typical ranges, not live data. ponytail: static dataset; swap for a live
// source (O*NET/BLS global, a curated India feed) if/when one is available.

export type Geo = "india" | "global";

export interface GeoData {
  salary: string; // typical, indicative
  path: string; // how you get in
  universities: string[];
  companies: string[];
}

export interface Enrichment {
  skills: string[];
  courses: string[];
  india: GeoData;
  global: GeoData;
}

// Keyed by Career.title (must match lib/careers.ts exactly — self-check enforces coverage).
export const ENRICHMENT: Record<string, Enrichment> = {
  "Software Engineer": {
    skills: ["Data structures & algorithms", "A core language (Python/Java/JS)", "System design", "Git & databases"],
    courses: ["B.Tech Computer Science / IT", "BCA + MCA", "Online: CS50, DSA & full-stack certs"],
    india: { salary: "₹4–30 LPA", path: "JEE Main/Advanced → IIT/NIT/IIIT, or state CET; strong DSA portfolio",
      universities: ["IITs & IIITs", "BITS Pilani", "NITs"], companies: ["Google/Microsoft India", "Flipkart", "TCS / Infosys"] },
    global: { salary: "$80k–200k", path: "CS degree or bootcamp + strong project/interview prep",
      universities: ["MIT", "Stanford", "CMU"], companies: ["Google", "Microsoft", "Amazon"] },
  },
  "Data Scientist": {
    skills: ["Statistics & probability", "Python (pandas, scikit-learn)", "ML fundamentals", "SQL & data storytelling"],
    courses: ["B.Tech + MS Data Science", "B.Sc Statistics → M.Sc", "Certs: Andrew Ng ML, DeepLearning.AI"],
    india: { salary: "₹6–35 LPA", path: "Strong math + Python; MS/PG in analytics or a data portfolio",
      universities: ["IISc Bangalore", "IITs", "ISI Kolkata"], companies: ["Fractal / Mu Sigma", "Amazon", "Swiggy / Zomato"] },
    global: { salary: "$100k–200k", path: "Quantitative degree + ML projects; often MS/PhD",
      universities: ["MIT", "Stanford", "CMU"], companies: ["Meta", "Netflix", "OpenAI"] },
  },
  "Data / Business Analyst": {
    skills: ["Excel & SQL", "Data visualisation (Power BI/Tableau)", "Business sense", "Basic statistics"],
    courses: ["BBA / B.Com + analytics certs", "B.Tech + PG analytics", "Certs: Google Data Analytics"],
    india: { salary: "₹4–15 LPA", path: "Commerce/engineering degree + SQL & BI tools",
      universities: ["SRCC (DU)", "Christ University", "IIMs (PG)"], companies: ["Deloitte", "Accenture", "ZS Associates"] },
    global: { salary: "$60k–110k", path: "Any analytical degree + SQL/BI portfolio",
      universities: ["LSE", "NYU", "UT Austin"], companies: ["Deloitte", "EY", "Amazon"] },
  },
  "Mechanical Engineer": {
    skills: ["CAD (SolidWorks/CATIA)", "Thermodynamics & mechanics", "Manufacturing processes", "Problem-solving"],
    courses: ["B.Tech Mechanical Engineering", "M.Tech (Design/Thermal)", "Certs: SolidWorks, GD&T"],
    india: { salary: "₹3–12 LPA", path: "JEE → IIT/NIT or state CET → B.Tech Mechanical",
      universities: ["IITs", "NITs", "VIT / BITS"], companies: ["L&T", "Tata Motors / Mahindra", "ISRO / DRDO"] },
    global: { salary: "$65k–130k", path: "ME degree + internships/PE licence",
      universities: ["MIT", "Georgia Tech", "TU Munich"], companies: ["Tesla", "Boeing", "Bosch"] },
  },
  "Civil Engineer": {
    skills: ["Structural analysis", "AutoCAD / STAAD", "Surveying & materials", "Project management"],
    courses: ["B.Tech Civil Engineering", "M.Tech Structural", "Certs: AutoCAD, PMP (later)"],
    india: { salary: "₹3–10 LPA", path: "JEE / state CET → B.Tech Civil",
      universities: ["IITs", "NITs", "College of Engineering Pune"], companies: ["L&T", "GMR / GVK", "AECOM India"] },
    global: { salary: "$60k–110k", path: "Civil degree + PE licence",
      universities: ["UC Berkeley", "Imperial College", "ETH Zurich"], companies: ["AECOM", "Arup", "Bechtel"] },
  },
  "Research Scientist": {
    skills: ["Deep domain knowledge", "Experimental design", "Scientific writing", "Data analysis"],
    courses: ["B.Sc → M.Sc → PhD", "Integrated MS (IISER)", "Domain-specific research training"],
    india: { salary: "₹6–18 LPA", path: "B.Sc/B.Tech → MS/PhD via GATE/JEST/CSIR-NET",
      universities: ["IISc", "TIFR", "IISERs"], companies: ["CSIR labs", "ISRO / DRDO", "Universities"] },
    global: { salary: "$60k–120k", path: "PhD + postdoc in the field",
      universities: ["MIT", "Cambridge", "Max Planck"], companies: ["National labs", "Universities", "Industry R&D"] },
  },
  "Doctor / Physician": {
    skills: ["Biology & clinical knowledge", "Diagnostic reasoning", "Empathy & communication", "Stamina under pressure"],
    courses: ["MBBS", "MD / MS specialisation", "Super-speciality (DM/MCh)"],
    india: { salary: "₹6–30 LPA (more post-MD)", path: "NEET-UG → MBBS → NEET-PG for MD/MS",
      universities: ["AIIMS Delhi", "CMC Vellore", "JIPMER / MAMC"], companies: ["AIIMS", "Apollo / Fortis", "Own practice"] },
    global: { salary: "$200k+", path: "Pre-med → med school → residency (USMLE/PLAB)",
      universities: ["Harvard Med", "Johns Hopkins", "Oxford"], companies: ["Hospitals", "Clinics", "Research"] },
  },
  "Psychologist / Counsellor": {
    skills: ["Active listening", "Psychological assessment", "Empathy", "Ethics & boundaries"],
    courses: ["BA/B.Sc Psychology → MA/M.Sc", "M.Phil / PhD Clinical Psychology", "Counselling certifications"],
    india: { salary: "₹3–12 LPA", path: "Psychology degree → MA → RCI-recognised clinical training",
      universities: ["NIMHANS", "TISS", "Delhi University"], companies: ["NIMHANS / hospitals", "Schools", "Private practice"] },
    global: { salary: "$50k–100k", path: "Psychology degree → Masters/Doctorate + licensure",
      universities: ["UCL", "Stanford", "Michigan"], companies: ["Clinics", "Schools", "Private practice"] },
  },
  "Teacher / Educator": {
    skills: ["Subject mastery", "Communication", "Patience & mentoring", "Lesson design"],
    courses: ["B.A/B.Sc + B.Ed", "M.A + M.Ed", "Integrated B.Ed (4 yr)"],
    india: { salary: "₹3–10 LPA", path: "Degree + B.Ed → CTET/TET (school) or NET (college)",
      universities: ["RIE (NCERT)", "Delhi University", "TISS"], companies: ["Schools", "Colleges", "EdTech (BYJU'S/PW)"] },
    global: { salary: "$45k–85k", path: "Education degree + teaching licence",
      universities: ["Columbia (Teachers College)", "UCL IOE", "Melbourne"], companies: ["Schools", "Universities", "EdTech"] },
  },
  "Nurse": {
    skills: ["Patient care", "Clinical procedures", "Compassion", "Attention to detail"],
    courses: ["B.Sc Nursing", "Post-Basic B.Sc / M.Sc Nursing", "Specialty certifications"],
    india: { salary: "₹3–8 LPA (higher abroad)", path: "B.Sc Nursing (NEET for some colleges) → registration",
      universities: ["AIIMS", "CMC Vellore", "Nursing colleges"], companies: ["Hospitals", "Clinics", "Overseas placement"] },
    global: { salary: "$60k–110k", path: "Nursing degree + licensure (NCLEX/NMC)",
      universities: ["Johns Hopkins", "King's College London", "Toronto"], companies: ["Hospitals", "Care facilities", "Agencies"] },
  },
  "Social Worker": {
    skills: ["Empathy", "Community organising", "Case management", "Advocacy"],
    courses: ["BSW → MSW", "MA Development / Social Work", "Sector certifications"],
    india: { salary: "₹3–9 LPA", path: "BSW/MSW; specialise (medical, community, HR)",
      universities: ["TISS", "Delhi University", "Christ University"], companies: ["NGOs", "UN / CSR teams", "Government schemes"] },
    global: { salary: "$45k–75k", path: "Social work degree + licensure",
      universities: ["Michigan", "Columbia", "LSE"], companies: ["NGOs", "Government", "Hospitals"] },
  },
  "Graphic / Visual Designer": {
    skills: ["Typography & layout", "Adobe/Figma tools", "Colour & composition", "A strong portfolio"],
    courses: ["B.Des / BFA Visual Communication", "Diploma in Graphic Design", "Certs: UI, motion, branding"],
    india: { salary: "₹3–12 LPA", path: "NID/NIFT entrance or B.Des → build a portfolio",
      universities: ["NID", "NIFT", "Srishti / MIT-ID"], companies: ["Design agencies", "Startups", "Media houses"] },
    global: { salary: "$50k–95k", path: "Design degree + portfolio",
      universities: ["RISD", "Parsons", "RCA London"], companies: ["Agencies", "Tech companies", "Studios"] },
  },
  "Writer / Content Creator": {
    skills: ["Clear writing", "Research", "SEO/editing", "Storytelling & voice"],
    courses: ["BA English / Journalism", "MA Mass Communication", "Certs: content marketing, copywriting"],
    india: { salary: "₹3–10 LPA", path: "Humanities degree + a public writing portfolio",
      universities: ["Delhi University", "Symbiosis / Xavier's", "IIMC"], companies: ["Media houses", "Agencies", "Independent/creator"] },
    global: { salary: "$45k–90k", path: "Writing/journalism degree or self-built portfolio",
      universities: ["Columbia Journalism", "NYU", "Goldsmiths"], companies: ["Publishers", "Agencies", "Independent"] },
  },
  "UX Designer": {
    skills: ["User research", "Wireframing & Figma", "Interaction design", "Usability testing"],
    courses: ["B.Des (Interaction/HCI)", "M.Des HCI", "Certs: Google UX, IDF"],
    india: { salary: "₹5–20 LPA", path: "Design degree or transition via a UX portfolio",
      universities: ["IIT IDC", "NID", "Srishti"], companies: ["Product startups", "Microsoft/Google India", "Design studios"] },
    global: { salary: "$85k–160k", path: "HCI/design degree + portfolio",
      universities: ["CMU (HCII)", "RCA", "Delft"], companies: ["Google", "Airbnb", "Design consultancies"] },
  },
  "Architect": {
    skills: ["Design & spatial thinking", "AutoCAD / Revit", "Building science", "Presentation"],
    courses: ["B.Arch (5 yr)", "M.Arch specialisation", "Certs: Revit, sustainable design"],
    india: { salary: "₹3–12 LPA", path: "NATA / JEE Paper 2 → B.Arch → COA registration",
      universities: ["SPA Delhi", "CEPT Ahmedabad", "IIT Roorkee"], companies: ["Architecture firms", "Real estate", "Own practice"] },
    global: { salary: "$60k–120k", path: "B.Arch/M.Arch + licensure",
      universities: ["MIT", "AA London", "ETH Zurich"], companies: ["Firms (Foster, Gensler)", "Developers", "Own practice"] },
  },
  "Musician / Audio Producer": {
    skills: ["Musicianship / theory", "DAW production (Ableton/Logic)", "Mixing & mastering", "Self-promotion"],
    courses: ["BA Music / Sound", "Certificate in music production", "Online: mixing, composition"],
    india: { salary: "₹2–15 LPA (variable)", path: "Formal training or self-taught + released work",
      universities: ["KM Music Conservatory", "Swarnabhoomi Academy", "University music depts"], companies: ["Studios", "Film / ad music", "Independent"] },
    global: { salary: "$40k–120k (variable)", path: "Music school or self-built catalogue",
      universities: ["Berklee", "Juilliard", "Royal Academy of Music"], companies: ["Labels", "Studios", "Independent"] },
  },
  "Entrepreneur / Founder": {
    skills: ["Problem-finding", "Sales & fundraising", "Resilience", "Leadership"],
    courses: ["Any degree (+ optional MBA)", "Incubator / accelerator programs", "Certs: no-code, finance basics"],
    india: { salary: "Variable (equity-driven)", path: "Build → validate → raise; join an incubator",
      universities: ["IIMs / ISB", "IIT E-cells", "Incubators (T-Hub, CIIE)"], companies: ["Your own venture", "Y Combinator / Antler", "Angel networks"] },
    global: { salary: "Variable (equity-driven)", path: "Build a startup; accelerators/VC",
      universities: ["Stanford", "Harvard", "INSEAD"], companies: ["Your own venture", "Y Combinator", "VC-backed startups"] },
  },
  "Product Manager": {
    skills: ["User empathy", "Prioritisation & roadmapping", "Data literacy", "Cross-team communication"],
    courses: ["B.Tech / any degree + MBA (optional)", "PM certifications", "Ship side projects"],
    india: { salary: "₹12–40 LPA", path: "Engineering/business background → APM programs",
      universities: ["IITs + IIMs", "ISB", "BITS"], companies: ["Flipkart", "Google/Microsoft India", "Startups"] },
    global: { salary: "$120k–250k", path: "Any strong background → APM / product internships",
      universities: ["Stanford", "Wharton", "CMU"], companies: ["Google", "Meta", "Stripe"] },
  },
  "Marketing Manager": {
    skills: ["Brand & positioning", "Digital marketing/analytics", "Copy & campaigns", "Consumer insight"],
    courses: ["BBA/B.Com + MBA Marketing", "Digital marketing certs", "Google/Meta Ads certs"],
    india: { salary: "₹5–25 LPA", path: "Business degree → MBA (CAT) or agency experience",
      universities: ["IIMs", "MICA", "NMIMS"], companies: ["HUL / ITC", "Ad agencies", "Consumer startups"] },
    global: { salary: "$70k–150k", path: "Marketing/business degree + experience",
      universities: ["Kellogg", "Wharton", "London Business School"], companies: ["P&G", "Unilever", "Tech companies"] },
  },
  "Sales / Business Development": {
    skills: ["Persuasion & rapport", "Negotiation", "Pipeline management", "Resilience"],
    courses: ["BBA/MBA (optional)", "Any degree + sales training", "CRM & sales certs"],
    india: { salary: "₹3–20 LPA (+ incentives)", path: "Any degree; strong communication + track record",
      universities: ["NMIMS", "Symbiosis", "Any (skill-led)"], companies: ["B2B SaaS", "BFSI", "FMCG distribution"] },
    global: { salary: "$60k–160k (+ commission)", path: "Any degree + sales performance",
      universities: ["Any (skill-led)", "Business schools", "—"], companies: ["Salesforce", "SaaS companies", "Enterprises"] },
  },
  "Management Consultant": {
    skills: ["Structured problem-solving", "Analytics", "Client communication", "Slide/storyline craft"],
    courses: ["Engineering/commerce + MBA", "MBA from a top school", "Case-interview prep"],
    india: { salary: "₹12–35 LPA", path: "Top college → MBA (CAT/GMAT) → case prep",
      universities: ["IIMs", "ISB", "IITs"], companies: ["McKinsey", "BCG", "Bain"] },
    global: { salary: "$120k–200k", path: "Strong academics + MBA + case prep",
      universities: ["Harvard", "INSEAD", "Wharton"], companies: ["McKinsey", "BCG", "Bain"] },
  },
  "Lawyer": {
    skills: ["Legal reasoning", "Research & drafting", "Argumentation", "Attention to detail"],
    courses: ["BA LLB (5 yr) / LLB (3 yr)", "LLM specialisation", "Bar exam"],
    india: { salary: "₹4–20 LPA", path: "CLAT → National Law University → Bar Council enrolment",
      universities: ["NLSIU Bangalore", "NALSAR Hyderabad", "NLU Delhi"], companies: ["Law firms (AZB, CAM)", "Courts / litigation", "Corporate legal"] },
    global: { salary: "$90k–200k", path: "Law degree (JD/LLB) + bar exam",
      universities: ["Harvard Law", "Oxford", "Yale"], companies: ["Law firms", "Corporations", "Government"] },
  },
  "Financial Analyst": {
    skills: ["Financial modelling", "Excel", "Valuation", "Accounting basics"],
    courses: ["B.Com / BBA Finance", "MBA Finance", "CFA (Levels I–III)"],
    india: { salary: "₹5–20 LPA", path: "Commerce/finance degree + CFA or MBA",
      universities: ["SRCC (DU)", "IIMs", "NMIMS"], companies: ["Banks (HDFC/ICICI)", "Investment firms", "Big 4"] },
    global: { salary: "$70k–150k", path: "Finance degree + CFA/MBA",
      universities: ["Wharton", "LSE", "NYU Stern"], companies: ["Goldman Sachs", "JP Morgan", "BlackRock"] },
  },
  "Chartered Accountant": {
    skills: ["Accounting & audit", "Taxation", "Financial reporting", "Regulatory rigour"],
    courses: ["CA (Foundation → Intermediate → Final)", "B.Com alongside CA", "Optional: CS / CMA"],
    india: { salary: "₹7–25 LPA", path: "ICAI CA course (Foundation after Class 12) + articleship",
      universities: ["ICAI (professional body)", "Commerce colleges (parallel)", "—"], companies: ["Big 4 (Deloitte, EY, KPMG, PwC)", "Industry finance", "Own practice"] },
    global: { salary: "$60k–130k", path: "ACCA / CPA qualification",
      universities: ["ACCA (UK)", "AICPA (US)", "—"], companies: ["Big 4", "Corporates", "Own practice"] },
  },
  "Accountant / Auditor": {
    skills: ["Bookkeeping", "Tax & compliance", "Spreadsheet fluency", "Accuracy"],
    courses: ["B.Com", "M.Com / CMA", "Tally & GST certs"],
    india: { salary: "₹3–10 LPA", path: "B.Com → accounting roles or CMA/CA",
      universities: ["Commerce colleges", "SRCC / Christ", "IGNOU"], companies: ["Firms", "SMEs & corporates", "Audit practices"] },
    global: { salary: "$50k–90k", path: "Accounting degree + CPA (optional)",
      universities: ["Any accredited", "Business schools", "—"], companies: ["Firms", "Corporates", "Public sector"] },
  },
  "Operations Manager": {
    skills: ["Process & logistics", "Data-driven decisions", "Team leadership", "Vendor management"],
    courses: ["BBA/B.Tech + MBA Operations", "Six Sigma / supply-chain certs", "PMP (later)"],
    india: { salary: "₹5–20 LPA", path: "Engineering/business degree → MBA Ops or on-the-job growth",
      universities: ["IIM Mumbai (ex-NITIE)", "IIMs", "SPJIMR"], companies: ["Manufacturing (Tata, Mahindra)", "E-commerce (Amazon, Flipkart)", "Logistics"] },
    global: { salary: "$70k–140k", path: "Business/engineering degree + operations experience",
      universities: ["MIT Sloan", "Michigan Ross", "INSEAD"], companies: ["Amazon", "Manufacturing", "Logistics firms"] },
  },
  "AI / Machine Learning Engineer": {
    skills: ["Python & ML frameworks (PyTorch/TensorFlow)", "Maths: linear algebra & probability", "Data pipelines & MLOps", "Deep-learning fundamentals"],
    courses: ["B.Tech CS/AI + MS in ML", "B.Sc Maths/Stats → M.Sc Data Science", "Certs: DeepLearning.AI, fast.ai"],
    india: { salary: "₹8–45 LPA", path: "Strong CS/maths base (JEE → IIT/NIT, or a CS degree) + real ML projects",
      universities: ["IITs & IIITs", "IISc Bangalore", "BITS Pilani"], companies: ["Google / Microsoft India", "Fractal / Sarvam AI", "Nvidia / Qualcomm India"] },
    global: { salary: "$110k–250k", path: "CS/maths degree + ML portfolio; often an MS or PhD",
      universities: ["Stanford", "CMU", "MIT"], companies: ["OpenAI", "Google DeepMind", "Meta AI"] },
  },
  "Cybersecurity Analyst": {
    skills: ["Networking & operating systems", "Threat detection & incident response", "Security tools (SIEM, Wireshark)", "Ethical-hacking basics"],
    courses: ["B.Tech CS / IT (security electives)", "BCA + cybersecurity certs", "Certs: CompTIA Security+, CEH"],
    india: { salary: "₹5–25 LPA", path: "CS/IT degree + security certs and hands-on labs (TryHackMe / HTB)",
      universities: ["IITs", "IIIT Hyderabad", "VIT / Amity"], companies: ["Deloitte / PwC", "TCS / Wipro security", "Cisco / Palo Alto India"] },
    global: { salary: "$80k–160k", path: "IT/CS degree or certifications + practical labs",
      universities: ["Carnegie Mellon", "Georgia Tech", "Purdue"], companies: ["CrowdStrike", "Palo Alto Networks", "Mandiant"] },
  },
  "Digital Marketing Specialist": {
    skills: ["SEO & content marketing", "Paid ads (Google / Meta)", "Analytics (GA4)", "Social media & copywriting"],
    courses: ["BBA / BMS + digital-marketing certs", "Any degree + Google/Meta certifications", "Certs: Google Ads, HubSpot, Meta Blueprint"],
    india: { salary: "₹3–15 LPA", path: "Any degree + a portfolio of campaigns and certifications",
      universities: ["NMIMS", "Christ University", "IIMs (PG marketing)"], companies: ["Dentsu / GroupM", "Flipkart / Zomato", "Agencies & startups"] },
    global: { salary: "$45k–100k", path: "Marketing/comm degree or certs + measurable results",
      universities: ["Northwestern", "NYU", "UT Austin"], companies: ["Google", "HubSpot", "Ogilvy"] },
  },
  "Pharmacist": {
    skills: ["Pharmacology & drug interactions", "Dosage accuracy & attention to detail", "Patient counselling", "Regulatory & inventory knowledge"],
    courses: ["B.Pharm (4 years)", "D.Pharm → B.Pharm", "M.Pharm / Pharm.D to specialise"],
    india: { salary: "₹2.5–8 LPA", path: "B.Pharm via NEET / state pharmacy CET / CUET → register with the Pharmacy Council",
      universities: ["Jamia Hamdard", "NIPER", "Manipal (MCOPS)"], companies: ["Apollo / MedPlus", "Sun Pharma / Cipla", "Hospitals"] },
    global: { salary: "$60k–130k", path: "PharmD / pharmacy degree + licensure exam",
      universities: ["UCSF", "Univ. of Nottingham", "Monash"], companies: ["CVS / Walgreens", "Hospitals", "Pfizer / GSK"] },
  },
  "Journalist / Reporter": {
    skills: ["Strong writing & editing", "Research & fact-checking", "Interviewing", "Media ethics & storytelling"],
    courses: ["BA Journalism / Mass Communication", "BA English + a journalism diploma", "MA Journalism (IIMC, ACJ)"],
    india: { salary: "₹3–12 LPA", path: "BA Journalism/Mass Comm via CUET → internships and a clips portfolio",
      universities: ["IIMC Delhi", "ACJ Chennai", "Symbiosis (SIMC)"], companies: ["The Hindu / Indian Express", "NDTV / India Today", "The Ken / Scroll"] },
    global: { salary: "$40k–90k", path: "Journalism/communications degree + published clips",
      universities: ["Columbia Journalism", "Northwestern (Medill)", "City, Univ. of London"], companies: ["Reuters / AP", "BBC / NYT", "Bloomberg"] },
  },
};
