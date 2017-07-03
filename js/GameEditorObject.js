   "use strict";
  // ---- GLOBAL VARIABLES -----------------------------
    var g_iRandomNumber = 10,
      g_aGameKeys = [],
      g_aGameDefKeys = [],
      g_cDateFmtMask = "M/D/Y";
  // ---- END ------------------------------------------

  // ---- HELP POPUPS ----------------------------------
    g_oHelp.GameEditorOptions = {Title: "", Copy: "", Link: ""}    
  // ---- END ------------------------------------------

  // ---- HELP HTML ------------------------------------
    g_cHelpHTML.GameEditorOptions = "This is meant to help users build their Games space!";
  // ---- END ------------------------------------------

  // ---- EDITOR BUILD OBJECT --------------------------
    (function(_window){
      var EO = {
        Items: {},
        Public: {},
        init: function(arg){
          var oObj = {};
          if (typeof arg === "string"){
            oObj.ID = arg;
            if (arg == "ALL"){
              return EO;
            }
          }
          else
            oObj = arg;

          if(EO.Items[oObj.ID] == undefined){
            EO.Items[oObj.ID] = new EO.Object(oObj);
          }

          return EO.Items[oObj.ID];
        },
        Object: function(oObj){
          this.ID = oObj.ID;
          for (var n in EO.Public)
            this[n] = EO.Public[n];
          this.Extend = function(oObj){
            for (var n in oObj)
              this[n] = oObj[n];
          }
        },
        Extend: function (){
          var oObj = arguments[0] || {};
          for(var n in oObj)
            this.Public[n] = oObj[n];  
        },
        GetFiles: function(aTypeList){
          var aFiles = [],
            oItems = this.Items;

          for (var n in oItems){
            if (aTypeList.indexOf(n) > -1){
              oItems[n].FilesLoaded = true;
              for(var i = 0, ii = oItems[n].Files.length; i < ii; i++)
                aFiles.push(oItems[n].Files[i]);
            }
          }

          return aFiles;
        }
      }
      // Configure
      EO.Extend({
        DisplaySectionBox: 0
      });
      // Defualts
      EO.Extend({
        Include: 1,
        Help:"",
        TabFeatureKey:3,
        FilesLoaded:false,
        Files:[],
        Defaults: function (){},
        Format: function (){},
        Build: function (){},
        Validate: function (){return 1;},
        Apply: function (){return {};},
        Save: function (){},
        Options: function(){return null;},
        Params: function (){return "";}
      });
      // Validation
      EO.Extend({
        ClearError: function (iEditorKey){
          xDOM("#Game"+iEditorKey+" .InError").removeClass("InError");
          xDOM("#Game"+iEditorKey).removeClass("InError");
          xDOM("#Game"+iEditorKey+" .ErrorMessage").HTML("");
        },
        InError: function (xField, cMessage, cClass){
          xField.addClass("InError");
          xField.parents(".GameEdit").addClass("InError");
          xField.parents(".Row.Game.ItemHolder").addClass("InError");
          var oErrorMessage = xField.parents(".Row.Game.ItemHolder").find(".ErrorMessage").returnElement();
          if (!xDOM(oErrorMessage).find("."+cClass).count()){
            xDOM("<div>")
              .addClass("ErrorItem "+cClass)
              .HTML(cMessage)
              .appendToElem(oErrorMessage);
          }
        },
        CheckTitle: function (xField, iIndex){}
      });      
      // Handlers
      EO.Extend({
        OnChange: function (evt){
          if (evt){
            var oEvent = new EventObj(evt),
              oRowElem = xDOM.FindElem(oEvent.srcElement, "data-row-key"),
              iRowKey = xDOM(oRowElem).getAttr("data-row-key"),
              oColumnElem = xDOM.FindElem(oEvent.srcElement, "data-column-key"),
              iColumnKey = xDOM(oColumnElem).getAttr("data-column-key");          

            ColumnObject("Column"+iColumnKey).Update("Modified", 1)
            xDOM("#Column"+iColumnKey).setAttr("data-modified", 1);
            xpr_SetModified();
          }
        },
        OnChangeText: function(evt){
          this.OnChange(evt);
        },
        OnChangeTitle: function(evt){
          this.OnChange(evt);
          if (evt){
            var oEvent = new EventObj(evt),
              oRowElem = xDOM.FindElem(oEvent.srcElement, "data-row-key"),
              iRowKey = xDOM(oRowElem).getAttr("data-row-key"),
              oColumnElem = xDOM.FindElem(oEvent.srcElement, "data-column-key"),
              iColumnKey = xDOM(oColumnElem).getAttr("data-column-key"),
              cValue = xDOM(oEvent.srcElement).Val(); 

            ColumnObject("Column"+iColumnKey).Update("TabTitle", cValue)
          }
        },
        OnChangeWidth: function(evt){
          this.OnChange(evt);
        },
        OnChangeActive: function(evt){
          this.OnChange(evt);
          if (evt){
            var oEvent = new EventObj(evt),
              oRowElem = xDOM.FindElem(oEvent.srcElement, "data-row-key"),
              iRowKey = xDOM(oRowElem).getAttr("data-row-key"),
              oColumnElem = xDOM.FindElem(oEvent.srcElement, "data-column-key"),
              iColumnKey = xDOM(oColumnElem).getAttr("data-column-key"),
              cValue = (xDOM(oEvent.srcElement).isChecked() ? 1 : 0);

            ColumnObject("Column"+iColumnKey).Update("Active", cValue)
          }
        },
        OnChangeDisplayTitle: function(evt){
          this.OnChange(evt);
          if (evt){
            var oEvent = new EventObj(evt),
              oRowElem = xDOM.FindElem(oEvent.srcElement, "data-row-key"),
              iRowKey = xDOM(oRowElem).getAttr("data-row-key"),
              oColumnElem = xDOM.FindElem(oEvent.srcElement, "data-column-key"),
              iColumnKey = xDOM(oColumnElem).getAttr("data-column-key"),
              cValue = (xDOM(oEvent.srcElement).isChecked() ? 1 : 0); 

            ColumnObject("Column"+iColumnKey).Update("DisplayTitle", cValue)
          }
        },
        OnChangeType: function (evt){
          this.OnChange(evt);
          if (evt){   
            var oEvent = new EventObj(evt),
              oRowElem = xDOM.FindElem(oEvent.srcElement, "data-row-key"),
              iRowKey = xDOM(oRowElem).getAttr("data-row-key"),
              oColumnElem = xDOM.FindElem(oEvent.srcElement, "data-column-key"),
              iColumnKey = xDOM(oColumnElem).getAttr("data-column-key"),
              cValue = xDOM(oEvent.srcElement).Val();    
            ColumnObject("Column"+iColumnKey).Update("Type", cValue)      

            if (EditorObject(cValue).FilesLoaded){
              g_oContainer = xDOM("#Row"+iRowKey+" .ColumnEdit[data-column-key='"+iColumnKey+"'] .EditSection")
                .HTML("")
                .returnElement();
              EditorObject(cValue).Build();
            }
            else{
              LoadScripts(EditorObject(cValue).Files, function(){                
                g_oContainer = xDOM("#Row"+iRowKey+" .ColumnEdit[data-column-key='"+iColumnKey+"'] .EditSection")
                  .HTML("")
                  .returnElement();
                EditorObject(cValue).Build();
              });
            }
          }
        }
      });

      _window.EditorObject = EO.init;
    })(window);
  // ---- END ------------------------------------------

  // ---- GAME DATA OBJECT -----------------------------
    (function(_window){
      var GO = {
        Items: {},
        Public: {},
        init: function(arg,arg2){
          var oObj = {};
          if (typeof arg === "string"){
            oObj.ID = arg;
            if (arg == "Array"){
              var aRetVal = [];
              for (var n in GO.Items){
                if (GO.Items[n].Deleted == 0){
                  if (!arg2)
                    aRetVal.push(GO.Items[n])
                  else
                    aRetVal.push(GO.Items[n][arg2])
                }
              }
              return aRetVal;
            }
            if (arg == "Deleted"){
              var aRetVal = [];
              for (var n in GO.Items){
                if (GO.Items[n].Deleted == 1 && GO.Items[n].BoothFeatureKey)
                  aRetVal.push(GO.Items[n])
              }
              return aRetVal;
            }
          }
          else if (typeof arg === "object")
            oObj = arg;
          else if (typeof arg === "undefined")
            return GO.Items;
          else
            return null;

          if(GO.Items[oObj.ID] == undefined){
            GO.Items[oObj.ID] = new GO.Object(oObj);
          }

          return GO.Items[oObj.ID];
        },
        Object: function(oObj){
          this.ID = oObj.ID;
          this.EditorKey = oObj.EditorKey; 

          this.GameKey = (oObj.GameKey ? oObj.GameKey : 0);
          this.GameDefKey = (oObj.GameDefKey ? oObj.GameDefKey : 0);
          this.GameDefTitle = (oObj.GameDefTitle ? oObj.GameDefTitle : "");
          this.GameType = (oObj.GameType ? oObj.GameType : "Trivia");
          this.GameTemplateURL = (oObj.GameTemplateURL ? oObj.GameTemplateURL : "https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Games/templates/trivia.html");
          this.Deleted = 0;
          this.Added = oObj.Added;

          var cDefaultTitle = "New Game";
          if (typeof oObj.TabTitle == 'undefined'){
            var iIndex = 0;
            function TestString(cTitle){
              var aTitles = GO.init("Array",'TabTitle'),
                cNewTitle = cTitle;
              while(aTitles.indexOf(cNewTitle) != -1){
                iIndex++;
                cNewTitle = cTitle+"-"+iIndex
              }
              return cNewTitle;
            }
            cDefaultTitle = TestString(cDefaultTitle);
          }
          var iDefaultOrder = 0;
          if (typeof oObj.DisplayOrder == 'undefined'){
            iDefaultOrder = GO.init("Array").length;
          }

          this.BoothFeatureKey = ((oObj.BoothFeatureKey) ? oObj.BoothFeatureKey : 0);
          this.Active = ((oObj.Active != undefined) ? oObj.Active : 1);
          this.TabTitle = ((oObj.TabTitle) ? oObj.TabTitle : cDefaultTitle);
          this.DisplayOrder = ((oObj.DisplayOrder) ? oObj.DisplayOrder : iDefaultOrder);

          this.GameReplay = ((oObj.GameReplay != undefined) ? oObj.GameReplay : 1);
          this.GameLogoImageURL = ((oObj.GameLogoImageURL) ? oObj.GameLogoImageURL : 'https://'+g_cContentServerAddress+'/customvts/VXP/Reflow/Games/assets/TriviaChallengeLogoTile.png');
          this.GameIncludeLeaderboard = ((oObj.GameIncludeLeaderboard != undefined) ? oObj.GameIncludeLeaderboard : 1);
          this.GameWelcomeImageURL = ((oObj.GameWelcomeImageURL) ? oObj.GameWelcomeImageURL : 'https://'+g_cContentServerAddress+'/customvts/VXP/Reflow/Games/assets/TriviaChallengeBackground.png');
          this.GameIntroVideoURL = ((oObj.GameIntroVideoURL) ? oObj.GameIntroVideoURL : '');
          this.GameData = ((oObj.GameData) ? oObj.GameData : {});

          for (var n in GO.Public)
            this[n] = GO.Public[n];
        },
        Extend: function (){
          var oObj = arguments[0] || {};
          for(var n in oObj)
            this.Public[n] = oObj[n];  
        }
      }
      // Defualts
      GO.Extend({
        Update: function(cParam, cValue){this[cParam] = cValue; return this;},
        Get: function(cParam){return this[cParam];},
        FormatParams: function(){
          var cParams = "";
          cParams += "&TabFeatureKey=3";
          cParams += "&Param1="+this.GameType+"|"+this.GameDefKey+"|"+this.GameKey;
          cParams += "&Param2="+this.GameReplay+"|"+URLEncode(this.GameLogoImageURL);
          cParams += "&Param3="+URLEncode(this.GameTemplateURL);
          cParams += "&Param4="+this.GameIncludeLeaderboard+"|"+URLEncode(this.GameWelcomeImageURL);
          cParams += "&Param5="+URLEncode(this.GameIntroVideoURL);
          cParams += "&Param6="+JSONEncode(this.GameData);

          return cParams;
        },
        SetDates: function(dFromDateTime, dToDateTime){ 
          function setHours(iHours){
            var cAMPM = 'AM'; 
            if (iHours >= 12){
              iHours = iHours-12;
              cAMPM = 'PM';
            }
            
            if (iHours == 0){
              iHours = 12;
            }
            return {Hours: iHours, AMPM: cAMPM};
          }

          var oFrom = setHours(dFromDateTime.getHours()),
            oTo = setHours(dToDateTime.getHours());

          this.FromDate = xDOM.AddLeadingZero(dFromDateTime.getMonth()+1)+"/"+xDOM.AddLeadingZero(dFromDateTime.getDate())+"/"+dFromDateTime.getFullYear();
          this.FromHours = oFrom.Hours;
          this.FromMinutes = xDOM.AddLeadingZero(dFromDateTime.getMinutes());
          this.FromAMPM = oFrom.AMPM;
          this.ToDate = xDOM.AddLeadingZero(dToDateTime.getMonth()+1)+"/"+xDOM.AddLeadingZero(dToDateTime.getDate())+"/"+dToDateTime.getFullYear();
          this.ToHours = oTo.Hours;
          this.ToMinutes = xDOM.AddLeadingZero(dToDateTime.getMinutes());
          this.ToAMPM = oTo.AMPM;
        },
        getFromObject: function(){
          return DatesObject.Parse('MM/DD/YYYY hh:mmA', this.FromDate+" "+this.FromHours+":"+this.FromMinutes+""+this.FromAMPM);
        },
        getToObject: function(){
          return DatesObject.Parse('MM/DD/YYYY hh:mmA', this.ToDate+" "+this.ToHours+":"+this.ToMinutes+""+this.ToAMPM);
        }
      });

      _window.GameObject = GO.init;
    })(window);
  // ---- END ------------------------------------------

  // ---- MAIN EDITOR ----------------------------------
    var g_oGameEditorObject = EditorObject("Main");
    g_oGameEditorObject.Extend({
      initDefaults: function (){
        this.CheckSecurity();
        this.GetGameDefKeys();
        this.GetGameKeys();
      },
      Build: function (cTitle, cClass){
        this.initDefaults();

        g_oContainer = xDOM("<div>")
          .addClass("InlineBox")
          .appendToElem(g_oContainer)
          .returnElement();

        xpr_StartOptionSection(cTitle);
          if (cClass)
            xDOM(g_oContainer).addClass(cClass);
          xDOM(g_oContainer).addClass("GameOptions");

          this.BuildControls();
        xpr_EndOptionSection();
      },
      Save: function (){
        var bSuccess = this.BuildSave();
        return bSuccess;
      }
    });
    // Controls
    g_oGameEditorObject.Extend({
      BuildControls: function (oLocals){
        var aTabData = this.GetTabs();
        if (aTabData){
          for (var i = 0, ii = aTabData.length; i < ii; i++){
            var iEditorKey = xDOM.getRandomNumber(g_iRandomNumber);
            var oTabdata = aTabData[i],
              cGameKey = oTabdata.Param1.split('|')[2],
              cGameDefKey = oTabdata.Param1.split('|')[1],
              bAdded = 0;

            var oGame = xDOM.FindMatchObject(cGameKey, 'GameKey', g_aGameKeys);
            if (!oGame){
              cGameKey = 0;
              cGameDefKey = 0;
            }

            var oGameData = GameObject({
              ID: "Game"+iEditorKey,
              EditorKey: iEditorKey,
              GameTemplateURL: oTabdata.Param3,
              GameKey: cGameKey,
              GameDefKey: cGameDefKey,
              GameDefTitle: '',
              GameType: oTabdata.Param1.split('|')[0],
              BoothFeatureKey: oTabdata.BoothFeatureKey,
              Active: oTabdata.Active,
              TabTitle: oTabdata.TabTitle,
              DisplayOrder: oTabdata.DisplayOrder,
              GameReplay: parseInt(oTabdata.Param2.split('|')[0]),
              GameLogoImageURL: oTabdata.Param2.split('|')[1],
              GameIncludeLeaderboard: parseInt(oTabdata.Param4.split('|')[0]),
              GameWelcomeImageURL: oTabdata.Param4.split('|')[1],
              GameIntroVideoURL: oTabdata.Param5.split('|')[0],
              GameData: InxpoAJAXEvalJSON((oTabdata.Param6 ? oTabdata.Param6 : '{}')),
              Added: bAdded
            });

            if (oGame){
              var dFromDateTime = DatesObject.Parse('YYYY-MM-DD hh:mm:ss', oGame.FromDateTime),
                dToDateTime = DatesObject.Parse('YYYY-MM-DD hh:mm:ss', oGame.ToDateTime);

              oGameData.SetDates(dFromDateTime, dToDateTime);
            }
            else{
              var oDefaultDates = DefaultDate();
              oGameData.SetDates(oDefaultDates.FromDate, oDefaultDates.ToDate);
            }
          }
        }

        // Create HTML
          g_oContainer = xDOM(".GameOptions").returnElement();
          ge_CreateInfoSection(g_cHelpHTML.GameEditorOptions);
          xDOM("<div>")
            .addClass("BuildArea Rows Games")
            .appendToElem(g_oContainer);

          xDOM("<div>")
            .addClass("Button AddNew")
            .HTML("Add New Game")
            .appendToElem(g_oContainer)
            .addEvent("click", this.AddRow.bind(this));

          g_oContainer = xDOM(".GameOptions").returnElement();
          this.CreateRows(); 
      },
      CreateRows: function(bOrder, iOldIndex, iNewIndex){
        var aData = GameObject("Array");
        if (bOrder){
          var aObjs = aData.splice(iOldIndex, 1);
          aData.splice(iNewIndex, 0, aObjs[0]);
        }
        xDOM(".Row").removeFromElem();
        for (var i = 0, ii = aData.length; i < ii; i++){
          GameObject(aData[i].ID).Update("DisplayOrder", i);
          this.CreateRow(aData[i].ID);
        }
      },
      CreateRow: function (cGameID, iNewGameKey){
        var oData = GameObject(cGameID);

        if (iNewGameKey)
          xDOM(".Row").replaceClass("Open", "Closed");

        if (xDOM.isEmptyObject(oData))
          return false;

        xDOM("<div>")
          .setAttr({"id": oData.ID, 'data-editor-key': oData.EditorKey})
          .addClass("Row Game ItemHolder Closed")
          .appendToElem(".BuildArea.Games");

        xDOM("<div>")
          .setClass("HeaderRow")
          .appendToElem(xDOM.AddHash(oData.ID));

        xDOM("<span>")
          .HTML(oData.DisplayOrder)
          .setClass("ListNumber Text")
          .appendToElem(xDOM.AddHash(oData.ID)+" .HeaderRow");

        xDOM("<span>")
          .HTML(oData.TabTitle)
          .setClass("Title Text")
          .appendToElem(xDOM.AddHash(oData.ID)+" .HeaderRow");

        xDOM("<div>")
          .HTML("Modify")
          .setClass("Button Modify")
          .addEvent("click", this.Edit.bind(this))
          .appendToElem(xDOM.AddHash(oData.ID)+" .HeaderRow");

        xDOM("<div>")
          .HTML("Apply")
          .setClass("Button Apply")
          .addEvent("click", this.Apply.bind(this))
          .appendToElem(xDOM.AddHash(oData.ID)+" .HeaderRow");

        xDOM("<div>")
          .HTML("Delete")
          .setClass("Button Delete")
          .addEvent("click", this.Delete.bind(this))
          .appendToElem(xDOM.AddHash(oData.ID)+" .HeaderRow");

        xDOM("<div>")
          .setClass("ErrorMessage")
          .appendToElem(xDOM.AddHash(oData.ID));

        xDOM("<div>")
          .setClass("GameEdit clear")
          .appendToElem(xDOM.AddHash(oData.ID));

        if (iNewGameKey)
          this.Edit(null, iNewGameKey);
      },
      CreateGameEdit: function(iEditorKey){
        var cGameID = "Game"+iEditorKey,
          oData = GameObject(cGameID);

        g_oContainer = xDOM(xDOM.AddHash(cGameID)+" .GameEdit").HTML("").returnElement();

        ge_CreateHiddenControl("EX_GameKey", oData.GameKey.toString());
        ge_CreateHiddenControl("EX_GameDefKey", oData.GameDefKey.toString());
        ge_CreateHiddenControl("EX_GameType", oData.GameType);
        ge_CreateHiddenControl("EX_GameTemplateURL", oData.GameTemplateURL);

        g_oContainer = xDOM("<div>")
          .addClass("InnerLeftBox")
          .appendToElem(xDOM.AddHash(cGameID)+" .GameEdit")
          .returnElement();

        xpr_StartOptionSection("General Game Options");
          ge_CreateSingleCheckbox("Active", "EX_Active", parseInt(oData.Active), null);
          xpr_CreateIntegerControl("Order", "EX_DisplayOrder", 4, 4, oData.DisplayOrder.toString(), null);
          xpr_CreateTextControl("Game Title", "EX_TabTitle", 20, 80, oData.TabTitle, null);
          ge_LanguageAlternates(
            xDOM.AddHash(cGameID)+" .GameEdit #EX_TabTitle", 
            "EX_TabTitle_NameAlternates", 
            "", 
            oData.BoothFeatureKey, 
            1,
            null,
            xDOM.AddHash(cGameID)+" .GameEdit"
          );
          xpr_CreateCheckControl("Enable Game Replay", "EX_GameReplay", 1, oData.GameReplay, null);
          xpr_CreateCheckControl("Include Game Leaderboard", "EX_GameIncludeLeaderboard", 1, oData.GameIncludeLeaderboard, null);
        xpr_EndOptionSection();

        g_oContainer = xDOM("<div>")
          .addClass("InnerRightBox clear")
          .appendToElem(xDOM.AddHash(cGameID)+" .GameEdit")
          .returnElement();

        xpr_StartOptionSection("Game Asset Options");
          ge_CreateImageURLControl("Logo Image URL", "EX_GameLogoImageURL", 80, 300, oData.GameLogoImageURL, null);
          ge_CreateImageURLControl("Welcome Image URL", "EX_GameWelcomeImageURL", 80, 300, oData.GameWelcomeImageURL, null);
          ge_CreateImageURLControl("Intro Video URL", "EX_GameIntroVideoURL", 80, 300, oData.GameIntroVideoURL, null);
        xpr_EndOptionSection();

        xDOM("<div>").addClass('clear').appendToElem(xDOM.AddHash(cGameID)+" .GameEdit");
        g_oContainer = xDOM("<div>")
          .addClass("InnerLeftBox")
          .appendToElem(xDOM.AddHash(cGameID)+" .GameEdit")
          .returnElement();

        xpr_StartOptionSection("Game Date Options");
          ge_CreateInfoSection("Important: All times must be entered in CT.");
          ge_CreateDateSection('From Dates','EX_From', oData.getFromObject());
          ge_CreateDateSection('To Dates','EX_To', oData.getToObject());
        xpr_EndOptionSection();

        g_oContainer = xDOM("<div>")
          .addClass("InnerRightBox clear")
          .appendToElem(xDOM.AddHash(cGameID)+" .GameEdit")
          .returnElement();

        xpr_StartOptionSection("Reset Game Activity");
          ge_CreateInfoSection("Important: Clicking button will remove all game activity data.");
          xDOM("<div>")
            .setAttr('id', 'Activity'+iEditorKey)
            .appendToElem(g_oContainer);

          var oPara = xpr_CreateFieldBox();
          xDOM(oPara).CSS("margin", "15px 0");
          xDOM("<span>")
            .addClass('Button')
            .HTML("Reset Game Activity")
            .addEvent('click', this.Reset.bind(this))
            .appendToElem(oPara);
        xpr_EndOptionSection();

        g_oContainer = xDOM(xDOM.AddHash(cGameID)+" .GameEdit").returnElement();
        xDOM("<div>")
          .addClass("GameBuildArea InlineBox")
          .appendToElem(g_oContainer);

        this.LoadTemplate(null, oData.GameTemplateURL, iEditorKey);
      },
      TemplateSelect: function(evt){
        if (evt){
          var oEvent = new EventObj(evt),
            oEditorElem = xDOM.FindElem(oEvent.srcElement, "data-editor-key"),
            iEditorKey = xDOM(oEditorElem).getAttr("data-editor-key"),
            xURLElem = xDOM(oEditorElem).find(".GameTemplateURL"),
            oSelectElem = xDOM(oEditorElem).find("#EX_GameSelect").returnElement();

          xDOM(oEditorElem).find(".GameBuildArea").HTML("");

          g_oContainer = xDOM(xURLElem).returnElement();
          xURLElem.HTML("");
          if (oSelectElem.selectedIndex == 0){
            var oInput = ge_CreateURLPageBrowserControl("Custom Game Template URL", "EX_GameTemplateURL", 50, 200, '');
            xDOM('<span>')
              .addClass("LoadGameTemplate")
              .HTML("Load Game Template")
              .addEvent('click',this.LoadTemplate.bind(this))
              .appendToElem(oInput.parentNode);
          }
          else{
            ge_CreateHiddenControl("EX_GameTemplateURL", xDOM(oSelectElem).Val());
            this.LoadTemplate(null, xDOM(oSelectElem).Val(), iEditorKey);
          }
        }
      },
      LoadTemplate: function(evt, cURL, iEditorKey){
        var cTemplateURL = "", cEditArea = "", cGameEditArea = "";
        if (evt){
          var oEvent = new EventObj(evt),
            oEditorElem = xDOM.FindElem(oEvent.srcElement, "data-editor-key");
          
          iEditorKey = xDOM(oEditorElem).getAttr("data-editor-key")
          cURL = xDOM(oEditorElem).find("#EX_GameTemplateURL").Val()
        }
        
        if (cURL)
          cTemplateURL = cURL;

        if (iEditorKey){
          var cGameID = "Game"+iEditorKey;
          cEditArea = xDOM.AddHash(cGameID)+" .GameEdit";
          cGameEditArea = xDOM.AddHash(cGameID)+" .GameEdit .GameBuildArea";
        }

        if (cTemplateURL){ 
          g_oAjax.Abort();
          g_oAjax.OnComplete = null;
          g_oAjax.SendSyncRequest("GET",cTemplateURL,"");
          var cRaw = /<!--[^]*-->/gm.exec(g_oAjax.m_oXMLHTTPReqObj.responseText);
          var cCode = StringReplace(cRaw[0], "<!--", "");
          cCode = StringReplace(cCode, "-->", "");
          g_oContainer = xDOM(cGameEditArea).HTML("").returnElement();
          
          // BUILD OBJECT
          var oTemplate = {};
          eval("oTemplate = "+cCode);
          oTemplate.Editor.Include = 0;
          EditorObject(oTemplate.ID).Extend(oTemplate.Editor);

          // BUILD DATA
          xDOM(cEditArea).find("#EX_GameType").Val(oTemplate.ID);
          // var cData = xDOM(cEditArea).find("#EX_TemplateJSON").Val(),
            // oData = (cData ? InxpoAJAXEvalJSON(cData) : null);
          
          var cGameID = "Game"+iEditorKey,
            oData = GameObject(cGameID).GameData;

          GameObject(cGameID).Update("GameDefTitle", oTemplate.GameDefTitle);
          var iGameDefKey = 0,
            oGameDef = xDOM.FindMatchObject(oTemplate.GameDefTitle, "Description", g_aGameDefKeys);

          if (oGameDef)
            iGameDefKey = oGameDef.GameDefKey;

          xDOM(cEditArea).find("#EX_GameDefKey").Val(iGameDefKey);

          // BUILD EDITOR
          EditorObject(oTemplate.ID).Build(oData, cGameID);
        }
      },      
      AutoApply: function (){
        if (xDOM(".Row.Open").count()){
          var iEditorKey = xDOM(".Row.Open").getAttr("data-editor-key");        
          return this.Apply(null, iEditorKey);
        }
        return true;
      },
      Validate: function(oEditorElem){
        var bRetval = 1,
          aGames = GameObject("Array"),
          iEditorKey = xDOM(oEditorElem).getAttr("data-editor-key"),
          cTabTitle = xDOM(oEditorElem).find("#EX_TabTitle").Val();

        for (var i = 0, ii = aGames.length; i < ii; i++){
          if (iEditorKey != aGames[i].EditorKey && cTabTitle == aGames[i].TabTitle && aGames[i].Deleted == 0){
            this.InError(xDOM(oEditorElem).find("#EX_TabTitle"), "The title entered must be unique. Please enter a new title.", "TitleError");
            bRetval = 0;
          }
        }

        if (xDOM(oEditorElem).find("#EX_GameLogoImageURL").Val() && !xDOM.IsImage(xDOM(oEditorElem).find("#EX_GameLogoImageURL").Val())){
          this.InError(xDOM(oEditorElem).find("#EX_GameLogoImageURL"), "The URL entered is not a Image. Please enter a new URL.", "ImageError");
          bRetval = 0;
        }

        if (!xDOM.IsImage(xDOM(oEditorElem).find("#EX_GameWelcomeImageURL").Val())){
          this.InError(xDOM(oEditorElem).find("#EX_GameWelcomeImageURL"), "The URL entered is not a Image. Please enter a new URL.", "ImageError");
          bRetval = 0;
        }

        if (xDOM(oEditorElem).find("#EX_GameIntroVideoURL").Val() && !xDOM.IsVideo(xDOM(oEditorElem).find("#EX_GameIntroVideoURL").Val())){
          this.InError(xDOM(oEditorElem).find("#EX_GameIntroVideoURL"), "The URL entered is not a Video. Please enter a new URL.", "ImageError");
          bRetval = 0;
        }

        if (!xDOM(oEditorElem).find("#EX_FromDate").Val()){
          this.InError(xDOM(oEditorElem).find("#EX_FromDate"), "From date is required.", "DateError");
          bRetval = 0;
        }

        if (!xDOM(oEditorElem).find("#EX_ToDate").Val()){
          this.InError(xDOM(oEditorElem).find("#EX_ToDate"), "To date is required.", "DateError");
          bRetval = 0;
        }

        var cType = xDOM(oEditorElem).find("#EX_GameType").Val();
        if (!EditorObject(cType).Validate(oEditorElem))
          bRetval = 0;

        return bRetval;
      },
      BuildSave: function(){
        if (this.AutoApply()){
          var aGameData = GameObject('Array'); 
                 
          for (var i = 0, ii = aGameData.length; i < ii; i++){
            var oGameData = aGameData[i];
            if (oGameData.GameDefKey == 0){
              oGameData.GameDefKey = this.CreateGameDef(oGameData.GameDefTitle);
            }
            if (oGameData.GameKey == 0)
              oGameData.GameKey = "NULL";
            
            oGameData.GameKey = this.CreateGame(oGameData);            
          }

          // return false;

          var aGameTabData = GameObject('Array');
          DebugMessage("Game Save Array", aGameTabData);
          for (var i = 0, ii = aGameTabData.length; i < ii; i++){
            var oGame = aGameTabData[i],
              cURL = this.TabSaveURL(oGame),
              cParams = oGame.FormatParams();

            DebugMessage("Tab Save URL", cURL+cParams);
            ge_SendSyncPost(cURL+cParams);
          }

          var aDeleteTabData = GameObject("Deleted");
          DebugMessage("Column Delete Array", aDeleteTabData);
          for (var i = 0, ii = aDeleteTabData.length; i < ii; i++){
            var oColumn = aDeleteTabData[i],
              cURL = this.TabDeleteURL(oColumn);

            DebugMessage("Tab Delete URL", cURL);
            ge_SendSyncPost(cURL);
          }
          return true;
        }
        else{
          return false;
        }
      }
    });
    // ButtonActions
    g_oGameEditorObject.Extend({
      AddRow: function (evt){
        if (this.AutoApply()){
          xpr_SetModified();  
          var iEditorKey = xDOM.getRandomNumber(g_iRandomNumber);

          var oGameData = GameObject({
            ID: "Game"+iEditorKey, 
            EditorKey: iEditorKey,
            GameKey: 0,
            Added: 1
          });

          var oDefaultDates = DefaultDate();
          oGameData.SetDates(oDefaultDates.FromDate, oDefaultDates.ToDate);

          this.CreateRow("Game"+iEditorKey, iEditorKey);
        }
      },
      Edit: function (evt, iEditorKey){
        var oEditorElem = null;
        if (evt){
          var oEvent = new EventObj(evt);

          oEditorElem = xDOM.FindElem(oEvent.srcElement, "data-editor-key");
          iEditorKey = xDOM(oEditorElem).getAttr("data-editor-key");
        }
        else{
          oEditorElem = xDOM("#Game"+iEditorKey);
        }

        if (!xDOM(oEditorElem).hasClass('Open')){
          if (this.AutoApply()){
            xDOM(".Row").replaceClass("Open", "Closed");
            xDOM("#Game"+iEditorKey).replaceClass("Closed", "Open");
            this.CreateGameEdit(iEditorKey);
          }
        }
        else{
          this.Apply(null, iEditorKey);
        }        
      },
      Apply: function (evt, iEditorKey){
        if (evt){
          var oEvent = new EventObj(evt),
            oEditorElem = xDOM.FindElem(oEvent.srcElement, "data-editor-key"),
            iEditorKey = xDOM(oEditorElem).getAttr("data-editor-key")
        }
        else{
          oEditorElem = xDOM("#Game"+iEditorKey).returnElement();
        }

        xpr_SetModified();

        this.ClearError(iEditorKey);

        if (this.Validate(oEditorElem)){
          var cEditorID = "Game"+iEditorKey,
            oObj = {
              Active: (xDOM(oEditorElem).find("#EX_Active").isChecked() ? 1 : 0),
              TabTitle: xDOM(oEditorElem).find("#EX_TabTitle").Val(),
              NameAlternates: xDOM(oEditorElem).find("#EX_TabTitle_NameAlternates").Val(),
              DisplayOrder: parseInt(xDOM(oEditorElem).find("#EX_DisplayOrder").Val()),
              GameKey: parseInt(xDOM(oEditorElem).find("#EX_GameKey").Val()),
              GameDefKey: parseInt(xDOM(oEditorElem).find("#EX_GameDefKey").Val()),
              GameType: xDOM(oEditorElem).find("#EX_GameType").Val(),
              GameReplay: (xDOM(oEditorElem).find("#EX_GameReplay").isChecked() ? 1 : 0),
              Active: (xDOM(oEditorElem).find("#EX_Active").isChecked() ? 1 : 0),
              GameIncludeLeaderboard: (xDOM(oEditorElem).find("#EX_GameIncludeLeaderboard").isChecked() ? 1 : 0),
              GameLogoImageURL: xDOM(oEditorElem).find("#EX_GameLogoImageURL").Val(),
              GameWelcomeImageURL: xDOM(oEditorElem).find("#EX_GameWelcomeImageURL").Val(),
              GameIntroVideoURL: xDOM(oEditorElem).find("#EX_GameIntroVideoURL").Val(),
              FromDate: FormatDate(xDOM(oEditorElem).find("#EX_FromDate").Val()),
              FromHours: xDOM(oEditorElem).find("#EX_FromHours").Val(),
              FromMinutes: xDOM(oEditorElem).find("#EX_FromMinutes").Val(),
              FromAMPM: xDOM(oEditorElem).find("#EX_FromAMPM").Val(),
              ToDate: FormatDate(xDOM(oEditorElem).find("#EX_ToDate").Val()),
              ToHours: xDOM(oEditorElem).find("#EX_ToHours").Val(),
              ToMinutes: xDOM(oEditorElem).find("#EX_ToMinutes").Val(),
              ToAMPM: xDOM(oEditorElem).find("#EX_ToAMPM").Val()              
            };

          oObj.GameData = EditorObject(oObj.GameType).Save(oEditorElem);

          for (var n in oObj)
            GameObject(cEditorID).Update(n, oObj[n]);

          this.CreateRows();
        }
        else
          return false;

        return true;
      },
      Delete: function (evt){
        if (evt){   
          var oEvent = new EventObj(evt),
            oEditorElem = xDOM.FindElem(oEvent.srcElement, "data-editor-key"),
            iEditorKey = xDOM(oEditorElem).getAttr("data-editor-key"),
            cGameID = "Game"+iEditorKey,
            oGame = GameObject(cGameID);        

          xpr_SetModified();
          xDOM(".Row").replaceClass("Open", "Closed");
          oGame.Update('Deleted',1);
          this.CreateRows();
        }
      },
      ConfirmDelete: function(evt){},
      Reset: function(evt){
        if (evt){
          var oEvent = new EventObj(evt),
            oEditorElem = xDOM.FindElem(oEvent.srcElement, "data-editor-key"),
            iEditorKey = xDOM(oEditorElem).getAttr("data-editor-key"),
            cGameID = "Game"+iEditorKey,
            oGame = GameObject(cGameID),
            cMessage = 'No Game Activity to Reset!';

          if (oGame.GameKey != 0){
            if (!confirm("Resetting game activity will delete all activity and scores.\nAre you sure?"))
              return;

            this.ResetGameActivity(oGame.GameKey);
            cMessage = 'Game Activity Reset Complete!'
          }

          xDOM("#Activity"+iEditorKey).HTML(cMessage);
        }
      }
    });
    // Tab Data
    g_oGameEditorObject.Extend({
      GetTabs: function(){
        var oResultSet = ge_GetAjaxCall(g_cLASFileName+"?LASCmd=AI:"+g_cInstanceID+";F:LBSEXPORT!JSON&SQLID=14515&BoothKey="+g_cSpaceKey);
          
        if (oResultSet && oResultSet[0].length){
          DebugMessage("Tab List", oResultSet[0]);
          return oResultSet[0];
        }
        return null;      
      },
      TabSaveURL: function(oData){
        var cURL = "LASCmd=AI:"+g_cInstanceID+";F:AP!20632"
          +"&RecordVisits=0"
          +"&Active="+oData.Active
          +"&AddMode="+(oData.Added ? 1 : 0)
          +"&DisplayOrder="+oData.DisplayOrder
          +"&BoothFeatureKey="+(oData.Added ? 0 : oData.BoothFeatureKey)
          +"&BoothKey="+g_cSpaceKey
          +"&TabTitle="+URLEncode(oData.TabTitle);

        if (oData.NameAlternates)
          cURL += "&NameAlternates="+URLEncode(oData.NameAlternates);

        return cURL;
      },
      TabDeleteURL: function(oData){
        var cURL = "LASCmd=AI:"+g_cInstanceID+";S:20634"
          +"&BoothFeatureKey="+oData.BoothFeatureKey
          +"&BoothKey="+g_cSpaceKey;
         
        return cURL;
      }
    });
    // Game Data
    g_oGameEditorObject.Extend({
      GetGameKeys: function(){
        var cURL = g_cLASFileName+"?LASCmd=AI:"+g_cInstanceID+";F:LBSEXPORT!JSON&SQLID=42220&ShowKey="+g_cShowKey;
        var oResponse = ge_GetAjaxCall(cURL);
        if (oResponse){
          var aGames = oResponse[0];
          for (var i = 0, ii = aGames.length; i < ii; i++){
            var oGame = aGames[i],
              oTemp = {};

            oTemp.Title = oGame.Title;
            oTemp.GameKey = oGame.GameKey;
            oTemp.FromDateTime = oGame.FromDateTime;
            oTemp.ToDateTime = oGame.ToDateTime;
            g_aGameKeys.push(oTemp);
          }
        }
      },
      CreateGame: function(oGameData){
        var cURL = "LASCmd=AI:"+g_cInstanceID+";F:LBSEXPORT!JSON&SQLID=42234"
          +"&UserID="+g_iUserID 
          +"&ShowKey="+g_cShowKey 
          +"&GameKey="+oGameData.GameKey 
          // +"&DeleteKeyTag=GameTeamKey"
          // +"&LanguageAlternates="
          +"&GameDefKey="+oGameData.GameDefKey
          +"&Title="+encodeURIComponent(oGameData.TabTitle+g_cSpaceKey) 
          +"&Active=1"
          +"&FromDate="+encodeURIComponent(oGameData.FromDate) 
          +"&FromTimeH="+oGameData.FromHours
          +"&FromTimeM="+oGameData.FromMinutes
          +"&FromTimeAMPM="+(oGameData.FromAMPM.indexOf("A") != -1 ? 0 : 1)
          +"&ToDate="+encodeURIComponent(oGameData.ToDate)
          +"&ToTimeH="+oGameData.ToHours
          +"&ToTimeM="+oGameData.ToMinutes
          +"&ToTimeAMPM="+(oGameData.ToAMPM.indexOf("A") != -1 ? 0 : 1)
          +"&LiveFromDate="+encodeURIComponent(oGameData.FromDate)
          +"&LiveFromTimeH="+oGameData.FromHours
          +"&LiveFromTimeM="+oGameData.FromMinutes
          +"&LiveFromTimeAMPM="+(oGameData.FromAMPM.indexOf("A") != -1 ? 0 : 1) 
          +"&LiveToDate="+encodeURIComponent(oGameData.ToDate)
          +"&LiveToTimeH="+oGameData.ToHours
          +"&LiveToTimeM="+oGameData.ToMinutes
          +"&LiveToTimeAMPM="+(oGameData.ToAMPM.indexOf("A") != -1 ? 0 : 1);

        var oResponse = ge_SendSyncPost(cURL);
        if (oResponse)
          return oResponse[0][0].GameKey;
      },
      GetGameDefKeys: function(){
        var cURL = g_cLASFileName+"?LASCmd=AI:"+g_cInstanceID+";F:LBSEXPORT!JSON&SQLID=42270";
        var oResponse = ge_GetAjaxCall(cURL);
        if (oResponse){
          var aGameDefs = oResponse[0];
          for (var i = 0, ii = aGameDefs.length; i < ii; i++){
            var oGameDef = aGameDefs[i],
              oTemp = {};

            oTemp.GameDefKey = oGameDef.GameDefKey;
            oTemp.Description = oGameDef.Description;
            g_aGameDefKeys.push(oTemp);
          }
        }
      },
      CreateGameDef: function(cGameTitle){
        var cURL = g_cLASFileName+"?LASCmd=AI:"+g_cInstanceID+";F:LBSEXPORT!JSON&SQLID=42273&GameDefKey=0&Description="+cGameTitle+"&GameURL=0";
        var oResponse = ge_GetAjaxCall(cURL);
        if (oResponse)
          return oResponse[0][0].GameDefKey;

        return 0;
      },
      CheckSecurity: function(){
        var cURL = g_cLASFileName+"?LASCmd=AI:"+g_cInstanceID+";F:LBSEXPORT!JSON&SQLID=42240&ShowKey="+g_cShowKey;
        var oResponse = ge_GetAjaxCall(cURL);
        if (!oResponse)
          this.SetSecurity();
      },
      SetSecurity: function(){
        var cURL = "LASCmd=AI:"+g_cInstanceID+";F:AP!42240&ShowKey="+g_cShowKey+"&GameKey=0&ExhibitorKey=0&ExhibitorTypeKey=0&ExhibitorUserTypeKey=0&ExhibitorUserKey=0&AttendeeTypeKey=0&AttendeeKey=0&CanAccess=1&GameSecurityKey=0";
        ge_SendSyncPost(cURL);
      },
      ResetGameActivity: function(iGameKey){
        var cURL = g_cLASFileName+"?LASCmd=AI:"+g_cInstanceID+";S:42239&GameKey="+iGameKey+"&ShowKey="+g_cShowKey;
        ge_GetAjaxCall(cURL);
      }
    });
  // ---- END ------------------------------------------

  // ---- LOCAL DATE FORMAT ----------------------------
    function FormatDate(cDate){
      return xDOM.AddLeadingZero(cDate.split('/')[0])+"/"+xDOM.AddLeadingZero(cDate.split('/')[1])+"/"+xDOM.AddLeadingZero(cDate.split('/')[2]);
    }
    function DefaultDate() {
      var cServerTime = new Date();
      var dFromDate = new Date(cServerTime);
      var cToDate = (Date.parse(cServerTime) + 7772400000);
      var dToDate = new Date(cToDate);
            
      return {FromDate: dFromDate, ToDate: dToDate};
    }
  // ---- END ------------------------------------------