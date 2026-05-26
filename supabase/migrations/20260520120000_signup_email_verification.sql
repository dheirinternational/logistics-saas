-- Signup email verification (server-side gate before register)
CREATE TABLE IF NOT EXISTS signup_email_verifications (
  email text PRIMARY KEY,
  verified_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS signup_email_verifications_expires_idx
  ON signup_email_verifications (expires_at);

-- OTP resend audit + rate limits
CREATE TABLE IF NOT EXISTS otp_send_log (
  id bigserial PRIMARY KEY,
  email text NOT NULL,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS otp_send_log_email_created_idx
  ON otp_send_log (email, created_at DESC);

CREATE INDEX IF NOT EXISTS otp_send_log_ip_created_idx
  ON otp_send_log (ip, created_at DESC);

-- Brute-force protection on OTP verify (safe if column already exists)
ALTER TABLE otp ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0;
