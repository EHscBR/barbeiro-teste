import { useState } from "react";
import { Calendar, Clock, User, History, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import barbershopLogo from "@/assets/barbershop-logo.jpg";

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Navigation = ({ currentPage, onPageChange }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Início", icon: Calendar },
    { id: "booking", label: "Agendar", icon: Clock },
    { id: "history", label: "Histórico", icon: History },
    { id: "profile", label: "Perfil", icon: User },
  ];

  return (
    <nav className="bg-card border-b border-border shadow-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={barbershopLogo} 
              alt="Barbearia Logo" 
              className="h-10 w-10 rounded-lg shadow-md"
            />
            <span className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              Barbearia Pro
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => onPageChange(item.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    onClick={() => {
                      onPageChange(item.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};