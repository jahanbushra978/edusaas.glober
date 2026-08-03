'use client'

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Globe, Eye, EyeOff, Plus, Trash2, Save, Image, Type, MessageSquare, Images, Users, HelpCircle, Bell, Star, ChevronDown, ChevronUp } from "lucide-react"
import { supabase } from "@/lib/supabase"

const SECTION_TYPES = [
  { id: "hero", label: "Hero / Banner", icon: Image, default: { title: "Welcome", subtitle: "Your tagline here", bg_color: "#0f766e" } },
  { id: "about", label: "About Us", icon: Type, default: { content: "Write about your institution...", image_url: "" } },
  { id: "notices", label: "Notices", icon: Bell, default: { title: "Notices", show_count: 5 } },
  { id: "teachers", label: "Teachers", icon: Users, default: { title: "Our Teachers", show_count: 4 } },
  { id: "gallery", label: "Gallery", icon: Images, default: { title: "Gallery" } },
  { id: "testimonials", label: "Testimonials", icon: Star, default: { title: "What People Say" } },
  { id: "faq", label: "FAQ", icon: HelpCircle, default: { title: "Frequently Asked Questions" } },
  { id: "contact", label: "Contact", icon: MessageSquare, default: { title: "Contact Us", email: "", phone: "" } },
]

export default function WebsiteBuilderPanel({ org }) {
  const queryClient = useQueryClient()
  const [sections, setSections] = useState([])
  const [published, setPublished] = useState(false)
  const [editingSection, setEditingSection] = useState(null)

  const { isLoading } = useQuery({
    queryKey: ["org-website-sections", org?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("page_sections")
        .select("*")
        .eq("organization_id", org.id)
        .order("sort_order", { ascending: true })
      if (data) {
        setSections(data)
      }
      const { data: settings } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", `website_published_${org.id}`)
        .maybeSingle()
      setPublished(settings?.value === "true")
      return data
    },
    enabled: !!org?.id,
  })

  const saveMutation = useMutation({
    mutationFn: async (updatedSections) => {
      await supabase.from("page_sections").delete().eq("organization_id", org.id)
      if (updatedSections.length > 0) {
        const payload = updatedSections.map((s, i) => ({
          ...s,
          organization_id: org.id,
          sort_order: i,
          updated_date: new Date().toISOString(),
        }))
        await supabase.from("page_sections").insert(payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-website-sections"] })
      toast.success("Website sections saved!")
    },
  })

  const togglePublish = async () => {
    const newVal = !published
    await supabase.from("app_settings").upsert(
      { key: `website_published_${org.id}`, value: String(newVal) },
      { onConflict: "key" }
    )
    setPublished(newVal)
    toast.success(newVal ? "Website published!" : "Website unpublished")
  }

  const addSection = (type) => {
    const sectionType = SECTION_TYPES.find((s) => s.id === type)
    if (!sectionType) return
    setSections([...sections, {
      id: `new-${Date.now()}`,
      section_type: type,
      title: sectionType.default.title,
      content_json: sectionType.default,
      is_visible: true,
      organization_id: org.id,
    }])
  }

  const updateSection = (index, field, value) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], [field]: value }
    setSections(updated)
  }

  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index))
  }

  const moveSection = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= sections.length) return
    const updated = [...sections]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    setSections(updated)
  }

  const previewUrl = published ? `/?org=${org.slug}` : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Website Builder</h1>
          <p className="text-sm text-slate-500 mt-1">Drag, drop, and customize sections for your school website</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">{published ? "Published" : "Draft"}</span>
            <Switch checked={published} onCheckedChange={togglePublish} />
          </div>
          <Button
            onClick={() => saveMutation.mutate(sections)}
            disabled={saveMutation.isPending}
            className="bg-teal-600 hover:bg-teal-500"
          >
            <Save size={16} className="mr-1.5" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-3">
          {sections.length === 0 && (
            <Card className="border-dashed border-2 border-slate-300">
              <CardContent className="p-12 text-center">
                <Globe size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No sections yet</h3>
                <p className="text-sm text-slate-400 mb-4">Add sections from the panel on the right to build your website</p>
              </CardContent>
            </Card>
          )}

          {sections.map((section, index) => (
            <Card key={section.id || index} className="relative">
              <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveSection(index, -1)} className="text-slate-400 hover:text-slate-600">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => moveSection(index, 1)} className="text-slate-400 hover:text-slate-600">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold capitalize">{section.section_type} Section</CardTitle>
                    <p className="text-xs text-slate-400">{section.title || "Untitled"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSection(index, "is_visible", !section.is_visible)}
                    className={`p-1.5 rounded-lg ${section.is_visible ? "text-teal-600" : "text-slate-400"}`}
                  >
                    {section.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => removeSection(index)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  <Input
                    value={section.title || ""}
                    onChange={(e) => updateSection(index, "title", e.target.value)}
                    placeholder="Section title"
                    className="h-8 text-sm"
                  />
                  {section.section_type === "hero" && (
                    <Input
                      value={section.content_json?.subtitle || ""}
                      onChange={(e) => {
                        const updated = [...sections]
                        updated[index] = { ...updated[index], content_json: { ...updated[index].content_json, subtitle: e.target.value } }
                        setSections(updated)
                      }}
                      placeholder="Subtitle text"
                      className="h-8 text-sm"
                    />
                  )}
                  {section.section_type === "about" && (
                    <textarea
                      value={section.content_json?.content || ""}
                      onChange={(e) => {
                        const updated = [...sections]
                        updated[index] = { ...updated[index], content_json: { ...updated[index].content_json, content: e.target.value } }
                        setSections(updated)
                      }}
                      placeholder="About content..."
                      className="w-full h-20 rounded-lg border border-slate-200 p-2 text-sm resize-none"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-semibold">Add Section</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1.5">
              {SECTION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addSection(type.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <type.icon size={16} className="text-teal-600" />
                  <span>{type.label}</span>
                  <Plus size={14} className="ml-auto text-slate-400" />
                </button>
              ))}
            </CardContent>
          </Card>

          {published && (
            <Card className="bg-teal-50 border-teal-200">
              <CardContent className="p-3">
                <p className="text-xs font-medium text-teal-800 mb-2">Website is live!</p>
                <Button size="sm" variant="outline" className="w-full text-xs" asChild>
                  <a href={previewUrl} target="_blank" rel="noreferrer">
                    <Globe size={14} className="mr-1" /> View Live
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
