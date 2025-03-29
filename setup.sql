-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    whatsapp_number VARCHAR(15),
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    profile_photo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Reminders table
CREATE TABLE IF NOT EXISTS Reminders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reminder_text TEXT NOT NULL,
    reminder_time DATETIME NOT NULL,
    target_id BIGINT,
    status ENUM('pending', 'triggered') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Create JournalEntries table
CREATE TABLE IF NOT EXISTS JournalEntries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Create Tasks table
CREATE TABLE IF NOT EXISTS Tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category ENUM('work', 'personal', 'family') NOT NULL,
    content TEXT NOT NULL,
    status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    raw_input_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (raw_input_id) REFERENCES RawUserInputs(id)
);

-- Create RawUserInputs table
CREATE TABLE IF NOT EXISTS RawUserInputs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    raw_text TEXT NOT NULL,
    metadata JSON,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_reminders_user_status ON Reminders(user_id, status);
CREATE INDEX idx_reminders_time ON Reminders(reminder_time);
CREATE INDEX idx_journal_entries_user ON JournalEntries(user_id);
CREATE INDEX idx_tasks_user_status ON Tasks(user_id, status);
CREATE INDEX idx_raw_inputs_processed ON RawUserInputs(processed);
CREATE INDEX idx_users_google_id ON Users(google_id);
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_whatsapp ON Users(whatsapp_number); 