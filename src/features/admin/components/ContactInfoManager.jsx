import React, { useState, useEffect } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Phone, Mail, MapPin, Facebook, Youtube, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ContactInfoManager() {
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contact-info-admin"],
    queryFn: () => appClient.entities.ContactInfo.list("created_at", 10),
  });

  const record = contacts[0] || null;

  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    address: "",
    facebook: "",
    youtube: "",
    whatsapp: "",
  });

  useEffect(() => {
    if (record) {
      setFormData({
        phone: record.phone || "",
        email: record.email || "",
        address: record.address || "",
        facebook: record.facebook || "",
        youtube: record.youtube || "",
        whatsapp: record.whatsapp || "",
      });
    }
  }, [record]);

  const saveMut = useMutation({
    mutationFn: (data) => {
      if (record) {
        return appClient.entities.ContactInfo.update(record.id, data);
      } else {
        return appClient.entities.ContactInfo.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-info-admin"] });
      queryClient.invalidateQueries({ queryKey: ["contact-info-public"] });
      toast.success("Contact Information saved successfully!");
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to save details");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.phone.trim() || !formData.email.trim() || !formData.address.trim()) {
      toast.error("Phone, Email, and Address are required");
      return;
    }
    saveMut.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#052E2B]">Contact Information Configuration</h2>
        <p className="text-xs text-muted-foreground">Configure the contact numbers, emails, addresses, and social links that appear on the homepage and footer</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#052E2B]" /></div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-3xl">
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-base text-[#052E2B] flex items-center gap-2 font-bold italic">
                <Save className="h-4 w-4 text-[#D4AF37]" /> Contact Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Primary Contact Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#052E2B] uppercase tracking-wide border-b pb-2">Primary Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> Phone Number *</Label>
                    <Input id="phone" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="e.g. +880 1342-436607" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="e.g. info@rahmania.edu" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> Physical Address *</Label>
                  <Textarea id="address" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} rows={3} placeholder="Full address details of the main institute campus" required />
                </div>
              </div>

              {/* Social Link Settings */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-[#052E2B] uppercase tracking-wide border-b pb-2">Social Networks</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="flex items-center gap-1.5"><Facebook className="h-3.5 w-3.5 text-blue-600" /> Facebook Link</Label>
                    <Input id="facebook" value={formData.facebook} onChange={e => setFormData(p => ({ ...p, facebook: e.target.value }))} placeholder="https://facebook.com/..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube" className="flex items-center gap-1.5"><Youtube className="h-3.5 w-3.5 text-red-600" /> YouTube Channel</Label>
                    <Input id="youtube" value={formData.youtube} onChange={e => setFormData(p => ({ ...p, youtube: e.target.value }))} placeholder="https://youtube.com/..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Number</Label>
                    <Input id="whatsapp" value={formData.whatsapp} onChange={e => setFormData(p => ({ ...p, whatsapp: e.target.value }))} placeholder="e.g. +8801700000000" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={saveMut.isPending} className="bg-[#052E2B] text-[#D4AF37] hover:bg-[#052E2B]/95 px-6 gap-2">
                  {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
