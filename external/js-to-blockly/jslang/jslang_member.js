
// MemberExpression

  // ===
  // = Block Definition
  // ===

  // For getting a property of an object
  Blockly.core.Language.jslang_member_chain = {
    helpUrl: '',
    init: function() {
      this.setColour(290);
      this.appendValueInput('CHAIN')
          .setCheck('null')
          .appendTitle('attr')
          .appendTitle(new Blockly.core.FieldTextInput('prop'), 'PROP');
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
      type: 'MemberExpression',
      object: patternMatch.var('object'),
      property: patternMatch.var('property'),
    },
    // XML generator
    function(node,matchedProps) {
      var object = Blockly.util.convertAstNodeToBlocks(matchedProps.object)
      var property = '<block type="jslang_member_chain"><title name="PROP">'+matchedProps.property.name+'</title></block>'
      var output = Blockly.util.appendTagDeep(object, property, 'value', 'CHAIN')
      return output
    }
  )

  // ===
  // = Blocks -> JS
  // ===

  // <CALLEE>.<FUNC>()
  //
  // eg: 'world.hello()'

  Blockly.core.JavaScript.jslang_member_chain = function() {
    var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
    var text_prop = this.getTitleValue('PROP');
    // Assemble JavaScript into code variable.
    var code = '.'+text_prop+value_chain
    return [code, Blockly.core.JavaScript.ORDER_NONE];
  };
