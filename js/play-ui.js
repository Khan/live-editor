var Exercise,
	player,
	track,
	curHint,
	curProblem,
	errors,
	curError,
	asserts,
	viewingTests = false,
	curPosition;

$(function(){
	// Start the editor and canvas drawing area
	var editor = new Editor( "editor" );
	Canvas.init();
	
	$("#editor").data( "editor", editor );
	
	// Set up toolbar buttons
	$(document).buttonize();
	
	$("#play").click(function() {
		if ( Record.playing ) {
			Record.pausePlayback();
		} else {
			Record.play();
		}
	});
	
	$("#progress").slider({
		range: "min",
		value: 0,
		min: 0,
		max: 100
	});
	
	var wasDrawing,
		recordData;
	
	$(Record).bind({
		playStarted: function( e, resume ) {
			// Reset the editor and canvas to its initial state
			if ( !resume ) {
				editor.reset();
				Canvas.clear();
				Canvas.endDraw();
			}
			
			if ( wasDrawing ) {
				$(Canvas).trigger( "drawStarted" );
			}
			
			$("#overlay").show();
			
			$("#play").addClass( "ui-state-active" )
				.find( ".ui-icon" )
					.removeClass( "ui-icon-play" ).addClass( "ui-icon-pause" );
		},
		
		playStopped: function() {
			$("#overlay").hide();
			
			wasDrawing = Canvas.drawing;
			
			if ( wasDrawing ) {
				$(Canvas).trigger( "drawEnded" );
			}
			
			$("#play").removeClass( "ui-state-active" )
				.find( ".ui-icon" )
					.addClass( "ui-icon-play" ).removeClass( "ui-icon-pause" );
		}
	});
	
	$("#test").click(function() {
		var numTest = $("#tests h3").length + 1,
			testObj = { title: "Exercise #" + numTest };
		
		if ( !Record.log( testObj ) ) {
			return false;
		}
		
		insertExerciseForm( testObj );
	});
	
	$("#get-hint").bind( "buttonClick", function() {
		if ( !$("#hint").is(":visible") ) {
			showHint();
			
			$("#error").fadeOut( 300 );
		
			$("#hint")
				.addClass( "ui-state-active" )
				.css({ bottom: -30, opacity: 0.1 })
				.show()
				.animate({ bottom: 5, opacity: 1.0 }, 300 );
			
		} else {
			$("#hint .close").click();
		}
	});
	
	$("#show-errors").bind( "buttonClick", function() {
		if ( !$("#error").is(":visible") ) {
			showError();
			
			$("#hint").fadeOut( 300 );
		
			$("#error")
				.addClass( "ui-state-active" )
				.css({ bottom: -30, opacity: 0.1 })
				.show()
				.animate({ bottom: 5, opacity: 1.0 }, 300 );
			
		} else {
			$("#error .close").click();
		}
	});
	
	$(".tipbar .close").click(function() {
		$(this).parents( ".tipbar" )
			.animate({ bottom: -30, opacity: 0.1 }, 300, function() {
				$(this).hide();
			});

		return false;
	});
	
	$(".tipbar .nav a").click(function() {
		var id = $(this).parents(".tipbar").attr( "id" );
		
		if ( !$(this).hasClass( "ui-state-disabled" ) ) {
			if ( id === "hint" ) {
				if ( $(this).hasClass( "next" ) ) {
					curHint += 1;
		
				} else {
					curHint -= 1;
				}
		
				showHint();
				
			} else if ( id === "error" ) {
				if ( $(this).hasClass( "next" ) ) {
					curError += 1;
		
				} else {
					curError -= 1;
				}
		
				showError();
			}
		}
		
		return false;
	});
	
	$("#next-problem").bind( "buttonClick", function() {
		var pos = Exercise.problems.indexOf( curProblem );
		
		if ( pos + 1 < Exercise.problems.length ) {
			$("#exercise-tabs").tabs( "select", pos + 1 );
		}
	});
	
	$("#view-tests, #view-tests-2").bind( "buttonClick", function() {
		var editor = $("#editor").data("editor").editor;
		
		if ( !viewingTests ) {
			leaveProblem();
		}
		
		editor.setReadOnly( !viewingTests );
		editor.setHighlightActiveLine( !viewingTests );
		
		if ( viewingTests ) {
			textProblem();
			
		} else {
			$("#editor").editorText( curProblem.validate );
		}
		
		$("#view-tests-2").css( "display", viewingTests ? "none" : "inline-block" );
		
		$("#view-tests")
			.find( ".ui-icon" ).toggleClass( "ui-icon-circle-check ui-icon-carat-1-w" ).end()
			.find( ".ui-button-text" ).text( viewingTests ? "Tests" : "Back to Your Code" );
		
		viewingTests = !viewingTests;
	});
	
	$("#results ul").delegate( "a", "click", function() {
		if ( !viewingTests ) {
			$("#view-tests").click();
		}
		
		var editor = $("#editor").data("editor").editor,
			search = editor.$search;
		
		search.set({ needle: $(this).text() });
		var match = search.find( editor.getSession() );
		
		if ( match && match.start ) {
			editor.moveCursorTo( match.start.row, 0 );
			editor.clearSelection();
		}
		
		return false;
	});
	
	$("#run-code").bind( "buttonClick", function() {
		var userCode = $("#editor").editorText(),
			validate = curProblem.validate,
			pass = JSHINT( userCode ),
			session = $("#editor").data( "editor" ).editor.getSession();
		
		session.clearAnnotations();
		
		$("#show-errors").toggleClass( "ui-state-disabled", JSHINT.errors.length === 0 );
		
		$("#error").fadeOut( 300 );
		
		if ( pass ) {
			asserts = [];
			
			runCode( userCode + "\n" + validate, { assert: assert } );
			
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
				
					$(".ui-tabs-selected")
					 	.addClass( "icon-tab" )
						.find( "a" ).prepend( "<span class='ui-icon ui-icon-circle-check'></span>" );
				
					$("#next-problem-desc").show();
				}
			
				$("#results").fadeIn( 400 );
			}
			
		} else {			
			errors = [];
			
	        for ( var i = 0; i < JSHINT.errors.length; i++ ) {
	            var error = JSHINT.errors[ i ];
	
	            if ( error && error.line && error.character &&
						error.reason && !/unable to continue/i.test( error.reason ) ) {

	                errors.push({
	                    row: error.line - 1,
	                    column: error.character - 1,
	                    text: error.reason,
	                    type: "error",
	                    lint: error
	                });
				}
	        }
	
	        session.setAnnotations( errors );
	
			curError = 0;
			showError();
			
			$("#show-errors").click();
			
			$("#results").fadeOut( 400 );
		}
	});
	
	openExerciseDialog( openExercise );
});

