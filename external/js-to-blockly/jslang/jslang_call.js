
// CallExpression

  // ===
  // = Block Definition
  // ===

  // ()
  Blockly.core.Language.jslang_call = {
    // Create a list with any number of elements of any type.
    helpUrl: '',
    init: function() {
      this.setColour(60);
      this.appendValueInput('CHAIN').appendTitle('call');
      this.appendValueInput('ARG0');
      this.appendValueInput('ARG1');
      this.appendValueInput('ARG2');
      this.setOutput(true, 'Array');
      this.setMutator(new Blockly.core.Mutator(['jslang_call_arg']));
      this.setTooltip(Blockly.core.LANG_LISTS_CREATE_WITH_TOOLTIP);
      this.itemCount_ = 3;
    },
    mutationToDom: function(workspace) {
      var container = document.createElement('mutation');
      container.setAttribute('items', this.itemCount_);
      return container;
    },
    domToMutation: function(container) {
      for (var x = 0; x < this.itemCount_; x++) {
        this.removeInput('ARG' + x);
      }
      this.itemCount_ = window.parseInt(container.getAttribute('items'), 10);
      for (var x = 0; x < this.itemCount_; x++) {
        var input = this.appendValueInput('ARG' + x);
        // if (x == 0) {
        //   input.appendTitle(Blockly.core.LANG_LISTS_CREATE_WITH_INPUT_WITH);
        // }
      }
      // if (this.itemCount_ == 0) {
      //   this.appendDummyInput('EMPTY')
      //       .appendTitle(Blockly.core.LANG_LISTS_CREATE_EMPTY_TITLE);
      // }
    },
    decompose: function(workspace) {
      var containerBlock = new Blockly.core.Block(workspace,'jslang_call_container');
      containerBlock.initSvg();
      var connection = containerBlock.getInput('STACK').connection;
      for (var x = 0; x < this.itemCount_; x++) {
        var itemBlock = new Blockly.core.Block(workspace,'jslang_call_arg');
        itemBlock.initSvg();
        connection.connect(itemBlock.previousConnection);
        connection = itemBlock.nextConnection;
      }
      return containerBlock;
    },
    compose: function(containerBlock) {
      // Disconnect all input blocks and remove all inputs.
      if (this.itemCount_ == 0) {
        // this.removeInput('EMPTY');
      } else {
        for (var x = this.itemCount_ - 1; x >= 0; x--) {
          this.removeInput('ARG' + x);
        }
      }
      this.itemCount_ = 0;
      // Rebuild the block's inputs.
      var itemBlock = containerBlock.getInputTargetBlock('STACK');
      while (itemBlock) {
        var input = this.appendValueInput('ARG' + this.itemCount_);
        // if (this.itemCount_ == 0) {
        //   input.appendTitle(Blockly.core.LANG_LISTS_CREATE_WITH_INPUT_WITH);
        // }
        // Reconnect any child blocks.
        if (itemBlock.valueConnection_) {
          input.connection.connect(itemBlock.valueConnection_);
        }
        this.itemCount_++;
        itemBlock = itemBlock.nextConnection &&
            itemBlock.nextConnection.targetBlock();
      }
      // if (this.itemCount_ == 0) {
      //   this.appendDummyInput('EMPTY')
      //       .appendTitle(Blockly.core.LANG_LISTS_CREATE_EMPTY_TITLE);
      // }
    },
    saveConnections: function(containerBlock) {
      // Store a pointer to any connected child blocks.
      var itemBlock = containerBlock.getInputTargetBlock('STACK');
      var x = 0;
      while (itemBlock) {
        var input = this.getInput('ARG' + x);
        itemBlock.valueConnection_ = input && input.connection.targetConnection;
        x++;
        itemBlock = itemBlock.nextConnection &&
            itemBlock.nextConnection.targetBlock();
      }
    }
  };

   Blockly.core.Language.jslang_call_container = {
    // Container.
    init: function() {
      this.setColour(210);
      this.appendDummyInput()
          .appendTitle('function call');
      this.appendStatementInput('STACK');
      this.setTooltip('');
      this.contextMenu = false;
    }
  };

  Blockly.core.Language.jslang_call_arg = {
    // Add items.
    init: function() {
      this.setColour(210);
      this.appendDummyInput()
          .appendTitle('argument');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
      this.contextMenu = false;
    }
  };
  // ===
  // = JS -> Blocks
  // ===

//   ├─ type: Program
// └─ body
//    └─ 0
//       ├─ type: ExpressionStatement
//       └─ expression
//          ├─ type: CallExpression
//          ├─ callee
//          │  ├─ type: MemberExpression
//          │  ├─ computed: false
//          │  ├─ object
//          │  │  ├─ type: MemberExpression
//          │  │  ├─ computed: false
//          │  │  ├─ object
//          │  │  │  ├─ type: Identifier
//          │  │  │  └─ name: a
//          │  │  └─ property
//          │  │     ├─ type: Identifier
//          │  │     └─ name: b
//          │  └─ property
//          │     ├─ type: Identifier
//          │     └─ name: c
//          └─ arguments

