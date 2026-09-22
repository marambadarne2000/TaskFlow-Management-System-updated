-קובץ זה מגדיר את חלק ממערכת טאסקפלו.
USE taskflow_student;

INSERT IGNORE INTO users
  (id, full_name, email, password_hash, role, status, hourly_rate, max_active_tasks)
VALUES
  (3, 'אחמד עלי', 'ahmad@taskflow.local', '$2y$10$E5PYRm7RAisifiMz3i9lLOcV9DPwoN29vDWGz8daFwC6xTchAqWtG', 'employee', 'active', 45, 3),
  (4, 'סארה חנא', 'sara@taskflow.local', '$2y$10$E5PYRm7RAisifiMz3i9lLOcV9DPwoN29vDWGz8daFwC6xTchAqWtG', 'employee', 'active', 40, 4);

INSERT IGNORE INTO projects
  (id, name, description, status, start_date, due_date, completed_at, created_by)
VALUES
  (1, 'אתר חנות מקוונת', 'בניית חנות מוצרים פשוטה', 'in_progress', '2026-08-01', '2026-08-20', NULL, 1),
  (2, 'מערכת הזמנת תורים', 'מערכת לניהול תורים', 'completed', '2026-07-20', '2026-08-12', '2026-08-04 12:20:00', 1),
  (3, 'אפליקציית מלאי', 'מעקב מלאי לעסק קטן', 'planned', '2026-08-05', '2026-08-30', NULL, 1);

INSERT IGNORE INTO tasks
  (id, project_id, assignee_id, title, status, priority, due_date)
VALUES
  (1, 1, 2, 'עיצוב מסך התחברות', 'in_progress', 'high', '2026-08-10'),
  (2, 1, 3, 'יצירת טבלת מוצרים', 'todo', 'medium', '2026-08-14'),
  (3, 2, 4, 'בדיקת טופס תורים', 'done', 'low', '2026-08-08'),
  (4, 2, 3, 'בניית API לתורים', 'done', 'high', '2026-08-09');

INSERT IGNORE INTO attendance (id, user_id, clock_in, clock_out) VALUES
  (1, 2, '2026-08-03 08:00:00', '2026-08-03 16:30:00'),
  (2, 3, '2026-08-03 08:15:00', '2026-08-03 17:00:00'),
  (3, 4, '2026-08-03 09:00:00', '2026-08-03 16:00:00'),
  (11, 2, '2026-06-01 08:00:00', '2026-06-01 16:30:00'),
  (12, 2, '2026-06-02 08:10:00', '2026-06-02 16:40:00'),
  (13, 2, '2026-06-03 07:55:00', '2026-06-03 16:25:00'),
  (14, 2, '2026-06-04 08:05:00', '2026-06-04 16:35:00'),
  (15, 2, '2026-06-05 08:00:00', '2026-06-05 16:30:00');

INSERT IGNORE INTO payroll
  (user_id, pay_month, total_hours, hourly_rate, total_salary)
VALUES
  (2, '2026-06', 42.5, 42, 1785);
