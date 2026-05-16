const DIGINOTE_CATEGORIES = [
  {
    category: "Bangladesh Studies",
    faculty: "Faculty of Arts and Social Sciences",
    departments: ["History", "Development Studies", "Sociology", "English", "Public Administration"],
    tags: "Bangladesh, History, Culture, HIS101",
  },
  {
    category: "Computer Science",
    faculty: "Faculty of Science and Technology",
    departments: ["Information and Communication Technology", "Computer Science and Engineering", "Software Engineering", "Data Science"],
    tags: "CSE, ICT, Programming, Technology",
  },
  {
    category: "Data Structures and Algorithms",
    faculty: "Faculty of Science and Technology",
    departments: ["Information and Communication Technology", "Computer Science and Engineering", "Software Engineering"],
    tags: "DSA, Algorithms, Data Structures, CSE301",
  },
  {
    category: "Database Systems",
    faculty: "Faculty of Science and Technology",
    departments: ["Information and Communication Technology", "Computer Science and Engineering", "Software Engineering"],
    tags: "Database, DBMS, SQL, CSE303",
  },
  {
    category: "Computer Networks",
    faculty: "Faculty of Science and Technology",
    departments: ["Information and Communication Technology", "Computer Science and Engineering", "Cyber Security"],
    tags: "Networks, TCP/IP, OSI, CSE401",
  },
  {
    category: "Cyber Security",
    faculty: "Faculty of Science and Technology",
    departments: ["Information and Communication Technology", "Computer Science and Engineering", "Cyber Security"],
    tags: "Cyber Security, Network Security, Ethical Hacking, ICT",
  },
  {
    category: "Artificial Intelligence",
    faculty: "Faculty of Science and Technology",
    departments: ["Information and Communication Technology", "Computer Science and Engineering", "Data Science"],
    tags: "AI, Machine Learning, Deep Learning, Data Science",
  },
  {
    category: "Web Development",
    faculty: "Faculty of Science and Technology",
    departments: ["Information and Communication Technology", "Computer Science and Engineering", "Software Engineering"],
    tags: "HTML, CSS, JavaScript, Web Development",
  },
  {
    category: "Mathematics",
    faculty: "Faculty of Science and Technology",
    departments: ["Mathematics", "Statistics", "Data Science"],
    tags: "Math, Calculus, Algebra, MATH101",
  },
  {
    category: "Calculus",
    faculty: "Faculty of Science and Technology",
    departments: ["Mathematics", "Statistics", "Engineering"],
    tags: "Calculus, Limits, Derivatives, Integration",
  },
  {
    category: "Statistics and Probability",
    faculty: "Faculty of Science and Technology",
    departments: ["Statistics", "Mathematics", "Data Science", "Economics"],
    tags: "Statistics, Probability, STAT201, Data",
  },
  {
    category: "Physics",
    faculty: "Faculty of Science and Technology",
    departments: ["Physics", "Applied Physics", "Engineering"],
    tags: "Physics, Motion, Mechanics, PHY101",
  },
  {
    category: "Thermodynamics",
    faculty: "Faculty of Engineering",
    departments: ["Mechanical Engineering", "Physics", "Industrial and Production Engineering"],
    tags: "Thermodynamics, Heat, Entropy, ME301",
  },
  {
    category: "Chemistry",
    faculty: "Faculty of Science and Technology",
    departments: ["Chemistry", "Biochemistry", "Pharmacy"],
    tags: "Chemistry, Lab, Science, CHEM",
  },
  {
    category: "Organic Chemistry",
    faculty: "Faculty of Science and Technology",
    departments: ["Chemistry", "Biochemistry", "Pharmacy"],
    tags: "Organic Chemistry, Reactions, CHEM201, Nomenclature",
  },
  {
    category: "Biology",
    faculty: "Faculty of Medical Studies",
    departments: ["Microbiology", "Public Health", "Biotechnology"],
    tags: "Biology, Microbiology, Health, Research",
  },
  {
    category: "Microbiology",
    faculty: "Faculty of Medical Studies",
    departments: ["Microbiology", "Public Health", "Biotechnology"],
    tags: "Microbiology, Bacteria, Virus, BIO202",
  },
  {
    category: "Public Health",
    faculty: "Faculty of Medical Studies",
    departments: ["Public Health", "Microbiology", "Community Medicine"],
    tags: "Public Health, Healthcare, Bangladesh, Policy",
  },
  {
    category: "Business",
    faculty: "Faculty of Business Studies",
    departments: ["Business Administration", "Finance and Banking", "Marketing", "Accounting", "Management"],
    tags: "Business, Management, Finance, Marketing",
  },
  {
    category: "Accounting",
    faculty: "Faculty of Business Studies",
    departments: ["Accounting", "Finance and Banking", "Business Administration"],
    tags: "Accounting, Financial Accounting, Balance Sheet, Business",
  },
  {
    category: "Finance and Banking",
    faculty: "Faculty of Business Studies",
    departments: ["Finance and Banking", "Business Administration", "Accounting"],
    tags: "Finance, Banking, Investment, Business",
  },
  {
    category: "Marketing",
    faculty: "Faculty of Business Studies",
    departments: ["Marketing", "Business Administration", "Management"],
    tags: "Marketing, Branding, Consumer Behavior, Business",
  },
  {
    category: "Economics",
    faculty: "Faculty of Business Studies",
    departments: ["Economics", "Finance and Banking", "Development Studies"],
    tags: "Economics, Microeconomics, Macroeconomics, ECO201",
  },
  {
    category: "International Relations",
    faculty: "Faculty of Security and Strategic Studies",
    departments: ["International Relations", "Peace, Conflict and Human Rights Studies", "Security Studies"],
    tags: "IR, Diplomacy, Security, Global Politics",
  },
  {
    category: "Peace and Conflict Studies",
    faculty: "Faculty of Security and Strategic Studies",
    departments: ["Peace, Conflict and Human Rights Studies", "International Relations", "Security Studies"],
    tags: "Peace, Conflict, Human Rights, Security",
  },
  {
    category: "Political Science",
    faculty: "Faculty of Security and Strategic Studies",
    departments: ["Political Science", "Public Administration", "Governance", "International Relations"],
    tags: "Politics, Government, Democracy, POL201",
  },
  {
    category: "Law",
    faculty: "Faculty of Law",
    departments: ["Law", "Legal Studies", "Human Rights Law"],
    tags: "Law, Constitution, Rights, Policy",
  },
  {
    category: "English Literature",
    faculty: "Faculty of Arts and Social Sciences",
    departments: ["English", "Literature", "Linguistics"],
    tags: "English, Literature, Essay, ENG201",
  },
  {
    category: "Sociology",
    faculty: "Faculty of Arts and Social Sciences",
    departments: ["Sociology", "Development Studies", "Public Administration"],
    tags: "Sociology, Society, Culture, Social Research",
  },
  {
    category: "Development Studies",
    faculty: "Faculty of Arts and Social Sciences",
    departments: ["Development Studies", "Economics", "Sociology"],
    tags: "Development, Bangladesh, SDG, Policy",
  },
  {
    category: "Agriculture",
    faculty: "Faculty of Agriculture",
    departments: ["Soil Science", "Agronomy", "Agricultural Economics", "Horticulture"],
    tags: "Agriculture, Soil, Farming, Bangladesh",
  },
  {
    category: "Soil Science",
    faculty: "Faculty of Agriculture",
    departments: ["Soil Science", "Agronomy", "Agricultural Economics"],
    tags: "Soil Science, Agriculture, AGR301, Farming",
  },
  {
    category: "Engineering",
    faculty: "Faculty of Engineering",
    departments: ["Mechanical Engineering", "Electrical and Electronic Engineering", "Civil Engineering", "Industrial and Production Engineering"],
    tags: "Engineering, EEE, ME, Civil, Circuits",
  },
  {
    category: "Digital Electronics",
    faculty: "Faculty of Engineering",
    departments: ["Electrical and Electronic Engineering", "Information and Communication Technology", "Computer Science and Engineering"],
    tags: "Digital Electronics, Logic Gates, EEE202, Circuits",
  },
  {
    category: "Research Methods",
    faculty: "General Education",
    departments: ["Research", "Statistics", "Development Studies", "Business Administration"],
    tags: "Research, Methodology, Thesis, Academic Writing",
  },
  {
    category: "Presentation and Viva",
    faculty: "General Education",
    departments: ["Academic Skills", "English", "Business Administration"],
    tags: "Presentation, Viva, Slides, Communication",
  },
  {
    category: "Exam Preparation",
    faculty: "General Education",
    departments: ["Academic Skills", "General Studies"],
    tags: "Exam, Suggestion, Question Bank, Study Guide",
  },
];

