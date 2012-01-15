var Exercise,
	JSHINT,
	curProblem,
	
	// TODO: Remove once an API is in place
	exerciseData = JSON.parse( window.localStorage.exerciseData || "[]" ),
	
	editors = {
		"start-code": "start",
		"finish-code": "solution",
		"validate-code": "validate"
	};

/* BUGS:
 * When you delete, re-focus the previous item
 * Confirm auto-save when leaving page
 */

require([ "ace/worker/jshint" ], function( jshint ) {
	JSHINT = jshint;
});

$(function() {
	// Set up toolbar buttons
	$(document).buttonize();
	
	$("body").delegate( ".ui-button", {
		hover: function() {
			if ( !$(this).hasClass( "ui-state-disabled" ) ) {
				$(this).toggleClass( "ui-state-hover" );
			}
		},

		click: function( e ) {
			e.preventDefault();
		}
	});
	
	$("#new").click(function() {
		// TODO: Confirm save before new?
		createNewExercise();
	});
	
	$("#open").click(function() {
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
							createNewExercise( exercise );
							
							$("#tests").accordion( "destroy" ).accordion({ active: ":first" });
							
							dialog.dialog( "destroy" );
						});
	
						return false;
					}).end()
					.appendTo( ul );
			});
		});
	});
	
	$("#save").click(function() {
		var save = $(this)
			.addClass( "ui-state-disabled" )
			.find( ".ui-button-text" ).text( "Saving..." ).end();
		
		saveExercise(function() {
			save
				.removeClass( "ui-state-disabled" )
				.find( ".ui-button-text" ).text( "Save" ).end();
		});
	});
	
	$("#add-problem").click( makeProblem );
	
	$("#tests").delegate(".delete-problem", "click", function() {
		var content = $(this).parents(".ui-accordion-content"),
			pos = $("#tests .ui-accordion.content").index( content ) - 1;
		
		// Remove exercise
		Exercise.problems.splice( pos, 1 );
		
		// Remove it from the page too
		content.prev( ".ui-accordion-header" ).remove();
		content.remove();
		
		$("#tests").accordion( "activate", Exercise.problems[ pos ] ? pos + 1 : 0 );
		
		if ( Exercise.problems.length <= 1 ) {
			$(".reorder-problems").addClass( "ui-state-disabled" );
		}
		
		return false;
	});
	
	var dragging = false;
	
	$("#tests").delegate(".reorder-problems", "click", function() {
		$("#tests")
			.toggleClass( "sorting", !dragging )
			.sortable( "option", "disabled", dragging );
		dragging = !dragging;
		
		if ( dragging ) {
			$(this).find( ".ui-button-text" ).text( "Finish Re-ordering" ).end();
		
			$("#tests h3:not(.exercise-name)")
			 	.find( "a" ).bind( "click", disableOpen ).end()
				.find( ".ui-icon" ).addClass( "ui-icon-grip-dotted-horizontal" ).end()
				.each(function() {
					$(this).next().appendTo( this );
				});
			
		} else {
			$(this).find( ".ui-button-text" ).text( "Re-order Problems" ).end();
			
			$("#tests h3:not(.exercise-name)")
				.each(function() {
					$(this).find( "div" ).insertAfter( this );
				})
			 	.find( "a" ).unbind( "click", disableOpen ).end()
				.find( ".ui-icon" ).removeClass( "ui-icon-grip-dotted-horizontal" ).end();
		}
	});
	
	function disableOpen() {
		return false;
	}
	
	$("#tests").sortable({
		disabled: true,
		items: "> h3:not(.exercise-name)",
		axis: "y",
		containment: "parent",
		stop: function() {
			// Persist changes to problem reordering
			Exercise.problems = $("#tests h3:not(.exercise-name)").map(function() {
				return $(this).data( "problem" );
			}).get();
		}
	});
	
	$("#tests").bind( "accordionchangestart", function( e, ui ) {
		var h3 = $(this).find("h3"),
			oldPos = h3.index( ui.oldHeader ),
			newPos = h3.index( ui.newHeader );
		
		// Save entered data
		if ( oldPos > 0 ) {
			var oldProblem = Exercise.problems[ oldPos - 1 ];
			
			if ( oldProblem ) {
				extractProblem( oldProblem );
			}
		}
		
		// Load new data
		if ( newPos > 0 ) {
			curProblem = Exercise.problems[ newPos - 1 ];
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
		containment: "parent",
		stop: function() {
			extractProblem( curProblem );
		}
	});
	
	$("#hints-tab").delegate(".add-hint", "click", function() {
		$( $("#hint-tmpl").html() )
			.buttonize()
			.appendTo( "#hints" )
			.find( "input" ).focus();
		
		extractProblem( curProblem );
	}).delegate(".remove-hint", "click", function() {
		$(this).parents(".hint").remove();
		
		extractProblem( curProblem );
	});
	
	$(".editor-form").submit( false );
});

