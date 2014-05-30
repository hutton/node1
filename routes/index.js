
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index.html');
};

exports.index2 = function(req, res){
  res.render('index2.html');
};

exports.help = function(req, res){
  res.render('help.html');
};

exports.about = function(req, res){
  res.render('about.html');
};

// exports.event = function(req, res){
//   res.render('event_static.html');
// };

exports.event2 = function(req, res){
  res.render('event2_static.html');
};

exports.email = function(req, res){
  res.render('email2.html');
};

exports.notFound = function(req, res){
  res.status(404);
  res.render('404.html');
};