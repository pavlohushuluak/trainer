import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { format, getYear } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { useTranslations } from "@/hooks/useTranslations";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  disabled?: boolean;
}

const CalendarModal = ({ isOpen, onClose, selectedDate, onDateSelect, disabled = false }: CalendarModalProps) => {
  const { currentLanguage } = useTranslations();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate year options (current year ± 20 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 41 }, (_, i) => currentYear - 20 + i);

  const handlePreviousYear = () => {
    setCurrentDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
  };

  const handleNextYear = () => {
    setCurrentDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleYearChange = (year: string) => {
    setCurrentDate(prev => new Date(parseInt(year), prev.getMonth(), 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    onDateSelect(date);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-center">
            Select Birth Date
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-4">
          <div className="bg-gradient-to-br from-background via-background to-muted/20 rounded-lg border border-border/50">
            {/* Enhanced Navigation Header */}
            <div className="p-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center justify-between mb-3">
                {/* Year Navigation */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousYear}
                    className="h-8 w-8 p-0 hover:bg-accent/50"
                    disabled={disabled}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Select value={getYear(currentDate).toString()} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-20 h-8 text-sm font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextYear}
                    className="h-8 w-8 p-0 hover:bg-accent/50"
                    disabled={disabled}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Month Navigation */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousMonth}
                    className="h-8 w-8 p-0 hover:bg-accent/50"
                    disabled={disabled}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold text-foreground min-w-[80px] text-center">
                    {format(currentDate, "MMMM", { locale: currentLanguage === 'en' ? enUS : de })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextMonth}
                    className="h-8 w-8 p-0 hover:bg-accent/50"
                    disabled={disabled}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={currentDate}
                onMonthChange={setCurrentDate}
                initialFocus
                disabled={disabled}
                className="rounded-md"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "hidden", // Hide default caption since we have custom navigation
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-8 w-8 bg-background/80 hover:bg-accent/50 border-border/50 p-0 opacity-70 hover:opacity-100 transition-all duration-200"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell:
                    "text-muted-foreground rounded-md w-10 font-medium text-[0.8rem] uppercase tracking-wider",
                  row: "flex w-full mt-2",
                  cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/80 transition-all duration-200 rounded-md"
                  ),
                  day_range_end: "day-range-end",
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-lg transform scale-105 transition-all duration-200",
                  day_today: "bg-accent/80 text-accent-foreground font-semibold ring-2 ring-primary/20",
                  day_outside:
                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                  day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
                  day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
                components={{
                  IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" {...props} />,
                  IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" {...props} />,
                }}
              />
            </div>
            {selectedDate && (
              <div className="px-3 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 border-t border-border/50 rounded-b-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Selected Date:
                  </span>
                  <span className="font-medium text-foreground">
                    {format(selectedDate, "dd.MM.yyyy", { locale: currentLanguage === 'en' ? enUS : de })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarModal;
