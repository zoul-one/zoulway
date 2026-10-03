import frappe
from frappe import _
from frappe.utils import add_to_date, get_datetime, getdate, flt


@frappe.whitelist()
def add_timesheet_and_task(project, data):
	data = frappe.parse_json(data)
	frappe.has_permission("Project", "read", project, throw=True)

	employee = frappe.db.get_value("Employee", {"user_id": frappe.session.user}, "name")
	if not employee:
		frappe.throw(_("No Employee linked to user {0}").format(frappe.session.user))

	if data.get("existing_task"):
		if not data.get("task"):
			frappe.throw(_("Please select a Task"))
		task = frappe.get_doc("Task", data.task)
		if task.project != project:
			frappe.throw(_("Task does not belong to this Project"))
		if task.status in ("Completed", "Cancelled"):
			frappe.throw(_("Task is {0}").format(task.status))
	else:
		if not data.get("task_subject"):
			frappe.throw(_("Task Subject is required"))
		task = frappe.new_doc("Task")
		task.subject = data.task_subject
		task.project = project

	task.status = "Working"
	task.save()

	if data.get("no_need_time"):
		minutes = flt(data.get("total_minutes"))
		if minutes <= 0:
			frappe.throw(_("Total Time in Minutes must be greater than zero"))
		from_time = get_datetime(frappe.utils.now_datetime())
		to_time = add_to_date(from_time, minutes=minutes)
	else:
		if not (data.get("from_time") and data.get("to_time")):
			frappe.throw(_("From Time and To Time are required"))
		from_time = get_datetime(data.from_time)
		to_time = get_datetime(data.to_time)
		if to_time <= from_time:
			frappe.throw(_("To Time must be after From Time"))
		minutes = (to_time - from_time).total_seconds() / 60

	hours = minutes / 60
	log_date = getdate(from_time)

	# ---- Timesheet ----
	ts_name = frappe.db.get_value(
		"Timesheet",
		{"employee": employee, "start_date": log_date, "docstatus": 0},
		"name",
	)

	if ts_name:
		ts = frappe.get_doc("Timesheet", ts_name)
	else:
		ts = frappe.new_doc("Timesheet")
		ts.employee = employee
		ts.company = frappe.defaults.get_user_default("Company") or frappe.db.get_single_value(
			"Global Defaults", "default_company"
		)

	ts.append("time_logs", {
		"activity_type": data.activity_type,
		"project": project,
		"task": task.name,
		"description": data.description,
		"from_time": from_time,
		"to_time": to_time,
		"hours": hours,
	})
	ts.save()

	return {"timesheet": ts.name, "task": task.name}
