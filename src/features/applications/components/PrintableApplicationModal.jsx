"use client";
import React, { useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, FileText, CheckCircle2 } from "lucide-react";
import { generateMadrasahDorkhastoHTML, printMadrasahApplicationDirect } from "../utils/printMadrasahDorkhasto";

export default function PrintableApplicationModal({
  open,
  onOpenChange,
  application,
  settings = {},
  branch = null,
  applicantDetails = null,
  timeline = [],
}) {
  const iframeRef = useRef(null);

  if (!application) return null;

  const htmlContent = generateMadrasahDorkhastoHTML({
    application,
    settings,
    branch,
    applicantDetails,
    timeline,
  });

  const handlePrint = () => {
    printMadrasahApplicationDirect({
      application,
      settings,
      branch,
      applicantDetails,
      timeline,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-800 text-white">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                মাদরাসা দরখাস্ত প্রিভিউ ও প্রিন্ট (Dorkhasto Preview)
              </DialogTitle>
              <p className="text-xs text-slate-400">
                আবেদন নং: <span className="font-mono text-emerald-400">{application.application_number}</span> | অফিসে জমা দেওয়ার উপযোগী ফরম্যাট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="bg-[#004D3A] hover:bg-[#003829] text-white text-xs font-bold gap-2 px-4 h-9 rounded-xl shadow-lg shadow-emerald-950/30"
            >
              <Printer className="h-4 w-4" />
              প্রিন্ট করুন (Print Dorkhasto)
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Live Document Preview */}
        <div className="flex-1 bg-slate-950 p-4 sm:p-6 overflow-y-auto flex justify-center">
          <div className="w-full max-w-[850px] bg-white rounded-lg shadow-2xl overflow-hidden min-h-[950px] my-auto">
            <iframe
              ref={iframeRef}
              srcDoc={htmlContent}
              title="Dorkhasto Preview"
              className="w-full h-[850px] border-0"
              style={{ minHeight: "850px" }}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>A4 সাইজে প্রিন্ট বা PDF হিসেবে সেভ করে সরাসরি অফিসে জমা দিন।</span>
          </div>
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="text-xs border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-7 rounded-lg"
          >
            <Printer className="h-3 w-3 mr-1" />
            সরাসরি প্রিন্ট
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
