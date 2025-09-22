import { useState, useEffect } from "react";
import { AuthPage } from "@/components/AuthPage";
import { Navigation } from "@/components/Navigation";
import { Dashboard } from "@/components/Dashboard";
import { BookingFlow } from "@/components/BookingFlow";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    if (user) {
      setCurrentPage("dashboard");
    }
  }, [user]);

  const handleLogin = () => {
    // Will be handled by auth state change
  };

  const handleBookingComplete = () => {
    setCurrentPage("dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-barbershop-gold mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
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