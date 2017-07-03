//----GLOBALS-------------------
  var g_oControlData = null;
  var g_aShellStockImgs = [
      {PreviewURL:"https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Resources/assets/Abstract_Digital_01_Thumb.jpg",Label:"Abstract Digital 01",ImgURL:"https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Resources/assets/Abstract_Digital_01.jpg"},
      {PreviewURL:"https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Resources/assets/Abstract_Digital_02_Thumb.jpg",Label:"Abstract Digital 02",ImgURL:"https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Resources/assets/Abstract_Digital_02.jpg"},
      {PreviewURL:"https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Resources/assets/Abstract_Digital_03_Thumb.jpg",Label:"Abstract Digital 03",ImgURL:"https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Resources/assets/Abstract_Digital_03.jpg"}
    ];  
//----END-----------------------

//----LOCAL---------------------
  function xpr_SpaceEditorInit(oControlData){
    g_oControlData = oControlData;

    // init any missing defaults
    if(parent.IsMultiLanguage()){g_oControlData.bIsMultiLanguage = true;}else{g_oControlData.bIsMultiLanguage = false;}
    EX_SpaceEditorInitDefaults();

    // Build Page
      xDOM(".WorkArea").addClass('clear')
      g_oBackgroundEditorOptions.Build("Background Options");
      
      g_oContainer = xDOM("<div>")
        .addClass("LeftBox")
        .appendToElem(g_oContainer)
        .returnElement();

      xpr_StartOptionSection("Page Display Options");
        xDOM(g_oContainer).addClass("Box1");
        
        g_oContainer = xDOM("<div>")
          .addClass("DisplayOptions")
          .appendToElem(".Box1")
          .returnElement();

        ge_CreateInfoSection(g_cHelpHTML.PageOptions);

        ge_CreateImageURLControl("Header Image","EX_ImageURL",80,300,g_oControlData.ImageURL);
        ge_LanguageAlternates("EX_ImageURL","EX_ImageURLAlternates",g_oControlData.ImageAlternates); 

        xpr_CreateCheckControl("Include Overall Leaderboard", "EX_IncludeOverall", 1, g_oControlData.IncludeOverall);
      xpr_EndOptionSection();

      g_oContainer = xDOM("<div>")
        .addClass("RightBox clear")
        .appendToElem(g_oContainer)
        .returnElement();

      ColorEditorObject({
        ID: "Global",
        Title: "Page Color Options",
        Class: "NoMargin",
        Data: xDOM.cloneObject({}, g_oControlData),
        Container: g_oContainer
      }).Build();
      g_oGameEditorObject.Build("Configure Game Options");
    //END
  }

  function EX_SpaceEditorInitDefaults(){
    if (!g_oControlData)
      g_oControlData = new Object();

    var oDefaults = {
      // Page Options
        "cShellBackgroundImageURL": "",
        "cShellBackgroundImagePosition": "",
        "cShellBackgroundImageRepeat": "",
        "cShellBackgroundImageSize": "",
        "cShellBackgroundColor": "",
        "ImageURL": "",
        "ImageAlternates": "",

      "IncludeOverall": 1,

      // Color Options
        "cPrimary": "#0aabf2",
        "cSecondary": "",
        "cTertiary": "",
        "cAccent1": "",
        "cAccent2": "",
        "cAction1": "",
        "cAction2": "",
        "cAction3": "",
        "cAction4": "",
        "cAction5": "",
        "cNoAction": "",
        "cPrimaryText": "",
        "cText1": "",
        "cText2": ""
    }

    for (var n in oDefaults){
      if (g_oControlData[n] == undefined)
        g_oControlData[n] = oDefaults[n];
    }
  }
  
  function xpr_SpaceEditorSave(){
    var bRetval = true;
    g_oControlData.ImageURL = xDOM("#EX_ImageURL").Val();
    g_oControlData.ImageAlternates = xDOM("#EX_ImageURLAlternates").Val();

    g_oControlData.IncludeOverall = (xDOM("#EX_IncludeOverall").isChecked() ? 1 : 0);
    
    var oColorSaveData = ColorEditorObject('Global').Save();
    for (var n in oColorSaveData)
      g_oControlData[n] = oColorSaveData[n];
    
    var oBackgroundSaveData = g_oBackgroundEditorOptions.Save();
    for (var n in oBackgroundSaveData)
      g_oControlData[n] = oBackgroundSaveData[n];
    
    var oGameSaveData = g_oGameEditorObject.Save();
    if (!oGameSaveData){
      parent.DisablePage("Changes weren't saved...","/cfr/images/1x1.gif");
      setTimeout(parent.EnablePage, 1000);
      return false;
    }
    return bRetval;
  } 
//----END-----------------------

//----LOAD SCRIPTS--------------
  LoadScripts([
    {url: "https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Global/css/GlobalEditor.css", type: "css"},
    {url: "/cfr/scripts/PopupWidgets.js", type: "js"},
    {url: "https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Global/js/DOMObject.js", type: "js"},
    {url: "https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Global/js/DateObject.js", type: "js"},
    {url: "https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Global/js/GlobalEditor.js", type: "js"},
    {url: "https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Global/js/ColorObject.js", type: "js"},
    {url: "https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Global/js/ColorEditorObject.js", type: "js"},
    {url: "https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Global/js/BackgroundEditorOptions.js", type: "js"},
    {url: "https://"+g_cContentServerAddress+"/customvts/VXP/Reflow/Games/js/GameEditorObject.js", type: "js"}
  ],Init);
  
  function LoadScripts(array,onComplete){
    function getFileName(path) {
      return path.match(/[-_\w]+[.][\w]+$/i)[0];
    }
    
    var head = document.getElementsByTagName("head")[0];
    var aCurrent = [], oHeadElem;
    for(var i = 0, ii = head.childNodes.length; i < ii; i++){
      oHeadElem = head.childNodes[i];
      if(oHeadElem.nodeName.toUpperCase() == "LINK") if(oHeadElem.href) aCurrent.push(getFileName(oHeadElem.href));
      if(oHeadElem.nodeName.toUpperCase() == "SCRIPT") if(oHeadElem.src) aCurrent.push(getFileName(oHeadElem.src));
    }
    var loader = function(url,type,handler){
      var fileref = null;
      var cFile = getFileName(url);
      if(aCurrent.indexOf(cFile) == -1){
        switch(type){
          case "js": 
            fileref = document.createElement("script");
            fileref.setAttribute("type","text/javascript");
            fileref.setAttribute("src",url);          
            fileref.onload = fileref.onreadystatechange = function(){
              if(!this.readyState || this.readyState == "loaded" || this.readyState == "complete"){
                fileref.onreadystatechange = fileref.onload = null;
                handler();
              }
            };  
            var head = document.getElementsByTagName("head")[0];
            (head || document.body).appendChild( fileref );
            
          break;
          case "css":           
            var fileref=document.createElement("link");
            fileref.setAttribute("rel", "stylesheet");
            fileref.setAttribute("type", "text/css");
            fileref.setAttribute("href", url);          
            var head = document.getElementsByTagName("head")[0];
            (head || document.body).appendChild( fileref );         
            
            var oIMG = new Image();
            AddEventHandler(oIMG,"error",handler);
            oIMG.src = url;
          break;
        }
      }else{
        handler();
      };
    };    
    (function(){
      if(array.length!=0){
        var aArray = array.shift();
        loader(aArray.url,aArray.type,arguments.callee);
      }else{
        if(onComplete) onComplete();
      }
    })();
  };
//----END-----------------------