'use client'

export default function SiteError({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-light text-red-300">Error</h1>
          <div className="h-0.5 w-16 bg-red-200 mx-auto" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-medium text-slate-800">
            Something went wrong
          </h2>
          <p className="text-slate-600 leading-relaxed">
            An unexpected error occurred. Please try again.
          </p>
        </div>
        <div className="pt-6">
          <button
            onClick={() => reset()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#12715B] rounded-lg hover:bg-[#0e5c4a] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
