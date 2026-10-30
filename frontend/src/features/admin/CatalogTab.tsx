import { useState } from "react";
import { toast } from "sonner";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useGetProceduresQuery,
  useSetProcedureActiveMutation,
} from "@/features/catalog/catalogApi";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { CreateProcedureDialog } from "./CreateProcedureDialog";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { EditProcedureDialog } from "./EditProcedureDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export function CatalogTab() {
  const [showInactive, setShowInactive] = useState(false);
  const { data: categories, isLoading: loadingCategories } =
    useGetCategoriesQuery();
  const { data: procedures, isLoading: loadingProcedures } =
    useGetProceduresQuery(showInactive);
  const [deleteCategory] = useDeleteCategoryMutation();
  const [setProcedureActive] = useSetProcedureActiveMutation();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Categories</CardTitle>
          <CreateCategoryDialog />
        </CardHeader>
        <CardContent>
          {loadingCategories ? (
            <Skeleton className="h-32 w-full" />
          ) : categories?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            <ul className="space-y-1">
              {categories?.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded px-1 py-1 text-sm hover:bg-muted/50"
                >
                  <span>{c.name}</span>
                  <div className="flex gap-1">
                    <EditCategoryDialog category={c} />
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        }
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete "{c.name}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Only possible if no procedures belong to this
                            category.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              try {
                                await deleteCategory(c.id).unwrap();
                                toast.success("Category deleted");
                              } catch (err: any) {
                                if (err?.status === 409)
                                  toast.error("Category has procedures in it");
                                else toast.error("Failed to delete");
                              }
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Procedures</CardTitle>
          <CreateProcedureDialog />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive" className="text-sm">
              Show inactive
            </Label>
          </div>

          {loadingProcedures ? (
            <Skeleton className="h-32 w-full" />
          ) : procedures?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No procedures yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedures?.map((p) => (
                  <TableRow
                    key={p.id}
                    className={!p.isActive ? "opacity-50" : ""}
                  >
                    <TableCell>
                      {p.name}{" "}
                      {!p.isActive && (
                        <Badge variant="secondary" className="ml-1">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.category?.name ?? "—"}</Badge>
                    </TableCell>
                    <TableCell>${p.price}</TableCell>
                    <TableCell className="flex justify-end gap-1">
                      <EditProcedureDialog procedure={p} />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await setProcedureActive({
                              id: p.id,
                              isActive: !p.isActive,
                            }).unwrap();
                            toast.success(
                              p.isActive
                                ? "Procedure deactivated"
                                : "Procedure activated",
                            );
                          } catch {
                            toast.error("Failed to update");
                          }
                        }}
                      >
                        {p.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
