/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : cover_parenthesized_expression_and_arrow_parameters.js
* Created at  : 2019-09-02
* Updated at  : 2019-09-07
* Author      : jeefo
* Purpose     :
* Description :
* Reference   :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const { EXPRESSION }                = require("../enums/precedence_enum");
const { get_last_non_comment_node } = require("../../helpers");
const {
    expression,
    grouping_expression,
} = require("../enums/states_enum");
const {
    is_comma,
    is_arrow_token,
    is_delimiter_token,
    is_close_parenthesis,
} = require("../../helpers");

module.exports = {
    id         : "Cover parenthesized expression and arrow parameter list",
	type       : "Expression",
	precedence : EXPRESSION,

    is (token, parser) {
        if (parser.current_state !== expression) { return; }

        if (is_delimiter_token(token, '(')) {
            return get_last_non_comment_node(parser) === null;
        }
    },
	initialize (node, token, parser) {
        const list       = [];
        const delimiters = [];
        let is_function_parameters;

        parser.change_state("punctuator");
        const open = parser.generate_next_node();
        parser.prepare_next_state("assignment_expression");
        while (! is_close_parenthesis(parser)) {
            if (parser.next_token.id === "Rest") {
                parser.change_state("function_rest_parameter");
                list.push(parser.generate_next_node());
                is_function_parameters = true;
                break;
            }
            list.push(parser.generate_next_node());

            if (is_comma(parser)) {
                parser.change_state("punctuator");
                delimiters.push(parser.generate_next_node());
                parser.prepare_next_state("assignment_expression");
            }
        }
        parser.change_state("punctuator");
        const close = parser.generate_next_node();

        node.open_parenthesis  = open;
        node.expression_list   = list;
        node.delimiters        = delimiters;
        node.close_parenthesis = close;
        node.end               = close.end;

        if (! is_function_parameters) {
            const next_token = parser.look_ahead();
            if (list.length === 0) {
                if (next_token && is_arrow_token(next_token)) {
                    is_function_parameters = true;
                } else {
                    parser.throw_unexpected_token();
                }
            } else if (next_token && is_arrow_token(next_token)) {
                is_function_parameters = true;
            }
        }

        if (is_function_parameters) {
            parser.end(node);
            parser.current_state = expression;
        } else {
            parser.current_state = grouping_expression;
        }
    },
};
