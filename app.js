const STORE = 'paypilot-demo-v1';
const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const state = loadState();
let activePage = 'dashboard';
let employeeSearch = '';
let reportSearch = '';
let sqlTab = 'schema';

function seedState() {
  return {
    departments: [
      { id: 1, name: 'Information Technology', manager: 'Dr. Meera Nair' },
      { id: 2, name: 'Human Resources', manager: 'Anita Joseph' },
      { id: 3, name: 'Finance', manager: 'Karthik Raman' },
      { id: 4, name: 'Sales & Marketing', manager: 'Rohit Menon' }
    ],
    employees: [
      { id: 101, name: 'Arun Kumar', email: 'arun.kumar@paypilot.demo', departmentId: 1, designation: 'Senior Software Engineer', joinDate: '2025-06-10', salary: 58000, allowance: 8500, deduction: 3000, status: 'Active' },
      { id: 102, name: 'Priya S', email: 'priya.s@paypilot.demo', departmentId: 2, designation: 'HR Executive', joinDate: '2025-07-15', salary: 42000, allowance: 6000, deduction: 2200, status: 'Active' },
      { id: 103, name: 'Rahul M', email: 'rahul.m@paypilot.demo', departmentId: 1, designation: 'Data Analyst', joinDate: '2025-08-01', salary: 51000, allowance: 7000, deduction: 2600, status: 'Active' },
      { id: 104, name: 'Divya Raj', email: 'divya.raj@paypilot.demo', departmentId: 3, designation: 'Accounts Executive', joinDate: '2024-11-12', salary: 46500, allowance: 5500, deduction: 2100, status: 'Active' },
      { id: 105, name: 'Vikram Das', email: 'vikram.das@paypilot.demo', departmentId: 4, designation: 'Sales Executive', joinDate: '2026-01-20', salary: 39000, allowance: 9000, deduction: 1800, status: 'On Leave' }
    ],
    periods: [
      { id: 1, name: 'September 2026', start: '2026-09-01', end: '2026-09-30', status: 'Processed' },
      { id: 2, name: 'October 2026', start: '2026-10-01', end: '2026-10-31', status: 'Open' }
    ],
    selectedPeriodId: 1,
    attendance: [
      { id: 1, employeeId: 101, periodId: 1, present: 24, absent: 0, leave: 0, overtime: 8 },
      { id: 2, employeeId: 102, periodId: 1, present: 26, absent: 0, leave: 0, overtime: 5 },
      { id: 3, employeeId: 103, periodId: 1, present: 23, absent: 1, leave: 0, overtime: 10 },
      { id: 4, employeeId: 104, periodId: 1, present: 25, absent: 1, leave: 0, overtime: 4 },
      { id: 5, employeeId: 105, periodId: 1, present: 18, absent: 0, leave: 8, overtime: 0 }
    ],
    payroll: [],
    activities: [
      { icon: '✓', title: 'Payroll processed', detail: 'September 2026 payroll was completed', time: 'Today' },
      { icon: '+', title: 'Employee added', detail: 'Divya Raj joined Finance', time: '2 days ago' },
      { icon: '↗', title: 'Report exported', detail: 'Department payroll report downloaded', time: '4 days ago' }
    ]
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    if (saved && saved.employees && saved.departments) return saved;
  } catch (error) { /* Start clean when storage is unavailable or corrupt. */ }
  const fresh = seedState();
  fresh.payroll = buildPayroll(fresh, 1);
  persist(fresh);
  return fresh;
}

function persist(next = state) { localStorage.setItem(STORE, JSON.stringify(next)); }
function byId(items, id) { return items.find(item => Number(item.id) === Number(id)); }
function deptName(id) { return byId(state.departments, id)?.name || 'Unassigned'; }
function employee(id) { return byId(state.employees, id); }
function selectedPeriod() { return byId(state.periods, state.selectedPeriodId) || state.periods[0]; }
function attendanceFor(empId, periodId = state.selectedPeriodId) { return state.attendance.find(row => row.employeeId === Number(empId) && row.periodId === Number(periodId)); }
function payrollFor(empId, periodId = state.selectedPeriodId) { return state.payroll.find(row => row.employeeId === Number(empId) && row.periodId === Number(periodId)); }
function money(value) { return INR.format(Number(value || 0)); }
function shortDate(value) { return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)); }
function initials(name) { return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase(); }
function esc(value) { return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function sum(rows, key) { return rows.reduce((total, row) => total + Number(row[key] || 0), 0); }
function notify(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.getElementById('toast-root').append(toast);
  setTimeout(() => toast.remove(), 3200);
}

function calcPayroll(emp, attendance = {}, periodId = null) {
  const present = Number(attendance.present || 0);
  const absent = Number(attendance.absent || 0);
  const overtime = Number(attendance.overtime || 0);
  const dailyRate = emp.salary / 26;
  const absenceDeduction = dailyRate * absent;
  const basicPay = Math.max(0, emp.salary - absenceDeduction);
  const overtimePay = overtime * (emp.salary / 26 / 8) * 1.5;
  const gross = basicPay + emp.allowance + overtimePay;
  const tax = gross * 0.05;
  const totalDeductions = tax + emp.deduction;
  return { employeeId: emp.id, periodId: Number(periodId ?? attendance.periodId ?? 0), basicPay, allowance: emp.allowance, overtimePay, gross, tax, otherDeduction: emp.deduction, totalDeductions, net: gross - totalDeductions, status: 'Draft', present };
}

function buildPayroll(source, periodId) {
  const rows = source.employees.filter(emp => emp.status !== 'Inactive').map(emp => {
    const attendance = source.attendance.find(a => a.employeeId === emp.id && a.periodId === periodId) || { periodId };
    return calcPayroll(emp, attendance, periodId);
  });
  return rows;
}

function render() {
  const pageNames = { dashboard: 'Dashboard', employees: 'Employees', departments: 'Departments', attendance: 'Attendance', payroll: 'Payroll processing', reports: 'Reports & search', sql: 'SQL lab' };
  document.getElementById('breadcrumb-page').textContent = pageNames[activePage];
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === activePage));
  const pages = { dashboard: renderDashboard, employees: renderEmployees, departments: renderDepartments, attendance: renderAttendance, payroll: renderPayroll, reports: renderReports, sql: renderSQL };
  document.getElementById('app').innerHTML = pages[activePage]();
}

