/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : template_literal.js
* Created at  : 2019-05-27
* Updated at  : 2019-12-13
* Author      : jeefo
* Purpose     :
* Description :
* Reference   : https://www.ecma-international.org/ecma-262/6.0/#sec-template-literal-lexical-components
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const { AST_Node_Definition }            = require("@jeefo/parser");
const { is_close_curly }                 = require("../../helpers");
const { PRIMITIVE, TERMINATION }         = require("../enums/precedence_enum");
const { expression, primary_expression } = require("../enums/states_enum");

const template_string = new AST_Node_Definition({
	id         : "Template literal string",
    type       : "Primitive",
	precedence : -1,

    is         : () => {},
    initialize : (node, current_token, parser) => {
        const { streamer } = parser.tokenizer;

        let length         = 0;
        let current_index  = streamer.cursor.position.index;
        let virtual_length = 0;
        let next_character = streamer.get_current_character();

        let start, end, last_pos;
        if (parser.last_position) {
            start                 = parser.last_position.clone();
            start.index          += 1;
            start.column         += 1;
            start.virtual_column += 1;
        } else {
            start = streamer.clone_cursor_position();
        }

        const get_next_character = (next_length = 1) => {
            return streamer.at(current_index + length + next_length);
        };

        LOOP:
        while (true) {
            switch (next_character) {
                case '\t' :
                    virtual_length += streamer.tab_size - 1;
                    break;
                case '\n' :
                    next_character = get_next_character();

                    if (next_character === '`') {
                        if (parser.last_position) {
                            end = start.clone();
                            streamer.cursor.position.line -= 1;
                        } else {
                            streamer.cursor.move(length, virtual_length);
                            end = streamer.clone_cursor_position();
                        }

                        streamer.cursor.position.line          += 1;
                        streamer.cursor.position.column         = 0;
                        streamer.cursor.position.virtual_column = 0;
                        break LOOP;
                    } else {
                        if (parser.last_position) {
                            last_pos = start.clone();
                            parser.last_position = null;
                        } else {
                            if (length) {
                                streamer.cursor.move(length, virtual_length);
                                last_pos = streamer.clone_cursor_position();
                            }
                            streamer.cursor.position.line += 1;
                        }

                        streamer.cursor.position.column         = 0;
                        streamer.cursor.position.virtual_column = 0;

                        current_index = streamer.cursor.position.index;
                        length = virtual_length = 0;
                    }
                    break;
                case '$':
                    if (get_next_character() === '{') {
                        const is_new_line = (
                            length === 1 &&
                            streamer.cursor.position.column === 0 &&
                            last_pos
                        );
                        streamer.cursor.move(length-1, virtual_length - 1);
                        if (is_new_line) {
                            end = last_pos;
                        } else {
                            end = streamer.clone_cursor_position();
                        }
                        break LOOP;
                    }
                    break;
                case '`':
                    streamer.cursor.move(length - 1, virtual_length - 1);
                    end = streamer.clone_cursor_position();
                    break LOOP;
                case '\\':
                    length         += 1;
                    virtual_length += 1;
                    break;
                case null: parser.throw_unexpected_end_of_stream();
            }

            next_character  = get_next_character();
            length         += 1;
            virtual_length += 1;
        }

        node.value = streamer.substring_from_offset(start.index);
        node.start = start;
        node.end   = end;
    }
});

const template_expression = new AST_Node_Definition({
	id         : "Template literal expression",
    type       : "Primitive",
	precedence : -1,

    is         : () => {},
    initialize : (node, current_token, parser) => {
        const { streamer } = parser.tokenizer;
        const start        = streamer.clone_cursor_position();

		streamer.cursor.move(1);
        parser.prepare_next_state("expression", true);

        const expression = parser.parse_next_node(TERMINATION);
        parser.expect('}', is_close_curly);

        node.expression = expression;
        node.start      = start;
        node.end        = streamer.clone_cursor_position();
    }
});

module.exports = {
    id         : "Template literal",
    type       : "Primitive",
    precedence : PRIMITIVE,

    is : (token, { current_state }) => {
        return current_state === expression && token.id === "Backtick";
    },
    initialize : (node, current_token, parser) => {
        const body           = [];
        const { streamer }   = parser.tokenizer;
        const start_position = streamer.clone_cursor_position();

        if (streamer.get_next_character() === '\n') {
            parser.last_position = streamer.clone_cursor_position();
        }
		let next_character = streamer.next();

        LOOP:
        while (true) {
            switch (next_character) {
                case '`' : break LOOP;
                case null:
                    parser.throw_unexpected_end_of_stream();
                    break;
            }

            if (next_character === '$' && streamer.is_next_character('{')) {
                body.push(template_expression.generate_new_node(parser));
            } else {
                body.push(template_string.generate_new_node(parser));
            }

            next_character = streamer.get_next_character();
            if (next_character === '\n') {
                parser.last_position = streamer.clone_cursor_position();
            } else {
                parser.last_position = null;
            }
            if (streamer.get_current_character() === '\n') {
                streamer.cursor.position.line -= 1;
            }
            streamer.next();
        }
        delete parser.last_position;

        node.body  = body;
        node.start = start_position;
        node.end   = streamer.clone_cursor_position();

        /*
        node.body.forEach(n => {
            console.log("----------");
            console.log(streamer.substring_from_token(n)
                .replace(/ /g, '.')
                .replace(/\n/g, '\\n')
            );
            console.log(n.start);
            console.log(n.end);
            console.log("--------------------------");
        });
        console.log();
        console.log(streamer.substring_from_token(node));
        console.log(node.start);
        console.log(node.end);
        process.exit();
        */

        // It's important, since there is no real next token
        parser.next_token    = node;
        parser.current_state = primary_expression;
    }
};
