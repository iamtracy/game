onmessage = function(e) {
  oWorker[e.data.Method](e.data);
}

var oIntervalRef; 
var oWorker = {
  startTimer: function(oParams){
    var duration = oParams.Duration,
      timer = oParams.Duration,
      Emitter = oParams.Emitter;
    oIntervalRef = setInterval(function() {
      iSeconds = timer;

      postMessage({
        Seconds: iSeconds,
        Emitter: Emitter
      });

      timer = timer-100;
      if (timer < 0) {
        timer = duration;
      }

      if (iSeconds == 0) {
        clearInterval(oIntervalRef)
      }
    }, 100);
  },
  stopTimer: function(){
    clearInterval(oIntervalRef);
  },
  stop: function(){
    close();
  }
}