import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { ReactNode, useState } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar collapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      </div>

      <div className="flex-1 flex flex-col w-full h-full relative">
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl h-full flex flex-col min-h-full">
            <div className="flex-1">
              {children}
            </div>
            
            {/* Footer */}
            <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 pb-4">
              <p>&copy; {new Date().getFullYear()} PharmaFlow ERP System. All rights reserved.</p>
            </footer>
          </div>
        </main>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