var createNewExercise = function( data ) {
	// TODO: A better way of generating an ID
	Exercise = data || { id: (new Date).getTime(), title: "Exercise Name", desc: "", problems: [] };
	
	// Reset visual view
	$("#tests").empty();
	resetProblem( null );
	
	insertExerciseForm( Exercise );
	
	for ( var i = 0; i < Exercise.problems.length; i++ ) {
		insertExerciseForm( Exercise.problems[i] );
	}
	
	$("#save, #add-problem").removeClass( "ui-state-disabled" );
};

var getExerciseList = function( callback ) {
	// TODO: Get this from an API of some sort
	// TODO: Remove artificial delay
	setTimeout(function() {
		callback( exerciseData );
	}, 1500 );
};

var getExercise = function( id, callback ) {
	// TODO: Pull from a server instead
	var exercise;
	
	for ( var i = 0; i < exerciseData.length; i++ ) {
		if ( id === exerciseData[i].id ) {
			exercise = exerciseData[i];
			break;
		}
	}
	
	// TODO: Remove artificial delay
	setTimeout(function() {
		callback( exercise );
	}, 1500);
};

var saveExercise = function( callback ) {
	// TODO: Save to a server instead
	var isSet = false;
	
	// Make sure we get the latest data
	extractProblem( curProblem );
	
	for ( var i = 0; i < exerciseData.length; i++ ) {
		if ( Exercise.id === exerciseData[i].id ) {
			exerciseData[i] = Exercise;
			isSet = true;
			break;
		}
	}
	
	if ( !isSet ) {
		exerciseData.push( Exercise );
	}
	
	window.localStorage.exerciseData = JSON.stringify( exerciseData );
	
	// TODO: Remove artificial delay
	setTimeout( callback, 1500 );
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
		
		$("#tests .ui-accordion-content-active input[name='title']").select().focus();
		
		if ( Exercise.problems.length > 1 ) {
			$(".reorder-problems").removeClass( "ui-state-disabled" );
		}
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
		exercise.find(".ui-button")
			.removeClass( "delete-problem" )
			.addClass( "reorder-problems ui-state-disabled" )
			.find( ".ui-icon" ).removeClass( "ui-icon-closethick" ).addClass( "ui-icon-shuffle" ).end()
			.find( ".ui-button-text" ).text( "Re-order Problems" ).end();
		
		exercise.filter( "h3" ).addClass( "exercise-name" );
	}
	
	$( "#tests" ).accordion( "destroy" ).accordion({ active: ":last" });
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
		}).get(),
		
		options: {
			module: $("#module").val()
		}
	});
};

var resetProblem = function( testObj ) {
	$("#overlay").toggle( !testObj || !!testObj.problems );
	
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
};

var runCode = function( code, context ) {
	var fn = new Function( "with(__context__) {\n" + code + "\n}", "__context__" );
	
	fn( context );
};