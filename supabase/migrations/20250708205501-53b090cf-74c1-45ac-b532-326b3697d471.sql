-- Clean up empty chat sessions from the session explosion
DELETE FROM chat_sessions 
WHERE created_at > NOW() - INTERVAL '1 hour' 
  AND pet_id IS NULL 
  AND id NOT IN (
    SELECT DISTINCT session_id 
    FROM chat_messages 
    WHERE session_id IS NOT NULL
  );