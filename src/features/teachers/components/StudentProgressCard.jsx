import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { BookOpen, Calendar, TrendingUp, Award } from "lucide-react";

import { format } from "date-fns";

import Link from "next/link";

import { createPageUrl } from "@/utils";



export default function StudentProgressCard({ student, recentLessons, recentAttendance }) {

  const avgQuality = recentLessons.length > 0

    ? (recentLessons.reduce((sum, l) => sum + (l.quality_score || 0), 0) / recentLessons.length).toFixed(1)

    : "N/A";



  const presentDays = recentAttendance.filter(a => a.status === "present").length;

  const attendanceRate = recentAttendance.length > 0

    ? Math.round((presentDays / recentAttendance.length) * 100)

    : 0;



  const lastLesson = recentLessons[0];



  return (

    <Link href={`${createPageUrl("StudentProfile")}?id=${student.id}`}>

      <Card className="hover:shadow-lg transition-all cursor-pointer border-primary/10 hover:border-primary/30">

        <CardHeader>

          <div className="flex items-start justify-between">

            <div className="flex items-center gap-3">

              {student.photo_url && (

                <img

                  src={student.photo_url} loading="lazy"

                  alt={student.full_name_en}

                  className="h-12 w-12 rounded-full border-2 gold-border"

                />

              )}

              <div>

                <CardTitle className="text-lg">{student.full_name_en}</CardTitle>

                <p className="text-xs text-muted-foreground">

                  Roll: {student.roll_number} • {student.batch}

                </p>

              </div>

            </div>

            <Badge variant={student.status === "active" ? "default" : "secondary"}>

              {student.status}

            </Badge>

          </div>

        </CardHeader>

        <CardContent className="space-y-3">

          <div className="grid grid-cols-2 gap-3">

            <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">

              <TrendingUp className="h-4 w-4 text-primary" />

              <div>

                <p className="text-xs text-muted-foreground">Avg Quality</p>

                <p className="font-bold gold-accent">{avgQuality}/10</p>

              </div>

            </div>



            <div className="flex items-center gap-2 p-2 bg-secondary/5 rounded-lg">

              <Calendar className="h-4 w-4 text-secondary" />

              <div>

                <p className="text-xs text-muted-foreground">Attendance</p>

                <p className="font-bold text-secondary">{attendanceRate}%</p>

              </div>

            </div>

          </div>



          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">

            <BookOpen className="h-4 w-4 text-primary" />

            <div className="flex-1">

              <p className="text-xs text-muted-foreground">Total Pages Read</p>

              <p className="font-bold text-primary">{student.total_pages_read || 0}</p>

            </div>

          </div>



          {lastLesson && (

            <div className="pt-2 border-t">

              <div className="flex items-center gap-1 mb-1">

                <Award className="h-3 w-3 gold-accent" />

                <p className="text-xs font-semibold text-muted-foreground">Last Lesson:</p>

              </div>

              <p className="text-xs">{lastLesson.subject} - {lastLesson.lesson_content}</p>

              <p className="text-xs text-muted-foreground mt-1">

                {format(new Date(lastLesson.date), "MMM dd, yyyy")}

              </p>

            </div>

          )}

        </CardContent>

      </Card>

    </Link>

  );

}