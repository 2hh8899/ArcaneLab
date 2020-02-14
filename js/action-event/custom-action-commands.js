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
