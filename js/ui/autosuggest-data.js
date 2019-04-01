// Helper functionality for the Scratchpad auto suggest feature
window.ScratchpadAutosuggestData = {
    _keywords: {
        type: i18n._("keyword"),
        whitelist: ["break", "case", "catch", "continue", "default", "delete",
            "do", "else", "finally",
            /*
             * This is possible, but some may find it too annoying
            {
                name: "for",
                description: "Example: for (var x = 0; x < 10; x++) { }",
                isFunction: false
            },
            */
            "for", "function", "if", "in", "instanceof", "new", "return",
            "switch", "this", "throw", "try", "typeof", "var", "void",
            "while", "with"]
    },
    _pjsFunctions: {
        type: i18n._("function"),
        whitelist: [
            {
                name: "rect(x, y, width, height, radius*)",
                exampleURL: "/cs/rectx-y-w-h/839496660",
                description: i18n._("Draws a rectangle, using the first two coordinates as the top left corner and the last two as the width/height. For alternate ways to position, see rectMode."),
                params: [
                    i18n._("x: the x-coordinate of the top left corner"),
                    i18n._("y: the y-coordinate of the top left corner"),
                    i18n._("width: the width of the rectangle"),
                    i18n._("height: the height of the rectangle"),
                    i18n._("radius:(Optional) the radius of the corners, to round the rectangle")
                ]
            },
            {
                name: "ellipse(x, y, w, h)",
                exampleURL: "/cs/ellipsex-y-w-h/839435680",
                description: i18n._("Draws an ellipse, using the first two parameters as the center coordinates and the last two as the width/height. For alternate ways to position, see ellipseMode."),
                params: [
                    i18n._("x: the x-coordinate of the center"),
                    i18n._("y: the y-coordinate of the center"),
                    i18n._("width: the width of the ellipse"),
                    i18n._("height: the height of the ellipse")
                ]
            },
            {
                name: "triangle(x1, y1, x2, y2, x3, y3)",
                exampleURL: "/cs/trianglex1-y1-x2-y2-x3-y3/839546599",
                description: i18n._("Draws a triangle"),
                params: [
                    i18n._("x1: the x-coordinate of the first vertex"),
                    i18n._("y1: the y-coordinate of the first vertex"),
                    i18n._("x2: the x-coordinate of the second vertex"),
                    i18n._("y2: the y-coordinate of the second vertex"),
                    i18n._("x3: the x-coordinate of the third vertex"),
                    i18n._("y3: the y-coordinate of the third vertex")
                ]
            },
            {
                name: "line(x1, y1, x2, y2)",
                exampleURL: "/cs/linex1-y1-x2-y2/827916099",
                description:
                    i18n._("Draws a line from one point to another. The color of the line is determined by the most recent stroke() call. The thickness of the line is determined by the most recent strokeWeight() call. The line ending style can be changed using strokeCap()."),
                params: [
                    i18n._("x1: the x-coordinate of the first point"),
                    i18n._("y1: the y-coordinate of the first point"),
                    i18n._("x2: the x-coordinate of the second point"),
                    i18n._("y2: the y-coordinate of the second point")
                ]
            },
            {
                name: "point(x, y)",
                exampleURL: "/cs/pointx-y/827809834",
                description: i18n._("Draws a point. The color is determined by the most recent stroke() call and the thickness is determined by the most recent strokeWeight() call."),
                params: [
                    i18n._("x: the x-coordinate of the point"),
                    i18n._("y: the y-coordinate of the point")
                ]
            },
            {
                name: "arc(x, y, w, h, start, stop)",
                exampleURL: "/cs/arcx-y-w-h-start-stop/1903619297",
                description: i18n._("Draws an arc.   It is very similar to an ellipse(), except that the final two parameters, start and stop, decide how much of the ellipse to draw."),
                params: [
                    i18n._("x: The x-coordinate of the center of the complete ellipse derived from the arc"),
                    i18n._("y: The y-coordinate of the center of the complete ellipse derived from the arc"),
                    i18n._("width: The width of the complete ellipse formed by the partial arc"),
                    i18n._("height: The height of the complete ellipse formed by the partial arc"),
                    i18n._("start: The angle to start the arc at"),
                    i18n._("stop: The angle to stop the arc at")
                ]
            },
            {
                name: "bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2)",
                exampleURL: "/cs/bezierx1-y1-cx1-cy1-cx2-cy2-x2-y2/956920482",
                description: i18n._("Draws a bezier curve. To extract points and tangents after drawing the curve, use bezierPoint() and bezierTangent()."),
                params: [
                    i18n._("x1: the x-coordinate of the first endpoint"),
                    i18n._("y1: the y-coordinate of the first endpoint"),
                    i18n._("cx1: the x-coordinate of the first control point"),
                    i18n._("cy1: the y-coordinate of the first control point"),
                    i18n._("cx2: the x-coordinate of the second control point"),
                    i18n._("cy2: the y-coordinate of the second control point"),
                    i18n._("x2: the x-coordinate of the second endpoint"),
                    i18n._("y2: the y-coordinate of the second endpoint")
                ]
            },
            {
                name: "quad(x1, y1, x2, y2, x3, y3, x4, y4)",
                exampleURL: "/cs/quadx1-y1-x2-y2-x3-y3-x4-y4/1907244018",
                description: i18n._("Draws any quadrilateral, with the points listed as parameters in a clockwise or counter-clockwise direction."),
                params: [
                    i18n._("x1: the x-coordinate of the first vertex"),
                    i18n._("y1: the y-coordinate of the first vertex"),
                    i18n._("x2: the x-coordinate of the second vertex"),
                    i18n._("y2: the y-coordinate of the second vertex"),
                    i18n._("x3: the x-coordinate of the third vertex"),
                    i18n._("y3: the y-coordinate of the third vertex"),
                    i18n._("x4: the x-coordinate of the fourth vertex"),
                    i18n._("y4: the y-coordinate of the fourth vertex")
                ]
            },
            {
                name: "image(image, x, y, width*, height*)",
                exampleURL: "/cs/imageimage-x-y/937672662",
                description: i18n._("Draw an image on the canvas. The only allowed images are those that popup in the image picker when you use the getImage() method. The image is positioned using the x/y as the upper left corner. For alternate ways to position images, see imageMode."),
                params: [
                    i18n._("image: an image returned by getImage()"),
                    i18n._("x: the x-coordinate of the top left corner"),
                    i18n._("y: the y-coordinate of the top left corner"),
                    i18n._("width: (Optional) the width of the drawn image"),
                    i18n._("height: (Optional) the height of the drawn image")
                ]
            },
            {
                name: "playSound(sound)",
                exampleURL: "/cs/playsoundsound/6655307787534336",
                description: i18n._("Plays a short sound. The only allowed sounds are those that popup in the picker when you use the getSound() method."),
                params: [
                    i18n._("sound: a sound returned by getSound()")
                ]
            },
            {
                name: "rectMode(MODE)",
                exampleURL: "/cs/rectmodemode/4556457341091840",
                description: i18n._("Modifies the location from which rectangles draw."),
                params: [
                    i18n._("MODE: The mode, either CORNER, CORNERS, CENTER, or RADIUS. The default is CORNER.")
                ]
            },
            {
                name: "ellipseMode(MODE)",
                exampleURL: "cs/ellipsemodemode/6709863212122112",
                description: i18n._("Changes how ellipses are drawn."),
                params: [
                    i18n._("MODE: The mode, either CORNER, CORNERS, CENTER, or RADIUS. The default is CENTER.")
                ]
            },
            {
                name: "imageMode(MODE)",
                exampleURL: "/cs/imagemodemode/5295050787389440",
                description: i18n._("Modifies the location from which images are drawn."),
                params: [
                    i18n._("MODE: Either CENTER, CORNERS, or CORNER. The default is CORNER.")
                ]
            },
            {
                name: "bezierPoint(a, b, c, d, t)",
                exampleURL: "/cs/bezierpointa-b-c-d-t/4551007698681856",
                description: i18n._("Evaluates the Bezier at point t for points a, b, c, d. The parameter t varies between 0 and 1, a and d are points on the curve, and b and c are the control points. This can be done once with the x coordinates and a second time with the y coordinates to get the location of a bezier curve at t."),
                params: [
                    i18n._("a: coordinate of first point on the curve"),
                    i18n._("b: coordinate of first control point"),
                    i18n._("c: coordinate of second control point"),
                    i18n._("d: coordinate of second point on the curve"),
                    i18n._("t: value between 0 and 1")
                ]
            },
            {
                name: "bezierTangent(a, b, c, d, t)",
                exampleURL: "/cs/beziertangenta-b-c-d-t/4736929853603840",
                description: i18n._("Calculates the tangent of a point on a bezier curve. The parameter t varies between 0 and 1, a and d are points on the curve, and b and c are the control points. This can be done once with the x coordinates and a second time with the y coordinates to get the tangent of a bezier curve at t."),
                params: [
                    i18n._("a: coordinate of first point on the curve"),
                    i18n._("b: coordinate of first control point"),
                    i18n._("c: coordinate of second control point"),
                    i18n._("d: coordinate of second point on the curve"),
                    i18n._("t: value between 0 and 1")
                ]
            },
            {
                name: "bezierVertex(cx1, cy1, cx2, cy2, x, y)",
                exampleURL: "/cs/beziervertexcx1-cy1-cx2-cy2-x-y/5085481683386368",
                description: i18n._("Used in conjunction with beginShape() and endShape() to draw shapes with bezier curves for sides. Each call to bezierVertex() defines the position of two control points and one anchor point of a Bezier curve, adding a new segment to a line or shape. The first time bezierVertex() is used within a beginShape() call, it must be prefaced with a call to vertex() to set the first anchor point. When using this function, do *not* specify a mode in beginShape()."),
                params: [
                    i18n._("cx1: The x-coordinate of 1st control point"),
                    i18n._("cy1: The y-coordinate of 1st control point"),
                    i18n._("cx2: The x-coordinate of 2nd control point"),
                    i18n._("cy2: The y-coordinate of 2nd control point"),
                    i18n._("x: The x-coordinate of anchor point"),
                    i18n._("y: The y-coordinate of anchor point")
                ]
            },
            {
                name: "curve(x1, y1, x2, y2, x3, y3, x4, y4)",
                exampleURL: "/cs/curve/5105742184972288",
                description: i18n._("Draws a curved line on the screen. The first and second parameters specify the first anchor point and the last two parameters specify the second anchor. The middle parameters specify the points for defining the shape of the curve. Longer curves can be created by putting a series of curve() functions together. An additional function called curveTightness() provides control for the visual quality of the curve. The curve() function is an implementation of Catmull-Rom splines."),
                params: [
                    i18n._("x1: the x coordinate of first anchor point"),
                    i18n._("y1: the y coordinate of first anchor point"),
                    i18n._("x2: the x coordinate of first point"),
                    i18n._("y2: the y coordinate of first point"),
                    i18n._("x3: the x coordinate of second point"),
                    i18n._("y3: the y coordinate of second point"),
                    i18n._("x4: the x coordinate of second anchor point"),
                    i18n._("y4: the y coordinate of second anchor point")
                ]
            },
            {
                name: "curvePoint(a, b, c, d, t)",
                exampleURL: "/cs/curvepointa-b-c-d-t/5879387094253568",
                description: i18n._("Evalutes the curve at point t for points a, b, c, d. The parameter t varies between 0 and 1, a and d are points on the curve, and b and c are the control points. This can be done once with the x coordinates and a second time with the y coordinates to get the location of a curve at t."),
                params: [
                    i18n._("a: the coordinate of the first point"),
                    i18n._("b: the coordinate of the first control point"),
                    i18n._("c: the coordinate of the second control point"),
                    i18n._("d: the coordinate of the second point"),
                    i18n._("t: the a value between 0 and 1")
                ]
            },
            {
                name: "curveTangent(a, b, c, d, t)",
                exampleURL: "/cs/curvetangenta-b-c-d-t/4708940860358656",
                description: i18n._("Calculates the tangent of a point on a curve. The parameter t varies between 0 and 1, a and d are points on the curve, and b and c are the control points. This can be done once with the x coordinates and a second time with the y coordinates to get the tangent of a curve at t."),
                params: [
                    i18n._("a: the coordinate of the first point"),
                    i18n._("b: the coordinate of the first control point"),
                    i18n._("c: the coordinate of the second control point"),
                    i18n._("d: the coordinate of the second point"),
                    i18n._("t: the a value between 0 and 1")
                ]
            },
            {
                name: "curveTightness(tightness)",
                exampleURL: "/cs/curvetightnesssquishy/4792873740402688",
                description: i18n._("Modifies the quality of forms created with curve() and curveVertex(). The tightness parameter determines how the curve fits to the vertex points."),
                params: [
                    i18n._("tightness: amount of deformation from the original vertices")
                ]
            },
            {
                name: "curveVertex(x,y)",
                exampleURL: "/cs/curvevertexx-y/6499542019080192",
                description: i18n._("Used in conjunction with beginShape() and endShape() to draw shapes with bezier curves for sides. The first and last points in a series of curveVertex() lines will be used to guide the beginning and end of the curve."),
                params: [
                    i18n._("x: the x-coordinate of the vertex"),
                    i18n._("y: the y-coordinate of the vertex")
                ]
            },
            {
                name: "beginShape(MODE*)",
                exampleURL: "/cs/beginshapeendshape/5462945756610560",
                description: i18n._("Using the beginShape() and endShape() functions allow creating more complex forms. To start a form, call beginShape(), then use the vertex() command, then call endShape() to stop. By default, it creates an irregular polygon, but you can control that by sending a mode to beginShape().  Transformations such as translate(), rotate(), and scale() do not work within beginShape(). It is also not possible to use other shapes, such as ellipse() or rect() within beginShape()."),
                params: [
                    i18n._("MODE: (Optional) Shape mode. Either POINTS, LINES, TRIANGLES, TRIANGLE_FAN, TRIANGLE_STRIP, QUADS, and QUAD_STRIP")
                ]
            },
            {
                name: "endShape(MODE*)",
                exampleURL: "/cs/beginshapeendshape/5462945756610560",
                description: i18n._("Using the beginShape() and endShape() functions allow creating more complex forms. To start a form, call beginShape(), then use the vertex() command, then call endShape() to stop. By default, it creates an irregular polygon, but you can control that by sending a mode to beginShape().  Transformations such as translate(), rotate(), and scale() do not work within beginShape(). It is also not possible to use other shapes, such as ellipse() or rect() within beginShape()."),
                params: [
                    i18n._("MODE: (Optional) Specify CLOSE to close the shape.")
                ]
            },
            {
                name: "vertex(x, y)",
                exampleURL: "/cs/beginshapeendshape/5462945756610560",
                description: i18n._("Using the beginShape() and endShape() functions allow creating more complex forms. To start a form, call beginShape(), then use the vertex() command, then call endShape() to stop. By default, it creates an irregular polygon, but you can control that by sending a mode to beginShape().  Transformations such as translate(), rotate(), and scale() do not work within beginShape(). It is also not possible to use other shapes, such as ellipse() or rect() within beginShape()."),
                params: [
                    i18n._("x: the x-coordinate of the vertex"),
                    i18n._("y: the y-coordinate of the vertex")
                ]
            },
            {
                name: "background(r, g, b, a*)",
                exampleURL: "/cs/backgroundr-g-b/839653892",
                description: i18n._("Sets the background color of the canvas. Note that calling this will color over anything drawn before the command."),
                params: [
                    i18n._("r: amount of red, ranges from 0 to 255"),
                    i18n._("g: amount of green, ranges from 0 to 255"),
                    i18n._("b: amount of blue, ranges from 0 to 255"),
                    i18n._("a: (Optional) transparency, ranges from 0 to 255")
                ]
            },
            {
                name: "fill(r, g, b, a*)",
                exampleURL: "/cs/fillr-g-b/839774957",
                description: i18n._("Sets the fill color for all shapes drawn after the function call."),
                params: [
                    i18n._("r: amount of red, ranges from 0 to 255"),
                    i18n._("g: amount of green, ranges from 0 to 255"),
                    i18n._("b: amount of blue, ranges from 0 to 255"),
                    i18n._("a: (Optional) transparency, ranges from 0 to 255")
                ]
            },
            {
                name: "stroke(r, g, b, a*)",
                exampleURL: "/cs/stroker-g-b/839545910",
                description: i18n._("Sets the outline color for all shapes drawn after the function call."),
                params: [
                    i18n._("r: amount of red, ranges from 0 to 255"),
                    i18n._("g: amount of green, ranges from 0 to 255"),
                    i18n._("b: amount of blue, ranges from 0 to 255"),
                    i18n._("a: (Optional) transparency, ranges from 0 to 255")
                ]
            },
            {
                name: "color(r, g, b, a*)",
                exampleURL: "/cs/colorr-g-b/957020020",
                description: i18n._("This function lets you store all three color components in a single variable. You can then pass that one variable to functions like background(), stroke(), and fill()."),
                params: [
                    i18n._("r: amount of red, ranges from 0 to 255"),
                    i18n._("g: amount of green, ranges from 0 to 255"),
                    i18n._("b: amount of blue, ranges from 0 to 255"),
                    i18n._("a: (Optional) transparency, ranges from 0 to 255")
                ]
            },
            {
                name: "noFill()",
                exampleURL: "/cs/nofill/877946290",
                description: i18n._("Makes all shapes drawn after this function call transparent.")
            },
            {
                name:"noStroke()",
                exampleURL: "/cs/nostroke/839859412",
                description: i18n._("Disables outlines for all shapes drawn after the function call.")
            },
            {
                name: "strokeWeight(thickness)",
                exampleURL: "/cs/strokeweightthickness/877859744",
                description: i18n._("Sets the thickness of all lines and outlines drawn after the function call."),
                params: [
                    i18n._("thickness: a number specifying the thickness")
                ]
            },
            {
                name: "strokeJoin(MODE)",
                exampleURL: "/cs/strokejoinmode/5662070842327040",
                description: i18n._("Sets the style of the joints which connect line segments drawn with vertex(). These joints are either mitered, beveled, or rounded and specified with the corresponding parameters MITER, BEVEL, and ROUND."),
                params: [
                    i18n._("MODE: Either MITER, BEVEL, or ROUND. The default is MITER.")
                ]
            },
            {
                name: "strokeCap(MODE)",
                exampleURL: "/cs/strokecapmode/5288182060941312",
                description: i18n._("Sets the style for rendering line endings. These ends are either squared, extended, or rounded and specified with the corresponding parameters SQUARE, PROJECT, and ROUND."),
                params: [
                    i18n._("MODE: Either SQUARE, PROJECT, or ROUND. The default is ROUND")
                ]
            },
            {
                name: "blendColor(c1, c2, MODE)",
                exampleURL: "/cs/blendcolorc1-c2-mode/4530750216994816",
                description: i18n._("Blends two color values together based on the blending mode given as the MODE parameter."),
                params: [
                    i18n._("c1: The first color to blend"),
                    i18n._("c2: The second color to blend"),
                    i18n._("MODE: Either BLEND, ADD, SUBTRACT, DARKEST, LIGHTEST, DIFFERENCE, EXCLUSION, MULTIPLY, SCREEN, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, or BURN.")
                ]
            },
            {
                name: "lerpColor(c1, c2, amount)",
                exampleURL: "/cs/lerpcolorc1-c2-amount/4759935778816000",
                description: i18n._("Calculates a color or colors between two color at a specific increment. The amount parameter is the amount to interpolate between the two values where 0.0 equal to the first point, 0.1 is very near the first point, 0.5 is half-way in between, etc."),
                params: [
                    i18n._("c1: Interpolate from this color"),
                    i18n._("c2: Interpolate to this color")
                ]
            },
            {
                name: "colorMode(MODE)",
                exampleURL: "/cs/colormode/5833774306689024",
                description: i18n._("Changes the way that color values are interpreted when set by fill()/stroke()/background()."),
                params: [
                    i18n._("MODE: Either RGB or HSB. The default is RGB.")
                ]
            },
            {
                name: "red(color)",
                exampleURL: "/cs/redcolor/5102159326609408",
                description: i18n._("Extracts the red value from a color, scaled to match current colorMode()."),
                params: [
                    i18n._("color: Any color data type")
                ]
            },
            {
                name: "green(color)",
                exampleURL: "/cs/greencolor/5877638103040000",
                description: i18n._("Extracts the green value from a color, scaled to match current colorMode()."),
                params: [
                    i18n._("color: Any color data type")
                ]
            },
            {
                name: "blue(color)",
                exampleURL: "/cs/bluecolor/5177743654256640",
                description: i18n._("Extracts the blue value from a color, scaled to match current colorMode()."),
                params: [
                    i18n._("color: Any color data type")
                ]
            },
            {
                name: "alpha(color)",
                exampleURL: "/cs/alphacolor/6687311345483776",
                description: i18n._("Extracts the alpha value from a color."),
                params: [
                    i18n._("color: Any color data type")
                ]
            },
            {
                name: "hue(color)",
                exampleURL: "/cs/huecolor/6620387366404096",
                description: i18n._("Extracts the hue value from a color."),
                params: [
                    i18n._("color: Any color data type")
                ]
            },
            {
                name: "saturation(color)",
                exampleURL: "/cs/saturationcolor/6358678768713728",
                description: i18n._("Extracts the saturation value from a color."),
                params: [
                    i18n._("color: Any color data type")
                ]
            },
            {
                name: "brightness(color)",
                exampleURL: "/cs/brightnesscolor/5888575639912448",
                description: i18n._("Extracts the brightness value from a color."),
                params: [
                    i18n._("color: Any color data type")
                ]
            },
            {
                name: "text(message, x, y, width*, height*)",
                exampleURL: "/cs/texttext-x-y/937624625",
                description: i18n._("Draws a string of text at the specified location"),
                params: [
                    i18n._("message: the string of text to display"),
                    i18n._("x: the x-coordinate of the bottom left corner"),
                    i18n._("y: the y-coordinate of the bottom left corner"),
                    i18n._("width: (Optional) the width of the box for text to auto wrap inside"),
                    i18n._("height: (Optional) the height of the box for text to auto wrap inside")
                ]
            },
            {
                name: "textFont(font, size*)",
                exampleURL: "/cs/textfontfont-size/940030209",
                description: i18n._("Using textFont() with createFont(), it's possible to change the font of text drawn."),
                params: [
                    i18n._("font: A font returned by the createFont function"),
                    i18n._("size: (Optional) The size of the font, in pixels")
                ]
            },
            {
                name: "createFont(name, size*)",
                exampleURL: "/cs/textfontfont-size/940030209",
                description: i18n._("Using textFont() with createFont(), it's possible to change the font of text drawn."),
                params: [
                    i18n._("name: A font name, either \"sans-serif\", \"serif\", \"monospace\", \"fantasy\", or \"cursive\""),
                    i18n._("size: (Optional) The size of the font, in pixels")
                ]
            },
            {
                name: "textSize(size)",
                exampleURL: "/cs/textsizesize/937728198",
                description: i18n._("Changes the size of text being drawn."),
                params: [
                    i18n._("size: The size of the text, in pixels")
                ]
            },
            {
                name: "textWidth(str)",
                exampleURL: "/cs/textwidthstr/4799257177489408",
                description: i18n._("Calculates and returns the width of any string."),
                params: [
                    i18n._("str: The string to calculate the width of")
                ]
            },
            {
                name: "textAscent()",
                exampleURL: "/cs/textascent/5975406490419200",
                description: i18n._("Returns the ascent of the current font at its current size. This information is useful for determining the height of the font above the baseline. For example, adding the textAscent() and textDescent() values will give you the total height of the line.")
            },
            {
                name: "textDescent()",
                exampleURL: "/cs/textdescent/5638769772331008",
                description: i18n._("Returns descent of the current font at its current size. This information is useful for determining the height of the font below the baseline. For example, adding the textAscent() and textDescent() values will give you the total height of the line.")
            },
            {
                name: "textLeading(dist)",
                exampleURL: "/cs/textleadingdist/6369013500215296",
                description: i18n._("Sets the spacing between lines of text in units of pixels. This setting will be used in all subsequent calls to the text() function."),
                params: [
                    i18n._("dist: The size in pixels for spacing between lines")
                ]
            },
            {
                name: "textAlign(ALIGN, YALIGN)",
                exampleURL: "/cs/textalignalign-yalign/4508437190803456",
                description: i18n._("Sets the current alignment for drawing text. The first parameter is used to set the display characteristics of the letters in relation to the values for the x and y parameters of the text() function.  The second parameter is used to vertically align the text. BASELINE is the default setting, if textAlign is not used. The TOP and CENTER parameters are straightforward. The BOTTOM parameter offsets the line based on the current textDescent(). For multiple lines, the final line will be aligned to the bottom, with the previous lines appearing above it."),
                params: [
                    i18n._("ALIGN: Horizontal alignment, either LEFT, CENTER, or RIGHT"),
                    i18n._("YALIGN: Vertical alignment, either TOP, BOTTOM, CENTER, or BASELINE")
                ]
            },
            {
                name: "rotate(angle)",
                exampleURL: "/cs/rotateangle/6386091934351360",
                description: i18n._("Sets the rotation angle for any shapes drawn after the command. If called multiple times, the angle will be added to the previous angle (accumulative effect). To stop rotation, use pushMatrix()/popMatrix()."),
                params: [
                    i18n._("angle: The number of degrees to rotate by. To specify in radians, use the angleMode() function.")
                ]
            },
            {
                name: "scale(amount, amountY*)",
                exampleURL: "/cs/scalex-y/6712922034143232",
                description: i18n._("Increases the size of shapes drawn after the command, by expanding and contracting vertices. For example, scale(2) makes it increase in size by 200%. If called multiple times, the sizes will multiply (accumulative effect). It can be called with one parameter to resize the same in both dimensions, or with two parameters to size differently in each dimension.  To stop resizing shapes, use pushMatrix()/popMatrix()."),
                params: [
                    i18n._("amount: The amount to scale object in \"x\" and \"y\" axis"),
                    i18n._("amountY: (Optional) The amount to scale object in \"y\" axis")
                ]
            },
            {
                name: "translate(x, y)",
                exampleURL: "/cs/translatex-y/6505693083336704",
                description: i18n._("Displaces the drawn shapes by a given amount in the x/y directions. If called multiple times, the offsets will be added to each other (accumulative effect). To stop translating shapes, use pushMatrix()/popMatrix()."),
                params: [
                    i18n._("x: The amount to translate left/right."),
                    i18n._("y: The amount to translate up/down.")
                ]
            },
            {
                name: "pushMatrix()",
                exampleURL: "/cs/pushmatrixpopmatrix/5505194477486080",
                description: i18n._("Remembers the current coordinate system (in the \"matrix stack\").")
            },
            {
                name: "popMatrix()",
                exampleURL: "/cs/pushmatrixpopmatrix/5505194477486080",
                description: i18n._("Restores the previous coordinate system (from the \"matrix stack\") - whatever was most recently pushed.")
            },
            {
                name: "resetMatrix()",
                exampleURL: "/cs/resetmatrix/4597705468805120",
                description: i18n._("Replaces the current transformation matrix with the identity matrix. This effectively clears all transformation functions set before it.")
            },
            {
                name: "printMatrix()",
                exampleURL: "/cs/printmatrix/5934612152844288",
                description: i18n._("Prints the current transformation matrix to the console.")
            },
            {
                name: "frameRate(fps)",
                exampleURL: "/cs/frameratefps/6427359154536448",
                description: i18n._("Specifies the number of frames to be displayed every second. If the processor is not fast enough to maintain the specified rate, it will not be achieved. For fluid animation, at least 24 frames per second is recommended."),
                params: [
                    i18n._("fps: A whole number, number of frames per second")
                ]
            },
            {
                name: "loop()",
                exampleURL: "/cs/loop/5519218351013888",
                description: i18n._("Causes the program to continuously execute the code within draw(). If noLoop() is called, the code in draw() stops executing.")
            },
            {
                name: "noLoop()",
                exampleURL: "/cs/noloop/6342789906300928",
                description: i18n._("Stops the program from continuously executing the code within draw(). If loop() is called, the code in draw() begin to run continuously again.")
            },
            {
                name: "random(low, high)",
                exampleURL: "/cs/randomlow-high/827911487",
                description: i18n._("Returns a random number between low and high."),
                params: [
                    i18n._("low: the lowest possible number returned"),
                    i18n._("high: the highest possible number returned")
                ]
            },
            {
                name: "dist(x1, y1, x2, y2)",
                exampleURL: "/cs/distx1-y1-x2-y2/1917352082",
                description: i18n._("Calculates the distance between two points, (x1, y1) and (x2, y2)."),
                params: [
                    i18n._("x1: the x-coordinate of the first point"),
                    i18n._("y1: the y-coordinate of the first point"),
                    i18n._("x2: the x-coordinate of the second point"),
                    i18n._("y2: the y-coordinate of the second point")
                ]
            },
            {
                name: "constrain(value, min, max)",
                exampleURL: "/cs/constrainvalue-min-max/5870136103796736",
                description: i18n._("Constrains a value to not exceed a maximum and minimum value."),
                params: [
                    i18n._("value: The value to constrain"),
                    i18n._("min: The minimum limit"),
                    i18n._("max: The maximum limit")
                ]
            },
            {
                name: "min(num1, num2)",
                exampleURL: "/cs/minnum1-num2/4693347713155072",
                description: i18n._("Returns the smallest value of all values passed in."),
                params: [
                    i18n._("num1: The first value to compare, any number."),
                    i18n._("num2: The second value to compare, any number.")
                ]
            },
            {
                name: "max(num1, num2)",
                exampleURL: "/cs/maxnum1-num2/4755409722146816",
                description: i18n._("Returns the greatest value of all values passed in."),
                params: [
                    i18n._("num1: The first value to compare, any number."),
                    i18n._("num2: The second value to compare, any number.")
                ]
            },
            {
                name: "abs(num)",
                exampleURL: "/cs/absnum/877930637",
                description: i18n._("Returns the absolute value of a number"),
                params: [
                    i18n._("num: The number to take the absolute value of")
                ]
            },
            {
                name: "log(num)",
                exampleURL: "/cs/lognum/877921884",
                description: i18n._("Returns the the natural logarithm (base-e) of a number."),
                params: [
                    i18n._("num: The number to take the log of")
                ]
            },
            {
                name: "pow(num, exponent)",
                exampleURL: "/cs/pownum-exponent/877858853",
                description: i18n._("Returns a number raised to an exponential power."),
                params: [
                    i18n._("num: The base of the exponential expression"),
                    i18n._("exponent: The power to which the num is raised")
                ]
            },
            {
                name: "sq(num)",
                exampleURL: "/cs/sqnum/6588187426160640",
                description: i18n._("Squares a number (multiplies a number by itself). The result is always a positive number, as multiplying two negative numbers always yields a positive result. For example, -1 * -1 = 1"),
                params: [
                    i18n._("num: Any numeric value")
                ]
            },
            {
                name: "sqrt(num)",
                exampleURL: "/cs/sqrtnum/6473360267542528",
                description: i18n._("Calculates the square root of a number. The square root of a number is always positive, even though there may be a valid negative root. The square root s of number a is such that s*s = a. It is the opposite of squaring."),
                params: [
                    i18n._("num: Any numeric value")
                ]
            },
            {
                name: "round(num)",
                exampleURL: "/cs/roundnum/5907281296228352",
                description: i18n._("Calculates the closest whole number that is closest to the value of the parameter."),
                params: [
                    i18n._("num: Any numeric value")
                ]
            },
            {
                name: "ceil(num)",
                exampleURL: "/cs/ceil/5491781646942208",
                description: i18n._("Calculates the closest whole number that is greater than or equal to the value of the parameter."),
                params: [
                    i18n._("num: Any numeric value")
                ]
            },
            {
                name: "floor(num)",
                exampleURL: "/cs/floornum/5703004061696000",
                description: i18n._("Calculates the closest whole number that is less than or equal to the value of the parameter."),
                params: [
                    i18n._("num: Any numeric value")
                ]
            },
            {
                name: "mag(x1, y1)",
                exampleURL: "/cs/magx1-y1-not-working-yet/5983219002376192",
                description: i18n._("Calculates the magnitude (or length) of a vector. A vector is a direction in space commonly used in computer graphics and linear algebra. Because it has no \"start\" position, the magnitude of a vector can be thought of as the distance from coordinate (0,0) to its (x,y) value. Therefore, mag() is a shortcut for writing dist(0, 0, x, y)."),
                params: [
                    i18n._("x: the x component"),
                    i18n._("y: the y component")
                ]
            },
            {
                name: "exp(num)",
                exampleURL: "/cs/expvalue/5228990398726144",
                description: i18n._("Returns Euler's number e (2.71828...) raised to the power of the value parameter."),
                params: [
                    i18n._("num: Any numeric value")
                ]
            },
            {
                name: "map(num, low1, high1, low2, high2)",
                exampleURL: "/cs/mapvalue-low1-high1-low2-high2/4587974079545344",
                description: i18n._("Re-maps a number from one range to another. Numbers outside the range are not clamped to 0 and 1, because out-of-range values are often intentional and useful."),
                params: [
                    i18n._("num: The incoming value to be converted"),
                    i18n._("low1: Lower bound of the value's current range"),
                    i18n._("high1: Upper bound of the value's current range"),
                    i18n._("low2: Lower bound of the value's target range"),
                    i18n._("high2: Upper bound of the value's target range")
                ]
            },
            {
                name: "norm(num, low, high)",
                exampleURL: "/cs/normvalue-low-high/6581050767572992",
                description: i18n._("Normalizes a number from another range into a value between 0 and 1. This is the same as using the map function with the last two parameters set to 0 and 1, i.e: map(value, low, high, 0, 1); Numbers outside the range are not clamped to 0 and 1, because out-of-range values are often intentional and useful."),
                params: [
                    i18n._("num: The incoming value to be converted"),
                    i18n._("low1: Lower bound of the value's current range"),
                    i18n._("high1: Upper bound of the value's current range")
                ]
            },
            {
                name: "lerp(num1, num2, amount)",
                exampleURL: "/cs/lerpvalue1-value2-amount/6456916012171264",
                description: i18n._("Calculates a number between two numbers at a specific increment."),
                params: [
                    i18n._("num1: The first number"),
                    i18n._("num2: The second number"),
                    i18n._("amount: A value between 0.0 and 1.0")
                ]
            },
            {
                name: "noise(x, y)",
                exampleURL: "/cs/noise/5618485581316096",
                description: i18n._("Returns the Perlin noise value at specified coordinates. The resulting value will always be between 0.0 and 1.0"),
                params: [
                    i18n._("x: the x-coordinate in noise space"),
                    i18n._("y: the y-coordinate in noise space (optional)")
                ]
            },
            {
                name: "noiseDetail(octaves, falloff)",
                exampleURL: "/cs/noisedetailoctaves-falloff/6549875814563840",
                description: i18n._("Adjusts the character and level of detail produced by the Perlin noise function."),
                params: [
                    i18n._("octaves: The number of octaves to be used by the noise() function"),
                    i18n._("falloff: The falloff factor for each octave")
                ]
            },
            {
                name: "sin(degrees)",
                exampleURL: "/cs/sindeg/948255306",
                description: i18n._("Return the sine of an angle."),
                params: [
                    i18n._("deg: The angle, in degrees")
                ]
            },
            {
                name: "cos(degrees)",
                exampleURL: "/cs/cosdeg/948226821",
                description: i18n._("Return the cosine of an angle."),
                params: [
                    i18n._("deg: The angle, in degrees")
                ]
            },
            {
                name: "tan(degrees)",
                exampleURL: "/cs/tandeg/948018680",
                description: i18n._("Return the tangent of an angle"),
                params: [
                    i18n._("deg: The angle, in degrees")
                ]
            },
            {
                name: "acos(val)",
                exampleURL: "/cs/acosval/4542953527705600",
                description: i18n._("Returns the arc cosine (inverse cosine) of a value. Depending on the angle mode, it returns values from 0-180 or 0-PI."),
                params: [
                    i18n._("val: The value whose arc cosine is to be returned.")
                ]
            },
            {
                name: "asin(val)",
                exampleURL: "/cs/asinval/5061655520083968",
                description: i18n._("Returns the arc sine (inverse sine) of a value. Depending on the angle mode, it returns values from -90 to 90 or -PI/2 to PI/2."),
                params: [
                    i18n._("val: The value whose arc sine is to be returned.")
                ]
            },
            {
                name: "atan(val)",
                exampleURL: "/cs/atanval/4869834059808768",
                description: i18n._("Returns the arc tangent (inverse tangent) of a value. Depending on the angle mode, it returns values from -90 to 90 or -PI/2 to PI/2."),
                params: [
                    i18n._("val: The value whose arc tangent is to be returned")
                ]
            },
            {
                name: "radians(angle)",
                exampleURL: "/cs/radiansangle/6628151023108096",
                description: i18n._("Converts a degree measurement to its corresponding value in radians."),
                params: [
                    i18n._("angle: The angle in degrees")
                ]
            },
            {
                name: "degrees(angle)",
                exampleURL: "/cs/degreesangle/6674991668002816",
                description: i18n._("Converts a radians measurement to its corresponding value in degrees."),
                params: [
                    i18n._("angle: The angle in radians")
                ]
            },
            {
                name: "day()",
                exampleURL: "/cs/day/4526347808407552",
                description: i18n._("Returns the current day of the month, between 1 and 31, according to the clock on the user's computer.")
            },
            {
                name: "month()",
                exampleURL: "/cs/month/5388987023753216",
                description: i18n._("Returns the current month of the year, between 1-12, according to the clock on the user's computer.")
            },
            {
                name: "year()",
                exampleURL: "/cs/year/6216887939629056",
                description: i18n._("Returns the current year according to the clock on the user's computer.")
            },
            {
                name: "hour()",
                exampleURL: "/cs/hour/5806957302644736",
                description: i18n._("Returns the current hour as a value from 0 - 23, based on the user's computer clock.")
            },
            {
                name: "minute()",
                exampleURL: "/cs/minute/6638408210317312",
                description: i18n._("Returns the current minute as a value from 0 - 59, based on the user's computer clock.")
            },
            {
                name: "second()",
                exampleURL: "/cs/second/5743886110556160",
                description: i18n._("Returns the current second as a value from 0 - 59, based on the user's computer clock.")
            },
            {
                name: "millis()",
                exampleURL: "/cs/millis/5970545493409792",
                description: i18n._("Returns the number of milliseconds (thousandths of a second) since starting the program. Useful for cyclic animations.")
            },
            {
                name: "debug(arg1, ...",
                exampleURL: "/cs/debugarg1-arg2/939146973",
                description: i18n._("Log out any number of values to the browser console."),
                params: [
                    i18n._("arg: The first value to log"),
                    i18n._("...: (Optional)* any amount of extra arguments")
                ]
            },
            {
                name: "println(data)",
                exampleURL: "/cs/printlndata/6120466259378176",
                description: i18n._("Prints a line of data to the console that pops up over the canvas. Click the X to close the console."),
                params: [
                    i18n._("data: The data to print")
                ]
            },
            {
                name: "print(data)",
                exampleURL: "/cs/printdata/5110798099677184",
                description: i18n._("Prints data to the console that pops up over the canvas, without creating a new line (like println does)."),
                params: [
                    i18n._("data: The data to print")
                ]
            }
        ]
    },
    _pjsObjectConstructors: {
        type: i18n._("object constructor"),
        whitelist: ["PVector(x,y)"]
    },
    _pjsObjects: {
        type: i18n._("object"),
        whitelist: ["Random"]
    },
    _pjsVariables: {
        type: i18n._("variable"),
        whitelist: ["width", "height", "mouseIsPressed", "keyIsPressed",
            "frameCount", "key", "keyCode", "mouseButton", "mouseX",
            "mouseY", "pmouseX", "pmouseY", "angleMode"]
    },
    _pjsCallbacks: {
        type: i18n._("callback"),
        whitelist: ["draw", "mouseClicked", "mousePressed", "mouseReleased",
            "mouseMoved", "mouseDragged", "mouseOver", "mouseOut",
            "keyPressed", "keyReleased", "keyTyped"]
    },
};
