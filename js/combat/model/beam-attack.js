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
		_wm: new ig.Config({
			attributes: {
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
			this.beamHitSettings = a;
			if(a.effect) this.effect = new ig.EffectHandle(a.effect)
		},
		clearCached: function() {
			this.effect && this.effect.clearCached()
		},
		start: function(a) {
			var edp = this.selectType(a);
			if(edp) {
				var c = new sc.BeamHitForce(a, edp, this.beamHitSettings, this.effect);
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
		hitEntities: null,
		init: function(a, b, c, d) {
			this.parent(a);
			this.party = sc.COMBATANT_PARTY[b.party] || this.combatant.party;
			this.attackInfo = new sc.AttackInfo(this.combatantRoot.params, c.attack);
			this.hitDir = sc.DIRECT_HIT_DIR[c.hitDir || "AWAY"];
			this.width = c.width;
			this.duration = c.duration || 0;
			this.repeat = c.repeat || false;
			this.timer = this.duration;
			this.effect = d;
			this.startPoint = a;
			this.endPoint = b;
			this.hitEntities = []
		},
		update: function() {
			this.timer = this.timer - this.combatant.coll.getTick(true);
			var a = this.duration ? 1 - (this.timer / this.duration).limit(0, 1) : 1,
			pty = this.party,
			stp = Arcane.getCenter(this.startPoint), 
			edp = Arcane.getCenter(this.endPoint);
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
			edp = Arcane.getCenter(this.endPoint),
			e = Arcane.posLineToPoint(stp, edp, Arcane.getCenter(a));
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
			edp = Arcane.getCenter(this.endPoint),
			e = Arcane.posLineToPoint(stp, edp, Arcane.getCenter(a));
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