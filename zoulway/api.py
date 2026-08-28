import frappe
from frappe import _
from frappe.utils import add_days, getdate, nowdate


# =========================================================
# PROJECTS
# =========================================================

@frappe.whitelist()
def get_projects(limit=50, offset=0):
	meta = frappe.get_meta("Project")

	fields = [
		"name",
		"project_name",
		"status",
		"priority",
		"expected_start_date",
		"expected_end_date",
		"percent_complete",
	]

	if meta.has_field("project_manager"):
		fields.append("project_manager")

	projects = frappe.get_all(
		"Project",
		fields=fields,
		order_by="modified desc",
		limit_start=int(offset or 0),
		limit_page_length=int(limit or 50),
	)

	for project in projects:
		project["title"] = (
			project.get("project_name")
			or project.get("name")
		)

		project["progress"] = (
			project.get("percent_complete") or 0
		)

		project["project"] = project.get("name")

	return projects


@frappe.whitelist()
def get_tasks(project=None):
	filters = {}

	if project:
		filters["project"] = project

	meta = frappe.get_meta("Task")

	fields = [
		"name",
		"subject",
		"project",
		"status",
		"priority",
		"exp_start_date",
		"exp_end_date",
		"progress",
		"completed_on",
	]

	for field in [
		"imp_urgency",
		"imp_division",
		"lead",
		"_assign",
	]:
		if meta.has_field(field):
			fields.append(field)

	tasks = frappe.get_all(
		"Task",
		filters=filters,
		fields=fields,
		order_by="modified desc",
	)

	for task in tasks:
		task["title"] = (
			task.get("subject")
			or "No Subject"
		)

		task["project_name"] = (
			task.get("project")
		)

		task["progress"] = (
			task.get("progress") or 0
		)

	return tasks


# =========================================================
# TO-DOS
# =========================================================

@frappe.whitelist()
def get_todos(task=None, project=None):
	filters = {}

	if task:
		filters["reference_type"] = "Task"
		filters["reference_name"] = task

	todos = frappe.get_all(
		"ToDo",
		filters=filters,
		fields=[
			"name",
			"description",
			"status",
			"priority",
			"allocated_to",
			"assigned_by",
			"reference_type",
			"reference_name",
			"date",
		],
		order_by="modified desc",
	)

	result = []

	for todo in todos:
		result.append({
			"name": todo.name,
			"title": todo.description or "No Description",
			"description": todo.description or "",
			"status": todo.status or "Open",
			"priority": todo.priority or "Medium",
			"urgency": todo.priority or "Medium",
			"assignee": todo.allocated_to,
			"assigned_by": todo.assigned_by,
			"done": todo.status == "Closed",
			"deadline": todo.date,
			"task": todo.reference_name if todo.reference_type == "Task" else None,
		})

	return result


# =========================================================
# SELECT OPTIONS
# =========================================================

@frappe.whitelist()
def get_options(doc, field):
	meta = frappe.get_meta(doc)
	df = meta.get_field(field)

	if not df:
		return []

	if df.fieldtype != "Select":
		return []

	return [
		option
		for option in (df.options or "").split("\n")
		if option
	]


# =========================================================
# USERS
# =========================================================

@frappe.whitelist()
def get_users(role=None):
	filters = {
		"enabled": 1
	}

	users = frappe.get_all(
		"User",
		filters=filters,
		fields=[
			"name",
			"full_name",
			"user_image",
		],
		order_by="full_name",
	)

	if role:
		role_users = frappe.get_all(
			"Has Role",
			filters={"role": role},
			fields=["parent"],
		)

		allowed_users = {
			row.parent
			for row in role_users
		}

		users = [
			user
			for user in users
			if user.name in allowed_users
		]

	return users


# =========================================================
# STATUS
# =========================================================

@frappe.whitelist()
def set_status(doctype, name, status):
	doc = frappe.get_doc(doctype, name)

	if not doc.meta.has_field("status"):
		frappe.throw(_("Status field not found"))

	doc.status = status
	doc.save(ignore_permissions=True)

	return {
		"success": True,
		"name": doc.name,
		"status": doc.status,
	}


