
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ReactNode } from "react";

interface DetailSectionProps {
  value: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  bgColor?: string;
}

export const DetailSection = ({ value, title, icon, children, bgColor = "bg-gray-50" }: DetailSectionProps) => {
  return (
    <AccordionItem value={value} className="border-b-0">
      <AccordionTrigger className="py-2 text-sm">
        <div className="flex items-center gap-2">
          {icon} {title}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-2">
        <div className={`${bgColor} p-3 rounded-lg text-sm`}>
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
