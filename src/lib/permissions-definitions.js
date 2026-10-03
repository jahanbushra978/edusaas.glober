export const PERMISSION_MODULES = {
  analytics: {
    label: { en: "Dashboard", bn: "ড্যাশবোর্ড" },
    actions: [
      { key: "view", label: { en: "View Dashboard", bn: "ড্যাশবোর্ড দেখা" } },
    ],
  },
  students: {
    label: { en: "Students", bn: "শিক্ষার্থী" },
    actions: [
      { key: "view", label: { en: "View Students", bn: "শিক্ষার্থী দেখা" } },
      { key: "create", label: { en: "Add Student", bn: "শিক্ষার্থী যোগ" } },
      { key: "edit", label: { en: "Edit Student", bn: "শিক্ষার্থী সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Student", bn: "শিক্ষার্থী মুছে ফেলা" } },
      { key: "import", label: { en: "Import Students", bn: "শিক্ষার্থী ইম্পোর্ট" } },
      { key: "export", label: { en: "Export Students", bn: "শিক্ষার্থী এক্সপোর্ট" } },
      { key: "print", label: { en: "Print Students", bn: "শিক্ষার্থী প্রিন্ট" } },
      { key: "view_all_branches", label: { en: "View All Branches", bn: "সব শাখা দেখা" } },
      { key: "view_own_branch", label: { en: "View Only Own Branch", bn: "নিজ শাখা দেখা" } },
    ],
  },
  teachers: {
    label: { en: "Teachers", bn: "শিক্ষক" },
    actions: [
      { key: "view", label: { en: "View Teachers", bn: "শিক্ষক দেখা" } },
      { key: "create", label: { en: "Add Teacher", bn: "শিক্ষক যোগ" } },
      { key: "edit", label: { en: "Edit Teacher", bn: "শিক্ষক সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Teacher", bn: "শিক্ষক মুছে ফেলা" } },
      { key: "import", label: { en: "Import Teachers", bn: "শিক্ষক ইম্পোর্ট" } },
      { key: "export", label: { en: "Export Teachers", bn: "শিক্ষক এক্সপোর্ট" } },
      { key: "print", label: { en: "Print Teachers", bn: "শিক্ষক প্রিন্ট" } },
    ],
  },
  admissions: {
    label: { en: "Admissions", bn: "ভর্তি" },
    actions: [
      { key: "view", label: { en: "View Applications", bn: "আবেদন দেখা" } },
      { key: "approve", label: { en: "Approve Admission", bn: "ভর্তি অনুমোদন" } },
      { key: "reject", label: { en: "Reject Admission", bn: "ভর্তি বাতিল" } },
      { key: "export", label: { en: "Export Applications", bn: "আবেদন এক্সপোর্ট" } },
      { key: "print", label: { en: "Print Applications", bn: "আবেদন প্রিন্ট" } },
    ],
  },
  applications: {
    label: { en: "Applications & Approvals", bn: "আবেদন ও অনুমোদন" },
    actions: [
      { key: "view", label: { en: "View Applications", bn: "আবেদন দেখা" } },
      { key: "submit", label: { en: "Submit Application", bn: "আবেদন জমা দান" } },
      { key: "recommend", label: { en: "Recommend Application", bn: "আবেদন সুপারিশ" } },
      { key: "approve", label: { en: "Approve Application", bn: "আবেদন অনুমোদন" } },
      { key: "reject", label: { en: "Reject Application", bn: "আবেদন প্রত্যাখ্যান" } },
      { key: "cancel", label: { en: "Cancel Application", bn: "আবেদন বাতিল" } },
      { key: "export", label: { en: "Export Applications", bn: "আবেদন এক্সপোর্ট" } },
      { key: "print", label: { en: "Print Application PDF", bn: "আবেদন পিডিএফ প্রিন্ট" } },
    ],
  },
  "student-attendance": {
    label: { en: "Student Attendance", bn: "শিক্ষার্থীর উপস্থিতি" },
    actions: [
      { key: "view", label: { en: "View Attendance", bn: "উপস্থিতি দেখা" } },
      { key: "take", label: { en: "Take Attendance", bn: "উপস্থিতি নেওয়া" } },
      { key: "edit", label: { en: "Edit Attendance", bn: "উপস্থিতি সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Attendance", bn: "উপস্থিতি মুছে ফেলা" } },
      { key: "monthly_report", label: { en: "Monthly Report", bn: "মাসিক রিপোর্ট" } },
      { key: "export", label: { en: "Export Report", bn: "রিপোর্ট এক্সপোর্ট" } },
    ],
  },
  "teacher-attendance": {
    label: { en: "Teacher Attendance", bn: "শিক্ষকের উপস্থিতি" },
    actions: [
      { key: "view", label: { en: "View Attendance", bn: "উপস্থিতি দেখা" } },
      { key: "take", label: { en: "Take Attendance", bn: "উপস্থিতি নেওয়া" } },
      { key: "edit", label: { en: "Edit Attendance", bn: "উপস্থিতি সম্পাদনা" } },
      { key: "monthly_report", label: { en: "Monthly Report", bn: "মাসিক রিপোর্ট" } },
      { key: "export", label: { en: "Export Report", bn: "রিপোর্ট এক্সপোর্ট" } },
    ],
  },
  "biometric-attendance": {
    label: { en: "Biometric Attendance", bn: "বায়োমেট্রিক উপস্থিতি" },
    actions: [
      { key: "view", label: { en: "View Biometric", bn: "বায়োমেট্রিক দেখা" } },
      { key: "enroll", label: { en: "Enroll Biometric", bn: "বায়োমেট্রিক রেজিস্ট্রেশন" } },
      { key: "manage_devices", label: { en: "Manage Devices", bn: "ডিভাইস ব্যবস্থাপনা" } },
      { key: "manage_bridges", label: { en: "Manage Bridges", bn: "ব্রিজ ব্যবস্থাপনা" } },
      { key: "reports", label: { en: "Biometric Reports", bn: "বায়োমেট্রিক রিপোর্ট" } },
    ],
  },
  fees: {
    label: { en: "Fees & Finance", bn: "ফি ও ফাইন্যান্স" },
    actions: [
      { key: "view", label: { en: "View Fees", bn: "ফি দেখা" } },
      { key: "collect", label: { en: "Collect Fee", bn: "ফি আদায়" } },
      { key: "edit", label: { en: "Edit Fee Record", bn: "ফি সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Fee Record", bn: "ফি মুছে ফেলা" } },
      { key: "report", label: { en: "Financial Report", bn: "আর্থিক রিপোর্ট" } },
      { key: "export", label: { en: "Export Report", bn: "রিপোর্ট এক্সপোর্ট" } },
      { key: "print_receipt", label: { en: "Print Receipt", bn: "রসিদ প্রিন্ট" } },
      { key: "discount", label: { en: "Apply Discount", bn: "ছাড় প্রয়োগ" } },
    ],
  },
  hadiya: {
    label: { en: "Teacher Hadiya", bn: "শিক্ষক হাদিয়া" },
    actions: [
      { key: "view", label: { en: "View Hadiya", bn: "হাদিয়া দেখা" } },
      { key: "create", label: { en: "Add Payment", bn: "পেমেন্ট যোগ" } },
      { key: "edit", label: { en: "Edit Payment", bn: "পেমেন্ট সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Payment", bn: "পেমেন্ট মুছে ফেলা" } },
      { key: "report", label: { en: "Hadiya Report", bn: "হাদিয়া রিপোর্ট" } },
      { key: "export", label: { en: "Export Report", bn: "রিপোর্ট এক্সপোর্ট" } },
    ],
  },
  expenses: {
    label: { en: "Expenses", bn: "খরচ" },
    actions: [
      { key: "view", label: { en: "View Expenses", bn: "খরচ দেখা" } },
      { key: "create", label: { en: "Add Expense", bn: "খরচ যোগ" } },
      { key: "edit", label: { en: "Edit Expense", bn: "খরচ সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Expense", bn: "খরচ মুছে ফেলা" } },
      { key: "report", label: { en: "Expense Report", bn: "খরচ রিপোর্ট" } },
      { key: "export", label: { en: "Export Report", bn: "রিপোর্ট এক্সপোর্ট" } },
    ],
  },
  boarding: {
    label: { en: "Boarding", bn: "বোর্ডিং" },
    actions: [
      { key: "view", label: { en: "View Boarding", bn: "বোর্ডিং দেখা" } },
      { key: "manage_students", label: { en: "Manage Boarders", bn: "বোর্ডার ব্যবস্থাপনা" } },
      { key: "daily_report", label: { en: "Daily Report", bn: "দৈনিক রিপোর্ট" } },
      { key: "expenses", label: { en: "Manage Expenses", bn: "খরচ ব্যবস্থাপনা" } },
      { key: "report", label: { en: "Boarding Report", bn: "বোর্ডিং রিপোর্ট" } },
    ],
  },
  "academic-structure": {
    label: { en: "Academic Structure", bn: "একাডেমিক স্ট্রাকচার" },
    actions: [
      { key: "view", label: { en: "View Academic Structure", bn: "স্ট্রাকচার দেখা" } },
      { key: "manage_own_branch", label: { en: "Manage Only Own Branch", bn: "নিজ শাখা ব্যবস্থাপনা" } },
      { key: "manage_all_branches", label: { en: "Manage All Branches", bn: "সব শাখা ব্যবস্থাপনা" } },
      { key: "add_class", label: { en: "Add Class", bn: "শ্রেণী যোগ" } },
      { key: "edit_class", label: { en: "Edit Class", bn: "শ্রেণী সম্পাদনা" } },
      { key: "delete_class", label: { en: "Delete Class", bn: "শ্রেণী মুছে ফেলা" } },
      { key: "add_subject", label: { en: "Add Subject", bn: "বিষয় যোগ" } },
      { key: "edit_subject", label: { en: "Edit Subject", bn: "বিষয় সম্পাদনা" } },
      { key: "delete_subject", label: { en: "Delete Subject", bn: "বিষয় মুছে ফেলা" } },
      { key: "add_section", label: { en: "Add Section", bn: "সেকশন যোগ" } },
      { key: "edit_section", label: { en: "Edit Section", bn: "সেকশন সম্পাদনা" } },
      { key: "delete_section", label: { en: "Delete Section", bn: "সেকশন মুছে ফেলা" } },
    ],
  },
  exams: {
    label: { en: "Exams", bn: "পরীক্ষা" },
    actions: [
      { key: "view", label: { en: "View Exams", bn: "পরীক্ষা দেখা" } },
      { key: "create", label: { en: "Create Exam", bn: "পরীক্ষা তৈরি" } },
      { key: "edit", label: { en: "Edit Exam", bn: "পরীক্ষা সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Exam", bn: "পরীক্ষা মুছে ফেলা" } },
      { key: "publish_result", label: { en: "Publish Result", bn: "ফলাফল প্রকাশ" } },
      { key: "print_result", label: { en: "Print Result", bn: "ফলাফল প্রিন্ট" } },
      { key: "manage_own_branch", label: { en: "Manage Own Branch", bn: "নিজ শাখা ব্যবস্থাপনা" } },
      { key: "manage_all_branches", label: { en: "Manage All Branches", bn: "সব শাখা ব্যবস্থাপনা" } },
    ],
  },
  results: {
    label: { en: "Results", bn: "ফলাফল" },
    actions: [
      { key: "view", label: { en: "View Results", bn: "ফলাফল দেখা" } },
      { key: "publish", label: { en: "Publish Result", bn: "ফলাফল প্রকাশ" } },
      { key: "edit", label: { en: "Edit Result", bn: "ফলাফল সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Result", bn: "ফলাফল মুছে ফেলা" } },
      { key: "print", label: { en: "Print Result", bn: "ফলাফল প্রিন্ট" } },
      { key: "export", label: { en: "Export Result", bn: "ফলাফল এক্সপোর্ট" } },
    ],
  },
  routine: {
    label: { en: "Routine", bn: "রুটিন" },
    actions: [
      { key: "view", label: { en: "View Routine", bn: "রুটিন দেখা" } },
      { key: "create", label: { en: "Create Routine", bn: "রুটিন তৈরি" } },
      { key: "edit", label: { en: "Edit Routine", bn: "রুটিন সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Routine", bn: "রুটিন মুছে ফেলা" } },
      { key: "print", label: { en: "Print Routine", bn: "রুটিন প্রিন্ট" } },
    ],
  },
  notices: {
    label: { en: "Notices", bn: "নোটিশ" },
    actions: [
      { key: "view", label: { en: "View Notices", bn: "নোটিশ দেখা" } },
      { key: "create", label: { en: "Add Notice", bn: "নোটিশ যোগ" } },
      { key: "edit", label: { en: "Edit Notice", bn: "নোটিশ সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Notice", bn: "নোটিশ মুছে ফেলা" } },
      { key: "publish", label: { en: "Publish Notice", bn: "নোটিশ প্রকাশ" } },
    ],
  },
  gallery: {
    label: { en: "Gallery", bn: "গ্যালারি" },
    actions: [
      { key: "view", label: { en: "View Gallery", bn: "গ্যালারি দেখা" } },
      { key: "upload", label: { en: "Upload Images", bn: "ছবি আপলোড" } },
      { key: "edit", label: { en: "Edit Gallery", bn: "গ্যালারি সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Images", bn: "ছবি মুছে ফেলা" } },
      { key: "manage_categories", label: { en: "Manage Categories", bn: "ক্যাটাগরি ব্যবস্থাপনা" } },
    ],
  },
  videos: {
    label: { en: "Video Gallery", bn: "ভিডিও গ্যালারি" },
    actions: [
      { key: "view", label: { en: "View Videos", bn: "ভিডিও দেখা" } },
      { key: "upload", label: { en: "Add Video", bn: "ভিডিও যোগ" } },
      { key: "edit", label: { en: "Edit Video", bn: "ভিডিও সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Video", bn: "ভিডিও মুছে ফেলা" } },
      { key: "manage_categories", label: { en: "Manage Categories", bn: "ক্যাটাগরি ব্যবস্থাপনা" } },
    ],
  },
  "website-content": {
    label: { en: "Website Content", bn: "ওয়েবসাইট কন্টেন্ট" },
    actions: [
      { key: "view", label: { en: "View Content", bn: "কন্টেন্ট দেখা" } },
      { key: "edit", label: { en: "Edit Content", bn: "কন্টেন্ট সম্পাদনা" } },
      { key: "manage_pages", label: { en: "Manage Pages", bn: "পেজ ব্যবস্থাপনা" } },
      { key: "manage_navbar", label: { en: "Manage Navbar", bn: "নেভবার ব্যবস্থাপনা" } },
      { key: "manage_hero", label: { en: "Manage Hero Slider", bn: "হিরো স্লাইডার ব্যবস্থাপনা" } },
    ],
  },
  events: {
    label: { en: "Events", bn: "ইভেন্ট" },
    actions: [
      { key: "view", label: { en: "View Events", bn: "ইভেন্ট দেখা" } },
      { key: "create", label: { en: "Add Event", bn: "ইভেন্ট যোগ" } },
      { key: "edit", label: { en: "Edit Event", bn: "ইভেন্ট সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Event", bn: "ইভেন্ট মুছে ফেলা" } },
      { key: "publish", label: { en: "Publish Event", bn: "ইভেন্ট প্রকাশ" } },
    ],
  },
  library: {
    label: { en: "Library", bn: "লাইব্রেরি" },
    actions: [
      { key: "view", label: { en: "View Library", bn: "লাইব্রেরি দেখা" } },
      { key: "add_book", label: { en: "Add Book", bn: "বই যোগ" } },
      { key: "edit_book", label: { en: "Edit Book", bn: "বই সম্পাদনা" } },
      { key: "delete_book", label: { en: "Delete Book", bn: "বই মুছে ফেলা" } },
      { key: "issue_book", label: { en: "Issue Book", bn: "বই ইস্যু" } },
      { key: "return_book", label: { en: "Return Book", bn: "বই রিটার্ন" } },
    ],
  },
  certificates: {
    label: { en: "Certificates", bn: "সার্টিফিকেট" },
    actions: [
      { key: "view", label: { en: "View Certificates", bn: "সার্টিফিকেট দেখা" } },
      { key: "generate", label: { en: "Generate Certificate", bn: "সার্টিফিকেট তৈরি" } },
      { key: "print", label: { en: "Print Certificate", bn: "সার্টিফিকেট প্রিন্ট" } },
      { key: "customize", label: { en: "Customize Template", bn: "টেমপ্লেট কাস্টমাইজ" } },
    ],
  },
  reports: {
    label: { en: "Reports", bn: "রিপোর্ট" },
    actions: [
      { key: "view", label: { en: "View Reports", bn: "রিপোর্ট দেখা" } },
      { key: "generate", label: { en: "Generate Report", bn: "রিপোর্ট তৈরি" } },
      { key: "export", label: { en: "Export Report", bn: "রিপোর্ট এক্সপোর্ট" } },
      { key: "print", label: { en: "Print Report", bn: "রিপোর্ট প্রিন্ট" } },
    ],
  },
  settings: {
    label: { en: "Settings", bn: "সেটিংস" },
    actions: [
      { key: "view", label: { en: "View Settings", bn: "সেটিংস দেখা" } },
      { key: "edit", label: { en: "Edit Settings", bn: "সেটিংস সম্পাদনা" } },
      { key: "manage_system", label: { en: "Manage System", bn: "সিস্টেম ব্যবস্থাপনা" } },
    ],
  },
  "branch-management": {
    label: { en: "Branch Management", bn: "শাখা ব্যবস্থাপনা" },
    actions: [
      { key: "view", label: { en: "View Branches", bn: "শাখা দেখা" } },
      { key: "create", label: { en: "Add Branch", bn: "শাখা যোগ" } },
      { key: "edit", label: { en: "Edit Branch", bn: "শাখা সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Branch", bn: "শাখা মুছে ফেলা" } },
      { key: "manage_admins", label: { en: "Manage Admins", bn: "অ্যাডমিন ব্যবস্থাপনা" } },
      { key: "manage_permissions", label: { en: "Manage Permissions", bn: "পারমিশন ব্যবস্থাপনা" } },
    ],
  },
  promotion: {
    label: { en: "Promotion", bn: "প্রমোশন" },
    actions: [
      { key: "view", label: { en: "View Promotions", bn: "প্রমোশন দেখা" } },
      { key: "promote", label: { en: "Execute Promotion", bn: "প্রমোশন সম্পাদন" } },
      { key: "rollback", label: { en: "Rollback Promotion", bn: "প্রমোশন রোলব্যাক" } },
      { key: "generate_certificates", label: { en: "Generate Certificates", bn: "সার্টিফিকেট তৈরি" } },
    ],
  },
  messages: {
    label: { en: "Contact Messages", bn: "বার্তা" },
    actions: [
      { key: "view", label: { en: "View Messages", bn: "বার্তা দেখা" } },
      { key: "reply", label: { en: "Reply Message", bn: "বার্তার জবাব" } },
      { key: "delete", label: { en: "Delete Message", bn: "বার্তা মুছে ফেলা" } },
    ],
  },
  "daily-lesson-tracker": {
    label: { en: "Quran Tracker", bn: "কুরআন ট্র্যাকার" },
    actions: [
      { key: "view", label: { en: "View Tracker", bn: "ট্র্যাকার দেখা" } },
      { key: "add", label: { en: "Add Lesson", bn: "লেসন যোগ" } },
      { key: "edit", label: { en: "Edit Lesson", bn: "লেসন সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Lesson", bn: "লেসন মুছে ফেলা" } },
      { key: "report", label: { en: "Progress Report", bn: "অগ্রগতি রিপোর্ট" } },
    ],
  },
  testimonials: {
    label: { en: "Testimonials", bn: "সুপারিশ" },
    actions: [
      { key: "view", label: { en: "View Testimonials", bn: "দেখা" } },
      { key: "create", label: { en: "Add Testimonial", bn: "যোগ" } },
      { key: "edit", label: { en: "Edit Testimonial", bn: "সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Testimonial", bn: "মুছে ফেলা" } },
    ],
  },
  "success-stories": {
    label: { en: "Success Stories", bn: "সাফল্যের গল্প" },
    actions: [
      { key: "view", label: { en: "View Stories", bn: "দেখা" } },
      { key: "create", label: { en: "Add Story", bn: "যোগ" } },
      { key: "edit", label: { en: "Edit Story", bn: "সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Story", bn: "মুছে ফেলা" } },
    ],
  },
  sponsors: {
    label: { en: "Sponsors", bn: "স্পন্সর" },
    actions: [
      { key: "view", label: { en: "View Sponsors", bn: "দেখা" } },
      { key: "create", label: { en: "Add Sponsor", bn: "যোগ" } },
      { key: "edit", label: { en: "Edit Sponsor", bn: "সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Sponsor", bn: "মুছে ফেলা" } },
    ],
  },
  blogs: {
    label: { en: "Blogs", bn: "ব্লগ" },
    actions: [
      { key: "view", label: { en: "View Blogs", bn: "দেখা" } },
      { key: "create", label: { en: "Add Blog", bn: "যোগ" } },
      { key: "edit", label: { en: "Edit Blog", bn: "সম্পাদনা" } },
      { key: "delete", label: { en: "Delete Blog", bn: "মুছে ফেলা" } },
      { key: "publish", label: { en: "Publish Blog", bn: "প্রকাশ" } },
    ],
  },
  faqs: {
    label: { en: "FAQs", bn: "FAQ" },
    actions: [
      { key: "view", label: { en: "View FAQs", bn: "দেখা" } },
      { key: "create", label: { en: "Add FAQ", bn: "যোগ" } },
      { key: "edit", label: { en: "Edit FAQ", bn: "সম্পাদনা" } },
      { key: "delete", label: { en: "Delete FAQ", bn: "মুছে ফেলা" } },
    ],
  },
  "contact-info": {
    label: { en: "Contact Info", bn: "যোগাযোগের তথ্য" },
    actions: [
      { key: "view", label: { en: "View Info", bn: "দেখা" } },
      { key: "edit", label: { en: "Edit Info", bn: "সম্পাদনা" } },
    ],
  },
  "data-mgmt": {
    label: { en: "Data Management", bn: "ডেটা ম্যানেজমেন্ট" },
    actions: [
      { key: "view", label: { en: "View Data", bn: "ডেটা দেখা" } },
      { key: "export", label: { en: "Export Data", bn: "ডেটা এক্সপোর্ট" } },
      { key: "delete_data", label: { en: "Delete Data", bn: "ডেটা মুছে ফেলা" } },
    ],
  },
  period: {
    label: { en: "Accounting Period", bn: "হিসাব কাল" },
    actions: [
      { key: "view", label: { en: "View Periods", bn: "দেখা" } },
      { key: "manage", label: { en: "Manage Periods", bn: "ব্যবস্থাপনা" } },
    ],
  },
};

