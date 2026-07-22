import dynamic from 'next/dynamic';
import __Layout from './Layout.jsx';

const AdminDashboard = dynamic(() => import('./src/features/site/pages/AdminDashboard'), { ssr: true });
const AdminLogin = dynamic(() => import('./src/features/site/pages/AdminLogin'), { ssr: true });
const AdminStudentDetail = dynamic(() => import('./src/features/site/pages/AdminStudentDetail'), { ssr: true });
const Home = dynamic(() => import('./src/features/site/pages/Home'), { ssr: true });
const StudentLogin = dynamic(() => import('./src/features/site/pages/StudentLogin'), { ssr: true });
const StudentProfile = dynamic(() => import('./src/features/site/pages/StudentProfile'), { ssr: true });
const TeacherDashboard = dynamic(() => import('./src/features/site/pages/TeacherDashboard'), { ssr: true });
const TeacherLogin = dynamic(() => import('./src/features/site/pages/TeacherLogin'), { ssr: true });
const TeacherProfile = dynamic(() => import('./src/features/site/pages/TeacherProfile'), { ssr: true });
const AboutPage = dynamic(() => import('./src/features/site/pages/AboutPage'), { ssr: true });
const CampusPage = dynamic(() => import('./src/features/site/pages/CampusPage'), { ssr: true });
const AcademicsPage = dynamic(() => import('./src/features/site/pages/AcademicsPage'), { ssr: true });
const AdmissionPage = dynamic(() => import('./src/features/site/pages/AdmissionPage'), { ssr: true });
const AdmissionChoicePage = dynamic(() => import('./src/features/site/pages/AdmissionChoicePage'), { ssr: true });
const NoticeDetailsPage = dynamic(() => import('./src/features/site/pages/NoticeDetailsPage'), { ssr: true });
const AllNoticesPage = dynamic(() => import('./src/features/site/pages/AllNoticesPage'), { ssr: true });
const MissionPage = dynamic(() => import('./src/features/site/pages/MissionPage'), { ssr: true });
const ResultsPage = dynamic(() => import('./src/features/site/pages/ResultsPage'), { ssr: true });
const GalleryPage = dynamic(() => import('./src/features/site/pages/GalleryPage'), { ssr: true });
const VideoGalleryPage = dynamic(() => import('./src/features/site/pages/VideoGalleryPage'), { ssr: true });
const BranchGalleryPage = dynamic(() => import('./src/features/site/pages/BranchGalleryPage'), { ssr: true });


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AdminLogin": AdminLogin,
    "AdminStudentDetail": AdminStudentDetail,
    "Home": Home,
    "StudentLogin": StudentLogin,
    "StudentProfile": StudentProfile,
    "TeacherDashboard": TeacherDashboard,
    "TeacherLogin": TeacherLogin,
    "TeacherProfile": TeacherProfile,
    "AboutPage": AboutPage,
    "CampusPage": CampusPage,
    "AcademicsPage": AcademicsPage,
    "AdmissionPage": AdmissionPage,
    "AdmissionChoicePage": AdmissionChoicePage,
    "NoticeDetailsPage": NoticeDetailsPage,
    "AllNoticesPage": AllNoticesPage,
    "MissionPage": MissionPage,
    "ResultsPage": ResultsPage,
    "GalleryPage": GalleryPage,
    "VideoGalleryPage": VideoGalleryPage,
    "BranchGalleryPage": BranchGalleryPage,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
