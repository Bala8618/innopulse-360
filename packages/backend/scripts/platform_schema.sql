CREATE DATABASE IF NOT EXISTS innopulse_saas;
USE innopulse_saas;

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(40) UNIQUE,
  event_name VARCHAR(255) NOT NULL,
  description TEXT,
  rules TEXT,
  organizer VARCHAR(255),
  venue VARCHAR(255),
  registration_status VARCHAR(40),
  status VARCHAR(40),
  registration_fee DECIMAL(12,2) DEFAULT 0,
  prize_details TEXT,
  problem_statement TEXT,
  start_date DATETIME,
  end_date DATETIME,
  registration_deadline DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participant_id VARCHAR(40) UNIQUE,
  student_name VARCHAR(255) NOT NULL,
  college_name VARCHAR(255),
  department VARCHAR(120),
  year VARCHAR(10),
  email VARCHAR(255),
  phone VARCHAR(40),
  team_name VARCHAR(255),
  team_members TEXT,
  event_id INT,
  registration_id VARCHAR(40) UNIQUE,
  status VARCHAR(40) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  participant_id INT NOT NULL,
  type VARCHAR(40) NOT NULL,
  details TEXT,
  status VARCHAR(40) DEFAULT 'pending',
  reimbursement_code VARCHAR(80),
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reimbursements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  participant_id INT NOT NULL,
  reimbursement_code VARCHAR(80),
  travel_bills DECIMAL(12,2) DEFAULT 0,
  accommodation_bills DECIMAL(12,2) DEFAULT 0,
  food_bills DECIMAL(12,2) DEFAULT 0,
  receipts_url VARCHAR(500),
  payment_proof_url VARCHAR(500),
  status VARCHAR(40) DEFAULT 'pending',
  remarks TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS od_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  participant_id INT NOT NULL,
  event_code VARCHAR(80),
  mentor_name VARCHAR(255),
  mentor_email VARCHAR(255),
  parent_email VARCHAR(255),
  status VARCHAR(40) DEFAULT 'pending',
  parent_notified BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  participant_id INT NOT NULL,
  event_name VARCHAR(255),
  result_type VARCHAR(40),
  certificate_url VARCHAR(500),
  proof_url VARCHAR(500),
  status VARCHAR(40) DEFAULT 'pending',
  reward_points INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  participant_id INT NOT NULL,
  answers JSON,
  overall_satisfaction INT,
  suggestion TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS queries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  participant_id INT NOT NULL,
  category VARCHAR(80),
  description TEXT,
  priority VARCHAR(20),
  status VARCHAR(40) DEFAULT 'open',
  response TEXT,
  responder_role VARCHAR(80),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
