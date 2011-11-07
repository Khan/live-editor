if ( typeof require !== "undefined" ) {
	require.config({
		paths: {
			ace: "ace/lib/ace",
			pilot: "ace/support/pilot/lib/pilot"
		}
	});
}

var Editor = {
	init: function() {
		Editor.reset();
		
		// Watch for mouse and key events
		$("#canvas-editor").bind( "mousedown keypress", Editor.log );
	},
	
	create: function() {
		require(["ace/ace", "ace/mode/javascript"], function() {
			var JavaScriptMode = require("ace/mode/javascript").Mode;
			var editor = require("ace/ace").edit( "editor" );

			editor.getSession().setMode(new JavaScriptMode());
			editor.setTheme( "ace/theme/textmate" );
			
			Editor.textarea = $("#editor textarea");
			Editor.content = $("#editor div.ace_content");
			
			Editor.textarea.bind( "keydown", Editor.log );
		});
	},
	
	reset: function() {
		Editor.loadCode( $("#code").html() );
	},
	
	loadCode: function( code ) {
		$("#editor").html( code );
		Editor.create();
	},
	
	record: function() {
		Editor.commands = [];
		Editor.playing = false;
		Editor.startTime = (new Date).getTime();
	},
	
	play: function() {
		// Don't play if we're already playing
		if ( Editor.playInterval ) {
			return;
		}
		
		Editor.playStart = (new Date).getTime() -
			(Editor.playStart ? Editor.pauseTime - Editor.playStart : 0);
		
		// Figure out if we're just starting or resuming
		if ( !Editor.playing ) {
			Editor.playPos = 0;
			Editor.playing = true;
		}

		Editor.playInterval = setInterval(function() {
			var curTime = (new Date).getTime(),
				evt = Editor.commands[ Editor.playPos ];

			if ( evt && (curTime - Editor.playStart > evt.timeStamp - Editor.startTime) ) {
				Editor.runCommand( evt );

				if ( ++Editor.playPos === Editor.commands.length ) {
					Editor.stop();

					$("#record").removeClass("playing")
						.find("span").text( "Record" );
				}
			}
		}, 1 );
	},
	
	pause: function() {
		clearInterval( Editor.playInterval );
		
		Editor.playing = null;
		Editor.playInterval = null;
		Editor.pauseTime = (new Date).getTime();
	},
	
	stop: function() {
		Editor.pause();
		Editor.playStart = null;
	},
	
	runCommand: function( evt ) {
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
	},
	
	log: function( e ) {
		if ( Editor.playing === false ) {
			Editor.commands.push( e );
		}
	}
};