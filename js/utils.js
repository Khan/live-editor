// Temporary solution until we get a full DB/UI implemented
var ExerciseMap = {
	// Starting point
	0: 537514895,
	
	// Intro to programming
	537514895: 527964494,
	
	// Intro to Variables 1
	527964494: 580591777,
	
	// Intro to Variables 2
	580591777: 612865753,
	
	// Basic computations
	612865753: 528949083,
	
	// Reading text
	528949083: 579066940,
	
	// Reading numbers
	579066940: 563383397,
	
	// Conditions
	// 563383397
	
	// For testing:
	1: 18
};

var apollo = typeof require !== "undefined" ?
	require("sjs:apollo-sys") :
	null;

$(document).delegate( "a.ui-button", {
	mouseenter: function() {
		if ( !$(this).hasClass( "ui-state-disabled" ) ) {
			$(this).addClass( "ui-state-hover" );
		}
	},
	
	mouseleave: function() {
		$(this).removeClass( "ui-state-hover" );
	},

	click: function( e ) {
		e.preventDefault();
		
		if ( !$(this).hasClass( "ui-state-disabled" ) ) {
			$(this).trigger( "buttonClick" );
		}
	}
});

$(document).delegate( ".tipbar .close", "click", function() {
	hideTip();

	return false;
});

$(document).delegate( ".tipbar .tipnav a", "click", function() {
	if ( !$(this).hasClass( "ui-state-disabled" ) ) {
		tipData.pos += $(this).hasClass( "next" ) ? 1 : -1;
		showTip();
	}
	
	return false;
});

$(document).delegate( ".tipbar form", "submit", function() {
	var answer = tipData.Question[ tipData.pos ].answer,
		input = $(this).find("input").first().val();
	
	extractResults();
	
	if ( answer === input ) {
		problemDone();
	}
	
	$(this)
		.find( ".status" ).remove().end()
		.append( "<p class='status'><span class='ui-icon ui-icon-circle-" + 
			(answer === input ? "check" : "close") + "'></span> " +
			(answer === input ? "Correct! Proceed to the next problem." : "Incorrect, try again or view the hints for help.") + "</p>" );
	
	return false;
});

var tipData = {
	pos: 0
};

var showTip = function( type, texts, callback ) {
	type = type || tipData.cur;
	
	if ( texts ) {
		tipData.pos = 0;
		tipData[ type ] = texts;
		tipData.callback = callback;
	}
	
	tipData.cur = type;
	texts = texts || tipData[ type ];
	
	var pos = tipData.pos,
		bar = $("#tipbar")
		.attr( "class", "tipbar ui-state-hover " + type.toLowerCase() )
		
		// Inject current text
		.find( "strong" ).text( type + ( texts.length > 1 ? " #" + (pos + 1) : "" ) + ":" ).end()
		.find( ".text" ).html( texts[ pos ].text || texts[ pos ] || "" ).end()
		.find( "a.prev" ).toggleClass( "ui-state-disabled", pos === 0 ).end()
		.find( "a.next" ).toggleClass( "ui-state-disabled", pos + 1 === texts.length ).end();
	
	bar.find( ".tipnav" ).toggle( texts.length > 1 );
	
	// Only animate the bar in if it's not visible
	if ( !bar.is(":visible") ) {
		bar
			.css({ bottom: -30, opacity: 0.1 })
			.show()
			.animate({ bottom: 33, opacity: 1.0 }, 300 );
	}
	
	if ( tipData.callback ) {
		tipData.callback( texts[ pos ] );
	}
};

var hideTip = function( type ) {
	if ( testAnswers && testAnswers.length > 0 ) {
		showQuestion();
	
	} else if ( !type || type === tipData.cur ) {
		$("#tipbar").animate({ bottom: -30, opacity: 0.1 }, 300, function() {
			$(this).hide();
		});
	}
};

var toggleTip = function( type, texts, callback ) {
	if ( !$("#tipbar").is(":visible") || tipData.cur !== type ) {
		showTip( type, texts, callback );
		
	} else {
		hideTip();
	}
};

