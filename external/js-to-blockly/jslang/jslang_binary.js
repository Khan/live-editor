
// BinaryExpression

  // ===
  // = Block Definition
  // ===

  // we're using the built in math_arithmetic

  // ===
  // = JS -> Blocks
  // ===

// _tree("a+b")
// ├─ type: Program
// └─ body
//    └─ 0
//       ├─ type: ExpressionStatement
//       └─ expression
//          ├─ type: BinaryExpression
//          ├─ operator: +
//          ├─ left
//          │  ├─ type: Identifier
//          │  └─ name: a
//          └─ right
//             ├─ type: Identifier
//             └─ name: b

// <xml>
//   <block type="math_arithmetic" inline="true" x="-28" y="36">
//     <title name="OP">ADD</title>
//     <value name="A">
//       <block type="math_constant">
//         <title name="CONSTANT">PI</title>
//       </block>
//     </value>
//     <value name="B">
//       <block type="math_constant">
//         <title name="CONSTANT">PI</title>
//       </block>
//     </value>
//   </block>
// </xml>

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'BinaryExpression',
      operator: patternMatch.var('operator'),
      left: patternMatch.var('left'),
      right: patternMatch.var('right'),
    },
    // XML generator
    function(node,matchedProps) {
      var operator
      switch (matchedProps.operator) {
        case '+': operator = 'ADD'; break;
        case '-': operator = 'MINUS'; break;
        case '*': operator = 'MULTIPLY'; break;
        case '/': operator = 'DIVIDE'; break;
      }
      var output = '<block type="math_arithmetic"><title name="OP">'+operator+'</title></block>'
      var leftBlock = Blockly.util.convertAstNodeToBlocks(matchedProps.left)
      var rightBlock = Blockly.util.convertAstNodeToBlocks(matchedProps.right)
      output = Blockly.util.appendTagDeep(output, leftBlock, 'value', 'A')
      output = Blockly.util.appendTagDeep(output, rightBlock, 'value', 'B')
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
