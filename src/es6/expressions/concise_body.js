/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : concise_body.js
* Created at  : 2019-09-04
* Updated at  : 2019-09-04
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

const { EXPRESSION }         = require("../enums/precedence_enum");
const { concise_body }       = require("../enums/states_enum");
const { is_delimiter_token } = require("../../helpers");

module.exports = {
    id         : "Concise body",
    type       : "Expression",
    precedence : EXPRESSION,

    is         : (_, parser) => parser.current_state === concise_body,
    initialize : (node, token, parser) => {
        if (is_delimiter_token(token, '{')) {
            parser.change_state("arrow_function_body");
        } else {
            parser.change_state("asignment_expression");
        }
        const expression = parser.generate_next_node();

        node.expression = expression;
        node.start      = expression.start;
        node.end        = expression.end;
    }
};
