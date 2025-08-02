
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare } from 'lucide-react';

interface TicketFiltersProps {
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  ticketCount: number;
}

export const TicketFilters = ({ statusFilter, setStatusFilter, ticketCount }: TicketFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Support-Ticket Verwaltung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Tickets</SelectItem>
              <SelectItem value="open">Offen</SelectItem>
              <SelectItem value="in_progress">In Bearbeitung</SelectItem>
              <SelectItem value="waiting_user">Wartet auf Nutzer</SelectItem>
              <SelectItem value="resolved">Gelöst</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline">
            {ticketCount} Tickets
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
