(function(){

    //Receives a (potentially) changing number of circles representing "load items"
    //Animates circles from "emitter x,y" to evenly spaced out locations within bounds
    //Does not receive progress information for individual "load items"
    //Instead, displays the "last ball" as "loading" using _fakeProgressNormal
    window.LoaderCircles = function(){

        var _circles,
            _fakeProgressNormal = 0,
            _emitter, _radius, _lineWidth = 2;


        this.updateCircles = function(colors, numCircles, bounds, emitter){

            if(_circles && _circles.length > 0 && _circles.length === numCircles){
                return;
            }

            _circles = [];
            var circleXIncrement = bounds.width / numCircles;
            _radius = Math.min(Math.round(circleXIncrement * .3), bounds.height);
            _lineWidth = _radius * .3;
            _emitter = emitter;
            for(var i=0; i < numCircles; i++){
                _circles[i] = {
                    currentX : emitter.x,
                    currentY : emitter.y,
                    endX : Math.round(bounds.x + circleXIncrement * i + circleXIncrement * .5),
                    endY : bounds.y,
                    color : colors[i % colors.length],
                    animNormal : 0
                };
            }
        };

        this.renderLoading = function(normal, context){
            var renderCount = Math.round(normal * _circles.length);
            var i, circle, animNormal, radiusNormal, radius;

            var circleScaleDurationNormal = .6;//each circles scaleInOut duration, out of total duration
            var circleScaleDurationNormalSpacer = (1 - circleScaleDurationNormal) / renderCount;
            var circleSpacing = 1 / renderCount;

            context.strokeStyle = "#222222";
            context.lineWidth = _lineWidth;
            for(i=0; i<renderCount; i++){
                circle = _circles[i];
                if(!circle){
                    //console.log("renderLoading no circle : ", i, renderCount, _circles.length, normal, "TODO: Remove");
                    return;
                }
                circle.animNormal = Math.min(circle.animNormal + .03, 1);
                animNormal = UnitEasing.easeOutSine(circle.animNormal, 0, 1, 1);
                circle.currentX = MathUtil.interpolate(animNormal, _emitter.x, circle.endX);
                circle.currentY = MathUtil.interpolate(animNormal, _emitter.y, circle.endY);
                context.fillStyle = circle.color;

                radiusNormal = MathUtil.smoothstep(
                    _fakeProgressNormal,
                    i * circleScaleDurationNormalSpacer,
                    i * circleScaleDurationNormalSpacer + circleSpacing * 2
                );
                radius = _radius + Math.sin(radiusNormal * Math.PI) * (_radius * .4);//ok.. whatever?

                context.beginPath();
                if(i === renderCount - 1){
                    var angle = Math.PI * _fakeProgressNormal;
                    context.arc(circle.currentX, circle.currentY, radius, Math.PI - angle, Math.PI + angle);
                }else{
                    context.arc(circle.currentX, circle.currentY, radius, 0, MathUtil.PI2);
                }
                context.closePath();
                context.fill();
                context.stroke();
            }
            _fakeProgressNormal += .01;
            _fakeProgressNormal = (_fakeProgressNormal < 1) ? _fakeProgressNormal : 0;
        };

        this.introComplete = function(){
            return _circles && _circles.length && _circles[_circles.length - 1].animNormal === 1;
        };

        this.prepareExit = function(endX, endY){
            var i, circle;
            for(i = 0; i<_circles.length; i++){
                circle = _circles[i];
                circle.startX = circle.endX;
                circle.startY = circle.endY;
                circle.endX = endX;
                circle.endY = endY;
            }
        };

        this.renderLoaderCirclesCompleteTransition = function(normal, context){
            var i, circle, smoothStepIncrement = (1 / _circles.length), animNormal;
            context.strokeStyle = "#222222";
            context.lineWidth = _lineWidth;
            for(i=0; i<_circles.length; i++){
                circle = _circles[i];
                animNormal = MathUtil.smoothstep(normal, smoothStepIncrement * i, 1);
                circle.currentX = MathUtil.interpolate(normal, circle.startX, circle.endX);
                circle.currentY = MathUtil.interpolate(animNormal, circle.startY, circle.endY);
                context.fillStyle = circle.color;
                context.beginPath();
                context.arc(circle.currentX, circle.currentY, _radius, 0, MathUtil.PI2);
                context.closePath();
                context.fill();
                context.stroke();
            }
        };

    };
}());