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
		
		Canvas.canvas = jQuery("#canvas")[0];
		Canvas.ctx = canvas.getContext("2d");
		
		Canvas.clear( true );
		
		Canvas.undoStack = [];

		Canvas.ctx.shadowBlur = 2;
		Canvas.ctx.lineCap = "round";
		Canvas.ctx.lineJoin = "round";
		Canvas.ctx.lineWidth = 1;
		
		jQuery(Canvas.canvas).bind({
			mousedown: function( e ) {
				// Left mouse button
				if ( e.button === 0 ) {
					Canvas.startLine( e.layerX, e.layerY );

					e.preventDefault();
				}
			},

			mousemove: function( e ) {
				Canvas.drawLine( e.layerX, e.layerY );
			},
			
			mouseup: Canvas.endLine
		});
		
		jQuery(document).keydown(function(e) {
			// Stop if we aren't running
			if ( !Canvas.drawing ) {
				return;
			}
			
			// Backspace key
			if ( e.which === 8 ) {
				e.preventDefault();
				Canvas.undo();
			}
		});
	},
	
	// TODO: Just use the Record log as an undo stack
	undo: function() {
		Record.log({ canvas: "undo" });
		
		// TODO: Eventually allow for a "redo" stack
		var cmd = Canvas.undoStack.pop();
		
		if ( cmd && cmd.name === "endLine" ) {
			while ( cmd.name !== "startLine" ) {
				cmd = Canvas.undoStack.pop();
			}
		}
		
		Canvas.redraw();
	},

	redraw: function() {
		var stack = Canvas.undoStack.slice( 0 );
		
		Canvas.clear( true );
		
		Canvas.undoStack = [];
		
		for ( var i = 0, l = stack.length; i < l; i++ ) {
			var cmd = stack[i];
			Canvas[ cmd.name ].apply( Canvas, cmd.args );
		}
	},
	
	startLine: function( x, y ) {
		if ( !Canvas.down ) {
			Canvas.down = true;
			Canvas.x = x;
			Canvas.y = y;
			Canvas.prev = [];
		
			Canvas.log( "startLine", [ x, y ] );
		}
	},
	
	drawLine: function( x, y ) {
		if ( Canvas.down ) {
			Canvas.prev.push({ x: x, y: y });

			if ( Canvas.prev.length === 2 ) {
				var prev = Canvas.prev;

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
				
				Canvas.prev.length = 0;
			}
			
			Canvas.log( "drawLine", [ x, y ] );
		}
	},
	
	endLine: function() {
		if ( Canvas.down ) {
			Canvas.down = false;
			Canvas.log( "endLine" );
		}
	},
	
	log: function( name, args ) {
		Record.log({ canvas: name, args: args });
		Canvas.undoStack.push({ name: name, args: args });
	},

	setColor: function( color ) {		
		if ( color != null ) {
			if ( !Canvas.drawing ) {
				Canvas.startDraw( true );
			}
			
			Canvas.ctx.shadowColor = "rgba(" + Canvas.colors[color] + ",0.5)";
			Canvas.ctx.strokeStyle = "rgba(" + Canvas.colors[color] + ",1.0)";
		
			Canvas.log( "setColor", [ color ] );
		}
		
		jQuery(Canvas).trigger( "colorSet", color );
	},
	
	clear: function( force ) {
		// Clean off the canvas
		Canvas.ctx.clearRect( 0, 0, 600, 480 );
		
		if ( force !== true ) {
			Canvas.log( "clear" );
		}
	},

	startDraw: function( colorDone ) {
		if ( !Canvas.drawing ) {
			Canvas.drawing = true;
			Canvas.undoStack = [];
			
			if ( colorDone !== true ) {
				Canvas.setColor( "black" );
			}
			
			jQuery(Canvas).trigger( "drawStarted" );
		}
	},

	endDraw: function() {
		if ( Canvas.drawing ) {
			Canvas.drawing = false;
		
			Canvas.setColor( null );
		
			jQuery(Canvas).trigger( "drawEnded" );
		}
	}
};

Record.handlers.canvas = function( e ) {
	Canvas[ e.canvas ].apply( Canvas, e.args || [] );
};