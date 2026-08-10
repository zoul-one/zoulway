import frappe
import os
from frappe import _
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields
from zoulway.custom.custom_field.job_opening import get_job_opening_custom_fields

def after_install():
	#Creating Zoul Way specific custom fields
	create_custom_fields(get_custom_fields(), ignore_validate=True)

def after_migrate():
    after_install()

def before_uninstall():
    delete_custom_fields(get_job_opening_custom_fields())


def get_custom_fields():
	'''
		Method to get all custom fields that need to be created for Zoul Way
	'''
	custom_fields = get_job_opening_custom_fields()
	return custom_fields

def delete_custom_fields(custom_fields: dict):
	'''
		Method to Delete custom fields
		args:
			custom_fields: a dict like {'Task': [{fieldname: 'your_fieldname', ...}]}
	'''
	for doctype, fields in custom_fields.items():
		frappe.db.delete(
			"Custom Field",
			{
				"fieldname": ("in", [field["fieldname"] for field in fields]),
				"dt": doctype,
			},
		)
		frappe.clear_cache(doctype=doctype)

def create_property_setters(property_setter_datas):
	'''
		Method to create custom property setters
		args:
			property_setter_datas : list of dict of property setter obj
	'''
	for property_setter_data in property_setter_datas:
		if frappe.db.exists("Property Setter", property_setter_data):
			continue
		property_setter = frappe.new_doc("Property Setter")
		property_setter.update(property_setter_data)
		property_setter.flags.ignore_permissions = True
		property_setter.insert()

