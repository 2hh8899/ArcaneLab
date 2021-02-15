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
				sc.model.player.setConfig(new sc.PlayerConfig("Vector"));
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
});