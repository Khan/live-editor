var Canvas = {
	undoStack: [],

	redraw: function() {
		for ( var i = 0, l = Canvas.undoStack.length; i < l; i++ ) {
			var cmd = stack[i];
			Canvas[ cmd.name ].apply( Canvas, cmd.args );
		}
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

			if ( segments === draw ) {
				draw.length = 0;
			}
		}
	},

	setColor: function( color, init ) {
		if ( !init ) {
			Canvas.startDraw();
		}

		ctx.shadowColor = "rgba(" + colors[color] + ",0.5)";
		ctx.strokeStyle = "rgba(" + colors[color] + ",1.0)";

		$("div.color.active").removeClass("active");
		$("#" + color).addClass("active");

		Canvas.undoStack.push({ name: "setColor", args: [ color, init ] });
	},

	startDraw: function() {
		Canvas.undoStack = [];

		$("#canvas, #editor").addClass( "canvas" );
		$("#draw span").text( "Code" );
	},

	endDraw: function() {
		// Clean off the canvas
		ctx.clearRect( 0, 0, 1200, 960 );

		$("#canvas, #editor").removeClass( "canvas" );
		$("#draw span").text( "Draw" );
	}
};