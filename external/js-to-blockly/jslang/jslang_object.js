
// ObjectExpression

  // ===
  // = Block Definition
  // ===

  Blockly.core.Language.jslang_object = {
    helpUrl: '',
    init: function () {
        this.setColour(0);
        this.appendValueInput('CHAIN').appendTitle('new object');
        this.appendValueInput('VAL0').appendTitle(new Blockly.core.FieldTextInput('key0'), 'KEY0');
        this.appendValueInput('VAL1').appendTitle(new Blockly.core.FieldTextInput('key1'), 'KEY1');
        this.appendValueInput('VAL2').appendTitle(new Blockly.core.FieldTextInput('key2'), 'KEY2');
        this.setOutput(true, 'null');
        this.setMutator(new Blockly.core.Mutator(['jslang_object_entry']));
        this.setTooltip('');
        this.itemCount_ = 3
    },
    mutationToDom: function (workspace) {
      var container = document.createElement('mutation');
      container.setAttribute('items', this.itemCount_);
      return container
    },
    domToMutation: function(container) {
      for (var x = 0; x < this.itemCount_; x++) {
        this.removeInput('VAL' + x);
      }
      this.itemCount_ = window.parseInt(container.getAttribute('items'), 10);
      for (var x = 0; x < this.itemCount_; x++) {
        var input = this.appendValueInput('VAL' + x).appendTitle(new Blockly.core.FieldTextInput('key'+x), 'KEY' + x);
      }
    },
    decompose: function(workspace) {
      var containerBlock = new Blockly.core.Block(workspace,'jslang_object_container');
      containerBlock.initSvg();
      var connection = containerBlock.getInput('STACK').connection;
      for (var x = 0; x < this.itemCount_; x++) {
        var itemBlock = new Blockly.core.Block(workspace, 'jslang_object_entry');
        itemBlock.initSvg();
        connection.connect(itemBlock.previousConnection);
        connection = itemBlock.nextConnection;
      }
      return containerBlock;
    },
    compose: function(containerBlock) {
      // Disconnect all input blocks and remove all inputs.
      for (var x = this.itemCount_ - 1; x >= 0; x--) {
        this.removeInput('VAL' + x);
      }
      this.itemCount_ = 0;
      // Rebuild the block's inputs.
      var itemBlock = containerBlock.getInputTargetBlock('STACK');
      while (itemBlock) {
        var input = this.appendValueInput('VAL' + this.itemCount_).appendTitle(new Blockly.core.FieldTextInput(itemBlock.keyName_ || 'key'+this.itemCount_), 'KEY' + this.itemCount_);
        // Reconnect any child blocks.
        if (itemBlock.valueConnection_) {
          input.connection.connect(itemBlock.valueConnection_);
        }
        this.itemCount_++;
        itemBlock = itemBlock.nextConnection &&
            itemBlock.nextConnection.targetBlock();
      }
    },
    saveConnections: function(containerBlock) {
      // Store a pointer to any connected child blocks.
      var itemBlock = containerBlock.getInputTargetBlock('STACK');
      var x = 0;
      while (itemBlock) {
        var input = this.getInput('VAL' + x);
        itemBlock.keyName_ = this.getTitleValue('KEY' + x);
        itemBlock.valueConnection_ = input && input.connection.targetConnection;
        x++;
        itemBlock = itemBlock.nextConnection &&
            itemBlock.nextConnection.targetBlock();
      }
    }
  };

  Blockly.core.Language.jslang_object_container = {
    // Container.
    init: function() {
      this.setColour(210);
      this.appendDummyInput()
          .appendTitle('new object');
      this.appendStatementInput('STACK');
      this.setTooltip('');
      this.contextMenu = false;
    }
  };

  Blockly.core.Language.jslang_object_entry = {
    // Add items.
    init: function() {
      this.setColour(210);
      this.appendDummyInput()
          .appendTitle('key-value pair');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
      this.contextMenu = false;
    }
  };

  // Blockly.core.Language.jslang_object_empty = {
  //   // Create an empty list.
  //   helpUrl: '',
  //   init: function() {
  //     this.setColour(210);
  //     this.setOutput(true, 'null');
  //     this.appendDummyInput()
  //         .appendTitle(Blockly.core.LANG_LISTS_CREATE_EMPTY_TITLE);
  //     this.setTooltip('');
  //   }
  // };

  // ===
  // = JS -> Blocks
  // ===

