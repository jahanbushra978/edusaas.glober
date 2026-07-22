'use client'

import Home from '@/lib/Home'

/**
 * HomeClient receives `initialData` from the Server Component (page.jsx).
 * That data was fetched on the server via fetchHomePageData() and is passed
 * straight into the Home component so Google Bot (and real users) get the
 * full page content in the initial HTML — no loading spinner.
 */
export default function HomeClient({ initialData }) {
  return <Home initialData={initialData} />
}
