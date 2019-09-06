/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : property_definition.js
* Created at  : 2019-09-05
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
const { property_definition } = require("../enums/states_enum");
const {
    is_assign_token,
    is_asterisk_token,
    is_delimiter_token,
} = require("../../helpers");

const is_possible_reference_id = (() => {
    const delimiters = [',', '}'];
    return token => {
        return token.id === "Delimiter" && delimiters.includes(token.value);
    };
})();

const get_method = parser => {
    parser.change_state("method_definition");
    const definition = parser.generate_next_node();
    parser.prepare_next_node_definition(true);
    return definition;
};

module.exports = {
    id         : "Property definition",
    type       : "Expression",
    precedence : EXPRESSION,

    is         : (token, { current_state : s }) => s === property_definition,
    initialize : (node, token, parser) => {
        let definition;
        if (is_asterisk_token(token)) {
            definition = get_method(parser);
        } else {
            const next_token = parser.look_ahead(true);

            if (is_assign_token(next_token)) {
                parser.change_state("cover_initialized_name");
                definition = parser.generate_next_node();
            } else if (is_possible_reference_id(next_token)) {
                parser.change_state("identifier_reference");
                definition = parser.generate_next_node();
                parser.prepare_next_node_definition(true);
            } else {
                parser.change_state("property_name");
                parser.set_prev_node(parser.generate_next_node());
                parser.prepare_next_node_definition(true);

                if (is_delimiter_token(parser.next_token, ':')) {
                    parser.change_state("property_assignment");
                    definition = parser.generate_next_node();
                } else {
                    definition = get_method(parser);
                }
            }
        }

        node.definition = definition;
        node.start      = definition.start;
        node.end        = definition.end;
    }
};
