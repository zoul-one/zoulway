
frappe.pages['zoulway-board'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Zoulway Board",
		single_column: true
	});
	var PROJECTS_PAGE_SIZE = 50;
	var projectsOffsets = 0;
	var projectsHasMore = true;
	var assignees = [];
	var urgency_options = [];
	var todo_status_options = [];
	var task_status_options = [];
	var todo_urg_options = [];
	var SLACK_ICON = `<svg width="16" height="16" viewBox="0 0 122.8 122.8" xmlns="http://www.w3.org/2000/svg">
  <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9z" fill="#e01e5a"/>
  <path d="M32.3 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9z" fill="#e01e5a"/>
  <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9z" fill="#36c5f0"/>
  <path d="M45.2 32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9z" fill="#36c5f0"/>
  <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97z" fill="#2eb67d"/>
  <path d="M90.5 45.2c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9z" fill="#2eb67d"/>
  <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97z" fill="#ecb22e"/>
  <path d="M77.6 90.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9z" fill="#ecb22e"/>
</svg>`;

	var WHATSAPP_ICON = `<svg width="16" height="16" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
  <path fill="#2CB742" d="M0,58l4.988-14.963C2.457,38.78,1,33.812,1,28.5C1,12.76,13.76,0,29.5,0S58,12.76,58,28.5
    S45.24,57,29.5,57c-4.789,0-9.299-1.187-13.26-3.273L0,58z"/>
  <path fill="#FFFFFF" d="M47.683,37.985c-1.316-2.487-6.169-5.331-6.169-5.331c-1.098-0.626-2.423-0.696-3.049,0.42
    c0,0-1.577,1.891-1.978,2.163c-1.832,1.241-3.529,1.193-5.242-0.52l-3.981-3.981l-3.981-3.981c-1.713-1.713-1.761-3.41-0.52-5.242
    c0.272-0.401,2.163-1.978,2.163-1.978c1.116-0.627,1.046-1.951,0.42-3.049c0,0-2.844-4.853-5.331-6.169
    c-1.058-0.56-2.357-0.364-3.203,0.482l-1.758,1.758c-5.577,5.577-2.831,11.873,2.746,17.45l5.097,5.097l5.097,5.097
    c5.577,5.577,11.873,8.323,17.45,2.746l1.758-1.758C48.048,40.341,48.243,39.042,47.683,37.985z"/>
</svg>`;
	var DeliverystatusOptions = [];
	var divisions = [];
	var TaskLeadOptions = [];
	var prevCol = null;
	var dashboardData = null;
	var notifications = null;
	var currentUser = frappe.session.user;
	var project_menu_actions = [
		{ act: "details", icon: "info", label: "Details & activity" },
		{ act: "gotostatus", icon: "circle-dot", label: "Change status", perm: "write" },
		{ act: "changepm", icon: "user-check", label: "Change project manager", perm: "write" },
		{ act: "gotodue", icon: "calendar-days", label: "Change Due Date", perm: "write" },
		{ act: "newtask", icon: "plus", label: "Add Task", perm: "create:Task" },
		{ act: "copylink", icon: "copy", label: "Copy link", doc: "Project" },
		{ act: "sendslackdm", icon: "send", label: "Send to Slack direct message", doc: "Project" },
		{ act: "sendslackchannel", icon: "send", label: "Send to Slack Channel", doc: "Project" },
		{ act: "addpaymentmilestone", icon: "wallet", label: "Add Payment Milestone", doc: "Project", perm: "write" },
		{ act: "sendwhatsapp", icon: "send", label: "Send to WhatsApp", doc: "Project" },
		{ act: "deletedoc", color: "var(--text-danger)", icon: "trash", label: "Delete Project", doc: "Project", perm: "delete" },
	];

	var project_filters_fields = [{
		"field": "status", "label": "Delivery Status", "icon": "circle-dot"
	},
	{
		"field": "pm", "label": "Project Manager", "icon": "circle-dot"
	}]
	var task_filters_fields = [
		{ field: "assignedto", label: "Assign To", icon: "user" },
		{ field: "assignedby", label: "Assign By", icon: "user" },
		{ field: "div", label: "Division", icon: "tag" },
		{ field: "completedby", label: "Completed by", icon: "user" }

	];
	var todosfilterfields = [
		{
			field: "status", label: "Status"
		},
		{
			field: "assignedto", label: "Assign To"
		},
		{
			field: "assignedby", label: "Assign By"
		}
	]
	page.set_title('Zoulway Board');
	var state = {
		milestoneOpen: null,
		sortPanelOpen: null,
		urgencuFilterPanelOpen: null,
		notification_doc: "",
		notification_id: "",
		projectpmfilter: "",
		completedBy: "",
		todoAssignByFilter: "",
		taskassignbyfilter: "",
		completedOn: null,
		todoStatusFilter: "",
		todoAssignToFilter: "",
		taskLeadFilter: "",
		taskDivFilter: "",
		completedByFilter: "",
		projectStatusFilter: "",
		colFilterField: null,
		colFilterOpen: null,
		sendPopupOpen: null,
		notifyPanelOpen: false,
		emergencyPanelOpen: false,
		view: "board",
		selectedProject: null,
		selectToDo: null,
		selectedTask: null,
		namedFilter: "",
		urgencyFilter: "",
		personFilter: "",
		minPct: 0,
		maxPct: 100,
		mineOnly: false,
		sortFilter: "",
		menu: null,
		drawer: null,
		add: false,
	};
	function debounce(fn, delay) {
		var timer = null;
		return function (...args) {
			clearTimeout(timer);
			timer = setTimeout(function () {
				fn.apply(this, args);
			}, delay)
		}
	}
	var runSearchFilter = debounce(function (value) {
		state.namedFilter = value;
		// if (!value) {
		// 	return;
		// }
		// else {
		// 	searchProjects(value);
		// }

		showFilteredProjects();
		showFilteredTasks();
		showToDosForSelectedTasks();
	}, 200)
	function summarizeActivityEntry(entry) {
		if (!entry.data) {
			return "Created";
		}
		var parsed;
		try {
			parsed = JSON.parse(entry.data)
		}
		catch (e) {
			return "Updated"
		}
		if (parsed.changed && parsed.changed.length > 0) {
			var change = parsed.changed[0];
			return `Set ${change[0]} to ${change[2]}`;
		};
		if (parsed.added) return "Added an item";
		if (parsed.removed) return "Removed an item"
		return "Updated";
	}
	function remDays(dueDateString) {
		var today = new Date();
		today.setHours(0, 0, 0, 0);
		var due_date = new Date(dueDateString);
		due_date.setHours(0, 0, 0, 0);
		var msPerDay = 1000 * 60 * 60 * 24;
		var diff = due_date - today;
		return Math.round(diff / msPerDay);
	}
	function remDaysHours(dueDateString) {
		if (!dueDateString) {
			return { isOverdue: false, days: 0, hours: 0, totalHours: null };
		}
		var now = new Date();                     // real "right now" — not zeroed
		var due_date = new Date(dueDateString);
		var msPerHour = 1000 * 60 * 60;
		var totalHours = Math.round((due_date - now) / msPerHour);
		var isOverdue = totalHours < 0;
		var absHours = Math.abs(totalHours);
		var days = Math.floor(absHours / 24);
		var months = Math.floor(days / 30);
		var hours = absHours % 24;
		return { isOverdue: isOverdue, months: months, days: days, hours: hours, totalHours: totalHours };
	}
	function sortedBy(arr) {
		var out = arr.slice()
		if (state.sortFilter === "name") {
			return out.sort(function (a, b) { return a.name.localeCompare(b.name); })
		}
		if (state.sortFilter === "pct") {
			return out.sort(function (a, b) { return b.percent - a.percent; })
		}
		out.sort(function (a, b) {
			return ((b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
		})
		return out;
	}
	function isMine(value, currentUser) {
		if (!value) return false;
		var names = Array.isArray(value) ? value : String(value).split(",");
		return names.some(function (n) { return n.trim() === currentUser; });
	}

	function showFilteredProjects() {
		var filtered = testProjects.filter(function (project) {
			var mineOnly = !state.mineOnly || isMine(project.pm, currentUser)
			// var match_pct = ppct(project) >= state.minPct && ppct(project) <= state.maxPct;
			// var match_single = !state.selectedProject || state.selectedProject === project.id;
			var match_name = state.namedFilter === "" || project.name.toLowerCase().includes(state.namedFilter.toLowerCase());
			var match_person_name = state.personFilter === "" || (project.pm || "").toLowerCase().includes(state.personFilter.toLowerCase());
			var match_pm_name = state.projectpmfilter === "" || (project.pm || "").toLowerCase().includes(state.projectpmfilter.toLowerCase());
			var match_del_status = !state.projectStatusFilter || state.projectStatusFilter == project.status
			return match_pm_name && match_del_status && mineOnly && match_name && match_person_name;
		}
		)
		var sorted = sortedBy(filtered);
		if (state.selectedProject) {
			var selectedIndex = sorted.findIndex(function (p) { return p.id === state.selectedProject; });
			if (selectedIndex > 0) {
				var selectedProject = sorted[selectedIndex];
				sorted.splice(selectedIndex, 1);
				sorted.unshift(selectedProject);
			}
		}
		document.getElementById("projects-hd-count").textContent = sorted.length
		document.getElementById("d-projects").innerHTML = renderProjectsColumn(sorted);

	}
	function showFilteredTasks() {
		var filtered = testTasks.filter(function (task) {
			var mineOnly = !state.mineOnly || isMine(task.lead, currentUser) || isMine(task.assigned_by, currentUser) || isMine(task.completed, currentUser)
			var match_project = state.selectedProject === null || task.project == state.selectedProject;
			var match_pct = pct(task) >= state.minPct && pct(task) <= state.maxPct;
			var match_name = state.selectedProject ? true : (state.namedFilter === "" || (task.name || "").toLowerCase().includes(state.namedFilter.toLowerCase()));
			var match_urgency = state.urgencyFilter === "" || task.urgency == state.urgencyFilter;
			var match_person = matchesPerson(state.personFilter, task.lead, task.assigned_by, task.completed_by);
			var match_div = state.taskDivFilter === "" || state.taskDivFilter === (task.div || "");
			var match_assignto_person = state.personFilter === "" || task.assigned_by && String(task.assigned_by).toLowerCase().includes(state.personFilter.toLowerCase());
			var match_completedBy = state.completedByFilter === "" || state.completedByFilter === (task.completed_by || "");
			var match_lead_filter = state.taskLeadFilter === "" || state.taskLeadFilter === (task.lead || "");
			var match_assign_by = state.taskassignbyfilter === "" || state.taskassignbyfilter === (task.assigned_by || "");

			return match_assignto_person && match_assign_by && match_completedBy && match_lead_filter && match_div && match_pct && mineOnly && match_project && match_name && match_urgency && match_person;
		});
		var sorted = sortedBy(filtered);
		if (state.selectedTask) {
			var selectedIndex = sorted.findIndex(function (t) { return t.id === state.selectedTask; });
			if (selectedIndex > 0) {
				var selectedTask = sorted[selectedIndex];
				sorted.splice(selectedIndex, 1);
				sorted.unshift(selectedTask);
			}
		}
		elTaskCount.textContent = sorted.length;
		elTasks.innerHTML = renderTasksColumn(sorted);

	}
	function matchesPerson(filterValue, ...fields) {
		if (filterValue === "") return true;
		var lower = filterValue.toLowerCase();
		return fields.some(function (f) {
			return f && String(f).toLowerCase().includes(lower);
		});
	}
	function showToDosForSelectedTasks() {
		var filtered = testTodos.filter(function (todo) {
			var mineOnly = !state.mineOnly || isMine(todo.who, currentUser) || isMine(todo.assigned_by, currentUser)
			var todo_filtered = state.selectedTask === null || todo.task == state.selectedTask;
			var match_name = state.namedFilter === "" || project.name.toLowerCase().includes(state.namedFilter.toLowerCase());
			var match_person = matchesPerson(state.personFilter, todo.who, todo.assigned_by);
			var match_urgency = state.urgencyFilter === "" || todo.urgency == state.urgencyFilter;
			var match_filter_status = state.todoStatusFilter === "" || (todo.status || "") === state.todoStatusFilter
			var match_assignee = state.todoAssignToFilter === "" || (todo.who || "") === state.todoAssignToFilter;
			var match_assignedby = state.todoAssignByFilter === "" || (todo.assigned_by || "") === state.todoAssignByFilter;

			// var match_single = !state.single_todo_select || todo.id === state.single_todo_select;
			return match_assignedby && match_assignee && match_filter_status && match_name && mineOnly && todo_filtered && match_person && match_urgency;
		});
		var sorted = sortedBy(filtered);
		document.getElementById("todos-hd-count").textContent = sorted.length;
		document.getElementById("d-todos").innerHTML = renderToDosColumn(sorted);
	}

	function selectProject(id) {
		state.selectedProject = id;
		state.selectedTask = null;
		state.selectToDo = null;
		loadTasks(id);
		loadTodos(undefined, id);
		showFilteredProjects();
	};
	function selectTask(id) {
		state.selectedTask = id;
		state.selectToDo = null;
		showFilteredTasks();
		loadTodos(id);
	};
	async function selectToDo(id) {
		var todo = todosById.get(id);
		if (!todo) return;
		var wasDone = todo.done;
		var wasStatus = todo.status;

		todo.done = !wasDone;
		todo.status = todo.done ? "Closed" : "Open"

		showToDosForSelectedTasks();
		try {
			var result = await frappe.xcall("zoulway.api.toggle_todo_done", { todo: id });
			await frappe.xcall("zoulway.api.set_status", {
				doctype: "ToDo",
				name: id,
				status: todo.status
			});
			var task = tasksById.get(result.task);
			if (task) task.percent = result.task_percent;
			var project = projectsById.get(result.project);
			if (project) project.percent = result.project_percent;
		} catch (err) {
			todo.done = wasDone;
			todo.status = wasStatus;
			todo.done = !todo.done;   // revert optimistic UI update
			frappe.msgprint("Could not update to-do: " + (err.message || "unknown error"));
		}
		showFilteredTasks();
		showFilteredProjects();
		showToDosForSelectedTasks();
	}
	function renderReactions(item) {
		var defs = [
			["bookmark", "🔖"],
			["star", "⭐"],
			["love", "❤"],
			["angry", "😠"],
			["emergency", "⚠"]
		];
		return defs.map(function (d) {
			var key = d[0], icon = d[1];
			var entry = (item.reactions && item.reactions[key]) || { count: 0, users: [], reacted_by_me: false };
			var count = entry.count || 0;
			var iReacted = !!entry.reacted_by_me;
			return `<button class="rbtn ${iReacted ? 'on' : ''}" data-act="react" data-id="${item.id}" data-key="${key}">${icon} ${count > 0 ? count : ""}</button>`;
		}).join("");
	}
	function metricCard(label, value, isDanger) {
		var color = isDanger && value > 0 ? "var(--text-danger)" : "var(--text-primary)";
		return `
		<div class = "d-card"
		style="padding:12px; text-align:center">
		<div class="d-meta">${label}</div>
		<div style="font-size:22px; font-weight:600; color:${color}">${value}</div>
		</div>`;
	}
	function dashList(items, isEmergency, emptyText) {
		if (!items || items.length === 0) {
			return `<div class="d-meta">${emptyText}</div>`;
		}
		return items.map(function (item) {
			return dashListRow(item, isEmergency)
		}).join("");
	}
	function dashListRow(item, isEmergency) {
		var days = remDays(item.deadline);
		var color;
		if (isEmergency) {
			color = "var(--text-danger)";
		} else if (days !== null && days < 0) {
			color = "var(--text-danger)";       // overdue - red
		} else if (days === 0) {
			color = "var(--text-warning)";       // due today - yellow
		} else {
			color = "var(--text-accent)";        // upcoming - accent
		}
		var deadlineText = isEmergency ? (item.imp_escalated ? "Escalated" : "Emergency") : dueChip(item.doctype, item.deadline);
		return `
    <div class="dash-list-row ${isEmergency ? 'is-emergency' : ''}">
      <span class="dash-name">
        ${isEmergency ? frappe.utils.icon("triangle-alert", "xs") : ""}
		<span>${item.title != null ? item.title : item.doctype == "Task" ? "No Subject" : "No Description"}</span>
        <span class="d-meta">${item.doctype}</span>
      </span>
      <span class="dash-right" style="color:${color}">${deadlineText}</span>
    </div>
  `;
	}
	function oneStatusBar(progressState, name, count, max) {
		var pct = Math.round((count / max) * 100);
		return `
		<div class="dbar-row">
		<div class="dbar-lbl">${name}</div>
		<div class="dbar-trk"><div class="dbar-fill" style="width:${pct}%"></div></div>
		<div style="width:36px; text-align:right; color:var(--text-secondary)">${!progressState ? count : count + "%"}</div>
		</div>
		`;
	}
	function statusBarSection(progressState, by_status) {
		var names = Object.keys(by_status);
		if (names.length === 0) {
			return `<div class="d-meta">No data.</div>`
		}
		var values = names.map(function (name) {
			return by_status[name]
		})
		var max = Math.max.apply(null, values);
		return names.map(function (name) {
			return oneStatusBar(progressState, name, by_status[name], max)
		}).join("")
	}
	function renderDashBoard() {
		if (!dashboardData) return;
		var d = dashboardData;
		var cardsHtml = [];
		if (!d.project_id) {
			cardsHtml.push(metricCard("Projects", d.projects));
		}
		cardsHtml.push(
			metricCard("Tasks", d.tasks),
			metricCard(d.project_id ? "Project Completed %" : "Overall Completed %", d.avg_progress + "%"),
			metricCard("Due ≤ 7 days ", d.due_7d),
			metricCard("Overdue", d.overdue, true),
			metricCard("Escalated", d.escalated, true)
		);
		cardsHtml = cardsHtml.join("");

		document.getElementById("dashboard-view").innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px,1fr)); gap:10px;">
    ${cardsHtml}
    </div>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px,1fr)); gap:16px; margin-top:20px;">
        <div class="dw-sec"><div class="dw-lbl">Deadlines — soonest first</div>${dashList(d.deadlines_soon, false, "No deadlines set.")}</div>
        <div class="dw-sec"><div class="dw-lbl">Emergencies</div>${dashList(d.emergencies, true, "None right now.")}</div>
    </div>
        <div class="dw-sec"><div class="dw-lbl">TASKS BY STATUS</div>
        ${statusBarSection(false, d.by_status)}</div>
        <div class="dw-sec"><div class="dw-lbl">TASKS BY URGENCY</div>
        ${statusBarSection(false, d.by_urgency)}</div>
        <div class="dw-sec"><div class="dw-lbl">% COMPLETED BY STAGE</div>
        ${statusBarSection(true, d.stage_avg_progress)}</div>
        <div class="dw-sec"><div class="dw-lbl">OPEN TASKS BY DIVISION</div>
        ${statusBarSection(false, d.by_division)}</div>
    `;
	}

	async function loadDashboard() {
		dashboardData = await frappe.xcall("zoulway.api.dashboard_summary", { project_id: state.selectedProject });
		updateEmergencyBadge(dashboardData);
		renderDashBoard();
	}
	var allReports = [];
	var reportSearchTerm = "";
	var reportDoctypeFilter = "";
	var runReportSearch = debounce(function (value) {
		reportSearchTerm = value;
		applyReportFilters();
	}, 200);

	function applyReportFilters() {
		var filtered = allReports.filter(function (r) {
			var matchesSearch = reportSearchTerm === "" || r.name.toLowerCase().includes(reportSearchTerm.toLowerCase());
			var matchFilter = reportDoctypeFilter === "" || r.ref_doctype === reportDoctypeFilter
			return matchFilter && matchesSearch
		});
		renderReportRows(filtered)
	}

	async function loadReports() {
		allReports = await frappe.xcall("zoulway.api.get_reports")
		renderReport(allReports)
	}

	function renderReportRows(reports) {
		document.getElementById("rb-rows").innerHTML = reports.map(function (row) {
			return `
      <div class="rb-row" data-report="${row.name}">
	  <div class="rb-name-cell">
	    <div class="rb-title">${row.name}</div>
        <div class="rb-mod">${row.module}</div>
	  </div>
		<span class="rb-doctype">${row.ref_doctype}</span>
		<span class="rb-type">${row.report_type}</span>
        <span class="rb-chev">${frappe.utils.icon("chevron-right", "xs")}</span>
      </div>
    `;
		}).join("");
	}
	function renderReport(reports) {
		var el = document.getElementById("report-view");
		el.innerHTML = `
		<div class="rb-card">
		<div class="rb-toolbar">
		<h3 class="rb-heading">Generated Reports</h3>
		<div class="rb-toolbar-actions">
		<div class="rb-search">
		${frappe.utils.icon("search", "xs")}
		<input id="rb-search-input" placeholder="Search here..." />
		</div>
		<button id="rb-filter-btn" class="rb-filter-btn">
              ${frappe.utils.icon("settings-2", "xs")} Filter
        </button>
		<div id="rb-filter-panel" class="rb-filter-panel" style="display:none;"></div>
		</div>
		</div>
		<div class="rb-table-head">
		<span>Report Name</span>
		<span>Doctype</span>
		<span>Type</span>
		<span></span>
		</div>
		<div id="rb-rows"></div>
		</div>`;
		renderReportRows(reports);
		// .innerHTML = reports.map(renderReportRows).join("")
	}
	function positionViewTabsSlider() {
		var activeBtn = document.querySelector(".view-tabs button.on");
		var slider = document.getElementById("view-tabs-slider");
		if (!activeBtn || !slider) return;
		slider.style.width = activeBtn.offsetWidth + "px";
		slider.style.transform = "translateX(" + activeBtn.offsetLeft + "px)";
	}
	$(page.body).html(`
		<div class="impl-board-root">
		<div style="display:flex; align-items:center; justify-content:space-between; padding:6px 8px; border-bottom:0.5px solid var(--border)">
	<div style="display:flex; align-items:center; gap:16px">
	<div class="view-tabs-wrap">
	<div class="view-tabs">
		<div class="view-tabs-slider" id="view-tabs-slider"></div>
		<button id="btn-board" class="on">${frappe.utils.icon("layout-list", "xs")} Overview</button>
		<button id="btn-dashboard">${frappe.utils.icon("chart-bar", "xs")} Dashboard</button>
		<button id="btn-report">${frappe.utils.icon("file-chart-column-increasing", "xs")} Reports</button>
	</div>
	</div>
	</div>
	<div style="display:flex; align-items:center; gap:10px">
	<div style="position:relative">
	<button id="btn-notif" class="icon-btn-lg">
		${frappe.utils.icon("bell")}
		<span class="badge" id="notif-badge" style="display:none">0</span>
	</button>
	<div id="notification-panel" class="header-panel" style="display:none;"></div>
	</div>
	<div style="position:relative">
	<button id="btn-emergency" class="icon-btn-lg">
		${frappe.utils.icon("triangle-alert")}
		<span class="badge" id="emergency-badge" style="display:none">0</span>
	</button>
	<div id="emergency-panel" class="header-panel" style="display:none;"></div>
	</div>
	<div style="position:relative">
	<button id="btn-load" class="icon-btn-lg">
		${frappe.utils.icon("refresh-cw")}
		<span class="badge" style="display:none">0</span>
	</button>
	</div>
	<div style="position:relative">
		<button id="btn-add">${frappe.utils.icon("plus", "xs")} Add</button>
		<div id="add-menu" class="add-popover" style="display:none;right:0;"></div>
	</div>
	</div>
