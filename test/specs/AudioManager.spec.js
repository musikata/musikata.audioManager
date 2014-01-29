define(function(require){
  var $ = require('jquery');
  var AudioManager = require("audioManager/AudioManager");
  var AudioContext = require("audioManager/AudioContext");

  // Wait for timer to start for chrome.
  AudioContext.createGain();
  while (! AudioContext.currentTime){}

  describe("AudioManager", function(){
    it("should be defined", function(){
      expect(AudioManager).toBeDefined();
    });

    describe("After initialization", function(){

      var audioManager;
      beforeEach(function(){
        audioManager = new AudioManager({
          audioContext: AudioContext
        });
      });

      it("should getCurrentTime", function(){
        expect(audioManager.getCurrentTime()).toBe(AudioContext.currentTime);
      });
    });
  });

});