var showHint = function() {
	$("#hint")
		.find( "strong" ).text( "Hint #" + (curHint + 1) + ":" ).end()
		.find( ".text" ).text( curProblem.hints[ curHint ] || "" ).end()
		.find( "a.prev" ).toggleClass( "ui-state-disabled", curHint === 0 ).end()
		.find( "a.next" ).toggleClass( "ui-state-disabled", curHint + 1 === curProblem.hints.length );
};

var showError = function() {
	var error = errors[ curError ];
	
	$("#error")
		.find( "strong" ).text( "Error #" + (curError + 1) + ":" ).end()
		.find( ".text" ).text( error.text || "" ).end()
		.find( "a.prev" ).toggleClass( "ui-state-disabled", curError === 0 ).end()
		.find( "a.next" ).toggleClass( "ui-state-disabled", curError + 1 === errors.length );
	
	var editor = $("#editor").data( "editor" ).editor;
	
	editor.moveCursorTo( error.row, error.column );
	editor.clearSelection();
	editor.focus();
};

var openExercise = function( exercise ) {
	Exercise = exercise;

	// If an audio track is provided, load the track data
	// and load the audio player as well
	if ( Exercise.audioID ) {
		connectAudio(function( data ) {
			track = data;
			SC.whenStreamingReady( audioInit );
		});
	}
	
	$("#page_sub_nav b").text( Exercise.title );
	
	document.title = Exercise.title;
	
	/* Perhaps not necessary?
	$("<p>" + Exercise.desc + "</p>")
		.appendTo( "body" )
		.dialog({ title: Exercise.title, resizable: false, draggable: false,
			buttons: { "Start Exercise": function() { $(this).dialog("close"); } },
			close: startExercise
		});
	*/

	if ( Exercise.problems ) {
		for ( var i = 0, l = Exercise.problems.length; i < l; i++ ) {
			insertExercise( Exercise.problems[i] );
		}
	}
	
	$("#exercise-tabs")
		.append( "<div id='overlay'></div>" )
		.tabs({
			show: function( e, ui ) {
				showProblem( Exercise.problems[ ui.index ] );
			}
		})
		.removeClass( "ui-widget-content" )
		.find( ".ui-tabs-nav" ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" ).end();
	
	startExercise();
};

var startExercise = function() {
	$("#overlay").hide();
};

var leaveProblem = function() {
	if ( curProblem ) {
		curProblem.answer = $("#editor").editorText();
		$("#editor").extractCursor( curProblem );
	}
};

var textProblem = function() {
	if ( curProblem ) {
		var editor = $("#editor").data( "editor" ).editor;
		
		$("#editor")
			.editorText( curProblem.answer || curProblem.start || "" )
			.setCursor( curProblem );
	}
};

var showProblem = function( problem ) {
	if ( viewingTests ) {
		$("#view-tests").click();
	}
	
	leaveProblem();
	
	curProblem = problem;
	curHint = 0;
	
	$("#results").hide();
	
	$("#next-problem-desc").toggle( !!problem.done );
	
	$("#next-problem").toggleClass( "ui-state-disabled", 
		Exercise.problems.indexOf( curProblem ) + 1 >= Exercise.problems.length );
	
	$("#exercise-tabs .ui-state-active").removeClass( "ui-state-active" );
	
	textProblem();
	
	$("#problem")
		.find( ".title" ).text( problem.title || "" ).end()
		.find( ".text" ).text( (problem.desc || "").replace( /\n/g, "<br>" ) ).end();
	
	$("#view-tests").toggleClass( "ui-state-disabled", !problem.validate );
	$("#get-hint").toggleClass( "ui-state-disabled", !(problem.hints && problem.hints.length) );
	
	$("#hint").hide();
};

var insertExercise = function( testObj ) {
	$( $("#tab-tmpl").html() )
		.find( ".ui-icon" ).remove().end()
		.find( "a" ).append( testObj.title || "Problem" ).end()
		.appendTo("#exercise-tabs ul.ui-tabs-nav");
};

var seekTo = function( time ) {
	$("#progress").slider( "option", "value", time / 1000 );
	Record.seekTo( time );
	
	if ( typeof SC !== "undefined" ) {
		player.setPosition( time );
		player.resume();
	
	} else {
		player.seekTo( time / 1000 );
	}
};

// track.waveform_url (hot)
var audioInit = function() {
	var updateTime = true,
		wasPlaying;
	
	var updateTimeLeft = function( time ) {
		$("#timeleft").text( "-" + formatTime( (track.duration / 1000) - time ) );
	};
	
	$("#playbar").show();
	$("#progress").slider( "option", "max", track.duration / 1000 );

	Record.time = 0;

	updateTimeLeft( 0 );

	player = SC.stream( Exercise.audioID.toString(), {
		autoLoad: true,
		
		whileplaying: function() {
			if ( updateTime && Record.playing ) {
				$("#progress").slider( "option", "value", player.position / 1000 );
			}
		},
		
		onplay: Record.play,
		onresume: Record.play,
		onpause: Record.pausePlayback
	});
	
	$("#progress").slider({
		start: function() {
			updateTime = false;
			wasPlaying = Record.playing;
		},
		
		slide: function( e, ui ) {
			updateTimeLeft( ui.value );
		},
		
		change: function( e, ui ) {
			updateTimeLeft( ui.value );
		},
		
		stop: function( e, ui ) {
			updateTime = true;
			
			if ( wasPlaying ) {
				seekTo( ui.value * 1000 );
			}
		}
	});
	
	$(Record).bind({
		playStarted: function() {
			if ( player.paused ) {
				player.resume();

			} else if ( player.playState === 0 ) {
				player.play();
			}
		},
		
		playStopped: function() {
			player.pause();
		}
	});
};

Record.handlers.test = function( e ) {
	Record.pausePlayback();
	Canvas.endDraw();
	// $("#tests").accordion({ active: e.pos });
};