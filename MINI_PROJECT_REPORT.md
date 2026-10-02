# MINI PROJECT REPORT
## EMPLOYEE PAYROLL MANAGEMENT SYSTEM
### DBMS LABORATORY – SQL

**Submitted by**  
Name: ______________________________  
Register No: ________________________  
Class / Section: _____________________

Department of Artificial Intelligence and Data Science  
Panimalar College of Engineering  
**Academic Year: 2026–2027**

> Submission note: keep the supplied department/report font and size when this Markdown content is placed into the final college template. Add handwritten page numbers after printing, as required by the reference instructions.

## 1. ABSTRACT

The Employee Payroll Management System is a relational database project for organised salary administration.
It maintains employee, department, attendance and payroll information in related tables.
The system uses primary keys and foreign keys to protect table relationships.
SQL operations support insertion, modification, retrieval and payroll calculations.
Attendance data is connected to employees for monthly verification.
Payroll processing calculates basic pay, allowances, deductions and net salary.
The browser application provides a practical interface for demonstrating these operations.
Reports use joins, filters, sorting and aggregate functions to present useful results.
Validation checks support accurate employee and salary records.
The project reduces repeated manual calculations and improves record visibility.
The application is suitable for a DBMS laboratory demonstration and can be extended.

## 2. INTRODUCTION

Employee payroll information must be maintained accurately because it affects every employee and department.
Manual processing often requires repeated calculations and can create data-entry errors.
This project provides a structured SQL-based solution for employee payroll management.
The system stores departments and employees separately but connects them through foreign keys.
Attendance records support monthly payroll verification and exception review.
Payroll records store earnings, tax, deductions and calculated net salary.
The PayPilot browser interface demonstrates the same relational flow through connected modules.
Users can add employees, update attendance, recalculate payroll and inspect reports.
The SQL script can be executed in MySQL Workbench for database laboratory evaluation.
The project therefore combines DBMS concepts with a usable working demonstration.

## 3. OBJECTIVES

- Design a relational database for employee payroll management.
- Store employee, department, attendance and salary details systematically.
- Calculate and maintain payroll components using SQL.
- Retrieve useful payroll information through joins and aggregate queries.
- Maintain data accuracy using keys, constraints and validation.
- Test the database using valid and invalid input conditions.

## 4. LIST OF MODULES

1. Employee Management
2. Department Management
3. Attendance Management
4. Payroll Processing
5. Reports and Search

## 5. SYSTEM REQUIREMENTS

Hardware: Computer or laptop with minimum 4 GB RAM.

Software: MySQL / MySQL Workbench and a modern browser.

Operating System: Windows, Linux or macOS.

Database: MySQL 8.0+ relational database management system.

Language: SQL, HTML, CSS and JavaScript.

## 6. DATABASE DESIGN

The database contains Department, Employee, Attendance, Payroll and Salary_Components tables.
Department is related to Employee through Dept_ID.
Employee is related to Attendance, Payroll and Salary_Components through Emp_ID.
Unique keys prevent duplicate monthly attendance and payroll records.
Check constraints protect non-negative salary values and valid attendance ranges.
The complete executable schema and sample data are provided in `schema.sql`.

## 7. MODULE 1 – EMPLOYEE MANAGEMENT

Employee Management stores each employee's name, email, department, designation, joining date and salary inputs.
Each record has a unique employee ID.
The interface supports insertion, update, search, deletion and CSV export.
Employee records are joined with departments for consistent reporting.

## 8. MODULE 2 – DEPARTMENT MANAGEMENT

Department Management stores department names and managers.
Employees are grouped through the Dept_ID foreign key.
The module shows department headcount and department-wise payroll totals.
The joined directory demonstrates the relationship between Department and Employee.

## 9. MODULE 3 – ATTENDANCE MANAGEMENT

