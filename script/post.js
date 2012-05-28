if (!$.cookie("session")) {
	window.location = "logreg.html";
}
var rawtextmodel;
function posts_render() {
	var token = getToken();
	var postcontroller;
	var postmodel = new Model({
		url: "/api/post",
		defaults: {
			limit: 10,
			skip: 0
		}
	});
	rawtextmodel = new Model({}); // Model for storing raw data

	postmodel.post("save", function(req) { // middleware
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
		el: document.getElementById("posts"),
		model: postmodel,
		
		refresh: function() {
			postmodel.fetch({proto: "get", async: false});
			var html = new EJS({url: 'script/ejs/post.ejs'}).render(this.model.attributes);
			
			for (var i in this.model.attributes.posts) {
				rawtextmodel.set(this.model.attributes.posts[i]._id, this.model.attributes.posts[i].raw);
			}
			
			// Needed when refreshing
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
					limit: postmodel,
					skip: postmodel
				}
			});
			
			html = new EJS({url: 'script/ejs/post.ejs'}).render(this.model.attributes);
			this.el.innerHTML += html;
		},
		
		post: function() {
			var el = document.getElementById("post_text"),
				self = this,
				ret;
			//alert(1337);
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
			this.refresh();
		},
		
		edit: function() {
			var el = this.parentNode.parentNode.getElementsByClassName("ptext")[0],
				edit_id = this.parentNode.parentNode.id,
				pnode = el.parentNode,
				id = random_string(),
				MD5 = new Hashes.MD5;
				text = this.parentNode.parentNode.getElementsByClassName("nonparsed")[0].innerHTML;

			pnode.removeChild(el);
			el = document.createElement("textarea");
			el.className = "pedit";
			el.value = rawtextmodel.get(edit_id);
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
				newtext,
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
			newtext = getPostTextFromId(id);
			pnode.removeChild(el);
			pnode.removeChild(this);
			el = document.createElement("div");
			el.className = "ptext";
			el.innerHTML = newtext;
			pnode.appendChild(el);
		},
		
		del: function() {
			var id = this.parentNode.parentNode.id,
				el = document.getElementById(id);
				$( "#dialog-confirm" ).dialog({
					resizable: false,
					height:140,
					modal: true,
					buttons: {
						"Delete": function() {
							$( this ).dialog( "close" );
							postmodel.save({
								proto: "delete",
								url: "/api/post/"+id,
								async: false,
								data: {
									token: token
								}
							});
							el.parentNode.removeChild(el);
						},
						Cancel: function() {
							$( this ).dialog( "close" );
						}
					}
				});
			//postview.render();
		}
		
	});

	window.postview = postview;

	postcontroller = new Controller({
		view: postview
	});

	postcontroller.perform(true, {
		"click #more": "render_more",
		"click #SendIT #Send": "post",
		"click .edit": "edit",
		"click .delete": "del"
	});

	window.postcontroller = postcontroller;
}
