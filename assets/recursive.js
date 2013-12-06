
var count = 10;

function rec(callback){
	if (count-- <= 0){
		console.log("Calling callback");
		callback();
	} else {
		console.log("Recursing");
		rec(callback);
	}
}

rec(function(){
	console.log("Callback called");
});
