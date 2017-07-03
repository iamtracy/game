GameObject("Trivia").Extend({
  initGame: function(iGameKey) {
    var oGame = GameDataObject("Game" + iGameKey);
    oGame.Extend({
      GameQuestions: [],
      GetRandomQuestions: function() {
        var aQuestions = [],
          aTemp = [];
        xDOM.cloneObject(aQuestions, this.GameQuestions.sort((function() {
          return function(a, b) {
            a = Math.random();
            b = Math.random();

            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
          }
        })()));

        for (var i = 0, ii = 10; i < ii; i++)
          aTemp.push(aQuestions[i]);

        return aTemp;
      },
      GetQuestion: function(iQuestionKey) {
        return xDOM.FindMatchObject(iQuestionKey, "QuestionKey", this.GameQuestions);
      }
    });

    for (var i = 0, ii = oGame.GameData.GameQuestions.length; i < ii; i++) {
      var oQuestion = oGame.GameData.GameQuestions[i];
      var oTemp = {};
      var iQuestionKey = xDOM.getRandomNumber(20);
      oTemp.QuestionKey = iQuestionKey;
      oTemp.Question = oQuestion.Question;

      var cCorrect = oQuestion.Correct;
      if (window.atob)
        cCorrect = window.atob(cCorrect);

      oTemp.Correct = cCorrect;
      oTemp.Answers = [];
      if (oQuestion.Answer1)
        oTemp.Answers.push(oQuestion.Answer1)
      if (oQuestion.Answer2)
        oTemp.Answers.push(oQuestion.Answer2)
      if (oQuestion.Answer3)
        oTemp.Answers.push(oQuestion.Answer3)
      if (oQuestion.Answer4)
        oTemp.Answers.push(oQuestion.Answer4)

      oGame.GameQuestions.push(oTemp)
    }
  },
  BackToList: function(oEvent) {
    getGameDisplay('View').LeaderBoard('.PageContent .listView .leaderboard-section', 'Overall Leaderboard', GameDataObject("Array", 'GameKey'));
    var oSecondLeaderboard = xDOM('.PageContent .listView .leaderboard-section > div').Elems[1];
    if(oSecondLeaderboard) {
      oSecondLeaderboard.outerHTML = '';
    }
    GameView.stopTimer(false);
    GameView.getScore();
    GameView.getCorrect();
    this.ClearWelcomeScreen();
    g_oGamesDisplay.View.Set();
  },
  StartGame: function(evt) {
    if (evt) {
      var oEvent = new EventObj(evt),
        oElem = FindElem(oEvent.srcElement, "data-game-key"),
        iGameKey = xDOM(oElem).getAttr("data-game-key"),
        oGame = GameDataObject("Game" + iGameKey);

      this.ClearWelcomeScreen();

      GameView.setGame({
        GameData: oGame,
        Parent: this
      });
    }
  },
  BuildGame: function(iGameKey) {
    var oGameData = GameDataObject("Game" + iGameKey);

    xDOM.cloneNode("GameMasterNode", true)
      .setAttr(function(_this, oElem, aAttr) {
        for (var n in oGameData) {
          for (var a in aAttr) {
            if (aAttr[a].value && aAttr[a].value.indexOf("{") != -1)
              aAttr[a].value = xDOM.Replace(aAttr[a].value, "{" + n + "}", oGameData[n]);
          }
        }
      })
      .HTML(function(_this, oElem) {
        for (var n in oGameData)
          oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "{" + n + "}", oGameData[n]);

        oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "data-src", 'src');
      })
      .appendToElem(".PageContent .play-section");
  },
  ClearQuestion: function() {
    xDOM(".PageContent .play-section .question-container").HTML("");
  },
  BuildQuestion: function(oQuestion) {
    this.ClearQuestion();
    xDOM.cloneNode("GameMasterNodeQuestion", true)
      .setAttr(function(_this, oElem, aAttr) {
        for (var n in oQuestion) {
          for (var a in aAttr) {
            if (aAttr[a].value && aAttr[a].value.indexOf("{") != -1)
              aAttr[a].value = xDOM.Replace(aAttr[a].value, "{" + n + "}", oQuestion[n]);
          }
        }
      })
      .HTML(function(_this, oElem) {
        for (var n in oQuestion)
        oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "{" + n + "}", oQuestion[n]);

        oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "data-src", 'src');
      })
      .appendToElem(".PageContent .play-section .question-container");


    if (GameDataObject("Array").length > 1) {
      xDOM('.PageContent .answers .current-q-index .back-to-list').addEvent("click", this.BackToList.bind(this));

    } else {
      xDOM('.PageContent .answers .current-q-index .back-to-list').removeFromElem();
    }

    oQuestion.Answers.sort((function() {
      return function(a, b) {
        a = Math.random();
        b = Math.random();

        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      }
    })());

    for (var i = 0, ii = oQuestion.Answers.length; i < ii; i++) {
      xDOM.cloneNode("GameMasterNodeAnswer", true)
        .setAttr('data-guessval', oQuestion.Answers[i])
        .HTML(function(_this, oElem) {
          oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "{Answer}", oQuestion.Answers[i]);
        })
        .appendToElem(".PageContent .play-section .question-container .answer");
    }
    xDOM('.PageContent .play-section .question-container .answer .answer-click').addEvent("click", GameView.checkAnswer);
  },
  EndGame: function(iGameKey) {
    GameView.stopTimer(false);
    var iScore = GameView.getScore();
    var iCorrect = GameView.getCorrect();
    this.CompleteScreen(iGameKey, iScore, iCorrect);
  }
});


