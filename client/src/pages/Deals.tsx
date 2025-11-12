import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Target, Trash2, Edit, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Deals() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", value: 0, stage: "lead", probability: 50 });
  const utils = trpc.useUtils();
  const { data: deals } = trpc.deals.list.useQuery();
  const createMutation = trpc.deals.create.useMutation({
    onSuccess: () => { utils.deals.list.invalidate(); toast.success("Deal created"); setOpen(false); setFormData({ title: "", value: 0, stage: "lead", probability: 50 }); },
  });
  const deleteMutation = trpc.deals.delete.useMutation({
    onSuccess: () => { utils.deals.list.invalidate(); toast.success("Deal deleted"); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Deals</h1><p className="text-muted-foreground">Manage your sales pipeline</p></div>
        <div className="flex gap-2">
          <Link href="/deals/kanban"><Button variant="outline">Kanban View</Button></Link>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Add Deal</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Deal</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData as any); }}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2"><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Value ($)</Label><Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })} /></div>
                  <div className="space-y-2"><Label>Stage</Label><Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="lead">Lead</SelectItem><SelectItem value="qualified">Qualified</SelectItem><SelectItem value="proposal">Proposal</SelectItem><SelectItem value="negotiation">Negotiation</SelectItem><SelectItem value="closed_won">Closed Won</SelectItem><SelectItem value="closed_lost">Closed Lost</SelectItem></SelectContent></Select></div>
                  <div className="space-y-2"><Label>Probability (%)</Label><Input type="number" value={formData.probability} onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })} /></div>
                </div>
                <DialogFooter><Button type="submit">Create Deal</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>All Deals</CardTitle><CardDescription>{deals?.length || 0} deals</CardDescription></CardHeader>
        <CardContent>
          {!deals || deals.length === 0 ? (
            <div className="text-center py-12"><Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground mb-4">No deals yet</p><Button onClick={() => setOpen(true)}>Create First Deal</Button></div>
          ) : (
            <div className="overflow-x-auto"><Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Value</TableHead><TableHead>Stage</TableHead><TableHead>Probability</TableHead><TableHead>Momentum</TableHead><TableHead>Health</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.title}</TableCell>
                    <TableCell>${(deal.value || 0).toLocaleString()}</TableCell>
                    <TableCell><span className="capitalize">{deal.stage.replace("_", " ")}</span></TableCell>
                    <TableCell>{deal.probability}%</TableCell>
                    <TableCell><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />{deal.momentumScore}</div></TableCell>
                    <TableCell><span className={`px-2 py-1 rounded text-xs ${deal.dealHealth === "healthy" ? "bg-green-500/20 text-green-500" : deal.dealHealth === "at_risk" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"}`}>{deal.dealHealth}</span></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => confirm("Delete?") && deleteMutation.mutate({ id: deal.id })}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
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
