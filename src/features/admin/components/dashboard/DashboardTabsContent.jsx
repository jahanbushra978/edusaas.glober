"use client";

import React from "react";
import dynamic from "next/dynamic";
import { TabsContent } from "@/components/ui/tabs";
import AnalyticsTab from "./AnalyticsTab";

function AdminPanelSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="h-64 bg-gray-100 rounded" />
    </div>
  );
}

const lazyPanel = (loader) => dynamic(loader, {
  loading: () => <AdminPanelSkeleton />,
  ssr: false,
});

const BrandingSettings = lazyPanel(() => import("@/components/admin/BrandingSettings"));
const NoticeManager = lazyPanel(() => import("@/components/admin/NoticeManager"));
const StudentAttendanceManager = lazyPanel(() => import("@/components/admin/StudentAttendanceManager"));
const TeacherAttendanceManager = lazyPanel(() => import("@/components/admin/TeacherAttendanceManager"));
const DailyLessonTracker = lazyPanel(() => import("@/components/admin/DailyLessonTracker"));
const TeacherManager = lazyPanel(() => import("@/components/admin/TeacherManager"));
const StudentFees = lazyPanel(() => import("@/components/admin/StudentFees"));
const HadiyaForm = lazyPanel(() => import("@/components/admin/HadiyaForm"));
const BoardingManager = lazyPanel(() => import("@/components/admin/BoardingManager"));
const ExamManager = lazyPanel(() => import("@/components/admin/ExamManager"));
const GalleryManager = lazyPanel(() => import("@/components/admin/GalleryManager"));
const VideoManager = lazyPanel(() => import("@/components/admin/VideoManager"));
const BranchManager = lazyPanel(() => import("@/components/admin/BranchManager"));
const AcademicStructureManager = lazyPanel(() => import("@/components/admin/AcademicStructureManager"));
const HeroSlideManager = lazyPanel(() => import("@/components/admin/HeroSlideManager"));
const PageSectionManager = lazyPanel(() => import("@/components/admin/PageSectionManager"));
const NavbarManager = lazyPanel(() => import("@/components/admin/NavbarManager"));
const AdmissionApplicationManager = lazyPanel(() => import("@/components/admin/AdmissionApplicationManager"));
const DownloadFormManager = lazyPanel(() => import("@/components/admin/DownloadFormManager"));
const ContactMessageManager = lazyPanel(() => import("@/components/admin/ContactMessageManager"));
const CourseManager = lazyPanel(() => import("@/components/admin/CourseManager"));
const TestimonialManager = lazyPanel(() => import("@/components/admin/TestimonialManager"));
const SuccessStoryManager = lazyPanel(() => import("@/components/admin/SuccessStoryManager"));
const EventManager = lazyPanel(() => import("@/components/admin/EventManager"));
const BlogManager = lazyPanel(() => import("@/components/admin/BlogManager"));
const FaqManager = lazyPanel(() => import("@/components/admin/FaqManager"));
const ContactInfoManager = lazyPanel(() => import("@/components/admin/ContactInfoManager"));
const SponsorManager = lazyPanel(() => import("@/components/admin/SponsorManager"));
const PeriodManager = lazyPanel(() => import("@/components/admin/PeriodManager"));
const DataManager = lazyPanel(() => import("@/components/admin/DataManager"));
const PromotionManager = lazyPanel(() => import("@/components/admin/PromotionManager"));
const CertificateManager = lazyPanel(() => import("@/components/admin/CertificateManager"));
const AttendanceManager = lazyPanel(() => import("@/components/admin/AttendanceManager"));
const BulkImportMapping = lazyPanel(() => import("@/components/admin/BulkImportMapping"));
const SecurityManager = lazyPanel(() => import("@/components/admin/SecurityManager"));
const ApplicationManager = lazyPanel(() => import("@/features/admin/components/ApplicationManager"));

