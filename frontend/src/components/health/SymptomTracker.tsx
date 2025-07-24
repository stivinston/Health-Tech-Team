
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function SymptomTracker() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState<Array<{
    id: string;
    symptom_name: string;
    severity: number;
    notes: string | null;
    recorded_at: string;
  }>>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomName.trim()) {
      toast.error('Please enter a symptom');
      return;
    }

    const newSymptom = {
      id: Date.now().toString(),
      symptom_name: symptomName,
      severity,
      notes: notes || null,
      recorded_at: selectedDate.toISOString(),
    };

    setSymptoms(prev => [newSymptom, ...prev]);
    setSymptomName('');
    setSeverity(5);
    setNotes('');
    toast.success('Symptom logged successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log Your Symptoms</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symptom">Symptom</Label>
                  <Input
                    id="symptom"
                    value={symptomName}
                    onChange={(e) => setSymptomName(e.target.value)}
                    placeholder="e.g., Headache, Nausea, Fatigue"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="severity">Severity (1-10)</Label>
                  <Input
                    id="severity"
                    type="number"
                    min="1"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional details about the symptom..."
                  />
                </div>

                <Button type="submit">
                  Log Symptom
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
