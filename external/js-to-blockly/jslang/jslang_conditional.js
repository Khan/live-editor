

// // ConditionalExpression

//   // ===
//   // = Block Definition
//   // ===

//   // We're using the built-in definition `controls_if` for now
  

//   // ===
//   // = JS -> Blocks
//   // ===

// // tree('a ? b : c')
// // ├─ type: Program
// // └─ body
// //    └─ 0
// //       ├─ type: ExpressionStatement
// //       └─ expression
// //          ├─ type: ConditionalExpression
// //          ├─ test
// //          │  ├─ type: Identifier
// //          │  └─ name: a
// //          ├─ consequent
// //          │  ├─ type: Identifier
// //          │  └─ name: b
// //          └─ alternate
// //             ├─ type: Identifier
// //             └─ name: c
// //


//   Blockly.util.registerBlockSignature({
//     // Pattern
//       type: 'IfStatement',
//       test: patternMatch.var('test'),
//       consequent: patternMatch.var('consequent'),
//       alternate: patternMatch.var('alternate'),
//     },
//     // XML generator
//     function(node,matchedProps) {
//       var test = Blockly.util.convertAstNodeToBlocks(matchedProps.test)
//       var consequent = matchedProps.consequent ? Blockly.util.convertAstNodeToBlocks(matchedProps.consequent) : ""
//       // Recurse for `alternates` for else-if statements (if there is an alternate)
//       var elseIfs = []
//       var elseBlock
//       var target = matchedProps.alternate
//       var continueIteration = target ? true : false
//       while(continueIteration) {
//         // if alternate is an if, add as an else-if
//         //  and prepare to check next alternate
//         if (target.type === 'IfStatement') {
//           elseIfs.push(target)
//           // select nested alternate as next target,
//           //  if no alternate, stop iteration
//           target = target.alternate
//           if (!target) continueIteration = false
//         } else {
//           // if alternate is not an if, add as an else, and stop iteration
//           elseBlock = Blockly.util.convertAstNodeToBlocks(target)
//           continueIteration = false
//         }
//       }
//       // Build xml
//       var output = '<block type="controls_if"><mutation elseif="'+elseIfs.length+'" else="'+( elseBlock ? 1 : 0)+'"></mutation></block>'
//       output = Blockly.util.appendInNewTag(output, test, 'value', 'name="IF0"')
//       output = Blockly.util.appendInNewTag(output, consequent, 'statement', 'name="DO0"')
//       // append else-if blocks
//       elseIfs.forEach(function(elseIfBlock,index){
//         var test = Blockly.util.convertAstNodeToBlocks(elseIfBlock.test)
//         var consequent = Blockly.util.convertAstNodeToBlocks(elseIfBlock.consequent)
//         output = Blockly.util.appendInNewTag(output, test, 'value', 'name="IF'+(index+1)+'"')
//         output = Blockly.util.appendInNewTag(output, consequent, 'statement', 'name="DO'+(index+1)+'"')
//       })
//       if (elseBlock) output = Blockly.util.appendInNewTag(output, elseBlock, 'statement', 'name="ELSE"')
//       return output
//     }
//   )

//   // ===
//   // = Blocks -> JS
//   // ===

//   // <CALLEE>.<FUNC>()
//   //
//   // eg: 'world.hello()'

//   // Blockly.core.JavaScript.jslang_if = function() {
//   //   var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
//   //   var text_prop = this.getTitleValue('PROP');
//   //   // Assemble JavaScript into code variable.
//   //   var code = '.'+text_prop+value_chain
//   //   return [code, Blockly.core.JavaScript.ORDER_NONE];
//   // };
