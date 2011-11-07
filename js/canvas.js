var Canvas = {
	colors: {
		black: [ 0, 0, 0 ],
		red: [ 255, 0, 0 ],
		orange: [ 255, 165, 0 ],
		green: [ 0, 128, 0 ],
		blue: [ 0, 0, 255 ],
		lightblue: [ 173, 216, 230 ],
		violet: [ 128, 0, 128 ]
	},
	
	init: function() {
		if ( Canvas.drawInterval ) {
			clearInterval( Canvas.drawInterval );
		}
		
		Canvas.canvas = $("#canvas")[0];
		Canvas.ctx = canvas.getContext("2d");
		
		Canvas.clear();
		
		Canvas.undoStack = [];
		Canvas.draw = [];

		Canvas.ctx.shadowBlur = 2;
		Canvas.ctx.lineCap = "round";
		Canvas.ctx.lineJoin = "round";
		Canvas.ctx.lineWidth = 1;
		
		jQuery(Canvas.canvas).bind({
			mousedown: function( e ) {
				// Left mouse button
				if ( e.button === 0 ) {
					Canvas.firstX = Canvas.x = e.layerX;
					Canvas.firstY = Canvas.y = e.layerY;
					Canvas.prev = [];
					Canvas.line = [];
					Canvas.down = true;

					e.preventDefault();
				}
			},

			mousemove: function( e ) {
				if ( Canvas.down ) {
					Canvas.prev.push({ x: e.layerX, y: e.layerY });

					if ( Canvas.prev.length === 2 ) {
						Canvas.draw.push( Canvas.prev );
						Canvas.line.push( Canvas.prev ) ;
						Canvas.prev = [];
					}
				}
			},
			
			mouseup: function() {
				if ( !Canvas.undoRunning ) {
					Canvas.undoStack.push({ name: "drawSegments", args: [ Canvas.line, Canvas.firstX, Canvas.firstY ] });
				}
				
				Canvas.down = false;
			}
		});
		
		jQuery(document).keydown(function(e) {
			// Stop if we aren't running
			if ( !Canvas.curColor ) {
				return;
			}
			
			// Backspace key
			if ( e.which === 8 ) {
				Canvas.undo();
				e.preventDefault();
			}
		});

		// Draw segments every
		Canvas.drawInterval = setInterval( Canvas.drawSegments, 16 );
	},
	
	undo: function() {
		Canvas.undoStack.pop();
		
		if ( Canvas.undoStack.length === 0 ) {
			Canvas.endDraw();
		
		} else {
			Canvas.redraw();
		}
	},

	redraw: function() {
		Canvas.undoRunning = true;
		
		Canvas.clear();
		
		for ( var i = 0, l = Canvas.undoStack.length; i < l; i++ ) {
			var cmd = Canvas.undoStack[i];
			Canvas[ cmd.name ].apply( Canvas, cmd.args );
		}
		
		Canvas.undoRunning = false;
	},

	drawSegments: function( segments, prevX, prevY ) {
		if ( typeof segments !== "object" ) {
			segments = Canvas.draw;
		}

		if ( segments.length ) {
			var firstX = prevX = prevX == null ? Canvas.x : prevX,
				firstY = prevY = prevY == null ? Canvas.y : prevY;
			
			for ( var i = 0; i < segments.length; i++ ) {
				var prev = segments[ i ];

				// Only make a path if we're actually going to draw something
				if ( prev[0].x !== prev[1].x || prev[0].y !== prev[1].y ) {
					Canvas.ctx.beginPath();
					Canvas.ctx.moveTo( prevX, prevY );
					Canvas.ctx.quadraticCurveTo( prev[0].x, prev[0].y, prev[1].x, prev[1].y );
					Canvas.ctx.stroke();
					Canvas.ctx.closePath();

					prevX = Canvas.x = prev[1].x;
					prevY = Canvas.y = prev[1].y;
				}
			}
			
			Record.log({ canvas: "drawSegments", args: [ segments.slice(0), firstX, firstY ] });

			if ( segments === Canvas.draw ) {
				Canvas.draw.length = 0;
			}
		}
	},

	setColor: function( color ) {
		if ( Canvas.curColor == null ) {
			Canvas.startDraw( color );
		}
		
		Canvas.curColor = color;
		
		if ( color != null ) {
			Canvas.ctx.shadowColor = "rgba(" + Canvas.colors[color] + ",0.5)";
			Canvas.ctx.strokeStyle = "rgba(" + Canvas.colors[color] + ",1.0)";
		
			if ( !Canvas.undoRunning ) {
				Record.log({ canvas: "setColor", args: [ color ] });
				Canvas.undoStack.push({ name: "setColor", args: [ color ] });
			}
		}
		
		jQuery(Canvas).trigger( "colorSet", color );
	},
	
	clear: function() {
		// Clean off the canvas
		Canvas.ctx.clearRect( 0, 0, 600, 480 );
	},

	startDraw: function( color ) {
		if ( !Canvas.curColor ) {
			if ( !Canvas.undoRunning ) {
				Canvas.undoStack = [];
			}
			
			if ( typeof color !== "string" ) {
				Canvas.setColor( "black" );
			}
			
			jQuery(Canvas).trigger( "drawStarted" );
		}
	},

	endDraw: function() {
		if ( Canvas.curColor ) {
			if ( !Canvas.undoRunning ) {
				Record.log({ canvas: "endDraw" });
			}
		
			Canvas.clear();
		
			Canvas.setColor( null );
		
			jQuery(Canvas).trigger( "drawEnded" );
		}
	}
};

Record.handlers.canvas = function( e ) {
	Canvas[ e.canvas ].apply( Canvas, e.args || [] );
};