# =========================================================
# URGENCY
# =========================================================

@frappe.whitelist()
def set_urgency(doctype, name, urgency):
	doc = frappe.get_doc(doctype, name)

	if doc.meta.has_field("imp_urgency"):
		doc.imp_urgency = urgency

	elif doc.meta.has_field("urgency"):
		doc.urgency = urgency

	elif doc.meta.has_field("priority"):
		doc.priority = urgency

	else:
		frappe.throw(_("Urgency field not found"))

	doc.save(ignore_permissions=True)

	return {
		"success": True,
		"name": doc.name,
		"urgency": urgency,
	}


# =========================================================
# DIVISION
# =========================================================

@frappe.whitelist()
def set_division(task, division):
	doc = frappe.get_doc("Task", task)

	if not doc.meta.has_field("imp_division"):
		frappe.throw(_("Division field not found"))

	doc.imp_division = division
	doc.save(ignore_permissions=True)

	return {
		"success": True,
		"name": doc.name,
		"division": division,
	}


# =========================================================
# LEAD
# =========================================================

@frappe.whitelist()
def set_lead(task, lead):
	doc = frappe.get_doc("Task", task)

	if not doc.meta.has_field("lead"):
		frappe.throw(_("Lead field not found"))

	doc.lead = lead
	doc.save(ignore_permissions=True)

	return {
		"success": True,
		"name": doc.name,
		"lead": lead,
	}


# =========================================================
# PROJECT MANAGER
# =========================================================

@frappe.whitelist()
def set_project_manager(project, project_manager):
	doc = frappe.get_doc("Project", project)

	if not doc.meta.has_field("project_manager"):
		frappe.throw(_("Project Manager field not found"))

	doc.project_manager = project_manager
	doc.save(ignore_permissions=True)

	return {
		"success": True,
		"name": doc.name,
		"project_manager": project_manager,
	}


# =========================================================
# TASK COMPLETION
# =========================================================

@frappe.whitelist()
def update_task_completion(task, completion):
	doc = frappe.get_doc("Task", task)

	if not doc.meta.has_field("progress"):
		frappe.throw(_("Progress field not found"))

	doc.progress = float(completion or 0)
	doc.save(ignore_permissions=True)

	return {
		"success": True,
		"name": doc.name,
		"progress": doc.progress,
	}


# =========================================================
# TODO DONE
# =========================================================

@frappe.whitelist()
def toggle_todo_done(todo):
	doc = frappe.get_doc("ToDo", todo)

	if doc.status == "Closed":
		doc.status = "Open"
	else:
		doc.status = "Closed"

	doc.save(ignore_permissions=True)

	return {
		"success": True,
		"name": doc.name,
		"status": doc.status,
	}


# =========================================================
# ASSIGN TODO
# =========================================================

@frappe.whitelist()
def assign_todo(todo, user):
	doc = frappe.get_doc("ToDo", todo)

	doc.allocated_to = user
	doc.save(ignore_permissions=True)

	return {
		"success": True,
		"name": doc.name,
		"allocated_to": user,
	}


# =========================================================
# PIN
# =========================================================

@frappe.whitelist()
def toggle_pin(doctype, id):
	doc = frappe.get_doc(doctype, id)

	if doc.meta.has_field("imp_is_pinned"):
		doc.imp_is_pinned = not doc.imp_is_pinned

	elif doc.meta.has_field("is_pinned"):
		doc.is_pinned = not doc.is_pinned

	else:
		frappe.throw(_("Pin field not found"))

	doc.save(ignore_permissions=True)

	return {
		"success": True,
		"name": doc.name,
	}


# =========================================================
# REACTION
# =========================================================

@frappe.whitelist()
def toggle_reaction(doctype, name, reaction_type):
	return {
		"success": True,
		"doctype": doctype,
		"name": name,
		"reaction_type": reaction_type,
	}


