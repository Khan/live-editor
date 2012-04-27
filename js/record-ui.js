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
			// TODO: Hide the recording app until connected
			connectAudio(function() {
				SC.record({
					start: function() {
						$("#draw-widgets").show();
						
						Editor.startCode = $("#editor").editorText();
						setCursor({ row: 0, column: 0 });
						focusProblem();
						
						Record.record();
					}
				});
			});
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
					Record.audioID = String( response.id );
					save();

				} else {
					// TODO: Show error message
				}
			}
		);
		
		function save() {
			saveScratch(function( scratchData ) {
				dialog.dialog( "close" );
				window.location.href = "/labs/code/" + scratchData.id;
			});
		}
	});
	
	$(Record).bind({		
		recordStarted: function() {
			// Reset the canvas to its initial state
			Canvas.clear( true );
			Canvas.endDraw();
			
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