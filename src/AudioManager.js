define(function(require){
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');

  // Constructor.
  var AudioManager = function(options){
    this.audioContext = options.audioContext;
  };

  _.extend(AudioManager.prototype, Backbone.Events, {

    getCurrentTime: function(){
      return this.audioContext.currentTime;
    },

    getPromise: function(key){
      var deferred = new $.Deferred();
      // Fake loading by creating noise buffer.
      var buffer = this.context.createBuffer(1, 44100, 44100);
      var data = buffer.getChannelData(0);
      for (i = 0; i < data.length; i++) {
        data[i] = 0;
      }
      if (this.loadTime){
        setTimeout(function(){
          deferred.resolve(buffer);
        }, this.loadTime);
      }
      else{
        deferred.resolve(buffer);
      }
      return deferred.promise();
    },

  });

  return AudioManager;
});
