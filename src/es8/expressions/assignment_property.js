/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : assignment_property.js
* Created at  : 2019-09-03
* Updated at  : 2019-09-06
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

const { EXPRESSION }          = require("../enums/precedence_enum");
const { assignment_property } = require("../enums/states_enum");

module.exports = {
    id         : "Assignment property",
	type       : "Expression",
	precedence : EXPRESSION,
    is         : (_, { current_state : s }) => s === assignment_property,

	refine (node, property, parser) {
        if (property.id !== "Property definition") {
            parser.throw_unexpected_refine(node, property);
        }

        let expression;
        switch (property.definition.id) {
            case "Identifier reference" :
                expression = property.definition;
                break;
            case "Cover initialized name" :
                expression = parser.refine(
                    "assignment_property_identifier",
                    property.definition
                );
                break;
            case "Property assignment":
                expression = parser.refine(
                    "assignment_property_element",
                    property.definition
                );
                return;
            default:
                parser.throw_unexpected_refine(node, property.definition);
        }

        node.expression = expression;
        node.start      = expression.start;
        node.end        = expression.end;
    },
};
