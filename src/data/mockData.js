export const mockUsers = {
  student: {
    name: "John Student",
    email: "student@dsce.edu.in",
    role: "student",
    department: "ISE",
    semester: 4,
    gender: "Male",
    admissionYear: "2021",
    rollNo: "001",
    USN: "1DS22IS001"
  },
  staff: {
    name: "Prof. Sharma",
    email: "sharma@dsce.edu.in",
    role: "staff",
    department: "ISE",
    gender: "Female",
    staffId: "ST001"
  },
  admin: {
    name: "Admin",
    email: "admin@dsce.edu.in",
    role: "superadmin",
    gender: "Other",
    adminId: "SA001"
  }
};

export const mockOpenElectives = [
  // CSE DEPARTMENT
  { id: 'cse1', code: "CS401", title: "Machine Learning", department: "CSE", maxSeats: 30, filledSeats: 18 },
  { id: 'cse2', code: "CS402", title: "Cloud Computing & DevOps", department: "CSE", maxSeats: 30, filledSeats: 26 },
  { id: 'cse3', code: "CS403", title: "Blockchain Technology", department: "CSE", maxSeats: 25, filledSeats: 12 },
  { id: 'cse4', code: "CS404", title: "Cybersecurity & Ethical Hacking", department: "CSE", maxSeats: 25, filledSeats: 22 },
  { id: 'cse5', code: "CS405", title: "Full Stack Web Development", department: "CSE", maxSeats: 30, filledSeats: 28 },

  // ECE DEPARTMENT
  { id: 'ece1', code: "EC401", title: "Internet of Things (IoT)", department: "ECE", maxSeats: 25, filledSeats: 15 },
  { id: 'ece2', code: "EC402", title: "VLSI Design", department: "ECE", maxSeats: 25, filledSeats: 20 },
  { id: 'ece3', code: "EC403", title: "Embedded Systems", department: "ECE", maxSeats: 25, filledSeats: 12 },
  { id: 'ece4', code: "EC404", title: "5G & Wireless Communication", department: "ECE", maxSeats: 20, filledSeats: 18 },
  { id: 'ece5', code: "EC405", title: "Robotics & Automation", department: "ECE", maxSeats: 20, filledSeats: 14 },

  // ISE DEPARTMENT
  { id: 'ise1', code: "IS401", title: "Artificial Intelligence", department: "ISE", maxSeats: 30, filledSeats: 22 },
  { id: 'ise2', code: "IS402", title: "Data Science & Analytics", department: "ISE", maxSeats: 30, filledSeats: 27 },
  { id: 'ise3', code: "IS403", title: "Natural Language Processing", department: "ISE", maxSeats: 25, filledSeats: 18 },
  { id: 'ise4', code: "IS404", title: "AR/VR Development", department: "ISE", maxSeats: 20, filledSeats: 8 },
  { id: 'ise5', code: "IS405", title: "DevOps & CI/CD", department: "ISE", maxSeats: 25, filledSeats: 21 },

  // MECH DEPARTMENT
  { id: 'mech1', code: "ME401", title: "Additive Manufacturing (3D Printing)", department: "MECH", maxSeats: 20, filledSeats: 6 },
  { id: 'mech2', code: "ME402", title: "Electric Vehicle Technology", department: "MECH", maxSeats: 20, filledSeats: 17 },
  { id: 'mech3', code: "ME403", title: "Industrial Automation", department: "MECH", maxSeats: 20, filledSeats: 12 },
  { id: 'mech4', code: "ME404", title: "Renewable Energy Systems", department: "MECH", maxSeats: 20, filledSeats: 15 },
  { id: 'mech5', code: "ME405", title: "CAD/CAM & Simulation", department: "MECH", maxSeats: 20, filledSeats: 18 },

  // CIVIL DEPARTMENT
  { id: 'civil1', code: "CV401", title: "Smart Infrastructure", department: "CIVIL", maxSeats: 20, filledSeats: 10 },
  { id: 'civil2', code: "CV402", title: "GIS & Remote Sensing", department: "CIVIL", maxSeats: 20, filledSeats: 14 },
  { id: 'civil3', code: "CV403", title: "Sustainable Construction", department: "CIVIL", maxSeats: 20, filledSeats: 16 },
  { id: 'civil4', code: "CV404", title: "Earthquake Engineering", department: "CIVIL", maxSeats: 15, filledSeats: 14 },
  { id: 'civil5', code: "CV405", title: "Urban Planning & Design", department: "CIVIL", maxSeats: 15, filledSeats: 9 },

  // MBA DEPARTMENT
  { id: 'mba1', code: "MB401", title: "Business Analytics", department: "MBA", maxSeats: 25, filledSeats: 15 },
  { id: 'mba2', code: "MB402", title: "Digital Marketing", department: "MBA", maxSeats: 25, filledSeats: 23 },
  { id: 'mba3', code: "MB403", title: "Entrepreneurship & Startups", department: "MBA", maxSeats: 20, filledSeats: 11 },
  { id: 'mba4', code: "MB404", title: "Financial Technology (FinTech)", department: "MBA", maxSeats: 20, filledSeats: 18 },
  { id: 'mba5', code: "MB405", title: "Supply Chain Management", department: "MBA", maxSeats: 20, filledSeats: 14 },

  // EEE DEPARTMENT
  { id: 'eee1', code: "EE401", title: "Solar Energy Systems", department: "EEE", maxSeats: 20, filledSeats: 18 },
  { id: 'eee2', code: "EE402", title: "Smart Grid Technology", department: "EEE", maxSeats: 20, filledSeats: 10 },
  { id: 'eee3', code: "EE403", title: "Power Electronics", department: "EEE", maxSeats: 20, filledSeats: 16 },
  { id: 'eee4', code: "EE404", title: "Electric Drives & Control", department: "EEE", maxSeats: 15, filledSeats: 12 },

  // BIO TECHNOLOGY
  { id: 'bt1', code: "BT401", title: "Bioinformatics", department: "BIO TECHNOLOGY", maxSeats: 15, filledSeats: 14 },
  { id: 'bt2', code: "BT402", title: "Genetic Engineering", department: "BIO TECHNOLOGY", maxSeats: 15, filledSeats: 8 },
  { id: 'bt3', code: "BT403", title: "Medical Biotechnology", department: "BIO TECHNOLOGY", maxSeats: 15, filledSeats: 11 }
];

