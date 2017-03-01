'use strict';

var difficulty_of_num = function (num) {
    return 2 + Math.max(0, Math.floor(Math.log2(Math.abs(num)))) - Math.sign(num);
}

var close = function (d1, d2) {
    var ratio = (d1 + 1) / (d2 + 1);
    return 0.8 <= ratio && ratio <= 1.25;
}

var too_big = function (d_ref, d_expr) {
    var ratio = (d_ref + 1) / (d_expr + 1);
    return ratio < 0.8;
}

var eval_with = function (expr, dict) {
    if (typeof expr.name === 'number') {
        return expr.name;
    } else if (typeof expr.name === 'string') {
        return dict[expr.name];
    } else {
        return expr.name.op.f(eval_with(expr.name.left, dict), eval_with(expr.name.right, dict));
    }
}

var too_fixed = function (value_with_y, expr, x, y, max_num_size) {
    var alt_sol = function (r) {
        return r !== y && value_with_y === eval_with(expr, {'x': x, 'y': r});
    }
    if (alt_sol(0) || alt_sol(1) || alt_sol(y - 1) || alt_sol(y + 1) || alt_sol(2 * y)) {
        return true;
    }
    for (var i = 0; i < 10; i++) {
        var r = rand_int(max_num_size);
        if (alt_sol(r)) {
            return true;
        }
    }
    return false;
}

var str_expr = function (expr, prec) {
    if (typeof expr.name !== 'object') {
        return expr.name;
    } else {
        var operator = expr.name.op;
        var op_prec = operator.precedence;
        var left_prec;
        var right_prec;
        if (operator.assoc === 'left') {
            left_prec = op_prec - .5;
            right_prec = op_prec + .5;
        } else if (operator.assoc === 'right') {
            left_prec = op_prec + .5;
            right_prec = op_prec - .5;
        }
        var result = str_expr(expr.name.left, left_prec) + ' ' + expr.name.op.name + ' ' +
        str_expr(expr.name.right, right_prec);
        if (prec > op_prec) {
            return '(' + result + ')';
        } else {
            return result;
        }
    }
}

var create_problem = function (x, y, difficulty, max_num_size, max_ever_num_size) {
    var initial_exprs = [
        {'name': 'x', 'value': x, 'difficulty': 1},
        {'name': 'y', 'value': y, 'difficulty': 1}
    ];
    var exprs = create_exprs(initial_exprs, difficulty, max_num_size, max_ever_num_size);
    return pick_problem(exprs, x, y, max_num_size, difficulty);
}

var create_exprs = function (initial_exprs, difficulty, max_num_size, max_ever_num_size) {
    var exprs = initial_exprs.slice(0);
    var new_expr;
    for (var j = 0; j < 1000; j++) {
        if (Random.random_f() < .3) {
            var num = rand_int(2 * max_num_size) - max_num_size;
            new_expr = {'name': num, 'value': num, 'difficulty': difficulty_of_num(num)};
        } else {
            var op = random_choice(ops);
            var left = random_choice(exprs);
            var right = random_choice(exprs);
            new_expr = {
                'name': {'op': op, 'left': left, 'right': right},
                'value': op.f(left.value, right.value),
                'difficulty': op.difficulty + left.difficulty + right.difficulty
            };
        }
        if (too_big(difficulty, new_expr.difficulty)
            || Math.abs(new_expr.value) > max_ever_num_size
            || isNaN(new_expr.value)) {
            j--;
            continue;
        }
        exprs.push(new_expr);
    };
    return exprs;
}

var pick_problem = function (exprs, x, y, max_num_size, difficulty) {
    var problems = exprs.filter(function (expr) {
        return is_acceptible_expr(expr, x, y, max_num_size, difficulty);
    }).map(function (expr) {
        return {
            'x': x,
            'y': y,
            'str': expr.value + ' = ' + str_expr(expr),
            'value': expr.value,
            'max_num_size': max_num_size,
            'expr': expr
        }
    });
    return random_choice(problems);
}

var is_acceptible_expr = function (expr, x, y, max_num_size, difficulty) {
    var value = expr.value;
    var acceptible_value = value % 1 === 0 && Math.abs(value) <= max_num_size;
    // Exit early. It saves computation, and, perhaps more importantly,
    // it allows the random generator to function as before.
    if (!acceptible_value) {
        return false;
    }
    var close_enough = close(difficulty, expr.difficulty);
    var different_enough = !too_fixed(value, expr, x, y, max_num_size);
    return close_enough && different_enough;
}

var get_num_max_size = function (diff) {
    return Math.floor(Math.pow(10, 1 + Math.floor(diff) / 20));
}

var create_problem_wrapper_f = function (diff, seed) {
    Random.seed(seed);
    var bound = get_num_max_size(diff);
    var x = rand_int(bound);
    var y = rand_int(bound);
    return create_problem(x, y, Math.floor(diff) + 6, bound, Math.pow(10, 12));
}

var check_num_answer = function (answer, problem) {
    if (typeof answer !== 'number') {
        return 'not a number';
    } if (!Number.isFinite(answer)) {
        return 'not finite';
    } else if (answer < 0) {
        return 'negative';
    } else if (answer >= problem.max_num_size) {
        return 'too big';
    } else if (answer === problem.y) {
        return 'intended';
    } else if (problem.value === eval_with(problem.expr, {'x': problem.x, 'y': answer})) {
        return 'correct';
    } else {
        return 'incorrect';
    }
}
