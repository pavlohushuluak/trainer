
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MainNavigationProps {
  user: any;
  onClose?: () => void;
}

const MainNavigation = ({ user, onClose }: MainNavigationProps) => {
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const navigationItems: any[] = [];

  return (
    <nav className="space-y-2">
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          variant="ghost"
          className="w-full justify-start text-left h-auto p-3 hover:bg-blue-50"
          onClick={() => handleNavigation(item.path)}
        >
          <div>
            <div className="font-medium">{item.label}</div>
            <div className="text-xs text-gray-500 mt-1">{item.description}</div>
          </div>
        </Button>
      ))}
    </nav>
  );
};

export default MainNavigation;