function pageHeader(eyebrow, title, description, actions = '') {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div><div class="heading-actions">${actions}</div></div>`;
}

function renderDashboard() {
  const currentRows = state.payroll.filter(row => row.periodId === state.selectedPeriodId);
  const activeCount = state.employees.filter(emp => emp.status === 'Active').length;
  const totalNet = sum(currentRows, 'net');
  const totalDed = sum(currentRows, 'totalDeductions');
  const action = `<button class="secondary-button" data-action="export-json">⇩ Backup data</button><button class="primary-button compact" data-page="payroll">Process payroll →</button>`;
  const departments = state.departments.map(dept => {
    const deptRows = currentRows.filter(row => employee(row.employeeId)?.departmentId === dept.id);
    return { ...dept, total: sum(deptRows, 'net'), count: deptRows.length };
  }).filter(item => item.count);
  const maxTotal = Math.max(...departments.map(item => item.total), 1);
  return pageHeader('Payroll workspace', 'Good morning, Admin Student', `Here’s your payroll overview for ${selectedPeriod().name}.`, action) + `
    <div class="stat-grid">
      <div class="card stat-card"><div class="stat-top"><span>Total employees</span><span class="stat-icon">♙</span></div><div class="stat-number">${state.employees.length}</div><div class="stat-footer"><span class="trend-up">↑ 8.3%</span> vs last month</div></div>
      <div class="card stat-card"><div class="stat-top"><span>Active employees</span><span class="stat-icon">✓</span></div><div class="stat-number">${activeCount}</div><div class="stat-footer"><span class="trend-up">${state.employees.length - activeCount} on leave</span> or inactive</div></div>
      <div class="card stat-card"><div class="stat-top"><span>Net payroll</span><span class="stat-icon">◈</span></div><div class="stat-number">${money(totalNet)}</div><div class="stat-footer"><span class="trend-up">↑ 4.1%</span> from prior period</div></div>
      <div class="card stat-card"><div class="stat-top"><span>Total deductions</span><span class="stat-icon">−</span></div><div class="stat-number">${money(totalDed)}</div><div class="stat-footer">Tax and fixed deductions</div></div>
    </div>
    <div class="dashboard-grid">
      <section class="card content-card"><div class="card-head"><div><h2>Payroll overview</h2><p>Net payroll by department</p></div><select aria-label="Payroll period" data-action="period-select">${state.periods.map(period => `<option value="${period.id}" ${period.id === state.selectedPeriodId ? 'selected' : ''}>${esc(period.name)}</option>`).join('')}</select></div>
        <div class="chart-wrap"><div class="chart-gridlines"><span></span><span></span><span></span><span></span></div>${departments.map(item => `<div class="bar-group"><div class="bars"><div class="bar active" style="height:${Math.max(8, item.total / maxTotal * 150)}px"></div><div class="bar" style="height:${Math.max(8, item.total / maxTotal * 115)}px"></div></div><div class="bar-label">${esc(item.name.split(' ')[0])}</div></div>`).join('')}</div>
        <div class="legend"><span><i></i>Current period</span><span><i class="muted"></i>Previous period</span></div>
      </section>
      <section class="card content-card"><div class="card-head"><div><h2>Recent activity</h2><p>Latest workspace updates</p></div><button class="ghost-button" data-page="reports">View all</button></div><div class="activity-list">${state.activities.map(item => `<div class="activity-item"><span class="activity-icon">${item.icon}</span><div><strong>${esc(item.title)}</strong><p>${esc(item.detail)}</p></div><time>${esc(item.time)}</time></div>`).join('')}</div></section>
    </div>
    <div class="dashboard-grid section-gap"><section class="card content-card"><div class="card-head"><div><h2>Department payroll</h2><p>Net pay distribution for ${selectedPeriod().name}</p></div><button class="ghost-button" data-page="reports">Open report →</button></div><div class="progress-row">${departments.map(item => `<div><div class="progress-line"><span>${esc(item.name)}</span><strong>${money(item.total)}</strong></div><div class="progress-track"><div class="progress-value" style="width:${item.total / maxTotal * 100}%"></div></div></div>`).join('')}</div></section><section class="card content-card"><div class="card-head"><div><h2>Project modules</h2><p>Five connected database modules</p></div></div><div class="module-grid">${[['♙','Employee'],['✓','Attendance'],['◈','Payroll']].map(item => `<div class="module-card"><div class="module-symbol">${item[0]}</div><h3>${item[1]}</h3><p>Manage and review records</p></div>`).join('')}</div></section></div>`;
}

function renderEmployees() {
  const q = employeeSearch.toLowerCase();
  const rows = state.employees.filter(emp => `${emp.name} ${emp.designation} ${deptName(emp.departmentId)} ${emp.id}`.toLowerCase().includes(q));
  const actions = `<button class="secondary-button" data-action="export-employees">⇩ Export CSV</button><button class="primary-button compact" data-action="add-employee">＋ Add employee</button>`;
  return pageHeader('Employee management', 'Employees', 'Maintain employee details, department relationships and salary components.', actions) + `<section class="card table-card"><div class="table-toolbar"><div class="search-box"><span>⌕</span><input data-field="employee-search" value="${esc(employeeSearch)}" placeholder="Search by name, ID or role..." aria-label="Search employees" /></div><div class="toolbar-right"><select class="filter-select" data-field="employee-dept-filter"><option value="all">All departments</option>${state.departments.map(dept => `<option value="${dept.id}">${esc(dept.name)}</option>`).join('')}</select><button class="secondary-button" data-action="filter-toggle">≡ Filters</button></div></div><table class="data-table"><thead><tr><th>Employee</th><th>Department</th><th>Designation</th><th>Join date</th><th>Base salary</th><th>Status</th><th></th></tr></thead><tbody>${rows.length ? rows.map(employeeRow).join('') : `<tr><td class="empty-row" colspan="7">No employees matched your search.</td></tr>`}</tbody></table></section>`;
}

function employeeRow(emp) {
  const statusClass = emp.status.toLowerCase().replace(' ', '-');
  return `<tr><td><div class="employee-cell"><span class="employee-initial">${initials(emp.name)}</span><div><strong>${esc(emp.name)}</strong><small>#${emp.id} · ${esc(emp.email)}</small></div></div></td><td>${esc(deptName(emp.departmentId))}</td><td>${esc(emp.designation)}</td><td>${shortDate(emp.joinDate)}</td><td class="amount">${money(emp.salary)}</td><td><span class="badge ${statusClass}">${esc(emp.status)}</span></td><td><button class="table-action" data-action="edit-employee" data-id="${emp.id}" aria-label="Edit ${esc(emp.name)}">✎</button><button class="table-action" data-action="delete-employee" data-id="${emp.id}" aria-label="Delete ${esc(emp.name)}">×</button></td></tr>`;
}

