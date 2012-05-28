function strip_tags(text) {
	return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function unstrip_tags(text) {
	return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function getPostTextFromId(id) {
	var infos;
	$.ajax({
		method: "GET",
		async: false,
		url: "/api/rpost/"+id,
		success: function(data) {
			infos = data;
		}
	});

	return infos.posts.text;
}

function getinfo(uid) {
	var infos;
	
	if (!uid) {
		uid = $.cookie("lufny_uid");
	}
	
	$.ajax({
		method: "GET",
		async: false,
		url: "/api/userinfo/"+uid,
		success: function(data) {
			infos = data;
		}
	});
	
	return infos;
}

function getinfoByUsername(username) {
	var infos;
	
	$.ajax({
		method: "GET",
		async: false,
		url: "/api/userinfobyusername/"+username,
		success: function(data) {
			infos = data;
		}
	});
	
	return infos;
}

function getToken() {
	var token;
	
	$.ajax({
		method: "GET",
		async: false,
		url: "/api/token",
		success: function(data) {
			token = data;
		}
	});
	
	return token.token;
}

function perform() {
	window.commentcontroller.perform({
		"click .SendITcomm": "post",
		"click .comm_open": "read"
	});
	
	window.postcontroller.perform({
		"click #more": "render_more",
		"click #SendIT": "post",
		"click .edit": "edit",
		"click .delete": "del"
	});
}
