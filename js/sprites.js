(function(){
    window.SakriDotNetSpriteSheet = {};

    var _sourceImage = new Image();
    _sourceImage.src = "data:image/png;base64,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";

    //preconfigured "handshakes" (repeated process when spritesheet is updated, consider optimization ideas)
    var _spriteSheetNames = ["head", "eyes", "mouth", "typingHand", "laptop", "buttrock", "bowdown", "yourStats"];//These match pixel art in _sourceImage
    var _paletteColors = ["#222222", "#FFFFFF", appConfig.themeColor || "#AAAAAA", "#CCCCCC"];//TODO: MathUtil.lighten() darken() lightenHex()

    var _canvas = document.createElement("canvas"), _context, _spriteSheets = {};

    SakriDotNetSpriteSheet.getSpriteSheetData = function(name){
        return _spriteSheets[name];
    };

    //TODO: add comment. Why such a long function (manages single spritesheet image). Consider adding GridMath to utils.js?
    SakriDotNetSpriteSheet.init = function(){

        _canvas.width = _sourceImage.width;
        _canvas.height = _sourceImage.height;
        //console.log("SakriDotNetSpriteSheet.setSourceImage, image.width : ", image.width , " , image.height", image.height);
        _context = _canvas.getContext("2d");
        _context.drawImage(_sourceImage, 0, 0, _canvas.width, _canvas.height);
        var imgData = _context.getImageData(0, 0, _canvas.width, _canvas.height);
        var data = imgData.data;

        //configure color mapping
        var appPalette = _paletteColors.slice(), colorLookup = {}, valuesPerRow = _canvas.width * 4, i;
        for(i = 0; i < data.length && appPalette.length > 0; i += valuesPerRow) {
            colorLookup[(String(data[i]) + String(data[i + 1]) + String(data[i + 2]))] = MathUtil.hexToRgb(appPalette.shift());
            data[i] = data[i + 1] = data[i + 2] = data[i+3] = 0;
        }

        var index = 0, endIndex, names = _spriteSheetNames.slice(), xScan;
        while (names.length){
            var ss = {};
            ss.y = Math.floor(index / valuesPerRow) + 1;
            ss.frames = 0;

            //discover width and frames
            endIndex = index + valuesPerRow;
            xScan = 0;//stop scanning for frames if no frame edge is found after initial "frame width" iterations
            for(i = index; i < endIndex; i+=4) {
                if(data[i+3] > 0){
                    if(!ss.width){
                        ss.width = (i - index - 8) / 4;
                    }/*else{
                        if(xScan > ss.width - 8){
                            console.log("frame width xScan exceeded for sprite : ", names[0], ", frames : ", ss.frames);
                            break;
                        }
                    }*/
                    xScan = 0;
                    ss.frames++;
                }
                xScan+=4;
            }

            //set height
            for(i = index; i < data.length; i += valuesPerRow) {
                if(data[i+3] > 0){
                    ss.height = Math.floor((i - index) / valuesPerRow) - 2;
                    break;
                }
            }

            //console.log("sprite sheet : ", names[0], " ,y: ", ss.y, " ,w: ", ss.width, " ,h: ", ss.height, " ,frames: ", ss.frames);
            _spriteSheets[names.shift()] = ss;
            index = (ss.y + ss.height + 2) * valuesPerRow;
        }

        //update colors (brute force, go through all pixels, can be optimized)
        var rgb;
        for(i=0; i < data.length; i+=4){
            if(data[i+3] > 0){
                rgb = colorLookup[(String(data[i]) + String(data[i + 1]) + String(data[i + 2]))];
                if(rgb){
                    data[i] = rgb.r;
                    data[i + 1] = rgb.g;
                    data[i + 2] = rgb.b;
                    data[i + 3] = 255;
                }
            }
        }

        _context.putImageData(imgData, 0, 0);

        //free up a little memory
        _sourceImage.src = "";
        _sourceImage = null;
    };

    SakriDotNetSpriteSheet.renderFrame = function(spriteSheetName, context, frame, x, y, scale){
        var ss = this.getSpriteSheetData(spriteSheetName);
        if(!ss){
            console.log("SakriDotNetSpriteSheet.renderFrame() : ", spriteSheetName, ", no such sprite sheet, make sure SakriDotNetSpriteSheet.init() has been called")
            return false;
        }
        context.drawImage(_canvas, 1 + (ss.width + 3) * frame, ss.y, ss.width, ss.height,
            x, y, ss.width * scale, ss.height * scale);
        return true;
    };

    //TODO: refactor, rename "renderFrame" to "renderFrameToScale", "renderFrameFixedSize" to "renderFrame"
    SakriDotNetSpriteSheet.renderFrameFixedSize = function(spriteSheetName, context, frame, x, y, width, height){
        var ss = this.getSpriteSheetData(spriteSheetName);
        if(!ss){
            console.log("SakriDotNetSpriteSheet.renderFrame() : ", spriteSheetName, ", no such sprite sheet, make sure SakriDotNetSpriteSheet.init() has been called")
            return false;
        }
        context.drawImage(_canvas, 1 + (ss.width + 3) * frame, ss.y, ss.width, ss.height, x, y, width, height);
        return true;
    };

}());