export const mockDeptElectives = {
  theory: [
    { id: 'dt1', code: "CS601", title: "Machine Learning Applications", credits: 3, description: "Advanced algorithms and practical implementation of ML models.", isPopular: true },
    { id: 'dt2', code: "CS602", title: "Cloud Computing & DevOps", credits: 3, description: "Infrastructure as code, CI/CD, and scalable cloud architectures." },
    { id: 'dt3', code: "CS603", title: "Natural Language Processing", credits: 3, description: "Computational linguistics, sentiment analysis, and LLM foundations." },
    { id: 'dt4', code: "CS604", title: "Data Science & Big Data Analytics", credits: 3, description: "Handling large datasets with Spark, Hadoop and data visualization." },
    { id: 'dt5', code: "CS605", title: "Cybersecurity & Ethical Hacking", credits: 3, description: "Network security, penetration testing, and digital forensics." },
    { id: 'dt6', code: "CS606", title: "Artificial Intelligence Systems", credits: 3, description: "Deep learning, expert systems, and intelligent agent design.", isPopular: true },
    { id: 'dt7', code: "CS607", title: "Blockchain & Web3 Technologies", credits: 3, description: "Smart contracts, Ethereum, and decentralized application development." }
  ],
  lab: [
    { id: 'dl1', code: "CSL61", title: "Machine Learning Lab", credits: 1 },
    { id: 'dl2', code: "CSL62", title: "Cloud & DevOps Lab", credits: 1 },
    { id: 'dl3', code: "CSL63", title: "NLP Lab", credits: 1 },
    { id: 'dl4', code: "CSL64", title: "Cybersecurity Lab", credits: 1 },
    { id: 'dl5', code: "CSL65", title: "Data Analytics Lab", credits: 1 },
    { id: 'dl6', code: "CSL66", title: "Full Stack Development Lab", credits: 1 },
    { id: 'dl7', code: "CSL67", title: "AI & Deep Learning Lab", credits: 1 }
  ]
};

export const mockStaffStats = {
  totalStudents: 180,
  selected: 120,
  notSelected: 60,
  seatsFilledPercent: 85
};

// Generate 180 mock students
const generateMockStudents = () => {
  const depts = ["CSE", "ISE", "ECE", "MECH", "CIVIL", "MBA", "EEE"];
  const names = ["Abhishek", "Bhavana", "Chetan", "Deepa", "Eshwar", "Farzana", "Girish", "Harshitha", "Imran", "Jyothi", "Kiran", "Lakshmi", "Manoj", "Nethra", "Omkar", "Pooja", "Rahul", "Swathi", "Tarun", "Varshini"];
  const students = [];

  for (let i = 1; i <= 180; i++) {
    const dept = depts[i % depts.length];
    const deptCode = dept.slice(0, 2);
    const usn = `1DS22${deptCode}${String(i).padStart(3, '0')}`;
    const hasSelected = i <= 120;
    
    // Find a subject from the same or different dept
    const subject = hasSelected ? mockOpenElectives[i % mockOpenElectives.length] : null;

    students.push({
      id: i,
      usn,
      name: `${names[i % names.length]} ${String.fromCharCode(65 + (i % 26))}`,
      department: dept,
      semester: 4,
      selectedSubject: subject ? subject.title : "Not Selected",
      subjectCode: subject ? subject.code : "-",
      selectionDate: hasSelected ? `2026-04-${String((i % 10) + 1).padStart(2, '0')}` : "-",
      status: hasSelected ? "Confirmed" : "Pending"
    });
  }
  return students;
};

export const mockStudents = generateMockStudents();
