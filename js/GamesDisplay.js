  var g_bChangeLang = false,
    g_oAjaxObj = new InxpoAJAXObject();

// ---- GAME BUILD OBJECT ----------------------------
  (function(_window) {
    var GO = {
      Items: {},
      Public: {},
      init: function(arg, arg2) {
        var oObj = {};
        if (typeof arg === "string") {
          oObj.ID = arg;
          if (arg == "ALL") {
            return GO;
          }
          if (arg == "Index") {
            return (GO.Items[arg2] == undefined ? false : true);
          }
        } else
          oObj = arg;

        if (GO.Items[oObj.ID] == undefined) {
          GO.Items[oObj.ID] = new GO.Object(oObj);
        }

        return GO.Items[oObj.ID];
      },
      Object: function(oObj) {
        this.ID = oObj.ID;

        for (var n in GO.Public)
          this[n] = GO.Public[n];

        this.Extend = function(oObj) {
          for (var n in oObj)
            this[n] = oObj[n];
        }
      },
      Extend: function() {
        var oObj = arguments[0] || {};
        for (var n in oObj)
          this.Public[n] = oObj[n];
      }
    }

    // Defualts
    GO.Extend({
      WelcomeScreen: function(iGameKey, bSkipVideo) {
        var oGameData = GameDataObject("Game" + iGameKey);
        if (oGameData.GameIntroVideoURL && !bSkipVideo) {
          var _this = this;
          var oVideoElem = VideoInit(oGameData.GameIntroVideoURL, "", 2, function() {
            _this.ClearWelcomeScreen();
            _this.WelcomeScreen(iGameKey, true);
          }, ".gameView[data-game-key='" + oGameData.GameKey + "'] .play-section");
          if (oVideoElem) {
            xDOM(oVideoElem)
              .appendToElem(".gameView[data-game-key='" + oGameData.GameKey + "'] .play-section");

            return false;
          }
        }

        xDOM.cloneNode("GameMasterNodeWelcome", true)
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

        xDOM(".PageContent  .play-section #startGame").addEvent("click", this.StartGame.bind(this));
        xDOM("#replay-btn").addEvent("click", this.StartGame.bind(this));
        
        if (GameDataObject("Array").length > 1) {
          xDOM('.PageContent .gameView .play-section .game-welcome .play-view-to-list').addEvent("click", this.BackToList.bind(this));
        } else {
          xDOM('.PageContent .play-section .game-welcome .play-view-to-list').removeFromElem();
        }
      },
      ClearWelcomeScreen: function() {
        xDOM(".PageContent  .play-section").HTML("");
      },
      SetGameActivity: function(iGameKey) {
        var cURL = g_cLASFileName + "?LASCmd=AI:" + g_iInstanceID + ";F:LBSEXPORT!JSON&SQLID=42200&GameKey=" + iGameKey;
        var oResponse = SendSyncAjax(cURL);
        GameDataObject("Game" + iGameKey).Update('GameActivityKey', oResponse.ResultSet[0][0].GameActivityKey);
        var cUserState = (oResponse.ResultSet[0][0].GameUserState ? oResponse.ResultSet[0][0].GameUserState : "{HighScore: 0, HasPlayed: 0, CorrectCount: 0}"),
          oUserState = InxpoAJAXEvalJSON(cUserState);
        GameDataObject("Game" + iGameKey).Update('GameUserState', oUserState);

        if (oUserState.HighScore != 0)
          this.SetScore(iGameKey, oUserState.HighScore)
      },
      SetScore: function(iGameKey, iScore) {
        var oGame = GameDataObject("Game" + iGameKey);

        var cURL = g_cLASFileName + "?LASCmd=AI:" + g_iInstanceID + ";F:SF!42210&SID=1";
        cURL += "&GameActivityKey=" + oGame.GameActivityKey;
        cURL += "&Score=" + iScore;

        SendSyncAjax(cURL, true);
      },
      SetState: function(iGameKey) {
        var oState = GameDataObject("Game" + iGameKey).GameUserState,
          cState = JSONEncode(oState),
          cURL = g_cLASFileName + "?LASCmd=AI:" + g_iInstanceID + ";F:SF!42210&SID=2";

        cURL += "&GameKey=" + iGameKey;
        cURL += "&GameUserState=" + cState;
        SendSyncAjax(cURL, true);
      },
      GetState: function(iGameKey) {},
      CompleteScreen: function(iGameKey, iScore, iCorrect) {
        this.ClearWelcomeScreen();
        var oGameData = GameDataObject("Game" + iGameKey);
        var aGameData = GameDataObject("Array");

        if (!iScore)
          iScore = oGameData.Get({ "GameUserState": "HighScore" });
        if (!iCorrect)
          iCorrect = oGameData.Get({ "GameUserState": "CorrectCount" });

        xDOM.cloneNode("GameMasterNodeComplete", true)
          .setAttr(function(_this, oElem, aAttr) {
            for (var n in oGameData) {
              for (var a in aAttr) {
                if (aAttr[a].value && aAttr[a].value.indexOf("{") != -1)
                  aAttr[a].value = xDOM.Replace(aAttr[a].value, "{" + n + "}", oGameData[n]);
              }
            }
          })
          .HTML(function(_this, oElem) {
            oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "{Title}", oGameData.TabTitle);
            oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "{Score}", iScore);
            oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "{Correct}", iCorrect);
          })
          .appendToElem(".PageContent .play-section");

        if (aGameData.length > 1) {
          xDOM('.PageContent .game-welcome .game-complete .back-to-list-btn').addEvent("click", this.BackToList.bind(this));
        } else {
          xDOM('.PageContent .game-welcome .game-complete .back-to-list-btn').removeFromElem();
        }
        if (oGameData.GameReplay == 0) {
          xDOM('.PageContent .game-welcome .game-complete #replayButton').removeFromElem();
        } else {
          xDOM('.PageContent .game-welcome .game-complete #replayButton').addEvent("click", this.StartGame.bind(this));
        }

        if (oGameData.GameIncludeLeaderboard)
          getGameDisplay('View').LeaderBoard('.PageContent .gameView .leaderboard-section', 'Game Leaderboard', iGameKey);
      }
    });

    var GDO = {
      Items: {},
      Public: {},
      init: function(arg, arg2) {
        var oObj = {};
        if (typeof arg === "string") {
          oObj.ID = arg;
          if (arg == "ALL") {
            return GDO;
          }

          if (arg == "Array") {
            var aRetVal = [];
            for (var n in GDO.Items) {
              if (!arg2)
                aRetVal.push(GDO.Items[n]);
              else
                aRetVal.push(GDO.Items[n][arg2]);
            }
            return aRetVal;
          }
        } else
          oObj = arg;

        if (GDO.Items[oObj.ID] == undefined) {
          GDO.Items[oObj.ID] = new GDO.Object(oObj);
        }

        return GDO.Items[oObj.ID];
      },
      Object: function(oObj) {
        for (var n in oObj)
          this[n] = oObj[n];

        var oData = oObj.TabData;
        this.Active = oData.Active;
        this.TabTitle = oData.TabTitle;
        this.GameTemplateURL = oData.Param3;
        this.GameKey = oData.Param1.split('|')[2];
        this.GameDefKey = oData.Param1.split('|')[1];
        this.GameType = oData.Param1.split('|')[0];
        this.BoothFeatureKey = oData.BoothFeatureKey;
        this.GameReplay = parseInt(oData.Param2.split('|')[0]);
        this.GameLogoImageURL = oData.Param2.split('|')[1];
        this.GameIncludeLeaderboard = parseInt(oData.Param4.split('|')[0]);
        this.GameWelcomeImageURL = oData.Param4.split('|')[1];
        this.GameIntroVideoURL = oData.Param5.split('|')[0];
        this.GameData = InxpoAJAXEvalJSON((oData.Param6 ? oData.Param6 : '{}'));

        this.Extend = function(oObj) {
          for (var n in oObj)
            this[n] = oObj[n];
        }

        for (var n in GDO.Public)
          this[n] = GDO.Public[n];
      },
      Extend: function() {
        var oObj = arguments[0] || {};
        for (var n in oObj)
          this.Public[n] = oObj[n];
      }
    }

    GDO.Extend({
      Update: function(cParam, cValue) {
        if (typeof cParam === 'string')
          this[cParam] = cValue;
        else if (typeof cParam === 'object') {
          for (var n in cParam)
            this[n][cParam[n]] = cValue;
        }
        return this;
      },
      Get: function(cParam) {
        var cRetval = '';
        if (typeof cParam === 'string')
          cRetval = this[cParam];
        else if (typeof cParam === 'object') {
          for (var n in cParam)
            cRetval = this[n][cParam[n]];
        }
        return cRetval;
      }
    });

    _window.GameObject = GO.init;
    _window.GameDataObject = GDO.init;
  })(window);
