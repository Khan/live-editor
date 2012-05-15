// Temporary solution until we get a full DB/UI implemented
var ExerciseMap = {
	// Starting point
	0: 537514895,
	
	// Intro to programming
	537514895: 527964494,
	
	// Intro to Variables 1
	527964494: 580591777,
	
	// Intro to Variables 2
	580591777: 612865753,
	
	// Basic computations
	612865753: 528949083,
	
	// Reading text
	528949083: 579066940,
	
	// Reading numbers
	579066940: 563383397,
	
	// Conditions
	// 563383397
	
	// For testing:
	1: 18
};

soundManager.url = "/canvas-editor/js/swf/";

// Disable this callback function in SoundCloud, it throws errors (not sure why)
Recorder.stop = function(){};

// Make sure SoundCloud writes to localStorage to save repeated login attempts
SC.storage = function() {
	return window.localStorage;
};

SC.initialize({
	client_id: window.KA_IS_DEV ?
		"82ff867e7207d75bc8bbd3d281d74bf4" :
		"3f0c48a9e159d0610cae89b55f39751e",
	redirect_uri: window.location.href.replace(/labs\/.*$/, "labs/callback")
});

$(document).delegate( "a.ui-button", {
	mouseenter: function() {
		if ( !$(this).hasClass( "ui-state-disabled" ) ) {
			$(this).addClass( "ui-state-hover" );
		}
	},
	
	mouseleave: function() {
		$(this).removeClass( "ui-state-hover" );
	},

	click: function( e ) {
		e.preventDefault();
		
		if ( !$(this).hasClass( "ui-state-disabled" ) ) {
			$(this).trigger( "buttonClick" );
		}
	}
});

$(document).delegate( ".tipbar .close", "click", function() {
	$(this).parents(".editor-box").hideTip();
	focusProblem();
	return false;
});

$(document).delegate( ".tipbar .tipnav a", "click", function() {
	if ( !$(this).hasClass( "ui-state-disabled" ) ) {
		var box = $(this).parents(".editor-box"),
			tipData = box.data( "tipData" );
		
		tipData.pos += $(this).hasClass( "next" ) ? 1 : -1;
		box.showTip();
	}
	
	focusProblem();
	
	return false;
});

$(document).delegate( ".tipbar.error .text-wrap a", "click", function() {
	var box = $(this).parents(".editor-box"),
		tipData = box.data( "tipData" ),
		error = tipData.Error[ tipData.pos ];
	
	setCursor( error );
	
	return false;
});

$(document).delegate( ".tipbar form", "submit", function() {
	var box = $(this).parents(".editor-box"),
		tipData = box.data( "tipData" ),
		answer = tipData.Question[ tipData.pos ].answer,
		input = $(this).find("input").first().val();
	
	extractResults();
	
	if ( answer === input ) {
		problemDone();
	}
	
	$(this)
		.find( ".status" ).remove().end()
		.append( "<p class='status'><span class='ui-icon ui-icon-circle-" + 
			(answer === input ? "check" : "close") + "'></span> " +
			(answer === input ? "Correct! Proceed to the next problem." : "Incorrect, try again or view the hints for help.") + "</p>" );
	
	focusProblem();
	
	return false;
});

jQuery.fn.showTip = function( type, texts, callback ) {
	var tipData = this.data( "tipData" );
	
	if ( !tipData ) {
		tipData = { pos: 0 };
		this.data( "tipData", tipData );
		this.append( $( "#tipbar-tmpl" ).html() );
	}
	
	type = type || tipData.cur;
	
	if ( texts ) {
		tipData.pos = 0;
		tipData[ type ] = texts;
		tipData.callback = callback;
	}
	
	tipData.cur = type;
	texts = texts || tipData[ type ];
	
	var pos = tipData.pos,
		bar = this.find(".tipbar")
		.attr( "class", "tipbar ui-state-hover " + type.toLowerCase() )
		
		// Inject current text
		.find( "strong" ).text( type + ( texts.length > 1 ? " #" + (pos + 1) : "" ) + ":" ).end()
		.find( ".text" ).html( texts[ pos ].text || texts[ pos ] || "" ).end()
		.find( "a.prev" ).toggleClass( "ui-state-disabled", pos === 0 ).end()
		.find( "a.next" ).toggleClass( "ui-state-disabled", pos + 1 === texts.length ).end();
	
	bar.find( ".tipnav" ).toggle( texts.length > 1 );
	
	// Only animate the bar in if it's not visible
	if ( !bar.is(":visible") ) {
		bar
			.css({ bottom: -30, opacity: 0.1 })
			.show()
			.animate({ bottom: this.find(".toolbar").is(":visible") ? 33 : 0, opacity: 1.0 }, 300 );
	}
	
	if ( tipData.callback ) {
		tipData.callback( texts[ pos ] );
	}
	
	return this;
};