# =========================================================
# DASHBOARD SUMMARY
# =========================================================

@frappe.whitelist()
def dashboard_summary(project_id=None):

	# -----------------------------------------------------
	# Task filters
	# -----------------------------------------------------

	task_filters = {}

	if project_id:
		task_filters["project"] = project_id

	# -----------------------------------------------------
	# Projects count
	# -----------------------------------------------------

	if project_id:
		project_count = 1
	else:
		project_count = frappe.db.count("Project")

	# -----------------------------------------------------
	# Tasks
	# -----------------------------------------------------

	total_tasks = frappe.db.count(
		"Task",
		filters=task_filters,
	)

	completed_filters = dict(task_filters)

	completed_filters["status"] = [
		"in",
		[
			"Completed",
			"Cancelled",
		],
	]

	completed_tasks = frappe.db.count(
		"Task",
		filters=completed_filters,
	)

	# -----------------------------------------------------
	# Average progress
	# -----------------------------------------------------

	progress_rows = frappe.get_all(
		"Task",
		filters=task_filters,
		fields=["progress"],
	)

	if progress_rows:
		avg_progress = round(
			sum(float(row.progress or 0) for row in progress_rows)
			/ len(progress_rows),
			2,
		)
	else:
		avg_progress = 0

	# -----------------------------------------------------
	# Due within 7 days
	# -----------------------------------------------------

	today = getdate(nowdate())
	seven_days = add_days(today, 7)

	due_filters = dict(task_filters)

	due_filters["exp_end_date"] = [
		"between",
		[
			today,
			seven_days,
		],
	]

	due_7d = frappe.db.count(
		"Task",
		filters=due_filters,
	)

	# -----------------------------------------------------
	# Overdue
	# -----------------------------------------------------

	overdue_filters = dict(task_filters)

	overdue_filters["exp_end_date"] = [
		"<",
		today,
	]

	overdue_filters["status"] = [
		"not in",
		[
			"Completed",
			"Cancelled",
		],
	]

	overdue = frappe.db.count(
		"Task",
		filters=overdue_filters,
	)

	# -----------------------------------------------------
	# Escalated
	# -----------------------------------------------------

	escalated = 0

	meta = frappe.get_meta("Task")

	if meta.has_field("imp_urgency"):
		escalated = frappe.db.count(
			"Task",
			filters={
				**task_filters,
				"imp_urgency": "High",
				"status": [
					"not in",
					[
						"Completed",
						"Cancelled",
					],
				],
			},
		)

	# -----------------------------------------------------
	# Tasks by Status
	# -----------------------------------------------------

	by_status = {}

	status_rows = frappe.db.sql(
		"""
		SELECT
			status,
			COUNT(*) AS count
		FROM `tabTask`
		WHERE
			project = %(project)s
			OR %(project)s IS NULL
		GROUP BY status
		""",
		{
			"project": project_id,
		},
		as_dict=True,
	)

	if project_id:
		status_rows = frappe.db.sql(
			"""
			SELECT
				status,
				COUNT(*) AS count
			FROM `tabTask`
			WHERE project = %(project)s
			GROUP BY status
			""",
			{
				"project": project_id,
			},
			as_dict=True,
		)
	else:
		status_rows = frappe.db.sql(
			"""
			SELECT
				status,
				COUNT(*) AS count
			FROM `tabTask`
			GROUP BY status
			""",
			as_dict=True,
		)

	for row in status_rows:
		by_status[row.status or "Unknown"] = row.count

	# -----------------------------------------------------
	# Tasks by Urgency
	# -----------------------------------------------------

	by_urgency = {}

	if meta.has_field("imp_urgency"):

		urgency_rows = frappe.db.sql(
			"""
			SELECT
				COALESCE(imp_urgency, 'Not Set') AS urgency,
				COUNT(*) AS count
			FROM `tabTask`
			{condition}
			GROUP BY imp_urgency
			""".format(
				condition=(
					"WHERE project = %(project)s"
					if project_id
					else ""
				)
			),
			{
				"project": project_id,
			},
			as_dict=True,
		)

		for row in urgency_rows:
			by_urgency[row.urgency] = row.count

	# -----------------------------------------------------
	# Tasks by Division
	# -----------------------------------------------------

	by_division = {}

	if meta.has_field("imp_division"):

		division_rows = frappe.db.sql(
			"""
			SELECT
				COALESCE(imp_division, 'Not Assigned') AS division,
				COUNT(*) AS count
			FROM `tabTask`
			{condition}
			GROUP BY imp_division
			""".format(
				condition=(
					"WHERE project = %(project)s"
					if project_id
					else ""
				)
			),
			{
				"project": project_id,
			},
			as_dict=True,
		)

		for row in division_rows:
			by_division[row.division] = row.count

	# -----------------------------------------------------
	# Stage Average Progress
	# -----------------------------------------------------

	stage_avg_progress = {}

	stage_rows = frappe.db.sql(
		"""
		SELECT
			status,
			AVG(progress) AS avg_progress
		FROM `tabTask`
		{condition}
		GROUP BY status
		""".format(
			condition=(
				"WHERE project = %(project)s"
				if project_id
				else ""
			)
		),
		{
			"project": project_id,
		},
		as_dict=True,
	)

	for row in stage_rows:
		stage_avg_progress[row.status or "Unknown"] = round(
			float(row.avg_progress or 0),
			2,
		)

	# -----------------------------------------------------
	# Deadlines
	# -----------------------------------------------------

	deadline_filters = dict(task_filters)

	deadline_filters["exp_end_date"] = [
		"is",
		"set",
	]

	deadlines_soon = frappe.get_all(
		"Task",
		filters=deadline_filters,
		fields=[
			"name",
			"subject",
			"project",
			"status",
			"exp_end_date",
			"progress",
		],
		order_by="exp_end_date asc",
		limit_page_length=10,
	)

	# -----------------------------------------------------
	# Emergencies
	# -----------------------------------------------------

	emergencies = []

	if meta.has_field("imp_urgency"):
		emergencies = frappe.get_all(
			"Task",
			filters={
				**task_filters,
				"imp_urgency": "High",
				"status": [
					"not in",
					[
						"Completed",
						"Cancelled",
					],
				],
			},
			fields=[
				"name",
				"subject",
				"project",
				"status",
				"priority",
				"exp_end_date",
			],
			order_by="exp_end_date asc",
			limit_page_length=10,
		)

	# -----------------------------------------------------
	# Return data expected by Zoulway Board
	# -----------------------------------------------------

	return {
		"project_id": project_id,

		"projects": project_count,

		"tasks": total_tasks,

		"completed_tasks": completed_tasks,

		"avg_progress": avg_progress,

		"due_7d": due_7d,

		"overdue": overdue,

		"escalated": escalated,

		"by_status": by_status,

		"by_urgency": by_urgency,

		"stage_avg_progress": stage_avg_progress,

		"by_division": by_division,

		"deadlines_soon": deadlines_soon,

		"emergencies": emergencies,
	}


