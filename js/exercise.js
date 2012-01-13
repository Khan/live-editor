var Exercise = { title: "Exercise Name", desc: "", problems: [] },
	curProblem;

require([ "ace/worker/jshint" ], function( jshint ) {
	window.JSHINT = jshint;
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
			extractProblem( oldProblem );
		}
		
		// Load new data
		if ( newPos > 0 ) {
			curProblem = Exercise.problems[ newPos - 1 ];
			resetProblem( curProblem );
		
		} else {
			curProblem = null;
			resetProblem( null );
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

				if ( editorElem[0].id === "start-code" ) {
					editorElem.editorText( curProblem && curProblem.start || "" );
				} else if ( editorElem[0].id === "finish-code" ) {
					editorElem.editorText( curProblem && curProblem.solution || "" );
				} else if ( editorElem[0].id === "validate-code" ) {
					editorElem.editorText( curProblem && curProblem.validate || "" );
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
	
	insertExerciseForm( Exercise );
});

var makeProblem = function() {
	var problem = { title: "Problem #" + (Exercise.problems.length + 1), desc: "" };
	Exercise.problems.push( problem );
	
	if ( curProblem ) {
		extractProblem( curProblem );
	}
	
	curProblem = problem;
	
	insertExerciseForm( curProblem );
	resetProblem( curProblem );
	
	// TODO: Populate main form and sync it to object
};

var insertExerciseForm = function( testObj ) {
	var exercise = $( $("#form-tmpl").html() )
		.buttonize()
		.find( "a.name" ).text( testObj.title ).end()
		.find( "input[name='title']" ).val( testObj.title ).end()
		.find( "textarea[name='desc']" ).val( testObj.desc ).end()
		.appendTo( "#tests" )
		.find( "form" ).change(function( e ) {
			var elem = e.target;
			
			testObj[ elem.name ] = elem.value;
			
			if ( elem.name === "test" ) {
				$(this).parent().prev().find("a").text( elem.value );
			}
		});
	
	if ( testObj.problems ) {
		exercise.find(".ui-button").remove();
	}
	
	$( "#tests" ).accordion( "destroy" ).accordion({ active: ":last" });
};

var extractProblem = function( testObj ) {
	jQuery.extend( testObj, {
		start: $("#start-code").editorText(),
		solution: $("#finish-code").editorText(),
		validate: $("#validate-code").editorText(),
		
		hints: $("#hints textarea").map(function() {
			return $(this).val();
		}).get(),
		
		options: {
			module: $("#module").val()
		}
	});
};

var resetProblem = function( testObj ) {
	if ( !testObj ) {
		// TODO: Hide editors
	}
	
	$("#start-code").editorText( testObj && testObj.start || "" );
	$("#finish-code").editorText( testObj && testObj.solution || "" );
	$("#validate-code").editorText( testObj && testObj.validate || "" )
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