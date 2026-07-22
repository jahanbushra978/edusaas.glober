/** @type {import('next').MetadataRoute.Robots} */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        // Note: crawlDelay is not a standard robots.txt directive supported by
        // Next.js MetadataRoute.Robots, but major crawlers respect a 1-second
        // delay if configured via Google Search Console or Bing Webmaster Tools.
        allow: [
          '/',
          '/api/public/home',
        ],
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
