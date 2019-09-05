/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : yield_expression.js
* Created at  : 2019-08-23
* Updated at  : 2019-09-05
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

const { expression }       = require("../enums/states_enum");
const { YIELD_EXPRESSION } = require("../enums/precedence_enum");
const {
    is_asterisk,
    has_no_line_terminator,
} = require("../../helpers");

module.exports = {
    id         : "Yield expression",
    type       : "Expression",
    precedence : YIELD_EXPRESSION,

    is (token, { current_state, context_stack }) {
        if (current_state === expression) {
            const context = context_stack[context_stack.length - 1];
            if (context && context.id === "Generator body") {
                return true;
            }
        }
    },
    initialize (node, token, parser) {
        let asterisk  = null, expression = null;
        parser.change_state("keyword");
        const keyword = parser.generate_next_node();

        const next_token = parser.look_ahead(true);
        if (has_no_line_terminator(keyword, next_token)) {
            parser.prepare_next_state("assignment_expression", true);
            if (is_asterisk(parser.next_token)) {
                parser.change_state("punctuator");
                asterisk = parser.generate_next_node();
                parser.prepare_next_state("assignment_expression", true);
            }
            expression = parser.generate_next_node();
        }

        node.keyword    = keyword;
        node.asterisk   = asterisk;
        node.expression = expression;
        node.start      = keyword.start;
        node.end        = expression.end;
    }
};
