-קובץ זה מגדיר את חלק ממערכת טאסקפלו.
USE taskflow_student;

-- יוצר או מעדכן טבלה ומגדיר את מבנה הנתונים שלה.
ALTER TABLE project_messages
  ADD COLUMN IF NOT EXISTS file_name VARCHAR(255) NULL AFTER message,
  ADD COLUMN IF NOT EXISTS file_path VARCHAR(255) NULL AFTER file_name;

-- יוצר או מעדכן טבלה ומגדיר את מבנה הנתונים שלה.
CREATE TABLE IF NOT EXISTS employee_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  manager_id INT NOT NULL,
  request_type ENUM('vacation', 'task_swap', 'deadline', 'late_arrival', 'general') NOT NULL,
  task_id INT NULL,
  swap_task_id INT NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  requested_due_date DATE NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  manager_comment TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME NULL,
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (swap_task_id) REFERENCES tasks(id) ON DELETE SET NULL
);
