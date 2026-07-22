import React from "react";

import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import Link from "next/link";
import Image from "next/image";

import { createPageUrl } from "@/utils";

import { BookOpen, User } from "lucide-react";



export default function StudentCard({ student }) {

  const statusColors = {

    active: "bg-primary/10 text-primary border border-primary/20",

    inactive: "bg-slate-100 text-slate-600 border border-slate-300",

    graduated: "bg-secondary/20 text-secondary border border-secondary/40",

  };



  return (

    <Link href={createPageUrl("StudentProfile") + `?id=${student.id}`}>

      <Card className="group p-0 border border-primary/10 shadow-md hover:shadow-xl hover:border-secondary/40 transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 cursor-pointer">

        <div className="flex items-center gap-4 p-4">

          <div className="h-16 w-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/20 border-2 gold-border flex-shrink-0 flex items-center justify-center">

            {student.photo_url ? (

              <Image
                src={student.photo_url}
                alt={student.full_name_en}
                width={64}
                height={64}
                sizes="64px"
                className="h-full w-full object-cover"
                unoptimized
              />

            ) : (

              <User className="h-7 w-7 text-primary" />

            )}

          </div>

          <div className="flex-1 min-w-0">

            <div className="flex items-center gap-2 flex-wrap">

              <h3 className="font-bold text-primary truncate text-base">

                {student.full_name_en}

              </h3>

              <Badge variant="secondary" className={`text-xs px-2.5 py-0.5 font-medium ${statusColors[student.status] || statusColors.active}`}>

                {student.status || "active"}

              </Badge>

            </div>

            {student.full_name_bn && (

              <p className="text-sm text-muted-foreground mt-0.5 font-medium">{student.full_name_bn}</p>

            )}

            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">

              <span className="font-mono bg-primary/5 text-primary px-2 py-1 rounded font-semibold border border-primary/20">

                #{student.roll_number}

              </span>

              <span className="font-medium">{student.class_name || student.batch}</span>

              {student.total_pages_read > 0 && (

                <span className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded text-secondary font-semibold">

                  <BookOpen className="h-3 w-3" />

                  {student.total_pages_read}

                </span>

              )}

            </div>

          </div>

          <div className="text-primary/30 group-hover:text-secondary group-hover:scale-110 transition-all">

            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">

              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />

            </svg>

          </div>

        </div>

      </Card>

    </Link>

  );

}
