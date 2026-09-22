-קובץ זה מגדיר את חלק ממערכת טאסקפלו.
USE taskflow_student;

-- יוצר או מעדכן טבלה ומגדיר את מבנה הנתונים שלה.
CREATE TABLE IF NOT EXISTS project_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  manager_id INT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- יוצר או מעדכן טבלה ומגדיר את מבנה הנתונים שלה.
ALTER TABLE project_messages ADD COLUMN IF NOT EXISTS manager_id INT NULL AFTER project_id;
UPDATE project_messages SET manager_id=1 WHERE manager_id IS NULL;
