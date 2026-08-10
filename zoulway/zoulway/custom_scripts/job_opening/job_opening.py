import frappe
import requests
import os
from frappe.utils import get_files_path, get_url
from io import BytesIO
from frappe.utils.file_manager import save_file


def generate_qr_for_job(doc, method=None):
	"""
	Generate QR Code automatically for Job Opening.
	Works for:
	1. Directly created Job Opening
	2. Job Opening created from Job Requisition
	"""

	if isinstance(doc, str):
		doc = frappe.get_doc("Job Opening", doc)

	if doc.qr_scan_to_apply:
		return

	if not doc.route:
		frappe.log_error(
			title="QR Generation Failed",
			message=f"Route not found for Job Opening {doc.name}"
		)
		return

	base_url = get_url().rstrip("/")
	job_url = f"{base_url}/{doc.route}"

	frappe.db.set_value("Job Opening", doc.name, "job_url", job_url)

	qr_api_url = (
		"https://api.qrserver.com/v1/create-qr-code/"
		f"?size=300x300&data={job_url}"
	)

	try:
		response = requests.get(qr_api_url, timeout=10)
		response.raise_for_status()
	except requests.RequestException as e:
		frappe.log_error(
			title="QR Generation Failed",
			message=str(e)
		)
		return

	file_doc = save_file(
		f"qr_{doc.name}.png",
		response.content,
		"Job Opening",
		doc.name,
		is_private=0,
		df="qr_scan_to_apply",
	)

	frappe.db.set_value(
		"Job Opening",
		doc.name,
		"qr_scan_to_apply",
		file_doc.file_url,
	)

	frappe.db.commit()