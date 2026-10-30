import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCreateLeadMutation } from "@/features/leads/leadsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface FormValues {
  clinicName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
}

export function RequestDemoPage() {
  const [createLead, { isLoading }] = useCreateLeadMutation();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    try {
      await createLead({
        clinicName: values.clinicName,
        contactName: values.contactName,
        email: values.email,
        phone: values.phone || undefined,
        message: values.message || undefined,
      }).unwrap();
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong — please try again");
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold">Thank you</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We received your request and will reach out shortly.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              Back to home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Request a demo</CardTitle>
          <CardDescription>
            Tell us about your clinic and we'll be in touch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic name</Label>
              <Input
                id="clinicName"
                {...register("clinicName", { required: true })}
              />
              {errors.clinicName && (
                <p className="text-sm text-destructive">Required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Your name</Label>
              <Input
                id="contactName"
                {...register("contactName", { required: true })}
              />
              {errors.contactName && (
                <p className="text-sm text-destructive">Required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: true })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">Required</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea id="message" {...register("message")} rows={3} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Request a demo"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
