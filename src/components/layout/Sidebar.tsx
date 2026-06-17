import { 
  Building2, 
  LayoutDashboard, 
  Pill, 
  ShoppingCart, 
  FileText, 
  Users, 
  Settings,
  Package,
  Activity
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

export function Sidebar() {
  const [location] = useLocation();
  const { settings } = useSettings();

  return (
    <aside className="w-64 bg-[#052b36] flex-shrink-0 flex flex-col h-full text-white">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-1.5 rounded-lg">
            {settings.logo_base64 ? (
              <img src={settings.logo_base64} alt="Logo" className="h-6 w-6 object-contain" />
            ) : (
              <Pill className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight truncate max-w-[120px]">{settings.pharmacy_name || "PharmaFlow"}</h1>
            <p className="text-[10px] text-green-400 font-medium tracking-wider">ENTERPRISE ERP</p>
          </div>
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
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
            >
              <item.icon className="h-5 w-5 opacity-90" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom context */}
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">System Admin</p>
              <p className="text-[10px] text-gray-400">Main Branch</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
