/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : block_statement.js
* Created at  : 2017-08-18
* Updated at  : 2019-09-07
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const { statement }          = require("../enums/states_enum");
const { STATEMENT }          = require("../enums/precedence_enum");
const { is_delimiter_token } = require("../../helpers");

module.exports = {
	id         : "Block statement",
	type       : "Statement",
	precedence : STATEMENT,

    is (token, { current_state }) {
        return current_state === statement && is_delimiter_token(token, '{');
    },
	initialize (node, token, parser) {
        parser.change_state("function_body");
        parser.next_node_definition.initialize(node, token, parser);

        parser.terminate(node);
    }
};
