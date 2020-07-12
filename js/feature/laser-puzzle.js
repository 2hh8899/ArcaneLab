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
					}else{
						if(a instanceof ig.ENTITY.RotateBlockerLaser){
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
					var g = this.coll.pos, 
					h = this.targetEnt.coll.pos;
					if(g.z == h.z){
						for(var a = ig.game.entities, c = a.length; c--;) {
							var dr = this.distanceLineToPoint(g, h, a[c].coll.pos);
							if(a[c] instanceof ig.ENTITY.Combatant && Vec2.distance(a[c].coll.pos, dr) < 8 && Math.abs(a[c].coll.pos.z-g.z) < 16){
								sc.combat.showHitEffect(a[c], a[c].getAlignedPos(ig.ENTITY_ALIGN.CENTER), sc.ATTACK_TYPE.HEAVY, EL[this.element], false, false, true);
								a[c].cancelAction();
								var tpos = Vec2.create(a[c].coll.pos),
									knd = Vec2.normalize(Vec2.sub(tpos, dr)),
									e = a[c].hasStun() ? "LIGHT" : "MEDIUM",
									e = a[c].doDamageMovement(knd, e, false, false);
								a[c].coll.vel.z = 100;
								a[c].damageTimer = Math.max(a[c].damageTimer, e)
							}
						}
					}
				}
			},
			distanceLineToPoint: function(a, b, c){
				var	f = (((c.x - a.x) * (b.x - a.x) + (c.y - a.y) * (b.y - a.y)) / Vec2.squareDistance(a, b)).limit(0, 1);
				i.x = a.x + f * (b.x - a.x);
				i.y = a.y + f * (b.y - a.y);
				return Vec2.createC(i.x, i.y);
			},
			destroy: function() {
				this.kill()
			}
		});
	});