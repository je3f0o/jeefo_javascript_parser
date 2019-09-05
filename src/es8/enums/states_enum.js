/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : states_enum.js
* Created at  : 2019-08-27
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

const for_each    = require("@jeefo/utils/object/for_each");
const states_enum = require("../../es6/enums/states_enum");

const next_state_value = (() => {
    let last = 0;
    for_each(states_enum, (key, value) => {
        if (value > last) {
            last = value;
        }
    });
    return last + 1;
})();

module.exports = [
    // 11.6.2.1 - Keywords
    "keyword",
    "context_keyword",

    // 11.7 - Punctuators
    "punctuator",

    // 12 - Expressions
    // 12.1 - Identifiers
    "label_identifier",
    "identifier_reference",

    // 12.2.4 - Literals
    "literal",

    // 12.3 - Left hand side expressions
    "new_expression",
    "member_operator",
    "member_expression",
    "left_hand_side_expression",

    // 12.15 - Assigment expression
    // ----------------------------
    // Array assignment
    "assignment_element",
    "assignment_rest_element",
    "destructuring_assignment_target",
    "array_assignment_pattern",
    // Object assignment
    "assignment_property",
    "object_assignment_pattern",

    // 13.3.3 - Destructuring binding patterns
    "array_binding_pattern",
    "object_binding_pattern",

    // 14.4 - Function definitions
    "binding_rest_element",
    "function_rest_parameter",

    // ...
    "arguments_state",
    "formal_parameter",
    "cover_parenthesized_expression",

    "assignment_expression",

    // Bindings
    "assignment_pattern",

    // Async functions
    "async_arrow_function",
    "async_function_body",
    "async_function_expression",
].reduce((states, key, index) => {
    if (states[key]) {
        console.log("Duplicated state:", key);
        process.exit();
    }
    states[key] = next_state_value + index;
    return states;
}, Object.assign({}, states_enum));