function renderDepartments() {
  const cards = state.departments.map(dept => {
    const members = state.employees.filter(emp => emp.departmentId === dept.id);
    return `<div class="card content-card"><div class="card-head"><div><div class="module-symbol">▦</div><h2>${esc(dept.name)}</h2><p>${members.length} employee${members.length === 1 ? '' : 's'} · Manager: ${esc(dept.manager)}</p></div><button class="table-action" data-action="edit-department" data-id="${dept.id}">✎</button></div><div class="progress-row"><div><div class="progress-line"><span>Department payroll</span><strong>${money(sum(state.payroll.filter(row => members.some(emp => emp.id === row.employeeId) && row.periodId === state.selectedPeriodId), 'net'))}</strong></div><div class="progress-track"><div class="progress-value" style="width:${Math.min(100, members.length * 25 + 20)}%"></div></div></div></div></div>`;
  }).join('');
  return pageHeader('Department management', 'Departments', 'Organise employees and inspect department-wise payroll totals.', `<button class="primary-button compact" data-action="add-department">＋ Add department</button>`) + `<div class="module-grid">${cards}</div><section class="card table-card section-gap"><div class="table-toolbar"><div><strong style="font-size:13px">Employee department directory</strong><div style="font-size:10px;color:#9ba5ad;margin-top:4px">A joined view of Employee and Department tables</div></div><button class="secondary-button" data-action="export-departments">⇩ Export CSV</button></div><table class="data-table"><thead><tr><th>Employee</th><th>Department</th><th>Designation</th><th>Status</th></tr></thead><tbody>${state.employees.map(emp => `<tr><td><div class="employee-cell"><span class="employee-initial">${initials(emp.name)}</span><strong>${esc(emp.name)}</strong></div></td><td>${esc(deptName(emp.departmentId))}</td><td>${esc(emp.designation)}</td><td><span class="badge ${emp.status.toLowerCase().replace(' ', '-')}">${esc(emp.status)}</span></td></tr>`).join('')}</tbody></table></section>`;
}

