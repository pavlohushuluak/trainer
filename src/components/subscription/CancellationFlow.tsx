
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Gift, TrendingDown, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CancellationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelSubscription: () => void;
  subscriptionEnd?: string;
}

type CancellationStep = 'feedback' | 'offer' | 'downgrade' | 'final';

export const CancellationFlow = ({ 
  isOpen, 
  onClose, 
  onCancelSubscription,
  subscriptionEnd 
}: CancellationFlowProps) => {
  const [step, setStep] = useState<CancellationStep>('feedback');
  const [feedbackReason, setFeedbackReason] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const { toast } = useToast();

  const handleGratismonthAccept = () => {
    toast({
      title: "🎉 Gratismonat aktiviert!",
      description: "Du hast uns eine zweite Chance gegeben – wir geben alles, damit sie sich lohnt! 💛"
    });
    onClose();
  };

  const handleDowngrade = () => {
    toast({
      title: "Downgrade erfolgreich",
      description: "Du wurdest zum Basic-Paket gewechselt. Danke, dass du bei uns bleibst! 🌟"
    });
    onClose();
  };

  const handleFinalCancellation = () => {
    onCancelSubscription();
    toast({
      title: "Subscription gekündigt",
      description: `Wir danken dir von Herzen für deine Zeit mit uns 🙏 Dein Zugang bleibt bis zum ${subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : 'Ablaufdatum'} aktiv.`
    });
    onClose();
  };

  const resetFlow = () => {
    setStep('feedback');
    setFeedbackReason('');
    setFeedbackText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetFlow}>
      <DialogContent className="max-w-md">
        {step === 'feedback' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                Hey – schade, dass du überlegst zu gehen 😢
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Wir haben viel Herz in lovable gesteckt – und genau deshalb möchten wir hören, was dir gefehlt hat. Vielleicht gibt's einen besseren Weg als Goodbye?
              </p>
              
              <div className="space-y-3">
                <Select value={feedbackReason} onValueChange={setFeedbackReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Was ist der Hauptgrund?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="too-little-use">Ich nutze es zu selten</SelectItem>
                    <SelectItem value="too-expensive">Es ist mir zu teuer</SelectItem>
                    <SelectItem value="missing-feature">Es fehlt mir ein bestimmtes Feature</SelectItem>
                    <SelectItem value="technical-issues">Ich hatte technische Probleme</SelectItem>
                    <SelectItem value="other">Etwas anderes</SelectItem>
                  </SelectContent>
                </Select>

                {feedbackReason === 'other' && (
                  <Textarea
                    placeholder="Erzähl uns mehr..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="min-h-[80px]"
                  />
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Abbrechen
                </Button>
                <Button 
                  onClick={() => setStep('offer')} 
                  disabled={!feedbackReason}
                  className="flex-1"
                >
                  Weiter
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'offer' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Danke für dein ehrliches Feedback 💛
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Vielleicht gibst du uns noch eine Chance? Wir laden dich ein zu einem <strong>Gratismonat</strong> – ganz ohne Risiko, um lovable neu zu erleben.
              </p>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Gratismonat-Angebot</span>
                  </div>
                  <p className="text-sm text-green-700">
                    30 Tage kostenlos • Jederzeit kündbar • Alle Premium-Features
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={handleGratismonthAccept} className="w-full bg-green-600 hover:bg-green-700">
                  ✅ Gratismonat aktivieren & weitermachen
                </Button>
                <Button variant="outline" onClick={() => setStep('downgrade')} className="w-full">
                  ❌ Trotzdem kündigen
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'downgrade' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-blue-500" />
                Vielleicht ein kleineres Paket?
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Vielleicht passt einfach ein kleineres Paket besser zu dir? So bleibst du dabei – ohne dich finanziell zu belasten.
              </p>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Basic-Paket</CardTitle>
                  <CardDescription>Perfekt für gelegentliche Nutzung</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="text-2xl font-bold text-blue-600">4,99€ <span className="text-sm font-normal text-muted-foreground">/Monat</span></div>
                    <div className="text-sm text-green-600 font-medium">💰 Spare 5€ pro Monat!</div>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✅ 10 AI-Chats pro Monat</li>
                    <li>✅ 1 Tierprofil</li>
                    <li>✅ Basis-Trainingspläne</li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={handleDowngrade} className="w-full bg-blue-600 hover:bg-blue-700">
                  Jetzt zum Basic-Paket wechseln
                </Button>
                <Button variant="outline" onClick={() => setStep('final')} className="w-full">
                  Doch lieber kündigen
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'final' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                Wir danken dir von Herzen 🙏
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">
                  Dein Zugang bleibt bis zum <strong>{subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString('de-DE') : 'Ablaufdatum'}</strong> aktiv – vielleicht kommst du ja wieder zurück.
                </p>
                <p className="text-lg">
                  Wir wären glücklich darüber! 💫
                </p>
              </div>
              
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-purple-700 text-center">
                    📧 Du erhältst eine Bestätigungs-E-Mail<br/>
                    📅 Erinnerung 1 Woche vor Ablauf mit Reaktivierungsangebot
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={handleFinalCancellation} variant="destructive" className="w-full">
                  Endgültig kündigen
                </Button>
                <Button variant="outline" onClick={resetFlow} className="w-full">
                  Doch nicht kündigen
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
