/*             __________________________________________
 *            |      |      |______|_     _|      |      |
 *  __________|   ---|   |  |______  |   | |  |   |  |   |
 * | | | |__| |   ---|   |  |      | |   | |  |   |    | |
 * |_____|____|______|______|______| |___| |______|____|_|
 */
/*!
 * @name	: wjEDITOR
 * @author	: Wouter J
 * @version	: 1.2b
 * @license	: Creative Commons Share Alike - Unported
 *			  http://creativecommons.org/licenses/by-sa/3.0/
 */

(function( window, undefined ) {

	var document = window.document,
		iElem, rElem, txt, 
		options = {
			startTag : '[',
			endTag : ']',
			result : false
		},
		selecting = false,
		elem = {};

    /*
     * getElementsByTagName polyfill for IE8-
     * @author Eikes
     * @url https://gist.github.com/2299607
     */
    if (!document.getElementsByClassName) {
      document.getElementsByClassName = function(search) {
        var d = document, elements, pattern, i, results = [];
        if (d.querySelectorAll) { // IE8
          return d.querySelectorAll("." + search);
        }
        if (d.evaluate) { // IE6, IE7
          pattern = ".//*[contains(concat(' ', @class, ' '), ' " + search + " ')]";
          elements = d.evaluate(pattern, d, null, 0, null);
          while ((i = elements.iterateNext())) {
            results.push(i);
          }
        } else {
          elements = d.getElementsByTagName("*");
          pattern = new RegExp("(^|\\s)" + search + "(\\s|$)");
          for (i = 0; i < elements.length; i++) {
            if ( pattern.test(elements[i].className) ) {
              results.push(elements[i]);
            }
          }
        }
        return results;
      }
    }

	/*
	 * Escape metacharacters for RegExp
	 */
	escapeMetas = function( str ) {
		str = str.replace(/\[/g, '\\[');
		str = str.replace(/\]/g, '\\]');
		str = str.replace(/\)/g, '\\)');
		str = str.replace(/\(/g, '\\(');
		str = str.replace(/\|/g, '\\|');
		str = str.replace(/\//g, '\\/');
		return str;
	};
	/*
	 * NL2BR function in JS
	 * @author	: Kevin van Zonneveld @ http://phpjs.org/functions/nl2br
	 */
	nl2br = function( str, is_xhtml ) {
		return str.replace(/\n|\r/g, '<br' + (is_xhtml ? ' /' : '') + '>');
	};
		
	/*
	 * The main object
	 */
	wjEditor = function( iEl, rEl, option ) {

		if( typeof rEl === 'object' && option === undefined ) {
			if( rEl.nodeName ) {
				// Handle editor( inputEl, resultEl )
				option = null;
			}
			else {
				// Handle editor( inputEl, options )
				option = rEl;
				// If no result div is set, make a fake div to store the results on
				rEl = document.createElement('div');
			}
		}
		else if( rEl === undefined ) {
			// Handle editor( inputEl )
			rEl = iEl;
			option = null;
		}

		// Set up the input element
		iElem = (iEl.nodeName
					? iEl
					: document.getElementById(iEl));
		// Set up the result element
		rElem = (rEl.nodeName
					? rEl
					: document.getElementById(rEl));
		// Set up the options
		for( i in option ) {
			if( i in options ) {
				options[i] = option[i];
			}
		}

		// Return new constructor
		return new wjEditor.fn.init();
	};

	// Make some info
	wjEditor.info = {
		version : 1.0,
		beta : false,
		lastUpdate : '31-12-2011T00:35+1:00'
	};

	// The editor object
	wjEditor.fn = wjEditor.prototype = {
		
		// The constructor
		init : function() {
				   var edit = this;

				   // Make select event (selecting by mouse)
				   iElem.onmouseup = function() {
					   txt = $e.getSelection(this);
				   };

				   // Make a second select event (selecting with Shift + arrows)
				   iElem.onkeyup = function( e ) {
					   // Als shift is ingedrukt
					   if( (e && e.keyCode == 16) || (window.event.keyCode && window.event.keyCode == 16) ) {
						   txt = $e.getSelection(this);
					   }

					   // Make result live result
					   $e.result( iElem.value );
				   };

				   // Zorg dat resultaat al zichtbaar is
				   if( options.result ) {
					   rElem.innerHTML = iElem.value;
				   }

				   return wjEditor.fn;
			   },

		/*
		 * @name	: get_selection
		 * @author	: Guest @ http://stackoverflow.com/a/2966703
		 */
		getSelection : function( e ) {
						//Mozilla and DOM 3.0
						if('selectionStart' in e)
						{
							var l = e.selectionEnd - e.selectionStart;
							return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
						}
						//IE
						else if(document.selection)
						{
							e.focus();
							var r = document.selection.createRange();
							var tr = e.createTextRange();
							var tr2 = tr.duplicate();
							tr2.moveToBookmark(r.getBookmark());
							tr.setEndPoint('EndToStart',tr2);
							if (r == null || tr == null) return { start: e.value.length, end: e.value.length, length: 0, text: '' };
							var text_part = r.text.replace(/[\r\n]/g,'.'); //for some reason IE doesn't always count the \n and \r in the length
							var text_whole = e.value.replace(/[\r\n]/g,'.');
							var the_start = text_whole.indexOf(text_part,tr.text.length);
							return { start: the_start, end: the_start + text_part.length, length: text_part.length, text: r.text };
						}
						//Browser not supported
						else return { start: e.value.length, end: e.value.length, length: 0, text: '' };
					},
		
		/*
		 * @name	: addNormalTag
		 * @author	: Wouter J
		 */
		addNormalTag : function( tagName, tagResultName ) {

							iCode = options.startTag + tagName + options.endTag + '?' + options.startTag + '/' + tagName + options.endTag;

						    // Zorg dat als result aan is het wordt aangepast
						    if( tagResultName !== undefined ) {
								rCode = '<' + tagResultName + '>?' + '</' + tagResultName + '>';
							}
							else {
								rCode = '<' + tagName + '>?' + '</' + tagName + '>';
							}


							elem[tagName.replace(/-/, '')] = {
								name : tagName,

								input : iCode,
								result : rCode
							};
					   },

		/*
		 * @name	: addSpecialTag
		 * @author	: Wouter J
		 */
		addSpecialTag : function( tagName, iCode, rCode ) {
							// Als er geen input code is ingesteld
							if( iCode === undefined )
								return false;

							elem[tagName.replace(/-/, '')] = {
								name : tagName,

								input : iCode,
								result : rCode
							};
						},

		/*
		 * @name	: trigger
		 * @autor	: Wouter J
		 */
		trigger : function( name ) {
					  var code = elem[name];

					// Haal het beginpunt en eindpunt van de geselecteerde tekst op
					var start = txt.start,
						end = start + txt.text.length,
						text = code.input.replace(/\?/g, txt.text);

					  $e.createCode( start, end, text, code.input, code.result );
				  },

		/*
		 * @name	: createCode
		 * @author	: Wouter J
		 */
		createCode : function( startPos, endPos, replacedText, iCode, rCode ) {
						 if( arguments.length < 3 )
							 return false;

						 iElem.value = iElem.value.substr(0, startPos) + replacedText + iElem.value.substr(endPos);

						 if( rCode === undefined || rCode === null ) {
							 $e.result( iElem.value );
						 }
						 else
						 {
							 $e.result( iElem.value.replace(/</, '&lt;').replace(/>/, '&gt;'), iCode, rCode );
						 }
					 },

		/*
		 * @name	: Result
		 * @author	: Wouter J
		 */
		result : function( str, fCode, tCode ) {
					 // Kijken of options.result true is
					 if( options.result ) {
						 var tags = [];

						 function addTag( text ) {
							 t = text.substr(1, text.length-2);
							 tags.push(t);
							 return text;
						 }

						 str.replace(/\[[^\/](.*?)(?:=|\])/g, addTag);

						 for( i=-1; tag = tags[++i]; ) {
							 if( elem[tag] !== undefined ) {
								 var info = elem[tag];
							 }
							 else {
								 continue;
							 }

							var from = escapeMetas(info.input).replace(/\?/g, '(.*?)'),
								rgx = RegExp(from);

							function getResultCode() {
								var args = arguments;
								function specialResult() {
									return args[arguments[1]]
								}
								function normalResult() {
									return String(args[1]) + String(arguments[1]);
								}
								return info.result.replace(/\?(\d)/g, specialResult).replace(/\?(\D)/g, normalResult);
							}

							 if( f === undefined ) {
								rElem.innerHTML = nl2br(str.replace(rgx, getResultCode));
								var f = true;
							 }
							 else {
								 rElem.innerHTML = nl2br(rElem.innerHTML.replace(rgx, getResultCode));
							 }
						 }
					 }
				 }
	};



	// Save a local copy of the current wjEditor var
	var _wjEditor = window.wjEditor;
	window.wjEditor = wjEditor;
	var $e = window.wjEditor.fn;

})( window );
