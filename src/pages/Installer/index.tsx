import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Progress } from "../../components/ui/progress";
import { Pill, CheckCircle2, ChevronRight, Store, Settings as SettingsIcon, Shield, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Swal from "sweetalert2";
import api from "../../lib/api";

export function Installer() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);

  // Form states
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyPhone, setPharmacyPhone] = useState("");
  const [pharmacyEmail, setPharmacyEmail] = useState("");
  const [pharmacyAddress, setPharmacyAddress] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [faviconBase64, setFaviconBase64] = useState<string | null>(null);

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const [statusMessage, setStatusMessage] = useState("Preparing installation...");

  const handleInstall = async () => {
    setInstalling(true);
    setStep(5);
    
    try {
      await api.post("/install", {
        pharmacyDetails: { name: pharmacyName, email: pharmacyEmail, phone: pharmacyPhone, address: pharmacyAddress },
        adminDetails: { name: adminName, email: adminEmail, password: adminPassword },
        branding: { currency: "TZS", timezone: "Africa/Dar_es_Salaam", logo_base64: logoBase64, favicon_base64: faviconBase64 } 
      });

      const interval = setInterval(async () => {
        try {
          const res = await api.get("/install/status");
          setProgress(res.data.progress);
          setStatusMessage(res.data.message);
          
          if (res.data.complete) {
            clearInterval(interval);
            setTimeout(() => {
              setInstalling(false);
              setStep(6);
            }, 500);
          } else if (res.data.error) {
            clearInterval(interval);
            Swal.fire({ title: "Error", text: res.data.error, icon: "error" });
            setStep(4);
            setInstalling(false);
          }
        } catch (e) {
          // ignore polling errors
        }
      }, 500);
    } catch (error: any) {
      Swal.fire({ title: "Error", text: error.response?.data?.error || "Installation failed", icon: "error" });
      setStep(4);
      setInstalling(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') setLogoBase64(reader.result as string);
        if (type === 'favicon') setFaviconBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const finishInstallation = () => {
    Swal.fire({
      title: "Success!",
      text: "System installed successfully. Please login.",
      icon: "success",
      confirmButtonColor: "var(--color-primary)"
    }).then(() => {
      window.location.href = "/";
    });
  };

  const steps = [
    { num: 1, title: "Welcome" },
    { num: 2, title: "Pharmacy Details" },
    { num: 3, title: "Branding" },
    { num: 4, title: "Administrator" },
    { num: 5, title: "Install" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 -z-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
      
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        
        {/* Left Sidebar (Progress) */}
        <div className="hidden md:block md:col-span-4 bg-gray-50/50 dark:bg-gray-950 p-8 border-r border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-primary font-bold text-xl mb-12">
            <Pill className="h-6 w-6" />
            MediPOS Setup
          </div>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-800 before:to-transparent">
            {steps.map((s, i) => (
              <div key={s.num} className="relative flex items-center justify-between md:justify-normal md:gap-4 pl-8 md:pl-0">
                <div className={`
                  z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 
                  ${step > s.num ? 'bg-primary border-primary text-white' : 
                    step === s.num ? 'bg-white dark:bg-gray-900 border-primary text-primary outline outline-offset-2 outline-primary/30' : 
                    'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'}
                  text-xs font-semibold shrink-0 absolute left-0 md:relative shadow-sm transition-all duration-300
                `}>
                  {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                </div>
                <div className={`font-medium text-sm transition-colors duration-300 ${step >= s.num ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  {s.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="col-span-1 md:col-span-8 p-6 md:p-10 flex flex-col min-h-[500px]">
          
          <AnimatePresence mode="wait">
            {/* STEP 1: Welcome */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center text-center"
              >
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Pill className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-4">Welcome to MediPOS</h1>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                  Get your pharmacy management system running in a few simple steps. The wizard will guide you through the setup.
                </p>
                <div className="mt-auto">
                  <Button size="lg" className="px-8 shadow-lg shadow-primary/20" onClick={nextStep}>
                    Start Installation <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Pharmacy Details */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-2"><Store className="text-primary h-6 w-6" /> Pharmacy Details</h2>
                  <p className="text-gray-500 mt-1">Enter your main business information.</p>
                </div>
                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <Label htmlFor="pharmacy_name">Pharmacy/Business Name *</Label>
                    <Input id="pharmacy_name" placeholder="e.g., MediCare Plus" value={pharmacyName} onChange={e => setPharmacyName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <Label htmlFor="pharmacy_phone">Phone Number</Label>
                      <Input id="pharmacy_phone" placeholder="+255..." value={pharmacyPhone} onChange={e => setPharmacyPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pharmacy_email">Email Address</Label>
                      <Input id="pharmacy_email" placeholder="contact@..." value={pharmacyEmail} onChange={e => setPharmacyEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pharmacy_address">Physical Address</Label>
                    <Input id="pharmacy_address" placeholder="Street, City, Country" value={pharmacyAddress} onChange={e => setPharmacyAddress(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button variant="ghost" onClick={prevStep}>Back</Button>
                  <Button onClick={nextStep} disabled={!pharmacyName}>Next Step</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Branding */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon className="text-primary h-6 w-6" /> Appearance & Localization</h2>
                  <p className="text-gray-500 mt-1">Set up your preferences (can be changed later).</p>
                </div>
                <div className="space-y-6 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Logo</Label>
                      <Input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={(e) => handleFileChange(e, 'logo')} />
                      {logoBase64 && <img src={logoBase64} alt="Logo preview" className="h-16 w-auto mt-2 object-contain" />}
                    </div>
                    <div className="space-y-2">
                      <Label>Favicon</Label>
                      <Input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={(e) => handleFileChange(e, 'favicon')} />
                      {faviconBase64 && <img src={faviconBase64} alt="Favicon preview" className="h-8 w-8 mt-2 object-contain" />}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Default Currency</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="border-2 border-primary bg-primary/5 rounded-lg p-3 text-center cursor-pointer font-medium">TZS</div>
                      <div className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center cursor-pointer text-gray-500 hover:border-primary/50 transition-colors">USD</div>
                      <div className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center cursor-pointer text-gray-500 hover:border-primary/50 transition-colors">KES</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Timezone</Label>
                    <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option>Africa/Dar_es_Salaam</option>
                      <option>Africa/Nairobi</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button variant="ghost" onClick={prevStep}>Back</Button>
                  <Button onClick={nextStep}>Next Step</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Administrator */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="text-primary h-6 w-6" /> System Administrator</h2>
                  <p className="text-gray-500 mt-1">Create the master account to manage the system.</p>
                </div>
                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <Label htmlFor="admin_name">Full Name *</Label>
                    <Input id="admin_name" value={adminName} onChange={e => setAdminName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin_email">Email Address *</Label>
                    <Input id="admin_email" type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin_pass">Password *</Label>
                    <Input id="admin_pass" type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button variant="ghost" onClick={prevStep}>Back</Button>
                  <Button onClick={handleInstall} disabled={!adminName || !adminEmail || !adminPassword}>Begin Installation</Button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Progress */}
            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col justify-center items-center text-center"
              >
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
                <h2 className="text-2xl font-bold mb-2">Installing System...</h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                  {statusMessage}
                </p>
                <div className="w-full max-w-md space-y-2">
                   <Progress value={progress} className="h-2" />
                   <p className="text-xs text-gray-400 font-mono text-right">{progress}%</p>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Success */}
            {step === 6 && (
              <motion.div 
                key="step6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col justify-center items-center text-center"
              >
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Installation Complete!</h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                  MediPOS has been successfully configured. You can now login with your administrator account.
                </p>
                <Button size="lg" className="px-8 shadow-lg shadow-primary/20" onClick={finishInstallation}>
                  Go to Login <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
