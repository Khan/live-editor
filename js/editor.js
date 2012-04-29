var Editor = function( id ) {
	var editor = this;
	
	id = id || "editor";
	
	this.editorElem = $("#" + id);
	
	editor.editor = ace.edit( id );
	
	editor.editor.setHighlightActiveLine( false );
	
	// Stop bracket highlighting
	editor.editor.$highlightBrackets = function() {};
	
	// Make sure no horizontal scrollbars are shown
	editor.editor.renderer.setHScrollBarAlwaysVisible( false );

	var session = editor.editor.getSession();
	
	// Use word wrap
	session.setUseWrapMode(true);
	
	// Stop automatic JSHINT warnings
	session.setUseWorker( false );
	
	// Use JavaScript Mode
	session.setMode(new (require("ace/mode/javascript").Mode)());
	
	editor.editor.setTheme( "ace/theme/textmate" );
	
	editor.textarea = editor.editorElem.find("textarea");
	editor.content = editor.editorElem.find("div.ace_content");
	
	editor.offset = editor.content.offset();
	
	var emptySelection = { start: { row: 0, column: 0 }, end: { row: 0, column: 0 } };
	
	if ( window.Record ) {
		var canon = require("pilot/canon"),
			event = require("pilot/event"),
			paste = false,
			doSelect = true,
			lastSelection = emptySelection;
		
		function blockSelection() {
			doSelect = false;
			
			setTimeout(function() {
				doSelect = true;
			}, 13 );
		}
		
		editor.editor.keyBinding.setKeyboardHandler({
			handleKeyboard: function($data, hashId, keyOrText, keyCode, e) {
				var isCommand = canon.findKeyCommand({editor: editor.editor}, "editor", hashId, keyOrText),
					isEmpty = jQuery.isEmptyObject( e );
				
				if ( isCommand && !isEmpty ) {
					Record.log({ cmd: isCommand.name });
					blockSelection();

				} else if ( !isCommand && isEmpty ) {
					if ( !paste ) {
						Record.log({ key: keyOrText });
					}
					blockSelection();
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
			blockSelection();
		});
		
		editor.editor.renderer.scrollBar.addEventListener( "scroll", function( e ) {
			Record.log({ top: e.data });
		});
		
		var curRange;
		
		editor.editor.selection.addEventListener( "changeSelection", function() {
			if ( !doSelect ) {
				return;
			}
			
			if ( !curRange ) {
				setTimeout(function() {
					if ( lastSelection.start.row !== curRange.start.row ||
						 lastSelection.start.column !== curRange.start.column ||
						 lastSelection.end.row !== curRange.end.row ||
						 lastSelection.end.column !== curRange.end.column ) {
							
						var diff = {
							start: {
								row: curRange.start.row,
								column: curRange.start.column
							}
						};

						if ( curRange.end.row !== curRange.start.row ||
							 curRange.end.column !== curRange.start.column ) {

							diff.end = {
								row: curRange.end.row,
								column: curRange.end.column
							};
						}

						Record.log( diff );
					
						lastSelection = curRange;
					}
					
					curRange = null;
				}, 13);
			}
			
			curRange = editor.editor.selection.getRange();
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
			
			top: function( e ) {
				editor.editor.renderer.scrollBar.setScrollTop( e.top );
			},
			
			start: function( e ) {
				if ( !e.end ) {
					e.end = e.start;
				}
				
				editor.editor.selection.setSelectionRange( e );
			},

			focus: function() {
				editor.textarea[0].focus();
			}
		});
	}
	
	editor.reset();
};

Editor.reset = function() {
	$("#editor").editorText( Exercise.code || "" );
};
	
Editor.prototype = {
	reset: function() {
		this.loadCode( "" );
	},
	
	loadCode: function( code ) {
		this.editor.getSession().setValue( code );
	}
};