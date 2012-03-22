// Load in SJS-compiled dependencies
require( "sjs:apollo-sys" ).require( "/canvas-editor/js/text-apollo" );

var Output = {
	icons: {
		pass: "check",
		fail: "none",
		error: "alert",
		info: "info"
	},
	
	init: function( id ) {
		this.id = id;
		this.$elem = $( "#" + id );
		this.$editor = $( "#editor" );
		this.editor = this.$editor.data( "editor" ).editor;

		this.tests = [];
		this.testAnswers = [];

		this.errors = [];
		this.asserts = [];
		this.inTask = null;
		
		this.toExec = true;
		this.context = {};
		
		if ( !curProblem.taskOpen ) {
			curProblem.taskOpen = [];
		}
		
		// Default to using CanvasOutput
		var type = CanvasOutput;
		
		// Prime the test queue
		if ( curProblem.validate ) {
			Output.exec( curProblem.validate, Output.testContext );
			
			if ( Output.tests.length ) {
				for ( var i = 0; i < Output.tests.length; i++ ) {
					var test = Output.tests[i];
					
					if ( test.type !== "default" ) {
						type = test.type;
					}
				}
			}
		}
		
		Output.setOutput( type );
		
		this.bind();
	},
	
	bind: function() {
		if ( this.bound ) {
			return;
		}
		
		Output.editor.on( "change", function() {
			Output.toExec = Output.getUserCode();
		});
		
		setInterval(function() {
			if ( Output.toExec != null ) {
				Output.runCode( Output.toExec === true ?
					Output.getUserCode() :
					Output.toExec );
				
				Output.toExec = null;
			}
		}, 100 );
		
		this.bound = true;
	},
	
	setOutput: function( output ) {
		if ( Output.output ) {
			Output.output.kill();
		}
		
		Output.output = output.init();
	},
	
	registerOutput: function( output ) {
		if ( !this.outputs ) {
			this.outputs = [];
		}
		
		this.outputs.push( output );
		
		jQuery.extend( this.testContext, output.testContext );
	},
	
	props: function() {
		return Output.output ? Output.output.props : {};
	},
	
	propList: function() {
		var propList = [],
			externalProps = this.props();

		for ( var prop in externalProps ) {
			propList.push( prop + ":" + externalProps[ prop ] );
		}

		return propList.join( "," );
	},
	
	runCode: function( userCode ) {
		var doRunTests = !!JSHINT( "/*jshint undef: true *//*global " +
				Output.propList() + "*/\n" + userCode ),
			hintData = JSHINT.data(),
			externalProps = Output.props();
		
		Output.globals = {};

		if ( hintData && hintData.globals ) {
			for ( var i = 0, l = hintData.globals.length; i < l; i++ ) (function( global ) {
				if ( global in TextOutput.props ) {
					if ( Output.output !== TextOutput ) {
						Output.setOutput( TextOutput.init() );
					}
				}

				// Do this so that declared variables are gobbled up
				// into the global context object
				if ( !externalProps[ global ] && !(global in Output.context) ) {
					Output.context[ global ] = undefined;
				}
				
				Output.globals[ global ] = true;
			})( hintData.globals[i] );
		}
		
		Output.errors = [];

		if ( doRunTests ) {
			// Run the tests
			Output.test( userCode );
			
			// Then run the user's code
			if ( Output.output && Output.output.runCode ) {
				Output.output.runCode( userCode, Output.context );
				
			} else {
				Output.exec( userCode, Output.context );
			}
			
		} else {
			for ( var i = 0; i < JSHINT.errors.length; i++ ) {
	            var error = JSHINT.errors[ i ];

	            if ( error && error.line && error.character &&
						error.reason && !/unable to continue/i.test( error.reason ) ) {

	                Output.errors.push({
	                    row: error.line - 2,
	                    column: error.character - 1,
	                    text: clean( error.reason ),
	                    type: "error",
	                    lint: error
	                });
				}
	        }
		}
		
		Output.toggleErrors();
		
		extractResults( userCode );
	},
	
	toggleErrors: function() {
		var session = Output.editor.getSession(),
			hasErrors = !!Output.errors.length;
		
		session.clearAnnotations();
		
		$("#show-errors").toggleClass( "ui-state-disabled", !hasErrors );
		$("#output .overlay").toggle( hasErrors );
		
		Output.toggle( !hasErrors );
		
		if ( hasErrors ) {
			Output.errors = Output.errors.sort(function( a, b ) {
				return a.row - b.row;
			});

	        session.setAnnotations( Output.errors );

			$("#output").showTip( "Error", Output.errors, function() {
				$( ".tipbar .text" ).append( " (<a href=''>View Error</a>)" );
			});
			
		} else {
			$("#output").hideTip( "Error" );
		}
	},
	
	test: function( userCode ) {
		var insert = $( "#results .desc" ).empty();
		
		Output.testing = true;
		Output.asserts = [];

		for ( var i = 0; i < Output.tests.length; i++ ) {
			var fieldset = $( "<fieldset><legend>" + Output.tests[i].name + " (<a href=''>View Output</a>)</legend><ul></ul></fieldset>" )
				.appendTo( insert );
			
			var testOutput = Output.runTest( userCode, Output.tests[i], i );
			
			fieldset.data( "output", testOutput || false );
		}
		
		Output.testing = false;

		var total = Output.asserts.length,
			pass = 0;

		for ( var i = 0; i < Output.asserts.length; i++ ) {
			if ( Output.asserts[i] ) {
				pass += 1;
			}
		}

		if ( total > 0 ) {
			if ( pass === total ) {
				problemDone();
			}

			$("#results")
			/*
				.find( "h3" ).text( pass === total ?
						"Test Results: All Tests Passed!" :
						"Test Results: " + (total - pass) + " Test" + (total - pass === 1 ? "" : "s") + " Failed." ).end()
				*/
					.toggleClass( "multiple", tests.length > 1 )
					.toggleClass( "error", pass < total )
					.show();
				
		} else {
			problemDone();
		}
	},
	
	runTest: function( userCode, test, i ) {
		Output.clear();
		
		if ( Output.output && Output.output.runTest ) {
			Output.output.runTest( userCode, test, i );
		
		} else {
			// We need to maintain the closure so we have to re-initialize the tests
			// and then run the current one. Definitely not ideal.
			Output.exec( userCode +
				"\n(function(){ Output.tests = [];\n" +
				curProblem.validate + "\n})(); Output.tests[" + i + "].fn();" );
		}
	},

	toggle: function( toggle ) {
		if ( Output.output && Output.output.toggle ) {
			Output.output.toggle( toggle );
		}
	},
	
	start: function() {
		if ( Output.output && Output.output.start ) {
			Output.output.start();
		}
	},
	
	stop: function() {
		if ( Output.output && Output.output.stop ) {
			Output.output.stop();
		}
	},
	
	clear: function() {
		if ( Output.output && Output.output.clear ) {
			Output.output.clear();
		}
	},

	handleError: function( e ) {
		// Temporarily hide the errors generated by using a prompt()
		// See: #50
		if ( !/Unexpected end of input/.test( e.message ) ) {
			Output.errors.push({
				row: 0,
				column: 0,
				text: clean( e.message ),
				type: "error"
			});
		
			Output.testContext.assert( false, "Error: " + e.message,
			 	"A critical problem occurred in your program making it unable to run." );
			
			Output.toggleErrors();
		}
	},

	exec: function( code ) {		
		try {
			if ( Output.output && Output.output.compile ) {
				code = Output.output.compile( code );
			}	

			var contexts = Array.prototype.slice.call( arguments, 1 );
			
			for ( var i = 0; i < contexts.length; i++ ) {
				if ( contexts[i] ) {
					code = "with(arguments[" + i + "]){\n" + code + "\n}";
				}
			}
			
			(new Function( code )).apply( Output.context, contexts );

		} catch( e ) {
			Output.handleError( e );
		}
	},
	
	testContext: {
		test: function( name, fn, type ) {
			if ( !fn ) {
				fn = name;
				name = "Test Case";
			}

			Output.tests.push({
				name: name,
				
				type: type || "default",

				fn: function() {
					try {
						return fn.apply( this, arguments );

					} catch( e ) {
						Output.handleError( e );
					}
				}
			});
		},
		
		testAnswer: function( name, val ) {
			Output.testAnswers.push({ answer: val, text: "<form>" + name +
				"<br/><input type='text'/>" +
				"<input type='submit' value='Check Answer' class='ui-button'/></form>" });
		},
		
		task: function( msg, tip ) {
			Output.testContext.log( msg, "pass", tip );
			
			var pos = $( "#results li.task" ).length,
				task = $( "#results li" ).last()
					.addClass( "task" )
					.append( "<ul></ul>" );
			
			if ( Output.inTask !== null ) {
				task.parents( "ul" ).last().append( task );
			}
			
			if ( curProblem.taskOpen[ pos ] ) {
				task.find( "ul" ).show();
			}
			
			Output.inTask = true;
		},
		
		log: function( msg, type, expected ) {
			type = type || "info";
			
			Output.updateTask( type );

			$( "<li class='" + type + "'><span class='check'><span class='ui-icon ui-icon-" +
				Output.icons[ type ] + "'></span></span> <a href='' class='msg'>" +
				clean( msg ) + "</a></li>" )
				.data( "expected", expected || false )
				.appendTo( $("#results ul").last() )
		},

		assert: function( pass, msg, expected ) {
			pass = !!pass;
			
			Output.testContext.log( msg, pass ? "pass" : "fail", expected );
			Output.asserts.push( pass );

			return pass;
		},

		isEqual: function( a, b, msg ) {
			var pass = a === b;
			
			Output.testContext.log( msg, pass ? "pass" : "fail", [ a, b ] );
			Output.asserts.push( pass );

			return pass;
		}
	},
	
	updateTask: function( type ) {
		if ( Output.inTask === true && type !== "pass" ) {
			$( "#results li.task" ).last()
				.removeClass( "pass" )
				.addClass( type || "" )
				.find( ".ui-icon" )
					.removeClass( "ui-icon-" + Output.icons.pass )
					.addClass( "ui-icon-" + Output.icons[ type ] );
			
			Output.inTask = false;
		}
	},
	
	getUserCode: function() {
		return $("#editor").editorText();
	},
	
	stringify: function( obj ) {
		try {
			return typeof obj === "function" ?
				obj.toString() :
				JSON.stringify( obj );
		} catch ( e ) {
			console.error( e, obj );
			return "null";
		}
	}
};

