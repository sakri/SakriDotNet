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