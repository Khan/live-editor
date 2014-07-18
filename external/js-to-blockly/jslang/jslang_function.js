
// FunctionExpression

  // ===
  // = Block Definition
  // ===

  Blockly.core.Language.jslang_function_anon = {
    // Define a procedure with no return value.
    category: null,  // Procedures are handled specially.
    helpUrl: Blockly.core.LANG_PROCEDURES_DEFNORETURN_HELPURL,
    init: function() {
      this.setColour(290);
      var name = Blockly.core.Procedures.findLegalName(
          Blockly.core.LANG_PROCEDURES_DEFNORETURN_PROCEDURE, this);
      this.appendValueInput("CHAIN")
          .appendTitle("function(")
          .appendTitle('', 'PARAMS')
          .appendTitle(")");
      this.appendStatementInput('STACK')
          .appendTitle(Blockly.core.LANG_PROCEDURES_DEFNORETURN_DO);
      this.setMutator(new Blockly.core.Mutator(['jslang_function_mutatorarg']));
      this.setTooltip(Blockly.core.LANG_PROCEDURES_DEFNORETURN_TOOLTIP);
      this.setOutput(true, "null");
      this.arguments_ = [];
    },
    updateParams_: function() {
      // Check for duplicated arguments.
      var badArg = false;
      var hash = {};
      for (var x = 0; x < this.arguments_.length; x++) {
        if (hash['arg_' + this.arguments_[x].toLowerCase()]) {
          badArg = true;
          break;
        }
        hash['arg_' + this.arguments_[x].toLowerCase()] = true;
      }
      if (badArg) {
        this.setWarningText(Blockly.core.LANG_PROCEDURES_DEF_DUPLICATE_WARNING);
      } else {
        this.setWarningText(null);
      }
      // Merge the arguments into a human-readable list.
      var paramString = this.arguments_.join(', ');
      this.setTitleValue(paramString, 'PARAMS');
    },
    mutationToDom: function() {
      var container = document.createElement('mutation');
      for (var x = 0; x < this.arguments_.length; x++) {
        var parameter = document.createElement('arg');
        parameter.setAttribute('name', this.arguments_[x]);
        container.appendChild(parameter);
      }
      return container;
    },
    domToMutation: function(xmlElement) {
      this.arguments_ = [];
      for (var x = 0, childNode; childNode = xmlElement.childNodes[x]; x++) {
        if (childNode.nodeName.toLowerCase() == 'arg') {
          this.arguments_.push(childNode.getAttribute('name'));
        }
      }
      this.updateParams_();
    },
    decompose: function(workspace) {
      var containerBlock = new Blockly.core.Block(workspace, 'jslang_function_mutatorcontainer');
      containerBlock.initSvg();
      var connection = containerBlock.getInput('STACK').connection;
      for (var x = 0; x < this.arguments_.length; x++) {
        var paramBlock = new Blockly.core.Block(workspace, 'jslang_function_mutatorarg');
        paramBlock.initSvg();
        paramBlock.setTitleValue(this.arguments_[x], 'NAME');
        // Store the old location.
        paramBlock.oldLocation = x;
        connection.connect(paramBlock.previousConnection);
        connection = paramBlock.nextConnection;
      }
      // Initialize procedure's callers with blank IDs.
      // Blockly.core.Procedures.mutateCallers(this.getTitleValue('NAME'),this.workspace, this.arguments_, null);
      return containerBlock;
    },
    compose: function(containerBlock) {
      this.arguments_ = [];
      this.paramIds_ = [];
      var paramBlock = containerBlock.getInputTargetBlock('STACK');
      while (paramBlock) {
        this.arguments_.push(paramBlock.getTitleValue('NAME'));
        this.paramIds_.push(paramBlock.id);
        paramBlock = paramBlock.nextConnection &&
            paramBlock.nextConnection.targetBlock();
      }
      this.updateParams_();
      // Blockly.core.Procedures.mutateCallers(this.getTitleValue('NAME'), this.workspace, this.arguments_, this.paramIds_);
    },
    dispose: function() {
      // Dispose of any callers.
      // var name = this.getTitleValue('NAME');
      Blockly.core.Procedures.disposeCallers(name, this.workspace);
      // Call parent's destructor.
      Blockly.core.Block.prototype.dispose.apply(this, arguments);
    },
    // getProcedureDef: function() {
    //   // Return the name of the defined procedure,
    //   // a list of all its arguments,
    //   // and that it DOES NOT have a return value.
    //   return [this.getTitleValue('NAME'), this.arguments_, false];
    // },
    // getVars: function() {
    //   return this.arguments_;
    // },
    renameVar: function(oldName, newName) {
      var change = false;
      for (var x = 0; x < this.arguments_.length; x++) {
        if (Blockly.core.Names.equals(oldName, this.arguments_[x])) {
          this.arguments_[x] = newName;
          change = true;
        }
      }
      if (change) {
        this.updateParams_();
        // Update the mutator's variables if the mutator is open.
        if (this.mutator.isVisible_()) {
          var blocks = this.mutator.workspace_.getAllBlocks();
          for (var x = 0, block; block = blocks[x]; x++) {
            if (block.type == 'jslang_function_mutatorarg' &&
                Blockly.core.Names.equals(oldName, block.getTitleValue('NAME'))) {
              block.setTitleValue(newName, 'NAME');
            }
          }
        }
      }
    },
    customContextMenu: function(options) {
      // Add option to create caller.
      var option = {enabled: true};
      // var name = this.getTitleValue('NAME');
      option.text = Blockly.core.LANG_PROCEDURES_CREATE_DO.replace('%1', name);

      var xmlMutation = goog.dom.createDom('mutation');
      xmlMutation.setAttribute('name', name);
      for (var x = 0; x < this.arguments_.length; x++) {
        var xmlArg = goog.dom.createDom('arg');
        xmlArg.setAttribute('name', this.arguments_[x]);
        xmlMutation.appendChild(xmlArg);
      }
      var xmlBlock = goog.dom.createDom('block', null, xmlMutation);
      xmlBlock.setAttribute('type', this.callType_);
      option.callback = Blockly.core.ContextMenu.callbackFactory(this, xmlBlock);

      options.push(option);
      // Add options to create getters for each parameter.
      for (var x = 0; x < this.arguments_.length; x++) {
        var option = {enabled: true};
        var name = this.arguments_[x];
        option.text = Blockly.core.LANG_VARIABLES_SET_CREATE_GET.replace('%1', name);
        var xmlTitle = goog.dom.createDom('title', null, name);
        xmlTitle.setAttribute('name', 'VAR');
        var xmlBlock = goog.dom.createDom('block', null, xmlTitle);
        xmlBlock.setAttribute('type', 'variables_get');
        option.callback = Blockly.core.ContextMenu.callbackFactory(this, xmlBlock);
        options.push(option);
      }
    },
    callType_: 'procedures_callnoreturn'
  };

  Blockly.core.Language.jslang_function_mutatorcontainer = {
    // Procedure container (for mutator dialog).
    init: function() {
      this.setColour(290);
      this.appendDummyInput()
          .appendTitle(Blockly.core.LANG_PROCEDURES_MUTATORCONTAINER_TITLE);
      this.appendStatementInput('STACK');
      this.setTooltip('');
      this.contextMenu = false;
    }
  };

  Blockly.core.Language.jslang_function_mutatorarg = {
    // Procedure argument (for mutator dialog).
    init: function() {
      this.setColour(290);
      this.appendDummyInput()
          .appendTitle(Blockly.core.LANG_PROCEDURES_MUTATORARG_TITLE)
          .appendTitle(new Blockly.core.FieldTextInput('x', this.validator), 'NAME');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip('');
      this.contextMenu = false;
    }
  };

  Blockly.core.Language.jslang_function_mutatorarg.validator = function(newVar) {
    // Merge runs of whitespace.  Strip leading and trailing whitespace.
    // Beyond this, all names are legal.
    newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    return newVar || null;
  };

  // ===
  // = JS -> Blocks
  // ===