// TODO: Handle saved output from a test run

var TextOutput = {
	props: {
		input: false,
		inputNumber: false,
		print: false
	},
	
	init: function() {
		this.id = this.id || "output-text";
		this.$elem = $( "#" + this.id );
		this.$elem.show();
		
		this.oni = window.__oni_rt;
		
		// For managing real-time inputs
		if ( !curProblem.inputs ) {
			curProblem.inputs = [];
		}
		
		// Need to execute the test code in apollo itself
		this.doCompile = true;
		
		this.focusLine = null;
		this.inputNum = 0;
		this.curLine = -1;
		this.toInput = null;
		
		Output.context = jQuery.extend( {}, TextOutput.context );
		
		this.bind();
		
		return this;
	},
	
	bind: function() {
		if ( this.bound ) {
			return;
		}
		
		var self = this,
			root = this.$elem;
		
		this.$elem.delegate( "input", "keydown keyup change", function() {
			var last = $(this).data( "last" ),
				val = $(this).val() || null;

			if ( last != val ) {
				var pos = root.find( "input" ).index( this );

				curProblem.inputs[ pos ] = val;
				TextOutput.focusLine = root.children().index( this.parentNode );

				$(this).data( "last", val );
			}
		});
		
		setInterval( function() {
			if ( TextOutput.focusLine != null ) {
				TextOutput.runCode( Output.getUserCode() );
				TextOutput.focusLine = null;
			}
		}, 13 )
		
		this.bound = true;
	},
	
	runCode: function( code ) {		
		TextOutput.clear();
		Output.exec( code, Output.context );
	},
	
	context: {
		print: function( msg ) {
			TextOutput.resumeTest();

			if ( TextOutput.focusLine != null && TextOutput.focusLine + 1 > ++TextOutput.curLine ) {
				return;
			}

			TextOutput.addLine( clean( msg ) );
			
			TextOutput.resumeTest( "waitTestPrint", msg );
		}
	},
	
	showInput: function( msg ) {
		if ( TextOutput.focusLine != null && TextOutput.focusLine + 1 > ++TextOutput.curLine ) {
			return;
		}

		var div = TextOutput.addLine( clean( msg ) + " <input type='text' class='text'/>" ),
			input = div.find( "input" )
				.val( TextOutput.toInput != null ? TextOutput.toInput : "" );

		if ( !Output.testing ) {
			TextOutput.$elem.scrollTop( TextOutput.$elem[0].scrollHeight );
		}

		if ( TextOutput.inputNum - 1 === TextOutput.focusInput ) {
			input.focus();
		}
	},
	
	addLine: function( line ) {
		var $line = $( "<div>" + line + "</div>" )
			.appendTo( this.$elem );
		
		// output.scrollTop( output[0].scrollHeight );
		
		return $line;
	},
	
	resumeTest: function( name, msg ) {
		name = name || "waitTest";
		
		if ( TextOutput[ name ] ) {
			var doResume = TextOutput[ name ];
			delete TextOutput[ name ];
			doResume( msg );
			
			return true;
		}
	},
	
	runTest: function( userCode, test, i ) {
		// TODO: Have all tests run after user's code has been defined
		// Will need to force input/print statements to block during testMode
		
		// TODO: Output to temporary location instead
		// testOutput = [];
		
		TextOutput.$elem = $( "#" + this.id + "-test" );
		
		Output.clear();

		// Load up the IO tests
		Output.exec( "waitfor() { TextOutput.waitTest = resume; } Output.tests[" + i + "].fn();", Output.testContext );
		
		// Need to execute the test code in apollo itself
		// Need to be compiled after they've been referenced
		if ( TextOutput.doCompile ) {
			Output.tests = [];
			Output.exec( curProblem.validate, Output.testContext );
			TextOutput.doCompile = false;
		}

		// Then run the user's code
		Output.exec( userCode, Output.context );
		
		TextOutput.$elem = $( "#" + this.id );
		
		// Make sure the remaining IO tests are printed out so that the
		// user knows what's expected of them
		var checkIO;
		
		do {
			checkIO = false;
			
			TextOutput.resumeTest();
			
			checkIO = TextOutput.resumeTest( "waitTestInput", false ) || checkIO;
			checkIO = TextOutput.resumeTest( "waitTestPrint", false ) || checkIO;
		} while( checkIO );
	},
	
	testContext: {
		testIO: function( name, fn ) {
			Output.testContext.test( name, fn, TextOutput );
		}
	},
	
	clear: function() {
		if ( !Output.testing && TextOutput.focusLine != null ) {
			TextOutput.$elem.children().slice( TextOutput.focusLine + 1 ).remove();

		} else {
			TextOutput.$elem.empty();
		}

		TextOutput.inputNum = 0;
		TextOutput.curLine = -1;
	},
	
	compile: function( code ) {
		return TextOutput.oni.c1.compile( code );
	},
	
	kill: function() {
		TextOutput.$elem.empty();
		TextOutput.$elem.hide();
	}
};

