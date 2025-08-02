-- Clean up all empty chat sessions from today that have no messages
DELETE FROM chat_sessions 
WHERE created_at > CURRENT_DATE 
  AND id NOT IN (
    SELECT DISTINCT session_id 
    FROM chat_messages 
    WHERE session_id IS NOT NULL
  );