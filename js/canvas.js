var Canvas = {
	curColor: null,
	
	undoStack: [],
	
	undoRunning: false,

	redraw: function() {
		Canvas.undoRunning = true;
		
		for ( var i = 0, l = Canvas.undoStack.length; i < l; i++ ) {
			var cmd = Canvas.undoStack[i];
			Canvas[ cmd.name ].apply( Canvas, cmd.args );
		}
		
		Canvas.undoRunning = false;
	},

	drawLine: function( prevX, prevY, segments ) {
		x = prevX;
		y = prevY;

		Canvas.drawSegments( segments );
	},

	drawSegments: function( segments ) {
		if ( typeof segments !== "object" ) {
			segments = draw;
		}

		if ( segments.length ) {
			for ( var i = 0; i < segments.length; i++ ) {
				var prev = segments[ i ];

				// Only make a path if we're actually going to draw something
				if ( prev[0].x !== prev[1].x || prev[0].y !== prev[1].y ) {
					ctx.beginPath();
					ctx.moveTo( x, y );
					ctx.quadraticCurveTo( prev[0].x, prev[0].y, prev[1].x, prev[1].y );
					ctx.stroke();
					ctx.closePath();

					x = prev[1].x;
					y = prev[1].y;
				}
			}
			
			logger({ type: "drawSegments", style: "canvas", args: [ segments.slice(0) ], timeStamp: (new Date).getTime() });

			if ( segments === draw ) {
				draw.length = 0;
			}
		}
	},

	setColor: function( color ) {
		Canvas.curColor = color;
		
		if ( color !== null ) {
			Canvas.startDraw();

			ctx.shadowColor = "rgba(" + colors[color] + ",0.5)";
			ctx.strokeStyle = "rgba(" + colors[color] + ",1.0)";
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
		ctx.clearRect( 0, 0, 1200, 960 );
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