jQuery.fn.buttonize = function() {
	return this.find(".ui-button")
		.addClass( "ui-widget ui-state-default ui-corner-all" )
		.find("span:first").addClass( "ui-button-icon-primary ui-icon" ).end()
		.filter(":has(.ui-button-text)")
			.addClass( "ui-button-text-icon-primary" )
		.end()
		.not(":has(.ui-button-text)")
			.addClass( "ui-button-icon-only" )
			.append( "<span class='ui-button-text'>&nbsp;</span>" )
		.end()
	.end();
};

jQuery.fn.editorText = function( text ) {
	var editor = this.data("editor");
	
	if ( text != null ) {
		if ( editor && editor.editor ) {
			editor.editor.getSession().setValue( text );
		}
		
	} else {
		return editor && editor.editor ?
			editor.editor.getSession().getValue().replace(/\r/g, "\n") :
			null;
	}
	
	return this;
};

jQuery.fn.extractCursor = function( testObj ) {
	var cursor = this.data( "editor" ).editor.getCursorPosition();
	
	testObj.cursorRow = cursor.row;
	testObj.cursorColumn = cursor.column;
	
	return this;
};

jQuery.fn.setCursor = function( testObj ) {
	if ( testObj && (testObj.cursorRow != null || testObj.row != null) ) {
		var editor = this.data( "editor" ).editor;
		
		editor.moveCursorToPosition({
			row: testObj.cursorRow || testObj.row || 0,
			column: testObj.cursorColumn || testObj.column || 0
		});
		
		editor.clearSelection();
		editor.focus();
	}
};

var setCursor = function( testObj ) {
	$("#editor").setCursor( testObj );
};

var formatTime = function( seconds ) {
	var min = Math.floor( seconds / 60 ),
		sec = Math.round( seconds % 60 );
	
	return min + ":" + (sec < 10 ? "0" : "") + sec;
};

var getExerciseList = function( callback ) {
	$.getJSON( "/api/labs/videoexercises", callback );
};

var getExercise = function( id, callback ) {
	$.getJSON( "/api/labs/videoexercises/" + id, function( exerciseData ) {
		lastSave = JSON.stringify( exerciseData );
		
		// Load in the user's saved progress
		loadResults( exerciseData, callback );
	});
};

var saveExercise = function( callback ) {
	// Make sure we get the latest data
	extractProblem( curProblem );
	
	var data = JSON.stringify( Exercise );
	
	$.ajax({
		url: "/api/labs/videoexercises" + (Exercise.id ? "/" + Exercise.id : ""),
		data: data,
		dataType: "JSON",
		type: Exercise.id ? "PUT" : "POST",
		contentType: "application/json",
		success: function( exerciseData ) {
			lastSave = JSON.stringify( exerciseData );
			callback( exerciseData );
		}
	});		
};

var problemDone = function() {
	curProblem.done = true;

	$("#main-tabs-nav .ui-tabs-selected").markDone();

	$("#next-problem-desc").show();
	$(".next-problem").show();
	$("#code").addClass( "done" );
	// TODO: Show next exercise, if applicable
};

jQuery.fn.markDone = function() {
	return this
		.next( "li" ).removeClass( "ui-state-disabled" ).end()
		.removeClass( "ui-state-disabled" )
 		.addClass( "icon-tab" )
		.find( "a" ).prepend( "<span class='ui-icon ui-icon-circle-check'></span>" ).end();
};

var saveResults = function( callback ) {
	var results = [],
		problems = Exercise.problems;
	
	for ( var i = 0; i < problems.length; i++ ) {
		var problem = problems[i];
		
		results.push({
			answer: problem.answer,
			done: problem.done,
			cursorRow: problem.cursorRow,
			cursorColumn: problem.cursorColumn
		});
	}
	
	window.localStorage[ "labs-cs-" + Exercise.id ] = JSON.stringify({ problems: results });
	
	if ( callback ) {
		callback();
	}
};

