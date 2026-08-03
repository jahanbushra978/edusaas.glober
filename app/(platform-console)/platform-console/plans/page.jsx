import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Zap, Crown } from "lucide-react";

const PLANS = [
  {
    key: "free",
    name: "Free Plan",
    price: "৳০ /মাস",
    icon: Shield,
    features: ["২০০ জন শিক্ষার্থী", "১টি ব্রাঞ্চ", "১টি বেসিক থিম", "বায়োমেট্রিক সাপোর্ট"],
  },
  {
    key: "premium",
    name: "Premium Plan",
    price: "৳২,৫০০ /মাস",
    icon: Zap,
    popular: true,
    features: ["৫,০০০ জন শিক্ষার্থী", "১০টি ব্রাঞ্চ", "সকল থিম ও প্লাগইন", "এসএমএস ও ফি গেটওয়ে"],
  },
  {
    key: "enterprise",
    name: "Enterprise Plan",
    price: "৳৫,০০০ /মাস",
    icon: Crown,
    features: ["আনলিমিটেড শিক্ষার্থী", "১০০টি ব্রাঞ্চ", "কাস্টম ডোমেইন ও SSL", "২৪/৭ প্রায়োরিটি সাপোর্ট"],
  },
];

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscription Plans & Capabilities</h1>
        <p className="text-sm text-slate-500 mt-1">
          স্কুল ও মাদ্রাসার জন্য প্ল্যাটফর্মের প্ল্যান ও সুবিধা নিয়ন্ত্রণ প্যানেল।
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.key} className={`relative flex flex-col justify-between ${plan.popular ? "border-teal-600 ring-1 ring-teal-600 bg-teal-50/10" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 right-4 bg-teal-600 text-white text-[10px]">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-2">
                  <Icon size={20} />
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription className="text-xl font-bold text-slate-900 mt-1">{plan.price}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2 text-xs text-slate-600">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={14} className="text-teal-600" /> {f}
                    </li>
                  ))}
                </ul>

                <Button className={`w-full text-xs mt-4 ${plan.popular ? "bg-teal-600 hover:bg-teal-500" : "bg-slate-900 hover:bg-slate-800"}`}>
                  Edit Plan Limits
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
