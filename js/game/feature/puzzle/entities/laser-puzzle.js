ig.module("game.feature.puzzle.entities.rotate-blocker-laser")
	.requires("impact.base.entity", "impact.feature.effect.effect-sheet", "game.feature.interact.map-interact")
	.defines(function() {
		sc.ROTATE_BLOCKER_DIR = {
			NE: 0,
			SE: 1,
			SW: 2,
			NW: 3
		};
		var b = [{
			angle: 0,
			collShape: ig.COLLSHAPE.SLOPE_NE,
			anim: "ne"
		}, {
			angle: 0.25,
			collShape: ig.COLLSHAPE.SLOPE_SE,
			anim: "se"
		}, {
			angle: 0.5,
			collShape: ig.COLLSHAPE.SLOPE_SW,
			anim: "sw"
		}, {
			angle: 0.75,
			collShape: ig.COLLSHAPE.SLOPE_NW,
			anim: "nw"
		}],
		hR = {
			0: "",
			1: "Heat",
			2: "Cold",
			3: "Shock",
			4: "Wave"
		};
		ig.ENTITY.RotateBlockerLaser = ig.AnimatedEntity.extend({
			_wm: new ig.Config({
				spawnable: true,
				attributes: {
					spawnCondition: {
						_type: "VarCondition",
						_info: "Condition for Enemy to spawn",
						_popup: true,
						_optional: true
					},
					dir: {
						_type: "String",
						_info: "Start direction of triangular block shape",
						_select: sc.ROTATE_BLOCKER_DIR
					},
					blockElement: {
						_type: "Number",
						_info: "Block element (0netural 1heat 2cold 3shock 4wave)"
					},
					condition: {
						_type: "VarCondition",
						_info: "Condition for RotateBlocker to be active"
					}
				}
			}),
			active: true,
			currentDir: 0,
			currentAngle: 0,
			destAngle: 0,
			turnTimer: 0,
			pramaEffect: false,
			interactIcons: {
				vertical: new sc.MapInteractIcon(new ig.TileSheet("media/gui/map-icon.png", 24, 24, 120, 24), {
					FOCUS: [0, 1, 2, 2],
					NEAR: [3]
				}, 0.133)
			},
			effects: {
				sheet: null
			},
			init: function(a, d, c, e) {
				this.parent(a, d, c, e);
				this.coll.type = ig.COLLTYPE.BLOCK;
				this.setSize(32, 32, 32);
				this.currentDir = sc.ROTATE_BLOCKER_DIR[e.dir] || sc.ROTATE_BLOCKER_DIR.NE;
				a = b[this.currentDir];
				this.destAngle = this.currentAngle = a.angle;
				this.blockElement = e.blockElement;
				this.coll.shape = a.collShape;
				this.initAnimations({
					namedSheets: {
						ground: {
							src: "media/entity/objects/laser-puzzle.png",
							width: 32,
							height: 32,
							offX: 32+(this.blockElement*96),
							offY: 0,
							xCount: 1
						},
						block: {
							src: "media/entity/objects/laser-puzzle.png",
							width: 32,
							height: 64,
							offX: 0+(this.blockElement*96),
							offY: 64
						}
					},
					SUB: [{
						sheet: "ground",
						shapeType: "Z_FLAT",
						frames: [1],
						SUB: [{
							name: "off"
						}, {
							name: "ne"
						}, {
							name: "se"
						}, {
							name: "sw"
						}, {
							name: "nw"
						}, {
							name: "turn"
						}]
					}, {
						sheet: "block",
						renderMode: "lighter",
						SUB: [{
							name: "ne",
							frames: [1],
							flipX: false
						}, {
							name: "se",
							frames: [0],
							flipX: false,
							wallY: 1
						}, {
							name: "sw",
							frames: [0],
							flipX: true,
							wallY: 1
						}, {
							name: "nw",
							frames: [1],
							flipX: true
						}]
					}, {
						sheet: "ground",
						shapeType: "Y_FLAT",
						renderMode: "lighter",
						frames: [0],
						SUB: [{
							name: "turn",
							offset: {
								z: 1
							}
						}, {
							name: "turn",
							offset: {
								z: 4
							}
						}, {
							name: "turn",
							offset: {
								z: 8
							}
						}, {
							name: "turn",
							offset: {
								z: 12
							}
						}, {
							name: "turn",
							offset: {
								z: 16
							}
						}, {
							name: "turn",
							offset: {
								z: 20
							}
						}, {
							name: "turn",
							offset: {
								z: 24
							}
						}, {
							name: "turn",
							offset: {
								z: 28
							}
						}, {
							name: "turn",
							offset: {
								z: 32
							}
						}]
					}]
				});
				this.setCurrentAnim(a.anim);
				this.interactEntry = new sc.MapInteractEntry(this, this, this.interactIcons.vertical, sc.INTERACT_Z_CONDITION.SAME_Z, false);
				this.effects.sheet = new ig.EffectSheet("puzzle.rotate-blocker-laser");
				this.condition = new ig.VarCondition(e.condition)
			},
			show: function(a) {
				this.parent(a);
				if(this.effects.hideHandle) {
					this.effects.hideHandle.stop();
					this.effects.hideHandle =
						null
				}
				window.wm || this.setActive(this.condition.evaluate(), true);
				if(!a) {
					this.animState.alpha = 0;
					ig.game.effects.teleport.spawnOnTarget("showFast", this, {})
				}
			},
			onHideRequest: function() {
				sc.mapInteract.removeEntry(this.interactEntry);
				this.effects.hideHandle = ig.game.effects.teleport.spawnOnTarget("hideFast", this, {
					callback: this
				})
			},
			setActive: function(a, d) {
				this.turnTimer = 0;
				this.active = a;
				if(this.effects.deactHandle) {
					this.effects.deactHandle.setCallback(null);
					this.effects.deactHandle = null
				}
				if(this.active) {
					this.coll.setType(ig.COLLTYPE.BLOCK);
					this.setCurrentAnim(b[this.currentDir].anim);
					sc.mapInteract.addEntry(this.interactEntry);
					d || this.effects.sheet.spawnOnTarget("appear", this, {
						spriteFilter: [1]
					})
				} else {
					this.coll.setType(ig.COLLTYPE.TRIGGER);
					sc.mapInteract.removeEntry(this.interactEntry);
					d ? this.setCurrentAnim("off") : this.effects.deactHandle = this.effects.sheet.spawnOnTarget("disappear", this, {
						spriteFilter: [1]
					})
				}
			},
			onEffectEvent: function(a) {
				if(a == this.effects.deactHandle) {
					this.effects.deactHandle = null;
					this.setCurrentAnim("off")
				} else if(a ==
					this.effects.hideHandle) {
					this.effects.hideHandle = null;
					this.hide()
				}
			},
			onKill: function(a) {
				this.effects.sheet.decreaseRef();
				this.parent(a)
			},
			onInteraction: function() {
				if(!ig.vars.get("map.laserPuzzleShoot")){
					this.turn((this.currentDir + 1) % 4);
					var a = ig.game.playerEntity,
						b = new ig.Action("openChest", [{
							type: "SET_WALK_ANIMS",
							config: "normal"
						}, {
							type: "SET_RELATIVE_SPEED",
							value: 0.5
						}, {
							type: "SET_FACE_TO_ENTITY",
							entity: this,
							rotate: true
						}, {
							type: "SET_FACE_FIX",
							value: true
						}, {
							type: "SHOW_ANIMATION",
							anim: "chestOpen"
						}, {
							type: "MOVE_TO_ENTITY_DISTANCE",
							entity: this,
							min: 28,
							max: 40,
							maxTime: 0.2
						}, {
							type: "WAIT",
							time: 0.2
						}]);
					b.eventAction = true;
					a.setAction(b);
				}
				return false
			},
			ballHit: function(a) {
				a.isBall && a.cleanDirection(0.025);
				return false
			},
			turn: function(a) {
				this.effects.sheet.spawnOnTarget("rotate" + hR[this.blockElement], this);
				this.currentDir = a;
				this.currentAngle = this.destAngle % 1;
				a = b[this.currentDir];
				this.destAngle = a.angle || 1;
				this.coll.shape = a.collShape;
				this.setCurrentAnim("turn");
				this.turnTimer = 0.2 + 0.1
			},
			update: function() {
				if(!this.pramaEffect){
					this.pramaEffect=true;
					if(this.blockElement) {
						this.effects.sheet.spawnOnTarget("effect" + hR[this.blockElement], this, {duration: -1});
					}
				}
				if(this.turnTimer) {
					this.turnTimer = this.turnTimer - ig.system.tick;
					if(this.turnTimer <=
						0) {
						this.turnTimer = 0;
						this.setCurrentAnim(b[this.currentDir].anim);
						this.currentAngle = this.destAngle % 1
					}
				}
				this.parent()
			},
			updateSprites: function() {
				ig.AnimatedEntity.prototype.updateSprites.call(this);
				if(this.turnTimer)
					for(var a = this.sprites.length - 1, b = 0.1 / (a - 1), c = 0; a--;) {
						var e = this.sprites[a + 1],
							f = 1 - ((this.turnTimer - 0.1 + c) / 0.2)
							.limit(0, 1),
							f = KEY_SPLINES.EASE_IN_OUT.get(f),
							f = this.currentAngle * (1 - f) + this.destAngle * f;
						e.setPivot(16, 16);
						e.setTransform(1, 1, f * 2 * Math.PI);
						c = c + b
					}
			},
			varsChanged: function() {
				var a = this.condition.evaluate();
				a != this.active && this.setActive(a)
			}
		})
	});
