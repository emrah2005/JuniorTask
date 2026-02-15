CREATE DATABASE IF NOT EXISTS booking_saas;
USE booking_saas;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  date_of_birth DATE NULL,
  role ENUM('SuperAdmin', 'Admin', 'User') DEFAULT 'User',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Ensure date_of_birth exists for existing databases
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE NULL AFTER password;

CREATE TABLE businesses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('Barber', 'Gym', 'Training Hall', 'Car Wash') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration INT NOT NULL COMMENT 'Duration in minutes',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  business_id INT NOT NULL,
  service_id INT NOT NULL,
  date DATETIME NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE KEY unique_booking_slot (business_id, date, status)
);

-- Groups (for training halls, classes)
CREATE TABLE IF NOT EXISTS groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  business_id INT NULL,
  description TEXT NULL,
  hall VARCHAR(255) NULL,
  trainer_id INT NOT NULL,
  schedule_day TINYINT NULL COMMENT '0=Sun..6=Sat',
  schedule_time TIME NULL,
  price DECIMAL(10,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Ensure columns exist for existing databases
ALTER TABLE groups ADD COLUMN IF NOT EXISTS business_id INT NULL AFTER name;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS description TEXT NULL AFTER business_id;

-- Memberships linking users to groups with validity
CREATE TABLE IF NOT EXISTS memberships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  status ENUM('active','paused','expired') DEFAULT 'active',
  valid_from DATE NULL,
  valid_to DATE NULL,
  allowed_entries INT NULL,
  used_entries INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_membership (user_id, group_id)
);

-- Attendance records per session
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  session_datetime DATETIME NOT NULL,
  source ENUM('self','coach') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_attendance (user_id, group_id, session_datetime)
);

INSERT INTO users (name, email, password, role) VALUES 
('Super Admin', 'admin@booking.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SuperAdmin');

-- Group session bookings (reservation layer before attendance)
CREATE TABLE IF NOT EXISTS group_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  session_datetime DATETIME NOT NULL,
  status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_group_booking (user_id, group_id, session_datetime)
);

-- Coach-scheduled sessions (slot creation independent of bookings)
CREATE TABLE IF NOT EXISTS group_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  session_datetime DATETIME NOT NULL,
  capacity INT NOT NULL DEFAULT 20,
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uniq_group_session (group_id, session_datetime)
);

-- Add capacity column if missing
ALTER TABLE group_sessions ADD COLUMN IF NOT EXISTS capacity INT NOT NULL DEFAULT 20;
