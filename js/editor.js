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
	
	var canon = require("pilot/canon");
	
	if ( window.Record ) {
		var event = require("pilot/event"),
			paste = false;
		
		editor.editor.keyBinding.setKeyboardHandler({
			handleKeyboard: function($data, hashId, keyOrText, keyCode, e) {
				var isCommand = canon.findKeyCommand({editor: editor.editor}, "editor", hashId, keyOrText),
					isEmpty = jQuery.isEmptyObject( e );
				
				if ( isCommand && !isEmpty ) {
					Record.log({ cmd: isCommand.name });

				} else if ( !isCommand && isEmpty ) {
					if ( !paste ) {
						Record.log({ key: keyOrText });
					}
					paste = false;
				}
			}
		});
		
		editor.editor.addEventListener( "copy", function() {
			Record.log({ copy: 1 });
		});
		
		editor.editor.addEventListener( "paste", function( text ) {
			paste = true;
			Record.log({ paste: text });
		});
		
		editor.editor.addEventListener( "cut", function() {
			Record.log({ cut: 1 });
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
			cut: function() {
				editor.editor.onCut();
			},
			
			copy: function() {
				editor.editor.getCopyText();
			},
			
			paste: function( e ) {
				editor.editor.onTextInput( e.paste, true );
			},
			
			cmd: function( e ) {
				canon.exec( e.cmd, { editor: editor.editor }, "editor" );
			},
			
			key: function( e ) {
				editor.editor.onTextInput( e.key, false );
			},

			focus: function() {
				editor.textarea[0].focus();
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