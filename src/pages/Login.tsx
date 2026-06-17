import { useState } from "react";
import { Pill } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { useLocation } from "wouter";
import Swal from "sweetalert2";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    const success = await login(email, password);
    setLoading(false);

    if (success) {
      Swal.fire({
        title: "Welcome back!",
        text: "Successfully logged in to PharmaFlow",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent dark:from-primary/20 pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/30">
            <Pill className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">PharmaFlow ERP</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to the pharmacy management system</p>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@pharmaflow.com" 
                  required 
                  defaultValue="admin@pharmaflow.com"
                  className="bg-white dark:bg-gray-950"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-primary font-medium hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  defaultValue="password123"
                  className="bg-white dark:bg-gray-950"
                />
              </div>
              
              <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
                {loading ? "Authenticating..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              <p>Secure Enterprise Portal Access Only</p>
              <p className="mt-1">&copy; 2026 PharmaFlow Systems</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
