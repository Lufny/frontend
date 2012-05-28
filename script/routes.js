if (!location.hash) 
	window.location = "#/index";


var init = { // Hash for optimizing live handlers
	"post": false,
	"profile": false,
	"comment": false,
	"post_profile": false,
	"single_post": false,
	"single_comment": false
}

function call(id, func, arg) {
	if (!init[id]) {
		func(arg);
		init[id] = true;
	}
}

function blank() {
	$("#meright").fadeOut('slow');
}

function unblank() {
	$("#meright").fadeIn('slow');
}


function start_routing() {
	var t;
	
	$.ajax({ // Loading templates
		type: "GET",
		url: "script/json/template.json",
		success: function(data) {
			t = data;
		},
		async: false
	});
	
	t = JSON.parse(t);
	
	var index = function() {
			blank();
			
			document.getElementById("meright").innerHTML = t.index;
			
			call("post", posts_render);
			call("comment", comment_render);
			
			if (parse_hash("index")) {
				document.title = "Lufny - Home";
			}
			
			window.postview.refresh();
			unblank();
		},
		
		profile = function(id) {
			blank();
			
			document.getElementById("meright").innerHTML = t.profile;
			
			call("post_profile", post_profile_render);
			call("profile", profile_render);
			call("comment", comment_render);
			console.log(id);
			
			if (parse_hash("profile")) {
				document.title = "Lufny - Profile";
			}
			
			window.profileview.refresh(id);
			window.profilepview.refresh(id);
			unblank();
		},
		
		post = function(id) {
			blank();
			
			call("single_post", single_post_render);
			call("single_comment", single_comment_render);
			call("post", posts_render);
			call("comment", comment_render);
			
			if (parse_hash("post")) {
				document.title = "Lufny - Post";
			}
			
			window.spostview.refresh(id);
			window.scommentview.rerender();
			unblank();
		},
		
		owner_profile = function() {
			var id = getinfo().stats.username;
			blank();
			
			document.getElementById("meright").innerHTML = t.profile;
			
			call("post_profile", post_profile_render);
			call("profile", profile_render);
			call("comment", comment_render);
			console.log(id);
						
			if (parse_hash("profile")) {
				document.title = "Lufny - Profile";
			}
			
			window.profileview.refresh(id);
			window.profilepview.refresh(id);
			unblank();
		},
		
		parse_hash = function(hash) {
			var page = window.location.hash;
			if (page.indexOf(hash) != -1)
				return true;
			return false;
		};
			
	var routes = {
		'/index': index,
		'/profile/:id': profile,
		'/post/:id': post,
		'/profile': owner_profile
	};
	
	var router = Router(routes);
	router.init();
	postrender();
}

$(document).ready(start_routing);
