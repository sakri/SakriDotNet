(function (){

    window.MathUtil = {};

    MathUtil.PI2 = Math.PI * 2;
    MathUtil.HALF_PI = Math.PI * .5;
    MathUtil.PI_AND_HALF = Math.PI + Math.PI * .5;

    MathUtil.GOLDEN_RATIO_TOP = .382;
    MathUtil.GOLDEN_RATIO_BOTTOM = .618;

    //return number between 1 and 0
    MathUtil.normalize = function(value, min, max){
        return (value - min) / (max - min);
    };

    //map normalized number to values
    MathUtil.interpolate = function(normal, min, max){
        return min + (max - min) * normal;
    };

    //map a value from one set to another
    MathUtil.map = function(value, min1, max1, min2, max2){
        return MathUtil.interpolate( MathUtil.normalize(value, min1, max1), min2, max2);
    };

    //https://github.com/gre/smoothstep/blob/master/index.js
    MathUtil.smoothstep = function(value, min, max) {
        var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
        return x * x * (3 - 2 * x);
    };

    //TODO: Add comment to describle what these two are
    MathUtil.calculate010Normal = function(normal, bumpNormal){
        if(normal < bumpNormal){
            return normal / bumpNormal;
        }
        return 1 - (normal - bumpNormal) / (1 - bumpNormal);
    };

    MathUtil.calculate101Normal = function(normal, bumpNormal){
        if(normal < bumpNormal){
            return 1 - normal / bumpNormal;
        }
        return (normal - bumpNormal) / (1 - bumpNormal);
    };

    MathUtil.clamp = function(value, min, max){
        return Math.max(min, Math.min(value, max));
    };

    MathUtil.clampRGB = function(value){
        return MathUtil.clamp(0, 255, Math.round(value));
    };

    MathUtil.getRandomNumberInRange = function(min, max){
        return min + Math.random() * (max - min);
    };

    MathUtil.getRGBValue = function(){
        return Math.floor(Math.random() * 255);//this is a bit silly isn't it?
    };

    //from : http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    MathUtil.getRandomHexColorString = function() {
        return MathUtil.rgbToHex( MathUtil.getRGBValue(), MathUtil.getRGBValue(), MathUtil.getRGBValue() );
    };

    MathUtil.getRandomRGBColorString = function(){
        return "rgb(" + MathUtil.getRGBValue() + ", " + MathUtil.getRGBValue() + ", " + MathUtil.getRGBValue() + ")";
    };

    MathUtil.getRandomRGBAColorString = function(alpha){
        return "rgba(" + MathUtil.getRGBValue() + ", " + MathUtil.getRGBValue() + ", " + MathUtil.getRGBValue() + ", " + alpha || Math.random() + ")";
    };

    MathUtil.createRGBAColorString = function(r, g, b, a){
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    };

    //from : http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    MathUtil.rgbToHex = function(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    MathUtil.hexToRgb = function(hex, resultObject) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if(!result){
            return null;
        }
        var object = resultObject || {};
        object.r = parseInt(result[1], 16);
        object.g = parseInt(result[2], 16);
        object.b = parseInt(result[3], 16);
        return object;
    };

    /*
        //not tested
    //from : http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    MathUtil.rgbaToHex = function(r, g, b, a) {
        return "#" + ((1 << 32) + (r << 24) + (g << 16) + (b << 8) + a).toString(16).slice(1);
    };

    MathUtil.hexToRgba = function(hex, resultObject) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b, a) {
            return r + r + g + g + b + b + a + a;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if(!result){
            return null;
        }
        var object = resultObject || {};
        object.r = parseInt(result[1], 16);
        object.g = parseInt(result[2], 16);
        object.b = parseInt(result[3], 16);
        object.a = parseInt(result[4], 16);
        return object;
    };
    */

}());