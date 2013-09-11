(function ( $ ) {

	$.fn.highlight = function( options ) {

		// This is the easiest way to have default options.
		var settings = $.extend({
			// These are the defaults.
			regex: "([a-zA-Z0-9\.-_]|(<[^>]+>))+@([a-zA-Z0-9\._-]|(<[^>]+>))+"
		}, options );

		var element = this;

		function cleanTags(str){
			if (str === null){
				return '';
			}

			return str.replace(/\<strong>/g, "").replace(/\<\/strong>/g, "").replace(/&nbsp;/g,' ');
		}

		function formatText(){
			if (typeof(rangy.saveSelection) !== "undefined"){
				var savedSel = rangy.saveSelection();

				var content = element.html();

				content = cleanTags(content);

				content = addTags(content);

				element.html(content);

				rangy.restoreSelection(savedSel);
			}

			return element;
		}

		function addTags(str){
			if (str === null){
				return '';
			}

			var regex = new RegExp("(^)" + settings.regex, "ig" );

			str = str.replace(regex, function(match){
				return "<strong>" + $.trim(match) + "</strong>";
			});

			regex = new RegExp("( )" + settings.regex, "ig" );

			str = str.replace(regex, function(match){
				return " <strong>" + $.trim(match) + "</strong>";
			});

			// regex = new RegExp("span>" + settings.regex, "ig" );

			// str = str.replace(regex, function(match){
			//     return "span><strong>" + match.substr(5) + "</strong>";
			// });

return str;
}

element.keyup(function(){
	formatText();
});

return formatText();
};

}( jQuery ));