function renderAttendance() {
  const period = selectedPeriod();
  const rows = state.employees.map(emp => ({ emp, attendance: attendanceFor(emp.id, period.id) || { present: 0, absent: 0, leave: 0, overtime: 0 } }));
  return pageHeader('Attendance management', 'Attendance', 'Record monthly attendance and overtime used by payroll processing.', `<select class="filter-select" data-action="period-select">${state.periods.map(item => `<option value="${item.id}" ${item.id === period.id ? 'selected' : ''}>${esc(item.name)}</option>`).join('')}</select><button class="primary-button compact" data-action="save-attendance">Save changes</button>`) + `<div class="inline-note">Attendance is linked to employees through <strong>Emp_ID</strong>. Update present, absent, leave and overtime values, then save before processing payroll.</div><section class="card table-card"><table class="data-table input-table"><thead><tr><th>Employee</th><th>Department</th><th>Present days</th><th>Absent days</th><th>Leave days</th><th>Overtime hours</th><th>Payroll impact</th></tr></thead><tbody>${rows.map(({ emp, attendance }) => `<tr data-attendance-employee="${emp.id}"><td><div class="employee-cell"><span class="employee-initial">${initials(emp.name)}</span><strong>${esc(emp.name)}</strong></div></td><td>${esc(deptName(emp.departmentId))}</td><td><input type="number" min="0" max="31" data-attendance="present" value="${attendance.present}" aria-label="Present days for ${esc(emp.name)}"></td><td><input type="number" min="0" max="31" data-attendance="absent" value="${attendance.absent}" aria-label="Absent days for ${esc(emp.name)}"></td><td><input type="number" min="0" max="31" data-attendance="leave" value="${attendance.leave}" aria-label="Leave days for ${esc(emp.name)}"></td><td><input type="number" min="0" max="100" step=".5" data-attendance="overtime" value="${attendance.overtime}" aria-label="Overtime hours for ${esc(emp.name)}"></td><td>${attendance.absent > 0 ? '<span class="badge leave">Absence deduction</span>' : '<span class="badge active">Complete</span>'}</td></tr>`).join('')}</tbody></table></section>`;
}

function renderPayroll() {
  const period = selectedPeriod();
  const rows = state.employees.filter(emp => emp.status !== 'Inactive').map(emp => ({ emp, payroll: payrollFor(emp.id, period.id) || calcPayroll(emp, attendanceFor(emp.id, period.id) || {}, period.id) }));
  const totalGross = sum(rows.map(item => item.payroll), 'gross');
  const totalNet = sum(rows.map(item => item.payroll), 'net');
  const totalDed = sum(rows.map(item => item.payroll), 'totalDeductions');
  return pageHeader('Payroll processing', 'Payroll run', 'Calculate, review and finalise salary records for the selected period.', `<select class="filter-select" data-action="period-select">${state.periods.map(item => `<option value="${item.id}" ${item.id === period.id ? 'selected' : ''}>${esc(item.name)}</option>`).join('')}</select><button class="secondary-button" data-action="run-payroll">↻ Recalculate</button><button class="primary-button compact" data-action="mark-paid">Mark as paid</button>`) + `<div class="report-summary"><div class="report-number"><span>Gross payroll</span><strong>${money(totalGross)}</strong></div><div class="report-number"><span>Deductions</span><strong>${money(totalDed)}</strong></div><div class="report-number"><span>Net payable</span><strong>${money(totalNet)}</strong></div></div><section class="card table-card"><div class="table-toolbar"><div><strong style="font-size:13px">Payroll register · ${esc(period.name)}</strong><div style="font-size:10px;color:#9ba5ad;margin-top:4px">Formula: Basic salary + allowance + overtime − tax − deductions</div></div><button class="secondary-button" data-action="print">Print register</button></div><table class="data-table"><thead><tr><th>Employee</th><th>Basic pay</th><th>Allowance</th><th>Overtime</th><th>Gross pay</th><th>Deductions</th><th>Net salary</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(({ emp, payroll }) => `<tr><td><div class="employee-cell"><span class="employee-initial">${initials(emp.name)}</span><div><strong>${esc(emp.name)}</strong><small>${esc(deptName(emp.departmentId))}</small></div></div></td><td class="amount">${money(payroll.basicPay)}</td><td class="amount">${money(payroll.allowance)}</td><td class="amount">${money(payroll.overtimePay)}</td><td class="amount">${money(payroll.gross)}</td><td class="amount">${money(payroll.totalDeductions)}</td><td class="amount">${money(payroll.net)}</td><td><span class="badge ${payroll.status.toLowerCase()}">${esc(payroll.status)}</span></td><td><button class="table-action" data-action="payslip" data-id="${emp.id}" title="View payslip">↗</button></td></tr>`).join('')}</tbody></table></section>`;
}

