ig.module("impact.feature.map-content.entities.arcane-lab-custom-entities").requires(
        "impact.feature.map-content.entities.teleport-ground")
    .defines(function() {
        var b = {
            REGULAR: 1,
            INTER_AREA: 2
        };
        ig.ENTITY.NPTeleportGround = ig.ENTITY.TeleportGround.extend({
            init: function(a, d, c, e) {
                this.parent(a, d, c, e);
                this.coll.type = ig.COLLTYPE.NPBLOCK;
            }
        })
    });