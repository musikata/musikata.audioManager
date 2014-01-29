define(function(require){
  // Setup audio context initially (one context per window).
  if (! window._AudioContext){
    var _AudioContext = window.AudioContext || window.webkitAudioContext;
    window._audioContext = new _AudioContext();
    // Start timer (for chrome).
    window._audioContext.createGain();

    // Wait for audioContext to initialize.
    while (! window._audioContext.currentTime){}
  }

  return window._AudioContext;
});
