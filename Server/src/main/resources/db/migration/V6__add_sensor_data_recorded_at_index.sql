-- Retention removes rows by timestamp, independent of sensor type.
CREATE INDEX IF NOT EXISTS idx_sensor_data_recorded_at_desc ON sensor_data (recorded_at DESC);
