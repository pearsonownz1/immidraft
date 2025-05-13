import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Folder,
  Users,
  Settings,
  ChevronRight,
  ChevronLeft,
  FileText,
  Bot,
  Sparkles,
  Brain,
  PlusCircle,
  Globe,
  GraduationCap,
  Shield,
} from "lucide-react";

interface MainNavigationProps {
  defaultCollapsed?: boolean;
}

const MainNavigation: React.FC<MainNavigationProps> = ({
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-collapse when navigating to /letter-ai or /eval-letter-ai
  useEffect(() => {
    if (location.pathname === '/letter-ai' || location.pathname === '/eval-letter-ai') {
      setIsCollapsed(true);
    }
  }, [location.pathname]);

  // Check if the screen is small on initial render and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    // Check on initial render
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`h-screen bg-white border-r flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } z-10`}
    >
      {/* Logo */}
      <div className="p-4 border-b flex items-center justify-center">
        {isCollapsed ? (
          <img src="/pen_icon.png" alt="ImmiDraft Icon" className="h-10 w-auto" />
        ) : (
          <img src="/immidraft_logo_1.png" alt="ImmiDraft Logo" className="h-32 w-auto" />
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {/* Dashboard at the top */}
          <Link to="/dashboard">
            <div
              className={`flex items-center p-3 rounded-md ${
                isActive("/dashboard") && !isActive("/dashboard/new-application")
                  ? "bg-gray-100 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Home className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">Dashboard</span>}
            </div>
          </Link>
          
          {/* Divider before AI Tools */}
          <div className={`my-4 border-t border-gray-200 ${isCollapsed ? 'mx-2' : 'mx-0'}`}></div>
          
          {/* AI Tools Section */}
          {!isCollapsed && (
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                AI Tools
              </span>
            </div>
          )}
          
          <Link to="/evaluateai">
            <div
              className={`flex items-center p-3 rounded-md ${
                isActive("/evaluateai")
                  ? "bg-gray-100 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Sparkles className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">EvaluateAI</span>}
            </div>
          </Link>

          <Link to="/letter-ai">
            <div
              className={`flex items-center p-3 rounded-md ${
                isActive("/letter-ai")
                  ? "bg-gray-100 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Brain className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">LetterAI</span>}
            </div>
          </Link>

          <Link to="/translate-ai">
            <div
              className={`flex items-center p-3 rounded-md ${
                isActive("/translate-ai")
                  ? "bg-gray-100 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Globe className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">TranslateAI</span>}
            </div>
          </Link>

          <Link to="/eval-letter-ai">
            <div
              className={`flex items-center p-3 rounded-md ${
                isActive("/eval-letter-ai")
                  ? "bg-gray-100 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <GraduationCap className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">EvalLetterAI</span>}
            </div>
          </Link>

          <Link to="/verify-ai">
            <div
              className={`flex items-center p-3 rounded-md ${
                isActive("/verify-ai")
                  ? "bg-gray-100 text-primary font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Shield className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">VerifyAI</span>}
            </div>
          </Link>
          
          {/* Divider after AI Tools */}
          <div className={`my-4 border-t border-gray-200 ${isCollapsed ? 'mx-2' : 'mx-0'}`}></div>

          {/* Cases link removed */}

          {/* Clients and Settings links removed */}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t flex items-center">
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
            alt="User Avatar"
            className="h-full w-full object-cover"
          />
        </div>
        {!isCollapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-500 truncate">
              admin@geocredentials.com
            </p>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex justify-center"
          onClick={toggleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MainNavigation;
