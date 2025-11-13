import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Trash2, Edit, Play } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function ICPs() {
  const [open, setOpen] = useState(false);
  const [editingICP, setEditingICP] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    companySize: "",
    location: "",
    revenue: "",
    keywords: "",
  });

  const utils = trpc.useUtils();
  const { data: icps, isLoading } = trpc.icps.list.useQuery();

  const createMutation = trpc.icps.create.useMutation({
    onSuccess: () => {
      utils.icps.list.invalidate();
      toast.success("ICP created successfully");
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.icps.update.useMutation({
    onSuccess: () => {
      utils.icps.list.invalidate();
      toast.success("ICP updated successfully");
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.icps.delete.useMutation({
    onSuccess: () => {
      utils.icps.list.invalidate();
      toast.success("ICP deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      industry: "",
      companySize: "",
      location: "",
      revenue: "",
      keywords: "",
    });
    setEditingICP(null);
  };

  const handleEdit = (icp: any) => {
    setEditingICP(icp);
    setFormData({
      name: icp.name || "",
      description: icp.description || "",
      industry: icp.industry || "",
      companySize: icp.companySize || "",
      location: icp.location || "",
      revenue: icp.revenue || "",
      keywords: icp.keywords || "",
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingICP) {
      updateMutation.mutate({ id: editingICP.id, ...formData } as any);
    } else {
      createMutation.mutate(formData as any);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this ICP?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ideal Customer Profiles</h1>
          <p className="text-muted-foreground">Define and manage your target customer profiles</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => resetForm()}>
              <Plus className="h-4 w-4" />
              Add ICP
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingICP ? "Edit ICP" : "Create ICP"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mid-Market SaaS Companies"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your ideal customer profile..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="e.g., Technology, Healthcare"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Input
                      value={formData.companySize}
                      onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                      placeholder="e.g., 50-200 employees"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., United States, San Francisco"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Revenue Range</Label>
                    <Input
                      value={formData.revenue}
                      onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                      placeholder="e.g., $1M-$10M"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="e.g., cloud, automation, AI (comma-separated)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingICP ? "Update ICP" : "Create ICP"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            All ICPs
          </CardTitle>
          <CardDescription>{icps?.length || 0} ideal customer profiles</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading ICPs...</div>
          ) : icps && icps.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Company Size</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {icps.map((icp: any) => (
                    <TableRow key={icp.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{icp.name}</p>
                          {icp.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {icp.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {icp.industry ? (
                          <Badge variant="outline">{icp.industry}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{icp.companySize || "-"}</TableCell>
                      <TableCell>{icp.location || "-"}</TableCell>
                      <TableCell>{icp.revenue || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/prospecting-agent?icpId=${icp.id}`}>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Play className="h-4 w-4" />
                              Run
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(icp)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(icp.id)}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No ICPs Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first Ideal Customer Profile to start prospecting
              </p>
              <Button onClick={() => setOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create ICP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
