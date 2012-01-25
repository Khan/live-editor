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
			Exercise = exerciseData;
			callback();
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
	$("#results ul").empty();
	
	var fn = new Function( code );
	//var fn = new Function( "with(__context__) {\n" + code + "\n}", "__context__" );
	
	fn( context );
};

var assertIcons = {
	pass: "circle-check",
	error: "alert",
	info: "info"
};

var log = function( msg, type ) {
	type = type || "info";
	
	$("#results ul").append(
		"<li class='" + type + "'><span class='ui-icon ui-icon-" +
		assertIcons[ type ] + "'></span> <span class='msg'><a href=''>" +
		msg.replace( /</g, "&gt;" ) + "</a></span></li>"
	);
};

var assert = function( a, b, msg, type ) {
	log( msg, a === b ? "pass" : "error" );
	
	if ( typeof asserts !== "undefined" ) {
		asserts.push( a === b );
	}
};