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
};

var formatTime = function( seconds ) {
	var min = Math.floor( seconds / 60 ),
		sec = Math.round( seconds % 60 );
	
	return min + ":" + (sec < 10 ? "0" : "") + sec;
};

var delaySize = 13;

var getExerciseList = function( callback ) {
	// TODO: Get this from an API of some sort
	// TODO: Remove artificial delay
	setTimeout(function() {
		var exerciseData = JSON.parse( window.localStorage.exerciseData || "[]" );
		callback( exerciseData );
	}, delaySize );
};

var getExercise = function( id, callback ) {
	// TODO: Pull from a server instead
	var exercise,
		exerciseData = JSON.parse( window.localStorage.exerciseData || "[]" );
	
	for ( var i = 0; i < exerciseData.length; i++ ) {
		if ( id === exerciseData[i].id ) {
			exercise = exerciseData[i];
			break;
		}
	}
	
	// TODO: Remove artificial delay
	setTimeout(function() {
		lastSave = JSON.stringify( exercise );
		callback( exercise );
	}, delaySize );
};

var saveExercise = function( callback ) {
	// TODO: Save to a server instead
	var isSet = false,
		exerciseData = JSON.parse( window.localStorage.exerciseData || "[]" );
	
	// Make sure we get the latest data
	extractProblem( curProblem );
	
	// Add in ID, normally this would be done on the server
	Exercise.id = Exercise.id || (new Date).getTime();
	
	for ( var i = 0; i < exerciseData.length; i++ ) {
		if ( Exercise.id === exerciseData[i].id ) {
			exerciseData[i] = Exercise;
			isSet = true;
			break;
		}
	}
	
	if ( !isSet ) {
		exerciseData.push( Exercise );
	}
	
	window.localStorage.exerciseData = JSON.stringify( exerciseData );
	
	lastSave = JSON.stringify( Exercise );
	
	// TODO: Remove artificial delay
	setTimeout( callback, delaySize );
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

var loadAudio = function() {
	$.getScript( "http://connect.soundcloud.com/sdk.js", function() {
		SC.initialize({
			client_id: "82ff867e7207d75bc8bbd3d281d74bf4",
			redirect_uri: window.location.href.replace(/[^\/]*$/, "callback.html")
		});
		
		if ( window.Exercise && Exercise.audioID ) {
			SC.get( "/tracks/" + Exercise.audioID, function( data ) {
				track = data;
				SC.whenStreamingReady( audioInit );
			});
			
		} else {
			SC.connect(function() {
				// Connected!
				// TODO: Hide the recording app until connected
			});
		}
	});
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