var loadResults = function( exercise, callback ) {
	var results = JSON.parse( window.localStorage[ "labs-cs-" + exercise.id ] || null );
	
	if ( results && results.problems ) {
		for ( var i = 0; i < results.problems.length; i++ ) {
			$.extend( exercise.problems[i], results.problems[i] );
		}
	}
	
	if ( callback ) {
		callback( exercise );
	}
};

var extractResults = function( code, callback ) {
	if ( testAnswers.length > 0 ) {
		code = $(".tipbar input").first().val();
	}
	
	if ( code !== curProblem.start || curProblem.answer != null ) {
		curProblem.answer = code;
	}
};

var openExerciseDialog = function( callback ) {
	var dialog = $("<div><ul><li>Loading...</li></ul></div>")
		.dialog({ title: "Open Exercise", modal: true });

	getExerciseList(function( exercises ) {
		var ul = dialog.find("ul");
	
		ul.html( exercises.length ? "" : "<li>No exercises found.</li>" );
	
		$.each( exercises, function() {
			var exercise = this;

			// TODO: Maybe show who created the exercise
			$("<li><a href=''>" + exercise.title + "</a></li>")
				.find("a").click(function() {
					ul.html( "<li>Loading exercise...</li>" );
				
					getExercise( exercise.id, function( exercise ) {
						callback( exercise );
					
						dialog.dialog( "destroy" );
					});

					return false;
				}).end()
				.appendTo( ul );
		});
	});
};

var connectAudio = function( callback ) {
	if ( window.SC && SC.isConnected() ) {
		if ( callback ) {
			callback();
		}
	
	} else {
		$.getScript( "http://connect.soundcloud.com/sdk.js", function() {
			SC.initialize({
				client_id: "82ff867e7207d75bc8bbd3d281d74bf4",
				redirect_uri: window.location.href.replace(/[^\/]*$/, "callback.html")
			});
		
			if ( window.Exercise && Exercise.audioID ) {
				SC.get( "/tracks/" + Exercise.audioID, function( data ) {
					if ( callback ) {
						callback( data );
					}
				});
			
			} else {
				SC.connect(function() {
					if ( callback ) {
						callback();
					}
				});
			}
		});
	}
};

var runCode = function( code, context ) {
	try {
		if ( typeof apollo !== "undefined" ) {
			apollo.eval( "(function(){" + code + "})();" );
		
		} else {
			(new Function( code ))();
		}
		
	} catch( e ) {
		// Temporarily hide the errors generated by using a prompt()
		// See: #50
		if ( !/Unexpected end of input/.test( e.message ) ) {
			errors.push({
				row: 0,
				column: 0,
				text: e.message,
				type: "error"
			});
		}
	}
};

$(document).delegate( "#output form", "submit", function() {
	var val = $(this).find("input[type='text']").val();

	$(this)
		.after( clean( val ) )
		.remove();

	if ( window.waitInput ) {
		window.waitInput( val );
	}

	return false;
});

var clean = function( str ) {
	return String( str ).replace( /</g, "&lt;" );
};

var outputs = [],
	tests = [],
	testAnswers = [],
	asserts = [],
	waitTest,
	waitTestPrint,
	waitTestInput,
	waitInput,
	toInput,
	testOutput = [],
	testMode = false;
	
var test = function( name, fn ) {
	if ( !fn ) {
		fn = name;
		name = "Test Case";
	}
	
	tests.push({
		name: name,
		
		fn: function() {
			try {
				return fn.apply( this, arguments );
				
			} catch( e ) {
				errors.push({
		            row: 0,
		            column: 0,
		            text: e.message,
		            type: "error"
		        });
		
				assert( false, "Error: " + e.message );
			}
		}
	});
};

var testIO = function() {
	test.apply( this, arguments );
	
	tests[ tests.length - 1 ].io = true;
};

var testAnswer = function( name, val ) {
	testAnswers.push({ answer: val, text: "<form>" + name +
		"<br/><input type='text'/>" +
		"<input type='submit' value='Check Answer' class='ui-button'/></form>" });
};

var resumeTest = function() {
	if ( window.waitTest ) {
		var doResume = window.waitTest;
		window.waitTest = undefined;
		doResume();
	}
};

