
import { PlanTemplate } from '../templateTypes';
import { TemplateOverviewCard } from './TemplateOverviewCard';

interface TemplateListProps {
  templates: PlanTemplate[];
  onSelectTemplate: (template: PlanTemplate) => void;
  onViewDetails: (template: PlanTemplate) => void;
}

export const TemplateList = ({ 
  templates, 
  onSelectTemplate, 
  onViewDetails 
}: TemplateListProps) => {
  return (
    <div className="grid gap-6">
      {templates.map((template) => (
        <TemplateOverviewCard
          key={template.id}
          template={template}
          onSelectTemplate={onSelectTemplate}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