var GameView = (function(window, document) {
  var iScore = 0,
    oGameData = null,
    aQuestions = [],
    oParent = null,
    iCorrect = 0;

  function setGame(oGameParams) {
    iScore = 0;
    iCorrect = 0;
    oGameData = oGameParams.GameData;
    oParent = oGameParams.Parent;

    oGameData.Update({ 'GameUserState': 'HasPlayed' }, 1);
    oParent.SetState(oGameData.GameKey);

    aQuestions = oGameData.GetRandomQuestions();
    oParent.BuildGame(oGameData.GameKey);
    oParent.BuildQuestion(aQuestions.pop());
    setQuestionIdex();
    oCounter.startTimer();
  }

  function stopTimer(bNext) {
    xDOM('.PageContent .play-section .question-container .answer .answer-click').removeEvent("click", GameView.checkAnswer);
    return oCounter.stopTimer(bNext);
  }

  function nextQuestion() {
    if (aQuestions.length) {
      oParent.BuildQuestion(aQuestions.pop());
      setQuestionIdex();
      oCounter.startTimer();
    } else {
      oParent.EndGame(oGameData.GameKey);
    }
  }

  function setQuestionIdex() {
    xDOM(".PageContent .play-section .current-q-index .current-q").HTML((10 - aQuestions.length) + "/10");
  }

  function checkAnswer(evt) {
    if (evt) {
      var iScore = GameView.stopTimer(true);

      var oEvent = new EventObj(evt),
        oGameElem = FindElem(oEvent.srcElement, "data-game-key"),
        iGameKey = xDOM(oGameElem).getAttr("data-game-key"),
        oQuestionElem = FindElem(oEvent.srcElement, "data-question-key"),
        iQuestionKey = xDOM(oQuestionElem).getAttr("data-question-key"),
        cAnswerText = xDOM(oEvent.srcElement).getAttr("data-guessval"),
        oData = GameDataObject("Game" + iGameKey),
        oQuestion = oData.GetQuestion(iQuestionKey),
        bCorrect = false;
      if (oQuestion.Correct == cAnswerText) {
        bCorrect = true;
        ++iCorrect;
        oGameData.Update({ 'GameUserState': 'CorrectCount' }, iCorrect);
        GameView.setScore(iGameKey, iScore);
      } else {
        GameView.setScore(iGameKey, 0);
      }

      xDOM(oEvent.srcElement).addClass((bCorrect ? "correct" : "incorrect"))
    }
  }

  function setScore(iGameKey, iNewScore) {
    iScore += parseInt(iNewScore);

    if (oGameData.GameUserState.HighScore < iScore) {
      oParent.SetScore(iGameKey, iScore);
      oGameData.Update({ 'GameUserState': 'HighScore' }, iScore);
      oParent.SetState(oGameData.GameKey);
    }

    xDOM(".PageContent .play-section #score").HTML(iScore.toString())
  }

  function getScore() { return iScore; }

  function getCorrect() { return iCorrect; }

  return {
    setGame: setGame,
    setScore: setScore,
    getScore: getScore,
    getCorrect: getCorrect,
    checkAnswer: checkAnswer,
    stopTimer: stopTimer,
    nextQuestion: nextQuestion
  };

})(window, document);

function GetWorker() {
  return new Worker("//" + g_cContentServerAddress + "/customvts/VXP/Reflow/Games/js/TriviaWorker.js");
}

var oCounter = (function() {
  var oIntervalRef;
  var cSeconds;
  var oWebWorker = null;

  function startWorker() {
    if (oWebWorker == null) {
      oWebWorker = GetWorker();
      oWebWorker.onmessage = function(oEvent) {
        Emitters[oEvent.data.Emitter](oEvent.data);
      }
    }
  }

  function stopWorker() {
    if (oWebWorker == null) {
      oWebWorker.postMessage({
        Method: 'stop'
      });
      oWebWorker.terminate();
      oWebWorker = null;
    }
  }

  function startTimer() {
    startWorker();
    oWebWorker.postMessage({
      Duration: 10000,
      Method: 'startTimer',
      Emitter: 'setTimer'
    });
  }

  function stopTimer(bMoveForward) {
    if (oWebWorker != null) {
      oWebWorker.postMessage({
        Method: 'stopTimer'
      });
      stopWorker();
      if (bMoveForward) {
        _moveForwardUI();
      }
      return parseInt(cSeconds);
    }
  }

  var Emitters = {
    setTimer: function(oData) {
      var oTimer = document.querySelector('#timer');
      cSeconds = oData.Seconds;
      oTimer.innerHTML = cSeconds;
      if (cSeconds == 0) {
        GameView.stopTimer(true);
      }
    }
  }

  function _moveForwardUI() {
    var oGameView = GameView;
    var oGameElem = xDOM('#gameView');
    var iGameKey = xDOM(oGameElem).getAttr("data-game-key")
    setTimeout(function() {
      oGameView.nextQuestion();
      getGameDisplay('View').LeaderBoard('.PageContent .gameView .leaderboard-section', 'Game Leaderboard',  iGameKey);
    }, 1750);
  }

  return {
    startTimer: startTimer,
    stopTimer: stopTimer
  };
})();