</div>
		<div class="topbar">
		<div class="toolbar-card">
			<div class="toolbar-left">
		<input id="f-name" placeholder="Search project/task/to-do" />
	</div>
	<div class="toolbar-right">
		<div id="f-urgency"></div>
		<div id="f-person"></div>
		<div id="f-sort"></div>
		<button id="f-mine">My work</button>
		<button id="f-clear">${frappe.utils.icon("x")}  Clear</button>
	</div>
		</div>
		</div>
		<div class="grid">
		<div>
			<div id="h-projects" class="d-hd">
			<span class="d-hd-label">Projects</span>
			<span class="d-hd-count" id="projects-hd-count">0</span>
			    <button class="d-info" data-act="colfilter" data-col="projects">
					${frappe.utils.icon("settings-2", "xs")}
				</button>
			<div id="colfilter-projects" class="rb-filter-panel" style="display:none;"></div>
			</div>
			<div id="d-projects"></div>
			<button id="btn-load-more-projects" class="d-info" style="width:100%; margin-top:8px;">Load more</button>
			</div>
			<div>
				<div id="h-tasks" class="d-hd">
				Tasks
				<span class="d-hd-count" id="tasks-hd-count">0</span>
				<button class="d-info" data-act="colfilter" data-col="tasks" style="margin-left:auto">
				${frappe.utils.icon("settings-2", "xs")}
				</button>
				<div id="colfilter-tasks" class="rb-filter-panel" style="display:none;"></div>
				</div>
				<div id="d-tasks"></div>
			</div>
			<div>
				<div id="h-todos" class="d-hd">
				To-dos
				<span class="d-hd-count" id="todos-hd-count">0</span>
				<button class="d-info" data-act="colfilter" data-col="todos" style="margin-left:auto">
					${frappe.utils.icon("settings-2", "xs")}
				</button>
				<div id="colfilter-todos" class="rb-filter-panel" style="display:none;"></div>
				</div>
				<div id="d-todos"></div>
			</div>
		</div>
		<div id="drawer" style="display:none;"></div>

		<div id = "send-popup-overlay" class = "send-popup-overlay" style="display:none;">
		<div class = "send-popup">
			<div class="send-popup-header">
			<div id="send-popup-title" class="send-popup-title"> Message to Slack DM</div>
			<button data-act='cancelsend' class="d-info">${frappe.utils.icon("close", "xs")}</button>
			</div>
			<textarea id="send-popup-text" placeholder="Type your message here..."></textarea>
			<div class="send-popup-actions">
			<button class="btn btn-default btn-sm" data-act="cancelsend">Cancel</button>
			<button class="btn btn-primary btn-sm" data-act="confirmsend">Send</button>
			</div>
		</div>
		</div>
		<div id = "milestone-popup-overlay" class ="send-popup-overlay" style="display:none;">
		<div class ="send-popup" style="width:800px">
			<div class="send-popup-header">
			<h4 style="margin:0; font-size:14px; font-weight:600; color:var(--text-secondary); text-transform:uppercase; padding-left: 10px;letter-spacing:0.6px;">Payment milestones</h4>
			<button data-act='closemilestones' class="d-info">${frappe.utils.icon("close", "xs")}</button>
			</div>
			<div id="milestone-list" style="max-height:195px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
			</div>
			<div id="milestone-add-form" style="display:flex; flex-direction:column; gap:12px; padding:16px; margin-top:8px; border-top:0.5px solid var(--border);">
				<h4 style="margin:0; font-size:14px; font-weight:600; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.3px;">Add milestone</h4>
				<div style="display:flex; flex-direction:row; gap:12px;">
					<div style="display:flex; flex-direction:column; gap:3px; flex:1;">
						<label for="ms-duration" style="font-size:12px; color:var(--text-secondary);">Duration (days)</label>
						<input id="ms-duration" input type="number" placeholder="e.g. 14">
					</div>
					<div style="display:flex; flex-direction:column; gap:3px; flex:1;">
						<label for="ms-percent" style="font-size:12px; color:var(--text-secondary);">Payment %</label>
						<input id="ms-percent" input type="number" placeholder="e.g. 20">
					</div>
					<div style="display:flex; flex-direction:column; gap:3px; flex:1;">
						<label style="font-size:12px; color:var(--text-secondary);">Completion status</label>
						<select id="ms-cstatus">
						<option value="Not Started">Not Started</option>
						<option value="In Progress">In Progress</option>
						<option value="Partially Completed">Partially Completed</option>
						<option value="On Hold">On Hold</option>
						<option value="Due">Due</option>
						<option value="Completed">Completed</option>
						</select>
					</div>
				</div>
				<div style="display:flex; flex-direction:row; gap:12px;">
					<div style="display:flex; flex-direction:column; gap:3px; flex:1;">
						<label for="ms-pstatus" style="font-size:12px; color:var(--text-secondary);">Payment status</label>
						<select id="ms-pstatus">
						<option value="Paid">Paid</option>
						<option value="UnPaid">UnPaid</option>
						<option value="Overdue">Overdue</option>
						<option value="Partially Paid">Partially Paid</option>
						<option value="Pending">Pending</option>
						</select>
					</div>
					<div style="display:flex; flex-direction:column; gap:3px; flex:1;">
						<label for="ms-estart" style="font-size:12px; color:var(--text-secondary);">Start date</label>
						<input id="ms-estart" input type="date">
					</div>
					<div style="display:flex; flex-direction:column; gap:3px; flex:1;">
						<label for="ms-edate" style="font-size:12px; color:var(--text-secondary);">End date</label>
						<input id="ms-edate" input type="date">
					</div>
				</div>
				<div style="display:flex; flex-direction:row; gap:12px;">
					<div style="display:flex; flex-direction:column; gap:3px; flex:1;">
						<label for="ms-c_perc" style="font-size:12px; color:var(--text-secondary);">Milestone Completion (%)</label>
						<input id="ms-c_perc" input type="number" placeholder="30%">
					</div>
					<div style="display:flex; flex-direction:column; gap:3px; flex:1;">
						<label for="ms-nofmod" style="font-size:12px; color:var(--text-secondary);">No of Modules</label>
						<input id="ms-nofmod" input type="number">
					</div>
					<div style="display:flex; flex-direction:column; gap:3px; flex:1;">
						<label for="ms-title" style="font-size:12px; color:var(--text-secondary);">Title</label>
						<input id="ms-title" input type="text">
					</div>
				</div>
				<button class="btn btn-primary btn-sm" data-act="addmilestone" style="align-self:flex-end;">${frappe.utils.icon("plus", "xs")} Add</button>
			</div>
		</div>
		</div>

		<div id="dashboard-view" style="display:none; padding:16px;"></div>
		<div id="report-view" style="display:none; padding:16px;"></div>
		</div>
	  `);
	positionViewTabsSlider();
	var elTaskCount = document.getElementById("tasks-hd-count");
	var elTasks = document.getElementById("d-tasks");
	function scrollToSelected() {
		requestAnimationFrame(function () {
			var el = document.querySelector(".sel");
			if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
		});
	}
	async function setMileStone(project, duration, percent, cstatus, pstatus, estart, edate, c_perc, nofmod, title) {
		var response = await frappe.xcall("zoulway.api.set_milestone", {
			project: state.selectedProject,
			duration: duration, percent: percent, cstatus: cstatus, pstatus: pstatus,
			estart: estart, edate: edate, c_perc: c_perc, nofmod: nofmod, title: title
		})
		return response;
	}
	var projectsHasMore = true;
	async function loadMoreProjects() {
		projectsOffsets += PROJECTS_PAGE_SIZE;
		var rows = await frappe.xcall("zoulway.api.get_projects", {
			limit: PROJECTS_PAGE_SIZE,
			offset: projectsOffsets
		});

		if (rows.length < PROJECTS_PAGE_SIZE) {
			projectsHasMore = false
		}
		var mapped = rows.map(function (r) {
			return {
				id: r.name,
				name: r.title,
				client: r.client,
				status: r.del_status,
				pm: r.pm,
				percent: r.percent,
				description: r.description,
				due: r.deadline,
				reactions: r.reaction_counts || {},
				activity: r.activity,
				comments: r.comments,
				attachments: r.attachments,
				slack_channel_id: r.slack_channel_id,
				percent_complete: r.percent_complete,
				whatsapp_channel_id: r.whatsapp_channel_id
			};
		});

		testProjects = testProjects.concat(mapped);
		mapped.forEach(function (p) { projectsById.set(p.id, p); });
		showFilteredProjects();
		updateLoadMoreButton();
	}
	function updateLoadMoreButton() {
		var btn = document.getElementById("btn-load-more-projects");
		if (!btn) return;
		btn.style.display = projectsHasMore ? "block" : "none";
	}

	function updateView() {
		document.getElementById("btn-board").classList.toggle("on", state.view === "board");
		document.getElementById("btn-dashboard").classList.toggle("on", state.view === "dashboard");
		document.getElementById("btn-report").classList.toggle("on", state.view === "report");
		requestAnimationFrame(function () {
			positionViewTabsSlider();
			setTimeout(positionViewTabsSlider, 50);   // re-measure once more after everything's settled
		});

		var panels = {
			board: [document.querySelector(".topbar"), document.querySelector(".grid")],
			dashboard: [document.getElementById("dashboard-view")],
			report: [document.getElementById("report-view")]
		};

		Object.keys(panels).forEach(function (viewName) {
			var isActive = state.view === viewName;
			panels[viewName].forEach(function (el) {
				el.style.display = isActive ? (viewName === "board" ? "" : "block") : "none";
			});
		});

		var target = panels[state.view][panels[state.view].length - 1];
		target.style.opacity = 0;
		requestAnimationFrame(function () { target.style.opacity = 1; });
	}
	async function deleteMilestone(name) {
		var rows = await frappe.xcall("zoulway.api.delete_milestone", { name: name, project: state.selectedProject })
		return rows
	}
	document.getElementById("milestone-popup-overlay").addEventListener("click", function (e) {
		if (e.target === this) {
			state.milestoneOpen = null;
			renderMilestonePopup();
			return;
		}
		var closemilestone = e.target.closest("[data-act='closemilestones']")
		if (closemilestone) {
			state.milestoneOpen = null;
			renderMilestonePopup();
			return;
		}
		var deletemilestone = e.target.closest("[data-act='deletemilestone'")
		if (deletemilestone) {
			var id = deletemilestone.getAttribute("data-row")
			deleteMilestone(id).then(function (rows) {
				state.milestoneOpen = { project: id, rows: rows }
				renderMilestonePopup()
			})
			return;
		}
		var addmilestone = e.target.closest("[data-act='addmilestone']")
		if (addmilestone) {
			var duration = document.getElementById("ms-duration").value;
			var percent = document.getElementById("ms-percent").value;
			var cstatus = document.getElementById("ms-cstatus").value;
			var pstatus = document.getElementById("ms-pstatus").value;
			var estart = document.getElementById("ms-estart").value;
			var edate = document.getElementById("ms-edate").value;
			var c_perc = document.getElementById("ms-c_perc").value;
			var nofmod = document.getElementById("ms-nofmod").value;
			var title = document.getElementById("ms-title").value;

			if (!duration || !percent || !cstatus || !pstatus || !estart || !edate || !c_perc || !nofmod) {
				frappe.msgprint("Please fill in all milestone fields.");
				return;
			}
			var project = state.selectedProject

			setMileStone(project, duration, percent, cstatus, pstatus, estart, edate, c_perc, nofmod, title).then(function (rows) {
				state.milestoneOpen = { project: project, rows: rows }
				renderMilestonePopup();
				document.getElementById("ms-duration").value = "";
				document.getElementById("ms-percent").value = "";
				document.getElementById("ms-cstatus").value = "";
				document.getElementById("ms-pstatus").value = "";
				document.getElementById("ms-estart").value = "";
				document.getElementById("ms-edate").value = "";
				document.getElementById("ms-c_perc").value = "";
				document.getElementById("ms-nofmod").value = "";
				document.getElementById("ms-title").value = "";
			});
			return;
		}
	});
	function bindColFilterHeader(headerId, col) {
		document.getElementById(headerId).addEventListener("click", function (e) {
			var colfilter = e.target.closest("[data-act='colfilter']");
			if (colfilter) {
				prevCol = state.colFilterOpen;
				state.colFilterOpen = (state.colFilterOpen === col) ? null : col;
				state.colFilterField = null;
				if (prevCol && prevCol !== col) {
					renderColFilter(prevCol);
				}
				renderColFilter(col);
				return;

			}
			var close = e.target.closest("[data-act='close']");
			if (close) {
				state.colFilterField = null;
				renderColFilter(col);
				return;
			}
			var pickField = e.target.closest("[data-act='pickfilterfield']")
			if (pickField) {
				e.stopPropagation();
				state.colFilterField = pickField.getAttribute("data-field");
				console.log(state.colFilterField)
				renderColFilter(col);
				return;
			}
			var setcolfilter = e.target.closest("[data-act='setcolfilter']");
			if (setcolfilter) {
				e.stopPropagation();
				var value = setcolfilter.getAttribute("data-value");
				if (col === "projects" && state.colFilterField === "status") state["projectStatusFilter"] = value;
				if (col === "projects" && state.colFilterField === "pm") state["projectpmfilter"] = value;
				if (col === "tasks" && state.colFilterField === "assignedto") state["taskLeadFilter"] = value;
				if (col === "tasks" && state.colFilterField === "div") state["taskDivFilter"] = value;
				if (col === "tasks" && state.colFilterField === "assignedby") state["taskassignbyfilter"] = value;
				if (col === "tasks" && state.colFilterField === "completedby") state["completedByFilter"] = value;
				if (col === "todos" && state.colFilterField === "status") state["todoStatusFilter"] = value;
				if (col === "todos" && state.colFilterField === "assignedto") state["todoAssignToFilter"] = value;
				if (col === "todos" && state.colFilterField === "assignedby") state["todoAssignByFilter"] = value;


				state.colFilterField = null;
				state.colFilterOpen = null;
				renderColFilter(col);
				if (col === "projects") showFilteredProjects();
				if (col === "tasks") showFilteredTasks();
				if (col === "todos") showToDosForSelectedTasks();
				return;
			}

			var back = e.target.closest("[data-act='backfilterfield']");
			if (back) {
				e.stopPropagation();
				state.colFilterField = null;
				renderColFilter(col);
				return;
			}
		});
	}
	bindColFilterHeader("h-projects", "projects");
	bindColFilterHeader("h-tasks", "tasks");
	bindColFilterHeader("h-todos", "todos");
	// bindColFilterHeader("h-tasks", "tasks", "taskDivFilter");

	document.getElementById("btn-board").addEventListener("click", function (e) {
		state.view = "board";
		updateView();
	});
	document.getElementById("btn-dashboard").addEventListener("click", function (e) {
		state.view = "dashboard";
		loadDashboard().then(function () { updateView(); });
	});
	document.getElementById("btn-report").addEventListener("click", function (e) {
		state.view = "report";
		loadReports().then(function () { updateView(); });
	});
	document.getElementById("btn-emergency").addEventListener("click", async function () {
		state.emergencyPanelOpen = !state.emergencyPanelOpen;
		if (state.emergencyPanelOpen && !dashboardData) {
			dashboardData = await frappe.xcall("zoulway.api.dashboard_summary");
		}
		renderEmergencyPanel();
	})
	document.getElementById("btn-load").addEventListener("click", async function () {
		state.menu = null;
		state.drawer = null;
		state.add = false;
		state.milestoneOpen = null;
		state.sendPopupOpen = null;

		state.namedFilter = "";
		state.personFilter = "";
		state.mineOnly = false;
		state.sortFilter = "";
		state.urgencyFilter = "";

		state.taskDivFilter = "";
		state.taskLeadFilter = "";
		state.taskassignbyfilter = "";
		state.completedByFilter = "";
		state.completedOn = null;

		state.todoAssignToFilter = "";
		state.todoAssignByFilter = "";
		state.todoStatusFilter = "";
		state.projectpmfilter = "";

		state.projectStatusFilter = "";

		state.colFilterField = null;
		state.colFilterOpen = null;

		state.selectedProject = null;
		state.selectedTask = null;
		state.selectToDo = null;

		state.minPct = 0;
		state.maxPct = 100;

		// btn-load handler

		document.getElementById("f-name").value = "";
		document.getElementById("f-mine").textContent = "My work";
		renderUrgOptions();
		renderSortFilters();

		await loadProjects();
		await Promise.all([
			loadTasks(),
			loadTodos()
		]);
		showFilteredProjects();
		showFilteredTasks();
		showToDosForSelectedTasks();
		renderPersonFilter();

		// close any panels that were left open, since their backing state just got wiped
		renderAddMenu();
		renderMilestonePopup();
		renderSendPopup();
		["projects", "tasks", "todos"].forEach(renderColFilter);
	});
	document.getElementById("btn-notif").addEventListener("click", async function () {
		state.notifyPanelOpen = !state.notifyPanelOpen;
		if (state.notifyPanelOpen) {
			notifications = await frappe.xcall("zoulway.api.notifications");
		}
		renderNotifyPanel();
	})
	function renderEmergencyPanel() {
		var el = document.getElementById("emergency-panel");
		if (!state.emergencyPanelOpen) {
			el.style.display = "none";
			return;
		}
		el.style.display = "block";
		var items = (dashboardData && dashboardData.emergencies) || [];
		var rows = (!items || (items.length === 0)) ?
			`<div class="header-panel-row d-meta">No emergencies right now.</div>`
			:
			items.map(function (item) {
				var label = item.imp_escalated ? "Escalated to lead/PM" : "Flagged as emergency";
				return `
				<div class="header-panel-row" data-act="opendocurl" data-doc="${item.doctype}" data-id="${item.name}" data-eid="${item.name}" style="display:flex; gap:10px; align-items:center">
				<div style="flex:none">${frappe.utils.icon("triangle-alert", "xs")}</div>

				<div style="flex:1; min-width:0">
					<div style="display:flex; justify-content:space-between; gap:8px; font-weight:500">
					<span>${item.title || item.name}</span>
					<span class="d-meta" style="flex:none">${item.doctype}</span>
					</div>
					<div class="d-meta" style="color:var(--text-danger); margin-top:2px">${label}</div>
				</div>
				</div>
        `;
			}).join("");
		el.innerHTML = `
			<div class="header-panel-title">
			Emergencies
			<button class="d-info" data-act="close-emergency-panel">${frappe.utils.icon("close", "xs")}</button>
			</div>
			${rows}
  `;
	}
	async function loadNotifCount() {
		if (!notifications) {
			notifications = await frappe.xcall("zoulway.api.notifications")
		}
		var el = document.getElementById("notif-badge")
		if (notifications && notifications.length > 0) {
			el.textContent = notifications.length;
			el.style.display = "flex"
		}
		else {
			el.style.display = "none"
		}
	}
	function updateEmergencyBadge(dashboard) {
		var el = document.getElementById("emergency-badge");
		if (dashboard && dashboard.emergencies && dashboard.emergencies.length > 0) {
			el.textContent = dashboard.emergencies.length;
			el.style.display = "flex";
		} else {
			el.style.display = "none";
		}
	}
	function notifIcon(type) {
		var icons = {
			"Mention": "at-sign",
			"Assignment": "user-plus",
			"Share": "share-2",
			"Energy Point": "star",
			"Alert": "triangle-alert",
			"Comment": "message-circle"
		};
		var name = icons[type] || "bell";
		return frappe.utils.icon(name, "xs");
	}
	function renderNotifyPanel() {
		var el = document.getElementById("notification-panel");
		if (!state.notifyPanelOpen) {
			el.style.display = "none";
			return;
		}
		el.style.display = "block";
		var items = (notifications) || [];
		var rows = (!items || (items.length === 0)) ?
			`<div class="header-panel-row d-meta">No notifications right now.</div>`
			:
			items.map(function (item) {
				return `
          <div class="header-panel-row" data-act="opendocurl" data-doc="${item.document_type}" data-id="${item.document_name}" data-notif-id="${item.name}" style="display:flex; gap:10px; align-items:flex-start">
            <div style="flex:none; padding-top:2px">${notifIcon(item.type)}</div>
            <div style="flex:1; min-width:0">
              <div style="display:flex; justify-content:space-between; gap:8px; font-weight:500">
                <span>${(item.title) || (item.subject) || item.name}</span>
                <span class="d-meta" style="flex:none">${(dueChip(item.doctype, item.deadline))}</span>
              </div>
            </div>
          </div>
        `;
			}).join("");
		el.innerHTML = `
			<div class="header-panel-title">
			Notifications
			<button class="d-info" data-act="close-notify-panel">${frappe.utils.icon("close", "xs")}</button>
			</div>
			${rows}
  `;
	}
	document.getElementById("notification-panel").addEventListener("click", async function (e) {
		if (e.target.closest("[data-act='close-notify-panel']")) {
			state.notifyPanelOpen = false;
			renderNotifyPanel();
			return;
		}
		var opendocurl = e.target.closest("[data-act='opendocurl']");
		if (!opendocurl) return;

		var doc = opendocurl.dataset.doc;
		var id = opendocurl.dataset.id;
		var notifid = opendocurl.dataset.notifId;

		if (doc === "Task") {
			var ctx = await frappe.xcall("zoulway.api.resolve_task_context", { task: id });
			if (!ctx.project) return frappe.msgprint("No Project found for this Task.");
			state.selectedProject = ctx.project;
			state.selectedTask = ctx.task;
			state.selectToDo = null;
		} else {
			var ctx = await frappe.xcall("zoulway.api.resolve_todo_context", { todo: id });
			if (!ctx.task || !ctx.project) return frappe.msgprint("No Task/Project found for this To-do.");
			state.selectedProject = ctx.project;
			state.selectedTask = ctx.task;
			state.selectToDo = ctx.todo;
		}
		frappe.xcall("zoulway.api.read_notifications", { id: notifid }).then(function () {
			notifications = notifications.filter(function (n) {
				return n.name != notifid;
			})
			renderNotifyPanel();
			loadNotifCount();
		})
		state.view = "board";
		updateView();

		await loadTasks(state.selectedProject);
		await loadTodos(state.selectedTask, state.selectedProject);
		showFilteredProjects();
		scrollToSelected();
	});
	function acknowledgeEmergency(doctype, name, eid) {
		return frappe.xcall("zoulway.api.read_emergency", { doctype: doctype, name: name }).then(function () {
			dashboardData.emergencies = dashboardData.emergencies.filter(function (item) {
				return item.name != eid;
			});
			updateEmergencyBadge(dashboardData);
			renderEmergencyPanel();
		});
	}
	document.getElementById("emergency-panel").addEventListener("click", async function (e) {
		if (e.target.closest("[data-act='close-emergency-panel']")) {
			state.emergencyPanelOpen = false;
			renderEmergencyPanel();
			return;
		}
		var opendocurl = e.target.closest("[data-act='opendocurl']");
		if (!opendocurl) return;

		var doc = opendocurl.dataset.doc;
		var id = opendocurl.dataset.id;
		var eid = opendocurl.dataset.eid;

		if (doc === "Task") {
			var ctx = await frappe.xcall("zoulway.api.resolve_task_context", { task: id });
			if (!ctx.project) {
				acknowledgeEmergency(doc, id, eid)
				frappe.msgprint("No Project found for this Task.");
				return;
			}
			state.selectedProject = ctx.project;
			state.selectedTask = id;
			state.selectToDo = null;
		} else {
			var ctx = await frappe.xcall("zoulway.api.resolve_todo_context", { todo: id });
			if (!ctx.task || !ctx.project) {
				acknowledgeEmergency(doc, id, eid)
				frappe.msgprint("No Task/Project found for this ToDo");
				return;
			}
			state.selectedProject = ctx.project;
			state.selectedTask = ctx.task;
			state.selectToDo = id;
		}
		acknowledgeEmergency(doc, id, eid)
		state.view = "board";
		updateView();
		await loadTasks(state.selectedProject);
		await loadTodos(state.selectedTask, state.selectedProject);
		showFilteredProjects();
		scrollToSelected();
	});
	document.getElementById("btn-add").addEventListener("click", function (e) {
		state.add = !state.add;   // simple toggle, same pattern as your menu open/close
		renderAddMenu();
	});
	function isAllowedTo(perm, doctype) {
		console.log("Perm", perm)
		if (!perm) { return true; }
		if (perm === "write") {
			return frappe.model.can_write(doctype)
		}
		if (perm === "delete") {
			return frappe.model.can_delete(doctype)
		}
		if (perm.indexOf("create:") === 0) {
			return frappe.model.can_create(perm.split(":")[1]);
		}
		return true;
	}
	function renderAddMenu() {
		var el = document.getElementById("add-menu");
		if (!state.add) {
			el.style.display = "none";
			el.innerHTML = "";
			return;
		}
		var canCreateProject = frappe.model.can_create("Project");
		var canCreateTask = frappe.model.can_create("Task");
		var canCreateToDo = frappe.model.can_create("ToDo");
		el.style.display = "block";
		el.innerHTML = `
    <div class="d-act ${canCreateProject ? '' : 'd-act-disabled'}" data-act="newproject" ${canCreateProject ? '' : 'data-disabled="true"'}><div>${frappe.utils.icon("folder-plus", "sm")} </div> New project</div>
    <div class="d-act ${canCreateTask ? '' : 'd-act-disabled'}" data-act="newtask" ${canCreateTask ? '' : 'data-disabled="true"'}><div>${frappe.utils.icon("file-plus", "sm")}</div> New task in project</div>
    <div class="d-act ${canCreateToDo ? '' : 'd-act-disabled'}" data-act="newtodo" ${canCreateToDo ? '' : 'data-disabled="true"'}><div>${frappe.utils.icon("circle-check-big", "sm")}</div> New to-do in task</div>
  `;
	};
	document.getElementById("add-menu").addEventListener("click", function (e) {
		if (e.target.closest("[data-disabled='true']")) {
			return;   // disabled item — do nothing
		}
		var newproject = e.target.closest("[data-act='newproject']");
		if (newproject) {
			state.add = false;
			renderAddMenu();
			frappe.new_doc(
				"Project",
				{ imp_project_manager: currentUser, }, // route_options
				(quick_entry) => {
					if (!quick_entry || !quick_entry.dialog) {
						return;
					}

					const dialog = quick_entry.dialog;

					// Override Save action
					dialog.set_primary_action(__('Save'), () => {
						const values = dialog.get_values(true); // true = validate

						frappe.call({
							method: "frappe.client.insert",
							args: {
								doc: {
									doctype: "Project",
									imp_project_manager: currentUser,
									...values
								}
							},
							callback(r) {
								if (!r.exc) {
									frappe.msgprint(__("Project Successfully created"));
									loadProjects();
								}
								dialog.hide();
							}
						});
					});
				}
			);
			return
		}
		var newtask = e.target.closest("[data-act='newtask']");
		if (newtask) {
			state.add = false;
			project_id = state.selectedProject
			renderAddMenu();
			var slackID = ""
			var project = projectsById.get(project_id);
			console.log("Proje", project)
			if (project && project.slack_channel_id) {
				slackID = project.slack_channel_id;
			}
			console.log("This ", slackID)
			frappe.new_doc("Task", {
				project: state.selectedProject, slack_channel_id: slackID, custom_assigned_by: currentUser, custom_division_lead: currentUser,
			}, (quick_entry) => {
				if (!quick_entry || !quick_entry.dialog) {
					return
				}
				const dialog = quick_entry.dialog;

				dialog.set_primary_action(__('Save'), () => {
					const values = dialog.get_values(true); // true = validate
					var selectedProjectId = values.project || state.selectedProject;

					frappe.call({
						method: "frappe.client.insert",
						args: {
							doc: {
								doctype: "Task",
								project: selectedProjectId,
								custom_division_lead: currentUser,
								slack_channel_id: slackID,
								custom_assigned_by: currentUser,
								...values
							}
						},
						callback(r) {
							if (!r.exc) {
								frappe.msgprint(__("Task Successfully created"));
								loadTasks(state.selectedProject);
							}
							dialog.hide();
						}
					});
				});
			});
			loadTasks();
			showFilteredTasks();
			return
		};
		var newtodo = e.target.closest("[data-act='newtodo']");
		if (newtodo) {
			state.add = false;
			var task = tasksById.get(state.selectedTask);
			if (task && task.slack_channel_id) {
				var slackID = task.slack_channel_id;
			}
			renderAddMenu();
			frappe.new_doc("ToDo", { reference_type: "Task", reference_name: state.selectedTask, slack_channel_id: slackID, assigned_by: currentUser, allocated_to: currentUser, }, (quick_entry) => {
				if (!quick_entry || !quick_entry.dialog) {
					return
				}
				const dialog = quick_entry.dialog;
				dialog.set_primary_action(__('Save'), () => {
					const values = dialog.get_values(true); // true = validate

					frappe.call({
						method: "frappe.client.insert",
						args: {
							doc: {
								doctype: "ToDo",
								reference_type: "Task",
								reference_name: state.selectedTask,
								slack_channel_id: slackID,
								assigned_by: currentUser,
								allocated_to: currentUser,
								...values
							}
						},
						callback(r) {
							if (!r.exc) {
								frappe.msgprint(__("ToDo Successfully created"));
								loadTodos(state.selectedTask);
							}
							// Important: just hide the dialog, no redirect
							dialog.hide();
						}
					});
				});

			});
			return
		};
	});

	function renderColFilter(col) {
		var el = document.getElementById("colfilter-" + col);
		if (state.colFilterOpen !== col) {
			el.style.display = "none";
			return;
		}
		console.log(col)
		el.style.display = "block";
		if (col === "projects") {
			if (!state.colFilterField) {
				el.innerHTML = `
				<div class="rb-filter-options" id="rb-filter-options">
					${project_filters_fields.map(function (f) {
					return `<div class="filter-opt ${state.colFilterField === f.field ? "on" : ""}" data-act="pickfilterfield" data-field="${f.field}">
					<span>${f.label}</span>
					</div>`;
				}).join("")}
				</div>
				`;

			}
			else if (state.colFilterField === "pm") {
				el.innerHTML = `
			<div class="rb-filter-search">
				${frappe.utils.icon("search", "xs")}
			<input id="rb-filter-search-input" placeholder="Search" />
			</div>
	<div class="rb-filter-options" id="rb-filter-options">
		<div class="filter-opt ${state.projectpmfilter === "" ? "on" : ""}" data-act="setcolfilter" data-value="">Any</div>
		${TaskLeadOptions.map(function (s) {
					return `<div class="filter-opt ${state.projectpmfilter === s ? "on" : ""}" data-act="setcolfilter" data-value="${s}">${s}</div>`;
				}).join("")}
  </div>
