-- Device control history needs its own action timestamp.
--
-- `action_history` previously only had the audit column `created_at`, which Hibernate
-- rewrites on insert/update, so it cannot represent when the user actually pressed the
-- switch (and cannot be used for reliable time-range filtering or ordering).
ALTER TABLE action_history
    ADD COLUMN action_at TIMESTAMP WITH TIME ZONE;

-- Existing rows used created_at as the de-facto action time.
UPDATE action_history
SET action_at = created_at
WHERE action_at IS NULL;

ALTER TABLE action_history
    ALTER COLUMN action_at SET NOT NULL;

ALTER TABLE action_history
    ALTER COLUMN action_at SET DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX idx_action_history_action_at ON action_history (action_at DESC);
CREATE INDEX idx_action_history_device_action_at ON action_history (device_id, action_at DESC);
