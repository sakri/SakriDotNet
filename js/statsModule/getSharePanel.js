
//grabs "sharePanel" from dom when "requested", returns component object parsed by vue
//Probably not the intended vue.js way of doing things, done more as a test (TODO: rename, implement following conventions)
var getSharePanel = function(){
    return {
        props: [],
        data: function () {
            return {
                quotes:[],
                quoteIndex:0
            }
        },
        template : TemplateGrabber.getTemplate("sharePanelTemplate"),
        mounted : function(){
            this.$refs.sharePanelTemplate.style.position = "absolute";
            this.$refs.sharePanelTemplate.style.visibility = "visible";
            this.$refs.sharePanelTemplate.style.display = "none";
            this.$refs.sharePanelTemplate.style.backgroundColor = AppConfig.themeColor;
            this.$refs.sharePanelCloseButton.style.color = AppConfig.themeColor;
            var listItems = this.$refs.sharePanelExamplesContainer.getElementsByTagName("li");
            for(var i=0; i< listItems.length; i++){
                this.quotes.push(listItems[i].innerHTML);
            }
            var mitchQuotes = AppData.getMitchHedbergQuotes();
            for(i=0; i< mitchQuotes.length; i++){
                this.quotes.push(mitchQuotes[i] + " - M. Hedberg");
            }
            this.$refs.sharePanelExamplesContainer.innerHTML = "";
            this.$refs.sharePanelAvatar.render(.4);
            this.showQuote();
            this.quoteIndex++;
        },
        methods : {
            showPanel : function(){
                var panel = this.$refs.sharePanelTemplate;
                var panelRect = TangleUI.getRect("sharePanel");
                //var windowRect = TangleUI.getRect("window");
                //fromRect.x =
                //TangleUI.setRect(fromRect, "sharePanel", "transitionFrom");
                TransitionCSSUtil.showElement(panel, TangleUI.getRect("sharePanel"));
                DomElementTransitionAnimationStore.playTangleUIAnimation("sharePanel","sharePanelIn", panel);
            },
            hidePanel : function(){
                AppData.shareClick = true;
                var panel = this.$refs.sharePanelTemplate;
                TransitionCSSUtil.showElement(panel, TangleUI.getRect("sharePanel", "transitionTo"));
                DomElementTransitionAnimationStore.playTangleUIAnimation("sharePanel","sharePanelOut", panel, this.$root.hideShare);
            },
            updateLayout : function(){

            },
            showQuote : function(){
                var quote = this.quotes[this.quoteIndex % this.quotes.length];
                this.$refs.sharePanelExamplesContainer.style.fontSize = Math.round(TangleUI.getRect("sharePanelExamplesContainer").height / 6) + "px";
                this.$refs.sharePanelExamplesContainer.innerHTML = '"' + quote + '"';
            },
            nextQuote : function(){
                this.showQuote();//animate in and out
                //this.$refs.sharePanelExamplesContainer.innerHTML = '<span class="sharePanelExamplesQuote">"</span>' + quote + '<span class="sharePanelExamplesQuote">"</span>';
                this.quoteIndex++;
                this.$root.tagShareQuote();
            },
            stop : function(){
                TransitionCSSUtil.showElement(this.$refs.sharePanelTemplate);
            }
        }
    };
};