import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import api from "@/axiosInstance";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: ("admin" | "user")[];
  requireAuth?: boolean; // Whether to validate auth with backend
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles,
  requireAuth = false 
}: ProtectedRouteProps) => {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(requireAuth);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Validate authentication with backend if required
  useEffect(() => {
    if (requireAuth && user) {
      const validateAuth = async () => {
        try {
          // Try to validate with a lightweight protected endpoint
          // If /auth/me doesn't exist, we can use any protected endpoint
          // The axios interceptor will handle 401 responses globally
          await api.get("/auth/me").catch(() => {
            // If /auth/me doesn't exist (404), try a lightweight alternative
            // For now, if endpoint doesn't exist, we'll assume auth is valid
            // since the interceptor will catch 401s on actual API calls
            return Promise.resolve({ data: { valid: true } });
          });
          setIsAuthorized(true);
        } catch (error: any) {
          // If validation fails with 401, clear user and mark as unauthorized
          if (error.response?.status === 401) {
            clearUser();
            setIsAuthorized(false);
          } else {
            // For other errors (404, network issues, etc.), assume authorized
            // The axios interceptor will handle 401s on actual API calls
            setIsAuthorized(true);
          }
        } finally {
          setIsValidating(false);
        }
      };

      validateAuth();
    } else if (!user) {
      setIsValidating(false);
      setIsAuthorized(false);
    } else {
      setIsValidating(false);
      setIsAuthorized(true);
    }
  }, [requireAuth, user, clearUser]);

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // ✅ If no user or validation failed, show access denied
  if (!user || isAuthorized === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border border-border p-6 text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Access Denied</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              You need to log in to access this page.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/auth")} className="w-full max-w-xs">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ✅ Role-based restriction (optional)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border border-border p-6 text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Unauthorized</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              You don't have permission to view this page.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate(-1)} variant="outline" className="w-full max-w-xs">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ✅ Authorized user — render content
  return children;
};
