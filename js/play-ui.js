var Exercise,
	player,
	track,
	curProblem,
	errors,
	curPosition,
	DEBUG = false;

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
		toggleTip( "Hint", curProblem.hints );
	});
	
	$("#show-errors").bind( "buttonClick", function() {
		toggleTip( "Error", errors, setCursor );
	});
	
	$("#reset-code").bind( "buttonClick", function() {
		var code = $("#editor").editorText();
		
		if ( code !== curProblem.start &&
				confirm( "This will delete your code and reset it back to what you started with. Is this ok?") ) {
			curProblem.answer = "";
			textProblem();
		}
	});
	
	$(document).delegate( ".next-problem", "buttonClick", function() {
		var pos = Exercise.problems.indexOf( curProblem );
		
		if ( pos + 1 < Exercise.problems.length ) {
			$("#exercise-tabs").tabs( "select", pos + 1 );
		}
	});
	
	$(document).delegate( "#results li", "hover", function() {
		var $parent = $(this),
			expected = $parent.data( "expected" );
		
		if ( expected ) {
			var tip = $parent.find( ".tip" );
		
			if ( !tip.length ) {
				tip = $( "<span class='tip'>This test was expecting a result of <code>" +
					JSON.stringify( expected[1] ) + "</code>, your code produced a result of <code>" +
					JSON.stringify( expected[0] ) + "</code>.</span>" )
						.appendTo( $parent )
						.hide();
			}
			
			tip.toggle();
		}
	});
	
	$(document).delegate( "#results ul a", "click", function() {
		focusTests();
		
		var editor = $("#tests-editor").data("editor").editor,
			search = editor.$search;
		
		search.set({ needle: $(this).text() });
		var match = search.find( editor.getSession() );
		
		if ( match && match.start ) {
			editor.moveCursorTo( match.start.row, 0 );
			editor.clearSelection();
		}
		
		return false;
	});
	
	$(document).delegate( "#results legend a", "click", function() {
		var output = $(this).parents( "fieldset" ).data( "output" );
		
		if ( output ) {
			var str = "";
			
			for ( var i = 0; i < output.length; i++ ) {
				str += "<div>" + clean( output[i] ) + "</div>";
			}
			
			$("#output").html( str );
			
			focusOutput();
		}
		
		return false;
	});
	
	$("#run-code").bind( "buttonClick", function() {
		var userCode = $("#editor").editorText(),
			validate = curProblem.validate,
			// TODO: Generate this list dynamically
			pass = JSHINT( "/*global input:false, inputNumber:false, print:false*/\n" + userCode ),
			hintData = JSHINT.data(),
			session = $("#editor").data( "editor" ).editor.getSession();
		
		extractResults( userCode );
		
		clear();
		$("#output-nav").addClass( "ui-state-disabled" );
		$("#results .desc").empty();
		$("#results").hide();
		
		session.clearAnnotations();
		
		errors = [];
		
		var doRunTests = !!(pass && !hintData.implieds);
		
		if ( doRunTests ) {
			$("#show-errors").addClass( "ui-state-disabled" );
			hideTip( "Error" );
			
			// Run the tests
			runTests( userCode, curProblem );
			
			// Then run the user code
			clear();
			runCode( userCode );
			
			if ( outputs.length > 0 ) {
				focusOutput();
			}
		}
		
		if ( !doRunTests || errors.length ) {
			$("#show-errors").removeClass( "ui-state-disabled" );
			
	        for ( var i = 0; i < JSHINT.errors.length; i++ ) {
	            var error = JSHINT.errors[ i ];
	
	            if ( error && error.line && error.character &&
						error.reason && !/unable to continue/i.test( error.reason ) ) {

	                errors.push({
	                    row: error.line - 2,
	                    column: error.character - 1,
	                    text: error.reason,
	                    type: "error",
	                    lint: error
	                });
				}
	        }
	
			if ( hintData.implieds ) {
				for ( var i = 0; i < hintData.implieds.length; i++ ) {
					var implied = hintData.implieds[i];
					
					for ( var l = 0; l < implied.line.length; l++ ) {
						errors.push({
							row: implied.line[l] - 2,
							column: 0,
							text: "Using an undefined variable '" + implied.name + "'.",
							type: "error",
							lint: implied
						});
					}
				}
			}
			
			errors = errors.sort(function( a, b ) {
				return a.row - b.row;
			});
	
	        session.setAnnotations( errors );
	
			showTip( "Error", errors, setCursor );
			
			if ( !doRunTests ) {
				$("#results").fadeOut( 400 );
			}
		}
	});
	
	$("#editor-box-tabs")
		.tabs({
			show: function( e, ui ) {
				// If we're loading the tests or solution tab
				if ( ui.panel.id === "tests-box" || ui.panel.id === "solution-box" ) {
					var $editor = $( ui.panel ).find( ".editor" ),
						editor = $editor.data( "editor" );
					
					if ( !editor ) {
						editor = new Editor( $editor.attr( "id" ) );
						$editor.data( "editor", editor );
						
						editor.editor.setReadOnly( true );
						editor.editor.setHighlightActiveLine( true );
					}
					
					$editor.editorText( ui.panel.id === "tests-box" ?
						curProblem.validate :
						curProblem.solution );
				}
			}
		})
		.removeClass( "ui-widget ui-widget-content ui-corner-all" );
	
	$("#editor-box, #tests-box, #output-box, #solution-box")
		.removeClass( "ui-tabs-panel ui-corner-bottom" );
	
	$("#output")
		.removeClass( "ui-corner-bottom" )
		.addClass( "ui-corner-top" );
	
	$("#editor-box-tabs-nav")
		.removeClass( "ui-corner-all" )
		.addClass( "ui-corner-bottom" )
		.find( "li" )
			.removeClass( "ui-corner-top" )
			.addClass( "ui-corner-bottom" );
	
	if ( window.location.search ) {
		var parts = window.location.search.slice(1).split( "&" );
		
		for ( var i = 0; i < parts.length; i++ ) {
			if ( parts[i] === "debug" ) {
				DEBUG = true;
			}
		}
		
		getExercise( parts[0], openExercise );
		
	} else {
		openExerciseDialog( openExercise );
	}
});

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
	
	$("h1").text( Exercise.title );
	
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
	
	$(window).bind( "beforeunload", function() {
		leaveProblem();
		saveResults();
	});
	
	var activeTab = 0;
	
	$("#exercise-tabs")
		.append( "<div id='overlay'></div>" )
		.tabs({
			show: function( e, ui ) {
				showProblem( Exercise.problems[ ui.index ] );
			}
		})
		.removeClass( "ui-widget-content" )
		.find( "#main-tabs-nav" )
			.removeClass( "ui-corner-all" ).addClass( "ui-corner-top" )
			.find( "li" ).each(function( i ) {
				var done = Exercise.problems[i].done;
				
				if ( i === 0 || DEBUG || done != null ) {
					$(this).removeClass( "ui-state-disabled" );
					activeTab = i;
				}
				
				if ( done ) {
					$(this).markDone();
					activeTab = i + 1;
				}
			}).end()
		.end()
		.tabs( "select", activeTab );
	
	startExercise();
};

