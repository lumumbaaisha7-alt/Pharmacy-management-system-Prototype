import { Switch, Route, useLocation } from "wouter";
import React, { Suspense, useEffect, useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { SettingsProvider, useSettings } from "./hooks/useSettings";
import { PageLoader } from "./components/ui/PageLoader";
import { ErrorBoundary } from "./components/ErrorBoundary";

const Dashboard = React.lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const Login = React.lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Medicines = React.lazy(() => import("./pages/Medicines").then(m => ({ default: m.Medicines })));
const Inventory = React.lazy(() => import("./pages/Inventory").then(m => ({ default: m.Inventory })));
const POS = React.lazy(() => import("./pages/POS").then(m => ({ default: m.POS })));
const Reports = React.lazy(() => import("./pages/Reports").then(m => ({ default: m.Reports })));
const Settings = React.lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
const Installer = React.lazy(() => import("./pages/Installer").then(m => ({ default: m.Installer })));

const NotFound = () => {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Page not found</h2>
        <button 
          onClick={() => setLocation("/dashboard")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

function AppContent() {
  const [location, setLocation] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { settings, isLoading: isSettingsLoading } = useSettings();

  useEffect(() => {
    if (isSettingsLoading) return;

    const isAppInstalled = settings.app_installed === "true";

    if (!isAppInstalled && location !== "/install") {
      setLocation("/install");
      return;
    }

    if (isAppInstalled && location === "/install") {
      setLocation("/");
      return;
    }

    if (isAppInstalled) {
      if (!isAuthLoading) {
        if (!user && location !== "/") {
          setLocation("/");
        } else if (user && location === "/") {
          setLocation("/dashboard");
        }
      }
    }
  }, [location, setLocation, user, isAuthLoading, isSettingsLoading, settings]);

  if (isSettingsLoading || isAuthLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <PageLoader />
      <Suspense fallback={null}>
        <Switch>
          <Route path="/" component={Login} />
          <Route path="/install" component={Installer} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/medicines" component={Medicines} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/pos" component={POS} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route path="/:rest*" component={NotFound} />
        </Switch>
      </Suspense>
      <Toaster position="top-right" />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}
