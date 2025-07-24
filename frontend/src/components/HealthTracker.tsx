
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SymptomTracker } from '@/components/health/SymptomTracker';
import { Activity, Pill } from 'lucide-react';
import { MedicationTracker } from '@/components/health/MedicationTracker';

export function HealthTracker() {
  
  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Health Tracker</h1>
          <p className="text-gray-600 mt-2">
            Track your daily health
          </p>
        </div>

        <Tabs defaultValue="symptoms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="symptoms" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Symptom Tracker
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Medication Tracker
            </TabsTrigger>
          </TabsList>

          <TabsContent value="symptoms">
            <SymptomTracker />
          </TabsContent>
          <TabsContent value="medications">
            <MedicationTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
