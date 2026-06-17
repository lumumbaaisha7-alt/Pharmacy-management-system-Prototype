import { Bell, Search, AlertCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ThemeToggle } from "../ThemeToggle";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";

import { useAuth } from "../../hooks/useAuth";
import { useSettings } from "../../hooks/useSettings";
import { EditProfileModal } from "../ui/EditProfileModal";
import api from "../../lib/api";

export function Header() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { settings } = useSettings();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load alerts", err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  const alertCount = (stats?.low_stock_count || 0) + (stats?.expiring_soon_count || 0);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 md:px-6 shrink-0 relative z-10 sticky top-0">
        
        {/* Mobile Branding */}
        <div className="md:hidden flex items-center gap-2 mr-4">
          <div className="bg-primary p-1.5 rounded-lg">
            {settings.logo_base64 ? (
              <img src={settings.logo_base64} alt="Logo" className="w-5 h-5 object-contain filter brightness-0 invert" />
            ) : (
              <div className="h-5 w-5 bg-white mask mask-pill" style={{ maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z\'/%3E%3Cpath d=\'m8.5 8.5 7 7\'/%3E%3C/svg%3E")', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', backgroundColor: 'white' }} />
            )}
          </div>
          <h1 className="font-bold text-lg dark:text-white truncate max-w-[150px]">{settings.pharmacy_name || "PharmaFlow"}</h1>
        </div>

        <div className="flex-1 max-w-xl hidden md:flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search products, invoices, customers..." 
              className="pl-10 w-full bg-gray-100 dark:bg-gray-800 border-transparent focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative rounded-full" />}>
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {alertCount > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{alertCount} New</span>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto p-1">
                {alertCount === 0 && (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    No new alerts
                  </div>
                )}
                {stats?.low_stock_alerts?.map((item: any) => (
                  <Link key={item.id} href="/inventory">
                    <div className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                      <div className="mt-0.5 h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                        <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium leading-none">Low Stock Alert</p>
                        <p className="text-xs text-gray-500 leading-tight">
                          <strong>{item.name}</strong> is running low ({item.stock} units left).
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                {stats?.expiring_soon_alerts?.map((item: any) => (
                  <Link key={item.id} href="/medicines">
                    <div className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                      <div className="mt-0.5 h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium leading-none">Medicine Expiring</p>
                        <p className="text-xs text-gray-500 leading-tight">
                          <strong>{item.name}</strong> expires on {new Date(item.expiry).toLocaleDateString()}.
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary font-medium cursor-pointer" onClick={() => setLocation('/reports')}>
                 View all reports
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-8 w-8 rounded-full ml-1 sm:ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || "https://i.pravatar.cc/150?u=admin"} alt="@admin" />
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "AD"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || "System Admin"}</p>
                    <p className="text-xs leading-none text-gray-500 text-muted-foreground">
                      {user?.email || "admin@pharmaflow.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <EditProfileModal open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </>
  );
}
