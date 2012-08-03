/*!
 * jQuery UI @VERSION
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI
 */
(function( $, undefined ) {

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.ui = $.ui || {};
if ( $.ui.version ) {
	return;
}

$.extend( $.ui, {
	version: "@VERSION",

	keyCode: {
		ALT: 18,
		BACKSPACE: 8,
		CAPS_LOCK: 20,
		COMMA: 188,
		COMMAND: 91,
		COMMAND_LEFT: 91, // COMMAND
		COMMAND_RIGHT: 93,
		CONTROL: 17,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		INSERT: 45,
		LEFT: 37,
		MENU: 93, // COMMAND_RIGHT
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SHIFT: 16,
		SPACE: 32,
		TAB: 9,
		UP: 38,
		WINDOWS: 91 // COMMAND
	}
});

// plugins
$.fn.extend({
	_focus: $.fn.focus,
	focus: function( delay, fn ) {
		return typeof delay === "number" ?
			this.each(function() {
				var elem = this;
				setTimeout(function() {
					$( elem ).focus();
					if ( fn ) {
						fn.call( elem );
					}
				}, delay );
			}) :
			this._focus.apply( this, arguments );
	},

	scrollParent: function() {
		var scrollParent;
		if (($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.curCSS(this,'position',1)) && (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	},

	disableSelection: function() {
		return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
			".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
	},

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	}
});

$.each( [ "Width", "Height" ], function( i, name ) {
	var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
		type = name.toLowerCase(),
		orig = {
			innerWidth: $.fn.innerWidth,
			innerHeight: $.fn.innerHeight,
			outerWidth: $.fn.outerWidth,
			outerHeight: $.fn.outerHeight
		};

	function reduce( elem, size, border, margin ) {
		$.each( side, function() {
			size -= parseFloat( $.curCSS( elem, "padding" + this, true ) ) || 0;
			if ( border ) {
				size -= parseFloat( $.curCSS( elem, "border" + this + "Width", true ) ) || 0;
			}
			if ( margin ) {
				size -= parseFloat( $.curCSS( elem, "margin" + this, true ) ) || 0;
			}
		});
		return size;
	}

	$.fn[ "inner" + name ] = function( size ) {
		if ( size === undefined ) {
			return orig[ "inner" + name ].call( this );
		}

		return this.each(function() {
			$( this ).css( type, reduce( this, size ) + "px" );
		});
	};

	$.fn[ "outer" + name] = function( size, margin ) {
		if ( typeof size !== "number" ) {
			return orig[ "outer" + name ].call( this, size );
		}

		return this.each(function() {
			$( this).css( type, reduce( this, size, true, margin ) + "px" );
		});
	};
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		var map = element.parentNode,
			mapName = map.name,
			img;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap=#" + mapName + "]" )[0];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName )
		? !element.disabled
		: "a" == nodeName
			? element.href || isTabIndexNotNaN
			: isTabIndexNotNaN)
		// the element and all of its ancestors must be visible
		&& visible( element );
}

function visible( element ) {
	return !$( element ).parents().andSelf().filter(function() {
		return $.curCSS( this, "visibility" ) === "hidden" ||
			$.expr.filters.hidden( this );
	}).length;
}

$.extend( $.expr[ ":" ], {
	data: function( elem, i, match ) {
		return !!$.data( elem, match[ 3 ] );
	},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support
$(function() {
	var body = document.body,
		div = body.appendChild( div = document.createElement( "div" ) );

	$.extend( div.style, {
		minHeight: "100px",
		height: "auto",
		padding: 0,
		borderWidth: 0
	});

	$.support.minHeight = div.offsetHeight === 100;
	$.support.selectstart = "onselectstart" in div;

	// set display to none to avoid a layout bug in IE
	// http://dev.jquery.com/ticket/4014
	body.removeChild( div ).style.display = "none";
});





// deprecated
$.extend( $.ui, {
	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function( module, option, set ) {
			var proto = $.ui[ module ].prototype;
			for ( var i in set ) {
				proto.plugins[ i ] = proto.plugins[ i ] || [];
				proto.plugins[ i ].push( [ option, set[ i ] ] );
			}
		},
		call: function( instance, name, args ) {
			var set = instance.plugins[ name ];
			if ( !set || !instance.element[ 0 ].parentNode ) {
				return;
			}
	
			for ( var i = 0; i < set.length; i++ ) {
				if ( instance.options[ set[ i ][ 0 ] ] ) {
					set[ i ][ 1 ].apply( instance.element, args );
				}
			}
		}
	},
	
	contains: $.contains,
	
	// only used by resizable
	hasScroll: function( el, a ) {
	
		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ( $( el ).css( "overflow" ) === "hidden") {
			return false;
		}
	
		var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
			has = false;
	
		if ( el[ scroll ] > 0 ) {
			return true;
		}
	
		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[ scroll ] = 1;
		has = ( el[ scroll ] > 0 );
		el[ scroll ] = 0;
		return has;
	},
	
	// these are odd functions, fix the API or move into individual plugins
	isOverAxis: function( x, reference, size ) {
		//Determines when x coordinate is over "b" element axis
		return ( x > reference ) && ( x < ( reference + size ) );
	},
	isOver: function( y, x, top, left, height, width ) {
		//Determines when x, y coordinates is over "b" element
		return $.ui.isOverAxis( y, top, height ) && $.ui.isOverAxis( x, left, width );
	}
});

})( jQuery );
/*!
 * jQuery UI Widget @VERSION
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
(function( $, undefined ) {

var slice = Array.prototype.slice;

var _cleanData = $.cleanData;
$.cleanData = function( elems ) {
	for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
		try {
			$( elem ).triggerHandler( "remove" );
		// http://bugs.jquery.com/ticket/8235
		} catch( e ) {}
	}
	_cleanData( elems );
};

$.widget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};

	$[ namespace ] = $[ namespace ] || {};
	// create the constructor using $.extend() so we can carry over any
	// static properties stored on the existing constructor (if there is one)
	$[ namespace ][ name ] = $.extend( function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new $[ namespace ][ name ]( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	}, $[ namespace ][ name ], { version: prototype.version } );

	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( $.isFunction( value ) ) {
			prototype[ prop ] = (function() {
				var _super = function( method ) {
					return base.prototype[ method ].apply( this, slice.call( arguments, 1 ) );
				};
				var _superApply = function( method, args ) {
					return base.prototype[ method ].apply( this, args );
				};
				return function() {
					var __super = this._super,
						__superApply = this._superApply,
						returnValue;

					this._super = _super;
					this._superApply = _superApply;

					returnValue = value.apply( this, arguments );

					this._super = __super;
					this._superApply = __superApply;

					return returnValue;
				};
			}());
		}
	});
	$[ namespace ][ name ].prototype = $.widget.extend( basePrototype, {
		namespace: namespace,
		widgetName: name,
		widgetEventPrefix: name,
		widgetBaseClass: fullName
	}, prototype );

	$.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.extend = function( target ) {
	var input = slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if (input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				target[ key ] = $.isPlainObject( value ) ? $.widget.extend( {}, target[ key ], value ) : value;
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $.data( this, name );
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				var methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					object( options, this );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( options, element ) {
	// allow instantiation without "new" keyword
	if ( !this._createWidget ) {
		return new $[ namespace ][ name ]( options, element );
	}

	// allow instantiation without initializing for simple inheritance
	// must use "new" keyword (the code above always passes args)
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetName, this );
			this._bind({ remove: "destroy" });
			this.document = $( element.ownerDocument );
			this.window = $( this.document[0].defaultView );
		}

		this._create();
		this._trigger( "create" );
		this._init();
	},
	_getCreateOptions: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._bind()
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( "." + this.widgetName );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( value === undefined ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( value === undefined ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetBaseClass + "-disabled ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
			this.hoverable.removeClass( "ui-state-hover" );
			this.focusable.removeClass( "ui-state-focus" );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_bind: function( element, handlers ) {
		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
		} else {
			// accept selectors, DOM elements
			element = $( element );
			this.bindings = this.bindings.add( element );
		}

		var instance = this;
		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( instance.options.disabled === true ||
						$( this ).hasClass( "ui-state-disabled" ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}
			var match = event.match( /^(\w+)\s*(.*)$/ ),
				eventName = match[1] + "." + instance.widgetName,
				selector = match[2];
			if ( selector ) {
				instance.widget().delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._bind( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._bind( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var callback = this.options[ type ],
			args;

		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		data = data || {};

		// copy original event properties over to the new event
		// this would happen if we could call $.event.fix instead of $.Event
		// but we don't have a way to force an event to be fixed multiple times
		if ( event.originalEvent ) {
			for ( var i = $.event.props.length, prop; i; ) {
				prop = $.event.props[ --i ];
				event[ prop ] = event.originalEvent[ prop ];
			}
		}

		this.element.trigger( event, data );

		args = $.isArray( data ) ?
			[ event ].concat( data ) :
			[ event, data ];

		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], args ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && ( $.effects.effect[ effectName ] || $.uiBackCompat !== false && $.effects[ effectName ] ) ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

// DEPRECATED
if ( $.uiBackCompat !== false ) {
	$.Widget.prototype._getCreateOptions = function() {
		return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
	};
}

})( jQuery );
/*
 * jQuery UI Effects @VERSION
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/
 */
;jQuery.effects || (function($, undefined) {

var backCompat = $.uiBackCompat !== false;

$.effects = {
	effect: {}
};

/******************************************************************************/
/****************************** COLOR ANIMATIONS ******************************/
/******************************************************************************/

// override the animation for color styles
$.each(["backgroundColor", "borderBottomColor", "borderLeftColor",
	"borderRightColor", "borderTopColor", "borderColor", "color", "outlineColor"],
function(i, attr) {
	$.fx.step[attr] = function(fx) {
		if (!fx.colorInit) {
			fx.start = getColor(fx.elem, attr);
			fx.end = getRGB(fx.end);
			fx.colorInit = true;
		}

		fx.elem.style[attr] = "rgb(" +
			Math.max(Math.min(parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0], 10), 255), 0) + "," +
			Math.max(Math.min(parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1], 10), 255), 0) + "," +
			Math.max(Math.min(parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2], 10), 255), 0) + ")";
	};
});

