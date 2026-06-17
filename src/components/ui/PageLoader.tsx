import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function PageLoader() {
  const [location] = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(20);
    
    const maxProgress = 80;
    const interval = setInterval(() => {
      setProgress(p => (p < maxProgress ? p + Math.random() * 10 : p));
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
      }, 300);
    }, 300); // Simulate network load time

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [location]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
      <div 
        className="h-1 bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
