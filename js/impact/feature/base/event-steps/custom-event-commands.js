ig.module("impact.feature.base.event-steps.arcane-lab-event-commands1").requires("impact.feature.base.event-steps").defines(function() {
		ig.EVENT_STEP.VECTOR_INIT = ig.EventStepBase.extend({
			entity: null,
			position: null,
			_wm: new ig.Config({
				attributes: {}
			}),
			init: function(a) {},
			start: function(a, b) {
				for(var i=0; i<sc.model.player.toggleSets.skins.items.length; i++) {
					sc.model.player.forceToggleState(sc.model.player.toggleSets.skins.items[i],false)
				}
				sc.playerSkins.updateSkins();
				sc.model.player.setElementMode(sc.ELEMENT.NEUTRAL, true, true);
				sc.model.player.setCore(3, false); //Dash
				sc.model.player.setCore(5, false); //Guard
				sc.model.player.setCore(7, false); //Menu
				sc.model.player.setCore(13,false); //QuickMenu
				sc.model.player.setCore(16,false); //ElementChange
				sc.model.player.setCore(26,false); //Items
				sc.model.player.setCore(28,false); //Modifier
				ig.game.playerEntity.hidePets = true;
				ig.game.playerEntity.skin.auraFxHandle.stop();
				ig.game.playerEntity.skin.stepFx = null;
				ig.game.playerEntity.skin.appearance = null;
				ig.game.playerEntity.animSheet = ig.game.playerEntity.model.animSheet;
				ig.game.playerEntity.walkAnims.move = ig.game.playerEntity.walkAnims.run = ig.game.playerEntity.walkAnims.brake = ig.game.playerEntity.walkAnims.preIdle = ig.game.playerEntity.walkAnims.damage= ig.game.playerEntity.walkAnims.fall = ig.game.playerEntity.walkAnims.jump="idle";
				ig.game.playerEntity.params.currentHp = ig.game.playerEntity.params.baseParams.hp = 100;
				ig.game.playerEntity.params.baseParams.attack = 0;
				ig.game.playerEntity.params.baseParams.defense = 0;
				ig.game.playerEntity.params.baseParams.focus = 10;
				sc.Model.notifyObserver(ig.game.playerEntity.params, sc.COMBAT_PARAM_MSG.HP_CHANGED);
				sc.Model.notifyObserver(ig.game.playerEntity.params, sc.COMBAT_PARAM_MSG.STATS_CHANGED);
				ig.game.playerEntity.setSize(8,8,24)
			}
		});
		ig.EVENT_STEP.VECTOR_RESTORE = ig.EventStepBase.extend({
			entity: null,
			position: null,
			_wm: new ig.Config({
				attributes: {}
			}),
			init: function(a) {},
			start: function(a, b) {
				sc.playerSkins.updateSkins();
				sc.model.player.setCore(3, true); //Dash
				sc.model.player.setCore(5, true); //Guard
				sc.model.player.setCore(7, true); //Menu
				sc.model.player.setCore(13,true); //QuickMenu
				sc.model.player.setCore(16,true); //ElementChange
				sc.model.player.setCore(26,true); //Items
				sc.model.player.setCore(28,true); //Modifier
			}
		});
        ig.EVENT_STEP.AL_ADD_ARENA_SCORE = ig.EventStepBase.extend({
            _wm: new ig.Config({
                attributes: {
                    scoreType: {
                        _type: "Select",
                        _info: "Type of the score. This is used to for the list at the end of the round.",
                        _select: sc.ARENA_SCORE_TYPES,
                        _default: "KILL"
                    },
					amount: {
						_type: "Number",
						_info: "Score"
					}
                }
            }),
            init: function(b) {
                this.scoreType = b.scoreType || null
                this.amount = b.amount || 0
            },
            start: function() {
                this.scoreType && sc.arena.addScore(this.scoreType, this.amount)
            }
        });
        ig.EVENT_STEP.SET_PLAYER_LEVEL = ig.EventStepBase.extend({
            level: null,
            _wm: new ig.Config({
                attributes: {
                    level: {
                        _type: "Number",
                        _info: "New Level of Player"
                    }
                }
            }),
            init: function(b) {
                this.level = b.level
            },
            start: function() {
                sc.model.player.setLevel(this.level)
            }
        });
});