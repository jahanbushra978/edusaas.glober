"use client";

import { AlertCircle, WifiOff, ServerOff, Clock, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const icons = {
  network: WifiOff,
  server: ServerOff,
  timeout: Clock,
  auth: Ban,
  default: AlertCircle,
};

export default function ErrorMessage({
  type = "default",
  message,
  retry,
  lang = "bn",
}) {
  const Icon = icons[type] || icons.default;
  const retryText = lang === "bn" ? "পুনরায় চেষ্টা করুন" : "Retry";

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardContent className="p-6 text-center space-y-3">
        <Icon className="w-8 h-8 mx-auto text-red-500" />
        <p className="text-sm text-muted-foreground">{message}</p>
        {retry && (
          <Button variant="outline" size="sm" onClick={retry}>
            {retryText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
