# TaskFlow Student

פרויקט גמר לניהול עובדים, פרויקטים ומשימות בחברה קטנה

המערכת בנויה משלוש שכבות

- Angular 17 בצד הלקוח
- PHP בצד השרת
- MySQL בבסיס הנתונים

## תכונות מרכזיות

- ממשק שונה למנהל ולעובד
- ניהול עובדים ותפקידים
- ניהול פרויקטים ומשימות
- השלמה אוטומטית של פרויקט לאחר סיום כל המשימות
- הגבלת מספר המשימות הפעילות לכל עובד
- התראות אישיות ושליחה לכל העובדים
- צ׳אט נפרד לכל פרויקט ולכל מנהל עם העלאת קבצים
- בקשות חופשה, החלפת משימות, הארכת מועד והגעה באיחור
- רישום נוכחות ומכסת שעות שבועית
- חישוב שכר והפקת תלושים חודשיים
- חיפוש וסינון לפי שנה, חודש ותאריך
- איפוס סיסמה באמצעות קישור זמני
- אוטומציות שרת להתראות איחור ומועדים קרובים
- תכנון ספרינט משותף הנשמר ב־MySQL
- מרכז סיכונים עם תיעוד מטפל והערה
- בקרת איכות, באגים, צילומי מסך ודרכון מסירה
- מרכז פעולה חכם שמדרג את הפעולות הדחופות

## דרישות מוקדמות

- XAMPP עם PHP ו־MySQL
- Node.js 20 ומעלה
- npm

## התקנת בסיס הנתונים

1. מפעילים את MySQL ב־XAMPP
2. פותחים את phpMyAdmin בכתובת `http://localhost/phpmyadmin`
3. בוחרים בכרטיסייה Import
4. מייבאים את הקובץ `database/schema.sql`
5. אפשר לייבא לאחר מכן את `database/demo_data.sql` לקבלת נתוני הדגמה נוספים

לשדרוג בסיס נתונים קיים מייבאים גם את `database/final_hardening.sql`

פרטי החיבור נמצאים בקובץ `backend/config.php`

```php
const DB_HOST = "127.0.0.1";
const DB_NAME = "taskflow_student";
const DB_USER = "root";
const DB_PASS = "1234";
```

אם סיסמת MySQL במחשב שונה, יש לעדכן רק את `DB_PASS`

## התקנת Angular

פותחים PowerShell בתיקיית `frontend` ומריצים

```powershell
npm install
```

## הפעלה מהירה ב־Windows

לאחר התקנת בסיס הנתונים והחבילות לוחצים פעמיים על

```text
START-TASKFLOW.bat
```

הקובץ מפעיל את MySQL, את שרת PHP ואת Angular ופותח את המערכת בכתובת

```text
http://127.0.0.1:4300
```

## הפעלה ידנית

בחלון PowerShell ראשון

```powershell
cd backend
C:\xampp\php\php.exe -S 127.0.0.1:8000
```

בחלון PowerShell שני

```powershell
cd frontend
npm start -- --host 127.0.0.1 --port 4300
```

לאחר מכן פותחים `http://127.0.0.1:4300`

## משתמשי הדגמה

לאחר ייבוא `schema.sql`

- מנהל: `admin@taskflow.local`
- עובד: `employee@taskflow.local`
- סיסמה לשני המשתמשים: `123456`

אם תפקיד של משתמש שונה במסך ניהול העובדים, התפקיד החדש נשמר ב־MySQL ויופיע בכניסה הבאה

## מבנה התיקיות

```text
taskflow-student/
├── frontend/       Angular
├── backend/        PHP API
├── database/       MySQL scripts
├── docs/           מסמכי עזר
├── tests/          בדיקות מערכת בטוחות
├── run-project.ps1 הפעלה אוטומטית
└── START-TASKFLOW.bat
```

## קבצים מרכזיים

- `frontend/src/app/core/services/taskflow-store.service.ts` מנהל את נתוני צד הלקוח ואת התקשורת עם PHP
- `frontend/src/app/layout/shell/` מכיל את התפריט ואת מעטפת המערכת
- `frontend/src/app/pages/` מכיל את עמודי המערכת
- `frontend/src/styles.scss` מכיל את העיצוב הכללי
- `backend/api.php` מנתב את בקשות Angular לקובצי PHP
- `backend/config.php` מכיל את החיבור ל־MySQL ואת פונקציות השרת המשותפות

## בדיקה לפני הגשה

```powershell
C:\xampp\php\php.exe tests\system-smoke.php
cd frontend
npm run build
```

הבדיקות בודקות את החיבור למסד הנתונים, הטבלאות המרכזיות, כפילויות, קשרי משימות, חוזק סיסמה ושמות קבצים
- `database/schema.sql` יוצר את בסיס הנתונים והטבלאות

## העלאה ל־GitHub

מעלים את תיקיית `taskflow-student` בלבד ולא את תיקיית הפרויקט הישנה

הקובץ `.gitignore` מונע העלאה של `node_modules`, קובצי build, קובצי log, גיבויים וקורות חיים שהועלו למערכת
