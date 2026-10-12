-- PENDING rows were commands that never received a confirmed outcome. Under the
-- two-state model they are treated conservatively as failed deliveries.
UPDATE action_history
SET status = 'FAILED'
WHERE status = 'PENDING';

ALTER TABLE action_history
    ALTER COLUMN status SET DEFAULT 'SUCCESS';
