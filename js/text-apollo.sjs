TextOutput.context.input = function( msg ) {
	TextOutput.resumeTest();
	
	if ( !Output.testing ) {
		TextOutput.toInput = curProblem.inputs[ TextOutput.inputNum++ ];
	}
	
	if ( TextOutput.waitTestInput || TextOutput.toInput != null ) {
		TextOutput.resumeTest( "waitTestInput", msg );
		
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
		pass = msg !== false;
		tip = "Any print statement was expected.";
	
	} else if ( typeof test === "function" ) {
		pass = msg === false ? false : !!test( msg );
		tip = "A number of checks determined that this print statement was " + (pass ? "correct." : "incorrect.");
		
	} else if ( typeof test === "object" ) {
		pass = msg === false ? false : test.test( msg );
		
		var str = test.source.replace( /^\^|\$$/g, "" ).replace( /(?:[^\\])\?/g, "" );
		tip = pass ?
			"Your output matched \"" + str + "\"." :
			"The test was expecting your output to match \"" + str + "\".";
		
	} else {
		pass = msg === false ? false : msg === String( test );
		tip = pass ?
			"Your output matched \"" + test + "\"." :
			"The test was expecting your output to match \"" + test + "\".";
	}
	
	Output.testContext.assert( pass, pass ?
		"'" + msg + "' was printed out correctly." :
		msg === false ?
			"A print statement was expected here, but none was found." :
			"'" + msg + "' does not match the expected statement.", tip );
	
	return pass;
};

Output.testContext.testInput = TextOutput.testContext.testInput = function( testCase ) {
	waitfor( var msg ) {
		TextOutput.waitTestInput = resume;
	}
	
	TextOutput.toInput = String( typeof testCase === "function" ?
		testCase( msg ) : testCase );

	Output.testContext.assert( msg !== false,
		"'" + TextOutput.toInput + "' was put in an input.",
	 	"The test put this text into your input and it was successful." );

	return true;
};