//Layout rectangles definition json for use with TangleUI
window.StatsModuleTangUIRects = {
    /* app renders layout as a square or less, no need for horizontal in containers*/
    clickHistoryContainer : {
        default: {
            square: {x: .05, y: .05, width: .425, height: .25},
            portrait: {x: .05, y: 1, width: .85, height: .25}/*  positioned below badges container */
        },
        children:{
            clicksTitle : {
                default: {
                    all: {x: .05, y: .05, width: .9, height: .2}
                }
            },
            clicksHistoryChart : {
                default: {
                    all: {x: .05, y: .3, width: .9, height: .65}
                }
            }
        }
    },
    visitPieContainer : {
        default: {
            square: {x: .05, y: .35, width: .425, height: .6},
            portrait: {x: .05, y: 1.3, width: .85, height: .65}/*  positioned below clicks container */
        },
        children:{
            visitsTitle : {
                default: {
                    all: {x: .05, y: .03, width: .9, height: .09}
                }
            },
            visitPieChartLegend : {
                default: {
                    all: {x: .1, y: .17, width: .8, height: .25}
                }
            },
            visitPieChart : {
                default: {
                    all: {centerX: "height", y: .45, width: "height", height: .5}
                }
            }
        }
    },
    badgesContainer : {
        default: {
            square: {x: .525, y: .05, width: .425, height: .9},
            portrait: {x: .05, y: "x", width: .85, height: .9}/* y is ignored in vertical layout*/
        },
        children:{
            badgesTitle : {
                default: {
                        all: {x: .05, y: .015, width: .65, height: .055}
                    }
            },
            badgesAvatar : {
                default: {
                        all: {x: .68, y: .01, width: "height", height: .12}
                }
            },
            badgesList : {
                default: {
                    all: {x: .05, y: .16, width: .9, height: .7}
                }
            },
            shareButton : {
                default: {
                    all: {x: .05, y: .92, width: .9, height: .05}
                }
            }

        }
    },
    verticalLayoutBottomHack : {
        default: {
            all: {x: .0, y: 2, width: .8, height: .1}/* only used in vertical to add bottom margin, reconsider*/
        }
    },
    sharePanel : {
        default: {
            square: {x: .03, y: .05, width: .94, height: .9},
            portrait: {x: .03, y: .05, width: .89, height: .9}
        },
        transitionFrom : {
            all: {x: 1.5}
        },
        transitionTo : {
            all: {x: -1.5}
        },
        children : {
            sharePanelTitle:{
                default: {
                    all: {x: .05, y: .05, width: .9, height: .1}
                }
            },
            sharePanelSubTitle:{
                default: {
                    all: {x: .05, y: .18, width: .9, height: .07}
                }
            },
            sharePanelExamplesContainer:{
                default: {
                    all: {x: .05, y: .35, width: .9, height: .25}
                }
            },
            sharePanelAvatar:{
                default: {
                    all: {x: .2, y: .65, width: .3, height: .2}
                }
            },
            sharePanelNextButton:{
                default: {
                    all: {x: .55, y: .72, width: .3, height: .06}
                }
            },
            sharePanelCloseButton:{
                default: {
                    all: {x: .05, y: .85, width: .9, height: .07}
                }
            }

        }
    },
    celebrationsAnimation : {
        default: {
            all: {x: 0, y: 0, width: 1, height: 1}
        }
    }
};