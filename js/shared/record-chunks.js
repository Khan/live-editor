import { Model } from "backbone-model";

/* Manages the audio chunks as we build up this recording. */
const ScratchpadAudioChunks = Model.extend({

    initialize: function(options) {
        // The saved audio chunks
        this.audioChunks = [];
        // The current chunk we have not yet saved or discarded
        this.currentChunk = null;
    },

    setCurrentChunk: function(recording) {
        this.currentChunk = recording;
    },

    currentChunkExists: function() {
        return this.currentChunk !== null;
    },

    startNewChunk: function() {
        this.currentChunk = null;
    },

    discardCurrentChunk: function() {
        this.currentChunk = null;
    },

    saveCurrentChunk: function() {
        if (!this.currentChunk) {
            return;
        }
        this.audioChunks.push(this.currentChunk);
        this.currentChunk = null;
    },

    /* Return the array of audio chunks, not yet stitched together. */
    getAllChunks: function() {
        return this.audioChunks;
    }
});

export default ScratchpadAudioChunks;