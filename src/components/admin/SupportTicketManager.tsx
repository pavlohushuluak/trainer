
import React from 'react';
import { useSupportTicketManager } from '@/hooks/useSupportTicketManager';
import { TicketFilters } from './TicketFilters';
import { TicketList } from './TicketList';
import { TicketDetailModal } from './TicketDetailModal';

export const SupportTicketManager = () => {
  const {
    tickets,
    selectedTicket,
    messages,
    newMessage,
    setNewMessage,
    statusFilter,
    setStatusFilter,
    loading,
    sending,
    openTicket,
    updateTicketStatus,
    sendAdminMessage,
    setSelectedTicket
  } = useSupportTicketManager();

  return (
    <div className="space-y-6">
      <TicketFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        ticketCount={tickets.length}
      />

      <TicketList
        tickets={tickets}
        loading={loading}
        onTicketClick={openTicket}
      />

      <TicketDetailModal
        selectedTicket={selectedTicket}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sending={sending}
        onClose={() => setSelectedTicket(null)}
        onStatusChange={updateTicketStatus}
        onSendMessage={sendAdminMessage}
      />
    </div>
  );
};
