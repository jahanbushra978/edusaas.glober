import React, { useState } from "react";
import { appClient } from "@/api/appClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

function NavbarItemForm({ item, onSave, onCancel, isEdit = false }) {
  const [form, setForm] = useState({
    label: item?.label || "",
    route: item?.route || "",
    type: item?.type || "link",
    is_active: item?.is_active ?? true,
    sort_order: item?.sort_order || 0,
    parent_id: item?.parent_id || null,
    is_dropdown: item?.is_dropdown || false,
    dropdown_items: item?.dropdown_items || [],
  });
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } catch (error) {
      toast.error(error?.message || "Failed to save nav item");
      console.error("Navbar save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const addDropdownItem = () => {
    f("dropdown_items", [
      ...form.dropdown_items,
      { label: "", route: "", is_active: true, sort_order: form.dropdown_items.length }
    ]);
  };

  const updateDropdownItem = (index, field, value) => {
    const newItems = [...form.dropdown_items];
    newItems[index][field] = value;
    f("dropdown_items", newItems);
  };

  const removeDropdownItem = (index) => {
    const newItems = form.dropdown_items.filter((_, i) => i !== index);
    f("dropdown_items", newItems);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Label *</label>
          <Input placeholder="Enter menu label" value={form.label} onChange={e => f("label", e.target.value)} required />
        </div>
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Route/URL *</label>
          <Input placeholder="Enter route (e.g., Home, about)" value={form.route} onChange={e => f("route", e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Type</label>
          <Select value={form.type} onValueChange={v => f("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="link">🔗 Link</SelectItem>
              <SelectItem value="button">🎯 Button</SelectItem>
              <SelectItem value="external">🌐 External</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-bold text-primary mb-1 block">Sort Order</label>
          <Input type="number" value={form.sort_order} onChange={e => f("sort_order", parseInt(e.target.value) || 0)} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_dropdown"
          checked={form.is_dropdown}
          onChange={(e) => f("is_dropdown", e.target.checked)}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="is_dropdown" className="text-sm font-medium text-gray-700">
          Has Dropdown Menu
        </label>
      </div>

      {form.is_dropdown && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-primary mb-1 block">Dropdown Items</label>
            <Button type="button" onClick={addDropdownItem} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>
          {form.dropdown_items.map((dropdownItem, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                <Button
                  type="button"
                  onClick={() => removeDropdownItem(index)}
                  size="sm"
                  variant="outline"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="Label"
                  value={dropdownItem.label}
                  onChange={(e) => updateDropdownItem(index, "label", e.target.value)}
                />
                <Input
                  placeholder="Route"
                  value={dropdownItem.route}
                  onChange={(e) => updateDropdownItem(index, "route", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => f("is_active", !form.is_active)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? "bg-primary" : "bg-slate-300"}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className="text-sm text-muted-foreground">{form.is_active ? "Visible" : "Hidden"}</span>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          {isEdit ? "Update" : "Add"} Item
        </Button>
      </div>
    </form>
  );
}

const typeStyle = {
  link: { bg: "bg-blue-100 text-blue-800", icon: "🔗" },
  button: { bg: "bg-green-100 text-green-800", icon: "🎯" },
  external: { bg: "bg-purple-100 text-purple-800", icon: "🌐" },
};

export default function NavbarManager() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: navItems = [], isLoading } = useQuery({
    queryKey: ["navbar-items"],
    queryFn: () => appClient.entities.NavbarItem.list("sort_order", 100),
  });

  const createMut = useMutation({
    mutationFn: d => appClient.entities.NavbarItem.create(d),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["navbar-items"] }); 
      setShowForm(false); 
      toast.success("Navbar item added!"); 
    },
    onError: (error) => {
      toast.error("Failed to add navbar item");
      console.error(error);
    }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => appClient.entities.NavbarItem.update(id, data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["navbar-items"] }); 
      setShowForm(false); 
      setEditItem(null); 
      toast.success("Updated!"); 
    },
    onError: (error) => {
      toast.error("Failed to update navbar item");
      console.error(error);
    }
  });

  const deleteMut = useMutation({
    mutationFn: id => appClient.entities.NavbarItem.delete(id),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["navbar-items"] }); 
      toast.success("Deleted!"); 
    },
    onError: (error) => {
      toast.error("Failed to delete navbar item");
      console.error(error);
    }
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, is_active }) => appClient.entities.NavbarItem.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["navbar-items"] }),
    onError: (error) => {
      toast.error("Failed to toggle visibility");
      console.error(error);
    }
  });

  const reorderMut = useMutation({
    mutationFn: ({ id, new_order }) => appClient.entities.NavbarItem.update(id, { sort_order: new_order }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["navbar-items"] }),
    onError: (error) => {
      toast.error("Failed to reorder items");
      console.error(error);
    }
  });

  const handleSave = async (data) => {
    if (editItem) {
      await updateMut.mutateAsync({ id: editItem.id, data });
    } else {
      await createMut.mutateAsync(data);
    }
  };

  const moveItem = (item, direction) => {
    const currentIndex = navItems.findIndex(i => i.id === item.id);
    let newIndex;
    
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < navItems.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return;
    }

    const targetItem = navItems[newIndex];
    
    // Swap sort orders
    reorderMut.mutateAsync({ id: item.id, new_order: targetItem.sort_order });
    reorderMut.mutateAsync({ id: targetItem.id, new_order: item.sort_order });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary">Navbar Management</h2>
          <p className="text-sm text-muted-foreground">Control website navigation menu items</p>
        </div>
        <Button onClick={() => { setEditItem(null); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : navItems.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No navbar items yet. Add your first item.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {navItems.sort((a, b) => a.sort_order - b.sort_order).map((item) => {
            const t = typeStyle[item.type] || typeStyle.link;
            return (
              <Card key={item.id} className={`border-primary/10 ${!item.is_active ? "opacity-50" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 cursor-move"
                        onClick={() => moveItem(item, 'up')}
                        disabled={navItems.findIndex(i => i.id === item.id) === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 cursor-move"
                        onClick={() => moveItem(item, 'down')}
                        disabled={navItems.findIndex(i => i.id === item.id) === navItems.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-primary">{item.label}</p>
                        <Badge className={`text-xs ${t.bg}`}>{t.icon} {item.type}</Badge>
                        {item.is_dropdown && <Badge variant="outline" className="text-xs">Dropdown</Badge>}
                        {!item.is_active && <Badge variant="outline" className="text-xs">Hidden</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">Route: {item.route}</p>
                      {item.is_dropdown && item.dropdown_items && item.dropdown_items.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Dropdown items:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.dropdown_items.map((dropdownItem, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {dropdownItem.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8" title={item.is_active ? "Hide" : "Show"}
                        onClick={() => toggleMut.mutate({ id: item.id, is_active: !item.is_active })}>
                        {item.is_active ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditItem(item); setShowForm(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.confirm("Delete this navbar item?") && deleteMut.mutate(item.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Navbar Item" : "Add New Navbar Item"}</DialogTitle>
          </DialogHeader>
          <NavbarItemForm 
            item={editItem} 
            onSave={handleSave} 
            onCancel={() => { setShowForm(false); setEditItem(null); }}
            isEdit={!!editItem}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
