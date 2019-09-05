/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : binding_element.js
* Created at  : 2019-09-02
* Updated at  : 2019-09-05
* Author      : jeefo
* Purpose     :
* Description : I discarded SingleNameBinding. Maybe i will add later or not...
* Reference   :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const { EXPRESSION }      = require("../enums/precedence_enum");
const { binding_element } = require("../enums/states_enum");

function refine_primary_expression (node, expression, parser) {
    switch (expression.id) {
        case "Identifier reference":
            return parser.refine("binding_identifier", expression);
        case "Array literal"  :
        case "Object literal" :
            return parser.refine("binding_pattern", expression);
    }
    parser.throw_unexpected_refine(node, expression);
}

function refine_binding_element (node, expression, parser) {
    let initializer = null, element;

    switch (expression.id) {
        case "Assignment expression" :
            expression = expression.expression;
            [
                "Primary expression",
            ].forEach(id => {
                if (expression.id === id) {
                    expression = expression.expression;
                } else {
                    parser.throw_unexpected_refine(node, expression);
                }
            });
            element = refine_primary_expression(node, expression, parser);
            break;
        case "Assignment operator" :
            // Binding
            let left = expression.assignment.expression;
            [
                "New expression",
                "Member expression",
                "Primary expression",
            ].forEach(id => {
                if (left.id === id) {
                    left = left.expression;
                } else {
                    parser.throw_unexpected_refine(node, left);
                }
            });
            ({ element } = refine_primary_expression(node, left, parser));

            // Initializer
            initializer = parser.refine("initializer", {
                operator   : expression.operator,
                expression : expression.expression
            });
            break;
        default:
            parser.throw_unexpected_refine(node, expression);
    }

    return { element, initializer };
}

module.exports = {
    id         : "Binding element",
	type       : "Expression",
	precedence : EXPRESSION,

    is         (_, { current_state : s }) { return s === binding_element; },
	initialize (node, token, parser) {
        parser.change_state("assignment_expression");
        this.refine(node, parser.generate_next_node(), parser);
    },

    refine (node, expression, parser) {
        const { element, initializer } = refine_binding_element(
            node, expression, parser
        );

        node.element     = element;
        node.initializer = initializer;
        node.start       = element.start;
        node.end         = (initializer || element).end;
    }
};