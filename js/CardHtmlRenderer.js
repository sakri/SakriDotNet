/**
 * DEPENDENCIES:
 * MathUtil, Rectangle, AppData
 */

(function() {

    window.CardHtmlRenderer = function(){

        //Public API

        this.open = function(data){
            _data = data;//No failsafe?!
            _data.visited = true;
            createCard();
            updateCardLayout();
            _thumbImage.src = _data.image ? data.image.src :_data.thumbnailImage.src;
            _story.innerHTML = "<p class=\"cardStoryFirstParagraph\">" + _data.headline + "</p>" +  (_data.story || "");
            _story.style.fontSize = _data.textFontSize + "px";
            _story.style.lineHeight = _data.textLineHeight + "px";
            _story.scrollTop = 0;
            _link.innerHTML = _data.link ? _data.link.innerHTML : "";
            _card.style.display = "initial";
            setTimeout(checkStoryReadComplete, 500);//TODO: use requestAnimationFrame instead?
        };

        this.isOpen = function(){
            return _card && _card.style.display !== "none";
        };

        this.matchesHash = function(title){
            return _data.title === title;
        };

        this.close = function(){
            if(_story){
                _story.scrollTop = 0;
            }
            if(_card){
                _card.style.display = "none";
            }
        };


        //Private properties and methods

        var _data, _card, _thumbImage, _story, _link, _linkCanvas;

        //--------- Layout ---------------

        //TODO: use TransitionCSSUtil.showCardElement
        var showCardElement = function(element, value, bounds){
            if(!value){
                element.style.visibility = "hidden";
                return;
            }
            element.style.visibility = "visible";
            element.style.left = (AppLayout.cardBounds.x + bounds.x * AppLayout.cardBounds.width) + "px";
            element.style.top = (AppLayout.cardBounds.y + bounds.y * AppLayout.cardBounds.height) + "px";
            element.style.width = bounds.width * AppLayout.cardBounds.width + "px";
            element.style.height = bounds.height * AppLayout.cardBounds.height + "px";
        };

        var updateCardLayout = function(){
            showCardElement(_thumbImage, _data.thumbnailImage, _data.contentLayout.thumbBounds);
            showCardElement(_story, _data.headline, _data.contentLayout.storyBounds);
            _story.style.fontSize = _data.textFontSize + "px";
            _story.style.width = Math.round(_data.contentLayout.storyBounds.width * AppLayout.cardBounds.width + AppLayout.cardImageDefaultBounds.x) + "px";
            _story.style.marginRight = AppLayout.cardBounds.x + "px";
            _story.style.marginBottom = AppLayout.headerBounds.height;

            if(_data.link && _data.link.innerHTML){
                _link.style.height = AppLayout.headerBounds.height + "px";
                _link.style.width = Math.round(_data.contentLayout.storyBounds.width * AppLayout.cardBounds.width + AppLayout.cardBounds.x) + "px";
                _link.style.left = Math.round(AppLayout.cardBounds.x + _data.contentLayout.storyBounds.x * AppLayout.cardBounds.width) + "px";
                _link.style.top = (AppLayout.cardBounds.bottom() - AppLayout.headerBounds.height - AppLayout.cardBounds.x)  + "px";
                _link.style.fontSize = Math.round(AppLayout.headerBounds.height * .6) + "px";
                _link.style.visibility = "visible";
            }else{
                _link.style.visibility = "hidden";
            }
        };

        var checkStoryReadComplete = function(){
            if(_story.scrollHeight <= _story.clientHeight){
                _data.storyReadComplete = true;
            }
            //TODO: must dispatch so menu can update "visit" icon status. Use Effects layer to draw attention
        };

        //TODO: needs to be renamed to reflect link opens instance of SakriDotNetHomeApp
        var cardActionLinkClick = function(){
            window.location.href = _data.link.getAttribute("href")+"?" + AppData.getVisitStatsUrlParam();
        };


        //--------- Template ---------------

        var createCard = function(){
            if(_card){
                return;
            }
            _card = document.createElement("div");
            _card.classList.add("cardElement", "page");
            _card.style.zIndex = AppConfig.zIndexCardHtml;
            document.body.appendChild(_card);

            //IMAGE
            _thumbImage = new Image();
            _thumbImage.classList.add("cardElement");
            _card.appendChild(_thumbImage);

            //STORY
            _story = document.createElement("div");
            _story.classList.add("cardElement", "cardStory");
            _story.onscroll = function(){
                if(!_data.storyReadComplete && _story.scrollTop / (_story.scrollHeight - _story.clientHeight) > .95){
                    _data.storyReadComplete = true;
                    GoogleAnalyticsService.tagStoryReadCompleteHandler(_data);
                    AppData.storeInteraction();
                }
            };
            _card.appendChild(_story);

            //LINK
            _link = document.createElement("button");
            _link.addEventListener ("click", cardActionLinkClick);
            _link.classList.add("cardElement", "cardActionLink");
            _card.appendChild(_link);
        };

    };
}());