
// TryStatement

  // ===
  // = Block Definition
  // ===

  Blockly.core.Language.jslang_try_catch = {
    helpUrl: 'http://www.example.com/',
    init: function() {
      this.setColour(0)
      this.appendStatementInput("TRY")
          .setCheck("null")
          .appendTitle("try")
      this.appendDummyInput()
          .appendTitle("catch (")
          .appendTitle(new Blockly.core.FieldTextInput("error"), "CATCH_VAR")
          .appendTitle(")")
      this.appendStatementInput("CATCH")
          .setCheck("null")
      this.appendStatementInput("FINALLY")
          .appendTitle("finally")
      this.setPreviousStatement(true, "null")
      this.setNextStatement(true, "null")
      this.setTooltip('')
    }
  }

  // ===
  // = JS -> Blocks
  // ===

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'TryStatement',
      handlers: patternMatch.var('handlers'),
      finalizer: patternMatch.var('finalizer')
    },
    // XML generator
    function(node,matchedProps) {
      var output = '<block type="jslang_try_catch">'
      if (matchedProps.handlers.length>0) output += '<title name="CATCH_VAR">'+matchedProps.handlers[0].param.name+'</title>'
      output += '</block>'
      return output
    }
  )

  // ===
  // = Blocks -> JS
  // ===

  Blockly.core.JavaScript.jslang_try_catch = function() {
    var statements_try = Blockly.core.JavaScript.statementToCode(this, 'TRY');
    var statements_catch = Blockly.core.JavaScript.statementToCode(this, 'CATCH');
    var statements_finally = Blockly.core.JavaScript.statementToCode(this, 'FINALLY');
    var text_catch_var = this.getTitleValue('CATCH_VAR');
    // Assemble JavaScript into code variable.
    var code = "try {\n"+statements_try+"\n"
              +"} catch ("+text_catch_var+") {\n"+statements_catch
              +"\n} finally {\n"+statements_finally+"\n}"
    return code;
  };