jQuery.fn.hideTip = function( type ) {
	var tipData = this.data( "tipData" );
	
	if ( Output.testAnswers.length > 0 ) {
		showQuestion();
	
	} else if ( tipData && (!type || type === tipData.cur) ) {
		this.find(".tipbar").animate({ bottom: -30, opacity: 0.1 }, 300, function() {
			$(this).hide();
		});
	}
	
	return this;
};

jQuery.fn.toggleTip = function( type, texts, callback ) {
	var tipData = this.data( "tipData" );
	
	if ( !tipData || !this.find(".tipbar").is(":visible") || tipData.cur !== type ) {
		this.showTip( type, texts, callback );
		
	} else {
		this.hideTip();
	}
	
	return this;
};

jQuery.fn.buttonize = function() {
	return this.find(".ui-button")
		.addClass( "ui-widget ui-state-default ui-corner-all" )
		.find("span:first").addClass( "ui-button-icon-primary ui-icon" ).end()
		.filter(":has(.ui-button-text)")
			.addClass( "ui-button-text-icon-primary" )
		.end()
		.not(":has(.ui-button-text)")
			.addClass( "ui-button-icon-only" )
			.append( "<span class='ui-button-text'>&nbsp;</span>" )
		.end()
	.end();
};

jQuery.fn.editorText = function( text ) {
	var editor = this.data("editor");
	
	if ( text != null ) {
		if ( editor && editor.editor ) {
			editor.editor.getSession().setValue( text );
		}
		
	} else {
		return editor && editor.editor ?
			editor.editor.getSession().getValue().replace(/\r/g, "\n") :
			null;
	}
	
	return this;
};

jQuery.fn.extractCursor = function( testObj ) {
	var cursor = this.data( "editor" ).editor.getCursorPosition();
	
	testObj.cursorRow = cursor.row;
	testObj.cursorColumn = cursor.column;
	
	return this;
};

jQuery.fn.setCursor = function( testObj, focus ) {
	if ( testObj && (testObj.cursorRow != null || testObj.row != null) ) {
		var editor = this.data( "editor" ).editor;
		
		editor.moveCursorToPosition({
			row: testObj.cursorRow || testObj.row || 0,
			column: testObj.cursorColumn || testObj.column || 0
		});
		
		editor.clearSelection();
		
		if ( focus !== false ) {
			editor.focus();
		}
	}
};

var setCursor = function( testObj ) {
	$("#editor").setCursor( testObj );
};

var formatTime = function( seconds ) {
	var min = Math.floor( seconds / 60 ),
		sec = Math.round( seconds % 60 );
	
	if ( min < 0 || sec < 0 ) {
		min = 0;
		sec = 0;
	}
	
	return min + ":" + (sec < 10 ? "0" : "") + sec;
};

var getExerciseList = function( callback ) {
	$.getJSON( "/api/labs/videoexercises", callback );
};

var getExercise = function( id, callback ) {
	$.getJSON( "/api/labs/videoexercises/" + id, function( exerciseData ) {
		lastSave = JSON.stringify( exerciseData );
		
		// Load in the user's saved progress
		loadResults( exerciseData, callback );
	});
};

var saveExercise = function( callback ) {
	// Make sure we get the latest data
	extractProblem( curProblem );
	
	var data = JSON.stringify( Exercise );
	
	$.ajax({
		url: "/api/labs/videoexercises" + (Exercise.id ? "/" + Exercise.id : ""),
		data: data,
		dataType: "JSON",
		type: Exercise.id ? "PUT" : "POST",
		contentType: "application/json",
		success: function( exerciseData ) {
			lastSave = JSON.stringify( exerciseData );
			callback( exerciseData );
		}
	});		
};

var getScratch = function( id, callback ) {
	$.getJSON( "/api/labs/scratch/" + id, function( scratchData ) {
		Record.commands = scratchData.recording;
		
		// Load in the user's scratch code
		callback( scratchData );
	});
};

var saveScratch = function( callback ) {
	$.ajax({
		type: "POST",
		url: "/api/labs/scratch",
		dataType: "JSON",
		contentType: "application/json",
		data: JSON.stringify({
			parent: Exercise.id || null,
			title: Exercise.title || "Code Scatchpad",
			code: Record.recorded ? Exercise.code : $("#editor").editorText(),
			audio_id: Record.recorded ? Exercise.audio_id || 0 : 0,
			recording: Record.recorded ? Record.commands : []
		}),
		success: function( scratchData ) {
			callback( scratchData );
		}
	});	
};

var problemDone = function() {
	if ( curProblem ) {
		curProblem.done = true;
	}

	$("#main-tabs-nav .ui-tabs-selected").markDone();

	$("#next-problem-desc").show();
	$(".next-problem").show();
	$("#code").addClass( "done" );
	
	if ( curProblem && curProblem.solution ) {
		$("#solution-nav").removeClass( "ui-state-disabled" );
		$("#editor-box-tabs-nav").tabs( "select", 3 );
	}
};

