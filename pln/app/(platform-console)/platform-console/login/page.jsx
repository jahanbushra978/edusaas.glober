'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

/**
 * এই login organization login (`/login`, `/AdminLogin`, `/TeacherLogin`, `/StudentLogin`)
 * থেকে সম্পূর্ণ আলাদা। এটা কখনো কোনো organization role (admin/branch_admin/teacher)
 * accept করবে না — শুধু Platform Owner-এর নিজস্ব credential।
 *
 * TODO (Phase 2): এই form Supabase Auth-এর একটা সম্পূর্ণ আলাদা মেকানিজমে যাবে —
 * হয় আলাদা Supabase project, অথবা `platform_owner` custom claim সহ একটা user_metadata,
 * যেটা has_permission()/check_branch_isolation() কখনো true ধরবে না।
 * Session cookie নাম আলাদা থাকবে: `platform_owner_session` (বর্তমান `rahmania_session`
 * এর সাথে কখনো মিশবে না)।
 */
export default function PlatformConsoleLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm bg-slate-900 border-slate-800 text-slate-100">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-teal-600/20 text-teal-400 flex items-center justify-center mb-2">
            <ShieldCheck size={24} />
          </div>
          <CardTitle className="text-lg">Platform Console</CardTitle>
          <p className="text-xs text-slate-500">Restricted access — Platform Owner only</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-500">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
