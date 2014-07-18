
// Other/etc.

  // ===
  // = Block Definition
  // ===

  // for using an Expression as a Statement
  // TODO: this is a horrible thing to expect from your users
  Blockly.core.Language.jslang_statement_nub = {
    helpUrl: '',
    init: function() {
      this.setColour(290);
      this.appendValueInput("CHAIN")
          .setCheck("null");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  // For getting a property of an object
  Blockly.core.Language.jslang_identifier = {
    helpUrl: '',
    init: function() {
      this.setColour(240);
      this.appendValueInput("CHAIN")
          .setCheck("null")
          .appendTitle("get var")
          .appendTitle(new Blockly.core.FieldTextInput("prop"), "PROP");
      this.setOutput(true, "null");
      this.setTooltip('');
    }
  };

  // ===
  // = JS -> Blocks
  // ===

  // Program
  // 
  // <xml>{body[0]}</xml>

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'Program',
      body: patternMatch.var('body'),
    },
    // XML generator
    function(node,matchedProps) {
      var body, output = '<xml>'
      // Build body from the inside out, appending each node to the one before it's `next` tag
      // elem0
      // └─next:elem1
      //        └─next:elem2
      matchedProps.body.reverse().forEach(function(node,index) {
        var nodeXml = Blockly.util.convertAstNodeToBlocks(node)
        // Append current body inside this node, and set that as the new body
        body = body ? Blockly.util.appendInNewTag(nodeXml,body,'next') : nodeXml
      })
      output += body
      output += '</xml>'
      return output
    }
  )

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'BlockStatement',
      body: patternMatch.var('body'),
    },
    // XML generator
    function(node,matchedProps) {
      var body, output = ''
      // Build body from the inside out, appending each node to the one before it's `next` tag
      // elem0
      // └─next:elem1
      //        └─next:elem2
      matchedProps.body.reverse().forEach(function(node,index) {
        var nodeXml = Blockly.util.convertAstNodeToBlocks(node)
        // Append current body inside this node, and set that as the new body
        body = body ? Blockly.util.appendInNewTag(nodeXml,body,'next') : nodeXml
      })
      output += body
      return output
    }
  )

  // ExpressionStatement wraps the expression in a nub
  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'ExpressionStatement',
      expression: patternMatch.var('expression'),
    },
    // XML generator
    function(node,matchedProps) {
      var output = ''
      //output += '<block type="jslang_statement_nub"><value name="CHAIN">'
      output += Blockly.util.convertAstNodeToBlocks(matchedProps.expression)
      //output += '</value></block>'
      return output
    }
  )

// <xml>
//   <block type="lists_create_with" inline="false" x="335" y="113">
//     <mutation items="3"></mutation>
//     <value name="ADD0">
//       <block type="text">
//         <title name="TEXT">hello!</title>
//       </block>
//     </value>
//     <value name="ADD1">
//       <block type="text">
//         <title name="TEXT">bai</title>
//       </block>
//     </value>
//     <value name="ADD2">
//       <block type="text">
//         <title name="TEXT">jake</title>
//       </block>
//     </value>
//   </block>
// </xml>

  // ExpressionStatement wraps the expression in a nub
  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'ArrayExpression',
      elements: patternMatch.var('elements'),
    },
    // XML generator
    function(node,matchedProps) {
      var output = ''
      output += '<block type="lists_create_with">' //<value name="CHAIN">'
      output += '<mutation items="'+matchedProps.elements.length+'"></mutation>'
      matchedProps.elements.forEach(function(elem,index){
        output += '<value name="ADD'+index+'">'
        output += Blockly.util.convertAstNodeToBlocks(elem)
        output += '</value>'
      })
      output += '</block>'
      return output
    }
  )

  // Literal
  //
  // <block type="text">
  //   <title name="TEXT">hey</title>
  // </block>
  //
  //        - or -
  //
  // <block type="math_number">
  //   <title name="NUM">0</title>
  // </block>

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'Literal',
      value: patternMatch.var('value'),
    },
    // XML generator
    function(node,matchedProps) {
      var output = ''
      var type = typeof matchedProps.value
      if (type === 'string') {
        output += '<block type="text">\n'
        output += '<title name="TEXT">'+matchedProps.value+'</title>'
        output += '</block>'  
      } else if (type === 'number') {
        output += '<block type="math_number">\n'
        output += '<title name="NUM">'+matchedProps.value+'</title>'
        output += '</block>'
      } else if (type === 'boolean') {
        output += '<block type="logic_boolean">\n'
        output += '<title name="BOOL">'+(matchedProps.value ? 'TRUE' : 'FALSE')+'</title>'
        output += '</block>'
      } else {
        // No Match
        return false
      }
      return output
    }
  )

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'Identifier',
      name: patternMatch.var('name'),
    },
    // XML generator
    function(node,matchedProps) {
      var output = '<block type="jslang_identifier"><title name="PROP">'+matchedProps.name+'</title></block>'
      return output
    }
  )

  // ===
  // = Blocks -> JS
  // ===

  Blockly.core.JavaScript.jslang_statement_nub = function() {
    var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
    // Return chain
    return value_chain+"\n";
  };

  Blockly.core.JavaScript.jslang_identifier = function() {
    var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
    var text_prop = this.getTitleValue('PROP');
    // Assemble JavaScript into code variable.
    var code = text_prop+value_chain
    return [code, Blockly.core.JavaScript.ORDER_NONE];
  };