Output.registerOutput( TextOutput );

var CanvasOutput = {
	init: function( id ) {
		this.id = id || "output-canvas";
		this.$elem = $( "#" + this.id );
		this.$elem.show();
		
		CanvasOutput.lastGrab = null;
		
		CanvasOutput.canvas = Output.context = new Processing( this.id, function( instance ) {
			instance.draw = function(){};
		});
		
		CanvasOutput.canvas.size( 400, 360 );
		CanvasOutput.canvas.frameRate( 30 );
		CanvasOutput.clear();
		
		if ( !CanvasOutput.props ) {
			var props = CanvasOutput.props = {};
			
			// Make sure that only certain properties can be manipulated
			for ( var prop in Output.context ) {
				if ( prop.indexOf( "__" ) < 0 ) {
					props[ prop ] = !(/^[A-Z]/.test( prop ) ||
						typeof Output.context[ prop ] === "function");
				}
			}

			props.draw = true;
		}
		
		return this;
	},
	
	runTest: function( userCode, test, i ) {
		// TODO: Add in Canvas testing
		// Create a temporary canvas and a new processing instance
		// temporarily overwrite Output.context
		// Save the canvas for later and return that as the output
		// CanvasOutput.runCode( userCode );
	},
	
	runCode: function( userCode ) {
		// Grab all the externally-exposed variables
		var grabAll = {},
			fnCalls = [];
		
		// TODO: Make sure these calls don't have a side effect
		for ( var global in Output.globals ) (function( global ) {
			grabAll[ global ] = typeof Output.context[ global ] === "function" ?
				function(){ fnCalls.push([ global, arguments ]); } :
				Output.context[ global ];
		})( global );
		
		Output.exec( userCode, grabAll );

		// Inject the newly-changed code
		var externalProps = Output.props(),
			inject = "";

		// Look for new top-level function calls to inject
		for ( var i = 0; i < fnCalls.length; i++ ) {
			var props = Array.prototype.slice.call( fnCalls[i][1] );
			inject += fnCalls[i][0] + "(" + props.join( "," ) + ");\n";
		}

		// We also look for newly-changed top-level variables to inject
		for ( var prop in grabAll ) {
			grabAll[ prop ] = Output.stringify( grabAll[ prop ] );

			if ( CanvasOutput.lastGrab && externalProps[ prop ] !== false &&
					(!(prop in CanvasOutput.lastGrab) || grabAll[ prop ] != CanvasOutput.lastGrab[ prop ]) ) {
				inject += "var " + prop + " = " + grabAll[ prop ] + ";\n";
			}
		}
		
		// Make sure that deleted variables go away
		for ( var prop in CanvasOutput.lastGrab ) {
			if ( !(prop in grabAll) && (CanvasOutput.props[ prop ] || !(prop in CanvasOutput.props)) ) {
				inject += "delete Output.context." + prop + ";\n";
			}
		}

		if ( !CanvasOutput.lastGrab ) {
			Output.exec( userCode, Output.context );
			
		} else if ( inject ) {
			Output.exec( inject, Output.context );
		}
		
		// Need to make sure that the draw function is never deleted
		// (Otherwise Processing.js starts to freak out)
		if ( !Output.context.draw ) {
			Output.context.draw = function(){};
		}

		CanvasOutput.lastGrab = grabAll;
	},
	
	reset: function() {
		
	},
	
	testContext: {
		testCanvas: function( name, fn ) {
			Output.testContext.test( name, fn, CanvasOutput );
		}
	},
	
	toggle: function( doToggle ) {
		if ( doToggle ) {
			CanvasOutput.start();
			
		} else {
			CanvasOutput.stop();
		}
	},
	
	stop: function() {
		CanvasOutput.canvas.noLoop();
	},
	
	start: function() {
		CanvasOutput.canvas.loop();
	},
	
	clear: function() {
		// TODO: Remove when testing is implemented
		if ( !Output.testing ) {
			CanvasOutput.canvas.background( 255 );
		}
	},
	
	kill: function() {
		CanvasOutput.canvas.exit();
		CanvasOutput.$elem.hide();
	}
};

Output.registerOutput( CanvasOutput );

var clean = function( str ) {
	return String( str ).replace( /</g, "&lt;" );
};