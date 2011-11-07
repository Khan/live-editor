var Record = {
	
	handlers: {},
	
	record: function() {
		Record.commands = [];
		Record.playing = false;
		Record.startTime = (new Date).getTime();
	},
	
	play: function() {
		// Don't play if we're already playing
		if ( Record.playInterval ) {
			return;
		}
		
		Record.playStart = (new Date).getTime() -
			(Record.playStart ? Record.pauseTime - Record.playStart : 0);
		
		// Figure out if we're just starting or resuming
		if ( !Record.playing ) {
			Record.playPos = 0;
			Record.playing = true;
		}

		Record.playInterval = setInterval(function() {
			var curTime = (new Date).getTime(),
				evt = Record.commands[ Record.playPos ];

			if ( evt && (curTime - Record.playStart >= evt.time) ) {
				Record.runCommand( evt );

				if ( ++Record.playPos === Record.commands.length ) {
					Record.stop();

					$("#record").removeClass("playing")
						.find("span").text( "Record" );
				}
			}
		}, 1 );
	},
	
	pause: function() {
		clearInterval( Record.playInterval );
		
		Record.playing = null;
		Record.playInterval = null;
		Record.pauseTime = (new Date).getTime();
	},
	
	stop: function() {
		Record.pause();
		Record.playStart = null;
	},

	runCommand: function( evt ) {
		for ( var handler in Record.handlers ) {
			if ( typeof evt[ handler ] !== "undefined" ) {
				return Record.handlers[ handler ]( evt );
			}
		}
	
	/*
		if ( evt.type === "keypress" ) {
			var str = String.fromCharCode( evt.charCode );

			if ( str ) {
				var e = document.createEvent("TextEvent");
				e.initTextEvent( "textInput", true, true, null, str );
				Editor.textarea[0].dispatchEvent( e );
			}

		} else if ( evt.type === "keydown" ) {
			if ( evt.keyCode && (evt.keyCode < 48 || evt.keyCode === 32) ) {
				Editor.textarea.simulate( evt.type, { keyCode: evt.keyCode } );
			}

		} else if ( evt.style === "canvas" ) {
			Canvas[ evt.type ].apply( Canvas, evt.args );
	
		} else if ( evt.type === "mousedown" ) {
			Editor.content.simulate( evt.type, evt );
			Editor.content.simulate( "mouseup", evt );

		} else {
			Editor.content.simulate( evt.type, evt );
		}
	*/
	},

	log: function( e ) {
		if ( Record.playing === false ) {
			e.time = (new Date).getTime() - Record.startTime;
			Record.commands.push( e );
		}
	}
};