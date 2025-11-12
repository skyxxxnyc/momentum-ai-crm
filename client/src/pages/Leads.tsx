import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Leads() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", company: "" });
  const utils = trpc.useUtils();
  const { data: leads } = trpc.leads.list.useQuery();
  const { data: hotLeads } = trpc.leads.hot.useQuery();
  const createMutation = trpc.leads.create.useMutation({
    onSuccess: () => { utils.leads.list.invalidate(); toast.success("Lead created"); setOpen(false); setFormData({ firstName: "", lastName: "", email: "", company: "" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Leads</h1><p className="text-muted-foreground">Manage your prospecting pipeline</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Add Lead</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Lead</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>First Name *</Label><Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Last Name</Label><Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Company</Label><Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} /></div>
              </div>
              <DialogFooter><Button type="submit">Create Lead</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {hotLeads && hotLeads.length > 0 && (
        <Card className="border-primary/50">
          <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" />Hot Leads</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">{hotLeads.slice(0, 5).map(lead => (<div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-primary/10"><div><p className="font-medium">{lead.firstName} {lead.lastName}</p><p className="text-sm text-muted-foreground">{lead.company}</p></div><Badge variant="default">Score: {lead.score}</Badge></div>))}</div></CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>All Leads</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto"><Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Company</TableHead><TableHead>Status</TableHead><TableHead>Score</TableHead></TableRow></TableHeader>
            <TableBody>
              {leads?.map(lead => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.firstName} {lead.lastName}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{lead.status}</Badge></TableCell>
                  <TableCell><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />{lead.score}</div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></div>
        </CardContent>
      </Card>
    </div>
  );
}
