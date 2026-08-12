import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { StaffTab } from "@/features/admin/StaffTab";
import { CatalogTab } from "@/features/admin/CatalogTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function AdminPage() {
  const user = useAppSelector((state) => state.auth.user);

  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Manage staff and the treatment catalog
        </p>
      </div>

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
        </TabsList>
        <TabsContent value="staff" className="pt-4">
          <StaffTab />
        </TabsContent>
        <TabsContent value="catalog" className="pt-4">
          <CatalogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
