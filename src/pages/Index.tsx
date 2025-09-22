import { useState } from "react";
import { AuthPage } from "@/components/AuthPage";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { BookingFlow } from "@/components/BookingFlow";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleBookingComplete = () => {
    setCurrentPage("dashboard");
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {currentPage !== "booking" && (
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      )}
      
      <main>
        {currentPage === "dashboard" && (
          <Dashboard onPageChange={setCurrentPage} />
        )}
        
        {currentPage === "booking" && (
          <BookingFlow 
            onComplete={handleBookingComplete}
            onBack={() => setCurrentPage("dashboard")}
          />
        )}
        
        {currentPage === "history" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Histórico de Atendimentos</h1>
            <p className="text-muted-foreground">Esta página será implementada em breve.</p>
          </div>
        )}
        
        {currentPage === "profile" && (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>
            <p className="text-muted-foreground">Esta página será implementada em breve.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;