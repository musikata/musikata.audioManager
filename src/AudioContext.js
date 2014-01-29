define(function(require){
  // Setup audio context initially (one context per window).
  if (! window._AudioContext){
    var _AudioContext = window.AudioContext || window.webkitAudioContext;
    window._AudioContext = new _AudioContext();
  }
  return window._AudioContext;
});
