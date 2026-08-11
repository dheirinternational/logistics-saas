-- Update manual_payment_submissions constraint to support procurement payments

ALTER TABLE manual_payment_submissions 
DROP CONSTRAINT IF EXISTS manual_payment_submissions_payment_type_check;

ALTER TABLE manual_payment_submissions 
ADD CONSTRAINT manual_payment_submissions_payment_type_check 
CHECK (payment_type IN ('shipment', 'order', 'procurement_commitment', 'procurement_quote'));
