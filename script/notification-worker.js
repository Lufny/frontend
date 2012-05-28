/*function getnot() {
		$.get("/api/notification", function(data) {
			var cnot, notText, el, id;
			if (data.length != 0) {
				for (var i in data) {
					if (!data[i].read) {
						cnot = data[i];
						switch (cnot.type) {
							case "tag":
								notText = cnot.username+" has tagged you on "+'<a href="single.html#'+data[i].id+'">this</a> post';
								break;
							case "post":
								notText = cnot.nick+" has commented on "+'<a href="single.html#'+data[i].id+'">this</a> post';
								break;
						}
						
						noty({
							"text": notText,
							"layout": "bottomRight",
							"type": "information",
							"animateOpen": {
								"height": "toggle"
							},
							"animateClose": {
								"height": "toggle"
							},
							"speed": 500,
							"timeout": 5000,
							"closeButton": false,
							"closeOnSelfClick": true,
							"closeOnSelfOver": false,
							onClose: function() { 
							},
							
							/*buttons: [
								 {type: 'btn btn-primary '+i, text: '<img src="http://teknostats.it.cx/img/icons/cc/white/trash_icon&16.png" />', click: function($noty) {
								 	var id = this[0].className.split(" ")[2], token;
								 	
								 	$.ajax({
								 		type: "GET",
								 		url: "/api/token",
								 		success: function(data) {
								 			token = data.token;
								 		},
								 		async: false
								 	});
								 	
								 	$.ajax({
								 		type: "DELETE",
								 		url: "/api/notification/"+id,
								 		data: {token: token}
								 		
								 	});
								 }}
							]*/
						//});
						/*$.ajax({
							type: "GET",
							url: "/api/token",
							success: function(data) {
								token = data.token;
							},
							async: false
						});
							
						$.ajax({
							type: "DELETE",
							url: "/api/notification/seen/"+i,
							data: {token: token},
							async: false
						});
					}
				}
			}
		});
	}
*/
// ^ Old code for notifications
$(document).ready(function(){
	var api, view, id, state = false;
	var model = new Model({
		url: "/api/notification/:q",
		defaults: {
			q: "unseen",
			ids: []
		}
	});
	
	noty_lay = $('#_noty_all');
	if(noty_lay.length>0) {
		noty_lay.qtip({
			content: $('#_n_noty'),
			style: {
				classes: 'ui-tooltip-rounded ui-tooltip-dark',
				width: 250,
				height: 400
			},
			show: {
				event: 'click'
			},
			hide: {
				event: 'unfocus'
			},
			
			position: {
				my: 'top right',  
				at: 'bottom left', 
				target: noty_lay
			},
			
			events: {
				hide: function(event, api) {
					view.getSeen();
					state = false;
				}
			}
		});
	}
	
	view = new View({
		el: document.getElementById("_n_noty"),
		model: model,
		render: function() {
			var nots, notText, ids, self = this;
			console.dir(this.model);
			
			this.model.fetch({
				data: {},
				proto: "get",
				success: function() {
					if (self.model.get("notifications").length == 0) {
						self.getSeen();
					} else {
						self.getGlobal();
					}
				}
			});

		},
		
		refresh: function() {
			var nots, notText, ids, self = this;
			
			if (state) {
				return;
			}
			
			this.model.set("q", "unseen");
			this.model.fetch({
				data: {},
				proto: "get",
				success: function() {
					if (self.model.get("notifications").length != 0) {
						self.getGlobal();
					}
				}
			});
		},
		
		getGlobal: function() {
			var title;
			var ids, self = this;
			this.model.set("q", "global");
			this.model.fetch({
				data: {},
				proto: "get",
				async: false,
				success: function() {
					ids = self.printNots(true);
					console.dir(ids);
					console.dir(self.model.attributes.ids);
					for (var i in ids) {
						if (self.model.attributes.ids.indexOf(ids[i]) < 0) {
							self.model.attributes.ids.push(ids[i]);
							document.getElementById("noty_numb").innerHTML = self.model.attributes.ids.length;
						}
					}
					
					if (self.model.attributes.ids.length > 0) {
						if (/\([0-9]\)[\D\s]/.test(document.title)) {
							title = document.title.split(")")[1];
							document.title = "(" + self.model.attributes.ids.length + ") " + title ;
						}
						else
						{
							title = document.title.split("-");
							document.title = "(" + self.model.attributes.ids.length + ") " + title[0] + "-" + title[1];
						}
					}
				}
			});
		},
		
		getSeen: function() {
			var self = this;
			this.model.set("q", "seen");
			this.model.fetch({
				data: {},
				proto: "get",
				success: function() {
					self.printNots(false);
				}
			})
		},
		
		printNots: function(oread) {
			var nots = this.model.get("notifications"), ids = [];
			console.dir(nots);
			this.blankNot();
			for (var i in nots) {
				if (oread && nots[i].read) {
					continue;
				}
				
				if (oread) ids.push(nots[i].date);
				switch (nots[i].type) {
					case "tag":
						notText = nots[i].username+" has tagged you on "+'<a href="#/post/'+nots[i].id+'">this</a> post';
						break;
					case "post":
						notText = nots[i].nick+" has commented on "+'<a href="#/post/'+nots[i].id+'">this</a> post';
						break;
				}
				this.createNot(notText);
			}
			
			
			if (oread) return ids;
		},
		
		createNot: function(text) {
			var div;
			div = document.createElement("div");
			div.className = "single_noty_in";
			div.innerHTML = text;
			this.el.appendChild(div);
		},
		
		blankNot: function() {
			this.el.innerHTML = "";
		},
		
		open: function() {
			var ids = this.model.get("ids"),
				token = getToken(),
				self = this;
			console.log("------>");
			console.dir(ids);
			ids.forEach(function (x) {
				self.model.save({
					data: {token: token},
					proto: "delete",
					url: "/api/notification/seen/"+x
				});
			});
			
			state = true;
			this.model.set("ids", []);
			document.getElementById("noty_numb").innerHTML = 0;
			document.title = "Home";
		}
	});
	
	window.notificationview = view;
	
	var controller = new Controller({
		view: view,
		model: model
	});
	
	controller.perform({
		"click #_noty_all": "open"
	});
	
	setInterval(function() {
		view.refresh(); // For some reasons, setInterval will change "this", we don't want to make this happen
	}, 5000);
});
				
