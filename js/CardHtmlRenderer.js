/**
 * DEPENDENCIES:
 * MathUtil, Rectangle, UnitAnimator
 */

(function() {

    window.CardHtmlRenderer = function(){

        //Public API

        this.renderCard = function(data, closeButtonClickCallBack){
            _data = data;//No failsafe?!
            createCard();
            updateCardLayout();
            _closeButtonClickCallBack = closeButtonClickCallBack;
            _thumbImage.src = _data.image ? data.image.src :_data.thumbnailImage.src;
            _story.innerHTML = "<p class=\"cardStoryFirstParagraph\">" + _data.headline + "</p>" +  (_data.story || "");
            _story.style.fontSize = _data.textFontSize + "px";
            _story.style.lineHeight = _data.textLineHeight + "px";
            _story.scrollTop = 0;
            _link.innerHTML = _data.link ? _data.link.innerHTML : "";
            _card.style.display = "initial";
            showCloseButton();
            setTimeout(updateDataVisitStatus, 500);
        };

        var updateDataVisitStatus = function(){
            if(_story.scrollHeight <= _story.clientHeight){
                _data.storyReadComplete = true;
            }
            //TODO: must tell card to update "visit" icon status. Use Effects layer to draw attention
        };

        this.isOpen = function(){
            return _card && _card.style.display != "none";
        };

        //TODO: currently a "home button", will become a menu button?
        this.showNavigationButton = function(value, menuButtonCallback){
            if (!_menuButton) {
                _menuButton = new TabButton(menuButtonCallback, 200);
            }
            resizeNavigationButton();
            _menuButton.show(value);
        };

        function resizeNavigationButton(){
            var buttonHeight = (AppLayout.headerBounds.height * .6);//calculate every time for resizing
            if(AppLayout.bounds.isPortrait()){
                buttonHeight = (AppLayout.bounds.width / 10);//calculate every time for resizing
            }
            var buttonWidth = Math.round(buttonHeight * 4);
            _menuButton.init("home", buttonWidth, buttonHeight, (buttonWidth * -1.2) / AppLayout.bounds.width, AppLayout.cardBounds.x / AppLayout.bounds.width);
        }

        //this works, but is a remnant of a previous implementation, could resultin bugs if left unchecked. TODO: revisit/refactor
        this.forceClose = function(dispatchClose){
            closeCard(dispatchClose);
        };


        //Private variables and methods
        var _data, _card, _thumbImage, _story, _link, _linkCanvas,
            _cardCloseButton, _closeButtonClickCallBack, _menuButton;

        var cardActionLinkClick = function(){
            window.location.href = _data.link.getAttribute("href")+"?" + AppData.getVisitStatsUrlParam();
        };

        var closeCard = function(dispatchCallback){
            AppData.storeInteraction();
            if(_card){
                _story.scrollTop = 0;
                _card.style.display = "none";
                _cardCloseButton.show(false);
            }
            if(dispatchCallback && _closeButtonClickCallBack){
                _closeButtonClickCallBack();
            }
        };

        var showCloseButton = function(){
            resizeCloseButton();
            _cardCloseButton.show(true);
        };

        function resizeCloseButton(){
            var buttonHeight = (AppLayout.headerBounds.height * .7);
            var buttonWidth = Math.round(buttonHeight * 2.4);
            if(AppLayout.bounds.isPortrait()){
                buttonHeight = (AppLayout.bounds.width / 10);//calculate every time for resizing
                buttonWidth = Math.round(buttonHeight * 2.6);
            }
            var showXNormal = (AppLayout.bounds.width - buttonWidth - AppLayout.cardBounds.x) / AppLayout.bounds.width;
            _cardCloseButton.init("X", buttonWidth, buttonHeight, 1.1, showXNormal);

        }

        //************************
        //*******::LAYOUT::*******
        //************************

        var positionElementToRect = function(element, value, bounds){
            if(!value){
                element.style.visibility = "hidden";
                return;
            }
            element.style.visibility = "visible";
            element.style.left = Math.round(AppLayout.cardBounds.x + bounds.x * AppLayout.cardBounds.width) + "px";
            element.style.top = Math.round(AppLayout.cardBounds.y + bounds.y * AppLayout.cardBounds.height) + "px";
            element.style.width = Math.round(bounds.width * AppLayout.cardBounds.width) + "px";
            element.style.height = Math.round(bounds.height * AppLayout.cardBounds.height) + "px";
        };

        var updateCardLayout = function(){
            positionElementToRect(_thumbImage, _data.thumbnailImage, _data.contentLayout.thumbBounds);
            positionElementToRect(_story, _data.headline, _data.contentLayout.storyBounds);
            _story.style.fontSize = _data.textFontSize + "px";
            _story.style.width = Math.round(_data.contentLayout.storyBounds.width * AppLayout.cardBounds.width + AppLayout.cardBounds.x) + "px";
            _story.style.marginRight = AppLayout.cardBounds.x + "px";
            _story.style.marginBottom = AppLayout.headerBounds.height;

            if(_data.link && _data.link.innerHTML && _data.link.innerHTML != ""){
                _link.style.height = AppLayout.headerBounds.height + "px";
                _link.style.width = Math.round(_data.contentLayout.storyBounds.width * AppLayout.cardBounds.width + AppLayout.cardBounds.x) + "px";
                _link.style.left = Math.round(AppLayout.cardBounds.x + _data.contentLayout.storyBounds.x * AppLayout.cardBounds.width) + "px";
                _link.style.top = (AppLayout.cardBounds.bottom() - AppLayout.headerBounds.height - AppLayout.cardBounds.x)  + "px";
                _link.style.fontSize = Math.round(AppLayout.headerBounds.height * .6) + "px";
                _link.style.visibility = "visible";

                //_linkCanvas.width = Math.round(AppLayout.headerBounds.height);
                //_linkCanvas.height = Math.round(AppLayout.headerBounds.height * .6);
            }else{
                _link.style.visibility = "hidden";
            }
        };

        //******************************
        //*******::TEMPLATE::***********
        //******************************

        var createCard = function(){
            if(_card){
                return;
            }
            _card = document.createElement("div");
            _card.classList.add("cardElement", "page");
            _card.style.zIndex = appConfig.cardHtmlZ;
            document.body.appendChild(_card);

            //IMAGE
            _thumbImage = new Image();
            _thumbImage.classList.add("cardElement", "cardImage");
            _card.appendChild(_thumbImage);

            //STORY
            _story = document.createElement("div");
            _story.classList.add("cardElement", "cardStory");
            _story.onscroll = function(){
                if(!_data.storyReadComplete && _story.scrollTop / (_story.scrollHeight - _story.clientHeight) > .95){
                    _data.storyReadComplete = true;
                    AppData.storeInteraction();
                }
            }
            _card.appendChild(_story);

            //LINK
            _link = document.createElement("button");
            _link.addEventListener ("click", cardActionLinkClick);//needs to be removed?
            _link.classList.add("cardElement", "cardActionLink");
            //_link.style.backgroundColor = appConfig.themeColor;
            _card.appendChild(_link);

            //CLOSE BUTTON
            _cardCloseButton = new TabButton(closeCard, appConfig.closeCardButtonZ);

        };


    };
}());