import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-background">
      <div className="text-center glass-card p-8 rounded-2xl max-w-md mx-4 animate-fade-in">
        <h1 className="text-6xl font-bold mb-4 neon-text-primary">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Oops! Page not found
        </p>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate("/")} variant="gradient-primary">
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
