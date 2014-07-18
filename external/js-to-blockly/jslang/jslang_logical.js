


// LogicalExpression

  // ===
  // = Block Definition
  // ===

  // We're using the built-in "logic_operation" for now

  // ===
  // = JS -> Blocks
  // ===

  // _tree('a || b')
  // ├─ type: LogicalExpression
  // ├─ operator: ||
  // ├─ left
  // │  ├─ type: Identifier
  // │  └─ name: a
  // └─ right
  //    ├─ type: Identifier
  //    └─ name: b

  // <block type="logic_operation" inline="true" x="-7" y="54">
  //   <title name="OP">AND</title>
  //   <value name="A">
  //     <block type="logic_boolean">
  //       <title name="BOOL">TRUE</title>
  //     </block>
  //   </value>
  //   <value name="B">
  //     <block type="logic_boolean">
  //       <title name="BOOL">FALSE</title>
  //     </block>
  //   </value>
  // </block>

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'LogicalExpression',
      operator: patternMatch.var('operator'),
      left: patternMatch.var('left'),
      right: patternMatch.var('right'),
    },
    // XML generator
    function(node,matchedProps) {
      // debugger
      var left = Blockly.util.convertAstNodeToBlocks(matchedProps.left)
      var right = Blockly.util.convertAstNodeToBlocks(matchedProps.right)
      var operator
      switch (matchedProps.operator) {
        case '||': operator = 'OR'; break;
        case '&&': operator = 'AND'; break;
      }
      var output = '<block type="logic_operation"><title name="OP">'+operator+'</title></block>'
      output = Blockly.util.appendInNewTag(output, left, 'value', 'name="A"')
      output = Blockly.util.appendInNewTag(output, right, 'value', 'name="B"')
      return output
    }
  )

  // ===
  // = Blocks -> JS
  // ===

