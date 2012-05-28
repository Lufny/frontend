function comment_render() {
	var commentcontroller;
	
	var commentmodel = new Model({
		url: "/api/comment/:id",
		defaults: {
			limit: 0
		}
	});
	
	window.commentmodel = commentmodel;
	
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
	
	commentmodel.fetch({
		proto: "get",
		url: "/api/token",
		async: false
	});
	
	
		
	var commentview = new View({
		el: document.getElementById("posts"),
		model: commentmodel,
		
		read: function() {
			var el = this.parentNode.parentNode,
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
				cbox = el.getElementsByClassName("cbox")[0];
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
			
			html = new EJS({url: 'script/ejs/comment.ejs'}).render(commentmodel.attributes); // You know, is cached
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
						token: commentmodel,
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
					token: postmodel
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
			var el = this.parentNode.parentNode,
				id = el.id,
				token = getToken();
			
			console.log(id);
			
			commentmodel.set("id", id);
			commentmodel.save({
				proto: "delete",
				data: {token: token},
				async: false
			});
			
			el.parentNode.removeChild(el);
		}
	});
	
	commentcontroller = new Controller({
		view: commentview
	});
	
	commentcontroller.perform(true, {
		"click .SendITcomm": "post",
		"click .comm_open": "read",
		"click .closep": "del"
	});
	
	window.commentcontroller = commentcontroller;
}