export default function DashboardTabsContent({
  currentUser,
  branches,
  students,
  allTeachers,
  dashData,
  setActiveTab,
  setShowStudentForm,
  setEditingStudent,
  // AnalyticsTab metrics
  analyticsProps,
}) {
  return (
    <>
      {/* ── Student Attendance Tab ── */}
      <TabsContent value="student-attendance">
        <StudentAttendanceManager students={students} branches={branches} currentUser={currentUser} />
      </TabsContent>

      {/* ── Teacher Attendance Tab ── */}
      <TabsContent value="teacher-attendance">
        <TeacherAttendanceManager teachers={allTeachers} branches={branches} currentUser={currentUser} />
      </TabsContent>

      <TabsContent value="attendance">
        <AttendanceManager currentUser={currentUser} />
      </TabsContent>

      <TabsContent value="applications">
        <ApplicationManager
          currentUser={currentUser}
          branches={branches}
          settings={dashData?.settings || {}}
        />
      </TabsContent>

      <TabsContent value="biometric-import">
        <BulkImportMapping />
      </TabsContent>

      {/* ── Daily Lesson Tracker Tab ── */}
      <TabsContent value="daily-lesson-tracker">
        <DailyLessonTracker students={students} teachers={allTeachers} branches={branches} currentUser={currentUser} />
      </TabsContent>

      {/* ── Teachers Tab ── */}
      <TabsContent value="teachers">
        <TeacherManager students={students} currentUser={currentUser} />
      </TabsContent>

      {/* ── Fees Tab ── */}
      <TabsContent value="fees">
        <StudentFees students={students} currentUser={currentUser} />
      </TabsContent>

      {/* ── Hadiya Tab ── */}
      <TabsContent value="hadiya">
        <HadiyaForm students={students} teachers={allTeachers} currentUser={currentUser} />
      </TabsContent>

      {/* ── Exams Tab ── */}
      <TabsContent value="exams">
        <ExamManager students={students} currentUser={currentUser} />
      </TabsContent>

      {/* ── Gallery Tab ── */}
      <TabsContent value="gallery">
        <GalleryManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Video Gallery Tab ── */}
      <TabsContent value="videos">
        <VideoManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Boarding Tab ── */}
      <TabsContent value="boarding">
        <BoardingManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Branches Tab ── */}
      <TabsContent value="branches">
        <BranchManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Academic Structure Tab ── */}
      <TabsContent value="academic-structure">
        <AcademicStructureManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Promotion Tab ── */}
      <TabsContent value="promotion">
        <PromotionManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Certificates Tab ── */}
      <TabsContent value="certificates">
        <CertificateManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Hero Slides Tab ── */}
      <TabsContent value="hero">
        <HeroSlideManager />
      </TabsContent>

      {/* ── Settings Tab ── */}
      <TabsContent value="settings" className="m-0 border-none p-0 outline-none">
        <BrandingSettings />
      </TabsContent>

      <TabsContent value="security" className="m-0 border-none p-0 outline-none">
        <SecurityManager />
      </TabsContent>

      {/* ── Notices Tab ── */}
      <TabsContent value="notices">
        <NoticeManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Download Form Tab ── */}
      <TabsContent value="downloadform">
        <DownloadFormManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Accounting Period Tab ── */}
      <TabsContent value="period">
        <PeriodManager />
      </TabsContent>

      {/* ── Data Management Tab ── */}
      <TabsContent value="data-mgmt">
        <DataManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Pages Tab ── */}
      <TabsContent value="pages">
        <PageSectionManager />
      </TabsContent>

      {/* ── Navbar Tab ── */}
      <TabsContent value="navbar">
        <NavbarManager />
      </TabsContent>

      {/* ── Reserve Tab ── */}
      <TabsContent value="reserve">
        <AdmissionApplicationManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Messages Tab ── */}
      <TabsContent value="messages">
        <ContactMessageManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Courses Tab ── */}
      <TabsContent value="courses">
        <CourseManager currentUser={currentUser} />
      </TabsContent>

      {/* ── Testimonials Tab ── */}
      <TabsContent value="testimonials">
        <TestimonialManager />
      </TabsContent>

      {/* ── Success Stories Tab ── */}
      <TabsContent value="success_stories">
        <SuccessStoryManager />
      </TabsContent>

      {/* ── Events Tab ── */}
      <TabsContent value="events">
        <EventManager />
      </TabsContent>

      {/* ── Blogs Tab ── */}
      <TabsContent value="blogs">
        <BlogManager />
      </TabsContent>

      {/* ── FAQs Tab ── */}
      <TabsContent value="faqs">
        <FaqManager />
      </TabsContent>

      {/* ── Contact Info Tab ── */}
      <TabsContent value="contact_info">
        <ContactInfoManager />
      </TabsContent>

      {/* ── Sponsor Management Tab ── */}
      <TabsContent value="sponsors">
        <SponsorManager />
      </TabsContent>

      {/* ── Analytics Tab ── */}
      <AnalyticsTab
        {...analyticsProps}
        currentUser={currentUser}
        branches={branches}
        setActiveTab={setActiveTab}
        setShowStudentForm={setShowStudentForm}
        setEditingStudent={setEditingStudent}
      />
    </>
  );
}