// <xml>
//   <block type="jslang_call" inline="false" x="24" y="50">
//     <mutation items="3"></mutation>
//     <value name="CHAIN">
//       <block type="text_changeCase" inline="false">
//         <title name="CASE">UPPERCASE</title>
//       </block>
//     </value>
//     <value name="ARG0">
//       <block type="math_number">
//         <title name="NUM">0</title>
//       </block>
//     </value>
//     <value name="ARG1">
//       <block type="logic_null"></block>
//     </value>
//     <value name="ARG2">
//       <block type="text">
//         <title name="TEXT">yoho</title>
//       </block>
//     </value>
//   </block>
// </xml>
 
 // ()
 Blockly.util.registerBlockSignature({
    // Pattern
      type: 'CallExpression',
      arguments: patternMatch.var('arguments'),
      callee: patternMatch.var('callee'),
    },
    // XML generator
    function(node,matchedProps) {
      var callee = Blockly.util.convertAstNodeToBlocks(matchedProps.callee)
      var callBlock = ''
      callBlock += '<block type="jslang_call">'
      // Make an array block for args
      callBlock += '<mutation items="'+matchedProps.arguments.length+'"/>'
      matchedProps.arguments.forEach(function(arg,index) {
        callBlock += '<value name="ARG'+index+'">'+Blockly.util.convertAstNodeToBlocks(arg)+'</value>'
      })
      callBlock += '</block>'
      var output = Blockly.util.appendTagDeep(callee, callBlock, 'value', 'CHAIN')
      return output
    }
  )

  // // a()
  // Blockly.util.registerBlockSignature({
  //   // Pattern
  //     type: 'CallExpression',
  //     arguments: patternMatch.var('arguments'),
  //     callee: {
  //       type: 'Identifier',
  //       name: patternMatch.var('callee_name'),
  //     },
  //   },
  //   // XML generator
  //   function(node,matchedProps) {
  //     var callBlock = ''
  //     callBlock += '<block type="jslang_call_identifier">'
  //     callBlock += '<title name="FUNC">'
  //     callBlock += matchedProps.callee_name
  //     callBlock += '</title>'
  //     // Make an array block for args
  //     callBlock += '<value name="ARGS"><block type="lists_create_with" inline="true">'
  //     callBlock += '<mutation items="'+matchedProps.arguments.length+'"/>'
  //     matchedProps.arguments.forEach(function(arg,index) {
  //       callBlock += '<value name="ADD'+index+'">'+Blockly.util.convertAstNodeToBlocks(arg)+'</value>'
  //     })
  //     callBlock += '</block></value>'
  //     callBlock += '</block>'
  //     return callBlock
  //   }
  // )

  // // a.b()
  // Blockly.util.registerBlockSignature({
  //   // Pattern
  //     type: 'CallExpression',
  //     arguments: patternMatch.var('arguments'),
  //     callee: {
  //       object: patternMatch.var('callee_obj'),
  //       property: patternMatch.var('callee_prop'),
  //     },
  //   },
  //   // XML generator
  //   function(node,matchedProps) {
  //     var callee = Blockly.util.convertAstNodeToBlocks(matchedProps.callee_obj)
  //     var callBlock = ''
  //     callBlock += '<block type="jslang_call_member">'
  //     callBlock += '<title name="FUNC">'
  //     callBlock += matchedProps.callee_prop.name || matchedProps.callee_prop.value
  //     callBlock += '</title>'
  //     // Make an array block for args
  //     callBlock += '<value name="ARGS"><block type="lists_create_with" inline="true">'
  //     callBlock += '<mutation items="'+matchedProps.arguments.length+'"/>'
  //     matchedProps.arguments.forEach(function(arg,index) {
  //       callBlock += '<value name="ADD'+index+'">'+Blockly.util.convertAstNodeToBlocks(arg)+'</value>'
  //     })
  //     callBlock += '</block></value>'
  //     callBlock += '</block>'
  //     var output = Blockly.util.appendTagDeep(callee, callBlock, 'value', 'CHAIN')
  //     return output
  //   }
  // )

  // ===
  // = Blocks -> JS
  // ===

  // <CALLEE>.<FUNC>()
  //
  // eg: "world.hello()"

  Blockly.core.JavaScript.jslang_call = function() {
    var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
    var args = []
    for (var n = 0; n < this.itemCount_; n++) {
      args.push(Blockly.core.JavaScript.valueToCode(this, 'ARG' + n, Blockly.core.JavaScript.ORDER_COMMA) || 'null');
    }
    // Assemble JavaScript into code variable.
    var code = '('
    code += args.join(', ')
    code += ')'
    code += value_chain
    return [code, Blockly.core.JavaScript.ORDER_NONE];
  };

  // Blockly.core.JavaScript.jslang_call_member = function() {
  //   var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
  //   var text_func = this.getTitleValue('FUNC');
  //   var value_args = Blockly.core.JavaScript.valueToCode(this, 'ARGS', Blockly.core.JavaScript.ORDER_ATOMIC);
  //   // remove brackets
  //   if (value_args[0] == '[' && value_args[value_args.length-1] == ']') value_args = value_args.slice(1,-1)
  //   // Assemble JavaScript into code variable.
  //   var code = '.'+text_func+'('
  //   code += value_args
  //   code += ')'
  //   code += value_chain
  //   return [code, Blockly.core.JavaScript.ORDER_NONE];
  // };

  // Blockly.core.JavaScript.jslang_call_identifier = function() {
  //   var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
  //   var text_func = this.getTitleValue('FUNC');
  //   var value_args = Blockly.core.JavaScript.valueToCode(this, 'ARGS', Blockly.core.JavaScript.ORDER_ATOMIC);
  //   // remove brackets
  //   if (value_args[0] == '[' && value_args[value_args.length-1] == ']') value_args = value_args.slice(1,-1)
  //   // Assemble JavaScript into code variable.
  //   var code = text_func+'('
  //   code += value_args
  //   code += ')'
  //   code += value_chain
  //   return [code, Blockly.core.JavaScript.ORDER_NONE];
  // };
