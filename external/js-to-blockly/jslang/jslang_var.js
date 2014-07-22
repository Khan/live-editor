
// VariableDeclaration

  // ===
  // = Block Definition
  // ===

  // For declaring a variable
  Blockly.core.Language.jslang_var = {
    helpUrl: 'http://www.example.com/',
    init: function() {
      this.appendValueInput("CHAIN")
          .appendTitle("new var")
          .appendTitle(new Blockly.core.FieldTextInput("x"), "VAR");
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
    }
  };

  // ===
  // = JS -> Blocks
  // ===

// _tree("var x = 0")
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
//       │        ├─ type: Literal
//       │        └─ value: 0
//       └─ kind: var

// <xml>
//   <block type="jslang_var" inline="false" x="20" y="21">
//     <title name="VAR">x</title>
//   </block>
// </xml> 

  Blockly.util.registerBlockSignature({
    // Pattern
      type: 'VariableDeclaration',
      declarations: patternMatch.var('declarations'),
    },
    // XML generator
    function(node,matchedProps) {
      var output
      // Build declarations from the inside out, appending each node to the one before it's `next` tag
      // elem0
      // └─next:elem1
      //        └─next:elem2
      matchedProps.declarations.reverse().forEach(function(dec){
        var decBlock = '<block type="jslang_var">'
        decBlock += '<title name="VAR">'+dec.id.name+'</title>'
        decBlock += '</block>'
        // Append initialization to CHAIN if present
        if (dec.init) {
          var decInit = Blockly.util.convertAstNodeToBlocks(dec.init)
          decBlock = Blockly.util.appendTagDeep(decBlock, decInit, 'value', 'CHAIN')
        }
        // Append current body inside this node, and set that as the new body
        output = output ? Blockly.util.appendInNewTag(decBlock,output,'next') : decBlock
      })
      return output
    }
  )

  // ===
  // = Blocks -> JS
  // ===

  // var <VariableDeclarator.id> = <VariableDeclarator.init>
  //
  // eg: "var world = hello()"

  Blockly.core.JavaScript.jslang_var = function() {
    var value_chain = Blockly.core.JavaScript.valueToCode(this, 'CHAIN', Blockly.core.JavaScript.ORDER_ATOMIC);
    var text_var = this.getTitleValue('VAR');
    // Assemble JavaScript into code variable.
    var code = "var "+text_var
    if (value_chain) code += " = "+value_chain
    code += "\n"
    return code
  };
