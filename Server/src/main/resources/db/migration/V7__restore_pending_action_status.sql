-- A control command is pending until an ACK from the ESP8266 confirms the physical state.
ALTER TABLE action_history
    ALTER COLUMN status SET DEFAULT 'PENDING';
