import { MessageCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const MotivationalQuotes = () => {
  const { t } = useTranslation();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(
    Math.floor(Math.random() * 8) // 8 quotes available
  );

  const getNewQuote = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * 8);
    } while (newIndex === currentQuoteIndex);
    setCurrentQuoteIndex(newIndex);
  };

  const getQuoteText = (index: number) => {
    return t(`training.motivationalQuotes.quotes.quote${index + 1}.text`);
  };

  const getQuoteAuthor = (index: number) => {
    return t(`training.motivationalQuotes.quotes.quote${index + 1}.author`);
  };

  const currentQuoteText = getQuoteText(currentQuoteIndex);
  const currentQuoteAuthor = getQuoteAuthor(currentQuoteIndex);

  return (
    <Card className="bg-gradient-to-r from-secondary/50 to-accent/30 border-secondary">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <MessageCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <blockquote className="text-sm italic text-foreground mb-1">
              "{currentQuoteText}"
            </blockquote>
            <cite className="text-xs text-muted-foreground">
              — {currentQuoteAuthor}
            </cite>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={getNewQuote}
            className="flex-shrink-0 h-8 w-8 p-0 hover:bg-primary/10"
            aria-label={t('training.motivationalQuotes.newQuote')}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};