// Color Conversion functions from highlightFade
// By Blair Mitchelmore
// http://jquery.offput.ca/highlightFade/

// Parse strings looking for color tuples [255,255,255]
function getRGB(color) {
		var result;

		// Check if we're already dealing with an array of colors
		if ( color && color.constructor === Array && color.length === 3 )
				return color;

		// Look for rgb(num,num,num)
		if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
				return [parseInt(result[1],10), parseInt(result[2],10), parseInt(result[3],10)];

		// Look for rgb(num%,num%,num%)
		if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
				return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];

		// Look for #a0b1c2
		if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
				return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];

		// Look for #fff
		if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
				return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];

		// Look for rgba(0, 0, 0, 0) == transparent in Safari 3
		if (result = /rgba\(0, 0, 0, 0\)/.exec(color))
				return colors["transparent"];

		// Otherwise, we're most likely dealing with a named color
		return colors[$.trim(color).toLowerCase()];
}

function getColor(elem, attr) {
		var color;

		do {
				color = $.curCSS(elem, attr);

				// Keep going until we find an element that has color, or we hit the body
				if ( color != "" && color !== "transparent" || $.nodeName(elem, "body") )
						break;

				attr = "backgroundColor";
		} while ( elem = elem.parentNode );

		return getRGB(color);
};

// Some named colors to work with
// From Interface by Stefan Petre
// http://interface.eyecon.ro/

