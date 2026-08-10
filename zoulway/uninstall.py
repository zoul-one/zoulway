import click

from cap_index.setup import before_uninstall as remove_custom_fields


def before_uninstall():
	try:
		print("Removing customizations created by the Zoul Way app...")
		remove_custom_fields()

	except Exception as e:
		BUG_REPORT_URL = "https://github.com/zoul-one/zoulway/issues/new"
		click.secho(
			"Removing Customizations for Zoul Way failed due to an error."
			" Please try again or"
			f" report the issue on {BUG_REPORT_URL} if not resolved.",
			fg="bright_red",
		)
		raise e

	click.secho("Zoul Way app customizations have been removed successfully...", fg="green")
