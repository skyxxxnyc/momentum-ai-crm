import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface CSVImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "contacts" | "companies";
  onImportComplete?: () => void;
}

export function CSVImport({ open, onOpenChange, entityType, onImportComplete }: CSVImportProps) {
  const [csvContent, setCSVContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "importing" | "complete">("upload");
  const [columns, setColumns] = useState<string[]>([]);
  const [preview, setPreview] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);
  const [importResult, setImportResult] = useState<any>(null);

  // Field mapping state
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});

  const parseCSV = trpc.csvImport.parseCSV.useMutation({
    onSuccess: (data) => {
      setColumns(data.columns);
      setPreview(data.preview);
      setRowCount(data.rowCount);
      setStep("mapping");
    },
    onError: (error) => {
      toast.error("Failed to parse CSV", {
        description: error.message,
      });
    },
  });

  const importContacts = trpc.csvImport.importContacts.useMutation({
    onSuccess: (data) => {
      setImportResult(data);
      setStep("complete");
      if (data.imported > 0) {
        toast.success(`Imported ${data.imported} contacts successfully`);
        onImportComplete?.();
      }
    },
    onError: (error) => {
      toast.error("Import failed", {
        description: error.message,
      });
      setStep("preview");
    },
  });

  const importCompanies = trpc.csvImport.importCompanies.useMutation({
    onSuccess: (data) => {
      setImportResult(data);
      setStep("complete");
      if (data.imported > 0) {
        toast.success(`Imported ${data.imported} companies successfully`);
        onImportComplete?.();
      }
    },
    onError: (error) => {
      toast.error("Import failed", {
        description: error.message,
      });
      setStep("preview");
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCSVContent(content);
      parseCSV.mutate({ csvContent: content, entityType });
    };
    reader.readAsText(file);
  };

  const handleFieldMappingChange = (targetField: string, csvColumn: string) => {
    setFieldMapping((prev) => ({
      ...prev,
      [targetField]: csvColumn,
    }));
  };

  const handlePreview = () => {
    setStep("preview");
  };

  const handleImport = () => {
    setStep("importing");
    
    if (entityType === "contacts") {
      importContacts.mutate({
        csvContent,
        fieldMapping,
        skipDuplicates,
      });
    } else {
      importCompanies.mutate({
        csvContent,
        fieldMapping,
        skipDuplicates,
      });
    }
  };

  const handleClose = () => {
    setStep("upload");
    setCSVContent("");
    setFileName("");
    setColumns([]);
    setPreview([]);
    setFieldMapping({});
    setImportResult(null);
    onOpenChange(false);
  };

  const contactFields = [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "Email", required: false },
    { key: "phone", label: "Phone", required: false },
    { key: "title", label: "Title", required: false },
    { key: "company", label: "Company", required: false },
    { key: "status", label: "Status", required: false },
    { key: "source", label: "Source", required: false },
    { key: "notes", label: "Notes", required: false },
  ];

  const companyFields = [
    { key: "name", label: "Name", required: true },
    { key: "website", label: "Website", required: false },
    { key: "industry", label: "Industry", required: false },
    { key: "size", label: "Size", required: false },
    { key: "location", label: "Location", required: false },
    { key: "revenue", label: "Revenue", required: false },
    { key: "description", label: "Description", required: false },
  ];

  const fields = entityType === "contacts" ? contactFields : companyFields;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Import {entityType === "contacts" ? "Contacts" : "Companies"} from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file and map the columns to import your data
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a CSV file with your {entityType} data
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button asChild>
                  <span>Choose File</span>
                </Button>
              </label>
              {parseCSV.isPending && (
                <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Parsing CSV...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Field Mapping */}
        {step === "mapping" && (
          <div className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {fileName}
                </CardTitle>
                <CardDescription>{rowCount} rows found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Map your CSV columns to the {entityType} fields below. Required fields are marked with *.
                  </p>
                  <div className="grid gap-4">
                    {fields.map((field) => (
                      <div key={field.key} className="grid grid-cols-2 gap-4 items-center">
                        <Label>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Select
                          value={fieldMapping[field.key] || "__skip__"}
                          onValueChange={(value) => handleFieldMappingChange(field.key, value === "__skip__" ? "" : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select column..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__skip__">-- Skip --</SelectItem>
                            {columns.map((col) => (
                              <SelectItem key={col} value={col}>
                                {col}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handlePreview} disabled={!fieldMapping.name}>
                Preview Import
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && (
          <div className="space-y-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>Import Preview</CardTitle>
                <CardDescription>
                  Review the first 5 rows before importing {rowCount} total rows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {fields
                          .filter((f) => fieldMapping[f.key])
                          .map((field) => (
                            <TableHead key={field.key}>{field.label}</TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.map((row, idx) => (
                        <TableRow key={idx}>
                          {fields
                            .filter((f) => fieldMapping[f.key])
                            .map((field) => (
                              <TableCell key={field.key}>
                                {row[fieldMapping[field.key]] || "-"}
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="skip-duplicates"
                    checked={skipDuplicates}
                    onCheckedChange={(checked) => setSkipDuplicates(checked as boolean)}
                  />
                  <label
                    htmlFor="skip-duplicates"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Skip duplicate entries
                  </label>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Back
              </Button>
              <Button onClick={handleImport}>Import {rowCount} Rows</Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 4: Importing */}
        {step === "importing" && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-lg font-semibold mb-2">Importing Data...</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we import your {entityType}
            </p>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === "complete" && importResult && (
          <div className="space-y-4 py-4">
            <div className="text-center py-8">
              {importResult.imported > 0 ? (
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
              ) : (
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              )}
              <h3 className="text-2xl font-bold mb-2">Import Complete</h3>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-6">
                <div>
                  <p className="text-3xl font-bold text-green-600">{importResult.imported}</p>
                  <p className="text-sm text-muted-foreground">Imported</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-yellow-600">{importResult.skipped}</p>
                  <p className="text-sm text-muted-foreground">Skipped</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{importResult.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-6 text-left">
                  <h4 className="font-semibold mb-2 text-destructive">Errors:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {importResult.errors.map((error: string, idx: number) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