var colors = {
	aqua:[0,255,255],
	azure:[240,255,255],
	beige:[245,245,220],
	black:[0,0,0],
	blue:[0,0,255],
	brown:[165,42,42],
	cyan:[0,255,255],
	darkblue:[0,0,139],
	darkcyan:[0,139,139],
	darkgrey:[169,169,169],
	darkgreen:[0,100,0],
	darkkhaki:[189,183,107],
	darkmagenta:[139,0,139],
	darkolivegreen:[85,107,47],
	darkorange:[255,140,0],
	darkorchid:[153,50,204],
	darkred:[139,0,0],
	darksalmon:[233,150,122],
	darkviolet:[148,0,211],
	fuchsia:[255,0,255],
	gold:[255,215,0],
	green:[0,128,0],
	indigo:[75,0,130],
	khaki:[240,230,140],
	lightblue:[173,216,230],
	lightcyan:[224,255,255],
	lightgreen:[144,238,144],
	lightgrey:[211,211,211],
	lightpink:[255,182,193],
	lightyellow:[255,255,224],
	lime:[0,255,0],
	magenta:[255,0,255],
	maroon:[128,0,0],
	navy:[0,0,128],
	olive:[128,128,0],
	orange:[255,165,0],
	pink:[255,192,203],
	purple:[128,0,128],
	violet:[128,0,128],
	red:[255,0,0],
	silver:[192,192,192],
	white:[255,255,255],
	yellow:[255,255,0],
	transparent: [255,255,255]
};



/******************************************************************************/
/****************************** CLASS ANIMATIONS ******************************/
/******************************************************************************/

var classAnimationActions = [ "add", "remove", "toggle" ],
	shorthandStyles = {
		border: 1,
		borderBottom: 1,
		borderColor: 1,
		borderLeft: 1,
		borderRight: 1,
		borderTop: 1,
		borderWidth: 1,
		margin: 1,
		padding: 1
	},
	// prefix used for storing data on .data()
	dataSpace = "ec.storage.";

$.each([ "borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle" ], function( _, prop ) {
	$.fx.step[ prop ] = function( fx ) {
		if ( fx.end !== "none" && !fx.setAttr || fx.pos === 1 && !fx.setAttr ) {
			jQuery.style( fx.elem, prop, fx.end );
			fx.setAttr = true;
		}
	};
});

function getElementStyles() {
	var style = this.ownerDocument.defaultView
			? this.ownerDocument.defaultView.getComputedStyle( this, null )
			: this.currentStyle,
		newStyle = {},
		key,
		camelCase,
		len;

	// webkit enumerates style porperties
	if ( style && style.length && style[ 0 ] && style[ style[ 0 ] ] ) {
		len = style.length;
		while ( len-- ) {
			key = style[ len ];
			if ( typeof style[ key ] === "string" ) {
				newStyle[ $.camelCase( key ) ] = style[ key ];
			}
		}
	} else {
		for ( key in style ) {
			if ( typeof style[ key ] === "string" ) {
				newStyle[ key ] = style[ key ];
			}
		}
	}

	return newStyle;
}


function styleDifference( oldStyle, newStyle ) {
	var diff = {},
		name, value;

	for ( name in newStyle ) {
		value = newStyle[ name ];
		if ( oldStyle[ name ] != value ) {
			if ( !shorthandStyles[ name ] ) {
				if ( $.fx.step[ name ] || !isNaN( parseFloat( value ) ) ) {
					diff[ name ] = value;
				}
			}
		}
	}

	return diff;
}

$.effects.animateClass = function( value, duration, easing, callback ) {
	var o = $.speed( duration, easing, callback );

	return this.queue( function() {
		var animated = $( this ),
			baseClass = animated.attr( "class" ) || "",
			finalClass,
			allAnimations = o.children ? animated.find( "*" ).andSelf() : animated;

		// map the animated objects to store the original styles.
		allAnimations = allAnimations.map(function() {
			var el = $( this );
			return {
				el: el,
				originalStyleAttr: el.attr( "style" ) || " ",
				start: getElementStyles.call( this )
			};
		});

		// apply class change
		$.each( classAnimationActions, function(i, action) {
			if ( value[ action ] ) {
				animated[ action + "Class" ]( value[ action ] );
			}
		});
		finalClass = animated.attr( "class" );

		// map all animated objects again - calculate new styles and diff
		allAnimations = allAnimations.map(function() {
			this.end = getElementStyles.call( this.el[ 0 ] );
			this.diff = styleDifference( this.start, this.end );
			return this;
		});

		// apply original class
		animated.attr( "class", baseClass );

		// map all animated objects again - this time collecting a promise
		allAnimations = allAnimations.map(function() {
			var styleInfo = this,
				dfd = $.Deferred();

			this.el.animate( this.diff, {
				duration: o.duration,
				easing: o.easing,
				queue: false,
				complete: function() {
					dfd.resolve( styleInfo );
				}
			});
			return dfd.promise();
		});

		// once all animations have completed:
		$.when.apply( $, allAnimations.get() ).done(function() {

			// set the final class
			animated.attr( "class", finalClass );

			// for each animated element
			$.each( arguments, function() {
				if ( typeof this.el.attr( "style" ) === "object" ) {
					this.el.attr( "style" ).cssText = "";
					this.el.attr( "style" ).cssText = this.originalStyleAttr;
				} else {
					this.el.attr( "style", this.originalStyleAttr );
				}
			});

			// this is guarnteed to be there if you use jQuery.speed()
			// it also handles dequeuing the next anim...
			o.complete.call( animated[ 0 ] );
		});
	});
};