`;
			}
			else if (state.colFilterField === "status") {
				el.innerHTML = `
			<div class="rb-filter-search">
				${frappe.utils.icon("search", "xs")}
			<input id="rb-filter-search-input" placeholder="Search" />
			</div>
	<div class="rb-filter-options" id="rb-filter-options">
		<div class="filter-opt ${state.projectStatusFilter === "" ? "on" : ""}" data-act="setcolfilter" data-value="">Any</div>
		${DeliverystatusOptions.map(function (s) {
					return `<div class="filter-opt ${state.projectStatusFilter === s ? "on" : ""}" data-act="setcolfilter" data-value="${s}">${s}</div>`;
				}).join("")}
  </div>
`;
			}

		}
		else if (col === "tasks") {
			if (!state.colFilterField) {
				el.innerHTML = `
			<div class="rb-filter-options" id="rb-filter-options">
					${task_filters_fields.map(function (f) {
					return `<div class="filter-opt" data-act="pickfilterfield" data-field="${f.field}">
					<span>${f.label}</span>
					</div>`;
				}).join("")}
				</div>
				`;
			}
			else if (state.colFilterField === "assignedto") {
				el.innerHTML = `
    			<div class="rb-filter-search">
				${frappe.utils.icon("search", "xs")}
			<input id="rb-filter-search-input" placeholder="Search" />
			</div>
			<div class="rb-filter-options" id="rb-filter-options">
      <div class="filter-opt ${state.taskLeadFilter === "" ? "on" : ""}" data-act="setcolfilter" data-value="">Any</div>
      ${TaskLeadOptions.map(function (u) {
					return `<div class="filter-opt ${state.taskLeadFilter === u ? "on" : ""}" data-act="setcolfilter" data-value="${u}">${u}</div>`;
				}).join("")}
    </div>
  `;
			}
			else if (state.colFilterField === "assignedby") {
				el.innerHTML = `
    			<div class="rb-filter-search">
				${frappe.utils.icon("search", "xs")}
			<input id="rb-filter-search-input" placeholder="Search" />
			</div>
    <div class="rb-filter-options" id="rb-filter-options">
      <div class="filter-opt ${state.taskassignbyfilter === "" ? "on" : ""}" data-act="setcolfilter" data-value="">Any</div>
      ${TaskLeadOptions.map(function (u) {
					return `<div class="filter-opt ${state.taskassignbyfilter === u ? "on" : ""}" data-act="setcolfilter" data-value="${u}">${u}</div>`;
				}).join("")}
    </div>
  `;
			}
			else if (state.colFilterField === "div") {
				el.innerHTML = `
    <div class="rb-filter-options" id="rb-filter-options">
      <div class="filter-opt ${state.taskDivFilter === "" ? "on" : ""}" data-act="setcolfilter" data-value="">Any</div>
      ${divisions.map(function (d) {
					var isOn = state.taskDivFilter === d;
					return `<div class="filter-opt ${isOn ? "on" : ""}" data-act="setcolfilter" data-value="${d}">${d}
				</div>
`;
				}).join("")}
    </div>
  `;
			}
			else if (state.colFilterField === "completedby") {
				el.innerHTML = `
    			<div class="rb-filter-search">
				${frappe.utils.icon("search", "xs")}
			<input id="rb-filter-search-input" placeholder="Search" />
			</div>
    <div class="rb-filter-options" id="rb-filter-options">
      <div class="filter-opt ${state.completedByFilter === "" ? "on" : ""}" data-act="setcolfilter" data-value="">Any</div>
      ${TaskLeadOptions.map(function (u) {
					return `<div class="filter-opt ${state.completedByFilter === u ? "on" : ""}" data-act="setcolfilter" data-value="${u}">${u}</div>`;
				}).join("")}
    </div>
  `;
			}

		}
		else if (col === "todos") {
			if (!state.colFilterField) {
				el.innerHTML = `
								<div class="rb-filter-options" id="rb-filter-options">

				${todosfilterfields.map(function (f) {
					return `<div class="filter-opt" data-act="pickfilterfield" data-field="${f.field}">
					<span>${f.label}</span>
					</div>`
				}).join("")
					}
					</div>
				`;
			}
			else if (state.colFilterField === "status") {
				el.innerHTML = `
   			<div class="rb-filter-search">
				${frappe.utils.icon("search", "xs")}
			<input id="rb-filter-search-input" placeholder="Search" />
			</div>
    <div class="rb-filter-options" id="rb-filter-options">
				<div class="filter-opt ${state.todoStatusFilter === "" ? "on" : ""}" data-act="setcolfilter" data-value="">Any</div>
				${todo_status_options.map(function (d) {
					var isOn = state.todoStatusFilter === d;
					return `<div class="filter-opt ${isOn ? "on" : ""}" data-act="setcolfilter" data-value="${d}">${d}
				</div>`;
				}).join("")}
				</div>
				`;
			}
			else if (state.colFilterField === "assignedto") {
				el.innerHTML = `
   			<div class="rb-filter-search">
				${frappe.utils.icon("search", "xs")}
			<input id="rb-filter-search-input" placeholder="Search" />
			</div>
		<div class="rb-filter-options" id="rb-filter-options">
		<div class="filter-opt ${state.todoAssignToFilter === "" ? "on" : ""}" data-act="setcolfilter" data-value="">Any</div>
			${assignees.map(function (d) {
					var isOn = state.todoAssignToFilter === d;
					return `<div class="filter-opt ${isOn ? "on" : ""}" data-act="setcolfilter" data-value="${d}">${d}
				</div>`;
				}).join("")}
		</div>`;

			}
			else if (state.colFilterField === "assignedby") {
				el.innerHTML = `
   			<div class="rb-filter-search">
				${frappe.utils.icon("search", "xs")}
			<input id="rb-filter-search-input" placeholder="Search" />
			</div>
    <div class="rb-filter-options" id="rb-filter-options">
      <div class="filter-opt ${state.todoAssignByFilter === "" ? "on" : ""}" data-act="setcolfilter" data-value="">Any</div>
      ${assignees.map(function (d) {
					var isOn = state.todoAssignByFilter === d;
					return `<div class="filter-opt ${isOn ? "on" : ""}" data-act="setcolfilter" data-value="${d}">${d}
				</div>`;
				}).join("")}</div>`;

			}
		}
	}
	async function getCopyUrl(doc, id) {
		var url = await frappe.xcall("zoulway.api.get_doc_url", { doc: doc, id: id })
		return url
	}

	function renderSendPopup() {
		var el = document.getElementById("send-popup-overlay");
		if (!state.sendPopupOpen) {
			el.style.display = "none";
			return;
		}
		el.style.display = "flex";
		var iconHtml = ""
		var titleText = ""
		if (state.sendPopupOpen.channel === "slack_dm") {
			iconHtml = SLACK_ICON;
			titleText = "Slack DM"
		}
		else if (state.sendPopupOpen.channel === "slack_channel") {
			iconHtml = SLACK_ICON;
			titleText = "Slack Channel"
		}
		else {
			iconHtml = WHATSAPP_ICON;
			titleText = "WhatsApp"
		}

		document.getElementById("send-popup-title").innerHTML = `<span class="send-popup-title-icon">${iconHtml}</span><span>Send to ${titleText}</span>`;
		document.getElementById("send-popup-text").value = "";
		setTimeout(function () {
			document.getElementById("send-popup-text").focus();
		}, 0);
		return;

	}
	document.getElementById("send-popup-overlay").addEventListener("click", function (e) {
		if (e.target === this || e.target.closest("[data-act='cancelsend']") || e.target.closest("[data-act='close']")) {
			state.sendPopupOpen = null;
			renderSendPopup();
			return;
		}

		if (e.target.closest("[data-act='confirmsend']")) {
			var text = document.getElementById("send-popup-text").value;
			if (!text || !text.trim()) {
				frappe.msgprint("Please enter a message before sending.");
				return;
			}
			var payload = state.sendPopupOpen;
			payload.message = text;
			frappe.xcall("zoulway.api.send_slack_message", { mode: payload.mode, name: payload.id, doctype: payload.doc, message: payload.message }).then(function () {
				frappe.show_alert({ message: "Message sent successfully", indicator: "green" }, 3);
				state.sendPopupOpen = null;
				renderSendPopup();
				return;
			}).catch(function (err) {
				frappe.msgprint("Could not send message: " + (err.message || "unknown error"));
			})
		}
	})
	function renderMilestonePopup() {
		var el = document.getElementById("milestone-popup-overlay");
		if (!state.milestoneOpen) {
			el.style.display = "none";
			return;
		}
		el.style.display = "flex";
		var rows = state.milestoneOpen.rows || [];
		document.getElementById("milestone-list").innerHTML = rows.length === 0 ?
			`<div class="d-meta">No milestones yet.</div>`
			:
			rows.map(function (m) {
				return `
					<div class="dash-list-row" data-row="${m.name}" style="align-items:center">
						<div>
							<div style="font-weight:500; font-size:16px;">${m.m_title || "Milestone"}</div>
							<span class="dash-name" style="font-size:14px;">
								<span>${m.duration || ""} days</span>
								<span class="d-meta"> · ${m.payment_percent || 0}% payment</span>
							</span>
						</div>
						<span style="display:flex; gap:6px; align-items:center">
							${chip(m.completion_status)}
							${chip(m.payment_status)}
							<button class="d-info" data-act="deletemilestone" data-row="${m.name}">${frappe.utils.icon("trash", "xs")}</button>
						</span>
					</div>
