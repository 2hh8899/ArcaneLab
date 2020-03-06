document.body.addEventListener('modsLoaded', function() {
    simplify.registerUpdate(function() {
        if (ig.game.playerEntity) {
            ig.vars.set("tmp.detectMouseVec3", Vec3.createC(ig.game.playerEntity.getCombatantRoot().gui.crosshair.coll.pos.x, ig.game.playerEntity.getCombatantRoot().gui.crosshair.coll.pos.y + ig.game.playerEntity.coll.pos.z, ig.game.playerEntity.coll.pos.z));
        }
        if (ig.input.pressed("aim")) {
            ig.vars.set("tmp.detectMousePress", 1);
        }
        if (ig.input.pressed("melee")) {
            ig.vars.set("tmp.detectMeleePress", 1);
        }
        if (ig.input.pressed("special")) {
            ig.vars.set("tmp.detectSpecialPress", 1);
        }
    });
});