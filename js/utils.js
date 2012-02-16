var apollo = typeof require !== "undefined" ?
	require("sjs:apollo-sys") :
	null;

$(document).delegate( ".ui-button", {
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
	if ( testObj && testObj.cursorRow != null ) {
		var editor = this.data( "editor" ).editor;
		editor.moveCursorToPosition({
			row: testObj.cursorRow, column: testObj.cursorColumn
		});
		editor.clearSelection();
		editor.focus();
	}
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
		
		callback( exerciseData );
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
	// TODO: Try/Catch this and complain
	
	if ( typeof apollo !== "undefined" ) {
		apollo.eval( "(function(){" + code + "})();" );
		
	} else {
		var fn = new Function( code );
		//var fn = new Function( "with(__context__) {\n" + code + "\n}", "__context__" );
	
		fn( context );
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
	asserts = [],
	waitTest,
	waitTestPrint,
	waitTestInput,
	waitInput,
	toInput,
	testMode = false;
	
var test = function( name, fn ) {
	if ( !fn ) {
		fn = name;
		name = "Test Case";
	}
	
	tests.push({ name: name, fn: fn });
};

var testIO = function() {
	test.apply( this, arguments );
	
	tests[ tests.length - 1 ].io = true;
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
	tests = [];
	
	// Prime the test queue
	// TODO: Should we check to see if no test() prime exists?
	runCode( curProblem.validate );
	
	asserts = [];
	
	for ( var i = 0; i < tests.length; i++ ) (function( test ) {
		clear();
		
		$("#results .desc").append( "<fieldset><legend>" + test.name + "</legend><ul></ul></fieldset>" );
		
		// TODO: Have all tests run after user's code has been defined
		// Will need to force input/print statements to block during testMode
		
		// We're doing an IO test
		if ( tests[i].io ) {
			// Load up the IO tests
			runCode( "waitfor() { window.waitTest = resume; } tests[" + i + "].fn();" );
			
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
			curProblem.done = true;
		
			$("#main-tabs-nav .ui-tabs-selected")
				.next( "li" ).removeClass( "ui-state-disabled" ).end()
			 	.addClass( "icon-tab" )
				.find( "a" ).prepend( "<span class='ui-icon ui-icon-circle-check'></span>" );
		
			$("#next-problem-desc").show();
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

var assertIcons = {
	pass: "circle-check",
	error: "alert",
	info: "info"
};

var log = function( msg, type ) {
	type = type || "info";
	
	$("#results ul").last().append(
		"<li class='" + type + "'><span class='ui-icon ui-icon-" +
		assertIcons[ type ] + "'></span> <span class='msg'><a href=''>" +
		clean( msg ) + "</a></span></li>"
	);
};

var assert = function( pass, msg, type ) {
	log( msg, pass ? "pass" : "error" );
	
	if ( typeof asserts !== "undefined" ) {
		asserts.push( !!pass );
	}
	
	return !!pass;
};

var isEqual = function( a, b, msg, type ) {
	log( msg, a === b ? "pass" : "error" );
	
	if ( typeof asserts !== "undefined" ) {
		asserts.push( a === b );
	}
	
	return a === b;
};