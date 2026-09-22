USE taskflow_student;

-- מוסיף צילום מסך מאובטח לדיווח באג קיים
ALTER TABLE qa_bugs
  ADD COLUMN IF NOT EXISTS screenshot_name VARCHAR(255) NULL AFTER assigned_to,
  ADD COLUMN IF NOT EXISTS screenshot_path VARCHAR(255) NULL AFTER screenshot_name;
