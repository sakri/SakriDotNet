/**
 * DEPENDENCIES:
 * utils MathLib, Rectangle
 */

(function() {

    window.DonutChart = function(lightColor, themeColor, darkColor){

        //console.log("DonutChart constructor", lightColor, themeColor,  darkColor);

        var _lightColor = lightColor || "#FFFFFF",
            _themeColor = themeColor || "#BBBBBB",
            _darkColor = darkColor || "#111111",
            _bounds = new Rectangle(),
            _radius, _centerX, _centerY,
            _outerRadius, _innerRadius, _lineWidth,
            _radian;

        this.render = function(canvas, bounds, normal){
            if(!canvas){
                console.log("DonutChart.render() skipping, no canvas provided");
                return;
            }

            var context = canvas.getContext("2d");

            if(_bounds.width !== bounds.width || _bounds.height !== bounds.height){
                _radius = Math.floor(Math.min(bounds.width * .5, bounds.height * .5));
                _lineWidth = _radius * .1;
                _outerRadius = _radius - _lineWidth * .5;
                _innerRadius = Math.floor(_outerRadius * .6);//careful for mobile, can be very small!
            }
            _bounds.updateToRect(bounds);
            _centerX = _bounds.x + _radius;
            _centerY = _bounds.y + _radius;
            _radian = MathUtil.PI2 * normal;

            context.save();

            //fill bg
            context.fillStyle = _themeColor;
            context.strokeStyle = _darkColor;
            context.lineWidth = _lineWidth;
            context.beginPath();
            context.arc(_centerX, _centerY, _outerRadius, 0, MathUtil.PI2);
            context.fill();
            context.stroke();

            //render completed part of donut
            context.fillStyle = _lightColor;
            context.beginPath();
            context.moveTo(_centerX, _centerY);
            context.lineTo(_centerX + _outerRadius, _centerY);
            context.arc(_centerX, _centerY, _outerRadius, 0, _radian);
            context.lineTo(_centerX, _centerY);
            context.fill();
            context.stroke();

            //render center of Donut background
            context.beginPath();
            context.fillStyle = normal === 1 ? _themeColor : _lightColor;
            context.arc(_centerX, _centerY, _innerRadius, 0, MathUtil.PI2);
            context.fill();
            context.stroke();

            //render percentage label
            context.fillStyle = normal === 1 ? _lightColor : _darkColor;
            context.font="bold " + Math.round(_innerRadius * .7) + "px Helvetica,Arial,sans-serif";
            context.textBaseline = "middle";//top, bottom, middle, alphabetic, hanging
            context.textAlign = "center";
            context.fillText(Math.floor(normal * 100) + "%", _centerX , _centerY);

            context.restore();
        };

    };
}());