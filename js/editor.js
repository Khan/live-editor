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
		Editor.editorElem = $("#editor");
		
		require(["ace/ace", "ace/mode/javascript"], function() {
			Editor.editor = require("ace/ace").edit( "editor" );
			
			Editor.editor.setHighlightActiveLine( false );

			Editor.editor.getSession().setMode(new (require("ace/mode/javascript").Mode)());
			Editor.editor.setTheme( "ace/theme/textmate" );
			
			Editor.textarea = Editor.editorElem.find("textarea");
			Editor.content = Editor.editorElem.find("div.ace_content");
			
			Editor.offset = Editor.content.offset();
			
			Editor.textarea.bind( "keydown", function( e ) {
				if ( e.keyCode && e.keyCode < 48 && e.keyCode !== 13 && e.keyCode !== 32 ) {
					Record.log({ key: e.keyCode });
				}
			});
			
			Editor.reset();
		});
		
		// Watch for mouse and key events
		Editor.editorElem.bind({
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
	
	reset: function() {
		// NOTE: This method will probably go away
		Editor.loadCode( jQuery("#code").html() );
	},
	
	loadCode: function( code ) {
		Editor.editor.getSession().setValue( code );
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