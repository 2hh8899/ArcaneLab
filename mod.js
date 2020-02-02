ig.module("impact.feature.base.action-steps.mod-action-commands1").requires("impact.feature.base.action-steps").defines(function() {
	ig.ACTION_STEP.GIVE_ITEM = ig.ActionStepBase.extend({
		item: 0,
		amount: 0,
		skip: false,
		_wm: new ig.Config({
			attributes: {
				item: {
					_type: "Item",
					_info: "The item to spawn."
				},
				amount: {
					_type: "NumberExpression",
					_info: "Amount of the given item. 0 = 1.",
					_default: 1
				},
				skip: {
					_type: "Boolean",
					_info: "True if the side gui should hide the obtained item",
					_default: false
				}
			},
			label: function() {
				return "<b>GIVE ITEM: </b> <em>" + wmPrint("Item", this.item) + "</em> x" + this.amount + (this.skip ? "  <i>+ Skip Display</i>" : "")
			}
		}),
		init: function(a) {
			this.item = a.item || 0;
			this.amount = a.amount || 1;
			this.skip = a.skip || false
		},
		start: function() {
			var a = ig.Event.getExpressionValue(this.amount);
			sc.model.player.addItem(this.item, a, this.skip)
		}
	});
	ig.ACTION_STEP.GIVE_MONEY = ig.ActionStepBase.extend({
		amount: 0,
		_wm: new ig.Config({
			attributes: {
				amount: {
					_type: "Number",
					_info: "Amount to add",
					_default: 0
				}
			},
			label: function() {
				return "<b>ADD MONEY: </b> <em>" + this.amount + "</em>"
			}
		}),
		init: function(a) {
			this.amount = a.amount || 0
		},
		start: function() {
			this.amount > 0 && sc.model.player.addCredit(this.amount)
		}
	});
	ig.ACTION_STEP.ADJUST_ENTITY_POS = ig.EventStepBase.extend({
		entity: null,
		offset: null,
		_wm: new ig.Config({
			attributes: {
				offset: {
					_type: "Vec3",
					_info: "Offset applied to entity position ",
					_rawZValue: true
				}
			}
		}),
		init: function(a) {
			this.offset = a.offset
		},
		start: function(a) {
			a.setPos(a.coll.pos.x + this.offset.x, a.coll.pos.y + this.offset.y, a.coll.pos.z + this.offset.z)
		}
	});
	var faceDir = Vec2.create(), calcDir = Vec2.create();
	ig.ACTION_STEP.PLAYER_MOVE_AND_AIM = ig.ActionStepBase.extend({
		_wm: new ig.Config({
			attributes: {
				time: {
					_type: "Number",
					_info: "Duration for which player will move along pressed direction"
				},
				rotateSpeed: {
					_type: "Number",
					_info: "Speed in which player will rotate to pressed direction. In rotations per seconds.",
					_default: 0.2,
					_optional: true
				},
				stopBeforeEdge: {
					_type: "Boolean",
					_info: "If true: Stop before falling down from edge when further moving forward"
				}
			}
		}),
		init: function(a) {
			this.time = a.time || 0;
			this.rotateSpeed = a.rotateSpeed || 0;
			this.stopBeforeEdge = a.stopBeforeEdge;
		},
		start: function(a) {
			a.stepTimer = a.stepTimer + this.time;
			Vec2.assign(faceDir, a.face);
		},
		run: function(a) {
			var b = false;
			var c = a.getCombatantRoot();
			if(a.isPlayer) {
				sc.control.moveDir(calcDir, 1);
					Vec2.isZero(calcDir) ?
						b = true : this.rotateSpeed ? Vec2.rotateToward(faceDir, calcDir, this.rotateSpeed * Math.PI * 2 * ig.system.tick) : Vec2.assign(faceDir, calcDir)
			}
			b ? Vec2.assignC(a.coll.accelDir, 0, 0) : Vec2.assign(a.coll.accelDir, faceDir);

			if(this.stopBeforeEdge && ig.CollTools.isPostMoveOverHole(a.coll, true)) {
				Vec2.assignC(a.coll.accelDir, 0, 0);
				Vec2.assignC(a.coll.vel, 0, 0);
			}
			c.isPlayer && c.gui.crosshair.active
				c.gui.crosshair.getDir(a.face);
			return a.stepTimer <= 0
		}
	});
	ig.ACTION_STEP.SET_FACE_TO_TEMP_TARGET_ACCEL = ig.ActionStepBase.extend({
		_wm: new ig.Config({
			attributes: {}
		}),
		init: function() {},
		start: function(a) {},
		run: function(a) {
			var b = a.tmpTarget.coll.accelDir;
			if(!Vec2.isZero(b)) {
				Vec2.assign(a.face, b);
			}
		}
	});
	ig.ACTION_STEP.ROTATE_TO_TARGET_PREDICT = ig.ActionStepBase.extend({
		speed: 0,
		_wm: new ig.Config({
			attributes: {
				speed: {
					_type: "Number",
					_info: "Test.",
					_default: 0
				}
			}
		}),
		init: function(a) {
			this.speed = a.speed / 200;
		},
		run: function(a) {
			var b = a.getTarget();
			var c = Vec2.create();
			if(b) {
				c = Vec2.mulC(Vec2.mulC(b.coll.accelDir, b.coll.accelSpeed), a.distanceTo(b) / this.speed);
				b = Vec2.sub(b.getCenter(), a.getCenter());
				b = Vec2.add(b, c);
				Vec2.assign(a.face, b)
			}
			return true
		}
	});
		var b = {
			BOTTOM_POS: 1,
			JUMPING: 2,
			SIZE: 3,
			VELOCITY: 4
		};
	ig.ACTION_STEP.SET_VAR_ENTITY_STAT = ig.EventStepBase.extend({
		varName: null,
		stat: null,
		entity: null,
		_wm: new ig.Config({
			attributes: {
				varName: {
					_type: "VarName",
					_info: "Variable to store stat"
				},
				entity: {
					_type: "Entity",
					_info: "Entity of which to fetch stat",
					_optional: true
				},
				stat: {
					_type: "String",
					_info: "Type of Stat",
					_select: b
				}
			}
		}),
		init: function(a) {
			this.varName = a.varName;
			this.entity = a.entity || null;
			this.stat = b[a.stat] || b.RELATIVE_HP
		},
		start: function(a, d) {
			var c = ig.Event.getVarName(this.varName);
			if(c) {
				if(this.entity){
					var e = ig.Event.getEntity(this.entity, d);
				}else{
					var e = ig.Event.getEntity(a, d);
				}
				if(e) {
					var f;
					this.stat == b.BOTTOM_POS ? f = e.getAlignedPos(ig.ENTITY_ALIGN.BOTTOM) : this.stat == b.JUMPING ? f = e.jumping || false : this.stat == b.SIZE ? f = ig.copy(e.coll.size) : this.stat == b.VELOCITY && (f = ig.copy(e.coll.vel));
					ig.vars.set(c, f)
				}
			} else ig.log("SET_VAR_ENTITY_STAT: Variable Name is not a String!")
		}
	})
});
ig.module("impact.feature.base.action-steps.mod-action-commands2").requires("impact.feature.base.action-steps").defines(function() {
	var a = Vec2.create(),
		d = Vec2.create(),
		vw = Vec2.create(),
		c = Vec2.create();
	ig.ACTION_STEP.JUMP_TO_POINT_OFFSETAREA = ig.ActionStepBase.extend({
		adjustAbove: 0,
		offset: null,
		_wm: new ig.Config({
			attributes: {
				target: {
					_type: "Vec3",
					_info: "Point to jump to",
					_actorOption: true,
					_visualize: true,
					_pointSelect: true
				},
				forceDuration: {
					_type: "Number",
					_info: "If defined: force a specific jump duration, setting speed and velocity accordingly. Otherwise, jump height will adapted so point will be reached with current velocity",
					_optional: true
				},
				forceHeight: {
					_type: "Number",
					_info: "If defined: force a minimum height for jump",
					_optional: true
				},
				ignoreSounds: {
					_type: "Boolean",
					_info: "If true, don't play any sound when jumping up"
				},
				offsetArea: {
					_type: "Vec2",
					_info: "offserArea Vec3 value"
				}
			}
		}),
		init: function(a) {
			this.target = a.target;
			this.forceDuration = a.forceDuration || 0;
			this.forceHeight = a.forceHeight || 0;
			this.offsetArea = a.offsetArea;
			this.ignoreSounds = a.ignoreSounds || false;
		},
		start: function(b) {
			b.randomJumpOffset = Vec2.createC((Math.random() - 0.5) * this.offsetArea.x + this.target.x, (Math.random() - 0.5) * this.offsetArea.y + this.target.y);
			var e = ig.Action.getVec3(b.randomJumpOffset, b, d),
				f = b.getAlignedPos(ig.ENTITY_ALIGN.BOTTOM, c),
				f = Vec2.sub(e, f, a),
				g = Vec2.length(f),
				h = b.coll.maxVel * b.coll.relativeVel,
				i, j;
			if(this.forceHeight) {
				j = ig.CollTools.getJumpSpeedToHeight(b.coll, b.coll.pos.z + this.forceHeight);
				i = ig.CollTools.getJumpDuration(b.coll, e.z, j);
				h = g / i
			} else {
				if(this.forceDuration) {
					i =
						this.forceDuration;
					h = g / i
				} else i = g / h;
				j = ig.CollTools.getJumpSpeedForDuration(b.coll, e.z, i)
			}
			b.doJump(j, null, null, null, this.ignoreSounds);
			b.coll.friction.air = 0;
			Vec2.assign(b.coll.vel, f);
			Vec2.length(b.coll.vel, h);
			b.stepData.jumpSpeed = h;
			b.faceDirFixed || Vec2.assign(b.face, f)
		},
		run: function(b) {
			var c = ig.Action.getVec3(b.randomJumpOffset, b, d);
			if(c) {
				var c = Vec2.sub(c, b.getCenter(a)),
					e = Vec2.length(c),
					f = b.stepData.jumpSpeed;
				b.stepData.jumpSpeed * ig.system.tick > e && (f = e * ig.system.tick);
				if(e < 2) Vec2.assign(b.coll.vel, 0, 0);
				else {
					Vec2.length(c, f);
					Vec2.assign(b.coll.vel, c)
				}
			} else return true;
			if(b.coll.vel.z <= 0 && b.coll.pos.z == b.coll.baseZPos) {
				Vec2.assignC(b.coll.vel, 0, 0);
				return true
			}
			return false
		}
	});
		var i = Vec2.create(),
			j = Vec3.create(),
			k = {
				SELF: function(a, b, c) {
					a = b.getAlignedPos(c, a);
					if(b.isPlayer &&
						this.align == ig.ENTITY_ALIGN.BOTTOM) {
						c = b.maxJumpHeight === void 0 ? -1 : b.maxJumpHeight;
						if(c >= 0) a.z = Math.min(b.coll.pos.z, c)
					}
					return a
				},
				TARGET: function(a, b, c) {
					return (b.getTarget() || b)
						.getAlignedPos(c, a)
				},
				COLLAB_CENTER: function(a, b, c) {
					return !b.collaboration ? b.getAlignedPos(c, a) : b.collaboration.getCenterPos(a, c)
				}
			};
	ig.ACTION_STEP.SHOOT_PROXY_CURSOR = ig.ActionStepBase.extend({
		proxySrc: null,
		offset: {
			x: 0,
			y: 0,
			z: 0
		},
		dir: null,
		_wm: new ig.Config({
			attributes: {
				proxy: {
					_type: "ProxyRef",
					_info: "Ball the entity will shoot"
				},
				offset: {
					_type: "Offset",
					_info: "Offset relative to entity ground center from which to shoot"
				},
				dir: {
					_type: "Vec2",
					_info: "Direction to go to",
					_actorOption: true,
					_optional: true
				},
				aimAtTarget: {
					_type: "Boolean",
					_info: "If true: aim at target, ignore any other direction.",
					_optional: true
				}
			}
		}),
		init: function(a) {
			this.proxySrc =
				sc.ProxyTools.prepareSrc(a.proxy);
			this.offset = a.offset || this.offset;
			this.dir = a.dir;
			this.aimAtTarget = a.aimAtTarget
		},
		clearCached: function() {
			sc.ProxyTools.releaseSrc(this.proxySrc)
		},
		run: function(a) {
			var b = sc.ProxyTools.getProxy(this.proxySrc, a);
			if(b) {
				var c = this.dir && ig.Action.getVec2(this.dir, a, i) || a.face,
					d = Vec3.createC(ig.game.playerEntity.getCombatantRoot().gui.crosshair.coll.pos.x,ig.game.playerEntity.getCombatantRoot().gui.crosshair.coll.pos.y+ig.game.playerEntity.coll.pos.z,ig.game.playerEntity.coll.pos.z);
				Vec3.add(d, this.offset);
				if(this.aimAtTarget) {
					var e = a.getTarget();
					if(e) {
						c = e.getCenter(i);
						Vec2.sub(c, d)
					}
				}
				b.spawn(d.x, d.y, d.z, a, c)
			}
			return true
		}
	});
	ig.ACTION_STEP.WAIT_UNTIL_Z_HEIGHT = ig.ActionStepBase.extend({
		_wm: new ig.Config({
			attributes: {
				maxTime: {
					_type: "Number",
					_info: "If defined: maximal wait this time",
					_optional: true
				},
				zHeight: {
					_type: "Number",
					_info: "Maximum Z"
				}
			}
		}),
		init: function(a) {
			this.maxTime = a.maxTime || 0;
			this.zHeight = a.zHeight
		},
		start: function(a) {
			a.stepTimer =
				a.stepTimer + this.maxTime
		},
		run: function(a) {
			if(this.maxTime && a.stepTimer <= 0 || a.coll.vel.z >= 0 && !a.coll.zGravityFactor) return true;
			return a.coll.pos.z <= a.coll.baseZPos + this.zHeight
		}
	});
		var z = {
				IN_VIEW: {
					angle: 0.25,
					radius: 350,
					facePriority: true
				},
				CLOSE_RANGE: {
					angle: 1,
					radius: 200
				},
				MEDIUM_RANGE: {
					angle: 1,
					radius: 400
				},
				LONG_RANGE: {
					angle: 1,
					radius: 600
				},
				SCREEN_RANGE: {
					angle: 1,
					radius: 1200
				}
			},
			r = Vec2.create(),
			D = {
				NONE: 0,
				PREFER_NON_HIT: 1,
				ONLY_NON_HIT: 2
			};
	ig.ACTION_STEP.SET_CLOSE_TEMP_TARGET_NO_INVINSIBLE = ig.ActionStepBase.extend({
		_wm: new ig.Config({
			attributes: {
				searchType: {
					_type: "String",
					_info: "How to search close target",
					_select: z
				},
				distance: {
					_type: "Number",
					_info: "If defined: look for entities up to this distance. Otherwise use default",
					_optional: true
				},
				ignoreCurrentTarget: {
					_type: "Boolean",
					_info: "If true: ignore current target (will select temp target if available)"
				},
				prevHitBehavior: {
					_type: "String",
					_info: "How to handle enemies that have been previously hit",
					_select: D
				}
			}
		}),
		init: function(a) {
			this.searchType = z[a.searchType] || z.IN_VIEW;
			this.distance = a.distance || 0;
			this.ignoreCurrentTarget =
				a.ignoreCurrentTarget || false;
			this.prevHitBehavior = D[a.prevHitBehavior] || D.NONE
		},
		start: function(a) {
			for(var b = a.getTarget(), c = a.getAlignedPos(ig.ENTITY_ALIGN.BOTTOM, j), d = this.searchType.angle * Math.PI * 2, c = ig.game.getEntitiesInCircle(c, this.distance || this.searchType.radius, 1, 32, a.face, -d / 2, d / 2, a), d = null, e = 0, f = c.length; f--;) {
				var g = c[f];
				if(!(this.ignoreCurrentTarget && g == b) && !g.hitIgnore && g.aggression != sc.ENEMY_AGGRESSION.PEACEFUL) {
					if(g instanceof sc.CombatantAnimPartEntity) g = g.owner;
					if(g instanceof ig.ENTITY.Combatant && g.party != a.party && (g.party != sc.COMBATANT_PARTY.ENEMY ||
							g.target)) {
						var h = ig.CollTools.getDistVec2(a.coll, g.coll, r),
							i = Vec2.length(h);
						if(this.searchType.facePriority) {
							h = Vec2.angle(a.face, h);
							i = i + h * 1E3
						}
						if(a.combo.hitCombatants.indexOf(g) != -1)
							if(this.prevHitBehavior == D.PREFER_NON_HIT) i = i + 1E4;
							else if(this.prevHitBehavior == D.ONLY_NON_HIT) continue;
						if(!d || i < e) {
							d = g;
							e = i
						}
					}
				}
			}
			a.tmpTarget = d
		}
	});
	ig.ACTION_STEP.RUMBLE_STOP_CONTINUES = ig.EventStepBase.extend({
		name: null,
		_wm: new ig.Config({
			attributes: {
				name: {
					_type: "String",
					_info: "Name of the rumble to stop. Must be given!"
				}
			}
		}),
		init: function(a) {
			this.name =
				a.name || null
		},
		start: function() {
			var a = ig.rumble.getRumble(this.name);
			a && a.stop()
		}
	});
});
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
				if(this.data.faceAnims) {
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
					if(!a.timeDisconnect) this.coll.time.parent = this.sourceEntity.coll;
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
					if(a.invisible) this.animState.alpha = 0;
					if(a.copyOwnerAnims) {
						this.animSheet = this.combatant.animSheet;
						if(a.startAnim) {
							this.setCurrentAnim(a.startAnim, true, null);
							this.animationFixed = true
						}
						this.initAnimations();
						this.storedWalkAnims = ig.copy(this.combatant.storedWalkAnims);
						this.setWalkAnims(this.combatant.walkAnimsName)
					} else {
						if(a.faceAnims || a.animation) {
							this.animSheet = a.faceAnims || a.animation;
							this.initAnimations()
						}
						a.walkAnims ? this.storeWalkAnims("default", a.walkAnims) : this.storeWalkAnims("default", {
							idle: "default"
						});
						this.setWalkAnims("default");
						if(a.startAnim) {
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
					this.hideBar();
					if(!this.destroyType) {
						this.destroyType =
							b || a.ACTION_END_DESTROYED;
						this.detach();
						this.cancelAction();
						this.setAction(this.killAction);
					}else this.kill()
				},
				update: function() {
					this.breakType == sc.PROXY_BREAK_TYPE.COMBATANT && this.combatant.isDefeated() && this.destroy();
					this.coll.pos.z < ig.game.minLevelZ && (!this.stickToSource &&
						!this.noFallDestroy) && this.destroy();
					if(this.stickToSource) {
						var a = this.stickToSource == sc.PROXY_STICK_TYPE.TARGET ? this.getTarget() : this.sourceEntity;
						if(a) {
							var d = ig.CollTools.getCenterXYAlignedPos(b, this.coll, a.coll);
							this.setPos(d.x, d.y, a.coll.pos.z);
							this.stickFaceAlign && a.face && Vec2.assign(this.face, a.face)
						}
					}
					this.parent()
				},
				ballHit: function(a) {
					if(this.hp) {
						if(a.party == this.combatant.party) return false;
						var b = a.getHitCenter(this);
						this.wasHit = true;
						if(this.hp < 0) {
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
				for(var h = a.length; h--;) {
					var i = a[h];
					if(i instanceof sc.CombatProxyEntity && (!d || i.stickToSource)) b &&
						i.group != b || (g ? g-- : i.destroy())
				}
				return g || 0
			},
			hasAttachedProxy: function(a, b) {
				for(var d = a.length; d--;) {
					var g = a[d];
					if(g instanceof sc.CombatProxyEntity && g.group == b) return true
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
ig.module("game.feature.combat.model.poison-status").requires(
	"game.feature.combat.model.combat-status",
	"game.feature.combat.gui.status-bar",
	"game.feature.combat.entities.combatant",
	"game.feature.combat.model.combat-params",
	"game.feature.player.modifiers",
	"game.feature.menu.gui.item.item-status-equip",
	"game.feature.menu.gui.menu-misc",
	"game.feature.menu.gui.status.status-misc")
.defines(function() {
	sc.MODIFIERS.TOXIC_HAZARD = {
		altSheet: "media/gui/status-gui.png",
        offX: 96,
        offY: 0,
        icon: -1,
        order: 100
    };
	sc.PoisonStatus = sc.COMBAT_STATUS[4] = sc.CombatStatusBase.extend({
		id: 0,
		label: "poisoning",
		statusBarEntry: "POISONED",
		offenseModifier: "TOXIC_HAZARD",
		defenseModifier: null,
		duration: 20,
		poisonTimer: 0,
		onUpdate: function(b, a) {
			this.poisonTimer = this.poisonTimer +
				ig.system.ingameTick;
			if((!b.getCombatantRoot()
					.isPlayer || !sc.model.isCutscene()) && this.poisonTimer > 0.5) {
				var d = Math.floor(a.getStat("hp") * (0.3 / (this.duration / 0.5)) * this.getEffectiveness(a));
				b.instantDamage(d, 0.5);
				this.effects.spawnOnTarget("burnDamage", b);
				this.poisonTimer = 0
			}
		}
	});
    sc.STATUS_BAR_ENTRY.POISONED = {
    	icon: 0,
    	isPoison: true,
    	init: null,
    	barY: 0,
    	barX: 0,
    	half: true
    }
	ig.GUI.StatusBar.inject({
		stunGfx: new ig.Image("media/gui/poison-status.png"),
        drawStatusEntry: function(b, c, e, f) {
            var g = this.statusEntries[f],
                f = sc.STATUS_BAR_ENTRY[f],
                h = 1;
            g.timer < 0.1 && (h = g.timer / 0.1);
            h != 1 && b.addTransform()
				.setPivot(c, e + 2)
				.setScale(1, h);
            var i = 24,
                j = 0;
            if (f.half) j = i = i / 2;
            if (f.isPoison) {
	            if (g.stick) b.addGfx(this.stunGfx, c - 6, e - 2, 24, 0, 8, 8);
	            else {
	                if (g.timer > 1.7) var l =
	                    Math.sin(Math.PI * 8 * (2 - g.timer) / 0.3),
	                    c = c + l;
	                g = 1 + Math.floor(g.value * (i - 2));
	                l = i - 1 - g;
	                c = c + j;
	                b.addGfx(this.stunGfx, c, e, f.barX, f.barY, g, 4);
	                l && b.addGfx(this.gfx, c + g, e, 216 + g, 12, l, 4);
	                b.addGfx(this.stunGfx, c + (i - 1), e - 2, 25, 0, 7, 8)
	            }
            } else {
	            var k = this.barIconTiles.getTileSrc(a, f.icon);
	            if (g.stick) b.addGfx(this.gfx, c - 6, e - 2, k.x, k.y, 8, 8);
	            else {
	                if (g.timer > 1.7) var l =
	                    Math.sin(Math.PI * 8 * (2 - g.timer) / 0.3),
	                    c = c + l;
	                g = 1 + Math.floor(g.value * (i - 2));
	                l = i - 1 - g;
	                c = c + j;
	                b.addGfx(this.gfx, c, e, 216, f.barY, g, 4);
	                l && b.addGfx(this.gfx, c + g, e, 216 + g, 12, l, 4);
	                b.addGfx(this.gfx, c + (i - 1), e - 2, k.x + 1, k.y, 7, 8)
	            }
            }
            h != 1 && b.undoTransform()
        }
	});
    var b = Vec2.create(),
        a = Vec2.create(),
        d = Vec3.create(),
        c = Vec3.create(),
        e = {},
        f = {
            damageResult: void 0,
            attackType: void 0,
            flyLevel: void 0,
            hitStable: void 0,
            damageFactor: void 0,
            weakness: false,
            alignFace: false,
            ignoreHit: false
        };
	var aConst = 0.25,
        dConst = 1.5,
        cConst = 3;
    var funcs = {
        LINEAR: function(a, b) {
            return a * 2 - b
        },
        PERCENTAGE: function(a, b) {
            return a > b ? a * (1 + Math.pow(1 - b / a, 0.5) * 0.2) : a * Math.pow(a / b, 1.5)
        }
    };
	sc.CombatParams.inject({
		init: function(a) {
            if (a)
                for (var b in this.baseParams) this.baseParams[b] = a[b] || this.baseParams[b];
            this.currentHp = this.getStat("hp");
            for (b = 0; b < 5; ++b) this.statusStates[b] = new sc.COMBAT_STATUS[b]
        },
    	getDamage: function(e, g, h, i, j) {
            var k = e.damageFactor,
                l = e.noHack || false,
                o = h.getCombatantRoot(),
                h = h.combo || o.combo;
            if (h.damageCeiling) {
                var m = Math.max(1 - (h.damageCeiling.sum[this.combatant.id] || 0) / h.damageCeiling.max, 0);
                m < 0.5 && (k = Math.max(k * 2 * m, 0.01))
            }
            h = k;
            if (!ig.perf.skipDmgModifiers) {
                e.skillBonus && (k = k * (1 + e.attackerParams.getModifier(e.skillBonus)));
                var n = e.attackerParams.getModifier("BERSERK");
                n && e.attackerParams.getHpFactor() <= sc.HP_LOW_WARNING && (k = k * (1 + n));
                (n = e.attackerParams.getModifier("MOMENTUM")) && (o.isPlayer && o.dashAttackCount) && (k = k * (1 + o.dashAttackCount * n));
                !ig.vars.get("g.newgame.ignoreSergeyHax") &&
                    (o.isPlayer && !this.combatant.isPlayer && sc.newgame.get("sergey-hax")) && (k = k * 4096)
            }
            var g = this.damageFactor * (g === void 0 ? 1 : g),
                p = 1,
                r = e.attackerParams.getStat("focus", l) / this.getStat("focus", l),
                n = (Math.pow(r, 0.35) - 0.9) * e.critFactor,
                n = Math.random() <= n;
            if (!ig.perf.skipDmgModifiers) {
                e.element && (p = this.getStat("elemFactor")[e.element - 1] * this.tmpElemFactor[e.element - 1]);
                g = g * p;
                e.ballDamage && (g = g * (this.ballFactor + this.statusStates[3].getValue(this)));
                (m = e.attackerParams.getModifier("CROSS_COUNTER")) && sc.EnemyAnno.isCrossCounterEffective(this.combatant) &&
                    (g = g * (1 + m));
                (m = e.attackerParams.getModifier("BREAK_DMG")) && sc.EnemyAnno.isWeak(this.combatant) && (g = g * (1 + m));
                n && (k = k * e.attackerParams.criticalDmgFactor)
            }
            o = sc.combat.getGlobalDmgFactor(o.party);
            m = 0;
			v = (Math.pow(1 + (r >= 1 ? r - 1 : 1 - r) * cConst, aConst) - 1) * dConst;
			r = r >= 1 ? 1 + v : Math.max(0, 1 - v);
			var pppm = r * e.attackerParams.getModifier("TOXIC_HAZARD") * p;
			if (pppm>0) pppm = this.statusStates[4].getInflictValue(pppm, this, e, i);
			if (e.element && e.statusInflict && g > 0 && !j)	var j = e.element - 1,
				m = h * e.statusInflict,
				m = m * r * this.getStat("statusInflict")[j] * this.tmpStatusInflict[j] * p,
				m = this.statusStates[j].getInflictValue(m, this, e, i);
            i = e.attackerParams.getStat("attack", l);
            l = e.defenseFactor *
                this.getStat("defense", l);
            l = Math.max(1, funcs.PERCENTAGE(i, l));
            l = l * g;
            i = funcs.PERCENTAGE(i, 0) - l;
            l = l * k * o;
            i = i * k * o;
            if (!ig.perf.skipDmgModifiers) {
                l = l * (0.95 + Math.random() * 0.1);
                i = i * (0.95 + Math.random() * 0.1)
            }
            if (e.limiter.noDmg) i = l = 0;
            l = Math.round(l);
            return {
                damage: l,
                defReduced: i,
                offensiveFactor: k,
                baseOffensiveFactor: h,
                defensiveFactor: g,
                critical: n,
                status: m,
                status2: pppm
            }
        },
		applyDamage: function(a, b, c) {
            var d = c.getCombatantRoot(),
                c = c.combo || d.combo;
            if (c.damageCeiling) {
                d = this.combatant.id;
                c.damageCeiling.sum[d] || (c.damageCeiling.sum[d] =
                    0);
                c.damageCeiling.sum[d] = c.damageCeiling.sum[d] + a.baseOffensiveFactor
            }
			a.status2 && this.statusStates[4].inflict(a.status2, this, b);
            this.reduceHp(a.damage);
            a.status && this.statusStates[b.element - 1].inflict(a.status, this, b);
            this.reduceHp(a.damage)
        }
	});
});



document.body.addEventListener('modsLoaded', function () {
	simplify.registerUpdate(function(){
		if(ig.game.playerEntity){
			ig.vars.set("tmp.detectMouseVec3", Vec3.createC(ig.game.playerEntity.getCombatantRoot().gui.crosshair.coll.pos.x,ig.game.playerEntity.getCombatantRoot().gui.crosshair.coll.pos.y+ig.game.playerEntity.coll.pos.z,ig.game.playerEntity.coll.pos.z));
		}
		if(ig.input.pressed("aim")){
			ig.vars.set("tmp.detectMousePress", 1);
		}
		if(ig.input.pressed("melee")){
			ig.vars.set("tmp.detectMeleePress", 1);
		}
		if(ig.input.pressed("special")){
			ig.vars.set("tmp.detectSpecialPress", 1);
		}
	});
});
