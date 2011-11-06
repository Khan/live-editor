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
		
		$(Canvas.canvas).bind({
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
					Canvas.undoStack.push({ name: "drawLine", args: [ Canvas.firstX, Canvas.firstY, Canvas.line ] });
				}
				
				Canvas.down = false;
			}
		});
		
		$(document).keydown(function(e) {
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

	drawLine: function( prevX, prevY, segments ) {
		Canvas.x = prevX;
		Canvas.y = prevY;

		Canvas.drawSegments( segments );
	},

	drawSegments: function( segments ) {
		if ( typeof segments !== "object" ) {
			segments = Canvas.draw;
		}

		if ( segments.length ) {
			for ( var i = 0; i < segments.length; i++ ) {
				var prev = segments[ i ];

				// Only make a path if we're actually going to draw something
				if ( prev[0].x !== prev[1].x || prev[0].y !== prev[1].y ) {
					Canvas.ctx.beginPath();
					Canvas.ctx.moveTo( Canvas.x, Canvas.y );
					Canvas.ctx.quadraticCurveTo( prev[0].x, prev[0].y, prev[1].x, prev[1].y );
					Canvas.ctx.stroke();
					Canvas.ctx.closePath();

					Canvas.x = prev[1].x;
					Canvas.y = prev[1].y;
				}
			}
			
			logger({ type: "drawSegments", style: "canvas", args: [ segments.slice(0) ], timeStamp: (new Date).getTime() });

			if ( segments === Canvas.draw ) {
				Canvas.draw.length = 0;
			}
		}
	},

	setColor: function( color ) {
		Canvas.curColor = color;
		
		if ( color !== null ) {
			Canvas.startDraw();

			Canvas.ctx.shadowColor = "rgba(" + Canvas.colors[color] + ",0.5)";
			Canvas.ctx.strokeStyle = "rgba(" + Canvas.colors[color] + ",1.0)";
		}

		$("div.color.active").removeClass("active");
		
		if ( color !== null ) {
			$("#" + color).addClass("active");
			
			if ( !Canvas.undoRunning ) {
				logger({ type: "setColor", style: "canvas", args: [ color ], timeStamp: (new Date).getTime() });
				Canvas.undoStack.push({ name: "setColor", args: [ color ] });
			}
		}
	},
	
	clear: function() {
		// Clean off the canvas
		Canvas.ctx.clearRect( 0, 0, 600, 480 );
	},

	startDraw: function() {
		if ( !Canvas.curColor ) {
			if ( !Canvas.undoRunning ) {
				Canvas.undoStack = [];
			}
			
			Canvas.setColor( "black" );
		}

		$("#canvas, #editor").addClass( "canvas" );
		$("#draw span").text( "Code" );
	},

	endDraw: function() {
		if ( !Canvas.undoRunning ) {
			logger({ type: "endDraw", style: "canvas", args: [], timeStamp: (new Date).getTime() });
		}
		
		Canvas.clear();
		
		Canvas.setColor( null );

		$("#canvas, #editor").removeClass( "canvas" );
		$("#draw span").text( "Draw" );
	}
};