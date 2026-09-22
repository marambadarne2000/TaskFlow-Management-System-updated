USE taskflow_student;

-- הטבלה שומרת חלון קצר של ניסיונות כניסה לצורך חסימה זמנית
CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  attempt_key CHAR(64) NOT NULL,
  email_address VARCHAR(150) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  succeeded BOOLEAN NOT NULL DEFAULT FALSE,
  attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_attempt_window (attempt_key, succeeded, attempted_at)
);

-- ניקוי אוטומטי של רשומות ישנות יכול להתבצע בתחזוקה תקופתית
DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
