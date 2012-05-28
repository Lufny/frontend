function post_profile_render() {
	var stats, token = getToken();

	var profilepmodel = new Model({
		url: "/api/post/:id",
		defaults: {
			limit: 10,
			skip: 0,
		}
	});
	
	profilepmodel.post("save", function(req) { // middleware
		var err;
		try {
			err = JSON.parse(req.responseText);
		} catch (e) {
			return; // Invalid json
		}
		console.dir(req);
		if (err.error == 5) {
			noty({
				text: 'Fl00d your mother [cit.]',
				layout: 'bottomRight',
				type:	'error'
			});
		}
	});
	
	

	var profilepview = new View({
		el: document.getElementById("posts"),
		model: profilepmodel,
		
		refresh: function(id) {
			var _id = getinfoByUsername(id).stats._id;
			
			this.model.set("id", _id);
			profilepmodel.fetch({proto: "get", async: false});
			var html = new EJS({url: 'script/ejs/post_profile.ejs'}).render(this.model.attributes);
			this.el = document.getElementById("posts");
			this.el.innerHTML = html;
		},
		
		render_more: function() {
			var self = this,
				html;
			
			this.model.set("skip", this.model.get("skip")+this.model.get("limit"));
			this.model.fetch({
				proto: "get",
				async: false,
				data: {
					limit: profilepmodel,
					skip: profilepmodel
				}
			});
			html = new EJS({url: 'script/ejs/post_profile.ejs'}).render(this.model.attributes);
			this.el.innerHTML += html;
			postrender();
		},
		
		post: function() {
			var el = document.getElementById("post_text"),
				self = this,
				ret;
				
			ret = this.model.save({
					proto: "post",
					async: false,
					data: {
						text: el.value,
						token: token
					}
			});
		},
		
		edit: function() {
			var el = this.parentNode.parentNode.getElementsByClassName("ptext")[0],
				pnode = el.parentNode,
				id = random_string(),
				MD5 = new Hashes.MD5;
				text = this.parentNode.parentNode.getElementsByClassName("nonparsed")[0].innerHTML;

			pnode.removeChild(el);
			
			el = document.createElement("textarea");
			el.className = "pedit";
			el.value = text;
			pnode.appendChild(el);
				
			el = document.createElement("button");
			el.innerHTML = "Update";
			pnode.appendChild(el);
			
			el.addEventListener("click", profilepview.update);
		},
		
		update: function() {

			var pnode = this.parentNode,
				el = pnode.getElementsByClassName("pedit")[0],
				id = pnode.parentNode.id,
				text = el.value;
			
			profilepmodel.save({
				proto: "put",
				url: "/api/post/"+id,
				async: false,
				data: {
					text: text,
					token: token
				}
			});
			
			pnode.removeChild(el);
			pnode.removeChild(this);
			el = document.createElement("div");
			el.className = "ptext";
			el.innerHTML = text;
			pnode.appendChild(el);
		},
		
		del: function() {
			var id = this.parentNode.parentNode.id,
				el = document.getElementById(id);
			noty({
				text: "nexgay", 
				buttons: [
				{
					type: 'btn btn-primary', 
					text: 'Ok', 
					click: function($noty) {
						$noty.close();
						profilepmodel.save({
							proto: "delete",
							url: "/api/post/"+id,
							async: false,
							data: {
								token: token
							}
						});
						el.parentNode.removeChild(el);
					}
				},
				
				{
					type: 'btn btn-danger', 
					text: 'Cancel', 
					click: function($noty) {
						$noty.close();
					}
				}
				],
				closable: false,
				timeout: false
			});
		}
	});
	
	var profilepcontroller = new Controller({
		view: profilepview
	});
	
	profilepcontroller.perform(true, {
		"click #more_profile": "render_more",
		"click .edit_profile": "edit",
		"click .delete_profile": "del"
	});
	
	window.profilepview = profilepview;
}
