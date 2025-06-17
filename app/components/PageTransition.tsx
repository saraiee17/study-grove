import { useEffect, useState } from "react";
import { useLocation } from "react-router";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isEntering, setIsEntering] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 50);
    return () => clearTimeout(timer);
  }, [location.key]);

  return (
    <div
      className={`transition-all duration-700 ease-in-out transform
        ${isEntering 
          ? 'opacity-0 translate-y-4' 
          : 'opacity-100 translate-y-0'
        }`}
    >
      {children}
    </div>
  );
} 