
/*
 * GET users listing.
 */

function makeid(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

exports.new = function(req, res){
	var id = makeid(10);

  	console.log("Create new calendar: " + id);

  	// Create calendar and redirect

  	res.redirect('/' + id);
};


exports.view = function(req, res){
  	res.send("Viewing calendar");
};