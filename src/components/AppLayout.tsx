import React, { useState, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import MainNavigation from "./MainNavigation";

// Create a context for the mobile menu state
interface AppLayoutContextType {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export const AppLayoutContext = createContext<AppLayoutContextType>({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
});

// Custom hook to use the AppLayout context
export const useAppLayout = () => useContext(AppLayoutContext);

const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Context value
  const contextValue = {
    isMobileMenuOpen,
    toggleMobileMenu,
  };

  return (
    <AppLayoutContext.Provider value={contextValue}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar Navigation */}
        <div className={`fixed md:relative z-30 md:z-auto transition-transform duration-300 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <MainNavigation defaultCollapsed={false} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </AppLayoutContext.Provider>
  );
};

export default AppLayout;
