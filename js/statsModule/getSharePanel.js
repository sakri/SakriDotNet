
//grabs "sharePanel" from dom when "requested", returns component object parsed by vue
//Probably not the intended vue.js way of doing things, done more as a test (TODO: rename, implement following conventions)
var getSharePanel = function(){
    return {
        props: [],
        data: function () {
            return {
                quotes:[],
                quoteIndex:0,
                showing:false
            }
        },
        template : TemplateGrabber.getTemplate("sharePanel"),
        mounted : function(){
            this.$refs.sharePanel.style.position = "absolute";
            this.$refs.sharePanel.style.visibility = "visible";
            this.$refs.sharePanel.style.display = "none";
            this.$refs.sharePanel.style.backgroundColor = AppConfig.themeColor;
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
        },
        methods : {
            showPanel : function(){
                this.showing = true;
                this.updateLayout();
                this.nextQuote();
                DomElementTransitionAnimationStore.playTangleUIAnimation("sharePanel","sharePanelIn", this.$refs.sharePanel);
            },
            hidePanel : function(){
                this.showing = false;
                AppData.shareClick = true;
                var panel = this.$refs.sharePanel;
                TransitionCSSUtil.showElement(panel, TangleUI.getRect("sharePanel", "transitionTo"));
                DomElementTransitionAnimationStore.playTangleUIAnimation("sharePanel","sharePanelOut", panel, this.$root.hideShare);
            },
            updateLayout : function(){
                var panel = this.$refs.sharePanel;
                var panelRect = TangleUI.getRect("sharePanel");
                TransitionCSSUtil.showElement(panel, TangleUI.getRect("sharePanel"));
                this.$refs.sharePanelTitle.render();
                this.$refs.sharePanelSubTitle.render();
                this.$refs.sharePanelAvatar.render(.4);
                this.showQuote();
                TransitionCSSUtil.showElement(this.$refs.sharePanelExamplesContainer, TangleUI.getRect("sharePanelExamplesContainer"));
                TransitionCSSUtil.showElement(this.$refs.sharePanelNextButton, TangleUI.getRect("sharePanelNextButton"));
                TransitionCSSUtil.showElement(this.$refs.sharePanelCloseButton, TangleUI.getRect("sharePanelCloseButton"));
                panel.style.display = this.showing ? "block" : "none";
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
                TransitionCSSUtil.showElement(this.$refs.sharePanel);
            }
        }
    };
};