$.fn.extend({
	_addClass: $.fn.addClass,
	addClass: function( classNames, speed, easing, callback ) {
		return speed ?
			$.effects.animateClass.apply( this, [{ add: classNames }, speed, easing, callback ]) :
			this._addClass(classNames);
	},

	_removeClass: $.fn.removeClass,
	removeClass: function( classNames, speed, easing, callback ) {
		return speed ?
			$.effects.animateClass.apply( this, [{ remove: classNames }, speed, easing, callback ]) :
			this._removeClass(classNames);
	},

	_toggleClass: $.fn.toggleClass,
	toggleClass: function( classNames, force, speed, easing, callback ) {
		if ( typeof force === "boolean" || force === undefined ) {
			if ( !speed ) {
				// without speed parameter;
				return this._toggleClass( classNames, force );
			} else {
				return $.effects.animateClass.apply( this, [( force ? { add:classNames } : { remove:classNames }), speed, easing, callback ]);
			}
		} else {
			// without force parameter;
			return $.effects.animateClass.apply( this, [{ toggle: classNames }, force, speed, easing ]);
		}
	},

	switchClass: function( remove, add, speed, easing, callback) {
		return $.effects.animateClass.apply( this, [{
				add: add,
				remove: remove
			}, speed, easing, callback ]);
	}
});



/******************************************************************************/
/*********************************** EFFECTS **********************************/
/******************************************************************************/

$.extend( $.effects, {
	version: "@VERSION",

	// Saves a set of properties in a data storage
	save: function( element, set ) {
		for( var i=0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				element.data( dataSpace + set[ i ], element[ 0 ].style[ set[ i ] ] );
			}
		}
	},

	// Restores a set of previously saved properties from a data storage
	restore: function( element, set ) {
		for( var i=0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				element.css( set[ i ], element.data( dataSpace + set[ i ] ) );
			}
		}
	},

	setMode: function( el, mode ) {
		if (mode === "toggle") {
			mode = el.is( ":hidden" ) ? "show" : "hide";
		}
		return mode;
	},

	// Translates a [top,left] array into a baseline value
	// this should be a little more flexible in the future to handle a string & hash
	getBaseline: function( origin, original ) {
		var y, x;
		switch ( origin[ 0 ] ) {
			case "top": y = 0; break;
			case "middle": y = 0.5; break;
			case "bottom": y = 1; break;
			default: y = origin[ 0 ] / original.height;
		};
		switch ( origin[ 1 ] ) {
			case "left": x = 0; break;
			case "center": x = 0.5; break;
			case "right": x = 1; break;
			default: x = origin[ 1 ] / original.width;
		};
		return {
			x: x,
			y: y
		};
	},

	// Wraps the element around a wrapper that copies position properties
	createWrapper: function( element ) {

		// if the element is already wrapped, return it
		if ( element.parent().is( ".ui-effects-wrapper" )) {
			return element.parent();
		}

		// wrap the element
		var props = {
				width: element.outerWidth(true),
				height: element.outerHeight(true),
				"float": element.css( "float" )
			},
			wrapper = $( "<div></div>" )
				.addClass( "ui-effects-wrapper" )
				.css({
					fontSize: "100%",
					background: "transparent",
					border: "none",
					margin: 0,
					padding: 0
				}),
			// Store the size in case width/height are defined in % - Fixes #5245
			size = {
				width: element.width(),
				height: element.height()
			},
			active = document.activeElement;

		element.wrap( wrapper );

		// Fixes #7595 - Elements lose focus when wrapped.
		if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
			$( active ).focus();
		}

		wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually loose the reference to the wrapped element

		// transfer positioning properties to the wrapper
		if ( element.css( "position" ) === "static" ) {
			wrapper.css({ position: "relative" });
			element.css({ position: "relative" });
		} else {
			$.extend( props, {
				position: element.css( "position" ),
				zIndex: element.css( "z-index" )
			});
			$.each([ "top", "left", "bottom", "right" ], function(i, pos) {
				props[ pos ] = element.css( pos );
				if ( isNaN( parseInt( props[ pos ], 10 ) ) ) {
					props[ pos ] = "auto";
				}
			});
			element.css({
				position: "relative",
				top: 0,
				left: 0,
				right: "auto",
				bottom: "auto"
			});
		}
		element.css(size);

		return wrapper.css( props ).show();
	},

	removeWrapper: function( element ) {
		var active = document.activeElement;

		if ( element.parent().is( ".ui-effects-wrapper" ) ) {
			element.parent().replaceWith( element );

			// Fixes #7595 - Elements lose focus when wrapped.
			if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
				$( active ).focus();
			}
		}


		return element;
	},

	setTransition: function( element, list, factor, value ) {
		value = value || {};
		$.each( list, function(i, x){
			var unit = element.cssUnit( x );
			if ( unit[ 0 ] > 0 ) value[ x ] = unit[ 0 ] * factor + unit[ 1 ];
		});
		return value;
	}
});

// return an effect options object for the given parameters:
function _normalizeArguments( effect, options, speed, callback ) {

	// short path for passing an effect options object:
	if ( $.isPlainObject( effect ) ) {
		return effect;
	}

	// convert to an object
	effect = { effect: effect };

	// catch (effect)
	if ( options === undefined ) {
		options = {};
	}

	// catch (effect, callback)
	if ( $.isFunction( options ) ) {
		callback = options;
		speed = null;
		options = {};
	}

	// catch (effect, speed, ?)
	if ( $.type( options ) === "number" || $.fx.speeds[ options ]) {
		callback = speed;
		speed = options;
		options = {};
	}

	// catch (effect, options, callback)
	if ( $.isFunction( speed ) ) {
		callback = speed;
		speed = null;
	}

	// add options to effect
	if ( options ) {
		$.extend( effect, options );
	}

	speed = speed || options.duration;
	effect.duration = $.fx.off ? 0 : typeof speed === "number"
		? speed : speed in $.fx.speeds ? $.fx.speeds[ speed ] : $.fx.speeds._default;

	effect.complete = callback || options.complete;

	return effect;
}

function standardSpeed( speed ) {
	// valid standard speeds
	if ( !speed || typeof speed === "number" || $.fx.speeds[ speed ] ) {
		return true;
	}

	// invalid strings - treat as "normal" speed
	if ( typeof speed === "string" && !$.effects.effect[ speed ] ) {
		// TODO: remove in 2.0 (#7115)
		if ( backCompat && $.effects[ speed ] ) {
			return false;
		}
		return true;
	}

	return false;
}