function renderReports() {
  const period = selectedPeriod();
  const q = reportSearch.toLowerCase();
  const rows = state.payroll.filter(row => row.periodId === period.id && `${employee(row.employeeId)?.name} ${deptName(employee(row.employeeId)?.departmentId)}`.toLowerCase().includes(q)).sort((a, b) => b.net - a.net);
  const summary = state.departments.map(dept => {
    const deptRows = rows.filter(row => employee(row.employeeId)?.departmentId === dept.id);
    return { ...dept, employees: deptRows.length, gross: sum(deptRows, 'gross'), deductions: sum(deptRows, 'totalDeductions'), net: sum(deptRows, 'net') };
  }).filter(row => row.employees);
  return pageHeader('Reports & search', 'Payroll intelligence', 'Use joins and aggregate views to turn payroll records into clear reports.', `<button class="secondary-button" data-action="export-payroll">⇩ Export CSV</button><button class="primary-button compact" data-action="print">Print report</button>`) + `<div class="report-grid"><section class="card table-card"><div class="table-toolbar"><div><strong style="font-size:13px">Employee salary report</strong><div style="font-size:10px;color:#9ba5ad;margin-top:4px">Sorted by net salary · ${esc(period.name)}</div></div><div class="search-box"><span>⌕</span><input data-field="report-search" value="${esc(reportSearch)}" placeholder="Search report..." aria-label="Search report"></div></div><table class="data-table"><thead><tr><th>Employee</th><th>Department</th><th>Gross</th><th>Deductions</th><th>Net salary</th></tr></thead><tbody>${rows.length ? rows.map(row => { const emp = employee(row.employeeId); return `<tr><td><div class="employee-cell"><span class="employee-initial">${initials(emp.name)}</span><strong>${esc(emp.name)}</strong></div></td><td>${esc(deptName(emp.departmentId))}</td><td class="amount">${money(row.gross)}</td><td class="amount">${money(row.totalDeductions)}</td><td class="amount">${money(row.net)}</td></tr>`; }).join('') : `<tr><td colspan="5" class="empty-row">No report records found.</td></tr>`}</tbody></table></section><section class="card content-card"><div class="card-head"><div><h2>Department payroll</h2><p>Grouped report for ${esc(period.name)}</p></div></div><div class="progress-row">${summary.map(row => `<div><div class="progress-line"><span>${esc(row.name)}</span><strong>${money(row.net)}</strong></div><div class="progress-track"><div class="progress-value" style="width:${Math.min(100, row.net / Math.max(...summary.map(item => item.net)) * 100)}%"></div></div><div style="font-size:9px;color:#a2acb4;margin-top:4px">${row.employees} employees · gross ${money(row.gross)}</div></div>`).join('')}</div></section></div><section class="card content-card section-gap"><div class="card-head"><div><h2>SQL report catalogue</h2><p>Queries represented in this working demo</p></div></div><div class="module-grid"><div class="module-card"><div class="module-symbol">↕</div><h3>Employee salary</h3><p>JOIN Employee, Department and Payroll, ordered by Net_Salary DESC.</p></div><div class="module-card"><div class="module-symbol">Σ</div><h3>Department totals</h3><p>GROUP BY department with employee count and payroll sum.</p></div><div class="module-card"><div class="module-symbol">⌕</div><h3>Threshold search</h3><p>Filter employees whose Net_Salary is above a selected amount.</p></div></div></section>`;
}

