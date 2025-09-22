import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Scissors, User, Plus, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import barbershopHero from "@/assets/barbershop-hero.jpg";

interface DashboardProps {
  onPageChange: (page: string) => void;
}

export const Dashboard = ({ onPageChange }: DashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchNextAppointment();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchNextAppointment = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          units(name),
          services(name, price),
          barbers(name)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'scheduled')
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setNextAppointment(data);
    } catch (error) {
      console.error('Error fetching next appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!nextAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', nextAppointment.id);

      if (error) throw error;

      toast({
        title: "Agendamento cancelado",
        description: "Seu horário foi cancelado com sucesso"
      });

      fetchNextAppointment();
    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: "Não foi possível cancelar o agendamento",
        variant: "destructive"
      });
    }
  };

  const promotions = [
    {
      title: "Combo Especial",
      description: "Corte + Barba por apenas R$ 45",
      discount: "25% OFF",
    },
    {
      title: "Cliente Fiel",
      description: "A cada 5 cortes, o 6º é grátis",
      discount: "Fidelidade",
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden rounded-b-3xl">
        <img 
          src={barbershopHero} 
          alt="Barbearia" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Olá, {userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Cliente'}!
          </h1>
          <p className="text-white/90">Que bom ter você de volta</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Next Appointment Card */}
        {nextAppointment ? (
          <Card className="shadow-elegant border-barbershop-gold/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-barbershop-gold" />
                  <span>Próximo Agendamento</span>
                </CardTitle>
                <Badge variant="outline" className="border-barbershop-gold text-barbershop-gold">
                  {nextAppointment.status === 'scheduled' ? 'Confirmado' : nextAppointment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(nextAppointment.appointment_date).toLocaleDateString('pt-BR')}, {nextAppointment.appointment_time}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{nextAppointment.barbers?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{nextAppointment.services?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{nextAppointment.units?.name}</span>
                </div>
              </div>
              <Separator />
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1" onClick={() => onPageChange("booking")}>
                  Remarcar
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleCancelAppointment}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-elegant border-barbershop-gold/20">
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum agendamento</h3>
              <p className="text-muted-foreground mb-4">Você não possui agendamentos futuros</p>
              <Button variant="hero" onClick={() => onPageChange("booking")}>
                Agendar agora
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="hero" 
            className="h-24 flex-col space-y-2"
            onClick={() => onPageChange("booking")}
          >
            <Plus className="h-6 w-6" />
            <span>Novo Agendamento</span>
          </Button>
          <Button 
            variant="elegant" 
            className="h-24 flex-col space-y-2"
            onClick={() => onPageChange("history")}
          >
            <Clock className="h-6 w-6" />
            <span>Histórico</span>
          </Button>
        </div>

        {/* Promotions */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-barbershop-gold" />
              <span>Promoções</span>
            </CardTitle>
            <CardDescription>
              Aproveite nossas ofertas especiais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {promotions.map((promo, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="font-semibold">{promo.title}</h4>
                  <p className="text-sm text-muted-foreground">{promo.description}</p>
                </div>
                <Badge variant="secondary">{promo.discount}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-barbershop-gold">12</div>
            <div className="text-sm text-muted-foreground">Cortes este ano</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-barbershop-gold">3</div>
            <div className="text-sm text-muted-foreground">Pontos fidelidade</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-barbershop-gold">R$ 240</div>
            <div className="text-sm text-muted-foreground">Economia total</div>
          </Card>
        </div>
      </div>
    </div>
  );
};