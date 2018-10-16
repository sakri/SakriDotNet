/**
 * Transition definitions json for use with TangleUI
 * references rectangle ids from SakriDotNetLayout.js
*/
window.StatsModuleTangleUITransitions = {
    /* SHARE PANEL */
    sharePanelIn : {
        layoutRectId : "sharePanel",
        from : "transitionFrom",
        to : "default",
        duration : 300,
        easing : UnitEasing.easeOutSine
    },
    sharePanelOut : {
        layoutRectId : "sharePanel",
        from : "default",
        to : "transitionTo",
        duration : 300,
        easing : UnitEasing.easeInSine
    }
};