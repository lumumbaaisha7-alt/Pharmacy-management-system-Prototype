import { useState } from "react";
import { AppLayout } from "../../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Store, User, Users, Palette, Save, Upload } from "lucide-react";
import { toast } from "sonner";

export function Settings() {
  const [systemName, setSystemName] = useState("MediCare Pharmacy");
  const [email, setEmail] = useState("contact@medicare.com");
  const [phone, setPhone] = useState("+255 123 456 789");
  const [address, setAddress] = useState("123 Health Ave, Medical District");
  
  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
            <p className="text-gray-500 mt-1">Manage your pharmacy configuration and preferences.</p>
          </div>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2"><Store className="h-4 w-4" /> General</TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2"><Users className="h-4 w-4" /> Users</TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2"><User className="h-4 w-4" /> Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pharmacy Profile</CardTitle>
                <CardDescription>Basic information about your pharmacy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sys-name">System Name</Label>
                    <Input id="sys-name" value={systemName} onChange={(e) => setSystemName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sys-phone">Phone Number</Label>
                    <Input id="sys-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sys-email">Email Address</Label>
                    <Input id="sys-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sys-address">Physical Address</Label>
                    <Input id="sys-address" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Branding & Theme</CardTitle>
                <CardDescription>Customize the look and feel of your POS.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Logo</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-primary/50 transition-colors cursor-pointer bg-gray-50/50">
                      <Upload className="h-8 w-8 mb-2 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Click to upload logo</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label>Favicon</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-primary/50 transition-colors cursor-pointer bg-gray-50/50">
                      <Palette className="h-8 w-8 mb-2 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">Click to upload icon</span>
                      <span className="text-xs text-gray-400 mt-1">ICO or PNG format</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Dark Mode Settings</Label>
                    <p className="text-sm text-gray-500">Enable default dark mode for all users automatically.</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Compact View</Label>
                    <p className="text-sm text-gray-500">Use denser tables and smaller fonts throughout the UI.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage staff accounts and access levels.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex flex-col items-center justify-center text-center">
                  <Users className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-gray-500">User management module would be listed here.</p>
                  <Button variant="outline" className="mt-4">Add New User</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>Define what each role can access in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex flex-col items-center justify-center text-center">
                  <User className="h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-gray-500">Role configuration matrix would be listed here.</p>
                  <Button variant="outline" className="mt-4">Create Custom Role</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </AppLayout>
  );
}