`;
			}).join("")

	}
	var selectedDueDate = ""
	function initDueDatePicker(doc, type) {
		if (type == "completed_on") {
			var input = document.getElementById("completed-on-input");
		}
		else {
			var input = document.getElementById("due-date-input");
		}
		if (!input) return;
		if (!window.implFlatpickr) {
			loadFlatpickr(function () {
				initDueDatePicker(doc, type)
			})
			return;
		}
		window.implFlatpickr(input, {
			inline: true,
			static: true,
			dateFormat: "Y-m-d",
			defaultDate: (type == "completed_on" ? doc.completed_on : doc.due) || null,
			appendTo: (type == "completed_on") ? document.getElementById("completed-on-calendar-container") : document.getElementById("due-date-calendar-container"),
			onChange: function (selectedDates, dateStr) {
				if (type == "completed_on") {
					state.completedOn = dateStr
				}
				else {
					selectedDueDate = dateStr
				}
			},
		})
	}
	var deadline_updated = ""
	async function saveDueDate(doc, id, dateStr) {
		deadline_updated = await frappe.xcall("zoulway.api.saveDueDate", { doctype: doc, name: id, dateStr: dateStr })
		return deadline_updated;
	}
	async function getMilestone(project_Id) {
		var response = await frappe.xcall("zoulway.api.get_milestone", { project: project_Id })
		return response;
	}
	async function deleteDoc(doc, id) {
		var res = frappe.xcall("zoulway.api.deleteproj", { doctype: doc, id: id })
		return res;
	}
	document.getElementById("d-projects").addEventListener("click", function (e) {
		if (e.target.closest("[data-disabled='true']")) {
			return;
		}
		togglePin = e.target.closest("[data-act='togglepin'")
		if (togglePin) {
			var doctype = togglePin.getAttribute("data-doc");
			var id = togglePin.getAttribute("data-id");
			var map = doctype === "Project" ? projectsById : (doctype === "Task") ? tasksById : todosById;
			var item = map.get(id)
			console.log(item);
			if (!item) return;
			var wasPinned = item.pinned;
			item.pinned = !wasPinned;
			if (doctype === "Project") showFilteredProjects();
			if (doctype === "Task") showFilteredTasks();
			if (doctype === "ToDo") showToDosForSelectedTasks();
			frappe.xcall("zoulway.api.toggle_pin", { doctype: doctype, id: id }).then(function () {
			}).catch(function (err) {
				item.pinned = wasPinned;
				if (doctype === "Project") showFilteredProjects();
				if (doctype === "Task") showFilteredTasks();
				if (doctype === "ToDo") showToDosForSelectedTasks();
				frappe.msgprint("Could not update pin: " + (err.message || "unknown error"));
			});
			return;
		}
		if (e.target.id === "due-date-input" || e.target.closest(".flatpickr-calendar")) {
			return;
		}
		var gotodue = e.target.closest("[data-act='gotodue']");
		if (gotodue) {
			var projectId = gotodue.getAttribute("data-id")
			var project = projectsById.get(projectId);
			if (!project) return;
			if (!state.menu) return;
			state.menu.mode = "changedue"
			showFilteredProjects();
			requestAnimationFrame(function () {
				initDueDatePicker(project, "due-date");
			});
			return;
		}
		var setdue = e.target.closest("[data-act='savedue']");
		if (setdue) {
			var id = setdue.getAttribute("data-id")
			if (!selectedDueDate) {
				state.menu = null;
				loadProjects();
				showFilteredProjects();
				return
			};
			saveDueDate("Project", id, selectedDueDate).then(
				function (newDate) {
					var project = projectsById.get(id)
					if (project) project.due = newDate;
					selectedDueDate = "";
					state.menu = null;
					loadProjects();
					showFilteredProjects();

				}
			).catch(function (err) {
				frappe.msgprint("Could not update due date: " + (err.message || "unknown error"))
			})
			return;
		}
		var sendAct = e.target.closest("[data-act='sendslackdm'],[data-act='sendslackchannel'],[data-act='sendwhatsapp']");
		if (sendAct) {
			var channelMap = {
				"sendslackdm": "slack_dm",
				"sendslackchannel": "slack_channel",
				"sendwhatsapp": "whatsapp"
			}

			var act = sendAct.getAttribute("data-act");
			var doc = sendAct.getAttribute("data-doc");
			var recordId = sendAct.getAttribute("data-id");
			state.menu = null;
			showFilteredProjects();
			var modeMap = { slack_dm: "dm", slack_channel: "slack_channel", whatsapp: "whatsapp" };
			state.sendPopupOpen = { mode: modeMap[channelMap[act]], channel: channelMap[act], doc: doc, id: recordId }
			renderSendPopup();
			return;

		}
		var paymentmilestone = e.target.closest("[data-act='addpaymentmilestone']")
		if (paymentmilestone) {
			var id = paymentmilestone.getAttribute("data-id")
			getMilestone(id).then(function (rows) {
				state.milestoneOpen = { project: id, rows: rows }
				renderMilestonePopup();
				return;
			})

		}
		var react = e.target.closest("[data-act='react']");
		if (react) {
			var id = react.getAttribute("data-id");
			var key = react.getAttribute("data-key");
			var doctype = "Project";
			frappe.xcall("zoulway.api.toggle_reaction", { doctype: doctype, name: id, reaction_type: key })
				.then(function (reactions) {
					var item = projectsById.get(id);
					if (!item) return;
					item.reactions = reactions;
					showFilteredProjects();
				});
			return;
		}
		var newtask = e.target.closest("[data-act='newtask']");

		if (newtask) {
			project_id = newtask.getAttribute("data-id");
			var slackId = ""
			var project = projectsById.get(state.selectedProject);
			if (project && project.slack_channel_id) {
				slackId = project.slack_channel_id;
			}
			frappe.new_doc("Task", {
				project: project_id, slack_channel_id: slackId, custom_assigned_by: currentUser, custom_division_lead: currentUser,
			}, (quick_entry) => {
				if (!quick_entry || !quick_entry.dialog) {
					return
				}

				const dialog = quick_entry.dialog;
				dialog.set_primary_action(__('Save'), () => {
					const values = dialog.get_values(true); // true = validate

					frappe.call({
						method: "frappe.client.insert",
						args: {
							doc: {
								doctype: "Task",
								project: project_id,
								slack_channel_id: slackId,
								custom_division_lead: currentUser,
								custom_assigned_by: currentUser,

								...values
							}
						},
						callback(r) {
							if (!r.exc) {
								frappe.msgprint(__("Task Successfully created"));
								// Optional: refresh your page data here
								// e.g. load_projects_table(page);
							}
							// Important: just hide the dialog, no redirect
							dialog.hide();
						}
					});
				});

			});
			return
		};

		var dots = e.target.closest("[data-act='dots']")
		if (dots) {
			var id = dots.getAttribute("data-id");
			state.selectedProject = id;
			state.menu = (state.menu && state.menu.id === id) ? null : { id: id, mode: null };
			showFilteredProjects();
			return;
		}
		var deleteProj = e.target.closest("[data-act='deletedoc']")
		if (deleteProj) {
			var doc = deleteProj.getAttribute("data-doc");
			var id = deleteProj.getAttribute("data-id");
			frappe.confirm('Are you sure you want to proceed?',
				() => {
					deleteDoc(doc, id).then(function (res) {
						testProjects = testProjects.filter(function (p) {
							return p.id !== id;
						})
						projectsById.delete(id);
						if (state.selectProject === id) {
							state.selectProject = null;
						}
						showFilteredProjects();
						frappe.msgprint({
							title: __('Notification'),
							indicator: 'green',
							message: __(`${doc} Document deleted successfully`)
						});
					}).catch((function (err) {
						frappe.msgprint("Could not delete project: " + (err.message || "unknown error"));
					}))
				}, () => {
				})
			return;
		}
		var copylink = e.target.closest("[data-act='copylink']")
		if (copylink) {
			var doc = copylink.getAttribute("data-doc");
			var id = copylink.getAttribute("data-id");
			getCopyUrl(doc, id).then(function (url) {
				navigator.clipboard.writeText(url).then(function () {
					frappe.show_alert({ message: "Link copied to clipboard", indicator: "green" }, 3);
				})
			});
			return;

		}
		var info = e.target.closest("[data-act='opendrawer']");
		if (info) {
			var id = info.getAttribute("data-id");
			var type = info.getAttribute("data-type");
			state.drawer = (state.drawer && state.drawer.id === id) ? null : { id: id, type: type };
			renderDrawer();
			return;
		}
		var opt = e.target.closest("[data-act='setstatus']");
		if (opt) {
			id = opt.getAttribute("data-id");
			newstatus = opt.getAttribute("data-value");
			frappe.xcall("zoulway.api.set_status", { doctype: "Project", name: id, status: newstatus }).then(
				function () {
					var project = projectsById.get(id);
					if (!project) return;
					project.status = newstatus;
					state.menu = null;
					showFilteredProjects();
				}).catch(function (err) {
					frappe.msgprint("Could not update status: " + (err.message || "unknown error"));
					state.menu = null;
					showFilteredProjects();
				});
			return;
		};
		var details = e.target.closest("[data-act='details']");
		if (details) {
			id = details.getAttribute("data-id");
			state.drawer = { id: id, type: "Project" }
			state.menu = null;
			renderDrawer();
			showFilteredProjects();
			return;
		}
		var setpm = e.target.closest("[data-act='setuser']");
		if (setpm) {
			id = setpm.getAttribute("data-id");
			newpm = setpm.getAttribute("data-value");
			frappe.xcall("zoulway.api.set_project_manager", { project: id, project_manager: newpm }).then(
				function () {
					var project = projectsById.get(id);
					if (!project) return;
					project.pm = newpm;
					state.menu = null;
					showFilteredProjects();
				})
			return;
		}
		var changepm = e.target.closest("[data-act='changepm']");
		if (changepm) {
			state.menu.mode = "changepm";
			var id = changepm.getAttribute("data-id")
			loadOptions("pm", id).then(function () { showFilteredProjects(); })
			return;
		}
		var close = e.target.closest("[data-act='close']");
		if (close) {
			state.menu = null;
			showFilteredProjects();
			return;
		}
		var gotostatus = e.target.closest("[data-act='gotostatus']")
		if (gotostatus) {
			state.menu.mode = "status";
			showFilteredProjects();
			return;
		}
		var card = e.target.closest("[data-project-id]");
		if (!card) return;
		var id = card.getAttribute("data-project-id");
		selectProject(id)
	});
	async function saveCompleted(id, { completed_on, completed_by } = {}) {
		var response = await frappe.xcall("zoulway.api.update_task_completion", {
			task_id: id,
			completed_on: completed_on || undefined,
			completed_by: completed_by || undefined
		})
		var out = ""
		if (completed_on) {
			out = response.completed_on
		}
		else {
			out = response.completed_by
		}
		return out
	}
	async function getProjPerc(id) {
		var response = await frappe.xcall("zoulway.api.get_project_percent_by_task", {
			task_id: id,
		})
		return response.percent_complete;
	}


	document.getElementById("d-tasks").addEventListener("click", function (e) {
		if (e.target.closest("[data-disabled='true']")) {
			return;
		}
		togglePin = e.target.closest("[data-act='togglepin'")
		if (togglePin) {
			var doctype = togglePin.getAttribute("data-doc");
			var id = togglePin.getAttribute("data-id");
			var map = doctype === "Project" ? projectsById : (doctype === "Task") ? tasksById : todosById;
			var item = map.get(id)
			console.log(item);
			if (!item) return;
			var wasPinned = item.pinned;
			item.pinned = !wasPinned;
			if (doctype === "Project") showFilteredProjects();
			if (doctype === "Task") showFilteredTasks();
			if (doctype === "ToDo") showToDosForSelectedTasks();
			frappe.xcall("zoulway.api.toggle_pin", { doctype: doctype, id: id }).then(function () {
			}).catch(function (err) {
				item.pinned = wasPinned;
				if (doctype === "Project") showFilteredProjects();
				if (doctype === "Task") showFilteredTasks();
				if (doctype === "ToDo") showToDosForSelectedTasks();
				frappe.msgprint("Could not update pin: " + (err.message || "unknown error"));
			});
			return;
		}
		var changelead = e.target.closest("[data-act='changelead']");
		if (changelead) {
			// var id = changelead.getAttribute("data-id");
			state.menu.mode = "changelead"
			var id = changelead.getAttribute("data-id")
			loadOptions("", id).then(function () { showFilteredTasks(); })
			return;
		}
		var setlead = e.target.closest("[data-act='assign']");
		if (setlead) {
			var id = setlead.getAttribute("data-id");
			var newlead = setlead.getAttribute("data-value");
			frappe.xcall("zoulway.api.set_lead", { task: id, lead: newlead }).then(
				function () {
					var task = tasksById.get(id);
					if (!task) return;
					task.lead = newlead;
					state.menu = null;
					showFilteredTasks();
					return;
				})
		}

		var savecompletedby = e.target.closest("[data-act='savecompletedby']");
		if (savecompletedby) {
			var id = savecompletedby.getAttribute("data-id");
			var value = savecompletedby.getAttribute("data-value");
			saveCompleted(id, { "completed_by": value }).then(function (cby) {
				var task = tasksById.get(id);
				if (!task) return;
				task.completed_by = cby;
				state.menu = null;
				showFilteredTasks();
			}).catch(function (err) {
				frappe.msgprint("Could not update completed date: " + (err.message || "unknown error"));
			})
			return;

		}
		var deletedoc = e.target.closest("[data-act='deletedoc']")
		if (deletedoc) {
			var doc = deletedoc.getAttribute("data-doc");
			var id = deletedoc.getAttribute("data-id");
			frappe.confirm('Are you sure you want to proceed?',
				() => {
					deleteDoc(doc, id).then(function (res) {
						testTasks = testTasks.filter(function (p) {
							return p.id !== id;
						})
						tasksById.delete(id);
						if (state.selectedTask === id) {
							state.selectedTask = null;
						}
						showFilteredTasks();
						frappe.msgprint({
							title: __('Notification'),
							indicator: 'green',
							message: __(`${doc} Document deleted successfully`)
						});
					}).catch((function (err) {
						frappe.msgprint("Could not delete task: " + (err.message || "unknown error"));
					}))
				}, () => {
					// action to perform if No is selected
				})
			return;

		}
		var setcompletedby = e.target.closest("[data-act='setcompletedby']")
		if (setcompletedby) {
			var id = setcompletedby.getAttribute("data-id");
			var task = tasksById.get(id);
			if (!task) return;
			state.menu = { id: id, mode: "changecompletedby" };
			showFilteredTasks();
			return;

		}
		var savecompleted = e.target.closest("[data-act='savecompleted']")
		if (savecompleted) {
			var id = savecompleted.getAttribute("data-id")
			var task = tasksById.get(id);
			if (!task) return;
			state.menu = null;
			saveCompleted(id, { "completed_on": state.completedOn }).then(function (cdate) {
				task.completed_on = cdate;
				state.menu = null;
				state.completedOn = null;
				showFilteredTasks();
				getProjPerc(id).then(function (percent_complete) {
					var task = tasksById.get(id)
					var project = projectsById.get(task.project)
					project.percent_complete = percent_complete;
					state.menu = null;
					showFilteredProjects();
				})
			}).catch(function (err) {
				frappe.msgprint("Could not update completed date: " + (err.message || "unknown error"))

			})
			return;
		}
		var setcompletedon = e.target.closest("[data-act='setcompletedon']")
		if (setcompletedon) {
			var id = setcompletedon.getAttribute("data-id")
			var task = tasksById.get(id)
			if (!task) return;
			state.menu = { id: id, mode: "changecompletedon" };
			state.completedOn = task.completed_on || null;
			showFilteredTasks();
			requestAnimationFrame(function () {
				initDueDatePicker(task, "completed_on");
			});
			return;
		}
		var savedueDate = e.target.closest("[data-act='savedue']");
		if (savedueDate) {
			if (!selectedDueDate) {
				state.menu = null;
				loadProjects();
				showFilteredProjects();
				return
			};
			var id = savedueDate.getAttribute("data-id")
			saveDueDate("Task", id, selectedDueDate).then(function (newdate) {
				var task = tasksById.get(id)
				if (task) task.due = newdate
				state.menu = null;
				selectedDueDate = "";
				showFilteredTasks();
			}).catch(function (err) {
				frappe.msgprint("Could not update due date: " + (err.message || "unknown error"))
			})
			return;
		}
		if (e.target.id === "due-date-input" || e.target.closest(".flatpickr-calendar")) {
			return;
		}
		var gotodue = e.target.closest("[data-act='gotodue']")
		if (gotodue) {
			var id = gotodue.getAttribute("data-id");
			var task = tasksById.get(id);
			if (!task) return;
			state.menu.mode = "changedue"
			showFilteredTasks();
			requestAnimationFrame(function () {
				initDueDatePicker(task, "due_date");
			});
			return;

		}

		var react = e.target.closest("[data-act='react']");
		var card = e.target.closest("[data-task-id]");
		if (!card) return;
		var id = card.getAttribute("data-task-id");
		if (react) {
			var id = react.getAttribute("data-id");
			var key = react.getAttribute("data-key");
			var doctype = "Task";
			frappe.xcall("zoulway.api.toggle_reaction", { doctype: doctype, name: id, reaction_type: key })
				.then(function (reactions) {
					var item = tasksById.get(id)
					item.reactions = reactions;
					showFilteredTasks();
					return;
				})
				.catch(function (err) {
					frappe.msgprint({
						title: __("Error"),
						message: __("Could not update reaction. Please try again."),
						indicator: "red"
					});
				});
		}
		var sendAct = e.target.closest("[data-act='sendslackdm'],[data-act='sendslackchannel'],[data-act='sendwhatsapp']");
		if (sendAct) {
			var channelMap = {
				"sendslackdm": "slack_dm",
				"sendslackchannel": "slack_channel",
				"sendwhatsapp": "whatsapp"
			}

			var act = sendAct.getAttribute("data-act");
			var doc = sendAct.getAttribute("data-doc");
			state.menu = null;
			showFilteredTasks();
			var act = sendAct.getAttribute("data-act");
			var doctype = sendAct.getAttribute("data-doc");
			var recordId = sendAct.getAttribute("data-id");
			var modeMap = { slack_dm: "dm", slack_channel: "slack_channel", whatsapp: "whatsapp" };
			state.sendPopupOpen = { mode: modeMap[channelMap[act]], channel: channelMap[act], doc: doctype, id: recordId }
			renderSendPopup();
			return;

		}
		var newtodo = e.target.closest("[data-act='newtodo']");

		if (newtodo) {
			task_id = newtodo.getAttribute("data-id");
			var slackId = ""
			var task = tasksById.get(task_id);
			if (task && task.slack_channel_id) {
				slackId = task.slack_channel_id;
			}
			frappe.new_doc("ToDo", { reference_type: "Task", reference_name: task_id, slack_channel_id: slackId, assigned_by: currentUser, allocated_to: currentUser, }, (quick_entry) => {
				if (!quick_entry || !quick_entry.dialog) {
					return
				}
				const dialog = quick_entry.dialog;
				dialog.set_primary_action(__('Save'), () => {
					const values = dialog.get_values(true); // true = validate

					frappe.call({
						method: "frappe.client.insert",
						args: {
							doc: {
								doctype: "ToDo",
								reference_type: "Task",
								reference_name: task_id,
								slack_channel_id: slackId,
								allocated_to: currentUser,
								assigned_by: currentUser,
								...values
							}
						},
						callback(r) {
							if (!r.exc) {
								frappe.msgprint(__("ToDo Successfully created"));
								// Optional: refresh your page data here
								// e.g. load_projects_table(page);
							}
							// Important: just hide the dialog, no redirect
							dialog.hide();
						}
					});
				});

			});
			return
		};
		var details = e.target.closest("[data-act='details']");
		if (details) {
			id = details.getAttribute("data-id");
			state.drawer = { id: id, type: "Task" }
			state.menu = null;
			renderDrawer();
			showFilteredTasks();
			return;
		}

		var copylink = e.target.closest("[data-act='copylink']")
		if (copylink) {
			var doc = copylink.getAttribute("data-doc");
			var id = copylink.getAttribute("data-id");
			getCopyUrl(doc, id).then(function (url) {
				navigator.clipboard.writeText(url).then(function () {
					frappe.show_alert({ message: "Link copied to clipboard", indicator: "green" }, 3);
				})
			});
			return;

		}
		var dots = e.target.closest("[data-act='dots']")
		if (dots) {
			var id = dots.getAttribute("data-id");
			state.menu = (state.menu && state.menu.id === id) ? null : { id: id, mode: null };
			showFilteredTasks();
			return;
		}
		var close = e.target.closest("[data-act='close']");
		if (close) {
			state.menu = null;
			showFilteredTasks();
			return;
		}
		var gotostatus = e.target.closest("[data-act='gotostatus']")
		if (gotostatus) {
			state.menu.mode = "status";
			showFilteredTasks();
			return;
		}
		var opt = e.target.closest("[data-act='setstatus']");
		if (opt) {
			id = opt.getAttribute("data-id");
			newstatus = opt.getAttribute("data-value");
			frappe.xcall("zoulway.api.set_status", { doctype: "Task", name: id, status: newstatus }).then(
				function () {
					var task = tasksById.get(id)
					if (!task) return;
					task.status = newstatus;
					state.menu = null;
					showFilteredTasks();
				})
				.catch(function (err) {
					frappe.msgprint({
						title: __("Error"),
						message: __("Could not update task status. Please try again."),
						indicator: "red"
					});
				});
		}
		var changediv = e.target.closest("[data-act='gotodivision']");
		if (changediv) {
			state.menu.mode = "changediv";
			showFilteredTasks();
			return;
		}
		var setdiv = e.target.closest("[data-act='setdiv']");
		if (setdiv) {
			id = setdiv.getAttribute("data-id");
			newdiv = setdiv.getAttribute("data-value");
			frappe.xcall("zoulway.api.set_division", { task: id, division: newdiv }).then(function () {
				var task = tasksById.get(id)
				if (!task) return;
				task.div = newdiv;
				state.menu = null;
				showFilteredTasks();
			})
				.catch(function (err) {
					frappe.msgprint({
						title: __("Error"),
						message: __("Could not update division for this task. Please try again."),
						indicator: "red"
					});
				});
		};
		var changeurg = e.target.closest("[data-act='gotourgency']");
		if (changeurg) {
			state.menu.mode = "changeurg";
			showFilteredTasks();
			return;
		};

		var seturg = e.target.closest("[data-act='seturg']");
		if (seturg) {
			id = seturg.getAttribute("data-id");
			newurg = seturg.getAttribute("data-value");
			frappe.xcall("zoulway.api.set_urgency", { doctype: "Task", name: id, urgency: newurg }).then(
				function () {
					var task = tasksById.get(id)
					if (!task) return;
					task.urgency = newurg;
					state.menu = null;
					showFilteredTasks();
				})
				.catch(function (err) {
					frappe.msgprint({
						title: __("Error"),
						message: __("Could not update urgency for this task. Please try again."),
						indicator: "red"
					});
				});
		};
		var info = e.target.closest("[data-act='opendrawer']");
		if (info) {
			var id = info.getAttribute("data-id");
			var type = info.getAttribute("data-type");
			state.drawer = (state.drawer && state.drawer.id === id) ? null : { id: id, type: type };
			renderDrawer();
			return;
		}
		selectTask(id)
	});
	document.getElementById("d-todos").addEventListener("click", function (e) {
		if (e.target.closest("[data-disabled='true']")) {
			return;
		}
		togglePin = e.target.closest("[data-act='togglepin'")
		if (togglePin) {
			var doctype = togglePin.getAttribute("data-doc");
			var id = togglePin.getAttribute("data-id");
			var map = doctype === "Project" ? projectsById : (doctype === "Task") ? tasksById : todosById;
			var item = map.get(id)
			console.log(item);
			if (!item) return;
			var wasPinned = item.pinned;
			item.pinned = !wasPinned;
			if (doctype === "Project") showFilteredProjects();
			if (doctype === "Task") showFilteredTasks();
			if (doctype === "ToDo") showToDosForSelectedTasks();
			frappe.xcall("zoulway.api.toggle_pin", { doctype: doctype, id: id }).then(function () {
			}).catch(function (err) {
				item.pinned = wasPinned;
				if (doctype === "Project") showFilteredProjects();
				if (doctype === "Task") showFilteredTasks();
				if (doctype === "ToDo") showToDosForSelectedTasks();
				frappe.msgprint("Could not update pin: " + (err.message || "unknown error"));
			});
			return;
		}
		var deletedoc = e.target.closest("[data-act='deletedoc']")
		if (deletedoc) {
			var doc = deletedoc.getAttribute("data-doc");
			var id = deletedoc.getAttribute("data-id");
			frappe.confirm('Are you sure you want to proceed?',
				() => {
					deleteDoc(doc, id).then(function (res) {
						testTodos = testTodos.filter(function (p) {
							return p.id !== id;
						})
						todosById.delete(id);
						if (state.selectToDo === id) {
							state.selectToDo = null;
						}
						frappe.msgprint({
							title: __('Notification'),
							indicator: 'green',
							message: __(`${doc} Document deleted successfully`)
						});
						showToDosForSelectedTasks();
					}).catch((function (err) {
						frappe.msgprint("Could not delete task: " + (err.message || "unknown error"));
					}))
				}, () => {
					// action to perform if No is selected
				})
			return;
		}
		var savedue = e.target.closest("[data-act='savedue']")
		if (savedue) {
			if (!selectedDueDate) {
				state.menu = null;
				loadProjects();
				showFilteredProjects();
				return
			};
			var id = savedue.getAttribute("data-id");
			saveDueDate("ToDo", id, selectedDueDate).then(function (newdate) {
				var todo = todosById.get(id)
				if (todo) todo.due = newdate
				state.menu = null;
				selectedDueDate = "";
				showToDosForSelectedTasks();

			}).catch(function (err) {
				frappe.msgprint("Could not update due date: " + (err.message || "unknown error"))
			})
			return;
		}
		var gotodue = e.target.closest("[data-act='gotodue']");
		if (gotodue) {
			var id = gotodue.getAttribute("data-id");
			var todo = todosById.get(id);
			if (!todo) return;
			state.menu = { id: id, mode: "changedue" }
			showToDosForSelectedTasks();
			requestAnimationFrame(function () {
				initDueDatePicker(todo, "due_date");
			});
			return;
		}
		var react = e.target.closest("[data-act='react']");
		var card = e.target.closest("[data-todo-id]");
		if (!card) return;
		var id = card.getAttribute("data-todo-id");
		if (react) {
			var id = react.getAttribute("data-id");
			var key = react.getAttribute("data-key");
			var doctype = "ToDo";
			frappe.xcall("zoulway.api.toggle_reaction", { doctype: doctype, name: id, reaction_type: key })
				.then(function (reactions) {
					var item = todosById.get(id)
					if (!item) return;
					item.reactions = reactions;
					showToDosForSelectedTasks();
				})
				.catch(function (err) {
					console.error("Failed to toggle reaction:", err);
					frappe.msgprint({
						title: __("Error"),
						message: __("Could not update reaction. Please try again."),
						indicator: "red"
					});
				});
		}
		var dots = e.target.closest("[data-act='dots']")
		if (dots) {
			var id = dots.getAttribute("data-id");
			state.selectToDo = id
			state.menu = (state.menu && state.menu.id === id) ? null : { id: id, mode: null };
			showToDosForSelectedTasks();
			return;
		};
		var changeurg = e.target.closest("[data-act='gotourgency']");
		if (changeurg) {
			var id = changeurg.getAttribute("data-id")
			state.menu = { id: id, mode: "changeurg" }
			showToDosForSelectedTasks();
			return;
		}
		var details = e.target.closest("[data-act='details']");
		if (details) {
			id = details.getAttribute("data-id");
			state.drawer = { id: id, type: "ToDo" }
			state.menu = null;
			renderDrawer();
			showFilteredTasks();
			return;
		}
		var assignto = e.target.closest("[data-act='assignto']");
		if (assignto) {
			var id = assignto.getAttribute("data-id");
			state.menu.mode = "assignto";
			loadOptions("", id).then(function () { showToDosForSelectedTasks(); });
			return;
		}
		var copylink = e.target.closest("[data-act='copylink']")
		if (copylink) {
			var doc = copylink.getAttribute("data-doc");
			var id = copylink.getAttribute("data-id");
			getCopyUrl(doc, id).then(function (url) {
				navigator.clipboard.writeText(url).then(function () {
					frappe.show_alert({ message: "Link copied to clipboard", indicator: "green" }, 3);
				})
			});
			return;

		}

		var setassign = e.target.closest("[data-act='assign']");
		if (setassign) {
			id = setassign.getAttribute("data-id");
			assignto_value = setassign.getAttribute("data-value");
			frappe.xcall("zoulway.api.assign_todo", { todo: id, user: assignto_value }).then(function () {
				var todo = todosById.get(id)
				if (!todo) return;
				todo.who = assignto_value;
				state.menu = null;
				showToDosForSelectedTasks();
			})
				.catch(function (err) {
					frappe.msgprint({
						title: __("Error"),
						message: __("Could not assign this to-do. Please try again."),
						indicator: "red"
					});
				});

		}
		var seturg = e.target.closest("[data-act='seturg']");
		if (seturg) {
			id = seturg.getAttribute("data-id");
			neurg = seturg.getAttribute("data-value");
			frappe.xcall("zoulway.api.set_urgency", { urgency: neurg, name: id, doctype: "ToDo" }).then(function () {
				var todo = todosById.get(id)
				if (!todo) return;
				todo.urgency = neurg;
				state.menu = null;
				showToDosForSelectedTasks();
			})
				.catch(function (err) {
					console.error("Failed to set urgency:", err);
					frappe.msgprint({
						title: __("Error"),
						message: __("Could not update urgency for this to-do. Please try again."),
						indicator: "red"
					});
				});

		}

		var close = e.target.closest("[data-act='close']");
		if (close) {
			state.menu = null;
			showToDosForSelectedTasks();
			return;
		}
		var gotostatus = e.target.closest("[data-act='gotostatus']")
		if (gotostatus) {
			state.menu.mode = "status";
			showToDosForSelectedTasks();
			return;
		}
		var opt = e.target.closest("[data-act='setstatus']");
		if (opt) {
			id = opt.getAttribute("data-id");
			newstatus = opt.getAttribute("data-value");
			frappe.xcall("zoulway.api.set_status", { doctype: "ToDo", name: id, status: newstatus }).then(
				function () {
					var todo = todosById.get(id)
					if (!todo) return;
					todo.status = newstatus;
					state.menu = null;
					showToDosForSelectedTasks();
				})
				.catch(function (err) {
					console.error("Failed to set status:", err);
					frappe.msgprint({
						title: __("Error"),
						message: __("Could not update to-do status. Please try again."),
						indicator: "red"
					});
				});

		};
		var sendAct = e.target.closest("[data-act='sendslackdm'],[data-act='sendslackchannel'],[data-act='sendwhatsapp']");
		if (sendAct) {
			var channelMap = {
				"sendslackdm": "slack_dm",
				"sendslackchannel": "slack_channel",
				"sendwhatsapp": "whatsapp"
			}

			var act = sendAct.getAttribute("data-act");
			var doc = sendAct.getAttribute("data-doc");
			state.menu = null;
			showToDosForSelectedTasks();
			var act = sendAct.getAttribute("data-act");
			var doctype = sendAct.getAttribute("data-doc");
			var recordId = sendAct.getAttribute("data-id");
			var modeMap = { slack_dm: "dm", slack_channel: "slack_channel", whatsapp: "whatsapp" };
			state.sendPopupOpen = { mode: modeMap[channelMap[act]], channel: channelMap[act], doc: doctype, id: recordId }
			renderSendPopup();
			return;

		}

		var info = e.target.closest("[data-act='opendrawer']");
		if (info) {
			var id = info.getAttribute("data-id");
			var type = info.getAttribute("data-type");
			state.drawer = (state.drawer && state.drawer.id === id) ? null : { id: id, type: type };
			renderDrawer();
			return;
		}
		selectToDo(id)
	});
	document.addEventListener("click", function (e) {
		if (state.menu != null && !e.target.closest(".d-menu") && !e.target.closest("[data-act='setcompletedby']") && !e.target.closest("[data-act='setcompletedon']") && !e.target.closest("[data-act='gotodue']") && !e.target.closest("[data-act='dots']")) {
			state.menu = null;
			showFilteredProjects();
			showFilteredTasks();
			showToDosForSelectedTasks();
		};
		if (state.drawer != null && !e.target.closest("#drawer") && !e.target.closest("[data-act='closedrawer']") && !e.target.closest("[data-act='opendrawer']") && !e.target.closest("[data-act='details']")) {
			state.drawer = null;
			renderDrawer();
		}
		if (state.add != false && !e.target.closest("#btn-add") && !e.target.closest("#add-menu")) {
			state.add = false;
			renderAddMenu();
		}
		if (state.emergencyPanelOpen != false && !e.target.closest("#emergency-panel") && !e.target.closest("#btn-emergency") && !e.target.closest("#close-emergency-panel")) {
			state.emergencyPanelOpen = false;
			renderEmergencyPanel();
		}
		if (state.notifyPanelOpen != false && !e.target.closest("#notification-panel") && !e.target.closest("#btn-notif") && !e.target.closest("#close-notify-panel")) {
			state.notifyPanelOpen = false;
			renderNotifyPanel();
		}
		if (state.colFilterOpen != null && !e.target.closest("[id^='colfilter-']") && !e.target.closest("[data-act='colfilter']")) {
			var openCol = state.colFilterOpen
			state.colFilterOpen = null;
			state.colFilterField = null;
			renderColFilter(openCol);
		}
		if (!e.target.closest("[id ='f-person-trigger']") && !e.target.closest("[id='f-person-panel']")) {
			if (state.personPanelOpen) {
				state.personPanelOpen = false;
				renderPersonFilter();
			}
		}
		if (!e.target.closest("[id ='f-sort-trigger']") && !e.target.closest("[id='f-sort-panel']")) {
			if (state.sortPanelOpen) {
				state.sortPanelOpen = false;
				document.getElementById("f-sort-panel").style.display = "none"
				return;
			}
		}
		if (!e.target.closest("[id ='f-urgency-trigger']") && !e.target.closest("[id='f-urgency-panel']")) {
			if (state.urgencuFilterPanelOpen) {
				state.urgencuFilterPanelOpen = null;
				document.getElementById("f-urgency-panel").style.display = "none"
				return;
			}
		}
		var filterPanel = document.getElementById("rb-filter-panel");
		if (filterPanel && filterPanel.style.display === "block" && !e.target.closest("#rb-filter-panel") && !e.target.closest("#rb-filter-btn")) {
			filterPanel.style.display = "none";
			return;
		}

	});
	document.getElementById("report-view").addEventListener("click", function (e) {
		var filterbtn = e.target.closest("#rb-filter-btn");
		if (filterbtn) {
			var panel = document.getElementById("rb-filter-panel");
			if (panel.style.display === "block") { panel.style.display = "none"; return; }
			var doctypes = Array.from(new Set(allReports.map(function (r) { return r.ref_doctype; }).filter(Boolean)));
			panel.innerHTML = `
			<div class="rb-filter-search">
				${frappe.utils.icon("search", "xs")}
			<input id="rb-filter-search-input" placeholder="Search" />
			</div>
			<div class="rb-filter-options" id="rb-filter-options">
          <div class="filter-opt ${reportDoctypeFilter === "" ? "on" : ""}" data-doctype="">Any</div>
          ${doctypes.map(function (d) {
				return `<div class="filter-opt ${reportDoctypeFilter === d ? "on" : ""}" data-doctype="${d}">${d}</div>`;
			}).join("")}
		</div>
        `;
			panel.style.display = "block";
			return;
		}
		var row = e.target.closest("[data-report]");
		if (row) {
			var reportName = row.getAttribute("data-report");
			if (reportName) {
				frappe.set_route('query-report', reportName);
				return;
			}
		}
		var filterOpt = e.target.closest("[data-doctype]")
		if (filterOpt) {
			console.log("Here")
			reportDoctypeFilter = filterOpt.getAttribute("data-doctype");
			applyReportFilters();
			document.getElementById("rb-filter-panel").style.display = "none"
		}

	});
	document.getElementById("colfilter-projects").addEventListener("input", function (e) {
		if (e.target && e.target.id === "rb-filter-search-input") {
			var q = e.target.value.toLowerCase();
			document.querySelectorAll("#rb-filter-options .filter-opt").forEach(function (opt) {
				var text = opt.textContent.toLowerCase();
				opt.style.display = text.includes(q) ? "" : "none";
			})

		}
	});
	document.getElementById("colfilter-tasks").addEventListener("input", function (e) {
		if (e.target && e.target.id === "rb-filter-search-input") {
			var q = e.target.value.toLowerCase();
			document.querySelectorAll("#rb-filter-options .filter-opt").forEach(function (opt) {
				var text = opt.textContent.toLowerCase();
				opt.style.display = text.includes(q) ? "" : "none";
			})

		}
	});
	document.getElementById("colfilter-todos").addEventListener("input", function (e) {
		if (e.target && e.target.id === "rb-filter-search-input") {
			var q = e.target.value.toLowerCase();
			document.querySelectorAll("#rb-filter-options .filter-opt").forEach(function (opt) {
				var text = opt.textContent.toLowerCase();
				opt.style.display = text.includes(q) ? "" : "none";
			})

		}
	});
	document.getElementById("f-person").addEventListener("input", function (e) {

		// if (e.target && e.target.id === "rb-search-input") {
		// 	runReportSearch(e.target.value)
		// }
		if (e.target && e.target.id === "rb-filter-search-input") {
			var q = e.target.value.toLowerCase();
			document.querySelectorAll("#rb-filter-options .filter-opt").forEach(function (opt) {
				var text = opt.textContent.toLowerCase();
				opt.style.display = text.includes(q) ? "" : "none";
			})

		}
	});

	document.getElementById("report-view").addEventListener("input", function (e) {

		if (e.target && e.target.id === "rb-search-input") {
			runReportSearch(e.target.value)
		}
		if (e.target && e.target.id === "rb-filter-search-input") {
			var q = e.target.value.toLowerCase();
			document.querySelectorAll("#rb-filter-options .filter-opt").forEach(function (opt) {
				var text = opt.textContent.toLowerCase();
				opt.style.display = text.includes(q) ? "" : "none";
			})

		}
	});
	document.getElementById("f-name").addEventListener("input", function (e) {
		runSearchFilter(e.target.value);
	});
	var sorts = [{ label: "% complete", field: "pct" }, { label: "Name", field: "name" }]
	function renderSortFilters() {
		var el = document.getElementById("f-sort");
		if (!el) return;
		el.innerHTML = `
			<div id="f-sort-trigger" style="height:34px; width:160px; padding:0 10px; border:0.5px solid var(--border-strong); border-radius:var(--radius); background:var(--surface-2); display:flex; align-items:center; justify-content:space-between; gap:6px; cursor:pointer; white-space:nowrap; overflow:hidden;">
				<span style="overflow:hidden; text-overflow:ellipsis;">${state.sortFilter || "Sort: default"}</span>
				<span style="flex:none; display:inline-flex;">${frappe.utils.icon("chevron-down", "xs")}</span>
			</div>
			<div id="f-sort-panel" class="rb-filter-panel" style="display:none; top:38px; left:0;">
			<div class="rb-filter-options" id="rb-filter-options">
					${sorts.map(function (f) {
			return `<div class="filter-opt ${state.sortFilter === f.field ? "on" : ""}" data-act="setsort" data-field="${f.field}">
					<span>${f.label}</span>
					</div>`;
		}).join("")}
			</div>
			</div>

		`

	}
	document.getElementById("f-urgency").addEventListener("click", function (e) {
		var trigger = e.target.closest("#f-urgency-trigger");
		if (trigger) {
			state.urgencuFilterPanelOpen = !state.urgencuFilterPanelOpen;
			document.getElementById("f-urgency-panel").style.display = state.urgencuFilterPanelOpen ? "block" : "none";
			return;
		}
		var setUrgFilter = e.target.closest("[data-act='seturg']")
		if (setUrgFilter) {
			state.urgencyFilter = setUrgFilter.getAttribute("data-field");
			state.urgencuFilterPanelOpen = false;
			renderUrgOptions();
			showFilteredTasks()
			showToDosForSelectedTasks()
			return;
		}
	});
	document.getElementById("f-urgency").addEventListener("input", function (e) {
		if (e.target && e.target.id === "rb-filter-search-input") {
			var q = e.target.value.toLowerCase();
			document.querySelectorAll("#rb-filter-options .filter-opt").forEach(function (opt) {
				var text = opt.textContent.toLowerCase();
				opt.style.display = text.includes(q) ? "" : "none";
			})

		}
	});
	// document.getElementById("f-urgency").addEventListener("change", function (e) {
	// 	state.urgencyFilter = e.target.value;
	// 	showFilteredTasks()
	// 	showToDosForSelectedTasks()
	// });
	document.getElementById("f-person").addEventListener("click", function (e) {
		var trigger = e.target.closest("#f-person-trigger");
		if (trigger) {
			state.personPanelOpen = !state.personPanelOpen;
			document.getElementById("f-person-panel").style.display = state.personPanelOpen ? "block" : "none"
			return;
		}
		var setPersonFilter = e.target.closest("[data-act='setpersonfilter']");
		if (setPersonFilter) {
			state.personFilter = setPersonFilter.getAttribute("data-value")
			state.personPanelOpen = false;
			renderPersonFilter();
			showFilteredProjects();
			showFilteredTasks();
			showToDosForSelectedTasks();
			return;
		}
	});
	function renderPersonFilter() {
		var el = document.getElementById("f-person");
		if (!el) return;
		el.innerHTML = `
        <div id="f-person-trigger" style="height:34px; width:160px; padding:0 10px; border:0.5px solid var(--border-strong); border-radius:var(--radius); background:var(--surface-2); display:flex; align-items:center; justify-content:space-between; gap:6px; cursor:pointer; white-space:nowrap; overflow:hidden;">
            <span style="overflow:hidden; text-overflow:ellipsis;">${state.personFilter || "Any person"}</span>
            <span style="flex:none; display:inline-flex;">${frappe.utils.icon("chevron-down", "xs")}</span>
        </div>
        <div id="f-person-panel" class="rb-filter-panel" style="display:none; top:38px; left:0;">
					<div class="rb-filter-search">
				${frappe.utils.icon("search", "xs")}
			<input id="rb-filter-search-input" placeholder="Search" />
			</div>
            <div class="rb-filter-options" id="rb-filter-options">
                <div class="filter-opt ${state.personFilter === "" ? "on" : ""}" data-act="setpersonfilter" data-value="">Any</div>
                ${TaskLeadOptions.map(function (u) {
			return `<div class="filter-opt ${state.personFilter === u ? "on" : ""}" data-act="setpersonfilter" data-value="${u}">${u}</div>`;
		}).join("")}
            </div>
        </div>
    `;
	}
	// document.getElementById("f-min").addEventListener("input", function (e) {
	// 	var num = Number(e.target.value);
	// 	state.minPct = isNaN(num) ? 0 : num;
	// 	showFilteredProjects();
	// 	showFilteredTasks();
	// });
	// document.getElementById("f-max").addEventListener("input", function (e) {
	// 	var num = Number(e.target.value);
	// 	state.maxPct = isNaN(num) ? 100 : num;
	// 	showFilteredProjects();
	// 	showFilteredTasks();
	// });
	document.getElementById("f-mine").addEventListener("click", function (e) {
		state.mineOnly = !state.mineOnly;
		e.target.textContent = state.mineOnly ? "✓ My work" : "My work";
		// state.selectedProject = null;
		// state.selectedTask = null;
		// state.selectToDo = null;

		showFilteredProjects();
		showFilteredTasks();
		showToDosForSelectedTasks();

	});
	document.getElementById("f-sort").addEventListener("click", function (e) {
		var trigger = e.target.closest("#f-sort-trigger");
		if (trigger) {
			state.sortPanelOpen = !state.sortPanelOpen;
			document.getElementById("f-sort-panel").style.display = state.sortPanelOpen ? "block" : "none";
			return;
		}
		var setsort = e.target.closest("[data-act='setsort']")
		if (setsort) {
			sortvalue = setsort.getAttribute("data-field")
			state.sortFilter = sortvalue;
			state.sortPanelOpen = false;
			renderSortFilters();
			showFilteredProjects();
			showFilteredTasks();
			showToDosForSelectedTasks();
			return;
		}

	});
	document.getElementById("f-clear").addEventListener("click", function (e) {
		state.namedFilter = "";
		state.personFilter = "";
		state.mineOnly = false;
		state.sortFilter = "";
		state.urgencyFilter = "";
		state.taskDivFilter = "";
		state.taskLeadFilter = "";
		state.projectStatusFilter = "";
		// f-clear handler
		document.getElementById("f-name").value = "";
		document.getElementById("f-mine").textContent = "My work";
		renderUrgOptions();
		renderSortFilters();
		showFilteredProjects();
		showFilteredTasks();
		showToDosForSelectedTasks();
		renderPersonFilter();

	});
	function renderActivityEntry(entry) {
		return `
		<div class="dw-act">
		<div class="dw-dot">•</div>
		<div>
		<div class="d-meta">${summarizeActivityEntry(entry)}</div>
		<div>
		<div class="d-meta">${entry.owner} · ${fmtDate(entry.creation)}</div>
		</div>
		</div>
		</div>
			`;
	}
	function renderActivityList(activity) {
		if (!activity || !activity.length) return "<div style='color:gray'>No activity yet.</div>"
		return activity.map(renderActivityEntry).join("")

	}
	function renderAttachments(attachments, canWrite) {
		var list;
		var disabledAttr = canWrite ? "" : ` data-disabled='true'`;
		var disabledClass = canWrite ? "" : ` d-act-disabled`;
		if (!attachments || attachments.length === 0) {
			list = `<div class="d-meta">None yet.</div>`;
		} else {
			list = attachments.map(function (a) {
				return `<div class="dw-file"><div>${frappe.utils.icon("paperclip", "xs")}</div> ${a.file_name}</div>`;
			}).join("");
		}

		return `<div id="attachments-list">${list}</div>` + `
    <input type="file" id="attachment-input" multiple style="display:none"${canWrite ? "" : "disabled"} />
    <button class="d-info" data-act="addattachment" style="width:auto; padding:6px 12px; gap:6px; margin-top:8px"${canWrite ? "" : "disabled"}>
      ${frappe.utils.icon("paperclip", "sm")} Add attachment
    </button>
  `;
	}
	function renderWorkNotes(notes, canWrite) {
		var list = (!notes || notes.length === 0)
			? `<div class="d-meta" > No comments yet.</div> `
			: notes.map(function (n) {
				return `<div class="dw-act" ><div class="dw-dot">•</div><div><div>${n.content}</div>
				<div class="d-meta">${n.comment_email}</div></div></div> `;
			}).join("");

		return list + `
			<div style = "display:flex; gap:6px; margin-top:8px" >
      <input id="drawer-note-input" placeholder="Add a work note..." style="flex:1"${canWrite ? "" : "disabled"}/>
      <button class="d-info" data-act="addnote"${canWrite ? "" : "disabled"}>${frappe.utils.icon("send", "sm")}</button>
    </div>
			`;
	}

	function renderDrawer() {
		var el = document.getElementById("drawer");
		if (!state.drawer) {
			el.style.display = "none";
			return;
		}
		el.style.display = "block";
		if (state.drawer.type === "Project") {
			var project = projectsById.get(state.drawer.id);
			if (!project) { state.drawer = null; el.style.display = "none"; return; }
			var canWrite = frappe.model.can_write("Project");
			el.innerHTML = `
			<div class="dw-sec" style = "display:flex; justify-content:space-between; align-items:center" >
		<div class="dw-lbl" style="margin-bottom:0;">${frappe.utils.icon("folder")} PROJECT</div>
			<button class="d-info" data-act="closedrawer">${frappe.utils.icon("close", "sm")}</button>
		</div>
		<div class="dw-sec">
			<h3 style="margin:0 0 4px">${project.name}</h3>
			<div class="d-meta"> ${project.client} · PM: ${renderLeads(project.pm)}· ${ppct(project)}%</div>
			<div style="margin-top:8px">
			<div class="d-meta" >${frappe.utils.icon("calendar-days")} ${fmtDate(project.due)} · ${dueChip("Project", project.due)}</div></div>
		</div>
		<div class="dw-sec">
			<div class="dw-lbl">Description</div>
			<textarea id="drawer-desc"${canWrite ? "" : "disabled"}> ${project.description || ""}</textarea>
		</div>
		<div class="dw-sec">
			<div class="dw-lbl">Attachments</div>
			${renderAttachments(project.attachments, canWrite)}
		</div>
		<div class="dw-sec">
			<div class="dw-lbl">Work Notes</div>
			${renderWorkNotes(project.comments, canWrite)}
		</div>
		<div class="dw-sec">
			<div class="dw-lbl">Activity log</div>
			${renderActivityList(project.activity)}
		</div>
		`}
		else if (state.drawer.type === "Task") {
			var task = tasksById.get(state.drawer.id);
			var canWrite = frappe.model.can_write("Task");
			if (!task) { state.drawer = null; el.style.display = "none"; return; }
			el.innerHTML = `
			<div class="dw-sec" style = "display:flex; justify-content:space-between; align-items:center" >
			<div class="dw-lbl" style="margin-bottom:0">${frappe.utils.icon("file")} TASK</div>
			<button class="d-info" data-act="closedrawer">${frappe.utils.icon("close", "sm")}</button>
		</div>
			<div class="dw-sec">
				<h3 style="margin:0 0 4px">${task.name}</h3>
				<div class="d-meta">${task.stage} · ${task.urgency}</div>
				<div>
					<div class="d-meta" style="display:flex; flex-wrap:wrap; gap:4px; align-items:center">
						${task.div} Assigned To: ${renderLeads(task.lead)}
					</div>
				</div>
				<div style="margin-top:8px">
					<div class="d-meta">${frappe.utils.icon("calendar-days")} ${fmtDate(task.due)} · ${dueChip("Task", task.due)} · ${task.status} · ${pct(task)}%</div>
					<div style="margin-top:4px">
						<div class="d-meta" style="color:var(--text-accent)">
							${task.creation ? `<div class="d-meta" style="color:var(--text-accent)">${frappe.utils.icon("clock", "xs")} ${task.status} since ${fmtDate(task.creation)}</div>` : ""}
						</div>
					</div>
				</div>
			</div>
		</div> 
		<div class="dw-sec">
			<div class="dw-lbl">Description</div>
			<textarea id="drawer-desc"${canWrite ? "" : "disabled"}>${task.description || ""}</textarea>
		</div>
		<div class="dw-sec">
			<div class="dw-lbl">Attachments</div>
			${renderAttachments(task.attachments, canWrite)}
		</div>
		<div class="dw-sec">
			<div class="dw-lbl">Work Notes</div>
			${renderWorkNotes(task.comments, canWrite)}
		</div>
		<div class="dw-sec">
			<div class="dw-lbl">Activity log</div>
			${renderActivityList(task.activity)}
		</div>
		`}
		else if (state.drawer.type === "ToDo") {
			var todo = todosById.get(state.drawer.id);
			var canWrite = frappe.model.can_write("ToDo");
			if (!todo) { state.drawer = null; el.style.display = "none"; return; }
			el.innerHTML = `
  <div class="dw-sec" style="display:flex; justify-content:space-between; align-items:center">
    <div class="dw-lbl" style="margin-bottom:0">${frappe.utils.icon("circle-check-big", "sm")} TO-DO</div>
    <button class="d-info" data-act="closedrawer">${frappe.utils.icon("close", "sm")}</button>
  </div>
  <div class="dw-sec">
    <h3 style="margin:0 0 4px">${todo.name}</h3>
    <div class="d-meta">${todo.status} · ${todo.urgency} · Assigned to: ${renderLeads(todo.who)}</div>
    <div style="margin-top:8px">
      <div class="d-meta">${frappe.utils.icon("calendar-days", "xs")} ${fmtDate(todo.due)} · ${dueChip("ToDo", todo.due)}</div>
    </div>
  </div>
  <div class="dw-sec">
    <div class="dw-lbl">Description</div>
    <textarea id="drawer-desc"${canWrite ? "" : "disabled"}>${todo.description || ""}</textarea>
  </div>
  <div class="dw-sec">
    <div class="dw-lbl">Attachments</div>
    ${renderAttachments(todo.attachments, canWrite)}
  </div>
  <div class="dw-sec">
    <div class="dw-lbl">Work Notes</div>
    ${renderWorkNotes(todo.comments, canWrite)}
  </div>
  <div class="dw-sec">
    <div class="dw-lbl">Activity log</div>
    ${renderActivityList(todo.activity)}
  </div>
