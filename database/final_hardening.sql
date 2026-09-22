USE taskflow_student;

-- הגדרות אוטומציה נשמרות בשרת ולא רק בדפדפן
CREATE TABLE IF NOT EXISTS automation_rules (
  id VARCHAR(40) PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  description VARCHAR(255) NOT NULL,
  trigger_text VARCHAR(150) NOT NULL,
  action_text VARCHAR(150) NOT NULL,
  icon VARCHAR(40) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  runs INT NOT NULL DEFAULT 0,
  last_run_at DATETIME NULL,
  updated_by INT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT IGNORE INTO automation_rules(id,title,description,trigger_text,action_text,icon,enabled) VALUES
('overdue','התראת איחור חכמה','מזהה משימה שעברה את מועד הסיום','משימה באיחור','התראה למנהל ולעובד','schedule',1),
('capacity','הגנת עומס עובדים','מונעת הקצאה לעובד שהגיע למגבלה','עובד ב־100%','חסימה והצעת עובד פנוי','balance',1),
('complete','סיום פרויקט אוטומטי','מסיימת פרויקט לאחר השלמת המשימות ושער האיכות','כל המשימות והבדיקות הושלמו','עדכון הפרויקט והצוות','verified',1),
('deadline','תזכורת לפני מסירה','מתריעה שלושה ימים לפני סיום משימה','נותרו עד 3 ימים','תזכורת לעובד האחראי','event_upcoming',1);

-- תוכנית הספרינט משותפת לכל המשתמשים
CREATE TABLE IF NOT EXISTS sprint_plan_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL UNIQUE,
  weeks INT NOT NULL DEFAULT 2,
  selected_by INT NOT NULL,
  selected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (selected_by) REFERENCES users(id) ON DELETE CASCADE
);

-- טיפול בסיכון נשמר עם המשתמש, הזמן והערה
CREATE TABLE IF NOT EXISTS risk_treatments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  risk_key VARCHAR(80) NOT NULL UNIQUE,
  status ENUM('acknowledged','resolved') NOT NULL DEFAULT 'acknowledged',
  note VARCHAR(500) NULL,
  handled_by INT NOT NULL,
  handled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE CASCADE
);
