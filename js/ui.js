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
	
	$("#save").click(function() {
		var dialog = $("<div>Saving recording...</div>")
			.dialog({ modal: true });
		
		SC.recordUpload(
			{
				track: {
					genre: "Khan Academy Code",
					tags: "KhanAcademyCode",
					sharing: "public",
					track_type: "spoken",
					description: JSON.stringify( Record.commands ),
					title: recordData.title + (recordData.desc ? ": " + recordData.desc : ""),
					license: "cc-by-nc-sa"
				}
			},

			function( success, error ) {
				// TODO: Hook this into the play page
				dialog.html( $("<a>")
					.attr("href", "")
					.text( recordData.title ) );
			}
		);
	});
	
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
			SC.record({
				start: Record.record
			});
		}
	});
	
	var wasDrawing,
		recordData;
	
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
			
			recordData = { title: "New Recording" };
			
			insertExerciseForm( recordData );
			
			$("#tests textarea:last").remove();
			
			$("#test").removeClass( "ui-state-disabled" );
			$("#save").addClass( "ui-state-disabled" );
			$("#record").addClass( "ui-state-active" );
		},
		
		recordEnded: function() {
			SC.recordStop();
			
			$("#test").addClass( "ui-state-disabled" );
			$("#save").removeClass( "ui-state-disabled" );
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
	
	$("#test").click(function() {
		var numTest = $("#tests h3").length + 1,
			testObj = { title: "Exercise #" + numTest };
		
		if ( !Record.log( testObj ) ) {
			return false;
		}
		
		insertExerciseForm( testObj );
	});
});

var insertExerciseForm = function( testObj ) {
	$( $("#form-tmpl").html() )
		.find( "a" ).text( testObj.title ).end()
		.find( "input" ).val( testObj.title ).end()
		.appendTo( "#tests" )
		.find( "form" ).change(function( e ) {
			var elem = e.target;
			
			testObj[ elem.name ] = elem.value;
			
			if ( elem.name === "test" ) {
				$(this).parent().prev().find("a").text( elem.value );
			}
		});
	
	$( "#tests" ).accordion( "destroy" ).accordion({ active: ":last" });
};

var insertExercise = function( testObj ) {
	var exercise = $( $("#form-tmpl").html() )
		.filter( "h3" ).data( "exercise", testObj ).end()
		.find( "a" ).text( testObj.test || testObj.title || "" ).end()
		.find( ".desc" ).html( testObj.desc || "" ).end()
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
	var pos = 1;
	
	for ( var i = 0, l = Record.commands.length; i < l; i++ ) {
		var testObj = Record.commands[i];
		
		if ( testObj.test ) {
			testObj.pos = pos;
			insertExercise( testObj );
			pos++;
		}
	}
};

var formatTime = function( seconds ) {
	var min = Math.floor( seconds / 60 ),
		sec = Math.round( seconds % 60 );
	
	return min + ":" + (sec < 10 ? "0" : "") + sec;
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

var player, track;

var audioInit = function() {
	if ( !Record.video ) {
		return;
	}
	
	var updateTime = true,
		wasPlaying;
	
	var updateTimeLeft = function( time ) {
		$("#timeleft").text( "-" + formatTime( (track.duration / 1000) - time ) );
	};

	updateTimeLeft( 0 );

	player = SC.stream( Record.video.id.toString(), {
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

$.getScript( "http://connect.soundcloud.com/sdk.js", function() {
	SC.initialize({
		client_id: "82ff867e7207d75bc8bbd3d281d74bf4",
		redirect_uri: window.location.href.replace(/[^\/]*$/, "callback.html")
	});

	if ( $("html").attr("id") === "play-page" ) {
		if ( window.location.search ) {
			SC.get( "/tracks/" + window.location.search, playTrack );

		} else {
			// TODO: Switch to some sort of generic genre search
			SC.get( "/tracks.json", { user_id: "9127538" }, function( data ) {
				var dialog = $("<div><ul></ul></div>").find("ul");

				$.each( data, function() {
					var item = this;

					$("<li><a href=''>" + this.title.split(": ")[0] + "</a></li>")
						.find("a").click(function() {
							playTrack( item );
							dialog.dialog( "destroy" );
							return false;
						}).end()
						.appendTo( dialog );
				});

				dialog = dialog.parent().dialog({ title: "Choose Recording", modal: true });
			});
		}

		function playTrack( data ) {
			track = data;
		
			try {
				Record.commands = JSON.parse( track.description );
			} catch( e ) {}
		
			var title = track.title.split( ": " );
	
			Record.video = {
				id: data.id,
				title: title[0],
				desc: title[1]
			};
		
			// track.waveform_url (hot)
			
			$("#play").toggleClass( "ui-state-disabled", !Record.commands );
			$("#progress").slider( "option", "max", track.duration / 1000 );

			if ( Record.video ) {
				Record.video.time = 0;

				insertExercise( Record.video );

				if ( Record.commands ) {
					loadExercises();
				}

				$("#tests").delegate( "h3", "click", function( e ) {
					var exercise =  $(this).data( "exercise" );

					if ( exercise && exercise.time != null ) {
						seekTo( exercise.time );
					}
				});

				$("#tests").accordion();
			}

			SC.whenStreamingReady( audioInit );
		}
	
	} else {
		SC.connect(function() {
			// Connected!
			// TODO: Hide the recording app until connected
		});
	}
});

Record.handlers.test = function( e ) {
	Record.pausePlayback();
	Canvas.endDraw();
	$("#tests").accordion({ active: e.pos });
};
