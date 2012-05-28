function single_post_render() {
	var token = getToken();
	if (!$.cookie("session")) {
		window.location = "logreg.html";
	}
	
	var postcontroller;
	var postmodel = new Model({
		url: "/api/rpost/:id",
		defaults: {
			limit: 5,
			skip: 0
		}
	});
	
	postmodel.post("save", function(req) {
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
	
	

	
	var postview = new View({
		el: document.getElementById("meright"),
		model: postmodel,
		
		refresh: function(id) {
			var html;
			postmodel.set("id", id);
			postmodel.fetch({
				proto: "get", 
				async: false, 
				data: {}
			});
			
			html = new EJS({url: 'script/ejs/single_post.ejs'}).render(this.model.attributes);
			this.el = document.getElementById("meright");
			this.el.innerHTML = html;
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
			
			el.value = "";
			$("#NEWPOST-send").dialog('destroy');
			window.location = "/index.html";
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
			
			el.addEventListener("click", postview.update);
		},
		
		update: function() {

			var pnode = this.parentNode,
				el = pnode.getElementsByClassName("pedit")[0],
				id = pnode.parentNode.id,
				text = el.value;
			
			postmodel.save({
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
						postmodel.save({
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
	
	postcontroller = new Controller({
		view: postview
	});
	
	window.spostview = postview;
	
	window.postcontroller = postcontroller;
}