`;
		}
	};
	document.getElementById("drawer").addEventListener("keydown", function (e) {
		if (e.target.id === "drawer-note-input" && e.key === "Enter") {
			e.preventDefault();
			document.querySelector("[data-act='addnote']").click();
		}
	});
	document.getElementById("drawer").addEventListener("click", function (e) {
		var closeDrawer = e.target.closest("[data-act='closedrawer']");
		if (closeDrawer) {
			state.drawer = null;
			renderDrawer();
		};
		var addWorkNote = e.target.closest("[data-act='addnote']");
		if (addWorkNote) {
			var value = document.getElementById("drawer-note-input").value;
			if (!value.trim()) return;
			var doctype = state.drawer.type;
			var name = state.drawer.id;
			frappe.xcall("zoulway.api.add_work_note",
				{
					doctype: doctype,
					name: name,
					text: value
				}).then(async function (f) {
					if (doctype === "Project") await loadProjects();
					if (doctype === "Task") await loadTasks(state.selectedProject);
					if (doctype === "ToDo") await loadTodos(state.selectedTask);
					renderDrawer();
				})
				.catch(function (err) {
					console.error("Failed to add work note:", err);
					frappe.msgprint({
						title: __("Error"),
						message: __("Could not add note. Please try again."),
						indicator: "red"
					});
				});
		}
		var addattachment = e.target.closest("[data-act='addattachment']")
		if (addattachment) {
			document.getElementById("attachment-input").click();
			return;
		}
	});
	async function uploadAttachment(doctype, id, files) {
		var formData = new FormData();
		formData.append("doctype", doctype);
		formData.append("name", id);
		files.forEach(function (file) {
			formData.append("files", file);
		});
		var response = await fetch('/api/method/zoulway.api.add_attachment', {
			method: 'POST',
			headers: { 'X-Frappe-CSRF-Token': frappe.csrf_token },
			body: formData,
		});
		if (!response.ok) {
			var friendlyMessage = "Upload failed";
			try {
				var errBody = await response.json();
				if (errBody._server_messages) {
					var messages = JSON.parse(errBody._server_messages);
					var firstMessage = JSON.parse(messages[0]);
					friendlyMessage = firstMessage.message;
				}
			} catch (e) {
				friendlyMessage = "Upload failed";
			}
			throw new Error(friendlyMessage);
		}

		var result = await response.json();
		return result.message;

	};
	document.getElementById("drawer").addEventListener("change", function (e) {
		if (e.target.id === "attachment-input" && e.target.files.length > 0) {
			var files = Array.from(e.target.files);
			var doctype = state.drawer.type;
			var id = state.drawer.id;
			var placeHolderHtml = files.map(function (f) {
				return `<div class="uploading-row">${frappe.utils.icon("upload", "xs")} Uploading ${f.name}...</div>`;
			}).join("");
			var listEl = document.getElementById("attachments-list");
			listEl.insertAdjacentHTML("beforeend", placeHolderHtml);
			uploadAttachment(doctype, id, files).then(async function (f) {
				if (doctype === "Project") await loadProjects();
				if (doctype === "Task") await loadTasks(state.selectedProject);
				if (doctype === "ToDo") await loadTodos(state.selectedTask);
				renderDrawer();
			}).catch(function (error) { frappe.msgprint("could not upload Attachment" + error) });
		};
	});
	document.getElementById("drawer").addEventListener("blur", function (e) {
		if (e.target.id === "drawer-desc") {
			var newDesc = e.target.value;
			var doctype = state.drawer.type;
			var id = state.drawer.id;
			frappe.xcall("zoulway.api.update_description",
				{ doctype: doctype, name: id, description: newDesc }
			).catch(function (err) {
				frappe.msgprint("Could not save description: " + err.message || "unknown error")
			});
		}
	}, true);


	function fmtDate(dueDateSting) {
		if (!dueDateSting) return "null";
		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var d = new Date(dueDateSting);
		return d.getDate() + " " + months[d.getMonth()];
	}
	function renderLeads(lead) {
		var names = Array.isArray(lead) ? lead : (lead ? String(lead).split(",") : []);
		names = names.map(function (n) { return n.trim(); });
		names = names.filter(function (name, i) { return names.indexOf(name) === i; });

		if (names.length === 0) {
			return `<span style = "color:var(--text-muted); font-size:11px" > Unassigned</span>`;
		}

		return names.map(function (name) {
			return `<span class="d-chip" style = "background:var(--surface-1); color:var(--text-secondary)" > ${frappe.utils.icon("user", "xs")} ${name}</span>`;
		}).join(" ");
	}
	function dueChip(doc, dueDateString) {
		var r = remDaysHours(dueDateString);
		if (r.totalHours === 0) {
			return `<span style="color:orange">Due now</span>`;
		}
		if (!r.isOverdue) {
			if (r.totalHours === null) {
				return `<span>Deadline not set</span>`;
			}
			if (r.months > 0) {
				return `<span>${r.months}mo left ${r.hours}h left</span>`;
			}
			else {
				var label = r.days > 0 ? (r.days + "d " + r.hours + "h left") : (r.hours + "h left");
				return `<span>${label}</span>`;
			}
		}
		// if (doc === "Project") {
		// 	var overdueLabel = r.months > 0 ? (r.months + "mo " + r.hours + "h overdue") : (r.hours + "h overdue");
		// 	return `<span style="color:var(--text-danger)">${overdueLabel}</span>`;
		// }
		if (r.months > 0) {
			return `<span style="color:var(--text-danger)">${r.months}mo ${r.hours} h overdue</span>`;
		}
		var overdueLabel = r.days > 0 ? (r.days + "d " + r.hours + "h overdue") : (r.hours + "h overdue");
		return `<span style="color:var(--text-danger)">${overdueLabel}</span>`;
	}
	// indicator to mark urgency
	function urg(urgency) {
		var colors = {
			"Emergency": ["var(--text-danger)", "var(--bg-danger)"],
			"Urgent": ["var(--text-warning)", "var(--bg-warning)"],
			"Normal": ["var(--text-secondary)", "var(--surface-1)"],
			"Low": ["var(--text-muted)", "var(--surface-1)"]
		};
		var pair = colors[urgency] || colors["Normal"];
		return `<span class="d-chip" style = "color:${pair[0]}; background:${pair[1]}; border:0.5px solid ${pair[0]}" > ${urgency}</span>`;
	}
	// indicator to mark status colour
	function chip(status) {
		var colors = {
			"Discovery": ["var(--text-info)", "var(--bg-info)"],
			"AMC": ["var(--text-success)", "var(--bg-success)"],
			"Active": ["var(--text-accent)", "var(--bg-accent)"],
			"Config": ["var(--text-accent)", "var(--bg-accent)"],
			"Data Migration": ["var(--text-accent)", "var(--bg-accent)"],
			"Integration": ["var(--text-warning)", "var(--bg-warning)"],
			"UAT": ["var(--text-warning)", "var(--bg-warning)"],
			"Training": ["var(--text-success)", "var(--bg-success)"],
			"Go-Live": ["var(--text-danger)", "var(--bg-danger)"],
			"Hypercare": ["var(--text-warning)", "var(--bg-warning)"],
			"Closed": ["var(--text-muted)", "var(--surface-1)"],
			"Done": ["var(--text-success)", "var(--bg-success)"],
			"Low": ["var(--text-muted)", "var(--surface-1)"],
			"Medium": ["var(--text-warning)", "var(--bg-warning)"],
			"High": ["var(--text-danger)", "var(--bg-danger)"],
			"Open": ["var(--text-info)", "var(--bg-info)"],
			"Working": ["var(--text-accent)", "var(--bg-accent)"],
			"Pending Review": ["var(--text-warning)", "var(--bg-warning)"],
			"Overdue": ["var(--text-danger)", "var(--bg-danger)"],
			"Template": ["var(--text-muted)", "var(--surface-1)"],
			"Completed": ["var(--text-success)", "var(--bg-success)"],
			"Cancelled": ["var(--text-muted)", "var(--surface-1)"]
		};

		var pair = colors[status] || ["var(--text-muted)", "var(--surface-1)"];
		return `<span class="d-chip" style = "color:${pair[0]}; background:${pair[1]}; border:0.5px solid ${pair[0]}" > ${status}</span>`;
	}
	function renderProjectMenuCards(project) {
		return project_menu_actions.map(function (p) {
			var docAttr = p.doc ? ` data-doc="${p.doc}"` : "";
			var allowed = isAllowedTo(p.perm, "Project");
			console.log("Allowed?", allowed)
			var disabledAttr = allowed ? "" : ` data-disabled='true'`;
			var disabledClass = allowed ? "" : ` d-act-disabled`;
			return `
			<div class="d-act${disabledClass}" data-act="${p.act}"  data-id="${project.id}" ${docAttr}${disabledAttr}  style="color:${p.color || 'inherit'}">
			<div>
			<span style="display:inline-flex; color:${p.color || 'inherit'};" class="${p.act === 'deletedoc' ? 'icon-danger' : ''}">
			${frappe.utils.icon(p.icon, "sm")}
			</span>
			</div>
			${p.label}
			</div>
			`
		}).join("");
	}
	var task_menu_actions = [
		{ act: "details", icon: "info", label: "Details & activity" },
		{ act: "gotostatus", icon: "circle-dot", label: "Change status", perm: "write" },
		{ act: "gotodivision", icon: "tag", label: "Change Division", perm: "write" },
		{ act: "changelead", icon: "user-check", label: "Change division lead", perm: "write" },
		{ act: "gotourgency", icon: "flame", label: "Set Urgency", perm: "write" },
		{ act: "gotodue", icon: "calendar-days", label: "Change Due date", perm: "write" },
		{ act: "newtodo", icon: "plus", label: "Add ToDo", perm: "create:ToDo" },
		{ act: "copylink", icon: "copy", label: "Copy link", doc: "Task" },
		{ act: "sendslackdm", icon: "send", label: "Send to Slack direct message", doc: "Task" },
		{ act: "sendslackchannel", icon: "send", label: "Send to Slack Channel", doc: "Task" },
		{ act: "sendwhatsapp", icon: "send", label: "Send to WhatsApp", doc: "Task" },
		{ act: "deletedoc", color: "var(--text-danger)", icon: "trash", label: "Delete Task", doc: "Task", perm: "delete" }
	];
	function renderTaskMenuCards(task) {
		return task_menu_actions.map(function (p) {
			var docAttr = p.doc ? ` data-doc="${p.doc}"` : "";
			var isAllowed = isAllowedTo(p.perm, "Task");
			var disabledAttr = (isAllowed) ? "" : ` data-disabled="true"`;
			var disabledClass = (isAllowed) ? "" : ` d-act-disabled`;
			return `
			<div class="d-act${disabledClass}" data-act="${p.act}" data-id="${task.id}"${docAttr}${disabledAttr} style="color:${p.color || 'inherit'}">
			<div>
			<span style="display:inline-flex; color:${p.color || 'inherit'};" class="${p.act === 'deletedoc' ? 'icon-danger' : ''}">
			${frappe.utils.icon(p.icon, "sm")}
			</span>
			</div>
			${p.label}
			</div>
			`
		}).join("");
	}
	function prog(percent) {
		return `
			<div style = "display:flex; align-items:center; gap:6px; margin-top:4px" >
      <div class="d-bar">
        <div class="d-fill" style="width:${percent}%"></div>
      </div>
      <span class="d-meta">${percent}%</span>
    </div>
			`;
	}
	function renderProjectCard(project) {
		var menuHtml = "";
		if (state.menu && state.menu.id === project.id) {
			if (state.menu.mode === "status") {
				menuHtml = `
			<div class = "d-menu" >
				<div class="d-hd" style="background:transparent; border:none; padding:0 0 8px">Status</div>
				<div style="display:flex; flex-wrap:wrap; gap:6px">
                ${DeliverystatusOptions.map(status => `
                    <div class="d-opt" data-act="setstatus" data-id="${project.id}" data-value="${status}">${status}</div>
                `).join("")}
				</div>
				</div>
			`;
			}
			else if (state.menu.mode === "changepm") {
				menuHtml = `
			<div class="d-menu" >
			<div class="d-hd" style="background:transparent; border:none; padding:0 0 8px">Project manager</div>
			<div style="display:flex; flex-wrap:wrap; gap:6px">
			${OptionalHtml}
			</div>
			</div>
			`;
			}
			else if (state.menu.mode === "changedue") {
				menuHtml = `
				<div class="d-menu">
					<div class="due-date-picker-wrapper">
						<div class="due-date-label">Due date</div>
						<div class="due-date-input-row">
							<input type="text" data-act="changeduedate" id="due-date-input" data-id="${project.id}"
								value="${frappe.datetime.str_to_user(project.due)}"
								placeholder="Select Date"
								style="width:auto; max-width:180px; padding:6px 10px" autocomplete="off" readonly/>
						</div>
						<div id="due-date-calendar-container"></div>
						<div class="due-date-footer">
							<button class="btn btn-default btn-sm" data-doc="projects" data-act="close">Cancel</button>
							<button class="btn btn-primary btn-sm" data-act="savedue" data-id="${project.id}">Save</button>
						</div>
					</div>
				</div>
				`;
			}

			else {
				menuHtml = `
			<div class="d-menu" >
			${renderProjectMenuCards(project)}
    <div class="d-act" data-act="close"><div>${frappe.utils.icon("close", "sm")}</div> Close</div>
  </div>
			`;
			}
		}
		return `
