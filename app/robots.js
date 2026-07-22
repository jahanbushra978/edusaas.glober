/** @type {import('next').MetadataRoute.Robots} */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/AdminDashboard',
          '/AdminStudentDetail',
          '/TeacherDashboard',
          '/StudentProfile',
          '/AdminLogin',
          '/TeacherLogin',
          '/StudentLogin',
          '/login',
        ],
      },
    ],
    sitemap: 'https://rahmaniainstitute.org/sitemap.xml',
    host: 'https://rahmaniainstitute.org',
  }
}