(function(){
    window.PixelGuyHeadSprite = {};

    PixelGuyHeadSprite.unscaledWidth = 16;
    PixelGuyHeadSprite.unscaledHeight = 16;

    var _eyesOffsetX = 2, _eyesOffsetY = 2,
        _mouthOffsetX = 5, _mouthOffsetY = 5;

    PixelGuyHeadSprite.renderFrame = function(context, x, y, scale, eyesIndex, mouthIndex){
        SakriDotNetSpriteSheet.renderFrame("head", context, 0, x, y, scale);
        SakriDotNetSpriteSheet.renderFrame("eyes", context, eyesIndex, x + _eyesOffsetX * scale, y + _eyesOffsetY * scale, scale);
        SakriDotNetSpriteSheet.renderFrame("mouth", context, mouthIndex, x + _mouthOffsetX * scale, y + _mouthOffsetY * scale, scale);
    };

    var _badgeEyeIndices = [2, 2, 1, 0, 4, 3];
    var _badgeMouthIndices = [3, 1, 0, 0, 2, 2];

    PixelGuyHeadSprite.renderAvatar = function(context, x, y, scale, normal){
        var index = Math.min(normal, 1);
        PixelGuyHeadSprite.renderFrame(context, x, y, scale,
            _badgeEyeIndices[Math.floor(index * (_badgeEyeIndices.length - 1))],
            _badgeMouthIndices[Math.floor(index * (_badgeMouthIndices.length - 1))]);
    }

}());

(function(){
    window.PixelGuyTypingSprite = {};

    PixelGuyTypingSprite.unscaledWidth = 41;
    PixelGuyTypingSprite.unscaledHeight = 18;

    var _laptopOffsetX = 0, _laptopOffsetY = 4,
        _armOffsetX = 12, _armOffsetY = 8,
        _headOffsetX = 25, _headOffsetY = 0;

    PixelGuyTypingSprite.render = function(context, x, y, scale, laptopIndex, armIndex, eyesIndex, mouthIndex){
        SakriDotNetSpriteSheet.renderFrame("laptop", context, laptopIndex, x + _laptopOffsetX * scale, y + _laptopOffsetY * scale, scale);
        SakriDotNetSpriteSheet.renderFrame("typingHand", context, armIndex, x + _armOffsetX * scale, y + _armOffsetY * scale, scale);
        PixelGuyHeadSprite.renderFrame(context, x + _headOffsetX * scale, y + _headOffsetY * scale, scale, eyesIndex, mouthIndex);
    };

}());

(function(){
    window.PixelGuyTypingManager = {};

    var _eyeCounter = 0, _eyeIndex = 0,
        _mouthCounter = 0, _mouthIndex = 0,
        _armCounter = 0, _armIndex = 0,
        _laptopIndex = 0;

    function updateCounters(normal){
        _eyeCounter++;
        if(_eyeCounter > 60){
            _eyeCounter = 0;
            _eyeIndex = Math.floor(Math.random() * 5);
        }
        _mouthCounter++;
        if(_mouthCounter > 120){
            _mouthCounter = 0;
            _mouthIndex = Math.floor(Math.random() * 4);
        }
        _armCounter += normal;
        if(_armCounter > 2){
            _armCounter = 0;
            _armIndex++;
            _armIndex %= 4;
        }
        _laptopIndex = Math.floor(normal * 2);
    };

    PixelGuyTypingManager.render = function(context, x, y, scale, normal){
        updateCounters(normal);
        PixelGuyTypingSprite.render(context, x, y, scale, _laptopIndex, _armIndex, _eyeIndex, _mouthIndex)
    };

}());

(function(){

    window.ButtrockManager = {};
    ButtrockManager.completeCallback = undefined;
    ButtrockManager.unscaledWidth = 28;
    ButtrockManager.unscaledHeight = 27;

    var _counter = 0;

    ButtrockManager.render = function(context, x, y, scale, normal){
        _counter += normal;
        if(this.completeCallback && _counter >= 3){
            this.completeCallback();
        }
        _counter = _counter >= 3 ? 0 : _counter;
        SakriDotNetSpriteSheet.renderFrame("buttrock", context, Math.floor(_counter), x, y, scale);
    };

}());

(function(){

    window.BowdownManager = {};

    BowdownManager.unscaledWidth = 33;
    BowdownManager.unscaledHeight = 25;
    var _counter = 0;
    var _direction = 1;

    BowdownManager.completeCallback = undefined;

    //TODO: rename increment, reconsider approach
    BowdownManager.render = function(context, x, y, scale, increment){
        _counter += increment * _direction;
        _counter = MathUtil.clamp(_counter, 0, 8);
        SakriDotNetSpriteSheet.renderFrame("bowdown", context, Math.round(_counter), x, y, scale);
        if(_counter==8 && this.completeCallback){
            this.completeCallback();
        }
        if(_counter == 8 ||_counter==0){
            _direction *= -1;
        }
    };

}());

(function(){

    //uses 3 sprite frames to render a bubble using fixed size left, sretching middle part, fixed size right pieces
    window.SpeechBubbleSprite = {};

    var _leftSidePixels = 4;//update this if the sprite sheet changes

    SpeechBubbleSprite.render = function(context, x, y, width, height){
        var _spriteSheet = SakriDotNetSpriteSheet.getSpriteSheetData("yourStats");
        var _scale = Math.floor(Math.max(height / _spriteSheet.height, 1));//minimum height is _spriteSheet.height
        SakriDotNetSpriteSheet.renderFrame("yourStats", context, 0, x, y, _scale);
        SakriDotNetSpriteSheet.renderFrameFixedSize("yourStats", context, 1,
            x + _leftSidePixels * _scale , y,
            width - _scale * _spriteSheet.width - _leftSidePixels * _scale,
            _scale * _spriteSheet.height);
        SakriDotNetSpriteSheet.renderFrame("yourStats", context, 2, x + width - _scale * _spriteSheet.width, y, _scale);
    };

}());