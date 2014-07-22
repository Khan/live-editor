
// ThisExpression

  // ===
  // = Block Definition
  // ===

  // For getting a property of an object
  Blockly.core.Language.jslang_this = {
    helpUrl: '',
    init: function() {
      this.setColour(70);
      this.appendValueInput('CHAIN')
          .setCheck('null')
          .appendTitle('this')
      this.setOutput(true, 'null');
      this.setTooltip('');
    }
  };

  // ===
  // = JS -> Blocks
  // ===

  // a.b
  // a.b.c.d
  // a.b().c

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'ThisExpression',
    },
    // XML generator
    function(node,matchedProps) {
      var output = '<block type="jslang_this"></block>'
      return output
    }
  )

  // ===
  // = Blocks -> JS
  // ===

  // <CALLEE>.<FUNC>()
  //
  // eg: 'world.hello()'

  Blockly.core.JavaScript.jslang_this = function() {
    var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
    // Assemble JavaScript into code variable.
    var code = 'this'+value_chain
    return [code, Blockly.core.JavaScript.ORDER_NONE];
  };
