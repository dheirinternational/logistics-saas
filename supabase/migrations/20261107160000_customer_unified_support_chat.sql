-- Consolidate all direct messages per customer into a single unified support chat thread
WITH ranked_roots AS (
  SELECT 
    id,
    (CASE WHEN sender_role = 'customer' THEN sender_id ELSE recipient_id END) AS customer_id,
    ROW_NUMBER() OVER (
      PARTITION BY (CASE WHEN sender_role = 'customer' THEN sender_id ELSE recipient_id END)
      ORDER BY created_at ASC
    ) as rn
  FROM inbox_messages
  WHERE is_broadcast = FALSE
),
customer_roots AS (
  SELECT id AS root_id, customer_id
  FROM ranked_roots
  WHERE rn = 1
)
UPDATE inbox_messages m
SET 
  thread_id = cr.root_id,
  parent_id = CASE WHEN m.id = cr.root_id THEN NULL ELSE cr.root_id END
FROM customer_roots cr
WHERE m.is_broadcast = FALSE
  AND (CASE WHEN m.sender_role = 'customer' THEN m.sender_id ELSE m.recipient_id END) = cr.customer_id;

