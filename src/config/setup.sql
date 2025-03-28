-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    name VARCHAR(100),
    avatar_url TEXT,
    auth_provider ENUM('phone', 'google', 'both') NOT NULL DEFAULT 'phone',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone_number (phone_number),
    INDEX idx_email (email),
    INDEX idx_google_id (google_id),
    INDEX idx_auth_provider (auth_provider)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    notification_enabled BOOLEAN DEFAULT TRUE,
    notification_time TIME DEFAULT '09:00:00',
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    theme ENUM('light', 'dark', 'system') DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    device_info JSON,
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_token (session_token),
    INDEX idx_user_expires (user_id, expires_at)
);

-- Create intent_categories table
CREATE TABLE IF NOT EXISTS intent_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Create intents table
CREATE TABLE IF NOT EXISTS intents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    handler VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES intent_categories(id),
    INDEX idx_name (name),
    INDEX idx_category (category_id)
);

-- Create intent_patterns table
CREATE TABLE IF NOT EXISTS intent_patterns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intent_id INT NOT NULL,
    pattern VARCHAR(255) NOT NULL,
    priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (intent_id) REFERENCES intents(id) ON DELETE CASCADE,
    INDEX idx_pattern (pattern)
);

-- Create journal_entries table (unified table for all journal types)
CREATE TABLE IF NOT EXISTS journal_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    intent_id INT NOT NULL,
    content TEXT NOT NULL,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (intent_id) REFERENCES intents(id),
    INDEX idx_user_date (user_id, entry_date),
    INDEX idx_intent (intent_id)
);

-- Create todo_lists table (with better structure)
CREATE TABLE IF NOT EXISTS todo_lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    category ENUM('work', 'family', 'self_care') NOT NULL,
    content TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_category (user_id, category),
    INDEX idx_status (is_completed),
    INDEX idx_due_date (due_date)
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    frequency ENUM('daily', 'weekly', 'monthly') NOT NULL,
    target_count INT DEFAULT 1,
    category ENUM('health', 'productivity', 'learning', 'lifestyle') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_category (user_id, category),
    INDEX idx_active (is_active)
);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS habit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habit_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_habit_date (habit_id, completed_at)
);

-- Create mood_tracking table
CREATE TABLE IF NOT EXISTS mood_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    mood_score INT NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
    energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
    stress_level INT CHECK (stress_level BETWEEN 1 AND 5),
    notes TEXT,
    factors JSON, -- Store factors affecting mood as JSON array
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_date (user_id, entry_date)
);

-- Create budget_categories table
CREATE TABLE IF NOT EXISTS budget_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    parent_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES budget_categories(id),
    UNIQUE KEY unique_category (user_id, name),
    INDEX idx_user_type (user_id, type)
);

-- Create budget_transactions table
CREATE TABLE IF NOT EXISTS budget_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    payment_method ENUM('cash', 'card', 'upi', 'bank_transfer', 'other'),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency ENUM('daily', 'weekly', 'monthly', 'yearly'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES budget_categories(id),
    INDEX idx_user_date (user_id, transaction_date),
    INDEX idx_category (category_id)
);

-- Create budget_goals table
CREATE TABLE IF NOT EXISTS budget_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'completed', 'failed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES budget_categories(id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_dates (start_date, end_date)
);

