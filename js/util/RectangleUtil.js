/**
 * Created by sakri on 15-1-14.
 */
//dependency on MathUtil and Rectangle

(function (window){

    window.RectangleUtil = {};

    RectangleUtil.getBiggerRectangle = function(rectA, rectB){
        return this.isBiggerThan(rectA, rectB) ? rectA : rectB;
    };

    RectangleUtil.getSmallerRectangle = function(rectA, rectB){
        return (this.isBiggerThan(rectA, rectB) ? rectB : rectA);
    };

    RectangleUtil.isBiggerThan = function(rect, compareToRect){
        return rect.getArea() > compareToRect.getArea();
    };

    RectangleUtil.isBiggerThanOrEqual = function(rect, compareToRect){
        return rect.getArea() >= compareToRect.getArea();
    };

    RectangleUtil.isSmallerThan = function(rect, compareToRect){
        return rect.getArea() < compareToRect.getArea();
    };

    RectangleUtil.isSmallerThanOrEqual = function(rect, compareToRect){
        return rect.getArea() <= compareToRect.getArea();
    };
    
    RectangleUtil.createRandomXIn = function(rect){
        return MathUtil.getRandomNumberInRange(rect.x, rect.right());
    };

    RectangleUtil.createRandomYIn = function(rect){
        return MathUtil.getRandomNumberInRange(rect.y, rect.bottom());
    };

    RectangleUtil.rectanglesIntersect = function(rectA, rectB){
        return  rectA.containsPoint(rectB.x, rectB.y) ||
            rectA.containsPoint(rectB.right(), rectB.y) ||
            rectA.containsPoint(rectB.right(), rectB.bottom()) ||
            rectA.containsPoint(rectB.x, rectB.bottom());
    };

    RectangleUtil.getIntersectingRectangle = function(rectA, rectB){
        //console.log("RectangleUtil.getIntersectingRectangle()", rectA.toString(), rectB.toString());
        if(!RectangleUtil.rectanglesIntersect(rectA,rectB)){
            console.log("\tno intersection found");
            return null;
        }
        if(rectA.containsRect(rectB)){
            return rectB;
        }
        if(rectB.containsRect(rectA)){
            return rectA;
        }

        var x1 = Math.max(rectA.x, rectB.x),
            y1 = Math.max(rectA.y, rectB.y),
            x2 = Math.min(rectA.getRight(), rectB.getRight()),
            y2 = Math.min(rectA.getBottom(), rectB.getBottom());
        return new Rectangle(x1, y1, x2 - x1, y2 - y1);
    };

    RectangleUtil.createRandomRectangleIn = function(rect, minSizeNormal, maxSizeNormal){
        minSizeNormal = minSizeNormal || .1;
        minSizeNormal = MathUtil.clamp(.01, .99, minSizeNormal);
        maxSizeNormal = maxSizeNormal || .9;
        maxSizeNormal = MathUtil.clamp(.01, .99, maxSizeNormal);
        if(minSizeNormal >= maxSizeNormal){
            console.log("RectangleUtil.createRandomRectangleIn invalid size normals, min:", minSizeNormal, "max: ", maxSizeNormal, ", setting to defaults");
            minSizeNormal = .1;
            maxSizeNormal = .9;
        }

        var innerRect = new Rectangle(0, 0,
            MathUtil.getRandomNumberInRange(minSizeNormal * rect.width, maxSizeNormal * rect.width),
            MathUtil.getRandomNumberInRange(minSizeNormal * rect.height, maxSizeNormal * rect.height)
            );
        innerRect.x = Math.random() * (rect.width - innerRect.width);
        innerRect.y = Math.random() * (rect.height - innerRect.height);
        return innerRect;
    };

    //suppoerts any casing variation of "left", "center", "right"
    RectangleUtil.hAlign = function(staticRect, alignedRect, align){
        switch(align.toLowerCase()){
            case "right":
                alignedRect.x = staticRect.right() - alignedRect.width;
                break;
            case "center":
                alignedRect.x = staticRect.centerX() - alignedRect.width * .5;
                break;
            default :
                alignedRect.x = staticRect.x;
        }
    };

    //supports any casing variation of "top", "middle", "bottom"
    RectangleUtil.vAlign = function(staticRect, alignedRect, align){
        switch(align.toLowerCase()){
            case "bottom":
                alignedRect.y = staticRect.bottom() - alignedRect.height;
                break;
            case "middle":
                alignedRect.y = staticRect.centerY() - alignedRect.height * .5;
                break;
            default :
                alignedRect.y = staticRect.y;
        }
    };

    RectangleUtil.align = function(staticRect, alignedRect, hAlign, vAlign){
        this.hAlign(staticRect, alignedRect, hAlign || "left");
        this.vAlign(staticRect, alignedRect, vAlign || "top");
    };

    RectangleUtil.scaleRectToPortraitFit = function(staticRect, rectToScale){
        RectangleUtil.scaleRectToHeight(rectToScale, staticRect.height);
    };

    RectangleUtil.scaleRectToLandscapeFit = function(staticRect, rectToScale){
        RectangleUtil.scaleRectToWidth(rectToScale, staticRect.width);
    };

    RectangleUtil.scaleRectToHeight = function(rect, height){
        rect.width *= (height / rect.height);
        rect.height = height;
    };

    RectangleUtil.scaleRectToWidth = function(rect, width){
        rect.height *= (width / rect.width);
        rect.width = width;
    };

    RectangleUtil.scaleRectTo = function(staticRect, rectToScale){
        var copy = rectToScale.clone();
        RectangleUtil.scaleRectToPortraitFit(staticRect, copy);
        if(copy.width > staticRect.width){
            RectangleUtil.scaleRectToLandscapeFit(staticRect, rectToScale);
        }else{
            rectToScale.updateToRect(copy);
        }
    };

    RectangleUtil.scaleRectDownTo = function(staticRect, rectToScale){
        if(rectToScale.width < staticRect.width && rectToScale.height < staticRect.height){
            return;
        }
        RectangleUtil.scaleRectTo(staticRect, rectToScale);
    };

    RectangleUtil.positionFromNormalRect = function(rect, normalRect, staticRect){
        rect.x = staticRect.x + normalRect.x * staticRect.width;
        rect.y = staticRect.y + normalRect.y * staticRect.height;
        rect.width = normalRect.width * staticRect.width;
        rect.height = normalRect.height * staticRect.height;
    };

}(window));