export function getDefaultPermissions() {
  const perms = {};
  for (const [modKey, mod] of Object.entries(PERMISSION_MODULES)) {
    perms[modKey] = {};
    for (const act of mod.actions) {
      perms[modKey][act.key] = false;
    }
  }
  return perms;
}

export function permissionsToArray(permissions) {
  const arr = [];
  for (const [modKey, actions] of Object.entries(permissions)) {
    let allGranted = true;
    let anyGranted = false;
    for (const [actKey, granted] of Object.entries(actions)) {
      if (granted) {
        arr.push(`${modKey}:${actKey}`);
        anyGranted = true;
      } else {
        allGranted = false;
      }
    }
    if (anyGranted && allGranted) {
      arr.push(modKey);
    }
  }
  return arr;
}

export function arrayToPermissions(arr) {
  const perms = getDefaultPermissions();
  if (!Array.isArray(arr)) return perms;
  for (const entry of arr) {
    if (entry.includes(":")) {
      const [mod, act] = entry.split(":", 2);
      if (perms[mod] && act in perms[mod]) {
        perms[mod][act] = true;
      }
    } else if (perms[entry]) {
      for (const k of Object.keys(perms[entry])) {
        perms[entry][k] = true;
      }
    }
  }
  return perms;
}

// ── Application Management System permissions ───────────────────
export const APPLICATION_TYPES_LIST = [
  { value: "leave",               label: { en: "Leave Application",      bn: "ছুটির আবেদন" } },
  { value: "home_leave",          label: { en: "Home Leave",             bn: "বাড়ি যাওয়ার ছুটি" } },
  { value: "late_entry",          label: { en: "Late Entry Permission",  bn: "দেরিতে প্রবেশ" } },
  { value: "early_leave",         label: { en: "Early Leave",            bn: "আগেভাগে যাওয়া" } },
  { value: "certificate",         label: { en: "Certificate Request",    bn: "সনদ আবেদন" } },
  { value: "character_certificate", label: { en: "Character Certificate", bn: "চারিত্রিক সনদ" } },
  { value: "transfer_certificate",  label: { en: "Transfer Certificate",  bn: "ট্রান্সফার সনদ" } },
  { value: "fee_waiver",          label: { en: "Fee Waiver",             bn: "ফি মওকুফ" } },
  { value: "hostel_permission",   label: { en: "Hostel Permission",      bn: "হোস্টেল অনুমতি" } },
  { value: "exam_permission",     label: { en: "Exam Permission",        bn: "পরীক্ষার অনুমতি" } },
  { value: "other",               label: { en: "Other / Custom Application", bn: "অন্যান্য আবেদন" } },
];

export const APPLICATION_STATUS_CONFIG = {
  draft:        { label: "Draft",        bn: "খসড়া",       color: "#64748b", bg: "#f1f5f9" },
  submitted:    { label: "Submitted",    bn: "দাখিল",       color: "#2563eb", bg: "#eff6ff" },
  under_review: { label: "Under Review", bn: "পর্যালোচনাধীন", color: "#d97706", bg: "#fffbeb" },
  recommended:  { label: "Recommended", bn: "সুপারিশকৃত",  color: "#7c3aed", bg: "#f5f3ff" },
  approved:     { label: "Approved",     bn: "অনুমোদিত",    color: "#16a34a", bg: "#f0fdf4" },
  rejected:     { label: "Rejected",     bn: "প্রত্যাখ্যাত", color: "#dc2626", bg: "#fef2f2" },
  cancelled:    { label: "Cancelled",    bn: "বাতিল",       color: "#9ca3af", bg: "#f9fafb" },
};

export const APPLICATION_PRIORITY_CONFIG = {
  normal: { label: "Normal", bn: "সাধারণ", color: "#64748b" },
  urgent: { label: "Urgent", bn: "জরুরি",  color: "#dc2626" },
};
