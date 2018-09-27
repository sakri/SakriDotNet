/**
 * DEPENDENCIES:
 * utils MathLib, Rectangle
 *
 * Draws a rippling and pulsating quarter circle graphic
 */

(function() {

    window.ToStatsButtonBackground = function(){

        var _twelveOClock = Math.PI * 1.5,
            _numRipples = 4,//@derschmale , take that!
            _centerRadiusNormal = .8,
            _centerRadius,
            _pulseRadius,
            _maxStrokeWidth = 1,
            _spacer,
            _context,
            _bounds = new Rectangle(),
            _bgColor,
            _pulseColor;

        var _pulseRadianNormal = (1 - _centerRadiusNormal);

        this.init = function(canvas, bounds, bgColor, pulseColor){
            _bounds.updateToRect(bounds);
            _context = canvas.getContext("2d");
            _centerRadius = _bounds.width * _centerRadiusNormal;
            _pulseRadius = _bounds.width * _pulseRadianNormal;
            _maxStrokeWidth = _pulseRadius * .3;
            _spacer = _pulseRadianNormal / _numRipples;
            _bgColor = bgColor;
            _pulseColor = pulseColor;
        };

        this.render = function(normal){

            var i, fromNormal, toNormal, rippleNormal, radius;

            _context.save();
            _context.clearRect(_bounds.x, _bounds.y, _bounds.width, _bounds.height);

            //draw bg
            _context.beginPath();
            _context.fillStyle = _pulseColor;
            _context.moveTo(_bounds.right(), _bounds.bottom());
            _context.arc(_bounds.right(), _bounds.bottom(), _bounds.width, Math.PI, _twelveOClock);
            _context.fill();

            //draw ripples, RIPPLES!!!11
            _context.strokeStyle = _bgColor;
            for(i = 0; i < _numRipples; i++){
                fromNormal = _spacer * i / _pulseRadianNormal;
                toNormal = _spacer * (i + 1) / _pulseRadianNormal;
                rippleNormal = UnitEasing.easeOutSine(MathUtil.interpolate(normal, fromNormal, toNormal));
                radius = _centerRadius + rippleNormal * _pulseRadius;

                _context.beginPath();
                _context.lineWidth = (1 - rippleNormal) * _maxStrokeWidth;
                _context.moveTo(_bounds.right() - radius, _bounds.bottom());
                _context.arc(_bounds.right(), _bounds.bottom(), radius, Math.PI, _twelveOClock);
                _context.stroke();
            }

            //draw center
            _context.beginPath();
            _context.fillStyle = _bgColor;
            _context.moveTo(_bounds.right(), _bounds.bottom());
            radius = _centerRadiusNormal * _bounds.width - _maxStrokeWidth/2 + _maxStrokeWidth * normal;
            _context.arc(_bounds.right(), _bounds.bottom(), radius, Math.PI, _twelveOClock);
            _context.fill();

            _context.restore();
        };

    };
}());