function renderSQL() {
  const snippets = {
    schema: `<span class="comment">-- Employee Payroll Management System</span>\n<span class="keyword">CREATE DATABASE</span> EmployeePayroll;\n<span class="keyword">USE</span> EmployeePayroll;\n\n<span class="keyword">CREATE TABLE</span> <span class="name">Department</span> (\n  Dept_ID <span class="keyword">INT PRIMARY KEY</span>,\n  Dept_Name <span class="keyword">VARCHAR</span>(50) <span class="keyword">NOT NULL</span>\n);\n\n<span class="keyword">CREATE TABLE</span> <span class="name">Employee</span> (\n  Emp_ID <span class="keyword">INT PRIMARY KEY</span>,\n  Emp_Name <span class="keyword">VARCHAR</span>(60) <span class="keyword">NOT NULL</span>,\n  Dept_ID <span class="keyword">INT</span>,\n  Designation <span class="keyword">VARCHAR</span>(50),\n  Join_Date <span class="keyword">DATE</span>,\n  <span class="keyword">FOREIGN KEY</span> (Dept_ID) <span class="keyword">REFERENCES</span> Department(Dept_ID)\n);`,
    payroll: `<span class="comment">-- Recalculate net salary</span>\n<span class="keyword">UPDATE</span> Payroll\n<span class="keyword">SET</span> Net_Salary = Basic_Salary + Allowance + Overtime_Pay - Tax - Deduction;\n\n<span class="comment">-- Employee salary report</span>\n<span class="keyword">SELECT</span> E.Emp_ID, E.Emp_Name, D.Dept_Name, P.Net_Salary\n<span class="keyword">FROM</span> Employee E\n<span class="keyword">JOIN</span> Department D <span class="keyword">ON</span> E.Dept_ID = D.Dept_ID\n<span class="keyword">JOIN</span> Payroll P <span class="keyword">ON</span> E.Emp_ID = P.Emp_ID\n<span class="keyword">ORDER BY</span> P.Net_Salary <span class="keyword">DESC</span>;`,
    tests: `<span class="comment">-- Validation test options</span>\n<span class="keyword">INSERT INTO</span> Employee VALUES\n(101, 'Duplicate ID', 1, 'Tester', '2026-10-01');\n<span class="comment">-- Expected: primary key error / record rejected</span>\n\n<span class="keyword">INSERT INTO</span> Employee VALUES\n(999, 'Invalid department', 404, 'Tester', '2026-10-01');\n<span class="comment">-- Expected: foreign key error / record rejected</span>\n\n<span class="keyword">SELECT AVG</span>(Days_Present) <span class="keyword">AS</span> Average_Attendance\n<span class="keyword">FROM</span> Attendance;`
  };
  return pageHeader('Developer tools', 'SQL lab', 'Review the relational design and the queries behind the five project modules.', `<button class="secondary-button" data-action="download-schema">⇩ Download schema.sql</button>`) + `<div class="code-tabs">${Object.keys(snippets).map(tab => `<button class="code-tab ${sqlTab === tab ? 'active' : ''}" data-action="sql-tab" data-tab="${tab}">${tab === 'schema' ? 'Database schema' : tab === 'payroll' ? 'Payroll queries' : 'Test cases'}</button>`).join('')}</div><section class="sql-block">${snippets[sqlTab]}</section><div class="dashboard-grid section-gap"><section class="card content-card"><div class="card-head"><div><h2>Relational model</h2><p>Five connected tables with keys and constraints</p></div></div><div class="module-grid"><div class="module-card"><div class="module-symbol">▦</div><h3>Department</h3><p>Dept_ID · Dept_Name</p></div><div class="module-card"><div class="module-symbol">♙</div><h3>Employee</h3><p>Emp_ID · Dept_ID · Join_Date</p></div><div class="module-card"><div class="module-symbol">◈</div><h3>Payroll</h3><p>Payroll_ID · Emp_ID · Net_Salary</p></div></div></section><section class="card content-card"><div class="card-head"><div><h2>Implementation notes</h2><p>How to use this submission</p></div></div><div class="activity-list"><div class="activity-item"><span class="activity-icon">1</span><div><strong>Open the app</strong><p>Use any static server or open index.html.</p></div></div><div class="activity-item"><span class="activity-icon">2</span><div><strong>Try each module</strong><p>Changes persist in browser local storage.</p></div></div><div class="activity-item"><span class="activity-icon">3</span><div><strong>Run SQL separately</strong><p>Use schema.sql in MySQL Workbench.</p></div></div></div></section></div>`;
}

