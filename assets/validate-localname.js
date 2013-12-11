
// !@£$%^&*()_+-=[]{};'\:"|,./<>?~`

function makeValidCalendarId(name){
	name = name.replace(/[+| ]/g,"-");
	name = name.replace(/[^a-zA-Z0-9_-]/g, "");
	name = name.replace(/-+/g, "-");

	return name;
}

function show(name){
	console.log(name + " -> " + makeValidCalendarId(name));
}

show("abc");
show("hello world");
show("hello_world!");
show("hello world&£@()[]");

show("!@£$%^&*()_+-=[]{};'\\:|,./<>?~`");