var player,
	track;

$(function(){
	// Start the editor and canvas drawing area
	var editor = new Editor( "editor" );
	Canvas.init();
	
	// Set up toolbar buttons
	$(document).buttonize();

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
					description: JSON.stringify( Exercise ),
					title: recordData.title + (recordData.desc ? ": " + recordData.desc : ""),
					license: "cc-by-nc-sa"
				}
			},

			function( response, error ) {
				if ( response ) {
					recordData.id = response.id;

					saveAttachment( response.id, Exercise, function( response ) {
						if ( response ) {
							// TODO: Hook this into the play page
							dialog.html( $("<a>")
								.attr("href", "")
								.text( recordData.title ) );
						} else {
							// TODO: Show error message
						}
					});

				} else {
					// TODO: Show error message
				}
			}
		);
	});
	
	$("#record").click(function() {
		if ( Record.recording ) {
			Record.stopRecord();
		} else {
			// TODO: Hide the recording app until connected
			connectAudio(function() {
				SC.record({
					start: Record.record
				});
			});
		}
	});
	
	var wasDrawing,
		recordData;
	
	$(Record).bind({		
		recordStarted: function() {
			// Reset the editor and canvas to its initial state
			editor.reset();
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
});