ig.module("game.feature.puzzle.entities.sliding-block-laser")
	.requires("impact.base.actor-entity", "impact.base.entity", "impact.feature.effect.effect-sheet")
	.defines(function() {
		var b = Vec2.create(),
			a = {};
		ig.ENTITY.SlidingBlockLaser = ig.AnimatedEntity.extend({
			_wm: new ig.Config({
				spawnable: true,
				attributes: {}
			}),
			moving: false,
			moveDir: Vec2.create(),
			bombSnap: true,
			squishRespawn: true,
			effects: {
				sheet: new ig.EffectSheet("puzzle.sliding-block"),
				handle: null
			},
			init: function(a, b, e, f) {
				this.parent(a, b, e, f);
				this.coll.type = ig.COLLTYPE.BLOCK;
				this.coll.zGravityFactor = 1;
				this.coll.zBounciness = 0.3;
				this.coll.weight = -1;
				this.coll.shadow.size = 16;
				this.coll.setSize(32, 32, 32);
				this.terrain = ig.TERRAIN.METAL;
				a = ig.mapStyle.get("puzzle");
				this.initAnimations({
					sheet: {
						src: a.sheet,
						width: 32,
						height: 64,
						offX: 224,
						offY: 192
					},
					aboveZ: 1,
					wallY: 0.1,
					SUB: [{
						name: "default",
						time: 1,
						frames: [0],
						repeat: false
					}]
				})
			},
			move: function(d) {
				Vec2.assign(this.moveDir, d);
				var c = Vec2.create(this.coll.pos.x - this.coll.size.x / 2, this.coll.pos.y - this.coll.size.y / 2);
				c = ig.game.physics.initTraceResult(a);
				if(ig.game.traceEntity(c, this, d.x, d.y, 0, 0, 0, ig.COLLTYPE.IGNORE)) this.effects.sheet.spawnOnTarget("blocked", this);
				else {
					this.moving = true;
					this.effects.handle = this.effects.sheet.spawnOnTarget("slide", this, {
						duration: -1
					})
				}
				return true
			},
			update: function() {
				if(this.moving) {
					var d =
						Vec2.assign(b, this.moveDir);
					Vec2.length(d, 400 * ig.system.tick);
					var c = ig.game.physics.initTraceResult(a);
					if(ig.game.traceEntity(c, this, d.x, d.y, 0, 0, 1, ig.COLLTYPE.IGNORE, null, null, 1)) {
						Vec2.mulF(d, c.dist);
						this.moving = false;
						this.effects.handle && this.effects.handle.stop();
						this.coll.vel.z = 0
					}
					c = this.coll;
					this.setPos(c.pos.x + d.x, c.pos.y + d.y, c.pos.z, true)
				}
				this.parent()
			}
		})
	});