# =========================================================
# PROJECT PERCENTAGE
# =========================================================

@frappe.whitelist()
def get_project_percent_by_task(project):
	total = frappe.db.count(
		"Task",
		filters={
			"project": project,
		},
	)

	completed = frappe.db.count(
		"Task",
		filters={
			"project": project,
			"status": [
				"in",
				[
					"Completed",
					"Cancelled",
				],
			],
		},
	)

	percentage = (
		round((completed / total) * 100, 2)
		if total
		else 0
	)

	return {
		"total": total,
		"completed": completed,
		"percentage": percentage,
	}


# =========================================================
# REPORTS
# =========================================================

@frappe.whitelist()
def get_reports():
	return []


# =========================================================
# NOTIFICATIONS
# =========================================================

@frappe.whitelist()
def notifications():
	return []


@frappe.whitelist()
def read_notifications(id):
	return {
		"success": True,
		"id": id,
	}


# =========================================================
# EMERGENCY
# =========================================================

@frappe.whitelist()
def read_emergency(doctype, name):
	return {
		"success": True,
		"doctype": doctype,
		"name": name,
	}


# =========================================================
# TASK CONTEXT
# =========================================================

@frappe.whitelist()
def resolve_task_context(task):
	doc = frappe.get_doc("Task", task)

	return {
		"doctype": "Task",
		"name": doc.name,
		"project": (
			doc.project
			if doc.meta.has_field("project")
			else None
		),
	}


