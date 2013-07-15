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

