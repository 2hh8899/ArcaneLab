ig.module("game.feature.combat.model.custom-status").requires(
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
        sc.StunStatus = sc.COMBAT_STATUS[4] = sc.CombatStatusBase.extend({
            id: 4,
            label: "daze",
            statusBarEntry: "DAZED",
            offenseModifier: "COND_EFFECT_ALL",
            defenseModifier: "STUN_THRESHOLD",
            maxDuration: 10,
            duration: 10,
            minDuration: 2,
            stunTimer: 0,
            targetFixed: false,
            activate: function(b, a, d) {
                this.charge = 1;
                this.active = true;
                this.duration = (2 * d.damageFactor).limit(this.minDuration, this.maxDuration);
                this.effectiveness = a.getStat("statusEffect")[this.id] * this._getOffensiveFactor(d);
                sc.combat.showCombatantLabel(b, this.getLabel(), 1.5);
                if (this.onActivate) this.onActivate(b);
                this.initEntity(b)
            },
            onActivate: function(b) {
                this.stallAction = new ig.Action("stallAction", [{
                    type: "WAIT_UNTIL",
                    condition: "0",
                    maxTime: this.duration
                }]);
                this.stallAction.hint = "battle";
                this.targetFixed = b instanceof ig.ENTITY.Enemy && b.targetFixed;
                b instanceof ig.ENTITY.Enemy && (b.targetFixed = true);
                this.stunTimer = 0;
            },
            cancelStun: function(b, a) {
                if (this.stunTimer < this.minDuration) {
                    return;
                }
                if (a.fly == "MASSIVE" ||
                    a.fly == "MASSIVE+" ||
                    a.fly == "MASSIVE++" ||
                    a.fly == "MASSIVE+++") {
                    this.charge = 0;
                } else {
                    this.charge -= 0.1 * (a.damageFactor * 0.2).limit(0.25, 1);
                }
            },
            onClear: function(b) {
                b.params.endLock(b);
                b.cancelAction(this.stallAction);
                b instanceof ig.ENTITY.Enemy && (b.targetFixed = this.targetFixed);
            },
            onUpdate: function(b) {
                this.stunTimer = this.stunTimer +
                    ig.system.ingameTick;
                if (!b.currentAction && b.actionAttached.indexOf(b.params) == -1) {
                    b.setAction(this.stallAction);
                    b.params.startLock(b);
                }
            },
            initEntity: function(b) {
                if (this.active) {
                    this.fxHandle && this.fxHandle.stop();
                    b.statusGui && b.statusGui.setStatusEntryStick(this.statusBarEntry, true);
                    this.fxHandle = this.effects.spawnOnTarget(this.label, b, {
                        duration: -1,
                        align: ig.ENTITY_ALIGN.TOP
                    });
                    if (this.onInitEntity) this.onInitEntity(b)
                }
            }
        });
        sc.PoisonStatus = sc.COMBAT_STATUS[5] = sc.CombatStatusBase.extend({
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
                if ((!b.getCombatantRoot()
                        .isPlayer || !sc.model.isCutscene()) && this.poisonTimer > 0.5) {
                    var d = Math.floor(a.getStat("hp") * (0.3 / (this.duration / 0.5)) * this.getEffectiveness(a));
                    b.instantDamage(d, 0.5);
                    this.effects.spawnOnTarget("burnDamage", b);
                    this.poisonTimer = 0
                }
            }
        });
        sc.STATUS_BAR_ENTRY.DAZED = {
            icon: 0,
            isStun: true,
            init: null,
            barY: 0,
            barX: 0,
            half: true
        }
        sc.STATUS_BAR_ENTRY.POISONED = {
            icon: 0,
            isPoison: true,
            init: null,
            barY: 0,
            barX: 0,
            half: true
        }
        ig.GUI.StatusBar.inject({
            stunGfx: new ig.Image("media/gui/stun-status-for-mix-with-autumn-genesis.png"),
            poisonGfx: new ig.Image("media/gui/poison-status.png"),
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
                if (f.isStun) {
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
                } else if (f.isPoison) {
                    if (g.stick) b.addGfx(this.poisonGfx, c - 6, e - 2, 24, 0, 8, 8);
                    else {
                        if (g.timer > 1.7) var l =
                            Math.sin(Math.PI * 8 * (2 - g.timer) / 0.3),
                            c = c + l;
                        g = 1 + Math.floor(g.value * (i - 2));
                        l = i - 1 - g;
                        c = c + j;
                        b.addGfx(this.poisonGfx, c, e, f.barX, f.barY, g, 4);
                        l && b.addGfx(this.gfx, c + g, e, 216 + g, 12, l, 4);
                        b.addGfx(this.poisonGfx, c + (i - 1), e - 2, 25, 0, 7, 8)
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
                for (b = 0; b < 6; ++b) this.statusStates[b] = new sc.COMBAT_STATUS[b]
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
                var v = (Math.pow(1 + (r >= 1 ? r - 1 : 1 - r) * cConst, aConst) - 1) * dConst;
                var v = (Math.pow(1 + (r >= 1 ? r - 1 : 1 - r) * cConst, aConst) - 1) * dConst;
                r = r >= 1 ? 1 + v : Math.max(0, 1 - v);
                var pppm = r * e.attackerParams.getModifier("TOXIC_HAZARD") * p;
                if (pppm > 0) pppm = this.statusStates[5].getInflictValue(pppm, this, e, i);
                if (e.statusInflict && g > 0 && !j) {
                    var j = e.element - 1,
                        m = h * e.statusInflict;
                    if (j >= 0) {
                        m = m * r * this.getStat("statusInflict")[j] * this.tmpStatusInflict[j] * p;
                        m = this.statusStates[j].getInflictValue(m, this, e, i);
                    } else {
                        m = m * r * p;
                        m = this.statusStates[4].getInflictValue(m, this, e, i);
                    }
                }
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
                a.status2 && this.statusStates[5].inflict(a.status2, this, b);
                this.reduceHp(a.damage);
                a.status && this.statusStates[!!b.element ? b.element - 1 : 4].inflict(a.status, this, b);
                this.reduceHp(a.damage)
            }
        });
    });