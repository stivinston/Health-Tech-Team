
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function MedicationTracker() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState<Array<{
    id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    notes: string | null;
    taken_at: string;
  }>>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicationName.trim() || !dosage.trim() || !frequency.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newMedication = {
      id: Date.now().toString(),
      medication_name: medicationName,
      dosage,
      frequency,
      notes: notes || null,
      taken_at: selectedDate.toISOString(),
    };

    setMedications(prev => [newMedication, ...prev]);
    setMedicationName('');
    setDosage('');
    setFrequency('');
    setNotes('');
    toast.success('Medication logged successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log Your Medication</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date Taken</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="medication">Medication Name</Label>
                  <Input
                    id="medication"
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                    placeholder="e.g., Ibuprofen, Aspirin"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g., 200mg, 1 tablet"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="e.g., Once daily, Twice daily"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any side effects or observations..."
                  />
                </div>

                <Button type="submit">
                  Log Medication
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medication History</CardTitle>
        </CardHeader>
        <CardContent>
          {medications.length > 0 ? (
            <div className="space-y-4">
              {medications.map((medication) => (
                <div key={medication.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{medication.medication_name}</h4>
                      <p className="text-sm text-gray-600">
                        Dosage: {medication.dosage} • Frequency: {medication.frequency}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(medication.taken_at), 'PPp')}
                      </p>
                      {medication.notes && (
                        <p className="text-sm mt-2">{medication.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No medications logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
