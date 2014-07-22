
// MemberExpression

  // ===
  // = Block Definition
  // ===

  // We're using the built-in 'logic_negate' block

  Blockly.core.Language.jslang_unary_generic = {
    helpUrl: '',
    init: function() {
      this.setColour(20);
      this.appendValueInput("CHAIN")
          .appendTitle(new Blockly.core.FieldDropdown([["-", "MINUS"], ["+", "PLUS"], ["~", "TILDE"]]), "OPERATOR");
      this.setInputsInline(true);
      this.setOutput(true);
      this.setTooltip('');
    }
  };

  // ===
  // = JS -> Blocks
  // ===

  // _tree("!a")
  // ├─ type: Program
  // └─ body
  //    └─ 0
  //       ├─ type: ExpressionStatement
  //       └─ expression
  //          ├─ type: UnaryExpression
  //          ├─ operator: !
  //          ├─ argument
  //          │  ├─ type: Identifier
  //          │  └─ name: a
  //          └─ prefix: true

// <xml>
//   <block type="logic_negate" inline="false" x="97" y="29">
//     <value name="BOOL">
//       <block type="logic_boolean">
//         <title name="BOOL">TRUE</title>
//       </block>
//     </value>
//   </block>
// </xml> 

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'UnaryExpression',
      operator: '!',
      argument: patternMatch.var('argument'),
    },
    // XML generator
    function(node,matchedProps) {
      var argument = Blockly.util.convertAstNodeToBlocks(matchedProps.argument)
      var block = '<block type="logic_negate"></block>'
      var output = Blockly.util.appendTagDeep(block, argument, 'value', 'BOOL')
      return output
    }
  )

// <xml>
//   <block type="jslang_statement_nub" inline="false" x="0" y="0">
//     <value name="CHAIN">
//       <block type="jslang_unary_generic" inline="true">
//         <title name="OPERATOR">MINUS</title>
//         <value name="CHAIN">
//           <block type="jslang_identifier" inline="false">
//             <title name="PROP">a</title>
//           </block>
//         </value>
//       </block>
//     </value>
//   </block>
// </xml> 

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'UnaryExpression',
      operator: patternMatch.var('operator'),
      argument: patternMatch.var('argument'),
    },
    // XML generator
    function(node,matchedProps) {
      var argument = Blockly.util.convertAstNodeToBlocks(matchedProps.argument)
      var block = '<block type="jslang_unary_generic"></block>'
      var op
      switch (this.getTitleValue('OPERATOR')) {
        case '-': op = 'MINUS'; break;
        case '+': op = 'PLUS'; break;
        case '~': op = 'TILDE'; break;
      }
      var output = Blockly.util.appendTagDeep(block, op, 'title', 'OPERATOR')
      output = Blockly.util.appendTagDeep(output, argument, 'value', 'CHAIN')
      return output
    }
  )

  // ===
  // = Blocks -> JS
  // ===

  // <OPERATOR> <ARGUMENT>
  //
  // eg: 'world.hello()'

  // Blockly.core.JavaScript.jslang_unary_negative = function() {
  //   var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
  //   var text_prop = this.getTitleValue('PROP');
  //   // Assemble JavaScript into code variable.
  //   var code = '.'+text_prop+value_chain
  //   return [code, Blockly.core.JavaScript.ORDER_NONE];
  // };

  Blockly.core.JavaScript.jslang_unary_generic = function() {
    var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
    var op
    switch (this.getTitleValue('OPERATOR')) {
      case 'MINUS': op = '-'; break;
      case 'PLUS': op = '+'; break;
      case 'TILDE': op = '~'; break;
    }
    // Assemble JavaScript into code variable.
    var code = op + value_chain
    return [code, Blockly.core.JavaScript.ORDER_NONE];
  };