const DIGINOTE_FACULTIES = [
  "Faculty of Arts and Social Sciences",
  "Faculty of Business Studies",
  "Faculty of Science and Technology",
  "Faculty of Security and Strategic Studies",
  "Faculty of Medical Studies",
  "Faculty of Law",
  "Faculty of Engineering",
  "Faculty of Agriculture",
  "Faculty of General Studies",
  "Centre for Higher Studies and Research",
  "General Education",
  "School of Business",
  "School of Engineering",
  "School of Science",
  "School of Humanities and Social Sciences",
  "Institute of Information Technology",
  "Institute of Business Administration",
];

const DIGINOTE_UNIVERSITIES = [
  "Bangladesh University of Professionals",
  "University of Dhaka",
  "Bangladesh University of Engineering and Technology",
  "North South University",
  "BRAC University",
  "Jahangirnagar University",
  "Chittagong University",
  "Rajshahi University",
  "Khulna University",
  "Islamic University of Technology",
  "Military Institute of Science and Technology",
  "Ahsanullah University of Science and Technology",
  "East West University",
  "American International University-Bangladesh",
  "Independent University, Bangladesh",
  "Daffodil International University",
  "United International University",
  "Stamford University Bangladesh",
  "Sher-e-Bangla Agricultural University",
  "Bangladesh Agricultural University",
  "National University",
];