# =========================================================
# TODO CONTEXT
# =========================================================

@frappe.whitelist()
def resolve_todo_context(todo):
	doc = frappe.get_doc("ToDo", todo)

	return {
		"doctype": "ToDo",
		"name": doc.name,
		"reference_type": doc.reference_type,
		"reference_name": doc.reference_name,
	}


# =========================================================
# DOCUMENT URL
# =========================================================

@frappe.whitelist()
def get_doc_url(doc, id):
	return frappe.utils.get_url_to_form(
		doc,
		id,
	)


# =========================================================
# DUE DATE
# =========================================================

@frappe.whitelist()
def saveDueDate(doctype, name, dateStr):
	doc = frappe.get_doc(
		doctype,
		name,
	)

	if doc.meta.has_field("exp_end_date"):
		doc.exp_end_date = dateStr

	elif doc.meta.has_field("date"):
		doc.date = dateStr

	else:
		frappe.throw(
			_("Date field not found")
		)

	doc.save(
		ignore_permissions=True
	)

	return {
		"success": True,
		"name": doc.name,
	}


# =========================================================
# MILESTONE
# =========================================================

@frappe.whitelist()
def get_milestone(project):
	if not frappe.db.exists(
		"DocType",
		"Project Milestone",
	):
		return []

	return frappe.get_all(
		"Project Milestone",
		filters={
			"project": project,
		},
		fields="*",
	)


@frappe.whitelist()
def set_milestone(project, **kwargs):
	return {
		"success": True,
		"project": project,
	}


@frappe.whitelist()
def delete_milestone(name, project=None):
	if frappe.db.exists(
		"Project Milestone",
		name,
	):
		frappe.delete_doc(
			"Project Milestone",
			name,
			ignore_permissions=True,
		)

	return {
		"success": True,
		"name": name,
	}


# =========================================================
# DELETE PROJECT / DOCUMENT
# =========================================================

@frappe.whitelist()
def deleteproj(doctype, id):
	if frappe.db.exists(
		doctype,
		id,
	):
		frappe.delete_doc(
			doctype,
			id,
			ignore_permissions=True,
		)

	return {
		"success": True,
		"name": id,
	}


# =========================================================
# DESCRIPTION
# =========================================================

@frappe.whitelist()
def update_description(
	doctype,
	name,
	description,
):
	doc = frappe.get_doc(
		doctype,
		name,
	)

	if not doc.meta.has_field(
		"description"
	):
		frappe.throw(
			_("Description field not found")
		)

	doc.description = description

	doc.save(
		ignore_permissions=True
	)

	return {
		"success": True,
		"name": doc.name,
	}


# =========================================================
# WORK NOTE
# =========================================================

@frappe.whitelist()
def add_work_note(
	doctype,
	name,
	content,
):
	doc = frappe.get_doc(
		doctype,
		name,
	)

	doc.add_comment(
		"Comment",
		content,
	)

	return {
		"success": True,
	}


# =========================================================
# ATTACHMENT
# =========================================================

@frappe.whitelist()
def add_attachment(
	doctype,
	name,
	file_url=None,
	**kwargs,
):
	return {
		"success": True,
		"doctype": doctype,
		"name": name,
		"file_url": file_url,
	}


# =========================================================
# SLACK MESSAGE
# =========================================================

@frappe.whitelist()
def send_slack_message(
	mode,
	name,
	doctype,
	message,
):
	return {
		"success": True,
		"message": "Message processed",
	}