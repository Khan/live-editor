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
	
	$("#record").click(function() {
		if ( Record.recording ) {
			Record.stopRecord();
		} else {
			Record.record();
		}
	});
	
	$("#play").click(function() {
		if ( Record.playing ) {
			Record.stopPlayback();
		} else {
			Record.play();
		}
	});
	
	$("#play").toggleClass( "ui-state-disabled", !Record.commands );
	
	$(Record).bind({
		playStarted: function() {
			// Reset the editor and canvas to its initial state
			Editor.reset();
			Canvas.clear();
			Canvas.endDraw();
			
			$("#play").addClass( "ui-state-active" )
				.find( ".ui-icon" )
					.removeClass( "ui-icon-play" ).addClass( "ui-icon-pause" );
		},
		
		playEnded: function() {
			$("#play").removeClass( "ui-state-active" )
				.find( ".ui-icon" )
					.addClass( "ui-icon-play" ).removeClass( "ui-icon-pause" );
		},
		
		recordStarted: function() {
			// Reset the editor and canvas to its initial state
			Editor.reset();
			Canvas.clear();
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