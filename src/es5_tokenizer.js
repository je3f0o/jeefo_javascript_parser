/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : es5_tokenizer.js
* Created at  : 2017-04-08
* Updated at  : 2017-06-03
* Author      : jeefo
* Purpose     :
* Description :
*
* Precedence Table
* 0  - 10 : Identifier and Literals
* 10 - 20 : Delimiters
* 20 - 30 : Operators
* 40      : Comment
* 50      : Division operator
*
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

var jeefo    = require("./parser"),
	_package = require("../package"),
	app      = jeefo.module(_package.name);

/* global */
/* exported */
/* exported */

// ignore:end

// ES5 Tokenizer {{{1
app.namespace("javascript.es5_tokenizer", ["tokenizer.Tokenizer"], function (Tokenizer) {
	var es5_tokenizer = new Tokenizer();

	var DELIMITERS = [
		'.', ',',
		'/', '?',
		';', ':',
		"'", '"',
		'`', '~',
		'-',
		'=', '+',
		'\\', '|', 
		'(', ')',
		'[', ']',
		'{', '}',
		'<', '>',
		'!', '@', '#', '%', '^', '&', '*',
	].join('');

	es5_tokenizer.
	// Delimiter {{{2
	register({
		is : function (character) {
			switch (character) {
				case ':' : case ';' :
				case ',' : case '?' :
				case '(' : case ')' :
				case '[' : case ']' :
				case '{' : case '}' :
					return true;
			}
		},
		protos : {
			type       : "Delimiter",
			precedence : 10,
			initialize : function (character, streamer) {
				this.type  = this.type;
				this.value = this.delimiter = character;
				this.start = streamer.get_cursor();
				this.end   = streamer.end_cursor();
			},
		}
	}).

	// Comment {{{2
	register({
		is : function (character, streamer) {
			if (character === '/') {
				switch (streamer.peek(streamer.cursor.index + 1)) { case '*' : case '/' : return true; }
			}
		},
		protos : {
			type       : "Comment",
			precedence : 40,
			initialize : function (character, streamer) {
				var start = streamer.get_cursor(), start_index, end_index, is_trimmed;

				this.type = this.type;

				if (streamer.next() === '*') {
					var cursor  = streamer.cursor;
					character   = streamer.next(true);
					start_index = streamer.cursor.index;

					while (character) {
						end_index = streamer.cursor.index;

						if (character === '*' && streamer.peek(cursor.index + 1) === '/') {
							streamer.next();
							break;
						}
						character = streamer.next(true);

						if (! is_trimmed) {
							start_index = streamer.cursor.index;
							is_trimmed  = true;
						}
					}

					this.comment      = streamer.seek(start_index, end_index);
					this.is_multiline = true;
				} else {
					character   = streamer.next();
					start_index = streamer.cursor.index;

					while (character && character !== '\n') {
						character = streamer.next();

						if (! is_trimmed) {
							start_index = streamer.cursor.index;
							is_trimmed  = true;
						}
					}

					this.comment      = streamer.seek(start_index);
					this.is_multiline = false;
				}

				this.start = start;
				this.end   = streamer.get_cursor();
			},
		}
	}).

	// Identifier {{{2
	register({
		protos : {
			type       : "Identifier",
			DELIMITERS : DELIMITERS,
			initialize : function (character, streamer) {
				var start = streamer.get_cursor(), end = {};

				while (character && character > ' ' && this.DELIMITERS.indexOf(character) === -1) {
					streamer.assign(end, streamer.cursor);
					character = streamer.next();
				}

				this.type  = this.type;
				this.value = streamer.seek(start.index);
				this.start = start;
				this.end   = streamer.get_cursor();

				streamer.cursor = end;
			},
		},
	}).

	// Number Literal {{{2
	register({
		is     : function (character) { return character >= '0' && character <= '9'; },
		protos : {
			type       : "Number",
			precedence : 2,
			initialize : function (character, streamer) {
				var start = streamer.get_cursor(), end = {};

				while (character && character >= '0' && character <= '9') {
					streamer.assign(end, streamer.cursor);
					character = streamer.next();
				}

				if (character && character === '.') {
					character = streamer.next();
					while (character && character >= '0' && character <= '9') {
						streamer.assign(end, streamer.cursor);
						character = streamer.next();
					}
				}

				if (character && (character === 'e' || character === 'E')) {
					character = streamer.next();
					while (character && character >= '0' && character <= '9') {
						streamer.assign(end, streamer.cursor);
						character = streamer.next();
					}
				}

				this.type  = this.type;
				this.value = streamer.seek(start.index);
				this.start = start;
				this.end   = streamer.get_cursor();

				streamer.cursor = end;
			},
		},
	}).

	// String Literal {{{2
	register({
		is     : function (character) { return character === '"' || character === "'"; },
		protos : {
			type       : "String",
			precedence : 1,
			initialize : function (character, streamer) {
				var start = streamer.get_cursor(), quote = character, start_index;

				character   = streamer.next();
				start_index = streamer.cursor.index;

				while (character && character >= ' ' && character !== quote) {
					if (character === '\\') {
						streamer.next();
					}
					character = streamer.next();
				}

				this.type  = this.type;
				this.quote = quote;
				this.value = streamer.seek(start_index);
				this.start = start;
				this.end   = streamer.get_cursor();
			},
		},
	}).

	// Operator {{{2
	register({
		is : function (character) {
			switch (character) {
				// Member operator
				case '.' :
				// Comparation operators
				case '!' :
				case '<' :
				case '>' :
				// Assignment and math operators
				case '=' :
				case '+' :
				case '-' :
				case '*' :
				case '%' :
				// Binary operators
				case '&' :
				case '|' :
				case '^' :
				case '~' :
					return true;
			}
		},
		protos : {
			type       : "Operator",
			precedence : 20,
			initialize : function (character, streamer) {
				var start = streamer.get_cursor(), cursor = streamer.cursor;

				switch (character) {
					case '!' :
					case '=' :
						if (streamer.peek(cursor.index + 1) === '=') {
							streamer.move_right(1);

							if (streamer.peek(cursor.index + 1) === '=') {
								streamer.move_right(1);
							}
						}
						break;
					case '+' :
					case '-' :
					case '&' :
					case '|' :
						switch (streamer.peek(cursor.index + 1)) {
							case '='       :
							case character :
								streamer.move_right(1);
						}
						break;
					case '/' :
					case '%' :
					case '^' :
						if (streamer.peek(cursor.index + 1) === '=') {
							streamer.move_right(1);
						}
						break;
					case '*' :
						if (streamer.peek(cursor.index + 1) === '*') {
							streamer.move_right(1);
						}
						if (streamer.peek(cursor.index + 1) === '=') {
							streamer.move_right(1);
						}
						break;
					case '<' :
						if (streamer.peek(cursor.index + 1) === '<') {
							streamer.move_right(1);
						}
						if (streamer.peek(cursor.index + 1) === '=') {
							streamer.move_right(1);
						}
						break;
					case '>'  :
						if (streamer.peek(cursor.index + 1) === '>') {
							streamer.move_right(1);

							if (streamer.peek(cursor.index + 1) === '>') {
								streamer.move_right(1);
							}

						}
						if (streamer.peek(cursor.index + 1) === '=') {
							streamer.move_right(1);
						}
				}

				this.type     = this.type;
				this.operator = streamer.seek(start.index, cursor.index + 1);
				this.start    = start;
				this.end      = streamer.end_cursor();
			},
		},
	}).

	// Slash {{{2
	register({
		is : function (character, streamer) {
			if (character === '/') {
				switch (streamer.peek(streamer.cursor.index + 1)) { case '*' : case '/' : return false; }
				return true;
			}
		},
		protos : {
			type       : "Slash",
			precedence : 50,
			DELIMITERS : DELIMITERS,
			initialize : function (character, streamer) {
				this.type  = this.type;
				this.start = streamer.get_cursor();
				this.end   = streamer.end_cursor();
			},
		},
	});
	// }}}2

	return es5_tokenizer;
});
// }}}1

// ignore:start
module.exports = jeefo;
// ignore:end