ig.module("game.feature.puzzle.entities.laser-cannon-tower")
    .requires("impact.base.entity", "impact.feature.effect.effect-sheet")
    .defines(function() {
        function b(a, b) {
            return b.distance - a.distance
        }
        var a = Vec3.create(),
			b = Vec2.create(),
			EL = {
				"Neutral": 0,
				"Heat": 1,
				"Cold": 2,
				"Shock":3,
				"Wave": 4
			};
        ig.ENTITY.ChargeCannonTower = ig.AnimatedEntity.extend({
            chargeTimer: 0,
            chargeHitExceptions: null,
            charged: false,
			charging: false,
			element: 0,
            effects: {
                sheet: new ig.EffectSheet("puzzle.charge-cannon-tower"),
                handle: null
            },
            effectAlign: null,
            _wm: new ig.Config({
                spawnable: true,
                attributes: {
                    varOnCharge: {
                        _type: "VarName",
                        _info: "Var set to true when tesla coil begins charging",
                        _optional: true
                    },
                    varOnDischarge: {
                        _type: "VarName",
                        _info: "Var set to true when tesla coil discharges",
                        _optional: true
                    },
                    keepOnWhenLaserOff: {
                        _type: "Boolean",
                        _info: "keep on when laser is offline",
                        _optional: true
                    },
                    align: {
                        _type: "String",
                        _info: "Alignment of effect relative to target",
                        _select: ig.ENTITY_ALIGN,
                        _optional: true
                    },
                    spawnCondition: {
                        _type: "VarCondition",
                        _info: "Condition for prop to appear",
                        _popup: true
                    }
                }
            }),
            init: function(a, b, e, f) {
                this.parent(a, b, e, f);
                this.coll.type = ig.COLLTYPE.VIRTUAL;
                this.coll.weight = -1;
                this.coll.zGravityFactor = 1E3;
				this.coll.setSize(16, 16, 62);
				this.initAnimations({
					shapeType: "Y_FLAT",
					SUB: [{
						dirs: 1,
						flipX: [0],
						tileOffsets: [0],
						sheet: {
							src: "media/entity/objects/laser-puzzle.png",
							width: 41,
							height: 78,
							offX: 192,
							offY: 130,
							xCount: 6
						},
						wallY: 1,
						SUB: [{
							time: 0.1,
							frames: [0],
							repeat: true,
							SUB: [{
								name: "off"
							}, {
								name: "charge0"
							}, {
								name: "charge1"
							}, {
								name: "charge2"
							}, {
								name: "charge3"
							}, {
								name: "charge4"
							}, {
								repeat: false,
								name: "flash0"
							}, {
								repeat: false,
								name: "flash1"
							}, {
								repeat: false,
								name: "flash2"
							}, {
								repeat: false,
								name: "flash3"
							}, {
								repeat: false,
								name: "flash4"
							}]
						}, {
							time: 0.1,
							repeat: true,
							renderMode: "lighter",
							SUB: [{
								name: "charge0",
								frames: [1]
								}, {
								name: "charge1",
								frames: [2]
								}, {
								name: "charge2",
								frames: [3]
								}, {
								name: "charge3",
								frames: [4]
								}, {
								name: "charge4",
								frames: [5]
								}]
						}, {
							time: 0.05,
							framesAlpha: [1, 1, 1, 0.9, 0.8, 0.6, 0.4, 0.2],
							repeat: false,
							renderMode: "lighter",
							SUB: [{
								name: "flash0",
								frames: [1, 1, 1, 1, 1, 1, 1, 1]
							}, {
								name: "flash1",
								frames: [2, 2, 2, 2, 2, 2, 2, 2]
							}, {
								name: "flash2",
								frames: [3, 3, 3, 3, 3, 3, 3, 3]
							}, {
								name: "flash3",
								frames: [4, 4, 4, 4, 4, 4, 4, 4]
							}, {
								name: "flash4",
								frames: [5, 5, 5, 5, 5, 5, 5, 5]
							}]
						}]
					}]
				});
				this.setCurrentAnim("off")
                this.varOnCharge =
                    f.varOnCharge || null;
                this.varOnDischarge = f.varOnDischarge || null;
				this.keepOnWhenLaserOff = f.keepOnWhenLaserOff || false;
                this.effectAlign = f.align || null
            },
            show: function(a) {
                this.parent(a);
                if(!a) {
                    this.animState.alpha = 0;
                    ig.game.effects.teleport.spawnOnTarget("showFast", this, {})
                }
            },
            onHideRequest: function() {
                ig.game.effects.teleport.spawnOnTarget("hideDefault", this, {
                    callback: this
                })
            },
            onEffectEvent: function(a) {
                a.isDone() && this.hide()
            },
            onActionEndDetach: function() {
                this.kill()
            },
            extendCharge: function(a) {
                this.chargeHitExceptions = a;
                this.chargeTimer = 0.1
            },
            chargeComplete: function(d) {
				this.charged = true;
                this.varOnDischarge && ig.vars.set(this.varOnDischarge, true);
				this.effects.handle = this.effects.sheet.spawnOnTarget("charged", this, {
					duration: -1,
					align: ig.ENTITY_ALIGN.CENTER
				});
                this.sprites.length > 1 && this.sprites[1].setGfxCut(0, 0)
            },
            update: function() {
                if(this.chargeTimer) {
                    this.chargeTimer = this.chargeTimer - ig.system.tick;
                    if(this.chargeTimer <= 0) {
                        this.chargeTimer = 0;
                        if(this.effects.handle) {
                            this.effects.handle.stop();
                            this.effects.handle = null
                        }
                        this.chargeComplete(this.chargeHitExceptions || [this]);
                        this.chargeHitExceptions = null
                    } else this.sprites.length >= 2 && this.sprites[1].setGfxCut(48 - 7 * (1 - this.chargeTimer), 0)
                }
				if(!this.keepOnWhenLaserOff && this.charged && !ig.vars.get("map.laserPuzzleShoot")){
					this.setCurrentAnim("flash" + this.element, true, "off", true);
					this.effects.sheet.spawnOnTarget("discharge" + this.element, this, {
						align: ig.ENTITY_ALIGN.BOTTOM
					});
					if(this.effects.handle) {
						this.effects.handle.stop();
						this.effects.handle = null
					}
					this.charging = this.charged = false
				}
                this.parent()
            },
			charge: function(a, b) {
				if(!this.charged && !this.charging) {
					this.varOnCharge && ig.vars.set(this.varOnCharge, true);
					this.chargeTimer = 1;
					this.charging = true;
					this.element = a;
					this.setCurrentAnim("charge" + this.element);
					this.effects.handle = this.effects.sheet.spawnOnTarget("charging" + this.element, this, {
						duration: -1,
						align: ig.ENTITY_ALIGN.CENTER
					});
					this.effects.sheet.spawnOnTarget("chargeStart" + this.element, this, {
						align: ig.ENTITY_ALIGN.CENTER
					});
					sc.combat.showHitEffect(this, b, sc.ATTACK_TYPE.NONE, a, false, false, true);
					return true
				}
			},
            ballHit: function(a) {
                var b = a.getHitCenter(this),
                    e = a.getElement();
				if(a instanceof sc.LaserPuzzleEntity){
						return false;
				}else if(!this.charged && !this.charging && a.attackInfo) {
					if(a.attackInfo && a.attackInfo.hasHint("LASER")) {
						this.charge(e, b);
					}else{
						return false;
					}
				}else if(!this.chargeTimer && a.attackInfo && a.attackInfo.hasHint("CHARGED") && a.getCombatantRoot() && this.charged) {
					if(e == this.element) {
						if(this.effects.handle) {
							this.effects.handle.stop();
							this.effects.handle = null
						}
						this.setCurrentAnim("flash" + this.element, true, "off", true);
						this.effects.sheet.spawnOnTarget("discharge" + this.element, this, {
							align: ig.ENTITY_ALIGN.TOP
						});
						this.charging = this.charged = false;
						this.towerAttack(a.getHitVel(this, b), a.getCombatantRoot());
						ig.vars.set("map.laserPuzzleShoot", false)
					}else{
						return false;
					}
                }
                sc.combat.showHitEffect(this, b, sc.ATTACK_TYPE.NONE, a.getElement(), false, false, true);
                return true
            },
			towerAttack: function(a, e) {
                switch (this.element) {
					case 0: 
						break;
					case 1: 
						ig.game.spawnEntity(sc.TowerHeatBall, this.getCenter().x, this.getCenter().y, this.coll.pos.z + 48, {combatant: e, towerEnt: this, moveDir: a});
						break;
					case 2: 
						ig.game.spawnEntity(sc.TowerColdGas, this.getCenter().x, this.getCenter().y, this.coll.pos.z + 48, {combatant: e, towerEnt: this, moveDir: a});
						break;
					case 3: 
						this.effects.sheet.spawnOnTarget("attackShock", this, {
							align: ig.ENTITY_ALIGN.BOTTOM
						});
						var b = this.getAlignedPos(ig.ENTITY_ALIGN.BOTTOM, a),
							b = new sc.CircleHitForce(e, {
								attack: {
									type: "MASSIVE",
									element: "SHOCK",
									damageFactor: 10,
									status: 5,
									spFactor: 0,
									hints: ["GROUND_SHOCK", "LASERTOWER"]
								},
								pos: Vec3.createC(b.x, b.y, b.z - 16),
								radius: 64,
								zHeight: 32,
								duration: 0.2,
								expandRadius: 96,
								alwaysFull: true,
								party: e.party,
								centralAngle: 1
							});
						sc.combat.addCombatForce(b);
						break;
					case 4: 
						ig.game.spawnEntity(sc.TowerWaveBeam, this.getCenter().x, this.getCenter().y, this.coll.pos.z + 48, {combatant: e, towerEnt: this, moveDir: a});
						break;
				}
			}
        });
        sc.TowerHeatBall = ig.AnimatedEntity.extend({
            combatant: null,
			towerEnt: null,
            effects: {
                sheet: new ig.EffectSheet("puzzle.charge-cannon-tower")
            },
            init: function(a, b, e, f) {
                this.parent(a, b, e, f);
                this.coll.type = ig.COLLTYPE.PROJECTILE;
                this.coll.zGravityFactor = 0.8;
                this.coll.setSize(48, 48, 48);
                this.coll.setPadding(4, 4);
                this.coll.friction.air = 0;
                this.coll.shadow.size = 40;
                this.coll.setPos(a - this.coll.size.x / 2, b - this.coll.size.y / 2, e);
                this.coll.weight = 2E5;
                this.initAnimations({
					name:"default",
					sheet:{  
						src:"media/entity/effects/lighter-particle.png",
						offX:0,
						offY:48,
						width:48,
						height:48
					},
					renderMode: "lighter",
					time:0.2,
					repeat:true,
					frames:[0]
				});
                this.setCurrentAnim("default");
                this.coll.vel.z = 200;
				this.towerEnt = f.towerEnt || null;
                this.combatant = f.combatant || null;
				this.shoot(f.moveDir)
            },
			shoot: function(a) {
				this.coll.vel.x = a.x;
				this.coll.vel.y = a.y;
				Vec2.length(this.coll.vel, 250)
			},
			explosion: function() {
                if(!this._killed) {
					var ps = this.getAlignedPos(ig.ENTITY_ALIGN.BOTTOM);
					this.effects.sheet.spawnFixed("explosionFire", ps.x, ps.y, ps.z);
						b = new sc.CircleHitForce(this.combatant, {
							attack: {
								type: "MASSIVE",
								element: "HEAT",
								damageFactor: 10,
								status: 5,
								spFactor: 0,
								hints: ["BOMB", "LASERTOWER"]
							},
							pos: Vec3.createC(ps.x, ps.y, ps.z-48),
							radius: 44,
							zHeight: 96,
							duration: 0.2,
							expandRadius: 96,
							alwaysFull: true,
							party: this.combatant.party,
							centralAngle: 1
						});
					sc.combat.addCombatForce(b);
					this.kill()
				}
			},
            handleMovementTrace: function(a) {
				if(!this._killed && ((a.collided && a!=this.towerEnt) || (this.coll.pos.z + 96 < this.towerEnt.coll.pos.z))) {
					this.explosion()
				}
            },
            ballHit: function(a) {
                return false
            },
            onTouchGround: function(b) {
				this.explosion()
            },
            collideWith: function(a) {
                a.damage && a.party != this.combatant.party ? this.explosion() : a instanceof ig.ENTITY.RegenDestruct && a.ballHit(this) && this.explosion()
            },
            getHitCenter: function(a, b) {
                return this.getOverlapCenterCoords(a, b)
            },
            getHitVel: function(a, b) {
                var e = b || {};
                Vec2.assign(e, this.coll.vel);
                return e
            },
            getElement: function() {
                return sc.ELEMENT.HEAT
            },
            getCombatant: function() {
                return this.combatant
            },
            getCombatantRoot: function() {
                return this.combatant.getCombatantRoot()
            }
        });
        sc.TowerColdGas = ig.AnimatedEntity.extend({
            combatant: null,
			towerEnt: null,
            effects: {
                sheet: new ig.EffectSheet("puzzle.charge-cannon-tower")
            },
            init: function(a, b, e, f) {
                this.parent(a, b, e, f);
                this.coll.type = ig.COLLTYPE.PROJECTILE;
                this.coll.zGravityFactor = 0.2;
                this.coll.setSize(48, 48, 48);
                this.coll.setPadding(4, 4);
                this.coll.friction.air = 0.3;
                this.coll.shadow.size = 40;
                this.coll.setPos(a - this.coll.size.x / 2, b - this.coll.size.y / 2, e);
                this.coll.weight = 2E5;
                this.initAnimations({
					name:"default",
					sheet:{  
						src:"media/entity/effects/lighter-particle.png",
						offX:0,
						offY:96,
						width:48,
						height:48
					},
					renderMode: "lighter",
					time:0.2,
					repeat:true,
					frames:[0]
				});
                this.setCurrentAnim("default");
				this.timer = 0.45;
				this.towerEnt = f.towerEnt || null;
                this.combatant = f.combatant || null;
				this.shoot(f.moveDir)
            },
			shoot: function(a) {
				this.coll.vel.x = a.x;
				this.coll.vel.y = a.y;
				Vec2.length(this.coll.vel, 200)
			},
			explosion: function() {
                if(!this._killed) {
					var ps = this.getAlignedPos(ig.ENTITY_ALIGN.CENTER);
                    this.effects.sheet.spawnFixed("explosionIce", ps.x, ps.y, ps.z, null, {
                        angle: Vec2.clockangle(this.coll.vel)
                    });
						b = new sc.CircleHitForce(this.combatant, {
							attack: {
								type: "MASSIVE",
								element: "COLD",
								damageFactor: 10,
								status: 5,
								spFactor: 0,
								hints: ["STEAM", "LASERTOWER"]
							},
							pos: Vec3.createC(ps.x, ps.y, ps.z-16),
							radius: 8,
							zHeight: 32,
							duration: 0.3,
							expandRadius: 138,
							alwaysFull: true,
							party: this.combatant.party,
                            centralAngle: 0.3,
                            dir: ig.copy(this.coll.vel)
						});
					sc.combat.addCombatForce(b);
					this.kill()
				}
			},
            handleMovementTrace: function(a) {
				if(!this._killed && a.collided && a!=this.towerEnt) {
					this.explosion()
				}
            },
			update: function() {
                    if(this.timer >
                        0) {
                        this.timer = this.timer - ig.system.tick;
                        if(this.timer <= 0) {
                            this.timer = 0;
                            this.explosion()
                        }
                    }
					this.parent()
			},
            ballHit: function(a) {
                return false
            },
            onTouchGround: function(b) {
				this.explosion()
            },
            collideWith: function(a) {
                a.damage && a.party != this.combatant.party ? this.explosion() : a instanceof ig.ENTITY.RegenDestruct && a.ballHit(this) && this.explosion()
            },
            getHitCenter: function(a, b) {
                return this.getOverlapCenterCoords(a, b)
            },
            getHitVel: function(a, b) {
                var e = b || {};
                Vec2.assign(e, this.coll.vel);
                return e
            },
            getElement: function() {
                return sc.ELEMENT.COLD
            },
            getCombatant: function() {
                return this.combatant
            },
            getCombatantRoot: function() {
                return this.combatant.getCombatantRoot()
            }
        });
        sc.TowerWaveBeam = ig.AnimatedEntity.extend({
            combatant: null,
			towerEnt: null,
			tc: {},
			laserStart: null,
            effects: {
                sheet: new ig.EffectSheet("puzzle.charge-cannon-tower")
            },
            init: function(a, b, e, f) {
                this.parent(a, b, e, f);
                this.coll.type = ig.COLLTYPE.PROJECTILE;
                this.coll.zGravityFactor = 0;
                this.coll.setSize(48, 48, 48);
                this.coll.setPadding(4, 4);
                this.coll.friction.air = 0;
                this.coll.shadow.size = 0;
                this.coll.setPos(a - this.coll.size.x / 2, b - this.coll.size.y / 2, e);
                this.coll.weight = 2E5;
				this.timer = 1;
				this.towerEnt = f.towerEnt || null;
                this.combatant = f.combatant || null;
                this.party = f.combatant.party || null;
				this.shoot(f.moveDir)
            },
			shoot: function(a) {
				this.laserStart = ig.game.spawnEntity(sc.TowerWaveBeamSrc, this.getCenter().x, this.getCenter().y, this.coll.pos.z, {combatant: this.combatant});
				this.coll.vel.x = a.x;
				this.coll.vel.y = a.y;
				var c = Vec2.create(),
				z = [],
				tgp = Vec2.create(),
				resp = Vec2.create(),
				tr = ig.game.physics.initTraceResult(this.tc),
				boffset = {
					x: 0,
					y: 0,
					z: 0
				},
				boffset2 = {
					x: 0,
					y: 0,
					z: 0
				};
				Vec2.assign(c, ig.copy(this.coll.vel));
                Vec2.length(c, 2000);
				ig.game.trace(tr, this.coll.pos.x + this.coll.size.x / 2, this.coll.pos.y + this.coll.size.y / 2, this.coll.pos.z, c.x, c.y, 0, 0, this.coll.size.z, ig.COLLTYPE.PROJECTILE, null, z);
                tgp = Vec2.add(tgp, this.coll.pos);
				Vec2.mulF(c, tr.dist);
                Vec2.add(tgp,  c);
				Vec2.assign(resp, tgp);
				this.setPos(resp.x, resp.y, this.coll.z);
                Vec3.assignC(this.coll.vel, 0, 0, 0);
                Vec3.assignC(this.coll.accelDir, 0, 0, 0);
				this.effects.sheet.spawnOnTarget("waveLaser", this.laserStart, {
					align: ig.ENTITY_ALIGN.BOTTOM,
					target2: this,
					target2Align: ig.ENTITY_ALIGN.BOTTOM,
					angle: Vec2.clockangle(a),
					offset: Vec3.length(Vec3.createC(a.x, a.y, 0),56),
					target2Offset: Vec3.length(Vec3.createC(-a.x, -a.y, 0),67.5),
					duration: -1
				});
				this.effects.sheet.spawnOnTarget("waveLaserEnd", this, {
					align: ig.ENTITY_ALIGN.BOTTOM,
					angle: Vec2.clockangle(a),
					offset: Vec3.length(Vec3.createC(-a.x, -a.y, 0),30),
					duration: -1
				});
				this.effects.sheet.spawnOnTarget("waveLaserEnd2", this, {
					align: ig.ENTITY_ALIGN.BOTTOM,
					angle: Vec2.clockangle(a),
					duration: -1
				});
				var b = new sc.BeamHitForce(this.combatant, this, this.laserStart, boffset, boffset2, {
						attack: {
							type: "MASSIVE",
							element: "WAVE",
							damageFactor: 10,
							status: 5,
							spFactor: 0,
							hints: ["COMPRESSED", "LASERTOWER"]
						},
						width: 32,
						hitDir: "AWAY",
						duration: 1,
						repeat: false,
						party: this.combatant.party
					});
				sc.combat.addCombatForce(b)
			},
			update: function() {
                    if(this.timer >
                        0) {
                        this.timer = this.timer - ig.system.tick;
                        if(this.timer <= 0) {
                            this.timer = 0;
                            this.kill()
                        }
                    }
					this.parent()
			},
			kill: function(a) {
				this.laserStart.kill();
				this.parent(a)
			},
            ballHit: function(a) {
                return false
            },
            getHitCenter: function(a, b) {
                return this.getOverlapCenterCoords(a, b)
            },
            getHitVel: function(a, b) {
                var e = b || {};
                Vec2.assign(e, this.coll.vel);
                return e
            },
            getElement: function() {
                return sc.ELEMENT.WAVE
            },
            getCombatant: function() {
                return this.combatant
            },
            getCombatantRoot: function() {
                return this.combatant.getCombatantRoot()
            }
        });
        sc.TowerWaveBeamSrc = ig.AnimatedEntity.extend({
            combatant: null,
			party: null,
            init: function(a, b, e, f) {
                this.parent(a, b, e, f);
                this.coll.type = ig.COLLTYPE.PROJECTILE;
                this.coll.zGravityFactor = 0;
                this.coll.setSize(48, 48, 48);
                this.coll.setPadding(4, 4);
                this.coll.setPos(a - this.coll.size.x / 2, b - this.coll.size.y / 2, e);
                this.coll.friction.air = 0;
                this.coll.shadow.size = 0;
                this.initAnimations({
					name:"default",
					sheet:{  
						src:"media/entity/effects/lighter-particle.png",
						offX:0,
						offY:192,
						width:48,
						height:48
					},
					renderMode: "lighter",
					time:0.2,
					repeat:true,
					frames:[0]
				});
                this.coll.weight = 2E5
            }
        })
    });
