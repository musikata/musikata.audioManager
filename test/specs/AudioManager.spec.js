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
        audioManager.setActionHandler('nop', function(){});
      });

      it("should getCurrentTime", function(){
        expect(audioManager.getCurrentTime()).toBe(AudioContext.currentTime);
      });

      it("should schedule events", function(){
        audioManager.scheduleEvent({
          action: 'nop',
          time: audioManager.getCurrentTime() + 100
        });
        expect(audioManager._scheduledEvents.length).toBe(1);
      });

      it("should be running the scheduling loop", function(){
        var spy;
        runs(function(){
          spy = spyOn(audioManager, 'schedulingLoop').andCallThrough();
        });

        waitsFor(function(){
          return (spy.callCount > 0);
        });

        runs(function(){
          expect(spy).toHaveBeenCalled();
        });
      });

      it("should call event callbacks when they have been processed", function(){
        var spy = jasmine.createSpy("callback");
        runs(function(){
          audioManager.scheduleEvent({
            action: 'nop',
            time: audioManager.getCurrentTime() + .1,
            callback: spy
          });
        });

        waitsFor(function(){
          return (spy.callCount > 0);
        });

        runs(function(){
          expect(spy).toHaveBeenCalled();
        });
      });

      it("should be able to load samples", function(){
        var promise;
        runs(function(){
          var sample = {
            id: 'testSample',
            url: require.toUrl('./marimba.mp3')
          };
          promise = audioManager.loadSample(sample);
        });

        waitsFor(function(){
          return (promise.state() === 'resolved');
        });

        runs(function(){
          var sample = audioManager.getSample('testSample');
          expect(sample.buffer).toBeDefined();
        })
      });

      it("should be able to get source for sample", function(){
        var promise;
        runs(function(){
          var sample = {
            id: 'testSample',
            url: require.toUrl('./marimba.mp3')
          };
          promise = audioManager.loadSample(sample);
        });

        waitsFor(function(){
          return (promise.state() === 'resolved');
        });

        runs(function(){
          var source = audioManager.getSampleSource('testSample');
          expect(source).toBeDefined();
        })
      });

      it("should be able to process sample:start actions", function(){
        var promise;
        var spy = jasmine.createSpy('sample:start spy');
        runs(function(){
          var sample = {
            id: 'testSample',
            url: require.toUrl('./marimba.mp3')
          };
          promise = audioManager.loadSample(sample);
        });

        waitsFor(function(){
          return (promise.state() === 'resolved');
        });

        runs(function(){
          audioManager.scheduleEvent({
            sample: 'testSample',
            time: 0,
            action: 'sample:start',
            callback: spy
          });
        });

        waitsFor(function(){
          return (spy.callCount > 0);
        });

        runs(function(){
          expect(spy).toHaveBeenCalled();
        });
      });

    });
  });

});
