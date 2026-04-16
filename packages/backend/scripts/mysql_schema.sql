CREATE DATABASE IF NOT EXISTS innopulse_saas;
USE innopulse_saas;

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  domain VARCHAR(255) NULL,
  event_type ENUM('Online', 'Offline', 'Hybrid') NOT NULL,
  event_mode ENUM('Individual', 'Team') NOT NULL DEFAULT 'Team',
  round_count INT NOT NULL DEFAULT 1,
  team_size_min INT NOT NULL DEFAULT 1,
  team_size_max INT NOT NULL DEFAULT 5,
  registration_start_date DATETIME NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  registration_deadline DATETIME NOT NULL,
  screening_date DATETIME NULL,
  judging_date DATETIME NULL,
  result_date DATETIME NULL,
  organizer VARCHAR(255) NOT NULL,
  venue VARCHAR(255) NOT NULL,
  max_participants INT NOT NULL,
  prize_details TEXT NOT NULL,
  registration_fee VARCHAR(120) NULL,
  problem_statement TEXT NULL,
  rules TEXT NOT NULL,
  poster_url VARCHAR(500) NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  status ENUM('upcoming', 'active', 'closed') NOT NULL DEFAULT 'upcoming',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  college VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  team_name VARCHAR(255) NOT NULL,
  event_id INT NOT NULL,
  registration_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT NULL,
  CONSTRAINT fk_participants_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_management (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  category VARCHAR(80) NOT NULL,
  description LONGTEXT NULL,
  cost_applicable BOOLEAN NOT NULL DEFAULT FALSE,
  cost_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  reimbursement_code VARCHAR(120) NULL,
  payment_qr VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_management_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_budget (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL UNIQUE,
  accommodation_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  food_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  travel_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
  registration_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_budget_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_participants_status ON participants(status);
CREATE INDEX idx_participants_event ON participants(event_id);
CREATE INDEX idx_event_management_event ON event_management(event_id);
CREATE INDEX idx_event_management_category ON event_management(category);

ALTER TABLE events ADD COLUMN IF NOT EXISTS domain VARCHAR(255) NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_mode ENUM('Individual', 'Team') NOT NULL DEFAULT 'Team';
ALTER TABLE events ADD COLUMN IF NOT EXISTS round_count INT NOT NULL DEFAULT 1;
ALTER TABLE events ADD COLUMN IF NOT EXISTS team_size_min INT NOT NULL DEFAULT 1;
ALTER TABLE events ADD COLUMN IF NOT EXISTS team_size_max INT NOT NULL DEFAULT 5;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_start_date DATETIME NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS screening_date DATETIME NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS judging_date DATETIME NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS result_date DATETIME NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_fee VARCHAR(120) NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS problem_statement TEXT NULL;
