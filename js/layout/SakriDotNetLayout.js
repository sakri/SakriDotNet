//Layout rectangles definition json for use with TangleUI
window.SakriDotNetLayout = {
    loaderTitle : {
        default: {
            landscape: {x: .1, y: .15, width: .8, height: .13},
            square: {x: .2, y: .13, width: .6, height: .08},
            portrait: {x: .05, y: .16, width: .9, height: .1}
        },
        transitionFrom: {
            all: {y: -.2}
        },
        transitionTo: {
            all: {x: .75, y: -.2}
        }
    },
    loaderPixelGuy : {
        default: {
            landscape: {x: .35, y: .35, width: .3, height: .3},
            square: {x: .15, y: .42, width: .85, height: .25},
            portrait: {x: .15, y: .4, width: .75, height: .2}
        },
        transitionFrom: {
            all: {y: 1.05}
        },
        laptopTo:{
            all: {x:-.4, y: 0}
        }
    },
    loaderButtrock : {
        default: {
            all: {x: .5, y: .25, width: .3, height: .3}
        },
        transitionTo: {
            landscape: {y: .95, x:1.1, width:"height", height:.1},
            square: {y: .95, x:1.1, width:"height", height:.1},
            portrait: {y: .95, x:1.1, width:.12, height:"width"}
        }
    },
    card : {
        default: {
            all: {x:0, y:0, width:1, height:1}
        },
        children:{
            image : {
                default: {
                    landscape: {x: .1, y: .1, width: .4, height: .8},
                    square: {x: .1, y: .1, width: .35, height: .8},
                    portrait: {x: .05, y: .1, width: .9, height: .4}
                }
            },
            text : {
                default: {
                    landscape: {x: .55, y: .1, width: .4, height: .8},
                    square: {x: .1, y: .1, width: .5, height: .8},
                    portrait: {x: .05, y: .05, width: .9, height: .4}
                }
            }
        }
    },
    menuButton : {
        default: {
            landscape: {right: "height", y: .8, width: "height", height: .2},
            square: {x: .8, y: .8, width: .2, height: .2},
            portrait: {x: .75, bottom: "width", width: .25, height: "width"}
        },
        transitionFrom: {
            all: {x: 1.1, y:1.1}
        },
        children : {
            progressGraphic : {
                default: {
                    all: {x: .33, y: .33, width: .65, height: .65}
                },
                transitionFrom: {
                    all: {x: 1.1, y:.33}
                }
            }
        }
    },
    speechBubble : {
        default: {
            all: {x: 0, y: 0, width: 1, height: 1}/* calculated by app, based on menuButton dimensions*/
        },
        transitionFrom: {
            all: {x: 1.1}/* calculated by app, based on menuButton dimensions*/
        },
        transitionTo: {
            all: {x: 1.1}/* calculated by app, based on menuButton dimensions*/
        }
    },
    menuButtonAvatarCenter: {
        default : {
            landscape: {centerX: .5, y: .25, width: "height", height: .5},
            square: {x: .25, y: .25, width: .75, height: .75},
            portrait: {x:.25, centerY: .5, width: .5, height: "width"}
        },
        transitionFrom: {
            all: {x: 0, y: 0, width: 1, height: 1}/* calculated by app, based on avatar dimensions*/
        }
    },
    menuButtonAvatarZoomed: {
        default : {
            landscape: {centerX: .5, y: .25, width: "height", height: .5},
            square: {x: .25, y: .25, width: .75, height: .75},
            portrait: {x:.25, centerY: .5, width: .5, height: "width"}
        },
        transitionTo: {
            landscape:  {centerX: "width", centerY: "width", width: 2, height: "width"},
            square:  {centerX: "width", centerY: "width", width: 2, height: "width"},
            portrait:  {centerX: "height", centerY: "height", width: "height", height: 2}
        }
    }
};