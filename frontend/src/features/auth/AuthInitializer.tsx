import { useEffect, useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import { credentialsSet, loggedOut } from "./authSlice";
import { useRefreshMutation, useLazyGetMeQuery } from "./authApi";
import type { AuthUser } from "./authSlice";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [refresh] = useRefreshMutation();
  const [getMe] = useLazyGetMeQuery();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        const refreshResult = await refresh().unwrap();
        const meResult = await getMe().unwrap();
        dispatch(
          credentialsSet({
            accessToken: refreshResult.accessToken,
            user: meResult.user as AuthUser,
          }),
        );
      } catch {
        dispatch(loggedOut());
      } finally {
        setChecked(true);
      }
    }
    bootstrap();
  }, []);

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
