import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, MapPin, Scissors, User, Calendar, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface BookingFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

export const BookingFlow = ({ onComplete, onBack }: BookingFlowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  
  const [units, setUnits] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnits();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      fetchBarbers();
    }
  }, [selectedUnit]);

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchBarbers = async () => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('unit_id', selectedUnit)
        .order('name');

      if (error) throw error;
      setBarbers(data || []);
    } catch (error) {
      console.error('Error fetching barbers:', error);
    }
  };

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const availableDates = [
    { date: "2024-01-15", day: "Segunda", slots: 8 },
    { date: "2024-01-16", day: "Terça", slots: 5 },
    { date: "2024-01-17", day: "Quarta", slots: 12 },
    { date: "2024-01-18", day: "Quinta", slots: 7 },
    { date: "2024-01-19", day: "Sexta", slots: 3 },
  ];

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          unit_id: selectedUnit,
          service_id: selectedService,
          barber_id: selectedBarber,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Agendamento confirmado!",
        description: "Seu horário foi reservado com sucesso.",
      });
      onComplete();
    } catch (error) {
      toast({
        title: "Erro no agendamento",
        description: "Não foi possível confirmar seu agendamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedService = () => services.find(s => s.id === selectedService);
  const getSelectedBarber = () => barbers.find(b => b.id === selectedBarber);
  const getSelectedUnit = () => units.find(u => u.id === selectedUnit);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedUnit;
      case 2: return selectedService;
      case 3: return selectedBarber;
      case 4: return selectedDate && selectedTime;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold">Novo Agendamento</h1>
          <div className="w-16" />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Etapa {currentStep} de {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="shadow-elegant mb-6">
          {/* Step 1: Select Unit */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-barbershop-gold" />
                  <span>Escolha a unidade</span>
                </CardTitle>
                <CardDescription>Selecione a unidade mais conveniente para você</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {units.map((unit) => (
                  <Card 
                    key={unit.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedUnit === unit.id ? 'ring-2 ring-barbershop-gold bg-secondary/50' : ''
                    }`}
                    onClick={() => setSelectedUnit(unit.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{unit.name}</h3>
                          <p className="text-sm text-muted-foreground">{unit.address}</p>
                        </div>
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          Disponível
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </>
          )}

          {/* Step 2: Select Service */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scissors className="h-5 w-5 text-barbershop-gold" />
                  <span>Escolha o serviço</span>
                </CardTitle>
                <CardDescription>Selecione o serviço desejado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service) => (
                  <Card 
                    key={service.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedService === service.id ? 'ring-2 ring-barbershop-gold bg-secondary/50' : ''
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{service.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{service.duration_minutes} min</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-barbershop-gold">R$ {service.price}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </>
          )}

          {/* Step 3: Select Barber */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-barbershop-gold" />
                  <span>Escolha o barbeiro</span>
                </CardTitle>
                <CardDescription>Selecione o profissional de sua preferência</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {barbers.map((barber) => (
                  <Card 
                    key={barber.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedBarber === barber.id ? 'ring-2 ring-barbershop-gold bg-secondary/50' : ''
                    }`}
                    onClick={() => setSelectedBarber(barber.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{barber.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {barber.specialty}
                          </p>
                          <div className="flex items-center space-x-1 mt-1">
                            <span className="text-sm">⭐ {barber.rating || '5.0'}</span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          Disponível
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </>
          )}

          {/* Step 4: Select Date and Time */}
          {currentStep === 4 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-barbershop-gold" />
                  <span>Escolha data e horário</span>
                </CardTitle>
                <CardDescription>Selecione quando você gostaria de ser atendido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div>
                  <h4 className="font-semibold mb-3">Data</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableDates.map((date) => (
                      <Button
                        key={date.date}
                        variant={selectedDate === date.date ? "secondary" : "outline"}
                        onClick={() => setSelectedDate(date.date)}
                        className="h-auto p-3 flex-col"
                      >
                        <span className="font-semibold">{date.day}</span>
                        <span className="text-xs">{date.date.split('-').reverse().join('/')}</span>
                        <span className="text-xs text-muted-foreground">{date.slots} vagas</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <h4 className="font-semibold mb-3">Horário</h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "secondary" : "outline"}
                          onClick={() => setSelectedTime(time)}
                          className="h-10"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-barbershop-gold" />
                  <span>Confirmar agendamento</span>
                </CardTitle>
                <CardDescription>Revise os detalhes do seu agendamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unidade:</span>
                    <span className="font-medium">{getSelectedUnit()?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serviço:</span>
                    <span className="font-medium">{getSelectedService()?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Barbeiro:</span>
                    <span className="font-medium">{getSelectedBarber()?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-medium">{selectedDate?.split('-').reverse().join('/')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-barbershop-gold">R$ {getSelectedService()?.price}</span>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          {currentStep < totalSteps ? (
            <Button 
              variant="hero" 
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              variant="hero" 
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Confirmando..." : "Confirmar Agendamento"}
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};