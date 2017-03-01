'use strict';

var full_ops = [
    {
        'name': '+',
        'f': function (a, b) {
            return a + b;
        },
        'difficulty': 1,
        'precedence': 4,
        'assoc': 'left'
    },
    {
        'name': '-',
        'f': function (a, b) {
            return a - b;
        },
        'difficulty': 2,
        'precedence': 4,
        'assoc': 'left'
    },
    {
        'name': '*',
        'f': function (a, b) {
            return a * b;
        },
        'difficulty': 3,
        'precedence': 5,
        'assoc': 'left'
    },
    {
        'name': '/',
        'f': function (a, b) {
            return a / b;
        },
        'difficulty': 4,
        'precedence': 5,
        'assoc': 'left'
    },
    {
        'name': '**',
        'f': function (a, b) {
            return Math.pow(a, b);
        },
        'difficulty': 10,
        'precedence': 6,
        'assoc': 'right'
    },
    {
        'name': '//',
        'f': function (a, b) {
            return Math.floor(a / b);
        },
        'difficulty': 14,
        'precedence': 5,
        'assoc': 'left'
    },
    {
        'name': '%',
        'f': function (a, b) {
            return a % b;
        },
        'difficulty': 14,
        'precedence': 5,
        'assoc': 'left'
    },
    {
        'name': '&',
        'f': function (a, b) {
            return a & b;
        },
        'difficulty': 20,
        'precedence': 3,
        'assoc': 'left'
    },
    {
        'name': '|',
        'f': function (a, b) {
            return a | b;
        },
        'difficulty': 20,
        'precedence': 1,
        'assoc': 'left'
    },
    {
        'name': '^',
        'f': function (a, b) {
            return a ^ b;
        },
        'difficulty': 20,
        'precedence': 2,
        'assoc': 'left'
    }
];

var create_op_dict = function () {
    var d = {};
    for (var i = 0; i < full_ops.length; i++) {
        d[full_ops[i].name] = full_ops[i];
    }
    return d;
}

var full_op_dict = create_op_dict(full_ops);

var ops = full_ops;

var op_dict = full_op_dict;

var use_operators = function (s) {
    var ops_to_use = s.split(' ');
    if (ops_to_use.some(function (op) {
        return !(op in full_op_dict);
    })) {
        return false;
    }
    ops = full_ops.filter(function (x) {
        return ops_to_use.indexOf(x.name) !== -1;
    });
    op_dict = create_op_dict(ops);
    return true;
}