<div class="d-row lvl-project ${project.id === state.selectedProject ? 'sel' : ''}" data-project-id=${project.id}>
    <div style="flex:1; min-width:0">
        <div class="card-title">${project.name}</div>
        <div class="card-subtitle">${project.client}</div>

        <div style="display:flex; gap:4px; flex-wrap:wrap; margin-bottom:8px">
            ${chip(project.status)}
        </div>

        ${prog(project.percent_complete)}

        <div class="property-list">
            ${(project.due && project.status !== "Completed") ? propertyRow("Due Date",
			`<span style="${remDays(project.due) < 0 ? 'color:var(--text-danger)' : ''}">${dueChip("Project", project.due)}</span>`
		) : ""}
            ${propertyRow("PM", personValue(project.pm))}
        </div>

        <div style="display:flex; gap:6px; margin-top:8px">${renderReactions(project)}</div>
    </div>
	<div class="card-icon-group">
    <button class="d-dots" data-act="dots" data-id="${project.id}">${frappe.utils.icon("dot-vertical", "sm")}</button>
    <button class="d-info" data-act="opendrawer" data-type="Project" data-id="${project.id}">${frappe.utils.icon("info", "sm")}</button>
	</div>
	<button class="d-pin-hang ${project.pinned ? 'pinned' : ''}" data-act="togglepin" data-doc="Project" data-id="${project.id}">${frappe.utils.icon("bookmark", "sm")}</button>
    ${menuHtml}
