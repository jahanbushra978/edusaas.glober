'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function PlatformConsoleLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@platform.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/platform-console");
    }, 400);
  };

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
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@platform.com"
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
                placeholder="••••••••"
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-500">
              {loading ? "Authenticating..." : "Sign in to Platform Console"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
