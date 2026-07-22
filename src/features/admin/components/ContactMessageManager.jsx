import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, MailOpen, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { SearchInput } from "@/components/ui/search-input";
import { useSearch } from "@/hooks/useSearch";

export default function ContactMessageManager() {
  const [expanded, setExpanded] = useState(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["contact-messages-admin"],
    queryFn: () => appClient.entities.ContactMessage.list("-created_date", 500),
  });

  const { search, setSearch, filteredData } = useSearch({
    data: messages,
    fields: ["name", "email", "subject", "message"],
  });

  const toggleReadMut = useMutation({
    mutationFn: ({ id, val }) => appClient.entities.ContactMessage.update(id, { is_read: val }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages-admin"] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => appClient.entities.ContactMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages-admin"] });
      toast.success("Message deleted");
    },
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-primary flex items-center gap-2">
            <Mail className="h-4 w-4" /> Contact Messages
            {unreadCount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                {unreadCount} unread
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground">Messages sent from the website contact form</p>
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search messages..."
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filteredData.length === 0 ? (
        <Card className="border-primary/10">
          <CardContent className="py-12 text-center text-muted-foreground italic">
            {search ? "No messages match your search." : "No messages yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredData.map((msg) => (
            <Card
              key={msg.id}
              className={`border-primary/10 transition-all duration-200 ${!msg.is_read ? "border-l-4 border-l-primary shadow-md" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800 text-sm truncate">{msg.name}</span>
                      {!msg.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        {msg.created_date ? format(new Date(msg.created_date), "MMM dd, yyyy h:mm a") : msg.created_at ? format(new Date(msg.created_at), "MMM dd, yyyy h:mm a") : ""}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                      {msg.email && <span>✉️ {msg.email}</span>}
                    </div>
                    {msg.subject && (
                      <p className="text-sm font-medium text-slate-700 mb-1">{msg.subject}</p>
                    )}
                    <div>
                      <p className={`text-sm text-slate-600 leading-relaxed ${expanded === msg.id ? "" : "line-clamp-2"}`}>
                        {msg.message}
                      </p>
                      {msg.message && msg.message.length > 120 && (
                        <button
                          onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                          className="text-xs text-primary hover:text-primary/80 font-bold mt-1 flex items-center gap-1"
                        >
                          {expanded === msg.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          {expanded === msg.id ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleReadMut.mutate({ id: msg.id, val: !msg.is_read })}
                      title={msg.is_read ? "Mark as unread" : "Mark as read"}
                    >
                      {msg.is_read ? <MailOpen className="h-4 w-4 text-muted-foreground" /> : <Mail className="h-4 w-4 text-primary" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { if (window.confirm("Delete this message?")) deleteMut.mutate(msg.id); }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
