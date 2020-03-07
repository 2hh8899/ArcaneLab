ig.module("game.feature.combat.model.custom-enemy-reaction")
    .requires("game.feature.combat.model.enemy-reaction", "impact.base.utils", "impact.base.event")
    .defines(function() {
        var a = ig.Class.extend({
            name: "",
            type: 0,
            action: null,
            postSwitchState: null,
            ignoreStun: false,
            restartPrevAction: false,
            init: function(a, b) {
                this.name = a;
                this.type = b.type;
                this.action = b.action || null;
                this.postSwitchState =
                    b.postSwitchState || null;
                this.restartPrevAction = b.restartPrevAction || false
            },
            onActivate: function() {},
            preApply: function() {},
            apply: function(a, b) {
                if (this.restartPrevAction) a.reactions.restartAction = a.currentAction;
                this.action && a.setAction(b[this.action]);
                a.nextState = this.postSwitchState
            },
            check: null
        });
        sc.ENEMY_REACTION.VAR_CONDITION = a.extend({
            _wm: new ig.Config({
                attributes: {
                    condition: {
                        _type: "VarCondition",
                        _info: "Condition that must be true before continued"
                    },
                    preSwitchState: {
                        _type: "EnemyStateRef",
                        _info: "State to switch to before reaction starts",
                        _optional: true
                    },
                    postSwitchState: {
                        _type: "EnemyStateRef",
                        _info: "State to switch to after reaction ended",
                        _optional: true
                    },
                    preAction: {
                        _type: "EnemyActionRef",
                        _info: "An action that is executed immediately beforehand",
                        _optional: true
                    },
                    action: {
                        _type: "EnemyActionRef",
                        _info: "Action to perform on reaction",
                        _optional: true
                    }
                }
            }),
            init: function(a, b) {
                this.parent(a, b);
                this.preSwitchState = b.preSwitchState || null;
                this.preAction = b.preAction || null;
                this.condition = new ig.VarCondition(b.condition)
            },
            preApply: function(a) {
                this.preSwitchState && a.enemyType.switchState(a, this.preSwitchState)
            },
            check: function(a) {
                return this.condition.evaluate();
            }
        });
        sc.ENEMY_REACTION.TRAIN_COMING = a.extend({
            checkDistanceBefore: null,
            checkDistanceAfter: null,
            _wm: new ig.Config({
                attributes: {
                    condition: {
                        _type: "VarCondition",
                        _info: "Condition that must be true before continued"
                    },
                    checkDistanceBefore: {
                        _type: "Number",
                        _info: "Test."
                    },
                    checkDistanceAfter: {
                        _type: "Number",
                        _info: "Test."
                    },
                    checkDistanceY: {
                        _type: "Number",
                        _info: "Test."
                    },
                    preSwitchState: {
                        _type: "EnemyStateRef",
                        _info: "State to switch to before reaction starts",
                        _optional: true
                    },
                    postSwitchState: {
                        _type: "EnemyStateRef",
                        _info: "State to switch to after reaction ended",
                        _optional: true
                    },
                    preAction: {
                        _type: "EnemyActionRef",
                        _info: "An action that is executed immediately beforehand",
                        _optional: true
                    },
                    action: {
                        _type: "EnemyActionRef",
                        _info: "Action to perform on reaction",
                        _optional: true
                    }
                }
            }),
            init: function(a, b) {
                this.parent(a, b);
                this.preSwitchState = b.preSwitchState || null;
                this.preAction = b.preAction || null;
                this.checkDistanceBefore = b.checkDistanceBefore;
                this.checkDistanceAfter = b.checkDistanceAfter;
                this.checkDistanceY = b.checkDistanceY;
                this.condition = new ig.VarCondition(b.condition)
            },
            preApply: function(a) {
                this.preSwitchState && a.enemyType.switchState(a, this.preSwitchState)
            },
            check: function(a) {
                var entityPosForCompare = a.getAlignedPos(ig.ENTITY_ALIGN.BOTTOM),
                    varForCompare = ig.vars.get("tmp.trainPos");
                if (this.condition.evaluate() && varForCompare) {
                    return (varForCompare.x + this.checkDistanceBefore > entityPosForCompare.x && varForCompare.x - this.checkDistanceAfter < entityPosForCompare.x) && (varForCompare.y + this.checkDistanceY > entityPosForCompare.y && varForCompare.y - this.checkDistanceY < entityPosForCompare.y);
                }
            }
        });
    });