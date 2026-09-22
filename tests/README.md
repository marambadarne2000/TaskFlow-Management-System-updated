# TaskFlow system checks

Run the safe backend and database checks with:

```powershell
C:\xampp\php\php.exe tests\system-smoke.php
```

Run the Angular production build with:

```powershell
cd frontend
npm run build
```

The smoke test is read-only and does not delete or replace project data.
