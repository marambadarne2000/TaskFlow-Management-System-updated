USE taskflow_student;

-- תרחישי בדיקה ידניים המקושרים לפרויקט ולעובד מבצע
CREATE TABLE IF NOT EXISTS qa_test_cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  preconditions TEXT NULL,
  steps TEXT NOT NULL,
  expected_result TEXT NOT NULL,
  priority ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  status ENUM('ready','passed','failed','blocked') NOT NULL DEFAULT 'ready',
  created_by INT NOT NULL,
  assigned_to INT NULL,
  screenshot_name VARCHAR(255) NULL,
  screenshot_path VARCHAR(255) NULL,
  last_run_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_qa_case_project_status (project_id,status)
);

-- באגים שהתגלו בבדיקות או בעבודה השוטפת
CREATE TABLE IF NOT EXISTS qa_bugs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  task_id INT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  reproduction_steps TEXT NOT NULL,
  severity ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  status ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  reported_by INT NOT NULL,
  assigned_to INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_qa_bug_project_status (project_id,status),
  INDEX idx_qa_bug_severity (severity)
);
