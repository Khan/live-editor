(function() {

  Blockly.core = Blockly;
  Blockly.core.Language = Blockly.Blocks;

  // Free up some reserved words
  var rw = Blockly.core.JavaScript.RESERVED_WORDS_.split(',')
  var wordsToBeLiberated = ['console']
  wordsToBeLiberated.forEach(function(word){
    var index = rw.indexOf(word); // Find the index
    if(index!=-1) rw.splice(index, 1); // Remove it if really found!
  })
  Blockly.core.JavaScript.RESERVED_WORDS_ = rw.join(',')

  // Overwrite Javascript generation to not wrap everything in parens
  Blockly.core.JavaScript.valueToCode = (function (a, b, c) {
    if (isNaN(c)) throw 'Expecting valid order from block "' + a.type + '".';
    a = a.getInputTargetBlock(b);
    if (!a) return "";
    var d = this.blockToCode(a);
    if ("" === d) return "";
    if (!(d instanceof Array)) throw 'Expecting tuple from value block "' + a.type + '".';
    b = d[0];
    d = d[1];
    if (isNaN(d)) throw 'Expecting valid order from value block "' + a.type + '".';
    //b && c <= d && (b = "(" + b + ")");
    return b
  }).bind(Blockly.core.JavaScript)
})();
