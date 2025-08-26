import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import cityscapeImage from "../../public/bg.webp";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      if (username && password) {
        toast({
          title: "Login Successful",
          description: "Welcome to Wax Museum Dashboard",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: "Please enter both username and password",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: `url(${cityscapeImage})` }}
    >
      {/* Animated overlay particles */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/40">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-neon-cyan rounded-full animate-float opacity-60"></div>
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-neon-pink rounded-full animate-float opacity-80"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-neon-blue rounded-full animate-float opacity-40"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-neon-purple rounded-full animate-float opacity-70"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <Card className="glass-card w-full max-w-md mx-4 animate-fade-in border-0 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold neon-text-primary animate-glow-pulse">
            Wax Museum
          </CardTitle>
          <p className="text-muted-foreground text-lg mt-2">
            Access your dashboard
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="glass-input h-12 text-foreground placeholder-muted-foreground border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input h-12 text-foreground placeholder-muted-foreground border-primary/20 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              variant="gradient-primary"
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
