import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useGetMyClinicQuery,
  useUpdateMyClinicMutation,
} from "@/features/clinic/clinicApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FormValues {
  name: string;
  address: string;
  phone: string;
}

export function ClinicSettingsTab() {
  const { data: clinic, isLoading } = useGetMyClinicQuery();
  const [updateClinic, { isLoading: saving }] = useUpdateMyClinicMutation();

  const { register, handleSubmit } = useForm<FormValues>({
    values: {
      name: clinic?.name ?? "",
      address: clinic?.address ?? "",
      phone: clinic?.phone ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await updateClinic(values as any).unwrap();
      toast.success("Clinic info updated");
    } catch {
      toast.error("Failed to update clinic info");
    }
  }

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <Card className="max-w-lg">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Clinic name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
