-- Employee Payroll Management System
-- MySQL 8.0+ schema and demonstration queries

CREATE DATABASE IF NOT EXISTS EmployeePayroll;
USE EmployeePayroll;

DROP TABLE IF EXISTS Salary_Components;
DROP TABLE IF EXISTS Payroll;
DROP TABLE IF EXISTS Attendance;
DROP TABLE IF EXISTS Employee;
DROP TABLE IF EXISTS Department;

CREATE TABLE Department (
  Dept_ID INT PRIMARY KEY,
  Dept_Name VARCHAR(50) NOT NULL UNIQUE,
  Manager_Name VARCHAR(80) NOT NULL
);

CREATE TABLE Employee (
  Emp_ID INT PRIMARY KEY,
  Emp_Name VARCHAR(60) NOT NULL,
  Email VARCHAR(120) NOT NULL UNIQUE,
  Dept_ID INT NOT NULL,
  Designation VARCHAR(50) NOT NULL,
  Join_Date DATE NOT NULL,
  Basic_Salary DECIMAL(10,2) NOT NULL CHECK (Basic_Salary >= 0),
  Allowance DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (Allowance >= 0),
  Deduction DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (Deduction >= 0),
  Status ENUM('Active', 'On Leave', 'Inactive') NOT NULL DEFAULT 'Active',
  CONSTRAINT fk_employee_department FOREIGN KEY (Dept_ID) REFERENCES Department(Dept_ID)
);

CREATE TABLE Attendance (
  Attendance_ID INT PRIMARY KEY,
  Emp_ID INT NOT NULL,
  Pay_Month VARCHAR(20) NOT NULL,
  Days_Present INT NOT NULL DEFAULT 0 CHECK (Days_Present BETWEEN 0 AND 31),
  Days_Absent INT NOT NULL DEFAULT 0 CHECK (Days_Absent BETWEEN 0 AND 31),
  Leave_Days INT NOT NULL DEFAULT 0 CHECK (Leave_Days BETWEEN 0 AND 31),
  Overtime_Hours DECIMAL(6,2) NOT NULL DEFAULT 0 CHECK (Overtime_Hours >= 0),
  UNIQUE KEY uq_attendance_employee_month (Emp_ID, Pay_Month),
  CONSTRAINT fk_attendance_employee FOREIGN KEY (Emp_ID) REFERENCES Employee(Emp_ID)
);

CREATE TABLE Payroll (
  Payroll_ID INT PRIMARY KEY,
  Emp_ID INT NOT NULL,
  Basic_Salary DECIMAL(10,2) NOT NULL,
  Allowance DECIMAL(10,2) NOT NULL DEFAULT 0,
  Overtime_Pay DECIMAL(10,2) NOT NULL DEFAULT 0,
  Tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  Deduction DECIMAL(10,2) NOT NULL DEFAULT 0,
  Net_Salary DECIMAL(10,2) NOT NULL,
  Pay_Month VARCHAR(20) NOT NULL,
  Status ENUM('Draft', 'Processed', 'Paid') NOT NULL DEFAULT 'Draft',
  UNIQUE KEY uq_payroll_employee_month (Emp_ID, Pay_Month),
  CONSTRAINT fk_payroll_employee FOREIGN KEY (Emp_ID) REFERENCES Employee(Emp_ID)
);

CREATE TABLE Salary_Components (
  Component_ID INT PRIMARY KEY,
  Emp_ID INT NOT NULL,
  Component_Name VARCHAR(50) NOT NULL,
  Amount DECIMAL(10,2) NOT NULL CHECK (Amount >= 0),
  CONSTRAINT fk_component_employee FOREIGN KEY (Emp_ID) REFERENCES Employee(Emp_ID)
);

INSERT INTO Department (Dept_ID, Dept_Name, Manager_Name) VALUES
(1, 'Information Technology', 'Dr. Meera Nair'),
(2, 'Human Resources', 'Anita Joseph'),
(3, 'Finance', 'Karthik Raman'),
(4, 'Sales & Marketing', 'Rohit Menon');

INSERT INTO Employee
(Emp_ID, Emp_Name, Email, Dept_ID, Designation, Join_Date, Basic_Salary, Allowance, Deduction, Status)
VALUES
(101, 'Arun Kumar', 'arun.kumar@paypilot.demo', 1, 'Senior Software Engineer', '2025-06-10', 58000, 8500, 3000, 'Active'),
(102, 'Priya S', 'priya.s@paypilot.demo', 2, 'HR Executive', '2025-07-15', 42000, 6000, 2200, 'Active'),
(103, 'Rahul M', 'rahul.m@paypilot.demo', 1, 'Data Analyst', '2025-08-01', 51000, 7000, 2600, 'Active'),
(104, 'Divya Raj', 'divya.raj@paypilot.demo', 3, 'Accounts Executive', '2024-11-12', 46500, 5500, 2100, 'Active'),
(105, 'Vikram Das', 'vikram.das@paypilot.demo', 4, 'Sales Executive', '2026-01-20', 39000, 9000, 1800, 'On Leave');

INSERT INTO Attendance
(Attendance_ID, Emp_ID, Pay_Month, Days_Present, Days_Absent, Leave_Days, Overtime_Hours)
VALUES
(1, 101, 'September 2026', 24, 0, 0, 8),
(2, 102, 'September 2026', 26, 0, 0, 5),
(3, 103, 'September 2026', 23, 1, 0, 10),
(4, 104, 'September 2026', 25, 1, 0, 4),
(5, 105, 'September 2026', 18, 0, 8, 0);

INSERT INTO Payroll
(Payroll_ID, Emp_ID, Basic_Salary, Allowance, Overtime_Pay, Tax, Deduction, Net_Salary, Pay_Month, Status)
VALUES
(1, 101, 58000, 8500, 3346.15, 3492.31, 3000, 63353.85, 'September 2026', 'Processed'),
(2, 102, 42000, 6000, 1514.42, 2475.72, 2200, 46838.70, 'September 2026', 'Processed'),
(3, 103, 49038.46, 7000, 3677.88, 2985.82, 2600, 54130.53, 'September 2026', 'Processed'),
(4, 104, 44711.54, 5500, 1341.35, 2577.64, 2100, 46875.24, 'September 2026', 'Processed'),
(5, 105, 39000, 9000, 0, 2400, 1800, 43800, 'September 2026', 'Processed');

-- Demonstration queries from the mini-project report
SELECT * FROM Employee;
SELECT E.Emp_ID, E.Emp_Name, D.Dept_Name
FROM Employee E JOIN Department D ON E.Dept_ID = D.Dept_ID;

SELECT E.Emp_Name, A.Pay_Month, A.Days_Present
FROM Employee E JOIN Attendance A ON E.Emp_ID = A.Emp_ID
WHERE A.Days_Present < 25;

UPDATE Payroll
SET Net_Salary = Basic_Salary + Allowance + Overtime_Pay - Tax - Deduction;

SELECT E.Emp_ID, E.Emp_Name, D.Dept_Name, P.Net_Salary
FROM Employee E
JOIN Department D ON E.Dept_ID = D.Dept_ID
JOIN Payroll P ON E.Emp_ID = P.Emp_ID
ORDER BY P.Net_Salary DESC;

SELECT D.Dept_Name,
       COUNT(E.Emp_ID) AS Employee_Count,
       SUM(P.Net_Salary) AS Department_Payroll
FROM Department D
JOIN Employee E ON D.Dept_ID = E.Dept_ID
JOIN Payroll P ON E.Emp_ID = P.Emp_ID
GROUP BY D.Dept_ID, D.Dept_Name;