</div>
`;
	}
	function propertyRow(label, valueHtml) {
		return `
      <div class="property-label">${label}</div>
      <div class="property-value">${valueHtml}</div>
    `;
	}
	function personValue(name) {
		if (!name) {
			return `<div class="card-avatar-group"><div class="card-avatar card-avatar-empty">?</div><span class="card-avatar-label">Unassigned</span></div>`;
		} var names = Array.isArray(name) ? name : String(name).split(",");
		var first = names[0].trim();
		var extra = names.length - 1;
		var colors = getAvatarColor(first);
		return `
      <div class="card-avatar" style="background:${colors[0]}; color:${colors[1]}">${getInitials(first)}</div>
      <span class="person-name" title="${first}">${first}</span>
      ${extra > 0 ? `<span class="extra-badge">+${extra}</span>` : ""}
    `;
	}
	function renderAvatarCircle(name) {
		if (!name) {
			return `<div class="card-avatar-group"><div class="card-avatar card-avatar-empty">?</div><span class="card-avatar-label">Unassigned</span></div>`;
		}
		var names = Array.isArray(name) ? name : String(name).split(",");
		var first = names[0].trim();
		var colors = getAvatarColor(first);
		return `
      <div class="card-avatar-group">
        <div class="card-avatar" style="background:${colors[0]}; color:${colors[1]}" title="${first}">${getInitials(first)}</div>
        <span class="card-avatar-label">${first}</span>
      </div>
    `;
	}
	var OptionalHtml = "";
	async function loadOptions(role, id) {
		OptionalHtml = await list_users(role, id);
	}
	async function list_users(role, id) {
		var users = await frappe.xcall("zoulway.api.get_users", { role: role });
		if (role === "pm") {
			// var id = state.selectedProject;
			return users.map(function (user) {
				return `<div class="d-opt" data-act="setuser" data-id="${id}" data-value="${user.name}">${user.name}</div>`
			}).join("");
		}
		else {
			return users.map(function (user) {
				return `<div class="d-opt" data-act="assign" data-id="${id}" data-value="${user.name}">${user.name}</div>`
			}).join("");
		}
	}
	function getInitials(name) {
		if (!name) return "?"
		var clean = String(name).split("@")[0];
		var parts = clean.replace(/[._]/g, " ").trim().split(/\s+/);
		if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}

	function renderTaskCard(task) {
		var menuHtml = "";
		if (state.menu && state.menu.id === task.id) {
			if (state.menu.mode === "status") {
				menuHtml = `
			<div class = "d-menu" >
				<div class="d-hd" style="background:transparent; border:none; padding:0 0 8px">Status</div>
				<div style="display:flex; flex-wrap:wrap; gap:6px">
				${task_status_options.map(function (s) {
					return `<div class="d-opt" data-act="setstatus" data-id="${task.id}" data-value="${s}">${s}</div>`
				}).join("")}
				</div>
				</div>
			`;
			}
			else if (state.menu.mode === "changediv") {
				menuHtml = `
			<div class="d-menu" >
					<div class="d-hd" style="background:transparent; border:none; padding:0 0 8px">Division (sets lead)</div>
					<div style="display:flex; flex-wrap:wrap; gap:6px">
					${divisions.map(function (d) {
					return `<div class = "d-opt"  data-act="setdiv" data-id="${task.id}" data-value="${d}">${d}</div>`
				}).join("")}
					</div>
					</div>
			`;
			}
			else if (state.menu.mode === "changelead") {
				menuHtml = `
			<div class="d-menu" >
			<div class="d-hd" style="background:transparent; border:none; padding:0 0 8px">Change Lead</div>
			<div style="display:flex; flex-wrap:wrap; gap:6px">
			${OptionalHtml}
			</div>
			</div>
			`;
			}
			else if (state.menu.mode === "changeurg") {
				menuHtml = `
			<div class="d-menu" >
					<div class="d-hd" style="background:transparent; border:none; padding:0 0 8px">Change Urgency</div>
					<div style="display:flex; flex-wrap:wrap; gap:6px">
					${loadurg(task)}
					</div>
			</div>
			`;
			}
			else if (state.menu.mode === "changedue") {
				menuHtml = `
<div class="d-menu">
	<div class="due-date-picker-wrapper">
		<div class="due-date-label">Due date</div>
		<div class="due-date-input-row">
			<input type="text" data-act="changeduedate" id="due-date-input" data-id="${task.id}"
				value="${frappe.datetime.str_to_user(task.due)}"
				placeholder="Select Date"
				style="width:auto; max-width:180px; padding:6px 10px" autocomplete="off" readonly/>
		</div>
		<div id="due-date-calendar-container"></div>
		<div class="due-date-footer" style="margin-top:10px; gap:6px">
		<button class="btn btn-default btn-sm" data-doc="projects" data-act="close">Cancel</button>
		<button class="btn btn-primary btn-sm" data-act="savedue" data-id="${task.id}">Save</button>
		</div>
	</div>