$.fn.extend({
	effect: function( effect, options, speed, callback ) {
		var args = _normalizeArguments.apply( this, arguments ),
			mode = args.mode,
			queue = args.queue,
			effectMethod = $.effects.effect[ args.effect ],

			// DEPRECATED: remove in 2.0 (#7115)
			oldEffectMethod = !effectMethod && backCompat && $.effects[ args.effect ];

		if ( $.fx.off || !( effectMethod || oldEffectMethod ) ) {
			// delegate to the original method (e.g., .show()) if possible
			if ( mode ) {
				return this[ mode ]( args.duration, args.complete );
			} else {
				return this.each( function() {
					if ( args.complete ) {
						args.complete.call( this );
					}
				});
			}
		}

		function run( next ) {
			var elem = $( this ),
				complete = args.complete,
				mode = args.mode;

			function done() {
				if ( $.isFunction( complete ) ) {
					complete.call( elem[0] );
				}
				if ( $.isFunction( next ) ) {
					next();
				}
			}

			// if the element is hiddden and mode is hide,
			// or element is visible and mode is show
			if ( elem.is( ":hidden" ) ? mode === "hide" : mode === "show" ) {
				done();
			} else {
				effectMethod.call( elem[0], args, done );
			}
		}

		// TODO: remove this check in 2.0, effectMethod will always be true
		if ( effectMethod ) {
			return queue === false ? this.each( run ) : this.queue( queue || "fx", run );
		} else {
			// DEPRECATED: remove in 2.0 (#7115)
			return oldEffectMethod.call(this, {
				options: args,
				duration: args.duration,
				callback: args.complete,
				mode: args.mode
			});
		}
	},

	_show: $.fn.show,
	show: function( speed ) {
		if ( standardSpeed( speed ) ) {
			return this._show.apply( this, arguments );
		} else {
			var args = _normalizeArguments.apply( this, arguments );
			args.mode = "show";
			return this.effect.call( this, args );
		}
	},

	_hide: $.fn.hide,
	hide: function( speed ) {
		if ( standardSpeed( speed ) ) {
			return this._hide.apply( this, arguments );
		} else {
			var args = _normalizeArguments.apply( this, arguments );
			args.mode = "hide";
			return this.effect.call( this, args );
		}
	},

	// jQuery core overloads toggle and creates _toggle
	__toggle: $.fn.toggle,
	toggle: function( speed ) {
		if ( standardSpeed( speed ) || typeof speed === "boolean" || $.isFunction( speed ) ) {
			return this.__toggle.apply( this, arguments );
		} else {
			var args = _normalizeArguments.apply( this, arguments );
			args.mode = "toggle";
			return this.effect.call( this, args );
		}
	},

	// helper functions
	cssUnit: function(key) {
		var style = this.css( key ),
			val = [];

		$.each( [ "em", "px", "%", "pt" ], function( i, unit ) {
			if ( style.indexOf( unit ) > 0 )
				val = [ parseFloat( style ), unit ];
		});
		return val;
	}
});



/******************************************************************************/
/*********************************** EASING ***********************************/
/******************************************************************************/

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 *
 * Open source under the BSD License.
 *
 * Copyright 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
$.easing.jswing = $.easing.swing;

