# Source code of http://www.sakri.net

Built with Vanilla.js and some html5 Canvas fun.

## Also the development grounds of **TangleUI.js**

- A library targeted at Single Page Applications which require **Responsive** Layouts inside the **Html5 Canvas**
- Separates basic layout and transition calculations from App and Component logic
- Centralizes layout/transition definitions and calculations
- Supports html elements whose position/transitions depend on Canvas contents (Negate repetition in JS/CSS)
- Contains minimal animation capabilities
  - is not intended as a replacement for animation libraries like https://greensock.com/
- Expects layout and transition definitions in specified json format
  - layouts are defined as "percent value rectangles" relative to Landscape, Squarish or Vertical screen sizes
- Is queried for layout Rectangles, Transitions and Animations
  - Apps call setLayoutBounds() at startup or resize, only default definitions are calculated
  - remaining calculations are made per query, results are cached until next resize

I have designed **TangleUI** for my own needs following years of wrestling with layout in Flash and Canvas.
I will move it to a repo (and available via node) once I have completed and tested a minimum set of features.

Take a look : [TangleUI](https://github.com/sakri/SakriDotNet/tree/master/js/TangleUI)

Layout definitions : [SakriDotNetLayout](https://github.com/sakri/SakriDotNet/blob/master/js/SakriDotNetTangleUIRects.js)

Transitions definitions : [SakriDotNetTransitions](https://github.com/sakri/SakriDotNet/blob/master/js/SakriDotNetTangleUITransitions.js)

You can currently see implementations in SakriDotNetHomeApp.js, SakriDotNetLoader.js and MenuButton.js

If you are interested in **TangleUI**, or like what you see in general,
contact me at sakri.rosenstrom@gmail.com

Thanks for having a look, a good day to you!

Sakri