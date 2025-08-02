
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TableOfContents as TableOfContentsIcon, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export const TableOfContents = () => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false); // Close mobile menu after clicking
    }
  };

  const sections = [
    { id: "hero", title: t('tableOfContents.start'), emoji: "🏠" },
    { id: "benefits", title: t('tableOfContents.whyTierTrainer'), emoji: "⭐" },
    { id: "pricing", title: t('tableOfContents.pricing'), emoji: "💰" },
    { id: "testimonials", title: t('tableOfContents.successStories'), emoji: "🗨️" },
    { id: "faq", title: t('tableOfContents.faq'), emoji: "❓" }
  ];

  return (
    <section className="py-2 md:py-4 bg-card border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Mobile Version - Hamburger Menu */}
        <div className="md:hidden">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <TableOfContentsIcon className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground text-sm">{t('tableOfContents.navigation')}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <Card className="mt-2 border border-border shadow-lg">
              <CardContent className="p-3">
                <div className="space-y-2">
                  {sections.map((section, index) => (
                    <Button
                      key={section.id}
                      variant="ghost"
                      className="w-full justify-start text-left p-3 h-auto"
                      onClick={() => scrollToSection(section.id)}
                    >
                      <span className="text-lg mr-3">{section.emoji}</span>
                      <span className="text-sm font-medium">
                        {section.title}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Desktop Version - Horizontal Navigation Bar */}
        <div className="hidden md:block">
          <div className="flex items-center justify-center space-x-1">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant="ghost"
                className="text-sm font-medium px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => scrollToSection(section.id)}
              >
                <span className="mr-2">{section.emoji}</span>
                {section.title}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
