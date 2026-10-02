# PayPilot — Employee Payroll Management System

PayPilot is a fully working, browser-based DBMS mini-project for the **Employee Payroll Management System** described in the supplied reference report. It uses the same five modules and relationship model, while adding a clean operational interface for demonstrating the database flow.

## What is included

- Dashboard with payroll totals, department distribution and recent activity.
- Employee management with add, edit, search, delete and CSV export.
- Department management with joined employee directory and grouped payroll totals.
- Attendance management for present days, absence, leave and overtime.
- Payroll processing with calculated basic pay, allowance, overtime, tax, deductions and net salary.
- Reports and search with employee salary report, department totals, CSV export and print support.
- SQL Lab with the database schema, payroll queries and test-case examples.
- Local browser persistence via `localStorage` plus JSON backup export.
- `schema.sql` for MySQL 8.0+ and MySQL Workbench.

## Run locally

The app has no build step and no external dependencies. From this folder, run either:

```bash
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173). A static server is recommended because it makes the schema download and relative assets behave consistently. The app can also be opened directly from `index.html` in a modern browser.

## Deploy with GitHub Pages

This is a static site, so GitHub Pages is the simplest deployment option.

1. Create a new **public** GitHub repository, for example `employee-payroll-management-system`.
2. In VS Code, open this project folder and run:

   ```bash
   git init
   git add .
   git commit -m "feat: add employee payroll management system"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/employee-payroll-management-system.git
   git push -u origin main
   ```

3. On GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select branch **main**, folder **/(root)**, and click **Save**.
6. GitHub will publish the app at:
   `https://YOUR-USERNAME.github.io/employee-payroll-management-system/`

No Node.js, npm build command or backend server is required. GitHub Pages serves `index.html`, `styles.css`, `app.js` and the SQL/report files directly. If you edit the project later, use `git add .`, `git commit -m "describe your change"` and `git push` to redeploy.

### Alternative deployment options

- **Netlify:** drag the project folder into Netlify Drop, or connect the GitHub repository. Leave the build command blank and use `index.html` as the published root.
- **Vercel:** import the GitHub repository, choose **Other** / static site, leave the build command blank, and deploy.

The application stores demo edits in each browser's local storage. GitHub Pages does not provide a shared database; use `schema.sql` with MySQL Workbench when you need a real database backend.

## Demo workflow

1. Open **Employees** and add or edit an employee.
2. Open **Attendance**, choose a pay period and update attendance values.
3. Select **Save changes**.
4. Open **Payroll processing** and choose **Recalculate**.
5. Review the register, open a payslip, and select **Mark as paid**.
6. Open **Reports & search** to inspect joined and grouped payroll output.
7. Use **Backup data** on the dashboard before clearing browser storage.

## Payroll assumptions

This educational demo uses transparent assumptions rather than legal payroll advice:

- Absence deduction = basic salary ÷ 26 × absent days.
- Overtime pay = overtime hours × (basic salary ÷ 26 ÷ 8) × 1.5.
- Tax = 5% of gross pay.
- Net salary = gross pay − tax − fixed deduction.

The app is intentionally self-contained. Data is stored locally in the current browser and is not sent to a server. Use the JSON backup action for portability. For production use, replace local storage with a secured backend, authentication, audit logs and jurisdiction-specific payroll rules.

## MySQL setup

Open `schema.sql` in MySQL Workbench and execute it against a MySQL 8.0+ server. The script creates `EmployeePayroll`, creates the five related tables, inserts sample data and includes the reference-style JOIN, aggregate and validation queries.

## Verification checklist

- Valid employee insertion works; duplicate employee IDs are rejected in the UI.
- Employee-to-department relationships appear in joined views.
- Attendance updates change absence and overtime effects on payroll.
- Payroll formula is recalculated and displayed per employee.
- Department reports use grouped totals.
- CSV export, JSON backup and browser print are available.
- Refreshing the page preserves changes in local storage.
