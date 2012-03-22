TextOutput.context.input = function( msg ) {
	TextOutput.resumeTest();
	
	if ( !Output.testing ) {
		TextOutput.toInput = curProblem.inputs[ TextOutput.inputNum++ ];
	}
	
	if ( TextOutput.waitTestInput || TextOutput.toInput != null ) {
		if ( TextOutput.waitTestInput ) {
			var doResume = TextOutput.waitTestInput;
			delete TextOutput.waitTestInput;
			doResume( msg );
		}
		
		TextOutput.showInput( msg );
		
		var val = TextOutput.toInput;
		delete TextOutput.toInput;
		
	} else {
		TextOutput.showInput( msg );
		
		waitfor( var val ) {
			TextOutput.waitInput = resume;
		}
	}
	
	return val;
};

TextOutput.context.inputNumber = function( msg ) {
	return parseFloat( TextOutput.context.input( msg ) );
};

Output.testContext.testPrint = TextOutput.testContext.testPrint = function( test ) {
	waitfor( var msg ) {
		TextOutput.waitTestPrint = resume;
	}

	var pass = false,
		type = typeof test,
		tip = "";
	
	if ( test === true ) {
		pass = true;
		tip = "Any print statement was expected.";
	
	} else if ( typeof test === "function" ) {
		pass = !!test( msg );
		tip = "A number of checks determined that this print statement was " + (pass ? "correct." : "incorrect.");
		
	} else if ( typeof test === "object" ) {
		pass = test.test( msg );
		
		var str = test.source.replace( /^\^|\$$/g, "" ).replace( /(?:[^\\])\?/g, "" );
		tip = pass ?
			"Your output matched \"" + str + "\"." :
			"The test was expecting your output to match \"" + str + "\".";
		
	} else {
		pass = msg === String( test );
		tip = pass ?
			"Your output matched \"" + test + "\"." :
			"The test was expecting your output to match \"" + test + "\".";
	}
	
	// testOutput.push( msg );
	
	Output.testContext.assert( pass, pass ?
		"'" + msg + "' was printed out correctly." :
		"'" + msg + "' does not match the expected statement.", tip );
	
	return pass;
};

Output.testContext.testInput = TextOutput.testContext.testInput = function( testCase ) {
	waitfor( var msg ) {
		TextOutput.waitTestInput = resume;
	}
	
	TextOutput.toInput = String( typeof testCase === "function" ?
		testCase( msg ) : testCase );
	
	// testOutput.push( msg + " " + TextOutput.toInput );

	Output.testContext.assert( true, "'" + TextOutput.toInput + "' was put in an input.",
	 	"The test put this text into your input and it was successful." );

	return true;
};