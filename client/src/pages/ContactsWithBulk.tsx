import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, User, Eye } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { BulkActionsToolbar } from "@/components/BulkActionsToolbar";

export default function ContactsWithBulk() {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({ subject: "", body: "" });
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  const utils = trpc.useUtils();
  const { data: contacts } = trpc.contacts.list.useQuery();

  const createMutation = trpc.contacts.create.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
      toast.success("Contact created");
      setOpen(false);
      setFormData({ firstName: "", lastName: "", email: "", phone: "" });
    },
  });

  const bulkEmailMutation = trpc.bulk.bulkEmailContacts.useMutation({
    onSuccess: (data) => {
      toast.success(`Sent ${data.successful} emails`);
      setEmailDialogOpen(false);
      setSelectedIds([]);
      setEmailData({ subject: "", body: "" });
    },
  });

  const bulkDeleteMutation = trpc.bulk.bulkDeleteContacts.useMutation({
    onSuccess: (data) => {
      utils.contacts.list.invalidate();
      toast.success(`Deleted ${data.deleted} contacts`);
      setSelectedIds([]);
    },
  });

  const handleSelectAll = () => {
    if (selectedIds.length === contacts?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts?.map((c: any) => c.id) || []);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkEmail = () => {
    setEmailDialogOpen(true);
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} contacts?`)) {
      bulkDeleteMutation.mutate({ contactIds: selectedIds });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">Manage your contact relationships</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Contact</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData as any);
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Contact</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            All Contacts
          </CardTitle>
          <CardDescription>{contacts?.length || 0} contacts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === contacts?.length && contacts?.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts?.map((contact: any) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(contact.id)}
                        onCheckedChange={() => handleSelect(contact.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/contacts/${contact.id}`}>
                        <span className="text-primary hover:underline cursor-pointer">
                          {contact.firstName} {contact.lastName}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>{contact.email || "-"}</TableCell>
                    <TableCell>{contact.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/contacts/${contact.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        onEmail={handleBulkEmail}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedIds([])}
      />

      {/* Bulk Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Bulk Email</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              bulkEmailMutation.mutate({
                contactIds: selectedIds,
                subject: emailData.subject,
                body: emailData.body,
              });
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Message *</Label>
                <Textarea
                  value={emailData.body}
                  onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                  rows={6}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Send to {selectedIds.length} contacts</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
