
// ReturnStatement

  // ===
  // = Block Definition
  // ===

  Blockly.core.Language.jslang_return = {
    helpUrl: '',
    init: function() {
      this.setColour(20);
      this.appendValueInput("CHAIN")
          .appendTitle("return");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };
  

  // ===
  // = JS -> Blocks
  // ===

// _tree("(function(){return 8})()")
// ├─ type: Program
// └─ body
//    └─ 0
//       ├─ type: ExpressionStatement
//       └─ expression
//          ├─ type: CallExpression
//          ├─ callee
//          │  ├─ type: FunctionExpression
//          │  ├─ id
//          │  ├─ params
//          │  ├─ defaults
//          │  ├─ body
//          │  │  ├─ type: BlockStatement
//          │  │  └─ body
//          │  │     └─ 0
//          │  │        ├─ type: ReturnStatement
//          │  │        └─ argument
//          │  │           ├─ type: Literal
//          │  │           └─ value: 8
//          │  ├─ rest
//          │  ├─ generator: false
//          │  └─ expression: false
//          └─ arguments

// <xml>
//   <block type="jslang_statement_nub" inline="false" x="0" y="0">
//     <value name="CHAIN">
//       <block type="jslang_function_anon" inline="false">
//         <mutation></mutation>
//         <value name="CHAIN">
//           <block type="jslang_call" inline="false">
//             <mutation items="0"></mutation>
//           </block>
//         </value>
//         <statement name="STACK">
//           <block type="jslang_return" inline="false">
//             <value name="CHAIN">
//               <block type="variables_get">
//                 <title name="VAR">result</title>
//               </block>
//             </value>
//           </block>
//         </statement>
//       </block>
//     </value>
//   </block>
// </xml> 

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'ReturnStatement',
      argument: patternMatch.var('argument'),
    },
    // XML generator
    function(node,matchedProps) {
      var output = '<block type="jslang_return"></block>'
      var argument = Blockly.util.convertAstNodeToBlocks(matchedProps.argument)
      output = Blockly.util.appendInNewTag(output, argument, 'value', 'name="CHAIN"')
      return output
    }
  )

  // ===
  // = Blocks -> JS
  // ===

  // return <ARGUMENT>
  //
  // eg: 'return eggs'

  Blockly.core.JavaScript.jslang_return = function() {
    var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
    // Assemble JavaScript into code variable.
    var code = 'return '+value_chain
    return code;
  };
