ig.module("game.feature.combat.laser-combat-action-steps").requires("game.feature.combat.combat-action-steps").defines(function() {
	var n = {
		PROXY_OWNER: function(a) {
			return a.getCombatantRoot()
		},
		PROXY_SRC: function(a) {
			return a.sourceEntity
		},
		TARGET: function(a) {
			return a.getTarget()
		}
	};
	ig.ACTION_STEP.BEAM_ATTACK = ig.ActionStepBase.extend({
		beamHitSettings: null,
		attack: null,
		selectType: false,
		effect: null,
		offset: {
			x: 0,
			y: 0,
			z: 0
		},
		offset2: {
			x: 0,
			y: 0,
			z: 0
		},
		_wm: new ig.Config({
			attributes: {
				offset: {
					_type: "Offset",
					_info: "Offset relative to entity ground center from where to start trace",
					_optional: true
				},
				offset2: {
					_type: "Offset",
					_info: "Offset relative to entity ground center from where to end trace",
					_optional: true
				},
				selectType: {
					_type: "String",
					_info: "What entities to be laser end point",
					_select: n
				},
				width: {
					_type: "Number",
					_info: "Width of beam attack"
				},
				attack: {
					_type: "AttackInfo",
					_info: "Attack Info of circle attack"
				},
				effect: {
					_type: "Effect",
					_info: "Effect to play on each burst",
					_optional: true
				},
				hitDir: {
					_type: "String",
					_info: "Direct Hit direction",
					_select: sc.DIRECT_HIT_DIR
				},
				repeat: {
					_type: "Boolean",
					_info: "If true, repeat proxy spawning until ended by force (action end or call STOP_REPEATING_FORCE)"
				},
				duration: {
					_type: "Number",
					_info: "Duration of circle sweep"
				}
			}
		}),
		init: function(a) {
			this.selectType = n[a.selectType] || n.TARGET;
			this.offset = a.offset || this.offset;
			this.offset2 = a.offset2 || this.offset2;
			this.beamHitSettings = a;
			if(a.effect) this.effect = new ig.EffectHandle(a.effect)
		},
		clearCached: function() {
			this.effect && this.effect.clearCached()
		},
		start: function(a) {
			var edp = this.selectType(a);
			if(edp) {
				var c = new sc.BeamHitForce(a, a, edp, this.offset, this.offset2, this.beamHitSettings, this.effect);
				sc.combat.addCombatForce(c);
				c.duration > 0 && a.addActionAttached(c)
			}
		}
	})
});

ig.module("game.feature.combat.combat-force.beam-attack").requires("impact.base.entity").defines(function() {
	var b = Vec3.create(),
		a = Vec2.create(),
		d = Vec2.create(),
		c = Vec2.create(),
		e = Vec2.create(),
		f = Vec3.create();
	sc.BeamHitForce = sc.CombatForce.extend({
		attackInfo: null,
		hitDir: null,
		width: 0,
		effect: null,
		victim: null,
		duration: 0,
		timer: 0,
		party: 0,
		beamOffset: {
			x: 0,
			y: 0,
			z: 0
		},
		beamOffset2: {
			x: 0,
			y: 0,
			z: 0
		},
		hitEntities: null,
		init: function(a, b, c, bp, cp, d, e) {
			this.parent(a);
			this.party = sc.COMBATANT_PARTY[a.party] || this.combatant.party;
			this.attackInfo = new sc.AttackInfo(this.combatantRoot.params, d.attack);
			this.hitDir = sc.DIRECT_HIT_DIR[d.hitDir || "AWAY"];
			this.beamOffset = bp;
			this.beamOffset2 = cp;
			this.width = d.width;
			this.duration = d.duration || 0;
			this.repeat = d.repeat || false;
			this.timer = this.duration;
			this.effect = e;
			this.startPoint = b;
			this.endPoint = c;
			this.hitEntities = []
		},
		update: function() {
			this.timer = this.timer - this.combatant.coll.getTick(true);
			var a = this.duration ? 1 - (this.timer / this.duration).limit(0, 1) : 1,
			pty = this.party,
			stp = Arcane.getCenter(this.startPoint),
			edp = Arcane.getCenter(this.endPoint);
			Vec3.add(stp, this.beamOffset);
			Vec3.add(edp, this.beamOffset2);
				for(var a = ig.game.entities, c = a.length; c--;) {
					var dr = Arcane.posLineToPoint(stp, edp, Arcane.getCenter(a[c]));
					if(Arcane.getEntityInPos(a[c], dr, this.width)){
						var tgt = a[c],
							f = null;
						if(tgt.coll.parentColl &&
						tgt.coll.parentGroup) {
							f = tgt.coll.parentColl.entity.uid + tgt.coll.parentGroup;
							if(this.hitEntities.indexOf(f) != -1) continue
						}
						if(tgt.isCombatant && pty != tgt.party && this.hitEntities.indexOf(tgt) == -1) {
							tgt.damage(this, this.attackInfo);
							this.effect && this.effect.spawnOnTarget(a[c], {align: "CENTER"})
						}else{
							tgt.ballHit && tgt.ballHit(this)
						}
					f ? this.hitEntities.push(f) : this.hitEntities.push(tgt)
					}
				}
			if(this.repeat && this.timer <= 0) {
				this.timer = this.duration;
				this.hitEntities.length = 0
			}
			return this.timer <= 0
		},
		getElement: function() {
			return this.attackInfo && this.attackInfo.element ||
				sc.ELEMENT.NEUTRAL
		},
		getHitCenter: function(a, b) {
			var c = b || Vec2.create(),
			stp = Arcane.getCenter(this.startPoint), 
			edp = Arcane.getCenter(this.endPoint);
			Vec3.add(stp, this.beamOffset);
			Vec3.add(edp, this.beamOffset2);
			var e = Arcane.posLineToPoint(stp, edp, Arcane.getCenter(a));
			a.getAlignedPos(ig.ENTITY_ALIGN.CENTER, c),
			Vec2.assignC(e, e.x, e.y);
			Vec2.assign(d, c);
			Vec2.sub(d, e);
			if(Vec2.length(d) > Vec2.length(e)) {
				Vec2.length(d, f);
				Vec2.assign(c, e);
				Vec2.add(c, d)
			}
			c.z = c.z.limit(stp.z>edp.z?edp.z:stp.z, stp.z>edp.z?stp.z:edp.z);
			return c
		},
		getHitVel: function(a, b) {
			var c = b || Vec2.create(),
			stp = Arcane.getCenter(this.startPoint), 
			edp = Arcane.getCenter(this.endPoint);
			Vec3.add(stp, this.beamOffset);
			Vec3.add(edp, this.beamOffset2);
			var e = Arcane.posLineToPoint(stp, edp, Arcane.getCenter(a));
			Vec2.assignC(e, e.x, e.y);
			a.getCenter(c);
			Vec2.sub(c,e);
			return c
		},
		getHitDir: function(a, b) {
			return this.getHitVel(a, b)
		},
		getCollideSide: function(b) {
			b = this.getHitVel(b, a);
			return Math.abs(b.x) > Math.abs(b.y) ? ig.ActorEntity.FACE4[b.x < 0 ? "EAST" : "WEST"] : ig.ActorEntity.FACE4[b.y < 0 ? "SOUTH" :
				"NORTH"]
		},
		isRepeating: function() {
			return this.repeat
		}
	})
});