import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Icon size={20} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