</div>
`;
			}
			else if (state.menu.mode === "changecompletedon") {
				menuHtml = `
				<div class="d-menu">
					<div class="d-hd" style="background:transparent; border:none; padding:0 0 8px">Due date</div>
					<div style="display:flex; flex-direction:column; gap:8px">
						<input type="hidden" id="completed-on-input" data-id="${task.id}" value="${task.completed_on || ''}" />

						<div id="completed-on-calendar-container" data-id="${task.id}"></div>
						<div style="display:flex; gap:6px; justify-content:flex-end">
							<button class="btn btn-default btn-sm" data-doc="tasks" data-act="close">Cancel</button>
							<button class="btn btn-primary btn-sm" data-act="savecompleted" data-id="${task.id}">Save</button>
						</div>
					</div>
				</div>
				`;
			}
			else if (state.menu.mode === "changecompletedby") {
				menuHtml = `
	<div class="d-menu">
		<div class="d-hd" style="background:transparent; border:none; padding:0 0 8px">Completed by</div>
		<div class="filter-values-wrap scrollable">
			<div class="filter-opt ${!task.completed_by ? "on" : ""}" data-act="savecompletedby" data-id="${task.id}" data-value="">Unassigned</div>
			${TaskLeadOptions.map(function (u) {
					return `<div class="filter-opt ${task.completed_by === u ? "on" : ""}" data-act="savecompletedby" data-id="${task.id}" data-value="${u}">${u}</div>`;
				}).join("")}
		</div>
	</div>
	`;
			}
			else {
				menuHtml = `
			<div class="d-menu" >
			${renderTaskMenuCards(task)}
    <div class="d-act" data-act="close"><div>${frappe.utils.icon("close", "sm")}</div> Close</div>
  </div>
			`;
			}
		}
		return `
<div class="d-row lvl-task ${task.id === state.selectedTask ? 'sel' : ''}" data-task-id=${task.id}>
    <div style="flex:1; min-width:0">
        <div class="card-title" style="margin-bottom:4px">${task.name}</div>
        <div class="card-subtitle">${projectsById.get(task.project)?.name || task.project || "No project linked"}</div>

        <div style="display:flex; gap:4px; flex-wrap:wrap; margin-bottom:8px">
            ${chip(task.stage)}
            ${chip(task.status)}
            ${urg(task.urgency)}
        </div>

        <div style="display:flex; gap:4px; flex-wrap:wrap; margin-bottom:8px">
            ${renderModuleCards(task.module)}
        </div>

        <div class="property-list">
${(task.due && task.status !== "Completed") ? propertyRow("Due Date",
			`<span style="${remDays(task.due) < 0 ? 'color:var(--text-danger)' : ''}">${dueChip("Task", task.due)}</span>`
		) : ""}
            ${propertyRow("Assigned To", personValue(task.lead))}
            ${propertyRow("Assigned By", personValue(task.assigned_by))}
            ${propertyRow("Division", `<span>${task.div || "—"}</span>`)}
        </div>

        ${task.creation ? `
        <div class="card-meta-item" style="color:var(--text-accent); margin-top:6px">
            ${frappe.utils.icon("clock", "xs")} ${task.status} since ${fmtDate(task.creation)}
        </div>
        ` : ""}

        ${task.status === "Completed" ? `
        <div style="display:flex; gap:6px; margin-top:8px; padding-top:8px; border-top:1px solid var(--surface-1); flex-wrap:wrap">
            <button class="btn-completed-card" data-act="setcompletedon" data-id="${task.id}">
                <span style="color:var(--text-success)">✓</span>
                Completed on: ${task.completed_on ? fmtDate(task.completed_on) : "Set date"}
            </button>
            <button class="btn-completed-card" data-act="setcompletedby" data-id="${task.id}">
                ${frappe.utils.icon("user-check", "xs")} Completed by: ${task.completed_by ? task.completed_by : "Set person"}
            </button>
        </div>
        ` : ""}

        <div style="display:flex; gap:6px; margin-top:8px">${renderReactions(task)}</div>
    </div>
	<div class="card-icon-group">
    <button class="d-dots" data-act="dots" data-id="${task.id}">${frappe.utils.icon("dot-vertical", "sm")}</button>
    <button class="d-info" data-act="opendrawer" data-type="Task" data-id="${task.id}">${frappe.utils.icon("info", "sm")}</button>
	</div>
		<button class="d-pin-hang ${task.pinned ? 'pinned' : ''}" data-act="togglepin" data-doc="Task" data-id="${task.id}">${frappe.utils.icon("bookmark", "sm")}</button>

    ${menuHtml}

</div>
`;
	}
	function getAvatarColor(name) {
		var palette = [
			["#e8f2fd", "#2490ef"],   // blue
			["#ddf5e5", "#29844b"],   // green
			["#fdf0d5", "#b7860b"],   // amber
			["#fbe2e2", "#e13636"],   // red
			["#f0e8fd", "#7c3aed"],   // purple
			["#fde8f3", "#db2777"],   // pink
		];
		var hash = 0;
		for (var i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		var index = Math.abs(hash) % palette.length;
		return palette[index];
	}
	var todo_menu_actions = [
		{ act: "details", icon: "info", label: "Details & activity", },
		{ act: "gotostatus", icon: "circle-dot", label: "Change status", perm: "write" },
		{ act: "assignto", icon: "user-plus", label: "Assign", perm: "write" },
		{ act: "gotourgency", icon: "flame", label: "Set Urgency", perm: "write" },
		{ act: "gotodue", icon: "calendar-days", label: "Change Due date", perm: "write" },
		{ act: "copylink", icon: "copy", label: "Copy link", doc: "ToDo" },
		{ act: "sendslackdm", icon: "send", label: "Send to Slack direct message", doc: "ToDo" },
		{ act: "sendslackchannel", icon: "send", label: "Send to Slack Channel", doc: "ToDo" },
		{ act: "sendwhatsapp", icon: "send", label: "Send to WhatsApp", doc: "ToDo" },
		{ act: "deletedoc", color: "var(--text-danger)", icon: "trash", label: "Delete ToDo", doc: "ToDo", perm: "delete" }
	];
	function renderToDoMenuOptions(todo) {
		return todo_menu_actions.map(function (action) {
			var docAttr = action.doc ? ` data-doc="${action.doc}"` : "";
			var isAllowed = isAllowedTo(action.perm, "ToDo");
			var disabledAttr = isAllowed ? "" : ` data-disabled = "true"`;
			var disabledClass = isAllowed ? "" : ` d-act-disabled`;
			return `
			<div class="d-act${disabledClass}" data-act=${action.act} data-id="${todo.id}" ${docAttr} ${disabledAttr} style="color:${action.color || 'inherit'}">
			<div>
			<span style="display:inline-flex; color:${action.color || 'inherit'};" class="${action.act === 'deletedoc' ? 'icon-danger' : ''}">
			${frappe.utils.icon(action.icon, "sm")}
			</span>
			</div>
			${action.label}
			</div>`;
		}).join("")
	}
	function renderToDoCard(todo) {
		var icon = todo.done ? "✓" : "○";
		var textStyle = todo.done ? "text-decoration:line-through;color:var(--text-muted)" : "";
		var menuHtml = "";
		if (state.menu && state.menu.id === todo.id) {
			if (state.menu.mode === "status") {
				menuHtml = `
			<div class = "d-menu" >
				<div class="d-hd" style="background:transparent; border:none; padding:0 0 8px">Status</div>
				<div style="display:flex; flex-wrap:wrap; gap:6px">
				${todo_status_options.map(function (s) {
					return `<div class="d-opt" data-act="setstatus" data-id="${todo.id}" data-value="${s}">${s}</div>`
				}).join("")}
				</div>
				</div>
			`;
			}
			else if (state.menu.mode === "assignto") {
				menuHtml = `
			<div class="d-menu" >
			<div class="d-hd" style="background:transparent; border:none; padding:0 0 8px">Assign To</div>
			<div style="display:flex; flex-wrap:wrap; gap:6px">
			${OptionalHtml}
			</div>
			</div>
	`;
			}
			else if (state.menu.mode === "changeurg") {
				menuHtml = `
			<div class="d-menu" >
					<div class="d-hd" style="background:transparent; border:none; padding:0 0 8px">Set Urgency🔥</div>
					<div style="display:flex; flex-wrap:wrap; gap:6px">
					${todo_urg_options.map(function (s) {
					return `<div class="d-opt" data-act="seturg" data-id="${todo.id}" data-value="${s}">${s}</div>`
				}).join("")}
					</div>
					</div>
			`;
			}
			else if (state.menu.mode === "changedue") {
				menuHtml = `
	<div class="d-menu">
		<div class="due-date-picker-wrapper">
			<div class="due-date-label">Due date</div>
			<div class="due-date-input-row">
				<input type="text" data-act="changeduedate" id="due-date-input" data-id="${todo.id}"
					value="${frappe.datetime.str_to_user(todo.due)}"
					placeholder="Select Date"
					style="width:auto; max-width:180px; padding:6px 10px" autocomplete="off" readonly/>
			</div>
			<div id="due-date-calendar-container"></div>
			<div class="due-date-footer">
				<button class="btn btn-default btn-sm" data-doc="todos" data-act="close">Cancel</button>
				<button class="btn btn-primary btn-sm" data-act="savedue" data-id="${todo.id}">Save</button>
			</div>
		</div>
	</div>
	`;
			}
			else {
				menuHtml = `
			<div class="d-menu" >
			${(renderToDoMenuOptions(todo))}
    <div class="d-act" data-act="close"><div style="display:inline-flex">${frappe.utils.icon("close", "sm")}</div> Close</div>
  </div>
			`;
			}
		}
		return `
<div class="d-row lvl-todo ${todo.id === state.selectToDo ? 'sel' : ''}" data-todo-id=${todo.id}>
    <div style="flex:1; min-width:0">
        <div class="card-title" style="${textStyle}">${icon} ${todo.name}</div>

        <div style="display:flex; gap:4px; flex-wrap:wrap; margin:8px 0">
            ${chip(todo.status)}
            ${urg(todo.urgency)}
            ${chip(todo.priority)}
        </div>

        <div style="display:flex; gap:4px; flex-wrap:wrap; margin-bottom:8px">
            ${renderModuleCards(todo.module)}
        </div>

        <div class="property-list">
            ${(todo.due && !todo.done) ? propertyRow("Due Date",
			`<span style="${remDays(todo.due) < 0 ? 'color:var(--text-danger)' : ''}">${dueChip("ToDo", todo.due)}</span>`
		) : ""}
            ${propertyRow("Assigned To", personValue(todo.who))}
            ${propertyRow("Assigned By", personValue(todo.assigned_by))}
        </div>

        <div style="display:flex; gap:6px; margin-top:8px">${renderReactions(todo)}</div>
    </div>
	<div class="card-icon-group">
    <button class="d-dots" data-act="dots" data-id="${todo.id}">${frappe.utils.icon("dot-vertical", "sm")}</button>
    <button class="d-info" data-act="opendrawer" data-type="ToDo" data-id="${todo.id}">${frappe.utils.icon("info", "sm")}</button>
	</div>
	<button class="d-pin-hang ${todo.pinned ? 'pinned' : ''}" data-act="togglepin" data-doc="ToDo" data-id="${todo.id}">${frappe.utils.icon("bookmark", "sm")}</button>

    ${menuHtml}
</div>
`;

	}
	function renderModuleCards(module) {
		if (!module) {
			return "";
		}
		// var inScope = !!module.in_scope;
		var color = "var(--text-success)";
		var bg = "var(--bg-success)";
		return `
			<div class="d-chip" style="color:${color}; background:${bg}; border:0.5px solid ${color}">
				${module}
			</div>
		`;
	}
	function renderProjectsColumn(projects) {
		return projects.map(renderProjectCard).join("")
	}
	function renderTasksColumn(tasks) {
		return tasks.map(renderTaskCard).join("")
	}
	function renderToDosColumn(todos) {
		return todos.map(renderToDoCard).join("")
	}
	function ppct(project) { return project.percent || 0; }
	document.getElementById("btn-load-more-projects").addEventListener("click", function () {
		loadMoreProjects();
	});
	function pct(task) { return task.percent || 0; }
	async function loadProjects() {
		projectsOffsets = 0;

		var rows = await frappe.xcall("zoulway.api.get_projects", {
			limit: PROJECTS_PAGE_SIZE,
			offset: projectsOffsets
		});

		projectsHasMore = rows.length >= PROJECTS_PAGE_SIZE;

		testProjects = rows.map(function (r) {
			return {
				id: r.name,
				pinned: !!r.pinned,

				name: r.project_name || r.title || r.name,

				client: r.client || "",

				status: r.status || "Open",

				pm: r.project_manager || r.pm || "Unassigned",

				percent: r.percent_complete || 0,

				description: r.description || "",

				due: r.expected_end_date || r.due || null,

				reactions: r.reaction_counts || {},

				activity: r.activity || [],
				comments: r.comments || [],
				attachments: r.attachments || [],

				slack_channel_id: r.slack_channel_id || null,
				whatsapp_channel_id: r.whatsapp_channel_id || null,

				percent_complete: r.percent_complete || 0
			};
		});

		projectsById = new Map(
			testProjects.map(function (p) {
				return [p.id, p];
			})
		);

		showFilteredProjects();
		updateLoadMoreButton();

		return;
	}
	async function loadTodos(taskId, projectId) {
		var rows = await frappe.xcall("zoulway.api.get_todos", { task: taskId, project: projectId });
		testTodos = rows.map(function (r) {
			return {
				id: r.name,
				pinned: !!r.pinned,
				task: r.task || taskId,
				name: r.title,
				who: r.assignee,
				assigned_by: r.assigned_by,
				done: !!r.done,
				status: r.status || "Open",
				priority: r.priority || "Low",
				urgency: r.urgency,
				due: r.deadline,
				reactions: r.reaction_counts || {},
				comments: r.comments,
				attachments: r.attachments,
				activity: r.activity,
				description: r.title,
				slack_channel_id: r.slack_channel_id,
				whatsapp_channel_id: r.whatsapp_channel_id,
				module: r.imp_module
			};
		});
		console.log(testTodos)
		todosById = new Map(testTodos.map(t => [t.id, t]));
		showToDosForSelectedTasks();
		return testTodos;
	}
	async function loadTasks(projectId) {
		var rows = await frappe.xcall("zoulway.api.get_tasks", {
			project: projectId
		});

		testTasks = rows.map(function (r) {
			return {
				id: r.name,

				pinned: !!r.pinned,

				name: r.subject || r.title || r.name,

				project: r.project || projectId,

				description: r.description || "",

				status: r.status || "Open",

				stage: r.stage || r.status || "Open",

				div: r.division || "—",

				assigned_to: r.assigned_to || null,

				assigned_by: r.assigned_by || null,

				lead: r.lead || null,

				urgency: r.urgency || r.priority || "Medium",

				percent: r.progress || r.percent || 0,

				due: r.exp_end_date || r.deadline || null,

				creation: r.creation || r.started_on,

				completed_on: r.completed_on,

				completed_by: r.completed_by,

				activity: r.activity || [],
				comments: r.comments || [],
				attachments: r.attachments || [],

				reactions: r.reaction_counts || {},

				slack_channel_id: r.slack_channel_id || null,
				whatsapp_channel_id: r.whatsapp_channel_id || null,

				module: r.imp_module || null
			};
		});

		console.log("TASKS:", testTasks);

		tasksById = new Map(
			testTasks.map(function (t) {
				return [t.id, t];
			})
		);

		showFilteredTasks();
	}
	function renderUrgOptions() {
		var el = document.getElementById("f-urgency")
		if (!el) return;
		var combined = Array.from(new Set([...(urgency_options || []), ...(todo_urg_options || [])]));
		el.innerHTML =
			`
			<div id="f-urgency-trigger" style="height:34px; width:160px; padding:0 10px; border:0.5px solid var(--border-strong); border-radius:var(--radius); background:var(--surface-2); display:flex; align-items:center; justify-content:space-between; gap:6px; cursor:pointer; white-space:nowrap; overflow:hidden;">
				<span style="overflow:hidden; text-overflow:ellipsis;">${state.urgencyFilter || "Any urgency"}</span>
				<span style="flex:none; display:inline-flex;">${frappe.utils.icon("chevron-down", "xs")}</span>
			</div>
			<div id="f-urgency-panel" class="rb-filter-panel" style="display:none; top:38px; left:0;">
			<div class="rb-filter-options" id="rb-filter-options">
				${combined.map(function (f) {
				return `<div class="filter-opt ${state.urgencyFilter === f ? "on" : ""}" data-act="seturg" data-field="${f}">
					<span>${f}</span>
					</div>`;
			}).join("")}
			</div>
			</div>

		`
	}
	async function getOptions() {
		var results = await Promise.all([
			frappe.xcall("zoulway.api.get_options", { doc: "Task", field: "imp_urgency" }),
			frappe.xcall("zoulway.api.get_options", { doc: "Project", field: "imp_status" }),
			frappe.xcall("zoulway.api.get_options", { doc: "Task", field: "imp_division" }),
			frappe.xcall("zoulway.api.get_options", { doc: "Task", field: "status" }),
			frappe.xcall("zoulway.api.get_options", { doc: "ToDo", field: "imp_urgency" }),
			frappe.xcall("zoulway.api.get_options", { doc: "ToDo", field: "status" }),
			frappe.xcall("zoulway.api.get_options", { doc: "Project", field: "imp_project_manager" })
		]);
		urgency_options = results[0];
		DeliverystatusOptions = results[1];
		divisions = results[2];
		task_status_options = results[3];
		todo_urg_options = results[4];
		todo_status_options = results[5];
		prj_pms = results[6];
		renderUrgOptions();
		renderSortFilters();
	}
	function loadurg(task) {
		return urgency_options.map(function (u) {
			return `<div class = "d-opt"  data-act="seturg" data-id="${task.id}" data-value="${u}">${u}</div>`
		}).join("")
	}
	function loadFlatpickr(callback = () => { }) {
		if (window.implFlatpickr) { callback(); return; }
		var css = document.createElement("link");
		css.rel = "stylesheet";
		css.href = "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css";
		document.head.appendChild(css);

		var script = document.createElement("script");
		script.src = "https://cdn.jsdelivr.net/npm/flatpickr";
		script.onload = function () {
			window.implFlatpickr = window.flatpickr;
			callback();
		};
		script.onerror = function () {
			frappe.msgprint("Could not load the date picker. Check your connection and try again.");
			onError();
		};
		document.head.appendChild(script);
	}
	async function loadTaskLeadOptions() {
		var users = await frappe.xcall("zoulway.api.get_users", {});
		TaskLeadOptions = users.map(function (u) {
			return u.name
		})
		assignees = TaskLeadOptions
		// persons = TaskLeadOptions
	}
	var testProjects = [];
	var projectsById = new Map();
	var testTasks = [];
	var tasksById = new Map();
	var testTodos = [];
	var todosById = new Map();
	async function init() {
		try {
			await loadProjects();
			await Promise.all([
				loadTasks(),
				loadTodos(),
				loadNotifCount(),
				loadDashboard(),
				loadTaskLeadOptions(),
				getOptions()
			]);
			renderNotifyPanel();
			renderEmergencyPanel();
			loadFlatpickr();
			renderPersonFilter();
		} catch (err) {
			console.error("Board init failed:", err);
			frappe.msgprint("Something went wrong loading the board. Please refresh the page.");
		}
	}
	init();
}