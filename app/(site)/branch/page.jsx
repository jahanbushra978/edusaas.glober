import React from 'react';
import BranchesSection from '@/components/home/BranchesSection';

export const metadata = {
  title: 'আমাদের শাখাসমূহ | রহমানিয়া ইনস্টিটিউট',
  description: 'রহমানিয়া ইনস্টিটিউটের সকল শাখা ও ক্যাম্পাসের অবস্থান এবং বিস্তারিত তথ্য।',
  alternates: {
    canonical: '/branch',
  },
};

export default function BranchesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080f0a] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold italic text-slate-900 dark:text-slate-100 mb-3">
            আমাদের শাখাসমূহ
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto italic">
            রহমানিয়া ইনস্টিটিউটের সকল আধুনিক দ্বীনি শিক্ষা ক্যাম্পাসের বিস্তারিত তথ্য ও অবস্থান নিচে দেখতে পারবেন।
          </p>
        </div>
        <BranchesSection />
      </div>
    </div>
  );
}
