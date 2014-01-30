define(function(require){
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');

  // Constructor.
  var AudioManager = function(options){
    this.audioContext = options.audioContext;
    this.schedulingInterval = options.schedulingInterval || 1000/60.0;
    this._boundSchedulingLoop = _.bind(function(){
      this.schedulingLoop();
    }, this);
    this._scheduledEvents = [];
    this._actionHandlers = {};
    this._samples = {};

    // Set default action handlers.
    this.setActionHandler('sample:start', function(audioManager, event){
      var source = audioManager.getSampleSource(event.sample);
      source.connect( audioManager.audioContext.destination);
      source.start(event.time);
    });

    // Start scheduling loop.
    this._boundSchedulingLoop();
  };

  _.extend(AudioManager.prototype, Backbone.Events, {

    getCurrentTime: function(){
      return this.audioContext.currentTime;
    },

    setActionHandler: function(actionId, handler){
      this._actionHandlers[actionId] = handler;
    },

    getSampleSource: function(sample){
      var _sample = this.getSample(sample);
      var source = this.audioContext.createBufferSource();
      source.buffer = _sample.buffer;
      return source;
    },

    registerSample: function(sample){
      this._samples[sample.id] = _.extend({}, sample);
    },

    getSample: function(sample){
      if (typeof sample === 'string'){
        sample = {id: sample};
      }
      return this._samples[sample.id];
    },

    sampleIsRegistered: function(sample){
      return this._samples.hasOwnProperty(sample.id);
    },

    // Returns a promisee object representing the
    // sample's loading state.
    loadSample: function(sample){
      if (! this.sampleIsRegistered(sample)){
        this.registerSample(sample);
      }
      var _sample = this.getSample(sample);

      if (_sample.loadPromise){
        return _sample.loadPromise;
      }

      var loadDeferred = new $.Deferred();
      _sample.loadPromise = loadDeferred.promise();

      if (_sample.url){
        var request = new XMLHttpRequest();
        request.open('GET', sample.url, true);
        request.responseType = 'arraybuffer';

        // Decode asynchronously
        var _this = this;
        request.onload = function(){
          _this.audioContext.decodeAudioData(request.response, function(buffer){
            _sample.buffer = buffer;
            loadDeferred.resolve();
          }, loadDeferred.reject);
        }
        request.send();
      }

      return _sample.loadPromise;
    },

    getPromise: function(key){
      var deferred = new $.Deferred();
      // Fake loading by creating noise buffer.
      var buffer = this.audioContext.createBuffer(1, 44100, 44100);
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

    scheduleEvent: function(event){
      var actionHandler = this._actionHandlers[event.action];
      actionHandler(this, event);
      this._scheduledEvents.push(event);
    },

    schedulingLoop: function(swop){
      var currentTime = this.getCurrentTime();
      var scheduledIdx = this._scheduledEvents.length;
      while (scheduledIdx--){
        var event = this._scheduledEvents[scheduledIdx];
        if (event.time <= currentTime){
          // @TODO: not sure how performant this is, or if it matters.
          // But may want to switch to something w/ constant-time 
          // deletion later if it's a problem.
          this._scheduledEvents.splice(scheduledIdx,1);
          if (event.callback){
            event.callback();
          }
        }
      }
      this.schedulingTimer = setTimeout(
        this._boundSchedulingLoop, this.schedulingInterval);
    }

  });

  return AudioManager;
});