var finalResumeTest = function() {
	if ( window.waitTestInput ) {
		window.waitTestInput = undefined;
		assert( false, "An expected input() was not found." );
	}
	
	if ( window.waitTestPrint ) {
		window.waitTestPrint = undefined;
		assert( false, "An expected print() call was not found." );
	}
};

var runTests = function( userCode, curProblem ) {
	testMode = true;
	
	asserts = [];
	
	for ( var i = 0; i < tests.length; i++ ) (function( test ) {
		clear();
		
		var testset = $("<fieldset><legend>" + test.name + "</legend><ul></ul></fieldset>")
			.appendTo("#results .desc");
		
		// TODO: Have all tests run after user's code has been defined
		// Will need to force input/print statements to block during testMode
		
		// We're doing an IO test
		if ( tests[i].io ) {
			testOutput = [];
			
			// Load up the IO tests
			runCode( "waitfor() { window.waitTest = resume; } tests[" + i + "].fn();" );
			
			testset
				.data( "output", testOutput )
				.find( "legend" )
					.append( " (<a href=''>View Output</a>)" );
			
			// Then run the user's code
			runCode( userCode );
		
		// Otherwise we're just running a normal test
		} else {
			// We need to maintain the closure so we have to re-initialize the tests
			// and then run the current one. Definitely not ideal.
			runCode( userCode +
				"\n(function(){ tests = [];\n" +
				curProblem.validate + "\n})(); tests[" + i + "].fn();" );
		}
		
		window.waitTest = undefined;
			
		finalResumeTest();
	})( tests[i] );
	
	var total = asserts.length,
		pass = 0;
	
	for ( var i = 0; i < asserts.length; i++ ) {
		if ( asserts[i] ) {
			pass += 1;
		}
	}
	
	if ( total > 0 ) {
		if ( pass === total ) {
			problemDone();
		}
	
		$("#results").fadeIn( 400 );
	}
	
	testMode = false;
};

var print = function( msg ) {
	resumeTest();
	
	var output = $("#output");
	
	output.append( "<div>" + clean( msg ) + "</div>" );
	output.scrollTop( output[0].scrollHeight );
	
	outputs.push( msg );
	
	if ( window.waitTestPrint ) {
		var doResume = window.waitTestPrint;
		window.waitTestPrint = undefined
		doResume( msg );
	}
};

var showInput = function( msg ) {
	focusOutput();
	
	var output = $("#output");
	
	output.append( "<div>" + clean( msg ) + " " +
		( window.toInput != null ?
			window.toInput :
			"<form><input type='text'/> <input type='submit' value='Enter'/></form></div>" ) );
	
	output.scrollTop( output[0].scrollHeight );

	output.find("input[type='text']").last().focus();
};

var clear = function() {
	$("#output").empty();
	outputs = [];
};

var focusOutput = function() {
	$("#output-nav").removeClass( "ui-state-disabled" );
	$("#editor-box-tabs").tabs( "select", 1 );
};

var focusTests = function() {
	$("#editor-box-tabs").tabs( "select", 2 );
};

var assertIcons = {
	pass: "circle-check",
	error: "alert",
	info: "info"
};

var log = function( msg, type, expected ) {
	type = type || "info";
	
	$("<li class='" + type + "'><span class='ui-icon ui-icon-" +
		assertIcons[ type ] + "'></span> <a href='' class='msg'>" +
		clean( msg ) + "</a></li>")
		.data( "expected", expected || false )
		.appendTo( $("#results ul").last() )
};

var assert = function( pass, msg, type ) {
	log( msg, !!pass ? "pass" : "error" );
	
	if ( typeof asserts !== "undefined" ) {
		asserts.push( !!pass );
	}
	
	return !!pass;
};

var isEqual = function( a, b, msg, type ) {
	log( msg, a === b ? "pass" : "error", [ a, b ] );
	
	if ( typeof asserts !== "undefined" ) {
		asserts.push( a === b );
	}
	
	return a === b;
};