// ---- END ------------------------------------------

  var g_oGamesDisplay = {
    init: function() {
      EX_InitDefaults();
      AddEventHandler(window, "beforeunload", EX_ExitBooth);
      AddEventHandler(window, "unload", EX_ExitBooth);   

      // Multi-Lang
        if (g_iLocaleID != 0 && g_iLocaleID != 1033) {
          g_bChangeLang = true;
          xDOM("*[data-text-lang]").each(function(index, oElem) {
            var cLangID = xDOM(oElem).getAttr("data-text-lang");
            if (g_oLang[cLangID] != undefined)
              xDOM(oElem).HTML(g_oLang[cLangID]);
          });
          xDOM("*[data-title-lang]").each(function(index, oElem) {
            var cLangID = xDOM(oElem).getAttr("data-title-lang");
            if (g_oLang[cLangID] != undefined)
              xDOM(oElem).setAttr("title", g_oLang[cLangID]);
          });
          xDOM("body").addClass("MultiLang");
          UpdateLangs(g_oPageOptions, { "ImageURL": "ImageAlternates" });
        }

      // Set Colors
        SetCoreColors(
          g_oPageOptions.cPrimary,
          g_oPageOptions.cSecondary,
          g_oPageOptions.cTertiary,
          g_oPageOptions.cAccent1,
          g_oPageOptions.cAccent2,
          g_oPageOptions.cAction1,
          g_oPageOptions.cAction2,
          g_oPageOptions.cAction3,
          g_oPageOptions.cAction4,
          g_oPageOptions.cAction5,
          g_oPageOptions.cNoAction,
          g_oPageOptions.cPrimaryText,
          g_oPageOptions.cText1,
          g_oPageOptions.cText2
        );

      // Set Background
        if (g_oPageOptions.cShellBackgroundImageURL)
          xDOM(".PageBackground").CSS("background-image", "url(" + g_oPageOptions.cShellBackgroundImageURL + ")");
        if (g_oPageOptions.cShellBackgroundImagePosition)
          xDOM(".PageBackground").CSS("background-position", g_oPageOptions.cShellBackgroundImagePosition);
        if (g_oPageOptions.cShellBackgroundImageRepeat)
          xDOM(".PageBackground").CSS("background-repeat", g_oPageOptions.cShellBackgroundImageRepeat);
        if (g_oPageOptions.cShellBackgroundImageSize)
          xDOM(".PageBackground").CSS("background-size", g_oPageOptions.cShellBackgroundImageSize);
        if (g_oPageOptions.cShellBackgroundColor)
          xDOM(".PageBackground").CSS("background-color", g_oPageOptions.cShellBackgroundColor);

      // System Users Catch
        if (g_iUserType == 2) {}

      // Set Header Image
        if (g_oPageOptions.ImageURL){
          xDOM(".SingleImageContainer")
            .HTML(function (_this, oElem){
              oElem.innerHTML = StringReplace(oElem.innerHTML, "{ImageURL}", g_oPageOptions.ImageURL);
            });

          xDOM(".SingleImageContainer .ItemImage")
            .loadImage({
              AutoSize: false,
              Attr: "data-src"
            });
        }
        else{
          xDOM(".PageImage").removeFromElem();
        } 

      // Mobile Fix
        if (IsMobile()){
          function PageSize(){
            var oTop = GetTopWnd();
            xDOM("#BodyTag").CSS("width", oTop.GetViewportSize().width+"px")
          }
          AddEventHandler(window,"orientationchange", PageSize);
          AddEventHandler(window,"resize", PageSize);
          PageSize();
        }

      getGameDisplay('Build').Page();
    },

    Build: {
      Format: function() {
        var oTabData = g_oTabData[0];

        for (var i = 0, ii = oTabData.length; i < ii; i++) {
          var oTemp = {},
            oData = oTabData[i];

          oTemp.ID = "Game" + oData.Param1.split('|')[2];
          oTemp.TabData = oData;
          if (oData.Active)
            GameDataObject(oTemp);
        }
      },
      Page: function() {
        var cRule = "";
        getGameDisplay('Build').Format();
        var aGameData = GameDataObject("Array");

        if (aGameData.length > 1) { // Build Game List
          for (var i = 0, ii = aGameData.length; i < ii; i++) {
            var oData = aGameData[i];
            xDOM.cloneNode("MasterGameListNode", true)
              .setAttr('id', 'Game' + oData.GameKey)
              .setAttr(function(_this, oElem, aAttr) {
                for (var n in oData) {
                  for (var a in aAttr) {
                    if (aAttr[a].value && aAttr[a].value.indexOf("{") != -1)
                      aAttr[a].value = xDOM.Replace(aAttr[a].value, "{" + n + "}", oData[n]);
                  }
                }
              })
              .HTML(function(_this, oElem) {
                for (var n in oData)
                  oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "{" + n + "}", oData[n]);

                oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "data-src", 'src');
              })
              .appendToElem(".PageContent .game-section");

            cRule += getGameDisplay('Build').GameStyles(oData);
          }
          xDOM('.play-btn').addEvent('click', getGameDisplay('View').Game);

          if (g_oPageOptions.IncludeOverall)
            getGameDisplay('View').LeaderBoard('.PageContent .listView .leaderboard-section', 'Overall Leaderboard', GameDataObject("Array", 'GameKey'));
        } else {
          var oGame = aGameData[0];
          if (oGame){
            cRule += getGameDisplay('Build').GameStyles(oGame);
            getGameDisplay('View').Game(null, oGame.GameKey);
          }
        }

        if (cRule)
          GlobalAppendStyles(cRule);

        // Finish Load
        xDOM("body").removeClass("loading");
      },
      GameStyles: function(oGame) {
        var cRule = '';

        if (oGame.GameData && oGame.GameData.cAction1)
          cRule += CreateStyle(".PageContent div[data-game-key='" + oGame.GameKey + "'] .bgc-Action1", { "background-color": oGame.GameData.cAction1 + " !important" });

        if (oGame.GameData && oGame.GameData.cSecondary)
          cRule += CreateStyle(".PageContent div[data-game-key='" + oGame.GameKey + "'] .bgc-Secondary", { "background-color": oGame.GameData.cSecondary + " !important" });

        if (oGame.GameData && oGame.GameData.cText1)
          cRule += CreateStyle(".PageContent div[data-game-key='" + oGame.GameKey + "'] .tc-Text1", { "color": oGame.GameData.cText1 + " !important" });

        if (oGame.GameData && oGame.GameData.cText2)
          cRule += CreateStyle(".PageContent div[data-game-key='" + oGame.GameKey + "'] .tc-Text2", { "color": oGame.GameData.cText2 + " !important" });

        if (oGame.GameData && oGame.GameData.cTertiary)
          cRule += CreateStyle(".PageContent div[data-game-key='" + oGame.GameKey + "'] .bgc-Tertiary", { "background-color": oGame.GameData.cTertiary + " !important" });

        if (oGame.GameData && oGame.GameData.cAction5)
          cRule += CreateStyle(".PageContent div[data-game-key='" + oGame.GameKey + "'] .bc-Action5.correct", { "border-color": oGame.GameData.cAction5 + " !important" });

        if (oGame.GameData && oGame.GameData.cAction4)
          cRule += CreateStyle(".PageContent div[data-game-key='" + oGame.GameKey + "'] .bc-Action4.incorrect", { "border-color": oGame.GameData.cAction4 + " !important" });

        if (oGame.GameWelcomeImageURL)
          cRule += CreateStyle(".PageContent div[data-game-key='" + oGame.GameKey + "'] .game-welcome", { "background-image": "url(" + oGame.GameWelcomeImageURL + ") !important" });

        if (oGame.GameData && oGame.GameData.cPrimary) {
          cRule += CreateStyle(".PageContent div[data-game-key='" + oGame.GameKey + "'] .bgc-Primary", { "background-color": oGame.GameData.cPrimary + " !important" });


         

          var oRGB = ColorObject("hex", oGame.GameData.cPrimary).getRGB(),
            cPrimary = "rgba(" + oRGB.r + "," + oRGB.g + "," + oRGB.b + ",.30)";
          cRule += CreateStyle(".PageContent div[data-game-key='" + oGame.GameKey + "'] .bc-Primary", { "border-color": cPrimary + " !important" });
        }

        return cRule;
      }
    },

    View: {
      Clear: function() {
        xDOM(".PageContent .gameView").setAttr("data-game-key", "");
        xDOM(".PageContent .gameView .title-section").HTML("");
        xDOM(".PageContent .gameView .play-section").HTML("");
        xDOM(".PageContent .gameView .leaderboard-section").HTML("");
      },
      Set: function() {
        if (xDOM("#listView").hasClass("hide")) {
          xDOM("#listView").removeClass("hide");
          xDOM("#gameView").addClass("hide");
        } else {
          xDOM("#listView").addClass("hide");
          xDOM("#gameView").removeClass("hide");
        }
      },
      Game: function(evt, iGameKey) {
        if (evt) {
          var oEvent = new EventObj(evt),
            oElem = FindElem(oEvent.srcElement, "data-game-key"),
            iGameKey = xDOM(oElem).getAttr("data-game-key");
        }

        var oData = GameDataObject("Game" + iGameKey);
        if (GameObject("Index", oData.GameType)) {
          getGameDisplay('View').Clear();
          xDOM(".PageContent .gameView").setAttr("data-game-key", oData.GameKey);
          xDOM.cloneNode("MasterGameTitleNode", true)
            .setAttr(function(_this, oElem, aAttr) {
              for (var n in oData) {
                for (var a in aAttr) {
                  if (aAttr[a].value && aAttr[a].value.indexOf("{") != -1)
                    aAttr[a].value = xDOM.Replace(aAttr[a].value, "{" + n + "}", oData[n]);
                }
              }
            })
            .HTML(function(_this, oElem) {
              for (var n in oData)
                oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "{" + n + "}", oData[n]);

              oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "data-src", 'src');
            })
            .appendToElem(".PageContent .title-section");

          GameObject(oData.GameType).initGame(iGameKey);
          GameObject(oData.GameType).SetGameActivity(iGameKey);
          var bCanPlay = true;
          if (!oData.GameReplay) {
            if (oData.Get({ 'GameUserState': 'HasPlayed' }) == 1)
              bCanPlay = false;
          }

          if (bCanPlay) {
            GameObject(oData.GameType).WelcomeScreen(iGameKey);
          } else {
            GameObject(oData.GameType).CompleteScreen(iGameKey);
          }

          if (oData.GameIncludeLeaderboard)
            getGameDisplay('View').LeaderBoard('.PageContent .gameView .leaderboard-section', 'Game Leaderboard', iGameKey);
          g_oGamesDisplay.View.Set();
        } else {
          g_oAjaxObj.Abort();
          g_oAjaxObj.OnComplete = null;
          g_oAjaxObj.SendSyncRequest("GET", oData.GameTemplateURL, "");

          var cRaw = /<!--[^]*-->/gm.exec(g_oAjaxObj.m_oXMLHTTPReqObj.responseText),
            cCode = StringReplace(cRaw[0], "<!--", "");
          cCode = StringReplace(cCode, "-->", "");

          // BUILD OBJECT
          var oTemplate = {};
          eval("oTemplate = " + cCode);
          var cHTML = InxpoAJAXExtractHTMLBody(g_oAjaxObj.m_oXMLHTTPReqObj.responseText);
          xDOM('<div>').appendToElem("body").HTML(cHTML);

          LoadScripts(oTemplate.Display.Files, (function() {
            getGameDisplay('View').Game(null, iGameKey);
          }).bind(this));
        }
      },
      LeaderBoard: function(oContainer, cTitle, iGameKey) {
        var cURL = "";
        if (!xDOM.isArray(iGameKey))
          cURL = g_cLASFileName + "?LASCmd=AI:" + g_iInstanceID + ";F:LBSEXPORT!JSON&SQLID=42205&GameKey=" + iGameKey + "&Count=20&IndividualScores=1";
        else {
          var cGameKeyList = iGameKey.toString() + ","
          cURL = g_cLASFileName + "?LASCmd=AI:" + g_iInstanceID + ";F:LBSEXPORT!JSON&SQLID=14530&GameKeyList=" + cGameKeyList + "&Count=20";
        }

        var oResponse = SendSyncAjax(cURL),
          aUsers = [];

        if (oResponse)
          aUsers = oResponse.ResultSet[0];

        var oMyUser = xDOM.FindMatchObject('MyRow', 'RowClass', aUsers);

        xDOM(oContainer).HTML(""); 

        xDOM.cloneNode("GameMasterNodeLeaderBoard", true)
          .HTML(function(_this, oElem) {
            oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "{Title}", cTitle);
            if (oMyUser) {
              oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "{Score}", oMyUser.Score);
              oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "{Rank}", oMyUser.Rank);
            }
          })
          .appendToElem(oContainer);

        if (!oMyUser)
          xDOM(oContainer + ' .leaderboard-me').removeFromElem();

        // set data
        for (var i = 0, ii = aUsers.length; i < ii; i++) {
          var oUser = aUsers[i];
          xDOM.cloneNode("GameMasterNodeLeaderBoardRow", true)
            .setAttr(function(_this, oElem, aAttr) {
              for (var n in oUser) {
                for (var a in aAttr) {
                  if (aAttr[a].value && aAttr[a].value.indexOf("{") != -1)
                  
                    aAttr[a].value = xDOM.Replace(aAttr[a].value, "{" + n + "}", oUser[n]);
                }
              }
            })
            .HTML(function(_this, oElem) {
              for (var n in oUser)
                oElem.innerHTML = xDOM.Replace(oElem.innerHTML, "{" + n + "}", oUser[n]);
            })
            .appendToElem(oContainer + " .leaderboard-body");
        }
      }
    }
  }

  function EX_InitDefaults() {
    var oDefaults = {
      "cShellBackgroundImageURL": "",
      "cShellBackgroundImagePosition": "",
      "cShellBackgroundImageRepeat": "",
      "cShellBackgroundImageSize": "",
      "cShellBackgroundColor": "",

      "ImageURL": "",
      "ImageAlternates": "",
      
      "cPrimary": "#0aabf2",
      "cSecondary": "",
      "cTertiary": "",
      "cAccent1": "",
      "cAccent2": "",
      "cAction1": "",
      "cAction2": "",
      "cAction3": "",
      "cAction4": "",
      "cNoAction": "",
      "cPrimaryText": "",
      "cText1": "",
      "cText2": ""
    }
    for (var n in oDefaults) {
      if (g_oPageOptions[n] == undefined)
        g_oPageOptions[n] = oDefaults[n];
    }
  }

  function getGameDisplay(cName) {
    if (cName)
      return g_oGamesDisplay[cName];

    return g_oGamesDisplay;
  }