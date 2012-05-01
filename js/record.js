var Record = {
	
	handlers: {},
	
	record: function() {
		if ( !Record.recording ) {
			Record.stopPlayback();
			
			Record.commands = [];
			Record.recording = true;
			Record.startTime = (new Date).getTime();
			
			$(Record).trigger( "recordStarted" );
		}
	},
	
	stopRecord: function() {
		if ( Record.recording ) {
			Record.recording = false;
			Record.recorded = true;
		
			$(Record).trigger( "recordEnded" );
		}
	},
	
	seekTo: function( time ) {
		Editor.reset();
		Canvas.clear( true );
		Canvas.endDraw();
		
		for ( var i = 0; i < Record.commands.length; i++ ) {
			var evt = Record.commands[ i ];
			
			if ( evt.time > time ) {
				Record.pauseTime = (new Date).getTime();
				Record.playStart = Record.pauseTime - time;
				Record.playPos = i;
				break;
				
			} else {
				Record.runCommand( evt );
			}
		}
	},
	
	play: function() {
		// Don't play if we're already playing
		if ( Record.playing || !Record.commands ) {
			return;
		}
		
		Record.stopRecord();
		
		var startTime = (Record.playStart ? Record.pauseTime - Record.playStart : 0);
		
		// Make sure everything is reset before playing
		Record.seekTo( startTime );
		
		Record.playing = true;
		Record.playPos = Record.playPos || 0;
		Record.playStart = (new Date).getTime() - startTime;

		Record.playInterval = setInterval(function() {
			var evt = Record.commands[ Record.playPos ];

			if ( evt && Record.currentTime() >= evt.time ) {
				Record.runCommand( evt );

				if ( ++Record.playPos === Record.commands.length ) {
					Record.stopPlayback( true );

					$(Record).trigger( "playEnded" );
				}
			}
		}, 1 );
		
		$(Record).trigger( "playStarted", !!Record.pauseTime || Record.playPos > 0 );
	},
	
	pausePlayback: function( end ) {
		if ( Record.playing ) {
			clearInterval( Record.playInterval );
		
			Record.playing = false;
			Record.playInterval = null;
			Record.pauseTime = (new Date).getTime();
			
			if ( !end ) {
				$(Record).trigger( "playPaused" );
			}
		}
	},
	
	stopPlayback: function( end ) {
		if ( Record.playing ) {
			Record.pausePlayback( end );
			
			Record.playPos = null;
			Record.playStart = null;
			
			if ( !end ) {
				$(Record).trigger( "playStopped" );
			}
		}
	},
	
	currentTime: function() {
		return (new Date).getTime() - Record.playStart;
	},

	runCommand: function( evt ) {
		for ( var handler in Record.handlers ) {
			if ( typeof evt[ handler ] !== "undefined" ) {
				return Record.handlers[ handler ]( evt );
			}
		}
	},

	log: function( e ) {
		if ( !Record.playing && Record.recording && Record.commands ) {
			e.time = (new Date).getTime() - Record.startTime;
			Record.commands.push( e );
			return true;
		}
	},
	
	pauseLog: function() {
		Record.recording = false;
	},
	
	resumeLog: function() {
		Record.recording = true;
	}
};