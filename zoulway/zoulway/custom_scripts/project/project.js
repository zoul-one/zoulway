
frappe.ui.form.on("Project", {
    refresh(frm) {
        if (frm.is_new()) {
            return;
        }

        frm.add_custom_button(__("Add Timesheet & Task"), () => {
            zoulway_open_timesheet_dialog(frm);
        });
    },
});

function zoulway_open_timesheet_dialog(frm) {
    const d = new frappe.ui.Dialog({
        title: __("Add Timesheet & Task"),

        fields: [
            {
                fieldname: "existing_task",
                fieldtype: "Check",
                label: __("Existing Task"),
                default: 0,
                onchange() {
                    toggle();
                },
            },

            {
                fieldname: "task",
                fieldtype: "Link",
                options: "Task",
                label: __("Task"),
                hidden: 1,
                get_query() {
                    return {
                        filters: {
                            project: frm.doc.name,
                            status: ["not in", ["Completed", "Cancelled"]],
                        },
                    };
                },
            },

            {
                fieldname: "task_subject",
                fieldtype: "Data",
                label: __("Task Subject"),
                reqd: 1,
            },

            {
                fieldtype: "Section Break",
            },

            {
                fieldname: "activity_type",
                fieldtype: "Link",
                options: "Activity Type",
                label: __("Activity Type"),
                reqd: 1,
            },

            {
                fieldname: "description",
                fieldtype: "Small Text",
                label: __("Description"),
                reqd: 1,
            },

            {
                fieldtype: "Section Break",
            },

            {
                fieldname: "no_need_time",
                fieldtype: "Check",
                label: __("No Need Time"),
                default: 0,
                onchange() {
                    toggle();
                },
            },

            {
                fieldname: "from_time",
                fieldtype: "Datetime",
                label: __("From Time"),
                default: frappe.datetime.now_datetime(),
                onchange() {
                    calculate_total_minutes();
                },
            },

            {
                fieldtype: "Column Break",
                fieldname: "cb1",
            },

            {
                fieldname: "to_time",
                fieldtype: "Datetime",
                label: __("To Time"),
                onchange() {
                    calculate_total_minutes();
                },
            },

            {
                fieldname: "total_minutes",
                fieldtype: "Int",
                label: __("Total Time (Minutes)"),
                read_only: 1,
            },
        ],

        primary_action_label: __("Submit"),

        primary_action(values) {
            frappe.call({
                method: "zoulway.api.add_timesheet_and_task",

                args: {
                    project: frm.doc.name,
                    data: values,
                },

                freeze: true,
                freeze_message: __("Creating Timesheet and Task..."),

                callback(r) {
                    if (r.exc) {
                        return;
                    }

                    d.hide();

                    frappe.show_alert({
                        message: __("Timesheet {0} updated", [
                            r.message.timesheet,
                        ]),
                        indicator: "green",
                    });

                    frm.reload_doc();
                },
            });
        },
    });

    function toggle() {
        const existing_task = d.get_value("existing_task");
        const no_need_time = d.get_value("no_need_time");

        // Existing Task / New Task
        d.set_df_property(
            "task",
            "hidden",
            existing_task ? 0 : 1
        );

        d.set_df_property(
            "task",
            "reqd",
            existing_task ? 1 : 0
        );

        d.set_df_property(
            "task_subject",
            "hidden",
            existing_task ? 1 : 0
        );

        d.set_df_property(
            "task_subject",
            "reqd",
            existing_task ? 0 : 1
        );

        // Time fields
        d.set_df_property(
            "from_time",
            "hidden",
            no_need_time ? 1 : 0
        );

        d.set_df_property(
            "to_time",
            "hidden",
            no_need_time ? 1 : 0
        );

        d.set_df_property(
            "from_time",
            "reqd",
            no_need_time ? 0 : 1
        );

        d.set_df_property(
            "to_time",
            "reqd",
            no_need_time ? 0 : 1
        );

        d.set_df_property(
            "total_minutes",
            "read_only",
            no_need_time ? 0 : 1
        );

        d.set_df_property(
            "total_minutes",
            "reqd",
            no_need_time ? 1 : 0
        );

        if (no_need_time) {
            d.set_value("total_minutes", null);
        } else {
            calculate_total_minutes();
        }
    }

    function calculate_total_minutes() {
        if (d.get_value("no_need_time")) {
            return;
        }

        const from_time = d.get_value("from_time");
        const to_time = d.get_value("to_time");

        if (!from_time || !to_time) {
            d.set_value("total_minutes", 0);
            return;
        }

        const minutes = moment(to_time).diff(
            moment(from_time),
            "minutes"
        );

        d.set_value(
            "total_minutes",
            minutes > 0 ? minutes : 0
        );
    }

    d.show();
    toggle();
}