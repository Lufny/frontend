function single_comment_render() {
	var commentcontroller, token = getToken();
	var commentmodel = new Model({
		url: "/api/comment/:id",
		defaults: {
			limit: 0
		}
	});
	
	
	commentmodel.post("save", function(req) {
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
	
		
	var commentview = new View({
		el: document.getElementById("meright"),
		model: commentmodel,
		
		rerender: function() {
			var comments_p = document.getElementsByClassName("comments_p");
			
			// You know, there are comments...
			if (comments_p) {
				this.read();
			}
		},
		
		read: function() {
			var el = document.getElementsByClassName("singlepost")[0],
				id = el.id,
				html;
			
			if (!el.getElementsByClassName("comments_p")[0]) {
				return;
			}
			
			commentmodel.set("id", id);
			
			commentmodel.fetch({
				proto: "get",
				async: false,
				data: {}
			});
			
			html = new EJS({url: 'script/ejs/comment.ejs'}).render(commentmodel.attributes);
			el.getElementsByClassName("comments_p")[0].innerHTML = html;
		},
		
		refresh: function(id) {
			var el = document.getElementById(id),
				comments_p = el.getElementsByClassName("comments_p")[0],
				cbox,
				hr = document.createElement("hr"),
				html;
			
			// If it doesn't exist, dinamically create comments_p
			if (!comments_p) {
				cbox = el.getElementsByClassName("cboxsingle")[0];
				cbox.insertBefore(hr, cbox.firstChild);
				comments_p = document.createElement("div");
				comments_p.className = "comments_p";
				cbox.insertBefore(comments_p, cbox.firstChild);
				cbox.insertBefore(hr, cbox.firstChild);
				comments_p = el.getElementsByClassName("comments_p")[0];
			}
			
			commentmodel.set("id", id);
			commentmodel.fetch({
				proto: "get",
				async: false,
				data: {}
			});
			
			html = new EJS({url: 'script/ejs/comment.ejs'}).render(commentmodel.attributes);
			comments_p.innerHTML = html;
		},
		
		post: function() {
			var el = this.parentNode.parentNode.parentNode,
				text = this.parentNode.getElementsByClassName("commText")[0].value,
				id = el.id,
				self = this,
				ret;
			
			commentmodel.set("id", id);
			ret = commentmodel.save({
					proto: "post",
					async: false,
					data: {
						token: token,
						text: text
					}
			});
			this.parentNode.getElementsByClassName("commText")[0].value = "";
			commentview.refresh(id);
		},
		
		edit: function() {
			var el = this.parentNode.parentNode.getElementsByClassName("ptext")[0],
				pnode = el.parentNode,
				id = random_string(),
				MD5 = new Hashes.MD5;
				text = el.innerHTML;

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
			var id = this.parentNode.parentNode.parentNode.id;
			
			console.log(id);
			
			commentmodel.set("id", id);
			commentmodel.save({
				proto: "delete",
				data: {token: token},
				async: false
			});
		}
	});
	
	
	window.scommentview = commentview;
	
	window.commentcontroller = commentcontroller;
}
