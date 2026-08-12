import {
  useGetCategoriesQuery,
  useGetProceduresQuery,
} from "@/features/catalog/catalogApi";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { CreateProcedureDialog } from "./CreateProcedureDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function CatalogTab() {
  const { data: categories, isLoading: loadingCategories } =
    useGetCategoriesQuery();
  const { data: procedures, isLoading: loadingProcedures } =
    useGetProceduresQuery();

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
            <ul className="space-y-2">
              {categories?.map((c) => (
                <li key={c.id} className="text-sm">
                  {c.name}
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
        <CardContent>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedures?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.category?.name ?? "—"}</Badge>
                    </TableCell>
                    <TableCell>${p.price}</TableCell>
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