jQuery.fn.markDone = function() {
	return this
		.next( "li" ).removeClass( "ui-state-disabled" ).end()
		.removeClass( "ui-state-disabled" )
 		.addClass( "icon-tab" )
		.find( "a" ).prepend( "<span class='ui-icon ui-icon-circle-check'></span>" ).end();
};

var saveResults = function( callback ) {
	var results = [],
		problems = Exercise.problems;
	
	for ( var i = 0; i < problems.length; i++ ) {
		var problem = problems[i];
		
		results.push({
			id: problem.id,
			answer: problem.answer,
			done: problem.done,
			cursorRow: problem.cursorRow,
			cursorColumn: problem.cursorColumn
		});
	}
	
	if ( !window.DEBUG ) {
		window.localStorage[ "labs-cs-" + Exercise.id ] = JSON.stringify({ problems: results });
	}
	
	if ( callback ) {
		callback();
	}
};

var loadResults = function( exercise, callback ) {
	if ( !window.DEBUG ) {
		var results = JSON.parse( window.localStorage[ "labs-cs-" + exercise.id ] || null );
	
		if ( results && results.problems ) {
			for ( var i = 0; i < results.problems.length; i++ ) {
				var problem = exercise.problems[i],
					result = results.problems[i];
				
				if ( problem && result && problem.id === result.id ) {
					$.extend( problem, result );
				}
			}
		}
	}
	
	if ( callback ) {
		callback( exercise );
	}
};

var extractResults = function( code, callback ) {
	if ( Output.testAnswers.length > 0 ) {
		code = $(".tipbar input").first().val();
	}
	
	if ( curProblem && (code !== curProblem.start || curProblem.answer != null) ) {
		curProblem.answer = code;
	}
};

var openExerciseDialog = function( callback ) {
	var dialog = $("<div><ul><li>Loading...</li></ul></div>")
		.dialog({ title: "Open Exercise", modal: true });

	getExerciseList(function( exercises ) {
		var ul = dialog.find("ul");
	
		ul.html( exercises.length ? "" : "<li>No exercises found.</li>" );
	
		$.each( exercises, function() {
			var exercise = this;

			// TODO: Maybe show who created the exercise
			$("<li><a href=''>" + exercise.title + "</a></li>")
				.find("a").click(function() {
					ul.html( "<li>Loading exercise...</li>" );
				
					getExercise( exercise.id, function( exercise ) {
						callback( exercise );
					
						dialog.dialog( "destroy" );
					});

					return false;
				}).end()
				.appendTo( ul );
		});
	});
};

var connectAudio = function( callback ) {
	SC.whenStreamingReady(function() {
		soundManager.onready(function() {
			if ( window.Exercise && Exercise.audio_id ) {
				SC.get( "/tracks/" + Exercise.audio_id, function( data ) {
					if ( callback ) {
						callback( data );
					}
				});
	
			} else {
				if ( callback ) {
					callback();
				}
			}
		});
	});
};

