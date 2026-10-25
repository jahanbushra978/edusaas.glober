import { clsx } from "clsx"

import { twMerge } from "tailwind-merge"



export function cn(...inputs) {

  return twMerge(clsx(inputs))

} 





export const isIframe = typeof window !== 'undefined' && window.self !== window.top;



export const DEFAULT_LOGO = "/rahmania-logo-v2.png";

const PAGE_URL_MAP = {
  Home: "/",
  AdminLogin: "/admin",
  AdminDashboard: "/admin",
  AdminStudentDetail: "/AdminStudentDetail",
  AboutPage: "/about",
  MissionPage: "/mission",
  CampusPage: "/campus",
  AcademicsPage: "/academics",
  AdmissionPage: "/admission",
  AdmissionForm: "/admission-form",
  AdmissionChoicePage: "/admission-choice",
  GalleryPage: "/gallery",
  VideoGalleryPage: "/video-gallery",
  BranchGalleryPage: "/branch-gallery",
  TeachersPage: "/teachers",
  ResultsPage: "/results",
  AllNoticesPage: "/notices",
  NoticeDetailsPage: "/notice",
  StudentProfile: "/StudentProfile",
  TeacherProfile: "/TeacherProfile",
  TeacherDashboard: "/TeacherDashboard",
};

export const createPageUrl = (pageName) => {
  if (!pageName) return "/";
  if (pageName.startsWith("/")) return pageName;
  return PAGE_URL_MAP[pageName] || `/${pageName}`;
};


