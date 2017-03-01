'use strict';

var Random = {
    'seed': function (n) {
        // This line catching 0 (as well as the intended undefined) is a feature, not a bug.
        // If n = 0 then we end up with a seed of 0, which is bad.
        if (!n) {
            n = 1;
        }
        this.val = (n * Math.PI) % 1;
        // Initial randomization.
        for (var i = 0; i < 10; i++) {
            this.step();
        }
    },
    'step': function () {
        // The origins of this method are lost in the mists of time.
        this.val = (this.val * 9301 + 49297) % 233280;
    },
    'random_f': function () {
        this.step();
        return this.val / 233280;
    }
}

var rand_int = function (n) {
    return Math.floor(Random.random_f() * n);
}

var random_choice = function (list) {
    return list[rand_int(list.length)];
}