// Keep all suggestion lists alphabetical and allow admin-side edits in this browser.
const DIGINOTE_CATEGORY_STORAGE_KEY = "diginoteManagedCategories";

const sortTextAsc = (items = []) => {
  return [...new Set(items.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "en", {
      sensitivity: "base",
    })
  );
};

const sortCategoriesAsc = (items = []) => {
  return items
    .map((item) => ({
      ...item,
      departments: sortTextAsc(item.departments || []),
    }))
    .sort((a, b) =>
      a.category.localeCompare(b.category, "en", {
        sensitivity: "base",
      })
    );
};

DIGINOTE_CATEGORIES.sort((a, b) =>
  a.category.localeCompare(b.category, "en", {
    sensitivity: "base",
  })
);

DIGINOTE_CATEGORIES.forEach((item) => {
  item.departments = sortTextAsc(item.departments || []);
});

DIGINOTE_FACULTIES.sort((a, b) =>
  a.localeCompare(b, "en", {
    sensitivity: "base",
  })
);

DIGINOTE_UNIVERSITIES.sort((a, b) =>
  a.localeCompare(b, "en", {
    sensitivity: "base",
  })
);

const getManagedDigiNoteCategories = () => {
  try {
    const stored = localStorage.getItem(DIGINOTE_CATEGORY_STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);
      return sortCategoriesAsc(parsed);
    }
  } catch (error) {
    localStorage.removeItem(DIGINOTE_CATEGORY_STORAGE_KEY);
  }

  return sortCategoriesAsc(DIGINOTE_CATEGORIES);
};

const saveManagedDigiNoteCategories = (categories) => {
  localStorage.setItem(
    DIGINOTE_CATEGORY_STORAGE_KEY,
    JSON.stringify(sortCategoriesAsc(categories))
  );
};

const resetManagedDigiNoteCategories = () => {
  localStorage.removeItem(DIGINOTE_CATEGORY_STORAGE_KEY);
};

const getAllManagedDepartments = () => {
  return sortTextAsc(
    getManagedDigiNoteCategories().flatMap((item) => item.departments || [])
  );
};
