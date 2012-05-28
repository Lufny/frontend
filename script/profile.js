function profile_render() {
	var infos = getinfo(), stats,
		token = getToken();
	
	var profilemodel = new Model({
		url: "/api/userinfobyusername/:id",
		defaults: {
		}
	});

	
	var profileview = new View({
		el: document.getElementsByTagName("body")[0],
		model: profilemodel,
		refresh: function(id) {
			var mn = document.getElementById("mn_stats"),
				top_stats = document.getElementById("topstat"),
				html;
			
			this.model.set("id", id);
			// Buttons
			//html = new EJS({url: "script/ejs/profile_buttons.ejs"}).render({id: this.model.get("id"), stats: infos.stats});
			//mn.innerHTML = html;
			// -->
			
			this.model.fetch({
				proto: "get",
				async: false,
				data: {}
			});
			
			console.dir(this.model.attributes);
			
			html = new EJS({url: "script/ejs/profile_stats.ejs"}).render(this.model.attributes);
			top_stats.innerHTML = top_stats.innerHTML+html;
		}
	});
	
	window.profileview = profileview;
}
