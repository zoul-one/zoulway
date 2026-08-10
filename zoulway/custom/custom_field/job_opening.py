def get_job_opening_custom_fields():
	"""
	Method to get custom fields for Job Opening doctype
	"""
	return {
		"Job Opening": [
			{
				"fieldname": "job_url",
				"fieldtype": "Data",
				"label": "Job URL",
				"insert_after": "publish_salary_range",
				"read_only": 1,
			},
			{
				"fieldname": "qr_scan_to_apply",
				"fieldtype": "Attach Image",
				"label": "Scan QR to Apply",
				"insert_after": "job_url",
				"read_only": 1,
			},
		]
	}