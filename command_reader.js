'use strict';

var commands = {
    'calc': calc_op(calculator),
    'calculator': calc_op(calculator),
    'base': calc_op(base_convert),
    'prec': calc_op(get_precedence),
    'precedence': calc_op(get_precedence),
    'assoc': calc_op(get_assoc),
    'level': {
        'f': function (x) {
            if (x === undefined) {
                el('other').innerHTML = Question.get_level();
            } else {
                Question.set_level(parseInt(x, 10));
            }
        },
        'arg': null
    },
    'world': {
        'f': function (x) {
            if (x === undefined) {
                el('other').innerHTML = Question.get_world();
            } else {
                Question.set_world(parseInt(x, 10));
            }
        },
        'arg': null
    },
    'limit': {
        'f': function () {
            el('other').innerHTML = Question.get_limit();
        },
        'arg': false
    },
    'skip': {
        'f': function (x) {
            Question.skip();
        },
        'arg': false
    },
    'commands': {
        'f': function () {
            el('other').innerHTML = Object.keys(commands).sort().join(', ');
        },
        'arg': false
    },
    'operators': {
        'f': function (input) {
            if (input === undefined) {
                el('other').innerHTML = ops.map(function (x) {
                    return x.name;
                }).join(', ');
            } else {
                Question.use_operators(input);
            }
        },
        'arg': null
    }
}

var show_invalid = function (x) {
    el('other').innerHTML = 'Invalid command.';
}

var clear_boxes = function () {
    el('command_input').value = '';
    el('other').innerHTML = '';
}

var process_input = function (input) {
    clear_boxes();
    if (/^-?\d+$/.exec(input)) {
        Question.answer(parseInt(input, 10));
    } else {
        process_typical_input(input);
    }
}

var process_typical_input = function (input) {
    var parts = input.split(' ');
    if (!(parts[0] in commands)) {
        show_invalid();
        return;
    }
    var command = commands[parts[0]];
    if (parts.length === 1) {
        if (command.arg === true) {
            show_invalid();
            return;
        }
        command.f();
    } else {
        if (command.arg === false) {
            show_invalid();
            return;
        }
        command.f(parts.slice(1).join(' '));
    }
}

window.onload = function () {
    Question.init();
    el('command_input').addEventListener('keyup', function (e) {
        if (e.keyCode === 13) {
            process_input(el('command_input').value);
        }
    });
}
