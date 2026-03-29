-- Add version column for optimistic locking on inventory table
-- Flyway migration: V003__Add_Version_Column_To_Inventory.sql

ALTER TABLE inventory ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add index on version column for performance (optional but recommended)
CREATE INDEX idx_inventory_version ON inventory(version);

-- Initialize all existing inventory records with version 0
UPDATE inventory SET version = 0 WHERE version IS NULL;
