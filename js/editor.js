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
		$("#editor").bind({
			mousedown: function( e ) {
				Record.log({ x: e.layerX, y: e.layerY });
			},
			
			keypress: function( e ) {
				var text = String.fromCharCode( e.keyCode );
				
				if ( text ) {
					Record.log({ text: text });
				}
			}
		});
	},
	
	create: function() {
		require(["ace/ace", "ace/mode/javascript"], function() {
			var JavaScriptMode = require("ace/mode/javascript").Mode;
			var editor = require("ace/ace").edit( "editor" );

			editor.getSession().setMode(new JavaScriptMode());
			editor.setTheme( "ace/theme/textmate" );
			
			Editor.textarea = $("#editor textarea");
			Editor.content = $("#editor div.ace_content");
			
			Editor.offset = Editor.content.offset();
			
			Editor.textarea.bind( "keydown", function( e ) {
				if ( e.keyCode && e.keyCode < 48 && e.keyCode !== 13 && e.keyCode !== 32 ) {
					Record.log({ key: e.keyCode });
				}
			});
		});
	},
	
	reset: function() {
		Editor.loadCode( $("#code").html() );
	},
	
	loadCode: function( code ) {
		$("#editor").html( code );
		Editor.create();
	}
};

// Add in record playback handlers.
jQuery.extend( Record.handlers, {
	key: function( e ) {
		Editor.textarea.simulate( "keydown", { keyCode: e.key } );
	},
	
	text: function( e ) {
		var evt = document.createEvent("TextEvent");
		evt.initTextEvent( "textInput", true, true, null, e.text );
		Editor.textarea[0].dispatchEvent( evt );
	},
	
	x: function( e ) {
		var evt = { clientX: Editor.offset.left + e.x, clientY: Editor.offset.top + e.y };
		Editor.content.simulate( "mousedown", evt );
		Editor.content.simulate( "mouseup", evt );
	}
});