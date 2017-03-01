'use strict';


var calculator = function (s) {
    var parts = s.split(/ *; */);
    if (parts.length === 0) {
        return 'No expressions entered.';
    };
    var plural;
    if (parts.length === 1) {
        plural = 'Result';
    } else {
        plural = 'Results';
    }
    return plural + ' for ' + s + ':<br/>' + parts.map(calculator_one_thing).filter(function (x) {
        return x !== null;
    }).join('<br/>')
}

var calculator_one_thing = function (s) {
    if (s === '') {
        return null;
    }
    var result = paren_calculator('(' + s + ')');
    if (typeof result === 'string') {
        return 'Error evaluating ' + s + ': ' + result;
    } else {
        return s + ' = ' + result;
    }
}

var paren_calculator = function (s) {
    return evaluate_parsed(paren_parse(s));
}

var paren_parse = function (x) {
    if (x[0] !== '(') {
        if (/^-?\d+$/.exec(x)) {
            return parseInt(x, 10);
        } else if (/^-?(\d+\.\d*|\d*\.\d+)$/.exec(x)) {
            return parseFloat(x);
        } else if (x in op_dict) {
            return op_dict[x];
        } else {
            return 'Cannot recogize \'' + x + '\'';
        }
    } else {
        var end = x.length - 1;
        var parts = [[]];
        var depth = 0;
        for (var i = 1; i < end; i++) {
            var c = x[i];
            if (depth === 0 && c === ' ') {
                parts.push([]);
            } else {
                last(parts).push(c);
                if (c === '(') {
                    depth++;
                } else if (c === ')') {
                    depth--;
                }
            }
            if (depth < 0) {
                return 'Too many close parentheses.';
            }
        }
        if (depth > 0) {
            return 'Too many open parentheses.';
        }
        var result = parts.map(function (part) {
            return paren_parse(part.join(''));
        });
        if (result.some(is_string)) {
            return result.filter(is_string).join(', ');
        } else {
            return operator_precedence_handling(result);
        }
    }
}

var is_embeddable_calc = function (x) {
    return typeof x === 'object' && 'embeddable' in x && x.embeddable === true;
}

var is_number_calc = function (x) {
    return typeof x === 'number' || !('name' in x); // operator detection, maybe clean
}

var should_embed_in = function (precedence, assoc, x) {
    if (assoc === 'left') {
        return precedence > x.op.precedence;
    } else if (assoc === 'right') {
        return precedence >= x.op.precedence;
    }
}

var operator_precedence_handling = function (x) {
    if (x.length % 2 === 0) {
        return 'Numbers and operators do not alternate properly.';
    }
    var i;
    for (i = 0; i < x.length; i++) {
        if (i % 2 === 0) {
            if (!is_number_calc(x[i])) {
                return 'Operator where number should be.';
            }
        } else if (i % 2 === 1) {
            if (is_number_calc(x[i])) {
                return 'Number where operator should be.';
            }
        }
    }
    if (x.length === 1) {
        return x[0];
    }
    var result = {
        'op': x[1],
        'left': x[0],
        'right': x[2],
        'embeddable': true
    };
    for (i = 3; i < x.length; i += 2) {
        var precedence = x[i].precedence;
        var assoc = x[i].assoc;
        if (!should_embed_in(precedence, assoc, result)) {
            result = {
                'op': x[i],
                'left': result,
                'right': x[i + 1],
                'embeddable': true
            }
        } else {
            var descending = result;
            while (is_embeddable_calc(descending.right)
                && should_embed_in(precedence, assoc, descending.right)) {
                descending = descending.right;
            }
            descending.right = {
                'op': x[i],
                'left': descending.right,
                'right': x[i + 1],
                'embeddable': true
            }
        }
    }
    return {
        'paren': result
    }
}

var evaluate_parsed = function (parsed) {
    if (is_string(parsed)) {
        // error
        return parsed;
    } else if (is_number(parsed)) {
        // just a number
        return parsed;
    } else if ('paren' in parsed) {
        return evaluate_parsed(parsed.paren);
    } else {
        return parsed.op.f(evaluate_parsed(parsed.left), evaluate_parsed(parsed.right));
    }
}

// Some base conversion stuff.

var base_convert = function (s) {
    var nums = s.match(/-?\d+/g);
    var from = parseInt(nums[0], 10);
    var to = parseInt(nums[1], 10);
    var nums_to_convert = nums.slice(2);
    return nums_to_convert.map(function (x) {
        return x + ' -> ' + parseInt(x, from).toString(to);
    }).join('<br/>');
}

var get_precedence = function (x) {
    if (x in op_dict) {
        return x + ' has precedence ' + op_dict[x].precedence;
    } else {
        return x + ' is not an operator';
    }
}

var get_assoc = function (x) {
    if (x in op_dict) {
        return x + ' has assoc ' + op_dict[x].assoc;
    } else {
        return x + ' is not an operator';
    }
}

// General calculator operation generator.

var calc_op = function (f) {
    return {
        'f': function (x) {
            var result = f(x);
            if (result !== null) {
                el('other').innerHTML = result;
            }
        },
        'arg': true
    }
}
