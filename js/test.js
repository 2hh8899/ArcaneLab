ig.ENTITY.PlayerClone = ig.ENTITY.Player.extend({
    doCombatAction: function(a) {
        this.doPlayerAction(a);
        this.actionBlocked.action = this.actionBlocked.charge = this.actionBlocked.move = this.actionBlocked.reaim = this.actionBlocked.dash = 100;
        sc.gameCode.isEnabled("speedlines") && ig.game.effects.speedlines.spawnOnTarget("speedlinesDash", this, {
            duration: 0.3,
            align: "CENTER"
        })
    },
    showChargeEffect: function(a) {
        this.charging.fx.charge(this.model.currentElementMode, a);
        this.params.notifySpConsume(sc.PLAYER_SP_COST[a - 1]);
    },
    clearCharge: function() {
        if (this.charging.time != -1) {
            this.params.notifySpConsume(0);
            this.charging.time = -1;
            ig.slowMotion.clearNamed("playerCharge", 0);
            this.gui.crosshair.setSpecial(false);
            this.coll.time.animStatic = false;
            this.charging.fx.stop()
        }
    }
})