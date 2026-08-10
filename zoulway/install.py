import click
from zoulway.setup import after_install as setup

def after_install():
	try:
		print("Setting up Zoul Way...")
		setup()

		click.secho("Thank you for installing Zoul Way!", fg="green")

	except Exception as e:
		BUG_REPORT_URL = "https://github.com/zoul-one/zoulway/issues/new"
		click.secho(
			"Installation for Zoul Way app failed due to an error."
			" Please try re-installing the app or"
			f" report the issue on {BUG_REPORT_URL} if not resolved.",
			fg="bright_red",
		)
		raise e
