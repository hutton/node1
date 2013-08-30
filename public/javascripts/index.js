addEventListener("load", function() {window.scrollTo(1, 0);}, false);

var fromPlaceholder = "Your email address";
var toPlaceholder = "Invitees";
var subjectPlaceholder = "e.g. Poker night";

function styleInputDiv(element, defaultText){
	if ($(element).text() === defaultText){
		$(element).addClass("div-placeholder");
	} else {
		$(element).removeClass("div-placeholder");
	}
}

function initInputDivDefaultText(element, defaultText){
	element.keyup(function(){
		styleInputDiv(this, defaultText);
	});

	element.focus(function(){
		if ($(this).text() === defaultText){
			$(this).html("");
		}

		styleInputDiv(this, defaultText);
	});

	element.blur(function(){
		if ($(this).text() === ""){
			$(this).html(defaultText);
		}

		styleInputDiv(this, defaultText);
	});

	element.text(defaultText);
}

$(document).ready(function(){

	$("#mail-from").highlight();
	$("#mail-to").highlight();

	initInputDivDefaultText($("#mail-from"), fromPlaceholder);
	initInputDivDefaultText($("#mail-to"), toPlaceholder);
	initInputDivDefaultText($("#mail-subject"), subjectPlaceholder);

	$("#send-mail").on("click touchstart",function(){
		var to = $("#mail-to").text();
		var from = $("#mail-from").text();
		var subject = $("#mail-subject").text();
		var message = $("#mail-message").text();

		$.ajax({
			url: "/new-mail",
			type: "POST",
			data: {
				to: to,
				from: from,
				subject: subject,
				message: message
			}
		}).done(function(data) {
			window.location = data.redirect;
		});
	});
});