ig.module("game.feature.inventory.al-modifier-cards").requires("impact.base.game", "game.feature.model.game-model").defines(function() {
	sc.AlModifierCards = ig.GameAddon.extend({
		init: function() {
			this.parent("AlModifierCards");
			sc.Model.addObserver(sc.model.player, this)
		},
		modelChanged: function(a, b) {
			if(a instanceof sc.PlayerModel) {
				if(b == sc.PLAYER_MSG.ITEM_TOGGLED) {
					a.updateStats();
				}
				if(b == sc.PLAYER_MSG.STATS_CHANGED && sc.model.player.getItemAmount("toggle-arcanelab-modifier-card") != 0 && sc.model.player.getToggleItemState("toggle-arcanelab-modifier-card")) {
					this.applyModifierCards();
				}
			}
		},
		applyModifierCards: function() {
			const dbs = ig.arcaneLabDatabase.get("modifierCards");
			const dbl = dbs.both.concat(dbs.positive, dbs.negative);
			for(var elem=0; elem<=4; elem++) {
				var extraModifier = [],
					equipData = ig.vars.get("modifier-cards.equip"),
					addModifier = (a) => {
						for(var i=0; i<3; i++) {
							if(equipData != null && equipData[a] != null) {
								var mdf = equipData[a].modifier[i].valueOf(),
									checkRep = extraModifier.filter(vvv => vvv.modifier == mdf);
								if(checkRep.length != 0) {
									checkRep[0].amount += equipData[a].tried[i].filter(vvv => vvv==true).length * (i==2?-1:1);
								}else {
									var modifierData = dbl.filter(vvv => vvv.modifier==mdf)[0],
										newExtraModifier = {
											modifier: mdf,
											amount: equipData[a].tried[i].filter(vvv => vvv==true).length * (i==2?-1:1)
										};
									if(modifierData.noPercent) {
										newExtraModifier.noPercent = true;
										newExtraModifier.required = modifierData.required;
									}else {
										newExtraModifier.multiply = modifierData.amount;
									}
									extraModifier.push(newExtraModifier);
								}
							}
						}
					};
				addModifier(0);
				addModifier(elem+1);
				for(var j of extraModifier) {
					if(j.noPercent) {
						sc.model.player.elementConfigs[elem].modifiers[j.modifier] += Math.trunc(j.amount/j.required);
					}else {
						sc.model.player.elementConfigs[elem].modifiers[j.modifier] += (j.amount*j.multiply);
					}
				}
			}
		}
	});
	ig.addGameAddon(function() {
		return sc.alModifierCards = new sc.AlModifierCards
	})
});