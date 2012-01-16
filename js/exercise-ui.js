var Exercise,
	JSHINT,
	curProblem,
	lastSave,
	
	editors = {
		"start-code": "start",
		"finish-code": "solution",
		"validate-code": "validate"
	};

require([ "ace/worker/jshint" ], function( jshint ) {
	JSHINT = jshint;
});

$(function() {
	// Set up toolbar buttons
	$(document).buttonize();
	
	$("body").delegate( ".ui-button", {
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
	
	$("#new").bind( "buttonClick", function() {
		confirmSave( createNewExercise );
	});
	
	$("#open").bind( "buttonClick", function() {
		confirmSave(function() {	
			openExerciseDialog( createNewExercise );
		});
	});
	
	$("#save").bind( "buttonClick", function( e ) {
		var save = $(this)
			.addClass( "ui-state-disabled" )
			.find( ".ui-button-text" ).text( "Saving..." ).end();
		
		saveExercise(function() {
			save
				.removeClass( "ui-state-disabled" )
				.find( ".ui-button-text" ).text( "Save" ).end();
		});
	});
	
	$("#add-problem").bind( "buttonClick", makeProblem );
	
	$("#tests").delegate(".delete-problem", "buttonClick", function() {
		var content = $(this).parents(".ui-accordion-content"),
			pos = $("#tests .ui-accordion-content").index( content ) - 1;
		
		// Remove exercise
		Exercise.problems.splice( pos, 1 );
		
		// Remove it from the page too
		content.prev( ".ui-accordion-header" ).remove();
		content.remove();
		
		$("#tests")
			.accordion( "destroy" )
			.accordion({ collapsible: true, active: Exercise.problems[ pos - 1 ] ? pos : 0 });
		
		if ( Exercise.problems.length <= 1 ) {
			$("#reorder-problems").addClass( "ui-state-disabled" );
		}
		
		return false;
	});
	
	var dragging = false,
		exerciseName;
	
	$("#reorder-problems").bind( "buttonClick", function() {
		$("#tests")
			.toggleClass( "sorting", !dragging )
			.sortable( "option", "disabled", dragging );
		dragging = !dragging;
		
		if ( dragging ) {
			$(this).find( ".ui-button-text" ).text( "Finish Re-ordering" ).end();
			
			exerciseName = $("#tests h3.exercise-name").next().andSelf().detach();
			
			$("#tests").accordion( "activate", false );
		
			$("#tests h3")
			 	.find( "a" ).bind( "click", disableOpen ).end()
				.find( ".ui-icon" ).addClass( "ui-icon-grip-dotted-horizontal" ).end()
				.each(function() {
					$(this).next().appendTo( this );
				});
			
		} else {
			$(this).find( ".ui-button-text" ).text( "Re-order Problems" ).end();
			
			$("#tests h3")
				.each(function() {
					$(this).find( "div" ).insertAfter( this );
				})
			 	.find( "a" ).unbind( "click", disableOpen ).end()
				.find( ".ui-icon" ).removeClass( "ui-icon-grip-dotted-horizontal" ).end();
			
			$("#tests")
				.prepend( exerciseName )
				.accordion( "destroy" )
				.accordion({ collapsible: true });
		}
	});
	
	function disableOpen() {
		return false;
	}
	
	$("#tests").sortable({
		disabled: true,
		items: "> h3",
		axis: "y",
		stop: function() {
			// Persist changes to problem reordering
			Exercise.problems = $("#tests h3").map(function() {
				return $(this).data( "problem" );
			}).get();
		}
	});
	
	$("#tests").bind( "accordionchangestart", function( e, ui ) {
		var oldProblem = ui.oldHeader && ui.oldHeader.data( "problem" ),
			newProblem = ui.newHeader.data( "problem" );
		
		// Save entered data
		if ( oldProblem && !oldProblem.problems ) {
			extractProblem( oldProblem );
		}
		
		// Load new data
		if ( newProblem && !newProblem.problems ) {
			curProblem = newProblem;
			resetProblem( curProblem );
		
		} else {
			curProblem = null;
			resetProblem( null );
		}
	}).change(function( e ) {
		var elem = e.target;
		
		(curProblem || Exercise)[ elem.name ] = elem.value;
		
		if ( elem.name === "title" ) {
			$("#tests h3.ui-state-active a").html( elem.value || "&nbsp;" );
		}
	});
	
	$("#code-tabs").tabs({
		show: function( e, ui ) {
			var editorElem = $( ui.panel ).find( ".editor" );
			
			if ( editorElem.length ) {
				var editor = editorElem.data( "editor" );
			
				if ( !editor ) {
					editor = new Editor( editorElem[0].id );
					editorElem.data( "editor", editor );
				}

				if ( editors[ editorElem[0].id ] ) {
					editorElem.editorText( curProblem && curProblem[ editors[ editorElem[0].id ] ] || "" );
				}
				
				// Save the editor when switching tabs
				if ( curProblem ) {
					extractProblem( curProblem );
				}
			}
		}
	});
	
	$("#hints").sortable({
		axis: "y",
		stop: function() {
			extractProblem( curProblem );
		}
	});
	
	$("#hints-tab").delegate(".add-hint", "buttonClick", function() {
		$( $("#hint-tmpl").html() )
			.buttonize()
			.appendTo( "#hints" )
			.find( "input" ).focus();
		
		extractProblem( curProblem );
		
	}).delegate(".remove-hint", "buttonClick", function() {
		$(this).parents(".hint").remove();
		
		extractProblem( curProblem );
	});
	
	$(".editor-form").submit( false );
	
	$(window).bind( "beforeunload", function() {
		if ( !confirmSave() ) {
			return "You have unsaved work, CANCEL in order to save your work first.";
		}
	});
});

var confirmSave = function( callback ) {
	var needSave = Exercise && JSON.stringify( Exercise ) !== lastSave;
	
	if ( !callback ) {
		return !needSave;
	}
	
	if ( needSave && confirm( "Do you wish to save your unsaved work before continuing?" ) ) {
		saveExercise( callback );
	
	} else {
		callback();
	}
};

var createNewExercise = function( data ) {
	Exercise = data || { title: "Exercise Name", desc: "", problems: [] };
	
	// Reset visual view
	$("#tests").empty();
	resetProblem( null );
	
	insertExerciseForm( Exercise );
	
	for ( var i = 0; i < Exercise.problems.length; i++ ) {
		insertExerciseForm( Exercise.problems[i] );
	}
	
	$("#save, #add-problem").removeClass( "ui-state-disabled" );
};

var makeProblem = function() {
	if ( Exercise ) {
		var problem = { title: "Problem #" + (Exercise.problems.length + 1), desc: "" };
		Exercise.problems.push( problem );
	
		if ( curProblem ) {
			extractProblem( curProblem );
		}
	
		curProblem = problem;
	
		insertExerciseForm( curProblem );
		resetProblem( curProblem );
	}
};

var insertExerciseForm = function( testObj ) {
	var exercise = $( $("#form-tmpl").html() )
		.buttonize()
		.filter( "h3" ).data( "problem", testObj ).end()
		.find( "a.name" ).text( testObj.title || "" ).end()
		.find( "input[name='title']" ).val( testObj.title || "" ).end()
		.find( "textarea[name='desc']" ).val( testObj.desc || "" ).end()
		.appendTo( "#tests" );
	
	if ( testObj.problems ) {		
		exercise
			.find( ".ui-button" ).remove().end()
			.filter( "h3" ).addClass( "exercise-name" );
	}
	
	$( "#tests" )
		.accordion( "destroy" )
		.accordion({ collapsible: true, active: ":last" });
		
	$("#tests .ui-accordion-content-active input[name='title']").select().focus();
};

var extractProblem = function( testObj ) {
	for ( var editor in editors ) {
		var val = $("#" + editor).editorText();
		
		if ( val != null ) {
			testObj[ editors[editor] ] = val;
		}
	}
	
	jQuery.extend( testObj, {
		hints: $("#hints input").map(function() {
			return $(this).val();
		}).get()
	});
};

var resetProblem = function( testObj ) {
	$("#overlay").toggle( !testObj || !!testObj.problems );
	
	if ( Exercise.problems.length > 1 ) {
		$("#reorder-problems").removeClass( "ui-state-disabled" );
	}
	
	for ( var editor in editors ) {
		$("#" + editor).editorText( testObj && testObj[ editors[editor] ] || "" );
	}
	
	$("#hints").empty();
	
	if ( testObj && testObj.hints ) {
		for ( var i = 0; i < testObj.hints.length; i++ ) {
			$( $("#hint-tmpl").html() )
				.find( "input" ).val( testObj.hints[i] || "" ).end()
				.buttonize()
				.appendTo( "#hints" );
		}
	}
	
	$("#code-tabs").tabs( "select", 0 );
};

var runCode = function( code, context ) {
	var fn = new Function( "with(__context__) {\n" + code + "\n}", "__context__" );
	
	fn( context );
};