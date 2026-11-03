import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useLoginMutation } from "@/features/auth/authApi";
import { useAppDispatch } from "@/app/hooks";
import { credentialsSet } from "@/features/auth/authSlice";
import { loginSchema, type LoginFormValues } from "@/features/auth/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiSlice } from "@/lib/apiBaseQuery";

export function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  async function onSubmit(values: LoginFormValues) {
    try {
      const result = await login(values).unwrap();
      dispatch(apiSlice.util.resetApiState()); // fresh cache per session
      dispatch(credentialsSet(result as any));
      navigate(
        result.user.role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard",
        { replace: true },
      );
    } catch (err: any) {
      toast.error(err?.data?.error?.message ?? "Invalid email or password");
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="hidden flex-col justify-between bg-[#13201C] p-10 text-white lg:flex xl:p-14">
        <Link to="/" className="ff-display text-lg font-medium">
          HSL
          <span className="ml-1 text-[#D9A441]">Clinic</span>
        </Link>

        <div>
          <p className="ff-mono text-xs uppercase tracking-wider text-[#D9A441]">
            Staff access only
          </p>
          <h1 className="ff-display mt-3 max-w-md text-4xl font-medium leading-tight xl:text-[2.75rem]">
            Run your clinic from one simple workspace.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
            Patients, appointments, clinical records, invoices and payments —
            connected in the same place, for everyone on your team.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/80">
            <span>✓ Patient records</span>
            <span>✓ Scheduling</span>
            <span>✓ Billing</span>
          </div>
        </div>

        <p className="ff-mono text-[10px] text-white/40">app.hslclinic.com</p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-[#F4F6F3] p-6">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="ff-display mb-8 inline-block text-lg font-medium lg:hidden"
          >
            HSL<span className="ml-1 text-[#1F5D4C]">Clinic</span>
          </Link>

          <p className="ff-mono text-xs uppercase tracking-wider text-[#1F5D4C]">
            Welcome back
          </p>

          <h2 className="ff-display mt-2 text-3xl font-medium tracking-tight">
            Sign in
          </h2>

          <p className="mt-2 text-sm text-[#55645C]">
            Use your clinic staff account to continue.
          </p>

          <div className="mt-8 rounded-xl border border-[#D7DED8] bg-white p-6 shadow-[0_12px_40px_rgba(19,32,28,0.06)]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs text-[#55645C]">
                  Email
                </Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs text-[#55645C]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="mt-2 w-full bg-[#1F5D4C] hover:bg-[#1A4F41]"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-[#7B867F]">
            Need an account? Contact your clinic administrator.
          </p>
        </div>
      </main>
    </div>
  );
}
