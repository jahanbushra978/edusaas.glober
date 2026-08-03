'use client'

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PermissionTree({ tree }) {
  const [enabled, setEnabled] = useState(() => {
    const initial = {};
    if (tree) {
      tree.forEach((role) => {
        role.permissions.forEach((perm) => {
          initial[`${role.key}:${perm}`] = true;
        });
      });
    }
    return initial;
  });

  const toggle = (key) => setEnabled((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      {tree?.map((role) => (
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
