/* 
  This library is based on https://github.com/mattdiamond/Recorderjs

  This is the WebWorker that processes messages from multirecorder.js
  It will only live inside a worker, so its variables and functions
  should not conflict with other files.

  This worker is responsible for building up buffers from an audio stream,
  and then turning those into WAV files when requested.
  We do this in a worker since it could get a bit wieldy
  in the main browser loop.
*/
var recLength = 0,
  recBuffersL = [],
  recBuffersR = [],
  sampleRate;

function sendMessage(e, result) {
  this.postMessage({callbackId: e.data.callbackId, result: result});
}

this.onmessage = function(e) {
  switch (e.data.command) {
    case "init":
      init(e.data.config);
      break;
    case "record":
      record(e.data.buffer);
      break;
    case "finishRecording":
      var interleaved = getInterleaved();
      sendMessage(e, {wav: getWAV(interleaved), samples: interleaved});
      break;
    case "combineRecordings":
      var combined = combineBuffers(e.data.samples);
      sendMessage(e, {wav: getWAV(combined), samples: combined});
      break;
    case "clear":
      clear();
      break;
  }
};

function init(config) {
  sampleRate = config.sampleRate;
}

function record(inputBuffer) {
  recBuffersL.push(inputBuffer[0]);
  recBuffersR.push(inputBuffer[1]);
  recLength += inputBuffer[0].length;
}

function clear() {
  recLength = 0;
  recBuffersL = [];
  recBuffersR = [];
}

function getInterleaved() {
  var bufferL = combineBuffers(recBuffersL);
  var bufferR = combineBuffers(recBuffersR);
  var interleaved = interleave(bufferL, bufferR);
  return interleaved;
}

function getWAV(interleaved) {
  interleaved = interleaved || getInterleaved();
  var dataview = encodeWAV(interleaved);
  var audioBlob = new Blob([dataview], { type: "audio/wav" });
  return audioBlob;
}

function combineBuffers(arrayBuffers) {
  // Figure out length of all of them to create new array
  var totalLength = 0;
  for (var i = 0; i < arrayBuffers.length; i++) {
    totalLength += arrayBuffers[i].length;
  }
  var combined = new Float32Array(totalLength);

  // Now set the bytes
  var offset = 0;
  for (i = 0; i < arrayBuffers.length; i++) {
    combined.set(arrayBuffers[i], offset);
    offset += arrayBuffers[i].length;
  }
  return combined;
}

function interleave(inputL, inputR) {
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0,
    inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function floatTo16BitPCM(output, offset, input) {
  for (var i = 0; i < input.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view, offset, string) {
  for (var i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples) {
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, "RIFF");
  /* file length */
  view.setUint32(4, 32 + samples.length * 2, true);

  /* RIFF type */
  writeString(view, 8, "WAVE");
  /* format chunk identifier */
  writeString(view, 12, "fmt ");
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 2, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 4, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, "data");

  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);
  return view;
}