(function() {
	var oldValue, range, firstNum, slider, picker, curPicker, handle, ignore = false;
	
	jQuery.fn.hotNumber = function( reload ) {
		var editor = this.data("editor").editor,
			selection = editor.session.selection;
		
		if ( reload ) {
			checkNumber.call( editor );
			
		} else {
			selection.on( "changeCursor", $.proxy( checkNumber, editor ) );
			
			attachPicker( editor );
			attachSlider( editor);
		}
		
		Record.handlers.hot = function( e ) {
			update( editor, e.hot );
			updatePos( editor );
		};
		
		return this;
	};
	
	function attachSlider( editor ) {
		if ( !slider ) {
			slider = $("<div class='hotnumber'><div class='scrubber'></div><div class='arrow'></div>")
				.appendTo( "body" )
				.find( ".scrubber" )
					.append(
						$("<div class='scrubber-handle'/>")
							.text('◄ ◆ ►')
							.draggable({
								drag: function() {
									var thisOffset = $(this).offset();
									var parentOffset = $(this).parent().offset();
									var dx = thisOffset.left - parentOffset.left;
									var dy = parentOffset.top - thisOffset.top;
									if (handle) {
										handle( Math.round(dx / 10.0) * Math.pow(10, Math.round(dy / 100.0)));
									}
								},
								stop: function() {
									$(this).css({
										left: 0,
										top: 0
									});
									checkNumber.call( editor );
								}
							})
					)
					.end()
				.hide();
		}
	}
	
	function attachPicker( editor ) {
		if ( !picker ) {
			picker = $("<div class='hotnumber picker'><div id='hotpicker' class='picker'></div><div class='arrow'></div>")
				.appendTo( "body" )
				.find( ".picker" ).ColorPicker({
					flat: true,
					onChange: function( hsb, hex, rgb ) {
						if ( handle ) {
							handle( rgb );
						}
					}
				}).end()
				.bind( "mouseleave", function() {
					var pos = editor.selection.getCursor(),
						coords = editor.renderer.textToScreenCoordinates( pos.row,
							editor.session.getDocument().getLine( pos.row ).length );

					$(this).css({ top: $(window).scrollTop() + coords.pageY, left: coords.pageX });
				})
				.hide();
		}
	}
	
	function checkNumber() {
		if ( ignore ) {
			return;
		}
		
		range = null;
		
		var editor = this,
			pos = editor.selection.getCursor(),
			line = editor.session.getDocument().getLine( pos.row ),
			prefix = line.slice( 0, pos.column ),
			oldPicker = curPicker, newPicker;
		
		if ( /\b(?:background|fill|stroke)\(\s*([\s\d,]*)\s*$/.test( prefix ) ) {
			var before = pos.column - RegExp.$1.length;
			
			if ( /^\s*([\s\d,]*?)\s*(\)|$)/.test( line.slice( before ) ) ) {
				var Range = require("ace/range").Range;
				
				oldValue = RegExp.$1;
				range = new Range( pos.row, before, pos.row, before + oldValue.length );
				
				// Insert a ); if one doesn't exist
				// Makes it easier to quickly insert a color
				// TODO: Maybe we should do this for more methods?
				if ( RegExp.$2.length === 0 ) {
					ignore = true;
					
					Record.pauseLog();
					
					editor.session.getDocument().insertInLine({ row: pos.row, column: line.length },
						( oldValue ? "" : (oldValue = "255, 0, 0") ) + ");");
					editor.selection.setSelectionRange( range );
					editor.selection.clearSelection();
					
					Record.resumeLog();
					
					ignore = false;
				}
			
				handle = function( value ) {
					updateColorSlider( editor, value );
				};
				
				newPicker = picker;
			}
			
		} else {
			var before = pos.column - (/([\d.-]+)$/.test( prefix ) ? RegExp.$1.length : 0);
	
			if ( /^([\d.-]+)/.test( line.slice( before ) ) && !isNaN( parseFloat( RegExp.$1 ) ) ) {
				var Range = require("ace/range").Range;
			
				oldValue = RegExp.$1;
				firstNum = parseFloat( oldValue );
				range = new Range( pos.row, before, pos.row, before + oldValue.length );
			
				handle = function( value ) {
					updateNumberSlider( editor, value );
				};
				
				slider.find( ".slider" ).slider( "value", 50 );
				
				newPicker = slider;
			}
		}
		
		if ( oldPicker && oldPicker !== newPicker ) {
			oldPicker.hide();
		}
		
		if ( newPicker ) {
			curPicker = newPicker;
			updatePos( editor );
		}
	}
	
	function updatePos( editor ) {
		var pos = pos = editor.selection.getCursor(),
			coords = editor.renderer.textToScreenCoordinates( pos.row,
			curPicker === picker ? editor.session.getDocument().getLine( pos.row ).length : pos.column );
			
		curPicker.css({ top: $(window).scrollTop() + coords.pageY, left: coords.pageX }).show();
		
		if ( curPicker === picker ) {
			var colors = oldValue.replace( /\s/, "" ).split( "," );
			
			picker.find( ".picker" ).ColorPickerSetColor( colors.length === 3 ?
				{ r: parseFloat( colors[0] ), g: parseFloat( colors[1] ), b: parseFloat( colors[2] ) } :
				colors.length === 1 && !colors[0] ?
					{ r: 255, g: 0, b: 0 } :
					{ r: parseFloat( colors[0] ), g: parseFloat( colors[0] ), b: parseFloat( colors[0] ) } );
		}
	}
	
	function updateColorSlider( editor, rgb ) {
		if ( !range ) {
			return;
		}
		
		// Replace the old color with the new one
		update( editor, rgb.r + ", " + rgb.g + ", " + rgb.b );
	}

	function updateNumberSlider( editor, newNum ) {
		if ( !range ) {
			return;
		}
		
		newNum = firstNum + newNum;
		
		// Replace the old number with the new one
		update( editor, newNum.toString() );
	}
	
	function update( editor, newValue ) {
		ignore = true;
		
		Record.pauseLog();
		
		// Insert the new number
		range.end.column = range.start.column + oldValue.length;
		editor.session.replace( range, newValue );
		
		// Select and focus the updated number
		range.end.column = range.start.column + newValue.length;
		editor.selection.setSelectionRange( range );
		editor.focus();
		
		Record.resumeLog();
		
		Record.log({ hot: newValue });
		
		ignore = false;
		oldValue = newValue;
	}
})();
