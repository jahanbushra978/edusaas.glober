import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Platform Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          সেন্ট্রাল প্ল্যাটফর্ম কনফিগারেশন, গ্লোবাল ব্র্যান্ডিং ও সিকিউরিটি সেটিংস।
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General Platform Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Platform Name</Label>
            <Input defaultValue="Educational SaaS Mastermind" />
          </div>
          <div className="space-y-1.5">
            <Label>Default System Language</Label>
            <Input defaultValue="Bengali (bn)" />
          </div>
          <div className="flex justify-end pt-2">
            <Button className="bg-teal-600 hover:bg-teal-500">Save System Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