var showQuestion = function() {
	showTip( "Question", testAnswers, function() {
		$(".tipbar").buttonize();
		$(".tipbar input").first().val( testAnswers.length > 0 ? curProblem.answer : "" ).focus();
	});
};

var showSolution = function() {
	$("#solution-nav").removeClass( "ui-state-disabled" );
	$("#editor-box-tabs-nav").tabs( "select", 3 );
};

var startExercise = function() {
	$("#overlay").hide();
};

var leaveProblem = function() {
	if ( curProblem ) {
		$("#editor").extractCursor( curProblem );
		extractResults( $("#editor").editorText() );
	}
};

var textProblem = function() {
	if ( curProblem ) {
		var editor = $("#editor").data( "editor" ).editor;
		
		$("#editor")
			.editorText( testAnswers.length === 0 && curProblem.answer || curProblem.start || "" )
			.setCursor( curProblem );
	}
};

var showProblem = function( problem ) {	
	leaveProblem();
	
	curProblem = problem;
	errors = [];
	
	tests = [];
	testAnswers = [];
	
	if ( curProblem.done == null ) {
		curProblem.done = false;
	}
	
	// Prime the test queue
	// TODO: Should we check to see if no test() prime exists?
	if ( curProblem.validate ) {
		runCode( curProblem.validate );
	}
	
	var doAnswer = testAnswers.length > 0;
	
	$("#results").hide();
	
	$("#code").toggleClass( "done", !!problem.done );
	$("#next-problem-desc").toggle( !!problem.done );
	$(".next-problem").toggle( !!problem.done );
	$("#solution-nav").toggleClass( "ui-state-disabled", !problem.done );
	// TODO: Have a next exercise button
	
	$("#editor-box-tabs").tabs( "select", 0 );
	$("#output-nav").addClass( "ui-state-disabled" );
	$("#tests-nav").toggleClass( "ui-state-disabled",  !problem.validate || doAnswer );
	$("#solution-nav").toggle( !!problem.solution );
	
	textProblem();
	
	$("#problem")
		.find( ".title" ).text( problem.title || "" ).end()
		.find( ".text" ).html( (problem.desc || "").replace( /\n/g, "<br>" ) ).end();
	
	$("#get-hint").toggleClass( "ui-state-disabled", !(problem.hints && problem.hints.length) );
	
	$("#show-errors, #run-code, #reset-code").toggle( !doAnswer );
	
	if ( doAnswer ) {
		showQuestion();
		
	} else {
		$("#tipbar").hide();
	}
	
	var session = $("#editor").data( "editor" ).editor.getSession();
	session.clearAnnotations();
};

var insertExercise = function( testObj ) {
	$( $("#tab-tmpl").html() )
		.find( ".ui-icon" ).remove().end()
		.find( "a" ).append( testObj.title || "Problem" ).end()
		.appendTo("#main-tabs-nav");
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