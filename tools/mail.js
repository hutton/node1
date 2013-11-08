var _ = require("underscore");
var moment = require("moment");
var logger = require("./logger");
var mandrill = require('mandrill-api/mandrill');

var mandrillApiKey = 'ZghEsfeVFCfYT5zLpmRX2Q';

function firstResponse(fullMessage) {
	var outlookMatch = /^.*On.*(\r\n|\n)*wrote:$/m;
	var regex1 = /From:.*@convenely.*$/m;
	var regex2 = /<(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@convenely/m;
	var regex3 = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@convenely.com\s+wrote:/m;
	var regex4 = /-+original\s+message-+\s*$/m;
	var regex5 = /from:\s*$/m;

	var regexMatchs = [];
 
	regexMatchs.push(outlookMatch);
	regexMatchs.push(regex1);
	regexMatchs.push(regex2);
	regexMatchs.push(regex3);
	regexMatchs.push(regex4);
	regexMatchs.push(regex5);
 
	for (var i=0; i < regexMatchs.length; i++){
		var matches = fullMessage.split(regexMatchs[i]);
 
		if (matches.length > 1){
			return matches[0];
		}
	}
 
	return fullMessage;
}

function getEmailAddresses(text){
	var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;

	var result = text.match(re);

	if (result == null){
		return []
	}
	
	return text.match(re);
}

function getEmailName(text){
	var result = text.match(/[a-z A-Z 0-9 "']*(?=<)/g);

	if (result === null){
		return "";
	}

	return result[0].replace(/\"/g,'').trim();
}

function sendMail(calendar, subject, message, fromName){
	logger.info("Sending mail to group: " + calendar.id );

	var mandrill_client = new mandrill.Mandrill(mandrillApiKey);

	_.each(calendar.choices, function(choice){
		choice.columnDate = moment(choice.date).format("dddd D MMMM");
	});

	var sortedChoices = _.sortBy(calendar.choices, function(choice){
		return choice.date;
	});

	sortedChoices = _.filter(sortedChoices, function(choice){
		return choice.free.length > 0;
	});

	message = message.replace(/\n/g, '<br />');

	if (_.isUndefined(subject) || subject.length === 0){
		subject = "RE: " + calendar.name;
	}

	_.each(calendar.attendees, function(attendee){
		attendee.prettyName = attendee.name || attendee.email;
	});

	_.each(calendar.attendees, function(attendee){

		global.app.render('email-template.html', {
			attendee: attendee,
			calendar: calendar,
			choices: sortedChoices,
			attendees: calendar.attendees,
			message: message,
			subject: subject
		}, function(err, html){

			if (err){
				logger.info(err);
			}

			logger.info("Sending mail to: " + attendee.email );

			try{
				var message = {
					"html": html,
					"subject": subject,
					"from_email": calendar.id + "@convenely.com",
					"to": [{
						"email": attendee.email,
						"type": "to"
					}]};

				if (attendee.name !== null && attendee.name != ""){
					message.to.name = attendee.name;
				}

				if (fromName !== ""){
					message.from_name = fromName + " via Convenely";
				}

				mandrill_client.messages.send({"message": message}, function(result) {
						logger.info('Email sent to: ' + attendee.email);
					    logger.info(result);
					}, function(e) {

					    logger.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);

						logger.info('Failed sending email to: ' + attendee.email);
					});
			} catch (e){
				logger.error("Failed to send email to: " + mail.to);
				logger.error(e);
			}
		});
	});
}

function sendMailToAttendee(calendar, toAttendee, subject, message, fromName){
	logger.info("Sending mail to attendee: " + toAttendee.email );

	var mandrill_client = new mandrill.Mandrill(mandrillApiKey);

	_.each(calendar.choices, function(choice){
		choice.columnDate = moment(choice.date).format("dddd D MMMM");
	});

	var sortedChoices = _.sortBy(calendar.choices, function(choice){
		return choice.date;
	});

	sortedChoices = _.filter(sortedChoices, function(choice){
		return choice.free.length > 0;
	});

	message = message.replace(/\n/g, '<br />');

	_.each(calendar.attendees, function(attendee){
		attendee.prettyName = attendee.name || attendee.email;
	});

	toAttendee.prettyName = toAttendee.name || toAttendee.email;

	global.app.render('email-template.html', {
		attendee: toAttendee,
		calendar: calendar,
		choices: sortedChoices,
		attendees: calendar.attendees,
		message: message,
		subject: subject
	}, function(err, html){

		if (err){
			logger.info(err);
		}

		logger.info("Sending mail to: " + toAttendee.email );

		try{

			var message = {
				"html": html,
				"subject": subject,
				"from_email": calendar.id + "@convenely.com",
				"to": [{
					"email": toAttendee.email,
					"type": "to"
				}]};


			if (toAttendee.name != null && toAttendee.name != ""){
				message.to.name = toAttendee.name;
			}

			if (fromName != ""){
				message.from_name = fromName + " via Convenely";
			}

			mandrill_client.messages.send({"message": message}, function(result) {
					logger.info('Email sent to: ' + toAttendee.email);
				    logger.info(result);
				}, function(e) {

				    logger.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);

					logger.error('Failed sending email to: ' + toAttendee.email);
				});
		} catch (e){
			logger.error("Failed to send email to: " + toAttendee.email);
			logger.error(e);
		}
	});
}

function sendWereInBetaEmail(to){
	var message = "We're in private beta at the moment so can't help with scheduling your event. \n\
\n\
Be sure to sign up to our mailing list at http://eepurl.com/B2A1j so we can let you know when we launch.\n\
\n\
Thanks\n\
Simon\n\
\n\
";

	sendTextMail(to, "simon@convenely.com" ,"Hold your horses!", message);
}

function sendCouldntFindCalendarEmail(to, missingCalendarEmail){
	var message = "Hi, \n\
You sent an email to " + missingCalendarEmail + " but we don't have an event registered at that address.  If you think you have the right address please let me know so I can look into it.\n\
\n\
Thanks\n\
Simon\n\
\n\
";

	sendTextMail(to, "simon@convenely.com" ,"Sorry, we couldn't find the event you were looking for.", message);
}


function sendCouldntFindYouInCalendarEmail(to, missingCalendarEmail){
	var message = "Hi, \n\
You sent an email to " + missingCalendarEmail + " but your email address isn't registered with this event.\n\
\n\
Thanks\n\
Simon\n\
\n\
";

	sendTextMail(to, "simon@convenely.com" ,"Sorry, we couldn't update your event.", message);
}

function sendTextMail(to, from, subject, text){
	var mandrill_client = new mandrill.Mandrill(mandrillApiKey);

	var message = {
		"text": text,
		"subject": subject,
		"from_email": from,
		"to": [{
			"email": to,
			"type": "to"
		}]};

	mandrill_client.messages.send({"message": message}, function(result) {
			logger.info('Email sent to: ' + to + ' subject:' + subject);
		    logger.info(result);
		}, function(e) {

			logger.error('Failed to send email to: ' + to + ' subject:' + subject);
		    logger.error('A mandrill error occurred: ' + e.name + ' - ' + e.message);
		});
}

function htmlMailToText(str){
	str = (str || "").toString("utf-8").trim();
 
	// remove head
	str = str.replace(/<head[\s\S]{1,}?\/head>/gi, '');
 
	// replace newlines
	str = str.replace(/\r?\n|\r/g,"-\u0002\u0002-");
 
	// convert block element endings to linebreak markers
	str = str.replace(/<(?:\/p|br|\/tr|\/table|\/div)>/g,"-\u0000\u0000--\u0000\u0000-");
 
	// H1-H6, add underline or prepend with #
	str = str.replace(/<[hH](\d)[^>]*>(.*?)<\/[hH]\d[^>]*>/g,function(match, level, content){
		var line = "",
			symbol, // line symbol char
			len;
 
		level = Number(level) || 0;
 
		content = decodeHTMLEntities(content.replace(/<[^>]*>/g," ").
					replace(/\s\s+/g," ")).
					trim();
 
		if(!content){
			// the tag was empty or only included other tags (<img> and such), nothing to show
			return "";
		}
 
		// select correct symbol for the line
		switch(level){
			case 1:
				symbol = "=";
				len = content.length;
				break;
			case 2:
				symbol = "-";
				len = content.length;
				break;
			default:
				symbol = "#";
				len = level;
		}
 
		line = new Array(len+1).join(symbol);
 
		if(symbol == "#"){
			// prepend the line:
			// ### This is a H3
			return line + " " + content + "\n\n";
		}else{
			// add underline:
			// This is a H1
			// ============
			return content + "\n" + line + "\n\n";
		}
 
	});
 
	// B
	str = str.replace(/<(?:b|strong)(?: [^>])?>(.*?)<\/(?:b|strong)>/ig,function(match, content){
		return "**" + content.trim() + "**";
	});
 
	// U
	str = str.replace(/<u(?: [^>])?>(.*?)<\/u>/ig,function(match, content){
		return "_" + content.trim() + "_";
	});
 
	// EM
	str = str.replace(/<(?:i|em)(?: [^>])?>(.*?)<\/(?:i|em)>/ig,function(match, content){
		return "*" + content.trim() + "*";
	});
 
	// CODE
	str = str.replace(/<code(?: [^>])?>(.*?)<\/code>/ig,function(match, content){
		return "`" + content.trim() + "`";
	});
 
	// A
	str = str.replace(/<a ([^>]*)>(.*?)<\/a[^>]*>/ig,function(match, params, content){
		var paramMatch = params.match(/href\s*=\s*['"]([^'"]+)['"]/),
			url = paramMatch && paramMatch[1] || "#";
 
		return "[" + content.trim() + "]" + "(" + url +")";
	});
 
	// UL, replace with newlines
	str = str.replace(/(<\/(?:ul|ol)>)/gi,"$1-\u0000\u0000--\u0000\u0000-");
 
	// LI, indent by 2 spaces + *
	str = str.replace(/<li[^>]*>(.*?)<\/?(?:li|ol|ul)[^>]*>/ig,function(match, content){
 
		content = content.replace(/<[^>]*>/g," ").
					replace(/\s\s+/g," ").
					trim();
 
		if(!content){
			// the tag was empty or only included other tags (<img> and such), nothing to show
			return "";
		}
 
		// return with the space placeholders
		return "-\u0001\u0001--\u0001\u0001-* " + content + "\n";
	});
 
	// PRE, indent by 4 spaces
	str = str.replace(/<pre[^>]*>(.*?)<\/pre[^>]*>/ig,function(match, content){
		if(!content){
			return "";
		}
 
		// remove empty lines before and after
		content = content.replace(/^((?:[ \t]*)\-\u0002\u0002\-)+|((?:\-\u0002\u0002\-[ \t]*))+$/g, "");
 
		// replace tabs with 4 spaces
		content = content.replace(/\t/g, "    ");
 
		// replace temp. linebreak placeholders with 4 space placehorlders
		content = content.replace(/\-\u0002\u0002\-([ ]*)/g, function(match, spaces){
			// keep spaces in the beginning of the lines
			spaces = spaces.replace(/ /g, "-\u0001\u0001-");
 
			return "\n-\u0001\u0001--\u0001\u0001--\u0001\u0001--\u0001\u0001-" + spaces;
		});
 
		content = content.replace(/</g,"&lt;").replace(/>/g,"&gt;");
 
		// add prepending 4 spaces
		return "\n-\u0001\u0001--\u0001\u0001--\u0001\u0001--\u0001\u0001-" + content.trim() + "\n\n";
	});
 
	// remove all remaining html tags
	str = str.replace(/<[^>]*>/g," ");
 
	// remove duplicate spaces
	str = str.replace(/[ ][ ]+/g," ");
 
	// remove temp. newlines
	str = str.replace(/-\u0002\u0002-/g," ");
 
	// restore newlines
	str = str.replace(/-\u0000\u0000-/g,"\n");
 
	// remove spaces before and after newlines
	str = str.replace(/[ \t]*\n[ \t]*/g,"\n");
 
	// remove more than 2 newlines in a row
	str = str.replace(/\n\n+/g,"\n\n");
 
	// restore hidden spaces
	str = str.replace(/-\u0001\u0001-/g," ");
 
	// decode HTML entities (&lt; and such)
	str = decodeHTMLEntities(str);
 
	return str.trim();
}
 
/**
 * <p>Decodes any HTML entities in a string into their unicode form</p>
 *
 * @param {String} text text to decode
 * @return {String} Decoded text
 */
function decodeHTMLEntities(text){
	var HTMLEntities = {
			apos:0x0027,quot:0x0022,amp:0x0026,lt:0x003C,gt:0x003E,nbsp:0x00A0,iexcl:0x00A1,cent:0x00A2,pound:0x00A3,
			curren:0x00A4,yen:0x00A5,brvbar:0x00A6,sect:0x00A7,uml:0x00A8,copy:0x00A9,ordf:0x00AA,laquo:0x00AB,
			not:0x00AC,shy:0x00AD,reg:0x00AE,macr:0x00AF,deg:0x00B0,plusmn:0x00B1,sup2:0x00B2,sup3:0x00B3,
			acute:0x00B4,micro:0x00B5,para:0x00B6,middot:0x00B7,cedil:0x00B8,sup1:0x00B9,ordm:0x00BA,raquo:0x00BB,
			frac14:0x00BC,frac12:0x00BD,frac34:0x00BE,iquest:0x00BF,Agrave:0x00C0,Aacute:0x00C1,Acirc:0x00C2,Atilde:0x00C3,
			Auml:0x00C4,Aring:0x00C5,AElig:0x00C6,Ccedil:0x00C7,Egrave:0x00C8,Eacute:0x00C9,Ecirc:0x00CA,Euml:0x00CB,
			Igrave:0x00CC,Iacute:0x00CD,Icirc:0x00CE,Iuml:0x00CF,ETH:0x00D0,Ntilde:0x00D1,Ograve:0x00D2,Oacute:0x00D3,
			Ocirc:0x00D4,Otilde:0x00D5,Ouml:0x00D6,times:0x00D7,Oslash:0x00D8,Ugrave:0x00D9,Uacute:0x00DA,Ucirc:0x00DB,
			Uuml:0x00DC,Yacute:0x00DD,THORN:0x00DE,szlig:0x00DF,agrave:0x00E0,aacute:0x00E1,acirc:0x00E2,atilde:0x00E3,
			auml:0x00E4,aring:0x00E5,aelig:0x00E6,ccedil:0x00E7,egrave:0x00E8,eacute:0x00E9,ecirc:0x00EA,euml:0x00EB,
			igrave:0x00EC,iacute:0x00ED,icirc:0x00EE,iuml:0x00EF,eth:0x00F0,ntilde:0x00F1,ograve:0x00F2,oacute:0x00F3,
			ocirc:0x00F4,otilde:0x00F5,ouml:0x00F6,divide:0x00F7,oslash:0x00F8,ugrave:0x00F9,uacute:0x00FA,ucirc:0x00FB,
			uuml:0x00FC,yacute:0x00FD,thorn:0x00FE,yuml:0x00FF,OElig:0x0152,oelig:0x0153,Scaron:0x0160,scaron:0x0161,
			Yuml:0x0178,fnof:0x0192,circ:0x02C6,tilde:0x02DC,Alpha:0x0391,Beta:0x0392,Gamma:0x0393,Delta:0x0394,
			Epsilon:0x0395,Zeta:0x0396,Eta:0x0397,Theta:0x0398,Iota:0x0399,Kappa:0x039A,Lambda:0x039B,Mu:0x039C,
			Nu:0x039D,Xi:0x039E,Omicron:0x039F,Pi:0x03A0,Rho:0x03A1,Sigma:0x03A3,Tau:0x03A4,Upsilon:0x03A5,
			Phi:0x03A6,Chi:0x03A7,Psi:0x03A8,Omega:0x03A9,alpha:0x03B1,beta:0x03B2,gamma:0x03B3,delta:0x03B4,
			epsilon:0x03B5,zeta:0x03B6,eta:0x03B7,theta:0x03B8,iota:0x03B9,kappa:0x03BA,lambda:0x03BB,mu:0x03BC,
			nu:0x03BD,xi:0x03BE,omicron:0x03BF,pi:0x03C0,rho:0x03C1,sigmaf:0x03C2,sigma:0x03C3,tau:0x03C4,
			upsilon:0x03C5,phi:0x03C6,chi:0x03C7,psi:0x03C8,omega:0x03C9,thetasym:0x03D1,upsih:0x03D2,piv:0x03D6,
			ensp:0x2002,emsp:0x2003,thinsp:0x2009,zwnj:0x200C,zwj:0x200D,lrm:0x200E,rlm:0x200F,ndash:0x2013,
			mdash:0x2014,lsquo:0x2018,rsquo:0x2019,sbquo:0x201A,ldquo:0x201C,rdquo:0x201D,bdquo:0x201E,dagger:0x2020,
			Dagger:0x2021,bull:0x2022,hellip:0x2026,permil:0x2030,prime:0x2032,Prime:0x2033,lsaquo:0x2039,rsaquo:0x203A,
			oline:0x203E,frasl:0x2044,euro:0x20AC,image:0x2111,weierp:0x2118,real:0x211C,trade:0x2122,alefsym:0x2135,
			larr:0x2190,uarr:0x2191,rarr:0x2192,darr:0x2193,harr:0x2194,crarr:0x21B5,lArr:0x21D0,uArr:0x21D1,
			rArr:0x21D2,dArr:0x21D3,hArr:0x21D4,forall:0x2200,part:0x2202,exist:0x2203,empty:0x2205,nabla:0x2207,
			isin:0x2208,notin:0x2209,ni:0x220B,prod:0x220F,sum:0x2211,minus:0x2212,lowast:0x2217,radic:0x221A,
			prop:0x221D,infin:0x221E,ang:0x2220,and:0x2227,or:0x2228,cap:0x2229,cup:0x222A,"int":0x222B,
			there4:0x2234,sim:0x223C,cong:0x2245,asymp:0x2248,ne:0x2260,equiv:0x2261,le:0x2264,ge:0x2265,
			sub:0x2282,sup:0x2283,nsub:0x2284,sube:0x2286,supe:0x2287,oplus:0x2295,otimes:0x2297,perp:0x22A5,
			sdot:0x22C5,lceil:0x2308,rceil:0x2309,lfloor:0x230A,rfloor:0x230B,lang:0x2329,rang:0x232A,loz:0x25CA,
			spades:0x2660,clubs:0x2663,hearts:0x2665,diams:0x2666
		};
 
	return text.replace(/&(.+?);/g, function(str, ent){
			return String.fromCharCode(ent[0] !== '#' ? HTMLEntities[ent] : ent[1] === 'x' ? parseInt(ent.substr(2),16) : parseInt(ent.substr(1), 10));
		}
	);
}

module.exports = {
	sendMail: sendMail,
	htmlMailToText: htmlMailToText,
	getEmailAddresses: getEmailAddresses,
	firstResponse: firstResponse,
	getEmailName: getEmailName,
	sendTextMail: sendTextMail,
	sendWereInBetaEmail: sendWereInBetaEmail,
	sendCouldntFindCalendarEmail: sendCouldntFindCalendarEmail,
	sendCouldntFindYouInCalendarEmail: sendCouldntFindYouInCalendarEmail,
	sendMailToAttendee: sendMailToAttendee
}
