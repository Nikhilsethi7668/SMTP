import { Navigate, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: ("admin" | "user")[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  // ✅ If no user, show message box instead of instant redirect
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full text-center p-6 shadow-lg border border-border">
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
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full text-center p-6 shadow-lg border border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Unauthorized</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              You don’t have permission to view this page.
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
