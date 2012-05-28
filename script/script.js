function logout() {
    var token = getToken();
    
    $.ajax("http://lufny.it.cx/api/logout?token="+token, {async: false});
    window.location = "logreg.html";
}
        
var prerender = function () {
	//fleXenv.fleXcrollMain('meright');
	$( "#SETTINGS" ).dialog({
		modal: true,
		resizable: false,
		minHeight: 250,
		minWidth: 400,
		autoOpen: false
	});
	/* JQUERY UI EVENTS 'N' DESIGN */
	$( "#tabs" ).tabs();
	
    $("#Send").button({
        icons: {
            primary: "ui-icon-check"
        }
    });
	if (document.getElementById("Send")) // Not in login
		document.getElementById("Send").getElementsByClassName("ui-button-text")[0].id = "SendIT";
	
	$("#send_opt").button({
        icons: {
            primary: "ui-icon-check"
        }
    });
	
	/*$(".SendITcomm").button({
        icons: {
            primary: "ui-icon-check"
        }
    });*/
	
    $("#user_stat").button();
	
    $("#follow").button({
        icons: {
            primary: "ui-icon-heart"
        }
    });
	
	$("#PM").button({
        icons: {
            primary: "ui-icon-mail-closed"
        }
    });
		
		/*$("#SendIT").click(function() {
			var noty_id = noty({	text: 	'noty - a jquery notification library!',
									layout: 'bottomRight',
									type:	'success'
								});
		});*/
	
    $("#favourites").button({
        icons: {
            primary: "ui-icon-star"
        }
    });
	
	$("#reg_it").button({
        icons: {
            primary: "ui-icon-star"
        }
    });
	
	$("#login_it").button({
        icons: {
            primary: "ui-icon-star"
        }
    });
	
    $(".button_comments").button({
        icons: {
            primary: "ui-icon-locked"
        },
        text: false
    }); 
	
	/* RIGHT BAR ITEMS */
	$("#_new_post").click(function () {
		$( "#NEWPOST-send" ).dialog({
			modal: true,
			resizable: false,
			minHeight: 250,
			minWidth: 400
		});
    });
	
	/* POST OPEN */
	/*$(".singlepost").click(function() {
		var cbox = $(this).children(".cbox");
        if (cbox.css("display") != "none") {
            cbox.hide();
        } else {
            cbox.show();
        }
	});*/
	
	/* FOLLOW EVENT */
    //$("#follow").click(function () {}); 
	
	/* SLIDE STATS EVENT */
    /*$("#PM").click(function () {
		$( "#PM-send" ).dialog({
			modal: true,
			resizable: false
		});
    });*/
	
    $("#go-settings").click(function () {
		$( "#SETTINGS" ).dialog('open');
    });
	
    $("#user_stat").click(function () {
        $(".onemenu").hide();
        $(".stats_bio").show();
    }); 
	
	/* POSTS EVENTS 
    $(".singlepost").live("mouseover",function () {
        $(this).children(".pmenu").show();
    });
	
	$(".singlepost").live("mouseout", function () {
        $(this).children(".pmenu").hide();
    });
	
    $(".comm_open").live("click", function () {
        var cbox = $(this).parent().parent().children(".cbox");
        if (cbox.css("display") != "none") {
            $(this).parent().parent().children(".cbox").hide();
        } else {
            $(this).parent().parent().children(".cbox").show();
        }
    });*/
	
	/* NOTIFICHE */
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
			}
		})
	}
	
	/* TEXTBOX AUTOCOMPLETE TAG */
	//text_b = $('#cane');
	/*
	text_b.focus().keyup(function() {
		if(CheckTagChar(text_b.val())) {
			text_b.autocomplete({ source: ["c++", "java", "php", "coldfusion", "javascript", "asp", "ruby"] });
		}
	});*/
	//text_b.autocomplete({ source: ["c++", "java", "php", "coldfusion", "javascript", "asp", "ruby"] });
	
	/* CLOSE DEI POSTS */
	respost = $('#_res_post');
	
	respost.click(function() {
		$(".cbox").hide();
	});
	
	/* PREVIEWS! */
	
};

function ChangeStar_() {
	
}

function random_string(len) { // do not use len for secured functions (like email validation token)
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz", rands = "", n, randn, ms = new Date().getTime(),
		md5 = new Hashes.MD5();
	len = (len == undefined) ? 32 : len;

	for (n=0; n<len; n++) {
		randn = Math.abs(Math.floor(Math.random() * chars.length-1)); 		
		rands += chars[randn];
	}
	
	rands = md5.hex(ms+rands).substr(0, len);
	return rands;
}

function postrender() {
    $(".singlepost").live("mouseover",function () {
        $(this).children(".pmenu").show();
    });
	
	$(".singlepost").live("mouseout", function () {
        $(this).children(".pmenu").hide();
    });
	
    $(".comm_open").live("click", function () {
        var cbox = $(this).parent().parent().children(".cbox");
        if (cbox.css("display") != "none") {
            $(this).parent().parent().children(".cbox").hide();
        } else {
            $(this).parent().parent().children(".cbox").show();
        }
    });
}

function CheckTagChar(text) {
	if(text.charAt(text.length-1) == "@" && text.charAt(text.length-2) == " ") {
		return true;
	}
	else {
		return false;
	}
}	

$(document).ready(prerender);
