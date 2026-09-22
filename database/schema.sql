-- יצירת בסיס הנתונים הראשי של המערכת
CREATE DATABASE IF NOT EXISTS taskflow_student
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taskflow_student;

-- משתמשים: מנהלים ועובדים, פרטי התחברות והגדרות שכר ומשימות
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  status ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
  phone VARCHAR(30) NOT NULL DEFAULT '',
  hourly_rate DECIMAL(8,2) NOT NULL DEFAULT 0,
  max_active_tasks INT NOT NULL DEFAULT 5,
  cv_file VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  blocked_at DATETIME NULL
);

-- פרויקטים: פרטי הפרויקט, מנהל יוצר, סטטוס ותאריכים
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  status ENUM('planned', 'in_progress', 'completed') NOT NULL DEFAULT 'planned',
  start_date DATE NULL,
  due_date DATE NOT NULL,
  completed_at DATETIME NULL,
  estimated_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  actual_minutes INT NOT NULL DEFAULT 0,
  dependency_task_id INT NULL,
  labels VARCHAR(300) NOT NULL DEFAULT '',
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  planned_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
  priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  tags VARCHAR(500) NOT NULL DEFAULT '',
  external_link VARCHAR(500) NULL,
  archived_at DATETIME NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- רישומי זמן מאפשרים למדוד עבודה בפועל מול התכנון
CREATE TABLE task_work_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  minutes INT NOT NULL,
  note VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- אבני דרך מאפשרות לחלק פרויקט ליעדים קטנים וברורים
CREATE TABLE project_milestones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- משימות: כל משימה מחוברת לפרויקט ויכולה להיות מוקצית לעובד
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  assignee_id INT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  status ENUM('todo', 'in_progress', 'done') NOT NULL DEFAULT 'todo',
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  due_date DATE NOT NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
);

-- התראות שנשלחות למשתמשים ונשמר בהן מצב הקריאה
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(120) NOT NULL,
  message VARCHAR(255) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- רישומי נוכחות עם שעת כניסה ושעת יציאה
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  clock_in DATETIME NOT NULL,
  clock_out DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- מכסת שעות שבועית: המנהל קובע לכל עובד כמה שעות עליו לעבוד בכל שבוע
CREATE TABLE weekly_work_targets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  week_start DATE NOT NULL,
  target_hours DECIMAL(6,2) NOT NULL DEFAULT 40,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_week (user_id, week_start),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- תלושי שכר חודשיים המחושבים לפי שעות ותעריף העובד
CREATE TABLE payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pay_month CHAR(7) NOT NULL,
  total_hours DECIMAL(8,2) NOT NULL,
  hourly_rate DECIMAL(8,2) NOT NULL,
  total_salary DECIMAL(10,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_month (user_id, pay_month),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- אסימונים זמניים שמאפשרים לעובד לאפס סיסמה
CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ניסיונות כניסה משמשים להגנה מפני ניסיונות חוזרים לניחוש סיסמה
CREATE TABLE login_attempts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  attempt_key CHAR(64) NOT NULL,
  email_address VARCHAR(150) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  succeeded BOOLEAN NOT NULL DEFAULT FALSE,
  attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_attempt_window (attempt_key, succeeded, attempted_at)
);

-- הודעות צ'אט שמופרדות לפי פרויקט ולפי מנהל
CREATE TABLE project_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  manager_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  file_name VARCHAR(255) NULL,
  file_path VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- בקשות עובדים שנשלחות למנהל ומקבלות אישור או דחייה
CREATE TABLE employee_requests (
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

-- היסטוריית פעולות חשובות שבוצעו במערכת
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action_name VARCHAR(100) NOT NULL,
  details VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- תרחישי בדיקה ידניים של הפרויקטים
CREATE TABLE qa_test_cases (
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
  last_run_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_qa_case_project_status (project_id,status)
);

-- באגים שהתגלו במהלך בדיקות המערכת
CREATE TABLE qa_bugs (
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
  screenshot_name VARCHAR(255) NULL,
  screenshot_path VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_qa_bug_project_status (project_id,status),
  INDEX idx_qa_bug_severity (severity)
);

-- סיסמה לדוגמה תיווצר דרך ממשק השרת ההתקנה ולא נשמרת כאן כטקסט גלוי
INSERT INTO users (full_name,email,password_hash,role,hourly_rate,max_active_tasks)
VALUES
('מנהלת המערכת','admin@taskflow.local','$2y$10$E5PYRm7RAisifiMz3i9lLOcV9DPwoN29vDWGz8daFwC6xTchAqWtG','admin',70,10),
('מרים חורי','employee@taskflow.local','$2y$10$E5PYRm7RAisifiMz3i9lLOcV9DPwoN29vDWGz8daFwC6xTchAqWtG','employee',42,5);

-- חוקים אוטומטיים שניתנים להפעלה והרצה דרך המערכת
CREATE TABLE automation_rules (id VARCHAR(40) PRIMARY KEY,title VARCHAR(120) NOT NULL,description VARCHAR(255) NOT NULL,trigger_text VARCHAR(150) NOT NULL,action_text VARCHAR(150) NOT NULL,icon VARCHAR(40) NOT NULL,enabled TINYINT(1) NOT NULL DEFAULT 1,runs INT NOT NULL DEFAULT 0,last_run_at DATETIME NULL,updated_by INT NULL,updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL);
INSERT INTO automation_rules(id,title,description,trigger_text,action_text,icon,enabled) VALUES ('overdue','התראת איחור חכמה','מזהה משימה שעברה את מועד הסיום','משימה באיחור','התראה למנהל ולעובד','schedule',1),('capacity','הגנת עומס עובדים','מונעת הקצאה לעובד שהגיע למגבלה','עובד ב־100%','חסימה והצעת עובד פנוי','balance',1),('complete','סיום פרויקט אוטומטי','מסיימת פרויקט לאחר השלמת המשימות ושער האיכות','כל המשימות והבדיקות הושלמו','עדכון הפרויקט והצוות','verified',1),('deadline','תזכורת לפני מסירה','מתריעה שלושה ימים לפני סיום משימה','נותרו עד 3 ימים','תזכורת לעובד האחראי','event_upcoming',1);

-- משימות שנבחרו לתוכנית הספרינט המשותפת
CREATE TABLE sprint_plan_items (id INT AUTO_INCREMENT PRIMARY KEY,task_id INT NOT NULL UNIQUE,weeks INT NOT NULL DEFAULT 2,selected_by INT NOT NULL,selected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,FOREIGN KEY (selected_by) REFERENCES users(id) ON DELETE CASCADE);

-- מעקב אחר טיפול בסיכונים
CREATE TABLE risk_treatments (id INT AUTO_INCREMENT PRIMARY KEY,risk_key VARCHAR(80) NOT NULL UNIQUE,status ENUM('acknowledged','resolved') NOT NULL DEFAULT 'acknowledged',note VARCHAR(500) NULL,handled_by INT NOT NULL,handled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE CASCADE);
