//Transition definitions json for use with TangleUI
//references rectangle ids from SakriDotNetLayout.js
window.SakriDotNetTransitions = {
    /* LOADER */
    loaderTitleIn : {
        layoutRectId : "loaderTitle",
        from : "transitionFrom",
        to : "default",
        duration : 300
    },
    loaderTitleOut : {
        layoutRectId : "loaderTitle",
        from : "default",
        to : "transitionTo",
        duration : 300,
        xEase : UnitEasing.easeInSine,
        yEase : UnitEasing.easeOutSine
    },
    loaderPixelGuyIn : {
        layoutRectId : "loaderPixelGuy",
        from : "transitionFrom",
        to : "default",
        duration : 400
    },
    loaderLaptopOut : {
        layoutRectId : "loaderPixelGuy",
        from : "default",
        to : "laptopTo",
        duration : 300,
        xEase : UnitEasing.easeInSine,
        yEase : UnitEasing.easeOutSine
    },
    loaderButtrockOut : {
        layoutRectId : "loaderButtrock",
        from : "default",
        to : "transitionTo",
        duration : 500,
        xEase : UnitEasing.easeInSine,
        yEase : UnitEasing.easeOutSine
    },

    /* MENU (zoom card in / out) */

    /* BUTTONS ANIMATIONS ARE DYNAMIC*/

    /* TO STATS BUTTON */
    menuButtonIn : {
        layoutRectId : "menuButton",
        from : "transitionFrom",
        to : "default",
        duration : 600,
        easing : UnitEasing.easeOutSine
    },
    menuButtonOut : {
        layoutRectId : "menuButton",
        from : "default",
        to : "transitionFrom",
        duration : 400,
        easing : UnitEasing.easeInSine
    },
    progressButtonIn : {
        layoutRectId : "progressGraphic",
        from : "transitionFrom",
        to : "default",
        duration : 500,
        easing : UnitEasing.easeOutSine
    },
    progressButtonOut : {
        layoutRectId : "progressGraphic",
        from : "default",
        to : "transitionFrom",
        duration : 300,
        easing : UnitEasing.easeInSine
    },
    pixelGuyToStatsModule1 : {
        layoutRectId : "menuButtonAvatarCenter",
        from : "transitionFrom",/* calculated by component*/
        to : "default",
        duration : 350,
        xEase : UnitEasing.easeOutSine,
        yEase : UnitEasing.easeInSine
    },
    pixelGuyToStatsModule2 : {
        layoutRectId : "menuButtonAvatarZoomed",
        from : "default",
        to : "transitionTo",
        duration : 500,
        easing : UnitEasing.easeOutSine
    },
    speechBubbleIn : {
        layoutRectId : "speechBubble",
        from : "transitionFrom",
        to : "transitionTo",
        duration : 400,
        easing : UnitEasing.easeOutSine
    },
    speechBubbleHover : {
        layoutRectId : "speechBubble",
        from : "transitionTo",
        to : "transitionTo",
        duration : 2000
    },
    speechBubbleOut : {
        layoutRectId : "speechBubble",
        from : "transitionTo",
        to : "transitionFrom",
        duration : 300,
        easing : UnitEasing.easeInSine
    }
};