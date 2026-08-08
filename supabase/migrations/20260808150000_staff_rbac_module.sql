-- RBAC and Staff Role Access Management
-- Adds staff_role to users and creates default Customer Service and Marketing accounts

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS staff_role TEXT CHECK (staff_role IN ('super_admin', 'customer_service', 'marketing'));

-- Create index for quick session role lookups
CREATE INDEX IF NOT EXISTS idx_users_staff_role ON users(staff_role);
