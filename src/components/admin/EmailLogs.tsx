
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mail, Search, Filter, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface EmailLog {
  id: string;
  type: string;
  title: string;
  message: string;
  user_id: string | null;
  status: string;
  created_at: string;
  recipient_email?: string;
  error_details?: string;
}

export const EmailLogs = () => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const logsPerPage = 50;

  useEffect(() => {
    loadEmailLogs();
  }, [currentPage]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, statusFilter, typeFilter]);

  const loadEmailLogs = async () => {
    try {
      setIsLoading(true);
      
      // Get email-related system notifications
      const { data, error, count } = await supabase
        .from('system_notifications')
        .select('*', { count: 'exact' })
        .in('type', [
          'welcome_email',
          'checkout_confirmation', 
          'cancellation_email',
          'support_notification',
          'payment_notification',
          'email_config_change'
        ])
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * logsPerPage, currentPage * logsPerPage - 1);

      if (error) throw error;

      // Enhance logs with extracted email info
      const enhancedLogs = data?.map(log => ({
        ...log,
        recipient_email: extractEmailFromMessage(log.message),
        error_details: log.status === 'failed' ? log.message : undefined
      })) || [];

      setLogs(enhancedLogs);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading email logs:', error);
      toast({
        title: "Fehler beim Laden der E-Mail-Logs",
        description: "Die E-Mail-Historie konnte nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractEmailFromMessage = (message: string): string => {
    const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    return emailMatch ? emailMatch[1] : '';
  };

  const filterLogs = () => {
    let filtered = logs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.recipient_email && log.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.type === typeFilter);
    }

    setFilteredLogs(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">✅ Versendet</Badge>;
      case 'failed':
        return <Badge variant="destructive">❌ Fehler</Badge>;
      case 'processed':
        return <Badge variant="secondary">⚙️ Verarbeitet</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      'welcome_email': '🎉 Willkommen',
      'checkout_confirmation': '💳 Checkout',
      'cancellation_email': '📅 Kündigung',
      'support_notification': '🎫 Support',
      'payment_notification': '💰 Zahlung',
      'email_config_change': '⚙️ Konfiguration'
    };
    
    return (
      <Badge variant="outline" className="text-xs">
        {typeLabels[type] || type}
      </Badge>
    );
  };

  const exportLogs = () => {
    const csvContent = [
      ['Datum', 'Typ', 'Empfänger', 'Betreff', 'Status', 'Nachricht'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: de }),
        log.type,
        log.recipient_email || '',
        `"${log.title.replace(/"/g, '""')}"`,
        log.status,
        `"${log.message.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `email-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const refreshLogs = () => {
    setCurrentPage(1);
    loadEmailLogs();
  };

  const totalPages = Math.ceil(totalCount / logsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Lade E-Mail-Logs...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          📧 E-Mail-Logs & Historie
        </CardTitle>
        <CardDescription>
          Übersicht aller versendeten E-Mails und deren Status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
            <div className="text-sm text-blue-700">Gesamt</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter(l => l.status === 'sent').length}
            </div>
            <div className="text-sm text-green-700">Versendet</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {logs.filter(l => l.status === 'failed').length}
            </div>
            <div className="text-sm text-red-700">Fehler</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {logs.filter(l => l.status === 'processed').length}
            </div>
            <div className="text-sm text-gray-700">Verarbeitet</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Suchen nach E-Mail, Betreff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="sent">Versendet</SelectItem>
              <SelectItem value="failed">Fehler</SelectItem>
              <SelectItem value="processed">Verarbeitet</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="E-Mail-Typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              <SelectItem value="welcome_email">Willkommen</SelectItem>
              <SelectItem value="checkout_confirmation">Checkout</SelectItem>
              <SelectItem value="cancellation_email">Kündigung</SelectItem>
              <SelectItem value="support_notification">Support</SelectItem>
              <SelectItem value="payment_notification">Zahlung</SelectItem>
              <SelectItem value="email_config_change">Konfiguration</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={refreshLogs} variant="outline" size="sm">
            🔄 Aktualisieren
          </Button>

          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            CSV Export
          </Button>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          {filteredLogs.length} von {totalCount} E-Mails
          {searchQuery && ` (gefiltert nach "${searchQuery}")`}
        </div>

        {/* Email logs table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Empfänger</TableHead>
                <TableHead>Betreff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Keine E-Mail-Logs gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </TableCell>
                    <TableCell>{getTypeBadge(log.type)}</TableCell>
                    <TableCell className="max-w-48 truncate">
                      {log.recipient_email || '-'}
                    </TableCell>
                    <TableCell className="max-w-64 truncate">
                      {log.title}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      <div className="max-w-96 truncate text-sm text-gray-600">
                        {log.status === 'failed' && log.error_details ? (
                          <span className="text-red-600">{log.error_details}</span>
                        ) : (
                          log.message
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Seite {currentPage} von {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Zurück
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Weiter
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
