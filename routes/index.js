
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index.html');
};

exports.help = function(req, res){
  res.render('help.html');
};