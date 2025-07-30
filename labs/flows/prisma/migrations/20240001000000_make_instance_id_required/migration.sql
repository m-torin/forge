-- Create a default instance if it doesn't exist
-- Note: You should set DEFAULT_INSTANCE_ID in your environment variables
-- Default value is 'default-instance'
INSERT INTO instances (id, name, "createdAt", "updatedAt")
SELECT 'default-instance', 'Default Instance', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM instances WHERE id = 'default-instance'
);

-- Update any flows that don't have an instanceId to use the default instance
UPDATE flows
SET "instanceId" = 'default-instance'
WHERE "instanceId" IS NULL;

-- Make instanceId required
ALTER TABLE flows ALTER COLUMN "instanceId" SET NOT NULL;