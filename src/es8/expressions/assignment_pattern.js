/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : assignment_pattern.js
* Created at  : 2019-09-05
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

const { EXPRESSION }         = require("../enums/precedence_enum");
const { assignment_pattern } = require("../enums/states_enum");

module.exports = {
    id         : "Assignment pattern",
	type       : "Expression",
	precedence : EXPRESSION,

    is     : (_, { current_state : s }) => s === assignment_pattern,
    refine : (node, expression, parser) => {
        let pattern_name;
        switch (expression.id) {
            case "Array literal"  :
                pattern_name = "array_assignment_pattern";
                break;
            case "Object literal" :
                pattern_name = "object_assignment_pattern";
                break;
            default:
                parser.throw_unexpected_refine(node, expression);
        }
        const pattern = parser.refine(pattern_name, expression);

        node.pattern = pattern;
        node.start   = pattern.start;
        node.end     = pattern.end;
    }
};
