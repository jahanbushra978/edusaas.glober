import React, { useState, useEffect } from "react";
import { X, Users, UserCheck } from "lucide-react";

export default function SocialFollowersModal({ teacherId, teacherName, onClose }) {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/teacher-marketplace/social/follow?teacher_id=${teacherId}&type=followers`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.ok) {
          setFollowers(data.followers || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [teacherId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>অনুসারী শিক্ষার্থী ও অনুরাগীগণ</span>
            </h3>
            <p className="text-[11px] text-slate-400">{teacherName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-slate-600 dark:text-stone-300 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Followers List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-bold animate-pulse">
              অনুসারীদের তালিকা লোড হচ্ছে...
            </div>
          ) : followers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              এখনো কোনো শিক্ষার্থী বা অনুসারী যুক্ত হননি।
            </div>
          ) : (
            followers.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/50 transition border border-stone-100 dark:border-stone-800/40"
              >
                <div className="flex items-center gap-3">
                  {f.follower_avatar ? (
                    <img
                      src={f.follower_avatar}
                      alt={f.follower_name}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                      {f.follower_name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      {f.follower_name}
                    </h4>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {f.follower_role === "student" ? "ভেরিফাইড শিক্ষার্থী" : f.follower_role}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  <span>অনুসরণ করছেন</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

