'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Plus, Trash2, ArrowUp, ArrowDown, Save, Link2 } from "lucide-react";

const INITIAL_MENUS = [
  { id: "m1", label: "হোম", url: "/", role: "all", parentId: null },
  { id: "m2", label: "আমাদের সম্পর্কে", url: "/about", role: "all", parentId: null },
  { id: "m3", label: "একাডেমিক", url: "/academics", role: "all", parentId: null },
  { id: "m4", label: "নোটিশ বোর্ড", url: "/notices", role: "all", parentId: null },
  { id: "m5", label: "ভর্তি তথ্য", url: "/admission", role: "all", parentId: null },
  { id: "m6", label: "যোগাযোগ", url: "/facilities", role: "all", parentId: null },
];

export default function VisualMenuBuilderPage() {
  const [menus, setMenus] = useState(INITIAL_MENUS);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [toast, setToast] = useState(null);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddMenuItem = (e) => {
    e.preventDefault();
    if (!newLabel || !newUrl) return;
    const item = {
      id: `menu_${Date.now()}`,
      label: newLabel,
      url: newUrl,
      role: "all",
      parentId: null,
    };
    setMenus((prev) => [...prev, item]);
    setNewLabel("");
    setNewUrl("");
    showNotification(`'${item.label}' মেনু আইটেম যুক্ত করা হয়েছে!`);
  };

  const handleDeleteItem = (id) => {
    setMenus((prev) => prev.filter((m) => m.id !== id));
    showNotification("মেনু আইটেম মুছে ফেলা হয়েছে।");
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= menus.length) return;
    const updated = [...menus];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setMenus(updated);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-teal-800 text-white px-4 py-2.5 text-sm shadow-lg border border-teal-600 animate-in fade-in slide-in-from-bottom-2">
          🧭 {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Menu className="text-teal-600" /> Visual Dynamic Menu Builder
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ওয়েবসাইটের নেভিগেশন বার, ড্রপডাউন মেনু ও ফুটার লিংক ভিজ্যুয়ালি সাজান।
          </p>
        </div>

        <Button className="bg-teal-600 hover:bg-teal-500" onClick={() => showNotification("মেনু স্ট্রাকচার লাইভ সেভ করা হয়েছে!")}>
          <Save size={16} className="mr-2" /> Save & Render Live Menu
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Add New Menu Form */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-teal-200">
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-base font-semibold">নতুন মেনু যুক্ত করুন</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <form onSubmit={handleAddMenuItem} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">মেনু লেবেল (নাম)</label>
                  <Input
                    placeholder="যেমন: নোটিশ বোর্ড"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    required
                    className="h-9 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">লিংক URL / পেজ স্ল্যাগ</label>
                  <Input
                    placeholder="যেমন: /notices"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    required
                    className="h-9 text-xs bg-white"
                  />
                </div>

                <Button type="submit" className="w-full bg-slate-900 text-xs hover:bg-slate-800">
                  <Plus size={14} className="mr-1" /> Add Menu Item
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Menu Reordering Canvas */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Navigation Menu Structure</h3>
          <div className="space-y-2">
            {menus.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs font-medium text-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Menu size={16} className="text-slate-400 cursor-grab" />
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Link2 size={10} /> {item.url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500" onClick={() => handleMove(index, -1)}>
                    <ArrowUp size={12} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500" onClick={() => handleMove(index, 1)}>
                    <ArrowDown size={12} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
