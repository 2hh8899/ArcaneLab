ig.module("game.feature.combat.model.custom-status").requires(
        "game.feature.combat.model.combat-status",
        "game.feature.player.modifiers")
    .defines(function() {
        sc.MODIFIERS.TOXIC_HAZARD = {
            altSheet: "media/gui/status-gui.png",
            offX: 96,
            offY: 0,
            icon: -1,
            order: 100
        };
        sc.PoisonStatus = sc.COMBAT_STATUS[5] = sc.CombatStatusBase.extend({
            id: 0,
            label: "poison",
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
        sc.STATUS_BAR_ENTRY.POISONED = {
            icon: 0,
            gfx: "media/gui/poison-status.png",
            init: null,
            barY: 0,
            barX: 0,
            half: true
        }

        var aConst = 0.25,
            dConst = 1.5,
            cConst = 3;
        !sc.DAMAGE_MODIFIER_FUNCS && (sc.DAMAGE_MODIFIER_FUNCS = {});
        sc.DAMAGE_MODIFIER_FUNCS.TOXIC_HAZARD = (attackInfo, damageFactor, combatantRoot, shieldResult, hitIgnore, params) => {
            var l = attackInfo.noHack || false,
                r = attackInfo.attackerParams.getStat("focus", l) / params.getStat("focus", l),
                v = (Math.pow(1 + (r >= 1 ? r - 1 : 1 - r) * cConst, aConst) - 1) * dConst;
            r = r >= 1 ? 1 + v : Math.max(0, 1 - v);
            var p = 1,
                q = attackInfo.element;
            q && (p = params.getStat("elemFactor")[q - 1] * params.tmpElemFactor[q - 1]);
            var pppm = r * attackInfo.attackerParams.getModifier("TOXIC_HAZARD") * p;
            if (pppm > 0) pppm = params.statusStates[5].getInflictValue(pppm, params, attackInfo, shieldResult);
            var applyDamageCallback = () => {
                pppm && params.statusStates[5].inflict(pppm, params, attackInfo);
            };
            return { attackInfo, damageFactor, applyDamageCallback }
        };
    });
