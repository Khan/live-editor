$(function(){
	if ( !$("#play-page").hasClass( "developer" ) ) {
		return;
	}
	
	// Start the canvas drawing area
	//Canvas.init();

	// Set up color button handling
	$(".toolbar a.color").each(function() {
		$(this).addClass( "ui-button" ).children().css( "background", this.id );
	});

	$(document).delegate( ".toolbar a.color", "buttonClick", function() {
		Canvas.setColor( this.id );
		focusProblem();
	});
	
	$("#clear").bind( "buttonClick", function() {
		Canvas.clear();
		Canvas.endDraw();
		focusProblem();
	});
	
	$("#record").bind( "buttonClick", function() {		
		if ( Record.recording ) {
			Record.stopRecord();
			
		} else {
			var saveCode = $("#editor").editorText();
			
			if ( !saveCode ) {
				var dialog = $("<div>Saving Scratchpad...</div>")
					.dialog({ modal: true });
					
				dialog.html( "<strong>There is no code in the editor!</strong>" +
					"<p>The student won't see anything when they first see the scratchpad, you should enter some code.</p>" );
					
			} else {
				connectAudio(function() {
					SC.record({
						start: function() {
							Exercise.code = $("#editor").editorText();
							setCursor({ row: 0, column: 0 });
							focusProblem();
						
							Record.record();
						}
					});
				});
			}
		}
		
		focusProblem();
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
	
	$("#save-share-code").bind( "buttonClick", function() {
		$(this).addClass( "ui-state-disabled" );
		
		var dialog = $("<div>Saving Scratchpad...</div>")
			.dialog({ modal: true });
		
		if ( !Record.recorded ) {
			save();
			return;
		}
		
		if ( SC.accessToken() ) {
			upload();
			
		} else {
			SC.connect( upload );
		}
		
		function upload() {
			SC.recordUpload(
				{
					track: {
						genre: "Khan Academy Code",
						tags: "KhanAcademyCode",
						sharing: "public",
						track_type: "spoken",
						description: "",
						title: "Code Scratchpad", // TODO: Allow presenter to input title
						license: "cc-by-nc-sa"
					}
				},

				function( response, error ) {
					if ( response ) {
						Exercise.audio_id = response.id;
						save();

					} else {
						// TODO: Show error message
					}
				}
			);
		}
		
		function save() {
			var saveCode = Record.recorded ? Exercise.code : $("#editor").editorText();
			
			if ( !saveCode ) {
				dialog.html( "<strong>Whoops!</strong><p>You aren't saving any code, you should enter some code to save!</p>" );
				return;
			}
			
			saveScratchpadRevision(function( data ) {
				dialog.dialog( "close" );
				window.location.href = "/labs/code/" + data.scratchpad.slug +
					"/" + data.scratchpad.id;
			});
		}
	});
	
	$(Record).bind({		
		recordStarted: function() {
			$("#save-share-code").addClass( "ui-state-disabled" );
			$("#record").addClass( "ui-state-active" );
		},
		
		recordEnded: function() {
			SC.recordStop();
			
			$("#save-share-code").removeClass( "ui-state-disabled" );
			$("#record").removeClass( "ui-state-active" ).addClass( "ui-state-disabled" );
		}
	});
});