-- Insert default categories
INSERT INTO intent_categories (name, description) VALUES
('journal', 'Journal-related entries like highlights, thoughts, etc.'),
('task', 'Task management related entries'),
('habit', 'Habit tracking related entries'),
('mood', 'Mood tracking related entries'),
('budget', 'Budget and expense tracking related entries')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert default intents
INSERT INTO intents (name, description, category_id, handler)
SELECT i.name, i.description, ic.id, i.handler
FROM (
    SELECT 'highlight' as name, 'Save a highlight from the day' as description, 'highlight' as handler, 'journal' as category UNION ALL
    SELECT 'thought', 'Save a thought for the day', 'thought', 'journal' UNION ALL
    SELECT 'idea', 'Save an idea for the day', 'idea', 'journal' UNION ALL
    SELECT 'affirmation', 'Save a daily affirmation', 'affirmation', 'journal' UNION ALL
    SELECT 'gratitude', 'Save a gratitude entry', 'gratitude', 'journal' UNION ALL
    SELECT 'reflection', 'Save a daily reflection', 'reflection', 'journal' UNION ALL
    SELECT 'todo', 'Manage todo lists', 'todo', 'task' UNION ALL
    SELECT 'habit', 'Track habits', 'habit', 'habit' UNION ALL
    SELECT 'mood', 'Track mood', 'mood', 'mood' UNION ALL
    SELECT 'expense', 'Track expenses', 'expense', 'budget' UNION ALL
    SELECT 'income', 'Track income', 'income', 'budget' UNION ALL
    SELECT 'budget_goal', 'Manage budget goals', 'budget_goal', 'budget'
) i
JOIN intent_categories ic ON i.category = ic.name
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    category_id = VALUES(category_id),
    handler = VALUES(handler);

-- Insert default patterns
INSERT INTO intent_patterns (intent_id, pattern, priority)
SELECT i.id, p.pattern, p.priority
FROM intents i
CROSS JOIN (
    SELECT 'highlight' as intent_name, 'highlight' as pattern, 1 as priority UNION ALL
    SELECT 'highlight', 'save highlight', 2 UNION ALL
    SELECT 'highlight', 'note highlight', 3 UNION ALL
    SELECT 'thought', 'thought', 1 UNION ALL
    SELECT 'thought', 'save thought', 2 UNION ALL
    SELECT 'thought', 'note thought', 3 UNION ALL
    SELECT 'idea', 'idea', 1 UNION ALL
    SELECT 'idea', 'save idea', 2 UNION ALL
    SELECT 'idea', 'note idea', 3 UNION ALL
    SELECT 'affirmation', 'affirmation', 1 UNION ALL
    SELECT 'affirmation', 'save affirmation', 2 UNION ALL
    SELECT 'affirmation', 'note affirmation', 3 UNION ALL
    SELECT 'gratitude', 'gratitude', 1 UNION ALL
    SELECT 'gratitude', 'save gratitude', 2 UNION ALL
    SELECT 'gratitude', 'note gratitude', 3 UNION ALL
    SELECT 'reflection', 'reflection', 1 UNION ALL
    SELECT 'reflection', 'save reflection', 2 UNION ALL
    SELECT 'reflection', 'note reflection', 3 UNION ALL
    SELECT 'todo', 'todo', 1 UNION ALL
    SELECT 'todo', 'task', 2 UNION ALL
    SELECT 'todo', 'add to', 3 UNION ALL
    SELECT 'todo', 'add task', 4 UNION ALL
    SELECT 'habit', 'habit', 1 UNION ALL
    SELECT 'habit', 'track habit', 2 UNION ALL
    SELECT 'habit', 'complete habit', 3 UNION ALL
    SELECT 'mood', 'mood', 1 UNION ALL
    SELECT 'mood', 'track mood', 2 UNION ALL
    SELECT 'mood', 'how am i feeling', 3 UNION ALL
    SELECT 'expense', 'expense', 1 UNION ALL
    SELECT 'expense', 'spent', 2 UNION ALL
    SELECT 'expense', 'bought', 3 UNION ALL
    SELECT 'income', 'income', 1 UNION ALL
    SELECT 'income', 'earned', 2 UNION ALL
    SELECT 'income', 'received', 3 UNION ALL
    SELECT 'budget_goal', 'budget goal', 1 UNION ALL
    SELECT 'budget_goal', 'set goal', 2 UNION ALL
    SELECT 'budget_goal', 'savings goal', 3
) p
WHERE i.name = p.intent_name
ON DUPLICATE KEY UPDATE 
    pattern = VALUES(pattern),
    priority = VALUES(priority);