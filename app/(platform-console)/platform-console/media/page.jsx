'use client'

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Upload, Trash2, RotateCcw, Folder, Search } from "lucide-react";

const INITIAL_MEDIA = [
  { id: "m1", name: "school-banner.jpg", url: "/slids2.webp", type: "image", size: "450 KB", folder: "Banners", tags: ["hero", "slider"], deleted: false },
  { id: "m2", name: "logo-transparent.png", url: "/rahmania-logo-navbar.png", type: "image", size: "120 KB", folder: "Logos", tags: ["branding"], deleted: false },
  { id: "m3", name: "annual-sports-2026.jpg", url: "/gallary1.jpg", type: "image", size: "850 KB", folder: "Events", tags: ["gallery", "sports"], deleted: false },
  { id: "m4", name: "campus-building.jpg", url: "/gallary2.jpg", type: "image", size: "920 KB", folder: "Campus", tags: ["building"], deleted: false },
  { id: "m5", name: "old-notice-scan.pdf", url: "/doc.png", type: "document", size: "1.2 MB", folder: "Notices", tags: ["archive"], deleted: true },
];

export default function MediaManagerPage() {
  const [items, setItems] = useState(INITIAL_MEDIA);
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [toast, setToast] = useState(null);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSimulatedUpload = () => {
    const newItem = {
      id: `m_${Date.now()}`,
      name: `uploaded-image-${Math.floor(Math.random() * 100)}.jpg`,
      url: "/gallary1.jpg",
      type: "image",
      size: "620 KB",
      folder: "Uploads",
      tags: ["new"],
      deleted: false,
    };
    setItems((prev) => [newItem, ...prev]);
    showNotification("নতুন ফাইল সফলভাবে আপলোড করা হয়েছে (Cloudinary URL Reference Saved)");
  };

  const handleSoftDelete = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, deleted: true } : item))
    );
    showNotification("ফাইল রিসাইকেল বিনে পাঠানো হয়েছে।");
  };

  const handleRestore = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, deleted: false } : item))
    );
    showNotification("ফাইল সফলভাবে রিকভার করা হয়েছে!");
  };

  const handlePermanentDelete = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    showNotification("ফাইল চিরতরে মুছে ফেলা হয়েছে।");
  };

  const activeItems = items.filter(
    (item) =>
      !item.deleted &&
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedFolder === "All" || item.folder === selectedFolder)
  );

  const deletedItems = items.filter((item) => item.deleted);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-teal-800 text-white px-4 py-2.5 text-sm shadow-lg border border-teal-600 animate-in fade-in slide-in-from-bottom-2">
          🖼️ {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ImageIcon className="text-teal-600" /> Visual Media Manager & Asset Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            কোড ছাড়াই ছবি ও মিডিয়া আপলোড, ফোল্ডার ফিল্টার, ট্যাগিং ও রিসাইকেল বিন কন্ট্রোল।
          </p>
        </div>

        <Button className="bg-teal-600 hover:bg-teal-500" onClick={handleSimulatedUpload}>
          <Upload size={16} className="mr-2" /> Upload New File
        </Button>
      </div>

      <Tabs defaultValue="library">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="library">Active Media ({activeItems.length})</TabsTrigger>
            <TabsTrigger value="recycle">Recycle Bin ({deletedItems.length})</TabsTrigger>
          </TabsList>

          {/* Search & Folder Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
              <Input
                placeholder="মিডিয়া সার্চ করুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs h-9 bg-white"
              />
            </div>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="h-9 rounded border border-slate-200 text-xs px-3 bg-white"
            >
              <option value="All">All Folders</option>
              <option value="Banners">Banners</option>
              <option value="Logos">Logos</option>
              <option value="Events">Events</option>
              <option value="Campus">Campus</option>
            </select>
          </div>
        </div>

        <TabsContent value="library" className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {activeItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden relative border-slate-200 hover:shadow-md transition-all">
                <div className="h-32 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                  <img src={item.url} alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleSoftDelete(item.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium truncate text-slate-800">{item.name}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Folder size={10} /> {item.folder}</span>
                    <span>{item.size}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recycle" className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {deletedItems.map((item) => (
              <Card key={item.id} className="border-red-100 bg-red-50/20 overflow-hidden relative">
                <div className="h-28 bg-slate-100 flex items-center justify-center text-slate-400">
                  <ImageIcon size={32} />
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium truncate text-slate-800">{item.name}</p>
                  <p className="text-[10px] text-red-500 mt-0.5">Recycle Bin</p>
                  <div className="flex gap-1 mt-3">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] flex-1" onClick={() => handleRestore(item.id)}>
                      <RotateCcw size={10} className="mr-1" /> Restore
                    </Button>
                    <Button variant="destructive" size="sm" className="h-7 text-[10px]" onClick={() => handlePermanentDelete(item.id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
