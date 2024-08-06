ig.module("game.feature.skills.al-custom-skills").requires(	"game.feature.player.entities.player", "game.feature.player.player-model", "game.feature.skills.skills", "game.feature.menu.gui.circuit.circuit-detail-elements", "impact.feature.gui.gui", "impact.feature.gui.base.basic-gui", "game.feature.menu.gui.menu-misc", "game.feature.menu.gui.stats.stats-misc").defines(function() {
	var dbs = ig.arcaneLabDatabase.get("customSkills");
    const checkCustomSkill = (a, b) => {
		if(!sc.model.isCutscene() && sc.model.player.getItemAmount("toggle-arcanelab-skill") != 0 && sc.model.player.getToggleItemState("toggle-arcanelab-skill")) {
			for (var dbd in dbs) {
				var dbo = dbs[dbd];
				if((dbo.element === "BASE" || a == sc.ELEMENT[dbo.element]) && new ig.VarCondition(dbo.activeCondition || "true").evaluate() && ig.vars.get("custom-skills."+dbo.element+"."+dbd) == true) {
					for(var dbl of dbo.list) {
						if(dbl.actionCheckKey === b || sc.PLAYER_ACTION[dbl.actionCheckKey] === b) {
							dbo.skill = dbl.replaceTo;
							if(dbl.icon) {
								dbo.icon = dbl.icon;
							}
							return dbo;
						}
					}
				}
			}
		}
        return "";
    }
    const isCustomSkill = (a, b) => {
		for (var dbd in dbs) {
			var dbo = dbs[dbd];
			if(a == sc.ELEMENT[dbo.element]) {
				for(var dbl of dbo.list) {
					if(dbl.replaceTo === b) {
						dbo.skill = dbl.replaceTo;
						if(dbl.icon) {
							dbo.icon = dbl.icon;
						}
						return dbo;
					}
				}
			}
		}
        return "";
    }
    var actionIdx = Math.max(...Object.values(sc.PLAYER_ACTION)) + 1;
	for (var dbd in dbs) {
		for(var dbl of dbs[dbd].list) {
			sc.PLAYER_ACTION[dbl.replaceTo] = actionIdx;
			actionIdx++;
		}
    }
    ig.ENTITY.Player.inject({
		storedWalkAnimsBackup: {},
        getChargeAction: function(a, b) {
            for (var c = a.actionKey; b && !this.model.getAction(sc.PLAYER_ACTION[c + b]);) b--;
            if (!b) return 0;
            var d = sc.PLAYER_SP_COST[b - 1];
            sc.newgame.get("infinite-sp") || this.model.params.consumeSp(d);
            var actionKey = checkCustomSkill(this.model.currentElementMode, c + b);
            if (actionKey) {
				return actionKey.skill;
			}
            return c + b;
        }
    });
    sc.PlayerModel.inject({
        getCombatArt: function(a, b) {
			var actionKey = checkCustomSkill(a, b);
			if (actionKey) {
				return this.elementConfigs[a].getPlayerAction(actionKey.skill);
			}
            return this.elementConfigs[a].getPlayerAction(b)
        },
        getCombatArtName: function(a) {
            var actionKey = checkCustomSkill(this.currentElementMode, a);
            if (actionKey) {
                return this.elementConfigs[this.currentElementMode].getAction(actionKey.skill).name;
            }
            return this.elementConfigs[this.currentElementMode].getActiveCombatArtName(a)
        },
        getActiveCombatArt: function(a, b) {
            var actionKey = checkCustomSkill(a, b);
            if (actionKey) {
                return this.elementConfigs[a].getAction(sc.PLAYER_ACTION[actionKey.skill]);
            }
            return this.elementConfigs[a].getAction(b)
        },
        getAction: function(a) {;
            var actionKey = checkCustomSkill(this.currentElementMode, a);
            if (actionKey) {
				var ea = this.elementConfigs[this.currentElementMode].getAction(sc.PLAYER_ACTION[actionKey.skill]);
                return ea?ea:this.baseConfig.actions[actionKey.skill].action;
            }
            return this.elementConfigs[this.currentElementMode].getAction(a) || this.baseConfig.getAction(a)
        },
        getActionByElement: function(a, b) {
            var actionKey = checkCustomSkill(a, b);
            if (actionKey) {
				var ea = this.elementConfigs[a].getAction(sc.PLAYER_ACTION[actionKey.skill]);
                return ea?ea:this.baseConfig.actions[actionKey.skill].action;
            }
            return this.elementConfigs[a].getAction(b) || this.baseConfig.getAction(b)
        }
    });
    sc.StatusViewCombatArtsContainer.inject({
        addArts: function(a, b, c) {
            for (var e = 0; e < 3; e++) {
                var f = sc.model.player.getActiveCombatArt(b, sc.PLAYER_ACTION[a + (e + 1)]);
                if (f)
                    if (f = sc.model.player.getCombatArt(b, f.name)) {
						var customCheck = isCustomSkill(b, f.key);
						if(customCheck) {
							f = new sc.StatusViewCombatArtsCustomEntry(e + 1, f, new ig.ImageGui(new ig.Image(customCheck.icon.src), customCheck.icon.offX || 0, customCheck.icon.offY || 0, 24, 24));
						} else {
							f = new sc.StatusViewCombatArtsEntry(e + 1, f);
						}
                        this.list.addEntry(f);
                        if (e != c - 1) {
                            f = new sc.StatusViewCombatArtsLineSingle;
                            this.list.addEntry(f)
                        }
                    }
            }
        }
	});
	sc.CrossCode.inject({
		createPlayer: function() {
			var b = this.getEntitiesByType(ig.ENTITY.Player)[0];
			b || (b = this.spawnEntity(ig.ENTITY.Player, 0, 0, 0));
			
			b.storedWalkAnimsBackup = b.storedWalkAnims;
			this.playerEntity = b;
			
			var AlCw = this.spawnEntity(ig.AlPlayerCustomWalksUpdater,0,0,0);
			console.log(b);
		}
	});
	//I just didn't want to inject Lea's update function
	ig.AlPlayerCustomWalksUpdater = ig.Entity.extend({
		walkAnimsBackup: null,
		timeToUpdtAnim: false,
		timeToUpdtAnimLatch: false,
		init: function(a, b, c, e) {
			this.parent(a, b, c, e);
			this.coll.type = ig.COLLTYPE.NONE;
			this.coll.setSize(0, 0, 0);
			this.walkAnimsBackup = JSON.parse(JSON.stringify(ig.game.playerEntity.storedWalkAnims));
		},
		update: function() {
			if(!sc.model.isCutscene() && sc.model.player.getItemAmount("toggle-arcanelab-skill") != 0 && sc.model.player.getToggleItemState("toggle-arcanelab-skill") && ig.vars.get("custom-skills.walk-anims.active") == true && new ig.VarCondition(ig.vars.get("custom-skills.walk-anims.activeCondition")).evaluate()) {
				this.timeToUpdtAnim = true;
			}else{
				this.timeToUpdtAnim = false;
			}
			if (this.timeToUpdtAnim != this.timeToUpdtAnimLatch) {
				this.timeToUpdtAnimLatch = this.timeToUpdtAnim;
				var walkAnimsToApply = JSON.parse(JSON.stringify(this.walkAnimsBackup));
				ig.game.playerEntity.storedWalkAnims = Object.assign(walkAnimsToApply, this.timeToUpdtAnim?ig.vars.get("custom-skills.walk-anims.data"):{});
			}
		}
	});
	
	
	//Idk why I can't inject custom script into sc.StatusViewCombatArtsEntry.init for use, so I just clone that class. Stupid trick but it works perfetly
    sc.StatusViewCombatArtsCustomEntry =
        ig.GuiElementBase.extend({
            icon: null,
            level: null,
            sp: null,
            dmgType: null,
            stunType: null,
            condition: null,
            name: null,
            description: null,
            info: null,
            init: function(a, b, customIcon) {
                this.parent();
                this.setSize(512, 41);
                this.info = b;
                this.addText("lvl", 9, 2);
                this.icon = customIcon;
                this.icon.setPos(3, 12);
                this.addChildGui(this.icon);
                this.level = new sc.NumberGui(9, {
                    size: sc.NUMBER_SIZE.LARGE
                });
                this.level.setNumber(a);
                this.level.setPos(25,
                    3);
                this.addChildGui(this.level);
                this.name = new sc.TextGui("\\c[2]" + b.name + "\\c[0]");
                this.name.setPos(40, -1);
                this.addChildGui(this.name);
                this.description = new sc.TextGui(b.description, {
                    maxWidth: 460,
                    font: sc.fontsystem.smallFont,
                    linePadding: -3
                });
                this.description.setPos(40, 17);
                this.addChildGui(this.description);
                var c = 168,
                    c = c + (this.addText("sp", c, 2).x + 3);
                this.sp = new sc.NumberGui(9);
                this.sp.setNumber(sc.PLAYER_SP_COST[a - 1]);
                this.sp.setPos(c, 3);
                this.addChildGui(this.sp);
                c = c + 13;
                c = c + (this.addText("dmgType",
                    c, 2).x + 3);
                this.dmgType = new sc.TextGui(this.getDamageType(b.dmgType));
                this.dmgType.setPos(c, -1);
                this.addChildGui(this.dmgType);
                c = c + (this.dmgType.hook.size.x + 5);
                if (b.stunType || b.status && sc.menu.statusElement != 0) c = c + (this.addText("effects", c, 2).x + 2);
                if (b.stunType) {
                    this.stunType = new sc.TextGui(this.getStunType(b.stunType));
                    this.stunType.setPos(c, -1);
                    this.addChildGui(this.stunType);
                    c = c + (this.stunType.hook.size.x + 6)
                }
                if (b.status && sc.menu.statusElement != 0) {
                    this.condition = new sc.TextGui(this.getConditionType(b.status));
                    this.condition.setPos(c, -1);
                    this.addChildGui(this.condition)
                }
            },
            addText: function(a, b, c) {
                a = new sc.TextGui("\\c[4]" + ig.lang.get("sc.gui.menu.status." + a) + "\\c[0]", {
                    font: sc.fontsystem.tinyFont
                });
                a.setPos(b, c);
                this.addChildGui(a);
                return a.hook.size
            },
            getDamageType: function(a) {
                return ig.lang.get("sc.gui.menu.status.damageTypes")[a - 1]
            },
            getStunType: function(a) {
                var b = ig.lang.get("sc.gui.menu.status.stunTypes");
                return "\\i[status-stun-" + a + "]" + b[a - 1]
            },
            getConditionType: function() {
                var a = ig.lang.get("sc.gui.menu.status.conditions");
                return "\\i[status-cond-" + sc.menu.statusElement + "]" + ig.lang.get("sc.gui.menu.status.inflicts") + " " + a[sc.menu.statusElement]
            }
        });
});