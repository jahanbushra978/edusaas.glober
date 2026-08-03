'use client'

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Platform Owner এখান থেকে ঠিক করে দেয় — প্রতিটা role কী কী permission পেতে পারবে।
 * Organization Super Admin শুধু এই list থেকেই তার Branch Admin-দের permission দিতে পারবে,
 * এর বাইরে কিছু না। কোনো permission hardcode না — সব এই component-এর state থেকে আসে।
 *
 * TODO (Phase 4): এই component-এর state Supabase `role_permissions` টেবিলে persist হবে,
 * এবং has_permission() RLS function ঠিক এই টেবিল থেকেই read করবে।
 */
export default function PermissionTree({ tree }) {
  const [enabled, setEnabled] = useState(() => {
    const initial = {};
    tree.forEach((role) => {
      role.permissions.forEach((perm) => {
        initial[`${role.key}:${perm}`] = true;
      });
    });
    return initial;
  });

  const toggle = (key) => setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      {tree.map((role) => (
        <Card key={role.key}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{role.label}</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            {role.permissions.map((perm) => {
              const stateKey = `${role.key}:${perm}`;
              return (
                <label
                  key={stateKey}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <span className="text-sm text-slate-700 capitalize">
                    {perm.replaceAll("_", " ")}
                  </span>
                  <Switch checked={!!enabled[stateKey]} onCheckedChange={() => toggle(stateKey)} />
                </label>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
