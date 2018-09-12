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
        //context.fillStyle = "#FF0000";
        //context.fillRect(x, y, ss.width * scale, ss.height * scale);
        //console.log("SakriDotNetSpriteSheet.renderFrame() : ", (ss.width + 3) * frame, ss.y, ss.width, ss.height, x, y, ss.width * scale, ss.height * scale);
        context.drawImage(_canvas, 1 + (ss.width + 3) * frame, ss.y, ss.width, ss.height,
            x, y, ss.width * scale, ss.height * scale);
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

    window.SpeechBubbleManager = {};

    var _displayTimeoutId = -1,
        _index = 0,
        _direction = 1,
        _ss,
        _context, _x, _y, _scale;

    SpeechBubbleManager.show = function(context, x, y, scale){
        //console.log("SpeechBubbleManager.show()", x, y, scale);
        if(_displayTimeoutId > -1){
            console.log("SpeechBubbleManager.show() Already playing, skip");
            return;//already displaying
        }
        _ss = SakriDotNetSpriteSheet.getSpriteSheetData("yourStats");
        _context = context;
        _x = x;
        _y = y;
        _scale = scale;
        _index = 0;
        _direction = 1;
        hideBubble();
        render();
    };

    SpeechBubbleManager.hide = function(){
        hideBubble();
    };

    var hideBubble = function(){
        //console.log("SpeechBubbleManager.hideBubble()");
        clearBubbleGraphics();
        clearTimeout(_displayTimeoutId);
        _displayTimeoutId = -1;
    };

    var clearBubbleGraphics = function(){
        if(_context){
            _context.clearRect(_x, _y, _ss.width * _scale, _ss.height * _scale);
        }
    };

    var render = function(){
        clearBubbleGraphics();
        SakriDotNetSpriteSheet.renderFrame("yourStats", _context, _index, _x, _y, _scale);
        //console.log("SpeechBubbleManager.render()", _index, _ss.frames);
        _index += _direction;
        if(_index >= _ss.frames){
            _displayTimeoutId = setTimeout(render, 2000);
            _index = _ss.frames - 1;
            _direction  = -1;
        }else if(_index < 0){
            hideBubble();
        }else{
            _displayTimeoutId = setTimeout(render, 300);
        }
    };

}());

(function(){

    window.PixelConfetti = function(colors, minDuration, maxDuration, updateCallback){

        var _canvas,
            _context,
            _isAnimating = false,
            _rgbs = [],
            _particles = [],
            _particlesCopy = [],
            START_X_0   = 0,
            START_Y_1   = 1,
            PEAK_X_2    = 2,
            PEAK_Y_3    = 3,
            END_X_4     = 4,
            MS_START_5  = 5,
            MS_END_6    = 6,
            COLOR_7     = 7,
            NUM_PROPS_8 = 8;

        var rgb = {};
        for(var i=0; i < colors.length; i++){
            MathUtil.hexToRgb(colors[i], rgb);
            _rgbs.push(rgb.r, rgb.g, rgb.b);
        };

        //refactor, too easy to forget to call?
        this.updateCanvas = function(canvas){
            _canvas = canvas;
            _context = canvas.getContext("2d")
        };

        this.stop = function(){
            stopRenderLoop();
        };

        this.addParticles = function(total, emitterX, emitterY){
            var indexTotal = _particles.length + total * NUM_PROPS_8, peakX, start = new Date().getTime();
            for(var i = _particles.length; i < indexTotal; i += NUM_PROPS_8){
                peakX = Math.floor(Math.random() * _canvas.width);
                _particles[i + START_X_0]   = emitterX;
                _particles[i + START_Y_1]   = emitterY;
                _particles[i + PEAK_X_2]    = peakX;
                _particles[i + PEAK_Y_3]    = Math.ceil(Math.random() * (emitterY * .6));
                _particles[i + END_X_4]     = Math.round(peakX + (peakX - emitterX) * .5);
                _particles[i + MS_START_5]  = start;
                _particles[i + MS_END_6]    = start + Math.round(MathUtil.getRandomNumberInRange(minDuration, maxDuration));
                _particles[i + COLOR_7]     = Math.floor(Math.random() * colors.length);
            }
            if(_particles.length && !_isAnimating){
                startRenderLoop();
            }
        };

        var render = function(){
            _context.clearRect(0, 0, _canvas.width, _canvas.height);
            var imgData = _context.getImageData(0,0,_canvas.width, _canvas.height);
            data = imgData.data;
            _particlesCopy.length = 0;
            var normal, positionNormal, x, y, now = new Date().getTime(),
                dataIndex, colorIndex, rowSize = _canvas.width * 4;
            for(var i=0; i<_particles.length; i += NUM_PROPS_8){
                if(now > _particles[i + MS_END_6]){
                    continue;//particle trajectory complete
                }
                normal = MathUtil.normalize(now, _particles[i + MS_START_5], _particles[i + MS_END_6]);
                if(normal < .3 ){
                    positionNormal = MathUtil.map(normal, 0, .3, 0, 1);//going up
                    x = MathUtil.interpolate(UnitEasing.easeInQuad(positionNormal), _particles[i + START_X_0], _particles[i + PEAK_X_2]);
                    y = MathUtil.interpolate(UnitEasing.easeOutQuad(positionNormal), _particles[i + START_Y_1], _particles[i + PEAK_Y_3]);
                }else{
                    positionNormal = MathUtil.map(normal, .3, 1, 0, 1);//going down
                    x = MathUtil.interpolate(UnitEasing.easeOutQuad(positionNormal), _particles[i + PEAK_X_2], _particles[i + END_X_4]);
                    y = MathUtil.interpolate(UnitEasing.easeInQuad(positionNormal), _particles[i + PEAK_Y_3], _canvas.height);
                }
                if(x < 0 || x > _canvas.width){
                    continue;//out of bounds, particle trajectory complete
                }
                dataIndex = Math.floor(y) * rowSize + Math.floor(x) * 4;
                colorIndex = _particles[i + COLOR_7] * 3;
                data[dataIndex] = _rgbs[colorIndex];
                data[dataIndex + 1] = _rgbs[colorIndex + 1];
                data[dataIndex + 2] = _rgbs[colorIndex + 2];
                data[dataIndex + 3] = 255 - Math.floor(i / _particles.length * 100);

                _particlesCopy.push(_particles[i + START_X_0], _particles[i + START_Y_1], _particles[i + PEAK_X_2],
                    _particles[i + PEAK_Y_3], _particles[i + END_X_4], _particles[i + MS_START_5],
                    _particles[i + MS_END_6], _particles[i + COLOR_7]
                );
            }
            _context.putImageData(imgData, 0, 0);
            _particles = _particlesCopy.slice();//only keep active particles
            if(!_particles.length){
                stopRenderLoop();
            }
        };

        var startRenderLoop = function(){
            //console.log("PixelConfetti.startRenderLoop()");
            _isAnimating = true;
            renderLoop();
        };

        var stopRenderLoop = function(){
            //console.log("PixelConfetti.stopRenderLoop()");
            _context.clearRect(0, 0, _canvas.width, _canvas.height);//find way to not have to clear everytime? wasteful
            _isAnimating = false;
            _particles.length = 0;
        };

        var renderLoop = function(){
            if(_isAnimating){
                render();
                if(updateCallback){
                    updateCallback();
                }
                requestAnimationFrame(renderLoop);
            }
        };
    };

}());