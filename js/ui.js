$(function(){
	// Start the editor and canvas drawing area
	Editor.init();
	Canvas.init();

	$("#toolbar div.color").each(function() {
		$(this).children().css( "background-color", this.id );
	});

	$("#toolbar").delegate( "div.color", "click", function() {
		Canvas.setColor( this.id );
	});

	$("#draw").click(function() {
		if ( Canvas.drawing ) {
			Canvas.endDraw();
		} else {
			Canvas.startDraw();
		}
	});
	
	$("#clear").click( Canvas.clear );
	
	$(Canvas).bind({
		drawStarted: function() {
			$("#canvas, #editor").addClass( "canvas" );
			$("#draw").addClass("drawing");
		},
		
		drawEnded: function() {
			$("#canvas, #editor").removeClass( "canvas" );
			$("#draw").removeClass("drawing");
		},
		
		colorSet: function( e, color ) {
			$("div.color.active").removeClass("active");

			if ( color != null ) {
				$("#" + color).addClass("active");
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
	
	$("#play").toggle( !!Record.commands );
	
	$("#play").click(function() {
		if ( Record.playing ) {
			Record.stopPlayback();
		} else {
			Record.play();
		}
	});
	
	$(Record).bind({
		playStarted: function() {
			// Reset the editor and canvas to its initial state
			Editor.reset();
			Canvas.clear();
			Canvas.endDraw();
			
			$("#play").addClass("playing");
		},
		
		playEnded: function() {
			$("#play").removeClass("playing");
		},
		
		recordStarted: function() {
			$("#play").hide();
			$("#record").addClass("recording");
		},
		
		recordEnded: function() {
			$("#play").show();
			$("#record").removeClass("recording");
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