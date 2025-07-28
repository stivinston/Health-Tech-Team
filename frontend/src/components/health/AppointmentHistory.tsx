import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Appointment } from '../HealthTracker';
import { DayModifiers } from 'react-day-picker';

interface AppointmentHistoryProps {
  appointments: Appointment[];
}

export function AppointmentHistory({ appointments }: AppointmentHistoryProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Mettre à jour le rendez-vous sélectionné lorsque les rendez-vous changent
  useEffect(() => {
    if (appointments.length > 0) {
      // Filter out any invalid dates and sort by most recent
      const validAppointments = appointments.filter(appt => {
        const date = appt.date_recorded instanceof Date ? appt.date_recorded : new Date(appt.date_recorded);
        return !isNaN(date.getTime());
      });

      if (validAppointments.length > 0) {
        // Afficher les rendez-vous valides dans la console pour le débogage
        console.log('Rendez-vous valides:', validAppointments);
        
        // Sélectionner automatiquement le rendez-vous le plus récent
        const latestAppointment = validAppointments.reduce((latest, current) => {
          const currentDate = current.date_recorded instanceof Date ? current.date_recorded : new Date(current.date_recorded);
          const latestDate = latest.date_recorded instanceof Date ? latest.date_recorded : new Date(latest.date_recorded);
          return currentDate > latestDate ? current : latest;
        }, validAppointments[0]);

        // Mettre à jour la date sélectionnée
        const latestDate = latestAppointment.date_recorded instanceof Date 
          ? latestAppointment.date_recorded 
          : new Date(latestAppointment.date_recorded);
        setSelectedDate(latestDate);
        setSelectedAppointment(latestAppointment);
        return;
      }
    }
    setSelectedAppointment(null);
  }, [appointments]);

  // Mettre à jour le rendez-vous sélectionné lors du changement de date
  useEffect(() => {
    if (selectedDate) {
      const appointmentForSelectedDate = appointments.find(appt => {
        try {
          const apptDate = new Date(appt.date_recorded);
          return (
            apptDate.getDate() === selectedDate.getDate() &&
            apptDate.getMonth() === selectedDate.getMonth() &&
            apptDate.getFullYear() === selectedDate.getFullYear()
          );
        } catch (e) {
          return false;
        }
      });
      setSelectedAppointment(appointmentForSelectedDate || null);
    }
  }, [selectedDate, appointments]);

  // Styles personnalisés pour les jours avec rendez-vous
  const modifiersStyles = {
    hasAppointment: {
      backgroundColor: 'rgb(220 252 231)', // bg-green-100
      color: 'rgb(22 101 52)', // text-green-800
      border: '1px solid rgb(187 247 208)', // border-green-200
      borderRadius: '0.375rem', // rounded-md
    },
  };

  // Fonction pour marquer les jours avec des rendez-vous
  const isDateWithAppointment = (date: Date) => {
    return appointments.some(appt => {
      const apptDate = appt.date_recorded instanceof Date 
        ? appt.date_recorded 
        : new Date(appt.date_recorded);
      return (
        apptDate.getDate() === date.getDate() &&
        apptDate.getMonth() === date.getMonth() &&
        apptDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Fonction pour obtenir la classe CSS d'un jour
  const getDayClassName = (date: Date, modifiers: DayModifiers) => {
    const hasAppointment = isDateWithAppointment(date);
    const isSelected = selectedDate &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();

    return cn(
      hasAppointment && 'bg-green-100 text-green-800 hover:bg-green-200',
      isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
      'rounded-md'
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return isNaN(date.getTime()) ? 'Date inconnue' : format(date, 'PPP', { locale: fr });
    } catch (e) {
      return 'Date inconnue';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return isNaN(date.getTime()) ? '' : format(date, 'HH:mm', { locale: fr });
    } catch (e) {
      return '';
    }
  };

  const formatNumber = (value: number | null, unit: string = '') => {
    return value !== null ? `${value}${unit}` : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendrier */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des rendez-vous</CardTitle>
            <CardDescription>
              Sélectionnez une date pour voir les détails du rendez-vous
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasAppointment: (date) => isDateWithAppointment(date as Date),
              }}
              modifiersStyles={modifiersStyles}
              locale={fr}
              classNames={{
                day: (date, modifiers) => getDayClassName(date, modifiers)
              } as any}
            />
          </CardContent>
        </Card>

        {/* Détails du rendez-vous */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Détails du rendez-vous</CardTitle>
              <CardDescription>
                {selectedDate && formatDate(selectedDate.toISOString())}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAppointment ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Diagnostic</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedAppointment.diagnosis || 'Non spécifié'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Mesures</h3>
                    <div className="text-sm text-gray-500">
                      Température: {formatNumber(selectedAppointment.body_temp_c, '°C')}
                    </div>
                    <div className="text-sm text-gray-500">
                      Pression artérielle: {formatNumber(selectedAppointment.blood_pressure_systolic, ' mmHg')}
                    </div>
                    <div className="text-sm text-gray-500">
                      Rythme cardiaque: {formatNumber(selectedAppointment.heart_rate, ' bpm')}
                    </div>
                  </div>

                  {selectedAppointment.summary_text && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Notes du médecin</h3>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                        {selectedAppointment.summary_text}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucun rendez-vous trouvé pour cette date.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
