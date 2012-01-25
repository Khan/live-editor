var Editor = function( id ) {
	var editor = this;
	
	id = id || "editor";
	
	this.editorElem = $("#" + id);
	
	editor.editor = ace.edit( id );
	
	editor.editor.setHighlightActiveLine( false );
	
	// Stop bracket highlighting
	editor.editor.$highlightBrackets = function() {};

	var session = editor.editor.getSession();
	
	// Stop automatic JSHINT warnings
	session.setUseWorker( false );
	
	// Use JavaScript Mode
	session.setMode(new (require("ace/mode/javascript").Mode)());
	
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