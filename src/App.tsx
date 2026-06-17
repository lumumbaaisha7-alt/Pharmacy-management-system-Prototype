import { Switch, Route, useLocation } from "wouter";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Medicines } from "./pages/Medicines";
import { Inventory } from "./pages/Inventory";
import { POS } from "./pages/POS";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { Installer } from "./pages/Installer";
import { useEffect } from "react";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [location, setLocation] = useLocation();

  // Basic redirect logic for demo purposes
  useEffect(() => {
    const isInstalled = localStorage.getItem("app_installed") === "true";
    if (!isInstalled && location !== "/install") {
      setLocation("/install");
      return;
    }

    // If not on a valid route, go to login
    if (isInstalled && location !== "/" && location !== "/dashboard" && location !== "/medicines" && location !== "/inventory" && location !== "/pos" && location !== "/reports" && location !== "/settings" && location !== "/install") {
      setLocation("/");
    }
  }, [location, setLocation]);

  return (
    <>
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/install" component={Installer} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/medicines" component={Medicines} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/pos" component={POS} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
      </Switch>
      <Toaster position="top-right" />
    </>
  );
}
