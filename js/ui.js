$(function(){
	// Start the editor and canvas drawing area
	Editor.init();
	Canvas.init();
	
	// Set up toolbar buttons
	// (Use jQuery UI styling but different interaction model)
	$(".toolbar a")
		.addClass( "ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only" )
		.find("span").addClass( "ui-button-icon-primary ui-icon" ).end()
		.append( "<span class='ui-button-text'>&nbsp;</span>" );
	
	$(".toolbar").delegate( "a", {
		hover: function() {
			if ( !$(this).hasClass( "ui-state-disabled" ) ) {
				$(this).toggleClass( "ui-state-hover" );
			}
		},

		click: function() {
			return false;
		}
	});

	// Set up color button handling
	$(".toolbar a.color").each(function() {
		$(this).children(".ui-icon").css( "background", this.id );
	});

	$(".toolbar").delegate( "a.color", "click", function() {
		Canvas.setColor( this.id );
	});

	$("#draw").click(function() {
		if ( Canvas.drawing ) {
			Canvas.endDraw();
		} else {
			Canvas.startDraw();
		}
	});
	
	$("#clear").click(function() {
		Canvas.clear();
	});
	
	$(Canvas).bind({
		drawStarted: function() {
			$("#canvas, #editor").addClass( "canvas" );
			$("#draw").addClass("ui-state-active");
		},
		
		drawEnded: function() {
			$("#canvas, #editor").removeClass( "canvas" );
			$("#draw").removeClass("ui-state-active");
		},
		
		colorSet: function( e, color ) {
			$("a.color").removeClass("ui-state-active");

			if ( color != null ) {
				$("#" + color).addClass("ui-state-active");
			}
		}
	});
	
	$("#play").click(function() {
		if ( Record.playing ) {
			Record.pausePlayback();
		} else {
			Record.play();
		}
	});
	
	$("#play").toggleClass( "ui-state-disabled", !Record.commands );
	
	$("#progress").slider({
		range: "min",
		value: 0,
		min: 0,
		max: 100
	});
	
	$("#record").click(function() {
		if ( Record.recording ) {
			Record.stopRecord();
		} else {
			Record.record();
		}
	});
	
	var wasDrawing;
	
	$(Record).bind({
		playStarted: function( e, resume ) {
			// Reset the editor and canvas to its initial state
			if ( !resume ) {
				Editor.reset();
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
		},
		
		recordStarted: function() {
			// Reset the editor and canvas to its initial state
			Editor.reset();
			Canvas.clear( true );
			Canvas.endDraw();
			
			$("#test").removeClass( "ui-state-disabled" );
			$("#play").addClass( "ui-state-disabled" );
			$("#record").addClass( "ui-state-active" );
		},
		
		recordEnded: function() {
			$("#test").addClass( "ui-state-disabled" );
			$("#play").removeClass( "ui-state-disabled" );
			$("#record").removeClass( "ui-state-active" );
		}
	});
	
	$("#tests").delegate( "button.check", "click", function() {
		var exercise = $(this).parent().prev().data( "exercise" ),
			code = Editor.editor.getSession().getValue().replace(/\r/g, "\n"),
			validate, pass = false;
		 
		try {
			validate = new Function( code + "\nreturn " + exercise.validate );
			pass = validate();
		} catch( e ) {
			// TODO: Show error message
		}
		
		if ( pass ) {
			$(this).next(".error").remove();
			$(this).after( "<p><strong>Success!</strong> You answered the exercise correctly.</p>" );
			$(this).remove();
		
		} else {
			$(this).after( "<p class='error'><strong>Oops!</strong> You answered the exercise incorrectly.</p>" );
		}
	});
	
	var insertExercise = function( testObj ) {
		var exercise = $( $("#form-tmpl").html() )
			.filter( "h3" ).data( "exercise", testObj ).end()
			.find( "a" ).text( testObj.test || testObj.title ).end()
			.find( ".desc" ).html( testObj.desc ).end()
			.appendTo( "#tests" );
		
		if ( testObj.validate ) {
			exercise
				.find( "button.check" )
					.button({ icons: { primary: "ui-icon-check" } }).end();
		
		} else {
			exercise.find( "button" ).remove();
		}
	};
	
	var loadExercises = function() {
		var exercises = [];
		
		for ( var i = 0, l = Record.commands.length; i < l; i++ ) {
			var testObj = Record.commands[i];
			
			if ( testObj.test ) {
				insertExercise( testObj );
				
				exercises.push( testObj );
			}
		}
	};
	
	if ( Record.video ) {
		Record.video.time = 0;
		
		insertExercise( Record.video );
		
		if ( Record.commands ) {
			loadExercises();
		}
	
		$("#tests").accordion({
			change: function( e, ui ) {
				var exercise =  ui.newHeader.data( "exercise" );
				
				if ( exercise && exercise.time ) {
					seekTo( exercise.time );
					Record.pausePlayback();
				}
			}
		});
	}
	
	$("#test").click(function() {
		var numTest = $("#tests h3").length + 1,
			testObj = { test: "Exercise #" + numTest };
		
		if ( !Record.log( testObj ) ) {
			return false;
		}
		
		$( $("#form-tmpl").html() )
			.find( "a" ).text( testObj.test ).end()
			.find( "input" ).val( testObj.test ).end()
			.appendTo( "#tests" )
			.find( "form" ).change(function( e ) {
				var elem = e.target;
				
				testObj[ elem.name ] = elem.value;
				
				if ( elem.name === "test" ) {
					$(this).parent().prev().find("a").text( elem.value );
				}
			});
		
		$("#tests").accordion( "destroy" ).accordion({ active: ":last" });
	});
});

function formatTime( seconds ) {
	var min = Math.floor( seconds / 60 ),
		sec = Math.round( seconds % 60 );
	
	return min + ":" + (sec < 10 ? "0" : "") + sec;
}

var seekTo = function( time ) {
	$("#progress").slider( "option", "value", time );
	Record.seekTo( time );
	player.seekTo( time / 1000 );
};

var player;

function onYouTubePlayerAPIReady() {
	var duration;
	
	if ( !Record.video ) {
		return;
	}
	
	var updateTimeLeft = function( time ) {
		$("#timeleft").text( "-" + formatTime( duration - time ) );
	};
	
	player = new YT.Player('player', {
		height: '390',
		width: '640',
		videoId: Record.video.id,
		events: {
			onReady: function() {
				player.playVideo();
				
				duration = player.getDuration();
				
				$("#progress").slider( "option", "max", duration );
				
				setInterval(function() {
					if ( updateTime ) {
						$("#progress").slider( "option", "value", player.getCurrentTime() );
					}
				}, 16);
			},
			
			onStateChange: function( e ) {
				if ( e.data === 1 ) {
					Record.play();
					
				} else if ( e.data === 2 ) {
					Record.pausePlayback();
				}
			}
		}
	});
	
	var updateTime = true,
		wasPlaying;
	
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
			player.playVideo();
		},
		
		playStopped: function() {
			player.pauseVideo();
		}
	});
}