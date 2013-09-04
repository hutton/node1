addEventListener("load", function() {window.scrollTo(1, 0);}, false);

var fromPlaceholder = "Your email address";
var toPlaceholder = "Invitees email addresses";
var subjectPlaceholder = "Your event";

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

function inputFromDefaultText(text, defaultText){
	if (text === defaultText){
		return "";
	}
}

$(document).ready(function(){

	$("#mail-from").highlight();
	$("#mail-to").highlight();

	initInputDivDefaultText($("#mail-from"), fromPlaceholder);
	initInputDivDefaultText($("#mail-to"), toPlaceholder);
	initInputDivDefaultText($("#mail-subject"), subjectPlaceholder);

	$("#send-mail").on("click touchstart", function(){
		var to = $("#mail-to").text();
		var message = $("#mail-message").text();

		var from = inputFromDefaultText($("#mail-from").text(), fromPlaceholder);
		var subject = inputFromDefaultText($("#mail-subject").text(), subjectPlaceholder);

		if (from === "" || subject === "" || message === ""){
			return;
		}

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