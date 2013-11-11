var mail = require("./mail");


function validate(actual, expected){
	if (expected.trim() === actual.trim()){
		console.log("Success with: ", expected);
	} else {
		console.log("*****************************");
		console.log("Failed with");
		console.log(expected);
		console.log("--------- got --------");
		console.log(actual);
		console.log("*****************************");
	}
}

var m = "Monday Tuesday \n\
\n\
\n\
On 3 Jul 2013, at 10:07, Simon Hutton via Convenely <playtime@convenely.mailgun.org> wrote:\n\
\n\
Convenely \n\
\n\
On the mat \n\
Welcome! *simon.hutton@gmail.com <#>* has created a email list to \n\
help schedule an event with the following people *simon.hutton@gmail.com<#> \n\
* Reply to this mail with when you're available and we'll keep track \n\
of who is available when Learn more";

validate(mail.firstResponse(m), "Monday Tuesday ");

m = "Simon@bookmarks.io\n\
\n\
\n\
\n\
\n\
\n\
On 10 Jul 2013, at 19:29, Simon Hutton via Convenely <feeding@convenely.com>\n\
\n\
\n\
wrote:\n\
\n\
\n\
\n\
 Convenely\n\
\n\
\n\
\n\
Go\n\
\n\
       Welcome! *simon.hutton@gmail.com <#>* has created a email list to\n\
\n\
help schedule an event with the following people     *simon.hutton@gmail.com<#>\n\
\n\
*      Reply to this mail with when you're available and we'll keep track\n\
\n\
of who is available when Learn more <http://convenely.com/#howdoesitwork>\n\
\n\
";

validate(mail.firstResponse(m), "Simon@bookmarks.io");

m = "Simon@bookmarks.io\n\
\n\
\n\
On 10 Jul 2013, at 19:29, Simon Hutton via Convenely <feeding@convenely.com>\n\
\n\
\n\
wrote:\n\
\n\
wrote:\n\
\n\
of who is available when Learn more <http://convenely.com/#howdoesitwork>\n\
\n\
";

validate(mail.firstResponse(m), "Simon@bookmarks.io");

m = "Simon@bookmarks.io\r\n\
\r\n\
\r\n\
On 10 Jul 2013, at 19:29, Simon Hutton via Convenely <feeding@convenely.com>\r\n\
\r\n\
\r\n\
wrote:\r\n\
\r\n\
wrote:\r\n\
\r\n\
of who is available when Learn more <http://convenely.com/#howdoesitwork>\r\n\
\r\n\
";

validate(mail.firstResponse(m), "Simon@bookmarks.io");

m = "Monday it good for me.\n\
\n\
\n\
\n\
From: again@convenely.com [mailto:again@convenely.com]\n\
\n\
Sent: 15 July 2013 12:53\n\
\n\
To: Simon HUTTON\n\
\n\
Subject: Re: Again\n\
\n\
\n\
\n\
I can do Thursday\n\
\n\
\n\
\n\
Thursday 18th Jul\n\
\n\
\n\
Simon Hutton\n\
\n\
✔ Free\n\
\n\
\n\
\n\
Availability by Convenely.com Learn more<http://convenely.com/#howdoesitwork>\n\
";

validate(mail.firstResponse(m), "Monday it good for me.");

m = "From phone\n\
\n\
On 8 Nov 2013, at 18:18, Simon Hutton via Convenely <\n\
new-style-from-train@convenely.com> wrote:\n\
\n\
 Demystifying Email Design    New style from train      Simon Hutton\n\
wrote:  This is my message, waiting to get off train. That's when it's\n\
stopped\n\
of course!\n\
\n\
Simon      View Event Online\n\
><http://mandrillapp.com/track/click.php?u=30104851&id=30d3e34e8ad34aa6b289663c41197a17&url=http%3A%2F%2Fconvenely.com%2Fevent%2Fz4NAD&url_id=9a63983b5c9ed6348dbb99d41bb966065385f314>\n\
\n\\n\
*Did you know* you can update your availability by replying to this email?\n\
\n\\n\
Reply with when you're free; 'I can do next Monday', 'Any day next week is\n\
good apart from Friday' and we'll update the event and let everyone know.\n\
\n\
";

validate(mail.firstResponse(m), "From phone");