ig.module("game.feature.puzzle.entities.laser-turret")
	.requires("impact.base.entity", "impact.base.actor-entity", "impact.feature.effect.effect-sheet")
	.defines(function() {
		var b = Vec2.create(),
			a = Vec2.create(),
			d = Vec2.create(),
			c = Vec2.create(),
			e = Vec2.create(),
			f = Vec3.create(),
			g = [0, 3, 6, 10],
			LE = {
				0: "Neutral",
				1: "Heat",
				2: "Cold",
				3: "Shock",
				4: "Wave"
			},
			EL = {
				"Neutral": 0,
				"Heat": 1,
				"Cold": 2,
				"Shock":3,
				"Wave": 4
			},
			ccc = Vec2.create();
		ig.ENTITY.LaserTurret = ig.AnimatedEntity.extend({
			dir: 0,
			face: Vec2.create(),
			laserEntity: null,
			_wm: new ig.Config({
				spawnable: true,
				attributes: {
					dir: {
						_type: "Face",
						_info: "Direction to face",
						_select: ig.ActorEntity.FACE4
					}
				}
			}),
			effects: {
				sheet: new ig.EffectSheet("puzzle.compressor"),
				hideHandle: null
			},
			sounds: {
				charge: new ig.Sound("media/sound/puzzle/wave-charge.ogg", 0.5, 0)
			},
			init: function(a,
				b, c, d) {
				this.parent(a, b, c, d);
				this.coll.type = ig.COLLTYPE.VIRTUAL;
				this.coll.setSize(64, 16, 16);
				this.coll.zGravityFactor = 1E3;
				this.dir = ig.ActorEntity.FACE4[d.dir] ||
					1;
				ig.ActorEntity.getFaceVec(this.dir, this.face);
				this.initAnimations({
					DOCTYPE: "MULTI_DIR_ANIMATION",
					shapeType: "Y_FLAT",
					wallY: 1,
					SUB: [{
						dirs: 6,
						flipX: [0, 0, 0, 1, 1, 1],
						tileOffsets: [0, 0, 0, 0, 0, 0],
							sheet: {
								src: "media/entity/objects/laser-puzzle.png",
								width: 64,
								height: 32,
								xCount: 2,
								offX: 64,
								offY: 128
							},
							SUB: [{
								name: "off",
								time: 1,
								frames: [0],
								repeat: false
							}, {
								name: "on",
								time: 0.02,
								frames: [1, 0],
								repeat: true
							}]
						}
					]
				});
				this.setCurrentAnim("off");
				this.shooting = false
			},
			show: function(a) {
				this.parent(a);
				if(this.effects.hideHandle) {
					this.effects.hideHandle.stop();
					this.effects.hideHandle = null
				}
				if(!a) {
					this.animState.alpha = 0;
					ig.game.effects.teleport.spawnOnTarget("showFast", this, {})
				}
			},
			onHideRequest: function() {
				this.effects.hideHandle = ig.game.effects.teleport.spawnOnTarget("hideFast", this, {
					callback: this
				})
			},
			onEffectEvent: function(a) {
				if(a == this.effects.hideHandle && a.isDone()) {
					this.effects.hideHandle = null;
					this.hide()
				}
			},
			createLaser: function() {
				if(this.dir == 1) {
					var a = this.getCenter();this.laserEntity = ig.game.spawnEntity(sc.LaserPuzzleEntity, a.x + 24, a.y, this.coll.pos.z + 13.5, {});
					this.laserEntity.shoot(Vec2.createC(1,0))
				}
				else {
					var a = this.getCenter();this.laserEntity = ig.game.spawnEntity(sc.LaserPuzzleEntity, a.x - 24, a.y, this.coll.pos.z + 13.5, {});
					this.laserEntity.shoot(Vec2.createC(-1,0))
				}
			},
			update: function() {
				if(ig.vars.get("map.laserPuzzleShoot")) this.shooting=true;
				else this.shooting=false;
				if(this.shooting) {
					this.setCurrentAnim("on");
					if(this.laserEntity == null) this.createLaser();
				}
				else {
					this.setCurrentAnim("off")
					if(this.laserEntity) {
						this.laserEntity.destroy();
						this.laserEntity = null
					}
				}
			}
		});
		var i = {};
		sc.LaserPuzzleEntity = ig.AnimatedEntity.extend({
			collisionList: [],
			collReleaseTimer: 0,
			collReleaseTimeList: [],
			phaseMode: false,
			stillPhase: false,
			phaseTraveled: 0,
			phaseModeSmaller: false,
			trailEntities: [],
			trailCurrent: null,
			stopEntity: {
				entity: null,
				pos: Vec3.create()
			},
			enterWall: {
				timer: 0,
				dir: Vec2.create()
			},
			laserStopped: false,
			init: function(a, b, c, e) {
				this.parent(a, b, c, e);
				this.coll.type = ig.COLLTYPE.PROJECTILE;
				this.coll.setSize(8, 8, 8);
				this.element = "Neutral";
				this.trailEntities.push(ig.game.spawnEntity(sc.LaserPuzzleTrail, this.coll.pos.x, this.coll.pos.y, this.coll.pos.z, {}));
				this.trailCurrent = ig.game.spawnEntity(sc.LaserPuzzleTrail, this.coll.pos.x, this.coll.pos.y, this.coll.pos.z, {});
				this.trailCurrent.spawnEffect(this.trailEntities[0], this.element);
				this.coll.pos.x = this.coll.pos.x - this.coll.size.x / 2;
				this.coll.pos.y = this.coll.pos.y - this.coll.size.y / 2;
				this.coll.zGravityFactor = 0;
				this.coll.accelSpeed =
					0;
				this.coll.friction.air = 0;
				this.coll.friction.ground = 0;
				this.coll.bounciness = 1
			},
			destroy: function() {
				this.trailEntities.push(this.trailCurrent);
				for(var delT = this.trailEntities, delA = delT.length; delA--;){
					delT[delA].destroy();
				}
				this.kill()
			},
			update: function() {
				if(this.stopEntity.entity){
					var lockPos = this.stopEntity.entity.getCenter(d);
					Vec2.add(lockPos, this.stopEntity.pos);
					this.coll.setPos(lockPos.x, lockPos.y);
				}
				if(this.trailCurrent){
					this.trailCurrent.setPos(this.coll.pos.x, this.coll.pos.y, this.coll.pos.z);
				}
				this.collReleaseTimer = this.collReleaseTimer + ig.system.tick;
				if(this.collReleaseTimeList.length > 0 && this.collReleaseTimeList[0] <= this.collReleaseTimer) {
					this.collisionList.shift();
					this.collReleaseTimeList.shift()
				}
				var a = this.getCenter(b);
				(a.x <= -64 || a.x >= ig.game.size.x+64 || a.y <= -64 || a.y >= ig.game.size.y+64) && this.laserStop();
				if(this.enterWall.timer) {
					this.enterWall.timer = this.enterWall.timer - ig.system.tick;
					if(this.enterWall.timer <= 0) {
						this.enterWall.timer = 0;
						Vec2.assign(this.coll.vel, this.enterWall.dir);
						Vec2.length(this.coll.vel, 1500)
					}
				}
				if(this.phaseMode && !this.enterWall.timer) {
					this.wallKillTimer = this.wallKillTimer + ig.system.tick;
					if(this.phaseTraveled >
						4) {
						if(!ig.game.isAreaBlocked(a.x - 8, a.y - 8, this.coll.pos.z, 16, 16, this.coll.size.z, true)) {
							this.phaseModeSmaller = this.phaseMode = false;
							var a = this.coll,
								c = this.getCenter(b);
							c.x = c.x - a.vel.x * this.coll.size.x / 2.05;
							c.y = c.y - a.vel.y * this.coll.size.y / 2.05;
							this.coll.setType(ig.COLLTYPE.PROJECTILE)
						}
					} else this.phaseTraveled = this.phaseTraveled + ig.system.tick * 200
				} else this.wallKillTimer = 0;
				this.parent()
			},
			collideWith: function(a) {
				if(this.collisionList.indexOf(a) == -1){
					if(a.damage) {
						if(a instanceof ig.ENTITY.Combatant) {
							this.collisionList.push(a);
							this.collReleaseTimeList.push(this.collReleaseTimer + 0.5);
							//(a.coll.type == ig.COLLTYPE.BLOCK || a.coll.type == ig.COLLTYPE.FENCE) && this.destroy()
						}
					} else if(a.ballHit && a.ballHit(this)) {
						this.onBallHit && this.onBallHit(a);
						if(!this._killed) {
							this.collisionList.push(a);
							this.collReleaseTimeList.push(this.collReleaseTimer + 0.5)
						}
					} else {
						this.collideLaser(a)
					}
				}
			},
			collideLaser: function(a) {//엔티티와 반응
				if(!this.stopEntity.entity && !this.laserStopped){
					var fff = this.coll._collData,
						fbd = fff.blockDir;
					if(a instanceof ig.ENTITY.SlidingBlockLaser){
						this.stopEntity.entity = a;
						Vec2.assign(this.stopEntity.pos, Vec2.sub(this.coll.pos, a.getCenter(d)));
						if(this.element=="Cold"){
							a.move(fbd);
						}else if(this.element=="Shock"){
							a.move(Vec2.flip(fbd));
						}
					}else if(a instanceof ig.ENTITY.ChargeCannonTower){
						this.stopEntity.entity = a;
						Vec2.assign(this.stopEntity.pos, Vec2.sub(this.coll.pos, a.getCenter(d)));
						a.charge(EL[this.element], Arcane.getCenter(this));
					}else{
						if(a instanceof ig.ENTITY.RotateBlockerLaser && fff && fff.collided){
							if(this.element=="Wave"){
								this.stillPhase = true;
							}
							if(a.blockElement!=0){
								this.element = LE[a.blockElement];
							}
						}
						if(fff && fff.collided && !this.phaseMode && this.isAlignCenter(a)) {
							var g = ig.CollTools.getDistVec2(a.coll, this.coll, b),
								h = Vec2.assign(a, fff.blockDir);
							this.setLaserTrail();
							Vec2.mulF(h, Vec2.dot(g, fff.blockDir));
							fff = a.getCenter(d);
							Vec2.add(fff, h);
							Vec2.subC(fff, this.coll.size.x / 2, this.coll.size.y / 2);
							this.coll.setPos(fff.x,
								fff.y);
							this.coll._collData.skipPhysics = false
						}
					}
				}
			},
			isAlignCenter: function(a) {
				return a instanceof ig.ENTITY.RotateBlockerLaser || a instanceof ig.ENTITY.OneTimeSwitch && a.switchType == "waveSwitch" ? true : false
			},
			handleMovementTrace: function(a) {//벽 포함 반응
				if(!this._killed && !this.phaseMode && a.collided && !this.stopEntity.entity && !this.laserStopped) {
					this.setLaserTrail();
					this.enterWall.timer = 0.1;
					var c = ig.game.physics.initTraceResult(i),
						d = this.coll,
						e = Vec2.assign(b, d.vel);
					if(this.element=="Wave" || this.stillPhase) {
						this.stillPhase = false;
						Vec2.length(e, this.coll.size.x + ig.system.tick * 2);
						a = ig.game.trace(c, d.pos.x + d.size.x / 2 - 1, d.pos.y + d.size.y / 2 - 1, d.pos.z, e.x, e.y, 2, 2, d.size.z,
							ig.COLLTYPE.PROJECTILE) ? c.dir : a.blockDir;
						Vec2.assign(this.enterWall.dir, a);
						Vec2.assignC(d.vel, 0, 0);
						d = this.getCenter(b);
						d.x = d.x + a.x * this.coll.size.x / 2.05;
						d.y = d.y + a.y * this.coll.size.y / 2.05;
						this.coll.setType(ig.COLLTYPE.TRIGGER);
						this.phaseMode = true;
						this.phaseTraveled = 0;
					}else{
						if(Math.abs(d.vel.y) + Math.abs(d.vel.x) > 0.1) {
							if(Vec2.angle(d.vel, a.blockDir) < 0.1) {
								this.laserStop();
							}else{
								var bw = d.vel.x * a.blockDir.x + d.vel.y * a.blockDir.y;
								Vec2.assignC(this.enterWall.dir, d.vel.x - 2 * bw * a.blockDir.x, d.vel.y - 2 * bw * a.blockDir.y);
								Vec2.assignC(d.vel, 0, 0)
							}
						}
					}
				}
			},
			getHitCenter: function(a, b) {
				return this.getOverlapCenterCoords(a, b)
			},
			getHitVel: function(a, b) {
				var c = b || {};
				Vec2.assign(c, this.coll.vel);
				Vec2.rotate90CW(c);
				var h = ig.CollTools.getDistVec2(this.coll, a.coll, ccc);
				Vec2.addMulF(h, a.coll.vel, -ig.system.tick);
				Vec2.dot(h, c) < 0 && Vec2.flip(c)
				return c
			},
			getElement: function() {
				return this.element
			},
			getCombatant: function() {
				return this.combatant
			},
			shoot: function(a) {
				this.coll.vel.x = a.x;
				this.coll.vel.y = a.y;
				Vec2.length(this.coll.vel, 1500)
			},
			setLaserTrail: function() {
				this.trailCurrent.setPos(this.coll.pos.x, this.coll.pos.y, this.coll.pos.z);
				this.trailEntities.push(this.trailCurrent);
				this.trailCurrent = ig.game.spawnEntity(sc.LaserPuzzleTrail, this.coll.pos.x, this.coll.pos.y, this.coll.pos.z);
				this.trailCurrent.spawnEffect(this.trailEntities[this.trailEntities.length-1], this.element)
			},
			ballHit: function(a) {
				if(a.attackInfo && a.attackInfo.hasHint("ANTI_COMPRESSOR")) {
					var b = "suck" + (this.element == sc.ELEMENT.SHOCK ? "Shock" : "Wave"),
						c = this.getAlignedPos(ig.ENTITY_ALIGN.CENTER);
					this.effects.sheet.spawnOnTarget(b,
						a.getCombatant(), {
							target2Point: c
						});
					this.laserStop();
					return true
				}
				return false
			},
			laserStop: function() {
				Vec2.length(this.coll.vel, 0);
				this.laserStopped = true;
			}
		});
		sc.LaserPuzzleTrail = ig.AnimatedEntity.extend({
			targetEnt: null,
			element: 0,
			effects: {
				sheet: new ig.EffectSheet("puzzle.rotate-blocker-laser"),
				perma: null,
				trail: null
			},
			init: function(a, b, c, e) {
				this.parent(a, b, c, e);
				this.coll.type = ig.COLLTYPE.TRIGGER;
				this.coll.setSize(8, 8, 8);
				this.coll.pos.x = this.coll.pos.x - this.coll.size.x / 2;
				this.coll.pos.y = this.coll.pos.y - this.coll.size.y / 2;
				this.coll.zGravityFactor = 0;
				this.coll.accelSpeed =
					0;
				this.coll.friction.air = 0;
				this.coll.friction.ground = 0;
				this.coll.bounciness = 1
			},
			spawnEffect: function(a, b) {
				this.effects.perma = this.effects.sheet.spawnOnTarget("laser"+b, this, {duration: -1, target2: a});
				this.targetEnt = a;
				this.element = b
			},
			update: function() {
				if(this.targetEnt){
					var g = Arcane.getCenter(this), 
					h = Arcane.getCenter(this.targetEnt);
					for(var a = ig.game.entities, c = a.length; c--;) {
						var dr = Arcane.posLineToPoint(g, h, Arcane.getCenter(a[c]));
						if(a[c] instanceof ig.ENTITY.Combatant && Arcane.getEntityInPos(a[c], dr, 4)){
							sc.combat.showHitEffect(a[c], a[c].getAlignedPos(ig.ENTITY_ALIGN.CENTER), sc.ATTACK_TYPE.HEAVY, EL[this.element], false, false, true);
							a[c].cancelAction();
							var tpos = Vec3.create(Arcane.getCenter(a[c])),
								knd = Vec3.normalize(Vec3.sub(tpos, dr)),
								e = a[c].hasStun() ? "LIGHT" : "MEDIUM",
								e = a[c].doDamageMovement(knd, e, false, false);
							a[c].coll.vel.z = 100;
							a[c].damageTimer = Math.max(a[c].damageTimer, e)
						}
					}
				}
			},
			destroy: function() {
				this.kill()
			}
		});
	});