SET NAMES utf8mb4;
UPDATE automation_rules SET title='התראת איחור חכמה',description='מזהה משימות שעברו את מועד הסיום ושולחת התראה לאחראים',trigger_text='משימה פעילה עברה את מועד הסיום',action_text='שליחת התראה לעובד ולמנהל',icon='schedule' WHERE id='overdue';
UPDATE automation_rules SET title='הגנת עומס עובדים',description='מונעת הקצאה נוספת לעובד שהגיע למגבלת המשימות הפעילות',trigger_text='עובד הגיע למכסת המשימות',action_text='חסימת ההקצאה והצעת עובד פנוי',icon='balance' WHERE id='capacity';
UPDATE automation_rules SET title='סיום פרויקט אוטומטי',description='מסיימת פרויקט רק לאחר שכל המשימות ושערי האיכות הושלמו',trigger_text='כל המשימות ובדיקות האיכות הושלמו',action_text='עדכון הפרויקט והצוות',icon='verified' WHERE id='complete';
UPDATE automation_rules SET title='תזכורת לפני מסירה',description='מתריעה מראש כאשר נותרו עד שלושה ימים לסיום משימה',trigger_text='נותרו עד שלושה ימים למועד הסיום',action_text='שליחת תזכורת לעובד האחראי',icon='event_upcoming' WHERE id='deadline';