// {a: null, b: null, c: null}
// ├─ type: Program
// └─ body
//    └─ 0
//       ├─ type: VariableDeclaration
//       ├─ declarations
//       │  └─ 0
//       │     ├─ type: VariableDeclarator
//       │     ├─ id
//       │     │  ├─ type: Identifier
//       │     │  └─ name: a
//       │     └─ init
//       │        ├─ type: ObjectExpression
//       │        └─ properties
//       │           ├─ 0
//       │           │  ├─ type: Property
//       │           │  ├─ key
//       │           │  │  ├─ type: Literal
//       │           │  │  └─ value: a
//       │           │  ├─ value
//       │           │  │  ├─ type: Literal
//       │           │  │  └─ value
//       │           │  └─ kind: init
//       │           ├─ 1
//       │           │  ├─ type: Property
//       │           │  ├─ key
//       │           │  │  ├─ type: Literal
//       │           │  │  └─ value: b
//       │           │  ├─ value
//       │           │  │  ├─ type: Literal
//       │           │  │  └─ value
//       │           │  └─ kind: init
//       │           └─ 2
//       │              ├─ type: Property
//       │              ├─ key
//       │              │  ├─ type: Literal
//       │              │  └─ value: c
//       │              ├─ value
//       │              │  ├─ type: Literal
//       │              │  └─ value
//       │              └─ kind: init
//       └─ kind: var
// 
// <xml>
//   <block type="jslang_object" inline="false" x="-6" y="111">
//     <mutation items="3"></mutation>
//     <title name="KEY0">key0</title>
//     <title name="KEY1">key1</title>
//     <title name="KEY2">key2</title>
//     <value name="VAL0">
//       <block type="text">
//         <title name="TEXT">DINGUS</title>
//       </block>
//     </value>
//     <value name="VAL1">
//       <block type="text">
//         <title name="TEXT">DINGUS</title>
//       </block>
//     </value>
//     <value name="VAL2">
//       <block type="text">
//         <title name="TEXT">DINGUS</title>
//       </block>
//     </value>
//   </block>
// </xml> 

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'ObjectExpression',
      properties: patternMatch.var('properties'),
    },
    // XML generator
    function(node,matchedProps) {
      var output = ''
      output += '<block type="jslang_object">'
      output += '<mutation items="'
      output += matchedProps.properties.length
      output += '"></mutation>'
      // Make an array block for properties
      matchedProps.properties.forEach(function(prop,index) {
        output += '<title name="KEY'+index+'">'+(prop.key.name || prop.key.value)+'</title>'
        output += '<value name="VAL'+index+'">'+Blockly.util.convertAstNodeToBlocks(prop.value)+'</value>'
      })
      output += '</block>'
      return output
    }
  )


  // ===
  // = Blocks -> JS
  // ===

  Blockly.core.JavaScript.jslang_object = function() {
    var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
    // Create a list with any number of elements of any type.
    var code = ""
    for (var n = 0; n < this.itemCount_; n++) {
      var key = this.getTitleValue('KEY'+n);
      code += '"'+key+'": '+(Blockly.core.JavaScript.valueToCode(this, 'VAL' + n, Blockly.core.JavaScript.ORDER_COMMA) || 'null')+',\n';
    }
    code = '{\n' + code + '}';
    return [code, Blockly.core.JavaScript.ORDER_ATOMIC];
  };
