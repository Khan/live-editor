var Exercise,
	curProblem,
	lastSave,
	
	editors = {
		"start-code": "start",
		"finish-code": "solution",
		"validate-code": "validate"
	};

$(function() {
	var dragging = false,
		exerciseName;
		
	// Set up toolbar buttons
	$(document).buttonize();
	
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
		
		saveExercise(function( exerciseData ) {
			Exercise = exerciseData;
			
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
		
		curProblem = pos > 0 ? pos - 1 : null;
		resetProblem();
		
		$("#tests")
			.accordion( "destroy" )
			.accordion({ collapsible: true, active: curProblem ? pos : 0 });
		
		if ( Exercise.problems.length <= 1 ) {
			$("#reorder-problems").addClass( "ui-state-disabled" );
		}
		
		return false;
		
	}).delegate(".set-cursor", "buttonClick", function() {
		$("#start-code").extractCursor( Exercise.problems[ curProblem ] );
	});
	
	$("#reorder-problems").bind( "buttonClick", function() {
		$("#tests")
			.toggleClass( "sorting", !dragging )
			.sortable( "option", "disabled", dragging );
		
		dragging = !dragging;
		
		if ( dragging ) {
			$("#add-problem").addClass( "ui-state-disabled" );
			
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
			$("#add-problem").removeClass( "ui-state-disabled" );
			
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
			var newProblems = [];
			
			$("#tests h3").each(function() {
				var num = $(this).data( "problem" ),
					newNum = newProblems.length;
				
				newProblems[ newNum ] = Exercise.problems[ num ];
				
				$(this).data( "problem", newNum );
			})
			
			// Persist changes to problem reordering
			Exercise.problems = newProblems;
		}
	});
	
	$("#tests").bind( "accordionchangestart", function( e, ui ) {
		var oldProblem = ui.oldHeader && ui.oldHeader.data( "problem" ),
			newProblem = ui.newHeader.data( "problem" );
		
		// Save entered data
		extractProblem();
		
		// Load new data
		curProblem = newProblem != null ? newProblem : null;
		resetProblem();
		
	}).change(function( e ) {
		var elem = e.target,
			problem = curProblem != null ? Exercise.problems[ curProblem ] : Exercise;
		
		problem[ elem.name ] = elem.value;
		
		if ( elem.name === "title" ) {
			$("#tests h3.ui-state-active a").html( elem.value || "&nbsp;" );
		}
	});
	
	$("#code-tabs").tabs({
		show: function( e, ui ) {
			var editorElem = $( ui.panel ).find( ".editor" );
			
			if ( editorElem.length ) {
				var editor = editorElem.data( "editor" ),
					id = editorElem[0].id;
			
				if ( !editor ) {
					editor = new Editor( id );
					editorElem.data( "editor", editor );
				}

				if ( curProblem != null ) {
					var problem = Exercise.problems[ curProblem ];
					
					if ( editors[ id ] ) {
						editorElem.editorText( problem[ editors[ id ] ] || "" );
					}
				
					$("#start-code").setCursor( problem );
				
					// Save the editor when switching tabs
					extractProblem();
				}
			}
		}
	});
	
	$("#hints").sortable({
		axis: "y",
		stop: function() {
			extractProblem();
		}
	});
	
	$("#hints-tab").delegate(".add-hint", "buttonClick", function() {
		$( $("#hint-tmpl").html() )
			.buttonize()
			.appendTo( "#hints" )
			.find( "input" ).focus();
		
		extractProblem();
		
	}).delegate(".remove-hint", "buttonClick", function() {
		$(this).parents(".hint").remove();
		
		extractProblem();
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
	
	curProblem = null;
	
	// Reset visual view
	$("#tests").empty();
	resetProblem();
	
	insertExerciseForm();
	
	for ( var i = 0; i < Exercise.problems.length; i++ ) {
		insertExerciseForm( i, ":first" );
	}
	
	$("#save, #add-problem").removeClass( "ui-state-disabled" );
};

var makeProblem = function() {
	if ( Exercise ) {
		var problem = { title: "Problem #" + (Exercise.problems.length + 1), desc: "" };
		Exercise.problems.push( problem );
	
		// Extract the old problem
		extractProblem();
	
		// Create the new problem
		curProblem = Exercise.problems.length - 1;
	
		insertExerciseForm( curProblem );
		resetProblem();
	}
};

var insertExerciseForm = function( num, pos ) {
	var testObj = num != null ?
		Exercise.problems[ num ] :
		Exercise;
	
	var exercise = $( $("#form-tmpl").html() )
		.buttonize()
		.find( "a.name" ).text( testObj.title || "" ).end()
		.find( "input[name='title']" ).val( testObj.title || "" ).end()
		.find( "textarea[name='desc']" ).val( testObj.desc || "" ).end()
		.appendTo( "#tests" );
	
	if ( num != null ) {
		exercise.filter( "h3" ).data( "problem", num );
	}
	
	if ( testObj.problems ) {		
		exercise
			.find( ".ui-button" ).remove().end()
			.filter( "h3" ).addClass( "exercise-name" );
	}
	
	$( "#tests" )
		.accordion( "destroy" )
		.accordion({ collapsible: true, active: pos || ":last" });
	
	exercise.find("input[name='title']").select().focus();
};

var extractProblem = function() {
	if ( curProblem != null ) {
		var testObj = Exercise.problems[ curProblem ];
		
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
	}
};

var resetProblem = function() {
	var testObj = curProblem != null ?
		Exercise.problems[ curProblem ] :
		null;
	
	$("#overlay").toggle( !testObj || !!testObj.problems );
	
	if ( Exercise.problems.length > 1 ) {
		$("#reorder-problems").removeClass( "ui-state-disabled" );
	}
	
	for ( var editor in editors ) {
		$("#" + editor).editorText( testObj && testObj[ editors[editor] ] || "" );
	}
	
	$("#start-code").setCursor( testObj );
	
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