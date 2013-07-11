var mail = require("./mail");


function validate(actual, expected){
	if (expected === actual){
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

var m = "Monday Tuesday \
\
\
On 3 Jul 2013, at 10:07, Simon Hutton via Convenely < \
playtime@convenely.mailgun.org> wrote: \
\
Convenely \
\
On the mat \
Welcome! *simon.hutton@gmail.com <#>* has created a email list to \
help schedule an event with the following people *simon.hutton@gmail.com<#> \
* Reply to this mail with when you're available and we'll keep track \
of who is available when Learn more";

validate(mail.firstResponse(m), "Monday Tuesday ");

 m = "Simon@bookmarks.io\
\
\
\
\
\
On 10 Jul 2013, at 19:29, Simon Hutton via Convenely <feeding@convenely.com> wrote:\
\
\
\
 Convenely\
\
\
\
Go\
\
       Welcome! *simon.hutton@gmail.com <#>* has created a email list to\
\
help schedule an event with the following people     *simon.hutton@gmail.com<#>\
\
*      Reply to this mail with when you're available and we'll keep track\
\
of who is available when Learn more <http://convenely.com/#howdoesitwork>\
\
";

validate(mail.firstResponse(m), "Simon@bookmarks.io");
