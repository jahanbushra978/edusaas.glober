import React, { useState, useRef } from "react";
import { appClient } from "@/api/appClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle, Clock, CheckSquare, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AttendanceMarker({ students, teacherName }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState({});
  const queryClient = useQueryClient();

  const { data: existingAttendance = [], isLoading } = useQuery({
    queryKey: ["attendance", selectedDate],
    queryFn: () => appClient.entities.Attendance.filter({ date: selectedDate }),
  });

  const prevExistingRef = useRef(null);
  React.useEffect(() => {
    const key = existingAttendance.map(a => `${a.student_id}:${a.status}`).join("|");
    const prevKey = prevExistingRef.current;
    if (prevKey === key) return;
    prevExistingRef.current = key;
    const attendanceMap = {};
    existingAttendance.forEach(a => {
      attendanceMap[a.student_id] = a.status;
    });
    setAttendance(attendanceMap);
  }, [existingAttendance]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const promises = students.map(async student => {
        const status = attendance[student.id] || "absent";
        const existing = existingAttendance.find(a => a.student_id === student.id);

        if (existing) {
          if (existing.status !== status) {
            return appClient.entities.Attendance.update(existing.id, { status });
          }
        } else {
          return appClient.entities.Attendance.create({
            student_id: student.id,
            date: selectedDate,
            status,
            marked_by: teacherName,
          });
        }
      });
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance saved successfully!");
    },
  });

  const markAll = (status) => {
    const newAttendance = {};
    students.forEach(s => {
      newAttendance[s.id] = status;
    });
    setAttendance(newAttendance);
  };

  const toggleStatus = (studentId) => {
    const statuses = ["present", "absent", "late", "excused"];
    const current = attendance[studentId] || "absent";
    const currentIndex = statuses.indexOf(current);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    setAttendance({ ...attendance, [studentId]: nextStatus });
  };

  const filteredStudents = students.filter(s =>
    s.full_name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.full_name_bn?.includes(searchQuery) ||
    s.roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusIcons = {
    present: <CheckCircle className="h-5 w-5 text-green-600" />,
    absent: <XCircle className="h-5 w-5 text-red-600" />,
    late: <Clock className="h-5 w-5 text-orange-600" />,
    excused: <CheckSquare className="h-5 w-5 text-blue-600" />,
  };

  const statusColors = {
    present: "bg-green-100 text-green-800 border-green-200",
    absent: "bg-red-100 text-red-800 border-red-200",
    late: "bg-orange-100 text-orange-800 border-orange-200",
    excused: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const presentCount = Object.values(attendance).filter(s => s === "present").length;
  const percentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Mark Attendance
          </CardTitle>
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            <Badge variant="outline" className="text-base px-3 py-1">
              {presentCount}/{students.length} • {percentage}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 pb-4 border-b">
          <Button size="sm" onClick={() => markAll("present")} variant="outline">
            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
            Mark All Present
          </Button>
          <Button size="sm" onClick={() => markAll("absent")} variant="outline">
            <XCircle className="h-4 w-4 mr-1 text-red-600" />
            Mark All Absent
          </Button>
          <div className="flex-1" />
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            💾 Save Attendance
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-2 max-h-[500px] overflow-y-auto">
            {filteredStudents.map(student => {
              const status = attendance[student.id] || "absent";
              return (
                <div
                  key={student.id}
                  onClick={() => toggleStatus(student.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${statusColors[status]}`}
                >
                  <div className="flex items-center gap-3">
                    {student.photo_url && (
                      <img src={student.photo_url} loading="lazy" alt={student.full_name_en} className="h-10 w-10 rounded-full border-2 border-white" />
                    )}
                    <div>
                      <p className="font-semibold">{student.full_name_en}</p>
                      <p className="text-xs opacity-75">Roll: {student.roll_number} • {student.batch}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcons[status]}
                    <span className="font-semibold capitalize">{status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}