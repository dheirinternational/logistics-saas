-- Add thread_id, parent_id, and sender_role to inbox_messages to support customer replies and threading
ALTER TABLE inbox_messages 
ADD COLUMN IF NOT EXISTS thread_id UUID,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES inbox_messages(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS sender_role VARCHAR(20) DEFAULT 'admin';

-- Backfill thread_id for all existing root messages
UPDATE inbox_messages 
SET thread_id = id 
WHERE thread_id IS NULL;

-- Default thread_id to gen_random_uuid()
ALTER TABLE inbox_messages 
ALTER COLUMN thread_id SET DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_inbox_messages_thread_id ON inbox_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_parent_id ON inbox_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_sender_role ON inbox_messages(sender_role);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_sender_id ON inbox_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_recipient_id ON inbox_messages(recipient_id);

