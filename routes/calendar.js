
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

  	res.send("Create new calendar: " + id);
};


exports.view = function(req, res){
  	res.send("Viewing calendar");
};