function showModal(title, subtitle, body, onSubmit) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><div><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div><button class="icon-button" data-action="close-modal" aria-label="Close">×</button></div><form id="modal-form"><div class="modal-body">${body}</div><div class="modal-foot"><button type="button" class="secondary-button" data-action="close-modal">Cancel</button><button type="submit" class="primary-button compact">Save changes</button></div></form></div></div>`;
  root.querySelector('.modal').addEventListener('click', event => event.stopPropagation());
  root.querySelector('#modal-form').addEventListener('submit', event => { event.preventDefault(); onSubmit(new FormData(event.currentTarget)); });
  root.querySelector('.modal-backdrop').addEventListener('click', event => { if (event.target.classList.contains('modal-backdrop')) root.innerHTML = ''; });
  root.querySelector('input, select')?.focus();
}

function employeeForm(emp = {}) {
  return `<div class="form-grid"><div class="form-field"><label>Employee ID *</label><input name="id" type="number" required min="1" value="${esc(emp.id || '')}" ${emp.id ? 'readonly' : ''}></div><div class="form-field"><label>Full name *</label><input name="name" required value="${esc(emp.name || '')}" placeholder="e.g. Arun Kumar"></div><div class="form-field"><label>Email address *</label><input name="email" type="email" required value="${esc(emp.email || '')}" placeholder="name@company.com"></div><div class="form-field"><label>Department *</label><select name="departmentId" required>${state.departments.map(dept => `<option value="${dept.id}" ${Number(emp.departmentId) === dept.id ? 'selected' : ''}>${esc(dept.name)}</option>`).join('')}</select></div><div class="form-field"><label>Designation *</label><input name="designation" required value="${esc(emp.designation || '')}" placeholder="e.g. Data Analyst"></div><div class="form-field"><label>Join date *</label><input name="joinDate" type="date" required value="${esc(emp.joinDate || '2026-10-01')}"></div><div class="form-field"><label>Basic salary (₹) *</label><input name="salary" type="number" required min="0" value="${esc(emp.salary || '')}"></div><div class="form-field"><label>Monthly allowance (₹)</label><input name="allowance" type="number" min="0" value="${esc(emp.allowance ?? 0)}"></div><div class="form-field"><label>Fixed deduction (₹)</label><input name="deduction" type="number" min="0" value="${esc(emp.deduction ?? 0)}"></div><div class="form-field"><label>Status</label><select name="status"><option ${emp.status === 'Active' || !emp.status ? 'selected' : ''}>Active</option><option ${emp.status === 'On Leave' ? 'selected' : ''}>On Leave</option><option ${emp.status === 'Inactive' ? 'selected' : ''}>Inactive</option></select></div></div>`;
}

function openEmployeeModal(emp) {
  showModal(emp ? 'Edit employee' : 'Add employee', emp ? 'Update the employee record and payroll inputs.' : 'Create a record linked to a department.', employeeForm(emp), form => {
    const data = Object.fromEntries(form.entries());
    const record = { id: Number(data.id), name: data.name.trim(), email: data.email.trim(), departmentId: Number(data.departmentId), designation: data.designation.trim(), joinDate: data.joinDate, salary: Number(data.salary), allowance: Number(data.allowance || 0), deduction: Number(data.deduction || 0), status: data.status };
    if (!record.name || record.salary < 0) return notify('Enter a valid name and salary.', 'error');
    if (!emp && state.employees.some(item => item.id === record.id)) return notify('Employee ID must be unique.', 'error');
    if (emp) Object.assign(emp, record); else state.employees.push(record);
    state.payroll = buildPayroll(state, state.selectedPeriodId);
    state.activities.unshift({ icon: emp ? '✎' : '+', title: emp ? 'Employee updated' : 'Employee added', detail: `${record.name} is now in ${deptName(record.departmentId)}`, time: 'Just now' });
    persist(); document.getElementById('modal-root').innerHTML = ''; render(); notify(emp ? 'Employee updated successfully.' : 'Employee added successfully.');
  });
}

function openDepartmentModal(dept) {
  showModal(dept ? 'Edit department' : 'Add department', 'Keep department relationships clear for reporting.', `<div class="form-grid"><div class="form-field"><label>Department name *</label><input name="name" required value="${esc(dept?.name || '')}" placeholder="e.g. Operations"></div><div class="form-field"><label>Manager name *</label><input name="manager" required value="${esc(dept?.manager || '')}" placeholder="e.g. Manager name"></div></div>`, form => {
    const data = Object.fromEntries(form.entries());
    if (dept) Object.assign(dept, { name: data.name.trim(), manager: data.manager.trim() }); else state.departments.push({ id: Math.max(0, ...state.departments.map(item => item.id)) + 1, name: data.name.trim(), manager: data.manager.trim() });
    persist(); document.getElementById('modal-root').innerHTML = ''; render(); notify('Department saved successfully.');
  });
}

function saveAttendance() {
  document.querySelectorAll('[data-attendance-employee]').forEach(row => {
    const employeeId = Number(row.dataset.attendanceEmployee);
    const values = Object.fromEntries([...row.querySelectorAll('[data-attendance]')].map(input => [input.dataset.attendance, Number(input.value || 0)]));
    let record = attendanceFor(employeeId);
    if (!record) { record = { id: Math.max(0, ...state.attendance.map(item => item.id)) + 1, employeeId, periodId: state.selectedPeriodId }; state.attendance.push(record); }
    Object.assign(record, values);
  });
  state.payroll = buildPayroll(state, state.selectedPeriodId); persist(); render(); notify('Attendance changes saved. Payroll is ready to recalculate.');
}

function runPayroll() { state.payroll = buildPayroll(state, state.selectedPeriodId); const period = selectedPeriod(); if (period.status !== 'Paid') period.status = 'Processed'; persist(); render(); notify(`${period.name} payroll recalculated successfully.`); }
function markPaid() { const periodRows = state.payroll.filter(row => row.periodId === state.selectedPeriodId); if (!periodRows.length) return notify('Calculate payroll before marking it paid.', 'error'); periodRows.forEach(row => row.status = 'Paid'); selectedPeriod().status = 'Paid'; persist(); render(); notify(`${selectedPeriod().name} payroll marked as paid.`); }

function csvDownload(filename, rows) {
  const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); notify(`${filename} downloaded.`);
}
function exportEmployees() { csvDownload('employees.csv', [['Emp_ID', 'Emp_Name', 'Department', 'Designation', 'Join_Date', 'Basic_Salary', 'Status'], ...state.employees.map(emp => [emp.id, emp.name, deptName(emp.departmentId), emp.designation, emp.joinDate, emp.salary, emp.status])]); }
function exportPayroll() { csvDownload('payroll-report.csv', [['Emp_ID', 'Emp_Name', 'Department', 'Basic_Pay', 'Allowance', 'Overtime', 'Gross_Pay', 'Deductions', 'Net_Salary', 'Pay_Month'], ...state.payroll.filter(row => row.periodId === state.selectedPeriodId).map(row => { const emp = employee(row.employeeId); return [emp.id, emp.name, deptName(emp.departmentId), row.basicPay.toFixed(2), row.allowance.toFixed(2), row.overtimePay.toFixed(2), row.gross.toFixed(2), row.totalDeductions.toFixed(2), row.net.toFixed(2), selectedPeriod().name]; })]); }
function exportJSON() { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'paypilot-backup.json'; link.click(); URL.revokeObjectURL(url); notify('Backup data downloaded.'); }

function showPayslip(empId) {
  const emp = employee(empId); const row = payrollFor(empId) || calcPayroll(emp, attendanceFor(empId) || {});
  showModal('Payslip preview', `${emp.name} · ${selectedPeriod().name}`, `<div class="detail-grid"><div class="detail-card"><span>Employee</span><strong>${esc(emp.name)}</strong></div><div class="detail-card"><span>Department</span><strong>${esc(deptName(emp.departmentId))}</strong></div><div class="detail-card"><span>Gross earnings</span><strong>${money(row.gross)}</strong></div><div class="detail-card"><span>Total deductions</span><strong>${money(row.totalDeductions)}</strong></div><div class="detail-card" style="grid-column:1/-1;background:#eef4ff;border-color:#dce8ff"><span>Net salary</span><strong style="font-size:22px;color:#2364e8">${money(row.net)}</strong></div></div><div class="inline-note" style="margin:15px 0 0">Basic pay ${money(row.basicPay)} + allowance ${money(row.allowance)} + overtime ${money(row.overtimePay)} − tax ${money(row.tax)} − fixed deductions ${money(row.otherDeduction)}.</div>`, () => {});
  const form = document.getElementById('modal-form'); form.querySelector('.modal-foot').innerHTML = `<button type="button" class="secondary-button" data-action="close-modal">Close</button><button type="button" class="primary-button compact" data-action="print">Print payslip</button>`; form.addEventListener('submit', e => e.preventDefault());
}

function downloadSchema() { const link = document.createElement('a'); link.href = 'schema.sql'; link.download = 'schema.sql'; link.click(); notify('schema.sql download started.'); }

document.addEventListener('click', event => {
  const pageButton = event.target.closest('[data-page]'); if (pageButton) { activePage = pageButton.dataset.page; render(); return; }
  const button = event.target.closest('[data-action]'); if (!button) return;
  const action = button.dataset.action;
  if (action === 'add-employee') openEmployeeModal();
  if (action === 'edit-employee') openEmployeeModal(employee(button.dataset.id));
  if (action === 'delete-employee') { const emp = employee(button.dataset.id); if (confirm(`Delete ${emp.name}? This cannot be undone.`)) { state.employees = state.employees.filter(item => item.id !== emp.id); state.payroll = state.payroll.filter(row => row.employeeId !== emp.id); state.attendance = state.attendance.filter(row => row.employeeId !== emp.id); persist(); render(); notify('Employee record deleted.'); } }
  if (action === 'add-department') openDepartmentModal();
  if (action === 'edit-department') openDepartmentModal(byId(state.departments, button.dataset.id));
  if (action === 'save-attendance') saveAttendance();
  if (action === 'run-payroll') runPayroll();
  if (action === 'mark-paid') markPaid();
  if (action === 'export-employees') exportEmployees();
  if (action === 'export-payroll') exportPayroll();
  if (action === 'export-json') exportJSON();
  if (action === 'export-departments') csvDownload('departments.csv', [['Dept_ID', 'Dept_Name', 'Manager', 'Employees'], ...state.departments.map(dept => [dept.id, dept.name, dept.manager, state.employees.filter(emp => emp.departmentId === dept.id).length])]);
  if (action === 'print') window.print();
  if (action === 'payslip') showPayslip(Number(button.dataset.id));
  if (action === 'close-modal') document.getElementById('modal-root').innerHTML = '';
  if (action === 'download-schema') downloadSchema();
  if (action === 'sql-tab') { sqlTab = button.dataset.tab; render(); }
});

document.addEventListener('input', event => {
  if (event.target.dataset.field === 'employee-search') { employeeSearch = event.target.value; render(); const input = document.querySelector('[data-field="employee-search"]'); input?.focus(); input?.setSelectionRange(employeeSearch.length, employeeSearch.length); }
  if (event.target.dataset.field === 'report-search') { reportSearch = event.target.value; render(); const input = document.querySelector('[data-field="report-search"]'); input?.focus(); input?.setSelectionRange(reportSearch.length, reportSearch.length); }
  if (event.target.id === 'global-search' && event.target.value) { activePage = 'employees'; employeeSearch = event.target.value; render(); }
});

document.addEventListener('change', event => {
  if (event.target.dataset.action === 'period-select') { state.selectedPeriodId = Number(event.target.value); state.payroll = buildPayroll(state, state.selectedPeriodId); persist(); render(); }
  if (event.target.dataset.field === 'employee-dept-filter' && event.target.value !== 'all') { employeeSearch = deptName(event.target.value); render(); }
});
document.getElementById('quick-add').addEventListener('click', () => openEmployeeModal());
document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); document.getElementById('global-search').focus(); } if (event.key === 'Escape') document.getElementById('modal-root').innerHTML = ''; });
render();
