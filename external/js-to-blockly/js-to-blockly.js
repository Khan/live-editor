Blockly.util = (function() {
// Initialization
var blockSignatures = window._sigs = {}

function jsToBlocklyXml(source) {
  var ast = esprima.parse(source)
  return convertAstNodeToBlocks(ast)
}

// Takes in an esprima syntax node, returns a string of xml Blockly Blocks
function convertAstNodeToBlocks(ast) {
  // Ensure valid input
  if (!ast.type) throw "bad ast node - no 'type' property"

  var result

  // Get registered syntaxes for this node type
  var signatures = blockSignatures[ast.type] || []

  // Find and return the first matching result
  signatures.slice().reverse().some(function(sig) {
    result = checkMatch(ast, sig);
    // exit loop if result found 
    return !!result
  })

  // Return match if found
  if (result) return result

  // Match was not found
  throw 'matching signature NOT FOUND for "'+ast.type+'"'
}

// return the match if found, or return false
function checkMatch(node, signature) {
  // build matcher function
  var matcherFn = function(when) { when(signature.pattern, function(when){ return signature.xmlGenerator(node,when) }) }
  try {
    // patternMatch throws an error if it does not find a match
    return patternMatch(node,matcherFn)
  } catch(err) {
    return false
  }
}

// Add a block signature to the list of registered blocks
function registerBlockSignature(pattern, xmlGenerator) {
  // Ensure valid input
  if (!pattern.type) throw "bad block signature - pattern has no 'type' property"  
  // Initialize this type if necesary
  var signaturesForType = blockSignatures[pattern.type]
  if (!Array.isArray(signaturesForType)) blockSignatures[pattern.type] = signaturesForType = []
  // Add signature to registry
  signaturesForType.push({ pattern: pattern, xmlGenerator: xmlGenerator })
}

// NOTE: appendInNewTag and appendTagDeep are similar, but implemented fairly differently,
//  and take different arguments, namely `tagName` and `args`
// TODO: refactor

// Appends the `child` to the `parent` inside a tag of type `tag` optionally with tag attributes `args`
// Should be fast - we're not parsing the whole parent or child
// args should be 'name="VAR"' not "VAR"
function appendInNewTag(parent, child, tag, args) {
  // Ensure valid input
  if ((typeof parent !== 'string') || (typeof child !== 'string') || !tag) throw "`appendInNewTag` received invalid input: "+arguments
  // set defaults
  if (!Array.isArray(args)) args = [args]
  args = args || []
  // Before Closing Tag, Append tag with child embedded
  var closetagIndex = parent.lastIndexOf('</block>')
  var tagWithChild = '<'+tag
  if (args.length) tagWithChild += ' '+args.join(" ")
  tagWithChild += '>'+child+'</'+tag+'>'
  var parentNewValue = parent.slice(0,closetagIndex)+tagWithChild+parent.slice(closetagIndex)
  return parentNewValue
}

// Appends `child` to `parent` or its deepest child if tag of type `tag` and "name" attribute equal to `tagName` present
// Appends to parent unless it has tag+tagName, then it tries the child in that tag, and possibly its children
function appendTagDeep(parent, child, tag, tagName) {
  // Ensure valid input
  if ((typeof parent !== 'string') || (typeof child !== 'string') || !tag) throw "`appendTagDeep` received invalid input: "+arguments
  // Dig out target
  var parentObj = xmlMap.load(parent)
  var targetObj = parentObj.block
  
  var continueInteration = true
  while( continueInteration ) {
    // check to see if we should close the loop
    if (!targetObj[tag]) {
      continueInteration = false
      break
    }
    // for many tags, check each
    if (Array.isArray(targetObj[tag]))
    {
      var found = false
      targetObj[tag].forEach(function(tagEntry){
        // check name, if found set as new target
        if (tagEntry.name === tagName) {
          targetObj = tagEntry.block
          found = true
        }
      })
      // if nothing found, stop iteration
      if (found==false) continueInteration = false
    }
    // for single tag, check name
    else if (targetObj[tag].name === tagName) {
      targetObj = targetObj[tag].block
    }
    // tag exists, but does not match tagName
    else {
      continueInteration = false
    }
  }

  // if tag exists
  if (targetObj[tag]) {
    // and there is only one such tag, prepare for multiple
    if (!Array.isArray(targetObj[tag])) targetObj[tag] = [targetObj[tag]]
  } else {
    // otherwise set to empty array
    targetObj[tag] = []
  }
  // Append child in target in new tag with name set
  targetObj[tag].push({ name: tagName, block: xmlMap.load(child).block })
  return xmlMap.dump(parentObj)
}

return {
  registerBlockSignature: registerBlockSignature,
  convertAstNodeToBlocks: convertAstNodeToBlocks,
  jsToBlocklyXml: jsToBlocklyXml,
  appendInNewTag: appendInNewTag,
  appendTagDeep: appendTagDeep,  
}
})();
