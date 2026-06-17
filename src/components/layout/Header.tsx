import { Bell, Search } from "lucide-react";
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
import { useLocation } from "wouter";

export function Header() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    setLocation("/");
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 md:px-6 shrink-0 relative z-10 sticky top-0">
      
      {/* Mobile Branding */}
      <div className="md:hidden flex items-center gap-2 mr-4">
        <div className="bg-primary p-1.5 rounded-lg">
          <div className="h-5 w-5 bg-white mask mask-pill" /> {/* Simplified pill icon using mask maybe, or text */}
        </div>
        <h1 className="font-bold text-lg dark:text-white">PharmaFlow</h1>
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
        
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-8 w-8 rounded-full ml-1 sm:ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center outline-none">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="@admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">System Admin</p>
                  <p className="text-xs leading-none text-gray-500 text-muted-foreground">
                    admin@pharmaflow.com
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
