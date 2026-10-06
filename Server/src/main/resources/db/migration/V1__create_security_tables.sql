CREATE TABLE users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    class_name VARCHAR(50),
    email VARCHAR(100) NOT NULL UNIQUE,
    avatar_url TEXT,
    bio_text TEXT,
    location VARCHAR(100),
    iot_report_url TEXT,
    api_docs_url TEXT,
    github_url TEXT,
    figma_url TEXT,
    password_hash VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    role VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_users_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE devices (
    id UUID PRIMARY KEY,
    device_name VARCHAR(50) NOT NULL UNIQUE,
    pin_relay VARCHAR(10) NOT NULL,
    current_status VARCHAR(10) NOT NULL DEFAULT 'UNKNOWN',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_devices_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_devices_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE sensors (
    id UUID PRIMARY KEY,
    sensor_name VARCHAR(50) NOT NULL UNIQUE,
    sensor_type VARCHAR(50) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    pin_connected VARCHAR(10) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sensors_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_sensors_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE sensor_data (
    id UUID PRIMARY KEY,
    sensor_id UUID NOT NULL REFERENCES sensors (id),
    value DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sensor_data_sensor_recorded_at ON sensor_data (sensor_id, recorded_at DESC);

CREATE TABLE action_history (
    id UUID PRIMARY KEY,
    device_id UUID NOT NULL REFERENCES devices (id),
    user_id UUID REFERENCES users (id) ON DELETE SET NULL,
    action VARCHAR(10) NOT NULL,
    trigger_by VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_action_history_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_action_history_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE user_permission (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    permission VARCHAR(100) NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_permission_user_permission UNIQUE (user_id, permission),
    CONSTRAINT fk_user_permission_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_user_permission_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX idx_user_permission_user_id ON user_permission (user_id);
