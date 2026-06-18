import { 
  Building2, 
  LayoutDashboard, 
  Pill, 
  ShoppingCart, 
  FileText, 
  Users, 
  Settings,
  Package,
  Activity,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useSettings } from "../../hooks/useSettings";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Medicines", href: "/medicines", icon: Pill },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Suppliers", href: "#suppliers", icon: Building2 },
  { name: "Purchases", href: "#purchases", icon: Activity },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const [location] = useLocation();
  const { settings } = useSettings();

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out bg-[#052b36] flex-shrink-0 flex flex-col h-full text-white relative`}>
      {/* Collapse Toggle */}
      {onToggle && (
        <button 
          onClick={onToggle}
          className="absolute -right-3 top-20 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full p-1 z-20 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}

      {/* Brand */}
      <div className={`h-16 flex items-center ${collapsed ? 'justify-center px-0' : 'px-6'} border-b border-white/10 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg shrink-0 flex items-center justify-center">
            {settings.logo_base64 ? (
              <img src={settings.logo_base64} alt="Logo" className="h-6 w-6 object-contain" />
            ) : (
              <Pill className="h-6 w-6 text-white" />
            )}
          </div>
          {!collapsed && (
            <div className="overflow-hidden whitespace-nowrap animate-in fade-in zoom-in duration-300">
              <h1 className="font-bold text-lg leading-tight truncate max-w-[120px]">{settings.pharmacy_name || "PharmaFlow"}</h1>
              <p className="text-[10px] text-green-400 font-medium tracking-wider">ENTERPRISE ERP</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0 opacity-90" />
              {!collapsed && <span className="truncate whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom context */}
      <div className={`p-4 border-t border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`bg-white/5 rounded-xl ${collapsed ? 'p-2' : 'p-4'} cursor-pointer hover:bg-white/10 transition`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="h-8 w-8 shrink-0 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <Users className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <p className="text-xs font-medium text-white truncate">System Admin</p>
                <p className="text-[10px] text-gray-400 truncate">Main Branch</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