$.extend( $.easing, {
	def: "easeOutQuad",
	swing: function ( x, t, b, c, d ) {
		return $.easing[ $.easing.def ]( x, t, b, c, d );
	},
	easeInQuad: function ( x, t, b, c, d ) {
		return c * ( t /= d ) * t + b;
	},
	easeOutQuad: function ( x, t, b, c, d ) {
		return -c * ( t /= d ) * ( t - 2 ) + b;
	},
	easeInOutQuad: function ( x, t, b, c, d ) {
		if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t + b;
		return -c / 2 * ( ( --t ) * ( t-2 ) - 1) + b;
	},
	easeInCubic: function ( x, t, b, c, d ) {
		return c * ( t /= d ) * t * t + b;
	},
	easeOutCubic: function ( x, t, b, c, d ) {
		return c * ( ( t = t / d - 1 ) * t * t + 1 ) + b;
	},
	easeInOutCubic: function ( x, t, b, c, d ) {
		if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t * t + b;
		return c / 2 * ( ( t -= 2 ) * t * t + 2) + b;
	},
	easeInQuart: function ( x, t, b, c, d ) {
		return c * ( t /= d ) * t * t * t + b;
	},
	easeOutQuart: function ( x, t, b, c, d ) {
		return -c * ( ( t = t / d - 1 ) * t * t * t - 1) + b;
	},
	easeInOutQuart: function ( x, t, b, c, d ) {
		if ( (t /= d / 2 ) < 1 ) return c / 2 * t * t * t * t + b;
		return -c / 2 * ( ( t -= 2 ) * t * t * t - 2) + b;
	},
	easeInQuint: function ( x, t, b, c, d ) {
		return c * ( t /= d ) * t * t * t * t + b;
	},
	easeOutQuint: function ( x, t, b, c, d ) {
		return c * ( ( t = t / d - 1 ) * t * t * t * t + 1) + b;
	},
	easeInOutQuint: function ( x, t, b, c, d ) {
		if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t  * t * t * t + b;
		return c / 2 * ( ( t -= 2 ) * t * t * t * t + 2) + b;
	},
	easeInSine: function ( x, t, b, c, d ) {
		return -c * Math.cos( t / d * ( Math.PI / 2 ) ) + c + b;
	},
	easeOutSine: function ( x, t, b, c, d ) {
		return c * Math.sin( t / d * ( Math.PI /2 ) ) + b;
	},
	easeInOutSine: function ( x, t, b, c, d ) {
		return -c / 2 * ( Math.cos( Math.PI * t / d ) - 1 ) + b;
	},
	easeInExpo: function ( x, t, b, c, d ) {
		return ( t==0 ) ? b : c * Math.pow( 2, 10 * ( t / d - 1) ) + b;
	},
	easeOutExpo: function ( x, t, b, c, d ) {
		return ( t==d ) ? b + c : c * ( -Math.pow( 2, -10 * t / d) + 1) + b;
	},
	easeInOutExpo: function ( x, t, b, c, d ) {
		if ( t==0 ) return b;
		if ( t==d ) return b + c;
		if ( ( t /= d / 2) < 1) return c / 2 * Math.pow( 2, 10 * (t - 1) ) + b;
		return c / 2 * ( -Math.pow( 2, -10 * --t ) + 2 ) + b;
	},
	easeInCirc: function ( x, t, b, c, d ) {
		return -c * ( Math.sqrt( 1 - ( t /= d ) * t ) - 1 ) + b;
	},
	easeOutCirc: function ( x, t, b, c, d ) {
		return c * Math.sqrt( 1 - ( t = t / d - 1 ) * t ) + b;
	},
	easeInOutCirc: function ( x, t, b, c, d ) {
		if ( ( t /= d / 2) < 1 ) return -c / 2 * ( Math.sqrt( 1 - t * t ) - 1 ) + b;
		return c / 2 * ( Math.sqrt( 1 - ( t -= 2 ) * t ) + 1 ) + b;
	},
	easeInElastic: function ( x, t, b, c, d ) {
		var s = 1.70158,
			p = d * 0.3,
			a = c;
		if ( t == 0 ) return b;
		if ( ( t /= d ) == 1 ) return b+c;
		if ( a < Math.abs( c ) ) {
			a = c;
			s = p / 4;
		} else {
			s = p / ( 2 * Math.PI ) * Math.asin( c / a );
		}
		return - ( a * Math.pow( 2, 10 * ( t -= 1 ) ) * Math.sin( ( t * d - s) * ( 2 * Math.PI ) / p ) ) + b;
	},
	easeOutElastic: function ( x, t, b, c, d ) {
		var s = 1.70158,
			p = d * 0.3,
			a = c;
		if ( t == 0 ) return b;
		if ( ( t /= d ) == 1 ) return b+c;
		if ( a < Math.abs( c ) ) {
			a = c;
			s = p / 4;
		} else {
			s = p / ( 2 * Math.PI ) * Math.asin( c / a );
		}
		return a * Math.pow( 2, -10 * t ) * Math.sin( ( t * d - s ) * ( 2 * Math.PI ) / p ) + c + b;
	},
	easeInOutElastic: function ( x, t, b, c, d ) {
		var s = 1.70158,
			p = d * ( 0.3 * 1.5 ),
			a = c;
		if ( t == 0 ) return b;
		if ( ( t /= d / 2 ) == 2 ) return b+c;
		if ( a < Math.abs( c ) ) {
			a = c;
			s = p / 4;
		} else {
			s = p / ( 2 * Math.PI ) * Math.asin( c / a );
		}
		if ( t < 1 ) return -.5 * ( a * Math.pow( 2, 10 * ( t -= 1 ) ) * Math.sin( ( t * d - s ) * ( 2 * Math.PI ) / p ) ) + b;
		return a * Math.pow( 2, -10 * ( t -= 1 ) ) * Math.sin( ( t * d - s ) * ( 2 * Math.PI ) / p ) *.5 + c + b;
	},
	easeInBack: function ( x, t, b, c, d, s ) {
		if ( s == undefined ) s = 1.70158;
		return c * ( t /= d ) * t * ( ( s+1 ) * t - s ) + b;
	},
	easeOutBack: function ( x, t, b, c, d, s ) {
		if ( s == undefined ) s = 1.70158;
		return c * ( ( t = t / d - 1 ) * t * ( ( s + 1 ) * t + s) + 1) + b;
	},
	easeInOutBack: function ( x, t, b, c, d, s ) {
		if ( s == undefined ) s = 1.70158;
		if ( ( t /= d / 2 ) < 1 ) return c / 2 * ( t * t * ( ( ( s *= 1.525 ) + 1 ) * t - s ) ) + b;
		return c / 2 * ( ( t -= 2 ) * t * ( ( ( s *= 1.525 ) + 1 ) * t + s) + 2) + b;
	},
	easeInBounce: function ( x, t, b, c, d ) {
		return c - $.easing.easeOutBounce( x, d - t, 0, c, d ) + b;
	},
	easeOutBounce: function ( x, t, b, c, d ) {
		if ( ( t /= d ) < ( 1 / 2.75 ) ) {
			return c * ( 7.5625 * t * t ) + b;
		} else if ( t < ( 2 / 2.75 ) ) {
			return c * ( 7.5625 * ( t -= ( 1.5 / 2.75 ) ) * t + .75 ) + b;
		} else if ( t < ( 2.5 / 2.75 ) ) {
			return c * ( 7.5625 * ( t -= ( 2.25/ 2.75 ) ) * t + .9375 ) + b;
		} else {
			return c * ( 7.5625 * ( t -= ( 2.625 / 2.75 ) ) * t + .984375 ) + b;
		}
	},
	easeInOutBounce: function ( x, t, b, c, d ) {
		if ( t < d / 2 ) return $.easing.easeInBounce( x, t * 2, 0, c, d ) * .5 + b;
		return $.easing.easeOutBounce( x, t * 2 - d, 0, c, d ) * .5 + c * .5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

})(jQuery);
/*
 * jQuery UI Effects Drop @VERSION
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Drop
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function( $, undefined ) {

$.effects.effect.drop = function( o, done ) {

	var el = $( this ), 
		props = [ "position", "top", "bottom", "left", "right", "opacity", "height", "width" ],
		mode = $.effects.setMode( el, o.mode || "hide" ),
		show = mode === "show",
		direction = o.direction || "left",
		ref = ( direction === "up" || direction === "down" ) ? "top" : "left",
		motion = ( direction === "up" || direction === "left" ) ? "pos" : "neg",
		animation = {
			opacity: show ? 1 : 0
		},
		distance;

	// Adjust
	$.effects.save( el, props ); 
	el.show(); 
	$.effects.createWrapper( el ); 

	distance = o.distance || el[ ref == "top" ? "outerHeight": "outerWidth" ]({ margin: true }) / 2;

	if ( show ) {
		el
			.css( "opacity", 0 )
			.css( ref, motion == "pos" ? -distance : distance );
	}

	// Animation
	animation[ ref ] = ( show ? 
		( motion === "pos" ? "+=" : "-=" ) : 
		( motion === "pos" ? "-=" : "+=" ) ) 
		+ distance;

	// Animate
	el.animate( animation, { 
		queue: false, 
		duration: o.duration, 
		easing: o.easing, 
		complete: function() {
			mode == "hide" && el.hide();
			$.effects.restore( el, props ); 
			$.effects.removeWrapper( el ); 
			done();
		}
	});

};

})(jQuery);
/*
 * jQuery UI Photoviewer @VERSION
 *
 * Copyright (c) 2009 AUTHORS.txt (http://ui.jquery.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *  jquery.effects.core.js
 *  jquery.effects.drop.js
 *  jquery.mousewheel.js (optional)
 */
(function($) {
	
	$.widget('ui.photoviewer', {
        version: "@VERSION",
        widgetEventPrefix: "photoviewer",
		_create: function() {
			var self = this;
			$.extend(this.options, $.ui.photoviewer.defaults);
			// consider event delegation to make this more dynamic
			this._anchors().click(function(event) {
				event.preventDefault();
				if (self.overlayElement || self.viewerElement)
					return;
				self._display(this);
				return false;
			});
			$(document).click(function(event) {
				// ignore right click
				if (event.button != 2)
					self.close();
			}).keydown(function(event) {
				if (!self.currentAnchor)
					return;
				switch(event.keyCode) {
					case $.ui.keyCode.ESCAPE:
						self.close();
						break;
					case $.ui.keyCode.LEFT:
						self.prev("left");
						event.preventDefault();
						break;
					case $.ui.keyCode.UP:
						self.prev("up");
						event.preventDefault();
						break;
					case $.ui.keyCode.RIGHT:
						self.next("right");
						event.preventDefault();
						break;
					case $.ui.keyCode.DOWN:
						self.next("down");
						event.preventDefault();
						break;
				}
			});
			$(window).resize(function() {
				if (!self.currentAnchor)
					return;
				self._resize(self._viewer().find("img"));
				self._position(self._viewer());
				self._shadow(self._viewer());
			});
			if ($.fn.mousewheel) {
				$(document).mousewheel(function(event, delta) {
					if (!self.currentAnchor)
						return;
					event.preventDefault();
					if (self.viewerElement.is(":animated"))
						return;
					if (delta < 0) {
						self.next("down");
					}
					if (delta > 0) {
						self.prev("up");
					}
				});
			}
		},
		
		_showLoadingIndicator: function() {
			var self = this;
			this.loadingIndicatorTimeout = setTimeout(function() {
				if (!self.loadingIndicator) {
					self.loadingIndicator = self._element("div", "ui-loading-indicator ui-corner-all").appendTo(document.body);
				}
				self._position(self.loadingIndicator);
				self.loadingIndicator.fadeIn("slow");
			}, 250);
		},
		
		_hideLoadingIndicator: function() {
			clearTimeout(this.loadingIndicatorTimeout);
			this.loadingIndicator && this.loadingIndicator.hide();
		},
		
		close: function() {
			if (!this.currentAnchor)
				return;
			var self = this;
			var anchor = this.currentAnchor;
			this.currentAnchor = null;
			
			// client has to invoke callbacks, but scope/args don't matter
			var viewer = this._viewer();
			this.options.hide.call(viewer[0], anchor, function() {
				viewer.remove();
				self.viewerElement = null;
			});
			var overlay = this._overlay();
			this.options.hideOverlay.call(overlay[0], function() {
				overlay.remove();
				self.overlayElement = null;
			});
            this._trigger( "close" );
		},
		
		next: function(direction) {
			this._rotate(":gt(", ":first", direction || "up");
		},
		
		prev: function(direction) {
			this._rotate(":lt(", ":last", direction || "down");
		},
		
		_anchors: function() {
			// if deemed necessary, cache selection here
			return this.element.find(this.options.selector);
		},
		
		_display: function(anchor, direction) {
			if (!anchor)
				return;
				
			var self = this,
				visible = this.viewerElement && this.viewerElement.is(":visible");
				
			this.currentAnchor = anchor;
			
			if (direction) {
				var previous = this._viewer();
				this.options.rotateOut.call(previous[0], {
						up: "down",
						down: "up",
						left: "right",
						right: "left"
					}[direction], function() {
					previous.remove();
				});
			}
			this._showLoadingIndicator();
			
			this._viewer("new").attr("title", anchor.title + this.options.titleSuffix).children("img").one("load", function() {
				var $this = $(this).parent();
				self._hideLoadingIndicator();
				self._resize($(this));
				self._position($this);
				self._shadow($this);
				self._overlay().attr("title", anchor.title + self.options.titleSuffix)
				if (visible) {
					self.options.rotateIn.call($this[0], direction);
				} else {
					self._overlay().css({
						left: $(window).scrollLeft(),
						top: $(window).scrollTop()
					}).each(self.options.showOverlay);
					self.options.show.call($this, anchor);
				}
				self._preloadNeighbours();
			}).attr("src", anchor.href);
			this._trigger( "display", null, {
				anchor: anchor
			});
		},
		
		_preloadNeighbours: function() {
			var anchors = this._anchors(),
				index = anchors.index(this.currentAnchor);
			anchors.filter(this._neighbours(anchors.length, index)).each(function() {
				new Image().src = this.href;
			});
		},
		
		_neighbours: function(index, length) {
			return ":eq(" + (index == 0 ? length - 1 : index - 1) + "), :eq(" + (index == length - 1 ? 0 : index + 1) + ")";
		},
		
		_position: function(img) {
			img.css({
				left: $(window).width() / 2 - img.outerWidth() / 2 + $(window).scrollLeft(),
				top: $(window).height() / 2 - img.outerHeight() / 2 + $(window).scrollTop()
			});
		},
		
		_resize: function(img) {
			// TODO cleanup
			var imgx = img.parent();
			if ($.browser.msie) {
				img.css("width", "auto");
			}
			imgx.css("width", "").css("height", "");
			var outerWidth = imgx.width(),
				outerHeight = imgx.height(),
				ratio = Math.min(Math.min($(window).width() - 36, outerWidth) / outerWidth, Math.min($(window).height() - 60, outerHeight) / outerHeight);
			img.css("width", "");
			//console.log(imgx.outerWidth(), imgx.outerHeight(), imgx.width(), imgx.height())
			//console.log(img, outerWidth, outerHeight, borderWidth, borderHeight, ratio)
			ratio = Math.min(ratio, 1);
				imgx.css({
					width: Math.round(ratio * outerWidth),
					height: Math.round(ratio * outerHeight)
				});
		},
		
		_rotate: function(selectorA, selectorB, direction) {
			if (!this.currentAnchor)
				return;
			var anchors = this._anchors();
			var target = anchors.filter(selectorA + anchors.index(this.currentAnchor) + ")" + selectorB)[0];
			if (!target && this.options.loop && anchors.length > 1) {
				target = anchors.filter(selectorB)[0];
			}
			this._display(target, direction);
		},
		
		_viewer: function(create) {
			if (create || !this.viewerElement) {
				this.viewerElement = this._element("div", "ui-photoviewer-container").append(this._element("img", "ui-photoviewer ui-corner-all").show()).appendTo(document.body);
			}
			return this.viewerElement;
		},
		
		_overlay: function() {
			if (!this.options.overlay)
				return $([]);
			if (!this.overlayElement) {
				this.overlayElement = this._element("div", "ui-widget-overlay").appendTo(document.body);
			}
			return this.overlayElement;
		},
		
		_element: function(type, clazz) {
			return $("<" + type + "/>").addClass(clazz).hide();
		},
		
		_shadow: function(viewer) {
			if (!$.support.canvas)
				return;
			
			viewer.children("canvas").remove();
			
			// TODO compute these hardcoded values
			var width = viewer.width() + 45,
				height = viewer.height() + 45,
				cradius = 10; 
			var canvas = $("<canvas/>").addClass("ui-photoviewer-shadow").appendTo(this._viewer())[0];
			canvas.width = width; canvas.height = height;
			var ctx = canvas.getContext("2d");
			
			
			for (var i = 0; i < 15; i++) {
				ctx.fillStyle = "rgba(150, 150, 150, " + (0.2/15*i) + ")";
				ctx.beginPath();
				ctx.moveTo(cradius + i, i);
				ctx.quadraticCurveTo(i, i, i, cradius + i);
				
				// wrong
				ctx.lineTo(i, height - cradius);
				ctx.quadraticCurveTo(i, height, cradius + i, height);
				
				ctx.lineTo(width - cradius, height);
				ctx.quadraticCurveTo(width, height, width, height - cradius);
				
				// wrong
				ctx.lineTo(width, cradius + i);
				ctx.quadraticCurveTo(width, i, width - cradius, i);
				
				ctx.lineTo(cradius, i);
				ctx.fill();
				width--;
				height--;
			}
			// TODO refactor into drawRoundedBox(width, height, cradius)
			i=0;
			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.moveTo(cradius + i, i);
			ctx.quadraticCurveTo(i, i, i, cradius + i);
			
			// wrong
			ctx.lineTo(i, height - cradius);
			ctx.quadraticCurveTo(i, height, cradius + i, height);
			
			ctx.lineTo(width - cradius, height);
			ctx.quadraticCurveTo(width, height, width, height - cradius);
			
			// wrong
			ctx.lineTo(width, cradius + i);
			ctx.quadraticCurveTo(width, i, width - cradius, i);
			
			ctx.lineTo(cradius, i);
			ctx.fill();
		}
	});
	
	$.support.canvas = !!$("<canvas/>")[0].getContext

	$.extend($.ui.photoviewer, {
		defaults: {
			loop: true,
			overlay: true,
			selector: "a[href]:has(img[src])",
			titleSuffix: " - Click anywhere to close (or press Escape), use keyboard arrows or mousewheel to rotate images",
			rotateIn: function(direction) {
				$(this).effect("drop", {
					direction: direction,
					mode: "show"
				});
			},
			rotateOut: function(direction, finished) {
				$(this).effect("drop", {
					direction: direction
				}, "normal", finished);
			},
			show: function(anchor) {
				var thumb = $(anchor),
					offset = thumb.offset();
				// TODO refactor
				var start = {
					left: offset.left,
					top: offset.top,
					width: thumb.width(),
					height: thumb.height(),
					opacity: 0
				}
				var img = $(this);
				var stop = {
					left: img.css("left"),
					top: img.css("top"),
					width: img.width(),
					height: img.height(),
					opacity: 1
				}
				$(this).css(start).show().animate(stop);
			},
			showOverlay: function() {
				$(this).fadeIn();
			},
			hide: function(anchor, finished) {
				var thumb = $(anchor),
					offset = thumb.offset();
				// TODO refactor (see above)
				var stop = {
					left: offset.left,
					top: offset.top,
					width: thumb.width(),
					height: thumb.height(),
					opacity: 0
				}
				$(this).animate(stop, finished);
			},
			hideOverlay: function(finished) {
				$(this).fadeOut(finished);
			}
		}
	});

})(jQuery);
