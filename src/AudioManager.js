define(function(require){
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');

  // Constructor.
  var AudioManager = function(options){
    this.audioContext = options.audioContext;
  };

  _.extend(AudioManager.prototype, Backbone.Events, {
  });

  return AudioManager;
});
