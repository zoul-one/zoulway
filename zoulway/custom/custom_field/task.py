def get_task_custom_fields():
	"""
	Method to get custom fields for Task doctype
	"""
	return {
		"Task": [
			{
				"fieldname": "development_verification_tab",
				"fieldtype": "Tab Break",
				"label": "Development & Verification",
				"insert_after": "description",
			},
			{
				"fieldname": "development_details_section",
				"fieldtype": "Section Break",
				"label": "Development Details",
				"collapsible": 1,
				"insert_after": "development_verification_tab",
			},
			{
				"fieldname": "is_development_task",
				"fieldtype": "Check",
				"label": "Is Development Task",
				"insert_after": "development_details_section",
			},
			{
				"fieldname": "estimated_hours",
				"fieldtype": "Float",
				"label": "Estimated Hours",
				"insert_after": "is_development_task",
			},
			{
				"fieldname": "development_column_break_1",
				"fieldtype": "Column Break",
				"insert_after": "estimated_hours",
			},
			{
				"fieldname": "development_priority",
				"fieldtype": "Select",
				"label": "Development Priority",
				"options": "Low\nMedium\nHigh\nUrgent",
				"insert_after": "development_column_break_1",
			},
			{
				"fieldname": "actual_hours",
				"fieldtype": "Float",
				"label": "Actual Hours",
				"insert_after": "development_priority",
			},
			{
				"fieldname": "development_column_break_2",
				"fieldtype": "Column Break",
				"insert_after": "actual_hours",
			},
			{
				"fieldname": "github_repo",
				"fieldtype": "Data",
				"label": "Github Repo",
				"insert_after": "development_column_break_2",
			},
			{
				"fieldname": "pr_link",
				"fieldtype": "Data",
				"label": "PR Link",
				"insert_after": "github_repo",
			},
			{
				"fieldname": "developer_section",
				"fieldtype": "Section Break",
				"label": "Developer",
				"collapsible": 1,
				"insert_after": "pr_link",
			},
			{
				"fieldname": "developer_remarks",
				"fieldtype": "Small Text",
				"label": "Developer Remarks",
				"insert_after": "developer_section",
			},
			{
				"fieldname": "developer_column_break_1",
				"fieldtype": "Column Break",
				"insert_after": "developer_remarks",
			},
			{
				"fieldname": "understanding_confirmed",
				"fieldtype": "Check",
				"label": "Understanding Confirmed",
				"insert_after": "developer_column_break_1",
			},
			{
				"fieldname": "developer_column_break_2",
				"fieldtype": "Column Break",
				"insert_after": "understanding_confirmed",
			},
			{
				"fieldname": "understanding_date",
				"fieldtype": "Date",
				"label": "Understanding Date",
				"insert_after": "developer_column_break_2",
			},
			{
				"fieldname": "understanding_by",
				"fieldtype": "Link",
				"label": "Understanding By",
				"options": "User",
				"insert_after": "understanding_date",
			},

			{
				"fieldname": "pm_verification_section",
				"fieldtype": "Section Break",
				"label": "PM Verification",
				"collapsible": 1,
				"insert_after": "understanding_by",
			},
			{
				"fieldname": "pm_approval_status",
				"fieldtype": "Select",
				"label": "PM Approval Status",
				"options": "Pending\nApproved\nNeed Clarification\nRejected",
				"insert_after": "pm_verification_section",
			},
			{
				"fieldname": "pm_column_break",
				"fieldtype": "Column Break",
				"insert_after": "pm_approval_status",
			},
			{
				"fieldname": "pm_remarks",
				"fieldtype": "Small Text",
				"label": "PM Remarks",
				"insert_after": "pm_column_break",
			},

			{
				"fieldname": "functional_verification_section",
				"fieldtype": "Section Break",
				"label": "Functional Verification",
				"collapsible": 1,
				"insert_after": "pm_remarks",
			},
			{
				"fieldname": "functional_verification_required",
				"fieldtype": "Check",
				"label": "Functional Verification Required",
				"insert_after": "functional_verification_section",
			},
			{
				"fieldname": "functional_column_break_1",
				"fieldtype": "Column Break",
				"insert_after": "functional_verification_required",
			},
			{
				"fieldname": "functional_verification_status",
				"fieldtype": "Select",
				"label": "Functional Verification Status",
				"options": "Pending\nAssigned\nIn Review\nApproved\nRejected",
				"insert_after": "functional_column_break_1",
			},
			{
				"fieldname": "functional_column_break_2",
				"fieldtype": "Column Break",
				"insert_after": "functional_verification_status",
			},
			{
				"fieldname": "functional_consultant",
				"fieldtype": "Link",
				"label": "Functional Consultant",
				"options": "User",
				"insert_after": "functional_column_break_2",
			},
			{
				"fieldname": "functional_remarks",
				"fieldtype": "Small Text",
				"label": "Functional Remarks",
				"insert_after": "functional_consultant",
			},
			{
				"fieldname": "completion_section",
				"fieldtype": "Section Break",
				"label": "Completion",
				"collapsible": 1,
				"insert_after": "functional_remarks",
			},
			{
				"fieldname": "ready_for_qa",
				"fieldtype": "Check",
				"label": "Ready for QA",
				"insert_after": "completion_section",
			},
			{
				"fieldname": "completion_column_break_1",
				"fieldtype": "Column Break",
				"insert_after": "ready_for_qa",
			},
			{
				"fieldname": "ready_for_deployment",
				"fieldtype": "Check",
				"label": "Ready for Deployment",
				"insert_after": "completion_column_break_1",
			},
			{
				"fieldname": "completion_column_break_2",
				"fieldtype": "Column Break",
				"insert_after": "ready_for_deployment",
			},
			{
				"fieldname": "deployment_approved",
				"fieldtype": "Check",
				"label": "Deployment Approved",
				"insert_after": "completion_column_break_2",
			},
		]
	}
