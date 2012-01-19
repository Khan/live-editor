if ( typeof require !== "undefined" ) {
	require.config({
		paths: {
			ace: "ace/lib/ace",
			pilot: "ace/support/pilot/lib/pilot"
		}
	});
}

var Editor = function( id ) {
	var editor = this;
	
	id = id || "editor";
	
	this.editorElem = $("#" + id);
	
	require(["ace/ace", "ace/mode/javascript"], function() {
		editor.editor = require("ace/ace").edit( id );
		
		editor.editor.setHighlightActiveLine( false );

		var session = editor.editor.getSession();
		session.setMode(new (require("ace/mode/javascript").Mode)());
		session.$stopWorker();
		editor.editor.setTheme( "ace/theme/textmate" );
		
		editor.textarea = editor.editorElem.find("textarea");
		editor.content = editor.editorElem.find("div.ace_content");
		
		editor.offset = editor.content.offset();
		
		if ( window.Record ) {
			editor.textarea.bind( "keydown", function( e ) {
				if ( e.keyCode && (e.keyCode < 48 && e.keyCode !== 13 && e.keyCode !== 32 ||
						e.altKey || e.ctrlKey || e.metaKey) ) {
				
					Record.log({ key: e.keyCode, altKey: e.altKey, ctrlKey: e.ctrlKey,
						 metaKey: e.metaKey, shiftKey: e.shiftKey });
				}
			});
		}
		
		editor.reset();
	});
	
	// Watch for mouse and key events
	if ( window.Record ) {
		this.editorElem.bind({
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
		
		// Add in record playback handlers.
		jQuery.extend( Record.handlers, {
			key: function( e ) {
				editor.textarea.simulate( "keydown", { keyCode: e.key,
					altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey } );
			},

			focus: function() {
				editor.textarea[0].focus();
			},

			text: function( e ) {		
				var evt = document.createEvent("TextEvent");
				evt.initTextEvent( "textInput", true, true, null, e.text );
				Editor.textarea[0].dispatchEvent( evt );
			},

			x: function( e ) {
				var evt = { clientX: editor.offset.left + e.x, clientY: editor.offset.top + e.y };
				editor.content.simulate( "mousedown", evt );
				editor.content.simulate( "mouseup", evt );
			}
		});
	}
};
	
Editor.prototype = {
	reset: function() {
		this.loadCode( "" );
	},
	
	loadCode: function( code ) {
		this.editor.getSession().setValue( code );
	}
};