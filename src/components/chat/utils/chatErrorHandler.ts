
import { useToast } from "@/hooks/use-toast";

export const useChatErrorHandler = () => {
  const { toast } = useToast();

  const handleChatError = (error: any) => {
    console.error('❌ Error in sendMessage:', error);
    
    let errorMessage = "Nachricht konnte nicht gesendet werden.";
    let isTemporary = true;
    
    if (error?.message?.includes('timeout')) {
      errorMessage = "⏱️ Zeitüberschreitung - Der TierTrainer braucht länger als gewöhnlich. Bitte versuche es erneut.";
      isTemporary = true;
    } else if (error?.message?.includes('not found') || error?.message?.includes('404')) {
      errorMessage = "🔧 TierTrainer Service wird gerade aktualisiert. Bitte versuche es in wenigen Minuten erneut.";
      isTemporary = true;
    } else if (error?.message?.includes('network') || error?.message?.includes('Failed to fetch')) {
      errorMessage = "🌐 Netzwerkproblem erkannt. Bitte überprüfe deine Internetverbindung und versuche es erneut.";
      isTemporary = true;
    } else if (error?.message?.includes('Session')) {
      errorMessage = "🔑 Deine Sitzung ist abgelaufen. Bitte lade die Seite neu und melde dich erneut an.";
      isTemporary = false;
    } else if (error?.message?.includes('Chat-Service') || error?.message?.includes('Edge Function')) {
      errorMessage = "🤖 Chat-Service ist vorübergehend nicht verfügbar. Wir arbeiten daran - bitte versuche es in wenigen Minuten erneut.";
      isTemporary = true;
    } else if (error?.message) {
      errorMessage = `💭 ${error.message}`;
    }
    
    toast({
      title: isTemporary ? "Temporäres Problem" : "Chat-Fehler",
      description: errorMessage,
      variant: "destructive",
      duration: isTemporary ? 5000 : 8000
    });
  };

  return { handleChatError };
};