Attendance Management stores present days, absent days, leave days and overtime hours for a pay period.
Every attendance record is linked to an employee and period.
Absence and overtime values are used during payroll calculation.
The table highlights records that create a payroll impact.

## 10. MODULE 4 – PAYROLL PROCESSING

Payroll Processing calculates salary for each active employee.
The formula is: Basic Pay + Allowance + Overtime − Tax − Fixed Deduction.
Absence reduces basic pay and overtime increases gross pay.
The module supports recalculation, register review, payslip preview and paid status.

## 11. MODULE 5 – REPORTS AND SEARCH

Reports and Search presents an employee salary register sorted by net salary.
The department report groups employees and sums departmental payroll.
Search supports employee and department text.
CSV export and print support make results easy to submit and review.

## 12. ADVANTAGES

- Reduces repeated payroll calculations and record maintenance.
- Provides centralised employee and salary information.
- Improves consistency through keys and constraints.
- Supports fast joined and department-wise reports.
- Keeps the browser demonstration portable and easy to deploy.

## 13. DISADVANTAGES

- The demonstration stores data locally in the browser.
- Production security and user roles require a backend.
- Complex statutory payroll rules need additional configuration.
- Regular backup is required to prevent local data loss.
- The current project is designed for laboratory use.

## 14. TEST OBJECTIVE

Testing verifies that employee, department, attendance and payroll operations produce expected results.
Valid records are inserted and displayed through the relevant module.
Duplicate IDs and invalid relationships are checked against key and validation rules.
Payroll calculations are compared with the displayed formula and report totals.
The tests also verify that joined and grouped queries return consistent information.

## 15. TEST CASES

| Test ID | Testing option / condition | Input type | Expected result |
|---|---|---|---|
| TC01 | Insert a valid employee record | Valid | Record saved successfully |
| TC02 | Insert a duplicate Employee ID | Invalid | Validation rejects the record |
| TC03 | Assign employee to an existing department | Valid | Department relationship is displayed |
| TC04 | Assign employee to a missing department | Invalid | Foreign-key/validation error |
| TC05 | Save valid attendance values | Valid | Attendance record is stored |
| TC06 | Enter a negative attendance value | Invalid | Input is rejected |
| TC07 | Recalculate Net Salary | Valid | Correct net salary is displayed |
| TC08 | Search payroll by employee name | Valid | Matching payroll record is shown |
| TC09 | Export employee or payroll report | Valid | CSV file is downloaded |
| TC10 | Generate department-wise payroll | Valid | Correct grouped report is displayed |

## 16. CONCLUSION

The Employee Payroll Management System was designed as a SQL-based DBMS mini project.
It provides a structured method for storing and managing employee payroll information.
Department and employee records are maintained in related tables.
Attendance information is linked to employees for monthly verification.
Payroll values include basic pay, allowances, tax, deductions and net salary.
Primary keys, foreign keys and constraints support relationships and data consistency.
The working browser interface demonstrates the database modules in a clear sequence.
SQL joins and aggregate functions produce employee and department reports.
Testing covers valid inputs, invalid values, duplicate identifiers and calculations.
The schema can be executed in MySQL Workbench for laboratory demonstration.
The design is modular, portable and easy to extend with a secured backend.

## 17. FUTURE ENHANCEMENT

- Add authentication and role-based access.
- Add stored procedures, triggers and an audit log.
- Add leave management and jurisdiction-specific tax rules.
- Add monthly payslip PDF generation and email delivery.
- Replace browser storage with a secured production database.

## 18. RESULT

The Employee Payroll Management System is implemented as a working browser demonstration with an executable MySQL schema. The tables, relationships, payroll calculation flow, reports and test options are ready for evaluation and further extension.

## Screenshot submission checklist

The app is intentionally arranged for module screenshots. Capture one screen for each module, or two per module where required: Employee list/form; Department directory/report; Attendance editor; Payroll register/payslip; Reports/search. Use the browser's print or screenshot tool after opening each module.
