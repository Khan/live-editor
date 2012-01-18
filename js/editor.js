if ( typeof require !== "undefined" ) {
	require.config({
		paths: {
			ace: "ace/lib/ace",
			pilot: "ace/support/pilot/lib/pilot"
		}
	});
}

// TODO: Change how selections are made and tracked
//       .editor.selection.getCursor()
//       .editor.selection.moveCursorTo( 1, 3 )
//       .editor.selection.getSelectionAnchor()
//       .editor.selection.setSelectionAnchor( 1, 3 )
//       this.selection.addEventListener("changeCursor", this.$onCursorChange);
//       this.selection.addEventListener("changeSelection", this.$onSelectionChange);
// TODO: Change how key presses are played back
//       .editor.keyBinding.onTextInput( "foo!", false );
//       .editor.keyBinding.onCommandKey( event, hashId??, keyCode )
//       .editor.keyBinding.setKeyboardHandler({ handleKeyboard: function() { console.log( arguments ); } })
// TODO: Track scroll position changes
//       this.session.addEventListener("changeScrollTop", this.$onScrollTopChange);
//       this.session.getScrollTop()
//       this.session.addEventListener("changeScrollLeft", this.$onScrollLeftChange);
//       this.session.getScrollLeft()

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