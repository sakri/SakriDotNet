//this sucks, way too much code for something so simple
//TODO: rename, implement following conventions
var _closeButtonInstanceCount = 0;
var getCloseButton = function(label, rightAlign){
    var _id = "statsModCloseButton" + (_closeButtonInstanceCount++),
        _defaultRect = new Rectangle(0, -1, 0, 45), _fromRect = new Rectangle(0, -1, 0, 45),
        _animation,
        _inData = {duration:300, easing:UnitEasing.easeOutSine},
        _outData = {duration:300, easing:UnitEasing.easeInSine};
    //console.log("getCloseButton() instance count : ", _closeButtonInstanceCount, label, rightAlign);
    return {
        props: [],
        data: function () {
            return {}
        },
        template: '<button ref="closeButton" class="closeButton" v-on:click.stop="clickHandler">' + label + '</button>',
        mounted : function(){
            this.show();
        },
        methods:{
            show : function(){
                this.calculateLayout();
                var transition = TransitionStore.getTransition(_id, _fromRect, _defaultRect, _inData);
                _animation = AnimationStore.getAnimation(_id, transition);
                var button = this.$refs.closeButton;
                TransitionCSSUtil.showElement(button, _defaultRect);
                DomElementTransitionAnimationStore.playAnimation(_id, _animation, button);
            },
            hide : function(){
                var transition = TransitionStore.getTransition(_id, _defaultRect, _fromRect, _outData);
                _animation = AnimationStore.getAnimation(_id, transition);
                var button = this.$refs.closeButton;
                TransitionCSSUtil.showElement(button, _fromRect);
                DomElementTransitionAnimationStore.playAnimation(_id, _animation, button);
            },
            resize : function(){
                if(!_animation){
                    return;
                }
                if(_animation.getFromRectangle().equals(_fromRect)){
                    this.show();
                }
            },
            clickHandler : function(){
                this.$root.closeStatsModule();
            },
            stop : function(){
                _animation.stop();
                TransitionCSSUtil.showElement(this.$refs.closeButton);
            },
            calculateLayout : function(){
                //TODO: this is being called twice : mounted() then resize()
                //console.log("closeButton.calculateLayout() ", TangleUI.getRect().smallerSide() * .1);
                _defaultRect.height = _fromRect.height = Math.min(Math.round(TangleUI.getRect().smallerSide() * .1), 45);
                var fontSize = Math.round(_defaultRect.height * .6);
                _defaultRect.width = _fromRect.width = HtmlUtil.measureTextWidth(label, fontSize, document.body) + _defaultRect.height * 2;
                //console.log("TabButton.calculateLayout()", fontSize, _defaultRect.width);
                var spacer = TangleUI.getRect().smallerSide() * .05;

                //not the most flexible solution, ok for now.
                if(rightAlign){
                    _defaultRect.x = Math.round(TangleUI.getRect().right() - spacer - _defaultRect.width);
                    _fromRect.x = Math.round(TangleUI.getRect("window").width * 1.05);
                }else{
                    _defaultRect.x = spacer;
                    _fromRect.x = Math.round(_defaultRect.width * -.1);
                }
                var button = this.$refs.closeButton;
                var borderRadius = Math.round(_defaultRect.height * .95);
                button.style.borderRadius = "0px 0px " + borderRadius + "px " + borderRadius + "px";
                button.style.fontSize = fontSize + "px";
                button.innerHTML = label;
            }
        }
    };
};