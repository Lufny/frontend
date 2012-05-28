$(document).ready(function() {
	var infos = getinfo().stats,
		token = getToken();
	infos.changed = [];
	var model = new Model({
		url: "/api/userinfo",
		defaults: infos
	});
	
	
	var view = new View({
		el: document.getElementById("SETTINGS"),
		model: model,
		render: function() {
			var els = ["mail", "rname", "rsurname", "avatar"];
			els.forEach(function(r) {
				document.getElementById(r).value = this.model.get(r);
			}, this);
		},
		
		onchange: function() {
			model.attributes.changed.push(this.id);
			console.dir(model.attributes);
		},
			
		update: function() {
			this.model.get("changed").forEach(function(r) {
				this.model.save({
					data: {
						key: r,
						value: document.getElementById(r).value,
						token: token
					},
					proto: "post",
					async: false
				});
			}, this);
			
			noty({
				"text": "Settings saved",
				"layout": "bottomRight",
				"type": "information"
			});
			
			$("#SETTINGS").dialog("close");
		}
	});
	
	var controller = new Controller({
		view: view,
		model: model
	});
	
	controller.perform({
		"change .setting_input": "onchange",
		"click #send_opt": "update"
	});
});
