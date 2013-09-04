
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index.html');
};

exports.help = function(req, res){
  res.render('help.html');
};

exports.event = function(req, res){
  res.render('event_static.html');
};

exports.event2 = function(req, res){
  res.render('event2_static.html');
};

exports.highlight = function(req, res){
  res.render('highlight-demo.html');
};