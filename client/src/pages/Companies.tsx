import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Building2, Trash2, Edit, Globe } from "lucide-react";
import { toast } from "sonner";

export default function Companies() {
  const [open, setOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", website: "", industry: "", description: "" });
  const utils = trpc.useUtils();
  const { data: companies, isLoading } = trpc.companies.list.useQuery();
  const createMutation = trpc.companies.create.useMutation({
    onSuccess: () => { utils.companies.list.invalidate(); toast.success("Company created"); setOpen(false); setFormData({ name: "", website: "", industry: "", description: "" }); },
  });
  const updateMutation = trpc.companies.update.useMutation({
    onSuccess: () => { utils.companies.list.invalidate(); toast.success("Company updated"); setOpen(false); setFormData({ name: "", website: "", industry: "", description: "" }); setEditingCompany(null); },
  });
  const deleteMutation = trpc.companies.delete.useMutation({
    onSuccess: () => { utils.companies.list.invalidate(); toast.success("Company deleted"); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Companies</h1><p className="text-muted-foreground">Manage your company accounts</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Add Company</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingCompany ? "Edit" : "Create"} Company</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Website</Label><Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} /></div>
                <div className="space-y-2"><Label>Industry</Label><Input value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
              </div>
              <DialogFooter><Button type="submit">{editingCompany ? "Update" : "Create"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle>All Companies</CardTitle><CardDescription>{companies?.length || 0} companies</CardDescription></CardHeader>
        <CardContent>
          {!companies || companies.length === 0 ? (
            <div className="text-center py-12"><Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground mb-4">No companies yet</p><Button onClick={() => setOpen(true)}>Add First Company</Button></div>
          ) : (
            <div className="overflow-x-auto"><Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Industry</TableHead><TableHead>Website</TableHead><TableHead>Relationship</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.industry}</TableCell>
                    <TableCell>{company.website && <a href={company.website} target="_blank" className="flex items-center gap-2 text-primary hover:underline"><Globe className="h-4 w-4" />{company.website}</a>}</TableCell>
                    <TableCell><div className="h-2 w-16 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${company.relationshipStrength}%` }} /></div></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => { setEditingCompany(company); setFormData({ name: company.name, website: company.website || "", industry: company.industry || "", description: company.description || "" }); setOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => confirm("Delete?") && deleteMutation.mutate({ id: company.id })}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