// _tree("(function(){alert('wut')})")
// ├─ type: Program
// └─ body
//    └─ 0
//       ├─ type: ExpressionStatement
//       └─ expression
//          ├─ type: FunctionExpression
//          ├─ id
//          ├─ params
//          ├─ defaults
//          ├─ body
//          │  ├─ type: BlockStatement
//          │  └─ body
//          │     └─ 0
//          │        ├─ type: ExpressionStatement
//          │        └─ expression
//          │           ├─ type: CallExpression
//          │           ├─ callee
//          │           │  ├─ type: Identifier
//          │           │  └─ name: alert
//          │           └─ arguments
//          │              └─ 0
//          │                 ├─ type: Literal
//          │                 └─ value: wut
//          ├─ rest
//          ├─ generator: false
//          └─ expression: false
 
// <xml>
//   <block type="jslang_function_anon" x="72" y="195">
//     <mutation>
//       <arg name="x"></arg>
//       <arg name="z"></arg>
//     </mutation>
//     <title name="NAME">anon</title>
//     <statement name="STACK">
//       <block type="text_print" inline="false">
//         <value name="TEXT">
//           <block type="text">
//             <title name="TEXT">hello</title>
//           </block>
//         </value>
//       </block>
//     </statement>
//   </block>
// </xml>

 Blockly.util.registerBlockSignature({
    // Pattern
      type: 'FunctionExpression',
      id: patternMatch.var('id'),
      params: patternMatch.var('params'),
      body: patternMatch.var('body'),
    },
    // XML generator
    function(node,matchedProps) {
      var output = ''
      output += '<block type="jslang_function_anon">'
      output += '<mutation>'
      matchedProps.params.forEach(function(param,index) {
        output += '<arg name="'+param.name+'"/>'
      })
      output += '</mutation>'
      // output += '<title name="NAME">'+(matchedProps.id || 'anon')+'</title>'
      output += '<statement name="STACK">'
      output += Blockly.util.convertAstNodeToBlocks(matchedProps.body)
      output += '</statement>'
      output += '</block>'
      return output
    }
  )

  

  // ===
  // = Blocks -> JS
  // ===

  Blockly.core.JavaScript.jslang_function_anon = function() {
    // Define a procedure with a return value.
    var branch = Blockly.core.JavaScript.statementToCode(this, 'STACK');
    if (Blockly.core.JavaScript.INFINITE_LOOP_TRAP) {
      branch = Blockly.core.JavaScript.INFINITE_LOOP_TRAP.replace(/%1/g,
          '\'' + this.id + '\'') + branch;
    }
    var returnValue = Blockly.core.JavaScript.valueToCode(this, 'RETURN',
        Blockly.core.JavaScript.ORDER_NONE) || '';
    if (returnValue) {
      returnValue = '  return ' + returnValue + ';\n';
    }
    var args = [];
    for (var x = 0; x < this.arguments_.length; x++) {
      args[x] = Blockly.core.JavaScript.variableDB_.getName(this.arguments_[x],
          Blockly.core.Variables.NAME_TYPE);
    }
    var code = 'function(' + args.join(', ') + ') {\n' +
        branch + returnValue + '}';
    code = Blockly.core.JavaScript.scrub_(this, code);
    //Blockly.core.JavaScript.definitions_[funcName] = code;
    //return null;
    return [code,Blockly.core.JavaScript.ORDER_NONE]
  };
