-- Migration: Add social login fields to users table
-- Provider: LOCAL (default), GOOGLE, ZALO

ALTER TABLE users ADD COLUMN provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255) NULL;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

