
/**
 * Created by sakri on 3-7-14.
 */
/*
 //SPRITE SHEET SERVICE
 function spriteSheetService() {


 var spriteSheetImage = new Image();
 var spriteSheetCanvas = document.createElement("canvas");

 var spriteSheetContext;
 var upButton, downButton, leftButton, rightButton;
 var upButtonUpRect =        {x:60, y:0, w:66, h:15};
 var upButtonDownRect =      {x:60, y:15, w:66, h:15};
 var downButtonUpRect =      {x:60, y:30, w:66, h:15};
 var downButtonDownRect =    {x:60, y:45, w:66, h:15};
 var leftButtonUpRect =      {x:0, y:0, w:15, h:66};
 var leftButtonDownRect =    {x:15, y:0, w:15, h:66};
 var rightButtonUpRect =     {x:45, y:0,  w:15, h:66};
 var rightButtonDownRect =   {x:30, y:0,  w:15, h:66};

 function loadPortfolioControllerSpriteSheet(callBack){
 spriteSheetImage.src = spriteSheetImage;
 spriteSheetImage.onload = function(){
 spriteSheetCanvas.width = spriteSheetImage.width;
 spriteSheetCanvas.height = spriteSheetImage.height;
 var spriteSheetContext = spriteSheetCanvas.getContext("2d");
 callBack();
 }
 }

 this.getSpriteSheetImageDataFromRect = function(rect){
 return spriteSheetContext.getImageData(rect.x, rect.y, rect.width, rect.height);
 };

 this.drawSpriteSheetImageToContext = function(context, rect, x, y){
 context.drawImage(spriteSheetImage, rect.x, rect.y, rect.width, rect.height, x, y, rect.width, rect.height);
 };

 this.renderButtonUpState = function(context, button, x, y){
 context.putImageData(button.up, x, y);
 };

 this.renderButtonDownState = function(context, button, x, y){
 context.putImageData(button.down, x, y);
 };

 function createButtonImageDataFromSpriteSheetRects(upRect, downRect){
 var button = {};
 button.up = this.getSpriteSheetImageDataFromRect(upRect);
 button.down = this.getSpriteSheetImageDataFromRect(downRect);
 return button;
 }

 this.getUpButtonImageDataObject = function(){
 if(!upButton){
 upButton = createButtonImageDataFromSpriteSheetRects(upButtonUpRect, upButtonDownRect);
 }
 return upButton
 }

 this.getDownButtonImageDataObject = function(){
 if(!downButton){
 downButton = createButtonImageDataFromSpriteSheetRects(downButtonUpRect, downButtonDownRect);
 }
 return downButton;
 }

 this.getLeftButtonImageDataObject = function(){
 if(!leftButton){
 downButton = createButtonImageDataFromSpriteSheetRects(upButtonUpRect, upButtonDownRect);
 }
 return leftButton;
 }

 this.getRightButtonImageDataObject = function(){
 if(!rightButton){
 rightButton = createButtonImageDataFromSpriteSheetRects(downButtonUpRect, downButtonDownRect);
 }
 return rightButton;
 }
 }
 */