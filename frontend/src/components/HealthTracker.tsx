
import React, { useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, Pill, Loader2 } from 'lucide-react';
import { MedicationTracker } from '@/components/health/MedicationTracker';
import { AppointmentHistory } from '@/components/health/AppointmentHistory';
import { toast } from 'sonner';

export interface Appointment {
  date_recorded: Date;
  diagnosis: string;
  body_temp_c: number | null;
  blood_pressure_systolic: number | null;
  heart_rate: number | null;
  summary_text: string;
}

export interface HealthTrackerProps {
  patientId: string;
  appointments: Appointment[];
  isLoading: boolean;
}

export function HealthTracker({ patientId, appointments, isLoading }: HealthTrackerProps) {
  // Les données sont maintenant gérées par le composant parent (App)

  // Le chargement des rendez-vous est maintenant géré par le composant parent
  
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Suivi médical</h1>
          <p className="text-gray-600 mt-2">
            Consultez votre historique médical et vos traitements
          </p>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Historique des rendez-vous
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Traitements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <AppointmentHistory appointments={appointments} />
            )}
          </TabsContent>
          <TabsContent value="medications">
            <MedicationTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
