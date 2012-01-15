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
 * None of the other code saves :(
 * HINTS aren't reloaded after OPEN
 * Drag and drop accordion
 * When you delete, re-focus the previous item
 * Confirm auto-save when leaving page
 */

require([ "ace/worker/jshint" ], function( jshint ) {
	JSHINT = jshint;
});

$(function() {
	// Set up toolbar buttons
	// (Use jQuery UI styling but different interaction model)
	$(".ui-button")
		.addClass( "ui-widget ui-state-default ui-corner-all" )
		.find("span:first").addClass( "ui-button-icon-primary ui-icon" ).end()
		.filter(":has(.ui-button-text)")
			.addClass( "ui-button-text-icon-primary" )
		.end()
		.not(":has(.ui-button-text)")
			.addClass( "ui-button-icon-only" )
			.append( "<span class='ui-button-text'>&nbsp;</span>" )
		.end();
	
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
	
	$(".delete-problem").live( "click", function() {
		var content = $(this).parents(".ui-accordion-content"),
			pos = $("#tests .ui-accordion.content").index( content ) - 1;
		
		// Remove exercise
		Exercise.problems.splice( pos, 1 );
		
		// Remove it from the page too
		content.prev( ".ui-accordion-header" ).remove();
		content.remove();
		
		$("#tests").accordion( "activate", Exercise.problems[ pos ] ? pos + 1 : 0 );
		
		return false;
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
	
	$(".add-hint").live("click", function() {
		$( $("#hint-tmpl").html() )
			.appendTo( "#hints" );
	});
	
	$(".remove-hint").live("click", function() {
		$(this).parents("li").remove();
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
	}
};

var insertExerciseForm = function( testObj ) {
	var exercise = $( $("#form-tmpl").html() )
		.buttonize()
		.find( "a.name" ).text( testObj.title || "" ).end()
		.find( "input[name='title']" ).val( testObj.title || "" ).end()
		.find( "textarea[name='desc']" ).val( testObj.desc || "" ).end()
		.appendTo( "#tests" );
	
	if ( testObj.problems ) {
		exercise.find(".ui-button").remove();
	}
	
	$( "#tests" ).accordion( "destroy" ).accordion({ active: ":last" });
};

var extractProblem = function( testObj ) {
	for ( var editor in editors ) {
		testObj[ editors[editor] ] = $("#" + editor).editorText();
	}
	
	jQuery.extend( testObj, {
		hints: $("#hints textarea").map(function() {
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
			"";
	}
};

var runCode = function( code, context ) {
	var fn = new Function( "with(__context__) {\n" + code + "\n}", "__context__" );
	
	fn( context );
};