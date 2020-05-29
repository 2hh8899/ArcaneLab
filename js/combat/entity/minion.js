ig.module("game.feature.combat.entities.combat-proxy-minion")
    .requires("game.feature.npc.entities.sc-actor", "game.feature.combat.model.proxy", "game.feature.combat.entities.combatant")
    .defines(function() {
        sc.PROXY_STICK_TYPE = {
            NONE: 0,
            OWNER: 1,
            TARGET: 2
        };
        sc.PROXY_TYPE.MINION = sc.ProxySpawnerBase.extend({
            data: null,
            _wm: new ig.Config({
                attributes: {
                    animation: {
                        _type: "AnimSheet",
                        _info: "Animation sheet of proxy. Needs one entry with name 'default'",
                        _popup: true,
                        _optional: true
                    },
                    faceAnims: {
                        _type: "AnimSheet",
                        _info: "Animation sheet of proxy. Needs one entry with name 'default'",
                        _multiDir: true,
                        _popup: true,
                        _optional: true
                    },
                    copyOwnerAnims: {
                        _type: "Boolean",
                        _info: "If true: Copy animations from owner combatant."
                    },
                    size: {
                        _type: "Offset",
                        _info: "Size of proxy"
                    },
                    breakType: {
                        _type: "String",
                        _info: "How proxy is broken",
                        _select: sc.PROXY_BREAK_TYPE
                    },
                    config: {
                        _type: "ProxyConfig",
                        _info: "Configuration of proxy"
                    },
                    action: {
                        _type: "Action",
                        _info: "Action performed with proxy",
                        _popup: true
                    },
                    killAction: {
                        _type: "Action",
                        _info: "Action performed when killed with proxy",
                        _popup: true
                    },
                    invisible: {
                        _type: "Boolean",
                        _info: "If true, set initial alpha to 0"
                    },
                    hp: {
                        _type: "Number",
                        _info: "If 0: proxy will ignore attack. -1: will take hits but is never destroyed (stops balls) >0: takes hits and can be destroyed"
                    },
                    terrain: {
                        _type: "String",
                        _info: "Terrain of proxy, in case you can jump onto it",
                        _select: ig.TERRAIN,
                        _optional: true
                    },
                    killEffect: {
                        _type: "Effect",
                        _info: "Effect shown when proxy is killed",
                        _optional: true
                    },
                    stickToSource: {
                        _type: "String",
                        _info: "Specify whether proxy should move with connected entity",
                        _select: sc.PROXY_STICK_TYPE
                    },
                    stickFaceAlign: {
                        _type: "Boolean",
                        _info: "If true: align face with sticking entity"
                    },
                    group: {
                        _type: "String",
                        _info: "Group identifier used to clear proxies or WAIT_UNTIL_PROXIES_DONE"
                    },
                    timeDisconnect: {
                        _type: "Boolean",
                        _info: "If true: don't connect proxy to time of owner.",
                        _optional: true
                    },
                    noFallDestroy: {
                        _type: "Boolean",
                        _info: "Do not destory proxy when falling into the ground etc.",
                        _optional: true
                    },
                    walkAnims: {
                        _type: "WalkAnims",
                        _optional: true
                    },
                    startAnim: {
                        _type: "String",
                        _info: "Animation to show at start"
                    }
                }
            }),
            init: function(a) {
                this.data = ig.copy(a);
                this.data.animation && (this.data.animation = new ig.AnimationSheet(a.animation));
                if (this.data.faceAnims) {
                    this.data.faceAnims.DOCTYPE || (this.data.faceAnims.DOCTYPE =
                        "MULTI_DIR_ANIMATION");
                    this.data.faceAnims = new ig.AnimationSheet(this.data.faceAnims)
                }
                this.data.config = sc.CombatProxyMinionEntity.createActorConfig(a.config);
                this.data.action = new ig.Action("[PROXY]", a.action, false, false);
                this.data.killAction = new ig.Action("[PROXY]", a.killAction, false, false);
                this.data.breakType = sc.PROXY_BREAK_TYPE[a.breakType];
                this.data.stickToSource = sc.PROXY_STICK_TYPE[a.stickToSource] || sc.PROXY_STICK_TYPE.NONE;
                this.data.killEffect && (this.data.killEffect = new ig.EffectHandle(a.killEffect))
            },
            clearCached: function() {
                this.data.action.clearCached();
                this.data.killAction.clearCached();
                this.data.animation &&
                    this.data.animation.clearCached();
                this.data.faceAnims && this.data.faceAnims.clearCached();
                this.data.killEffect && this.data.killEffect.clearCached()
            },
            getSize: function(a) {
                Vec3.assign(a, this.data.size);
                return a
            },
            spawn: function(a, b, d, g, h, i) {
                h = {
                    data: this.data,
                    combatant: g,
                    dir: h
                };
                !i && g.getCombatantRoot()
                    .isPlayer && sc.stats.addMap("player", "throws", 1);
                g = this.data.size;
                return ig.game.spawnEntity(sc.CombatProxyMinionEntity, a - g.x / 2, b - g.y / 2, d, h)
            }
        });
        sc.PROXY_STICK_TYPE = {
            NONE: 0,
            OWNER: 1,
            TARGET: 2
        };
        var b = Vec3.create(),
            a = {
                ACTION_END_DESTROYED: 1,
                HIT_DESTROYED: 2
            };
        sc.CombatProxyMinionEntity =
            sc.CombatProxyEntity.extend({
                statusGui: null,
                weakness: 0,
                init: function(a, b, d, g) {
                    this.parent(a, b, d, g);
                    a = g.data;
                    a.size && this.coll.setSize(a.size.x, a.size.y, a.size.z);
                    this.setDefaultConfig(a.config);
                    this.sourceEntity = g.combatant;
                    this.combatant = this.sourceEntity.getCombatantRoot();
                    if (!a.timeDisconnect) this.coll.time.parent = this.sourceEntity.coll;
                    this.noFallDestroy = g.noFallDestroy || false;
                    this.terrain = ig.TERRAIN[a.terrain] || null;
                    this.party = this.combatant && this.combatant.party;
                    this.collaboration = this.combatant.collaboration;
                    this.target = this.sourceEntity.getTarget(true);
                    this.params = this.combatant.params;
                    this.combo.damageCeiling = this.sourceEntity.combo.damageCeiling;
                    Vec2.assign(this.face, g.dir);
                    this.stickToSource = a.stickToSource || 0;
                    this.stickFaceAlign = a.stickFaceAlign || false;
                    this.group =
                        a.group;
                    this.breakType = a.breakType;
                    this.breakType == sc.PROXY_BREAK_TYPE.ACTION ? this.sourceEntity.addActionAttached(this) : this.breakType == sc.PROXY_BREAK_TYPE.COMBATANT ? this.combatant.addEntityAttached(this) : this.breakType == sc.PROXY_BREAK_TYPE.COLLABORATION && this.combatant.collaboration.addCollabAttached(this);
                    if (a.invisible) this.animState.alpha = 0;
                    if (a.copyOwnerAnims) {
                        this.animSheet = this.combatant.animSheet;
                        if (a.startAnim) {
                            this.setCurrentAnim(a.startAnim, true, null);
                            this.animationFixed = true
                        }
                        this.initAnimations();
                        this.storedWalkAnims = ig.copy(this.combatant.storedWalkAnims);
                        this.setWalkAnims(this.combatant.walkAnimsName)
                    } else {
                        if (a.faceAnims || a.animation) {
                            this.animSheet = a.faceAnims || a.animation;
                            this.initAnimations()
                        }
                        a.walkAnims ? this.storeWalkAnims("default", a.walkAnims) : this.storeWalkAnims("default", {
                            idle: "default"
                        });
                        this.setWalkAnims("default");
                        if (a.startAnim) {
                            this.setCurrentAnim(a.startAnim, true, null);
                            this.animationFixed = true
                        }
                    }
                    this.setAction(a.action);
                    this.killAction = a.killAction;
                    this.maxHp = this.hp = a.hp;
                    this.statusGui = new ig.GUI.MinionStatusBar(this);
                    ig.gui.addGuiElement(this.statusGui);
                    this.effects.onKill = a.killEffect
                },
                onEntityKillDetach: function() {
                    this.kill()
                },
                hideBar: function() {
                    this.statusGui && this.statusGui.remove() &&
                        ig.gui.removeGuiElement(this.statusGui);
                    this.statusGui = null;
                },
                destroy: function(b) {
					if(!this.destroyType) {
						this.destroyType =
							b || a.ACTION_END_DESTROYED;
						this.detach();
						if(this.effects.onKill) {
							this.cancelAction();
							Vec2.assignC(this.coll.accelDir, 0, 0);
							if(!this.effects.handle) {
								this.effects.handle = this.effects.onKill.spawnOnTarget(this, {
									align: "CENTER",
									callback: this
								});
								this.coll.setType(ig.COLLTYPE.NONE)
							}
						} else this.kill()
					}
                },
				explosion: function() {
					this.cancelAction();
					this.setAction(this.killAction);
				},
                update: function() {
                    this.breakType == sc.PROXY_BREAK_TYPE.COMBATANT && this.combatant.isDefeated() && this.destroy();
                    this.coll.pos.z < ig.game.minLevelZ && (!this.stickToSource &&
                        !this.noFallDestroy) && this.destroy();
                    if (this.stickToSource) {
                        var a = this.stickToSource == sc.PROXY_STICK_TYPE.TARGET ? this.getTarget() : this.sourceEntity;
                        if (a) {
                            var d = ig.CollTools.getCenterXYAlignedPos(b, this.coll, a.coll);
                            this.setPos(d.x, d.y, a.coll.pos.z);
                            this.stickFaceAlign && a.face && Vec2.assign(this.face, a.face)
                        }
                    }
                    this.parent()
                },
                ballHit: function(a) {
                    if (this.hp) {
                        if (a.party == this.combatant.party) return false;
                        var b = a.getHitCenter(this);
                        this.wasHit = true;
                        if (this.hp < 0) {
                            sc.combat.showHitEffect(this, b, sc.ATTACK_TYPE.NONE, a.getElement(), false,
                                false);
                            return true
                        }
                        var d = a.attackInfo.damageFactor;
                        sc.combat.showHitEffect(this, b, a.attackInfo.type, a.getElement(), false, false);
                        this.reduceHp(d);
                        return true
                    }
                    return false
                }
            });
        var d = new ig.ActorConfig({
            walkAnims: "default",
            collType: "IGNORE",
            maxVel: 180,
            weight: -1,
            flyHeight: 0,
            soundType: "none",
            friction: 1,
            accelSpeed: 1,
            bounciness: 0
        });
        sc.CombatProxyMinionEntity.createActorConfig = function(a) {
            var b = new ig.ActorConfig;
            b.loadFromData(a, d);
            return b
        };
        sc.CombatProxyTools = {
            clearEntityProxy: function(a, b, d, g) {
                g = this.clearAttachedProxy(a.entityAttached, b, d, g);
                this.clearAttachedProxy(a.actionAttached, b, d, g)
            },
            hasProxy: function(a, b) {
                return this.hasAttachedProxy(a.entityAttached, b) || this.hasAttachedProxy(a.actionAttached, b)
            },
            clearAttachedProxy: function(a, b, d, g) {
                for (var h = a.length; h--;) {
                    var i = a[h];
                    if (i instanceof sc.CombatProxyEntity && (!d || i.stickToSource)) b &&
                        i.group != b || (g ? g-- : i.destroy())
                }
                return g || 0
            },
            hasAttachedProxy: function(a, b) {
                for (var d = a.length; d--;) {
                    var g = a[d];
                    if (g instanceof sc.CombatProxyEntity && g.group == b) return true
                }
            }
        }
    });
ig.module("game.feature.combat.gui.minion-status-bar")
    .requires("impact.feature.gui.gui", "game.feature.combat.gui.status-bar")
    .defines(function() {
        ig.GUI.MinionStatusBar = ig.GUI.StatusBar.extend({
            _drawHpBar: function(a) {
                var h = (Math.min(this.target.maxHp, this.target.hp) / this.target.maxHp)
                    .limit(0, 1),
                    i = (Math.max(this.target.maxHp, this.target.hp) / this.target.maxHp)
                    .limit(0, 1),
                    b = Math.ceil(22 * h) + 1,
                    h = Math.ceil(22 * i) + 1,
                    i = 0;
                this.target.party ==
                    sc.COMBATANT_PARTY.PLAYER ? i = 8 : this.target.target && (i = 4);
                a.addGfx(this.gfx, 0, 0, 216, 0 + i, b, 4);
                a.addGfx(this.gfx, b, 0, 216 + b, 12, h - b + 1, 4);
            }
        })
    });