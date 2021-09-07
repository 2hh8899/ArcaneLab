ig.module("game.feature.map-content.entities.arcane-lab-custom-elevator").requires(
        "game.feature.map-content.entities.elevator")
    .defines(function() {
    sc.ELEVATOR_TYPE.arcaneLab = {
        size: {
            x: 96,
            y: 64,
            z: 1
        },
        ground: {
            gfx: "media/map/arcane-lab-interior.png",
            x: 416,
            y: 0,
            w: 96,
            h: 101,
            flipX: false,
            offset: {
                x: 0,
                y: 0,
                z: -2
            }
        },
        markerDir: "SOUTH",
        stuckProbility: 0,
        switchEntry: {
            pos: {
                x: 0,
                y: -11,
                z: 1
            },
            size: {
                x: 96,
                y: 16,
                z: 24
            },
            collType: ig.COLLTYPE.FENCE,
            anims: {
                sheet: {
                    src: "media/map/arcane-lab-interior.png",
                    width: 10,
                    height: 19,
                    offX: 406,
                    offY: 0,
                    xCount: 1
                },
                SUB: [{
                    name: "active",
                    time: 1,
                    frames: [0]
                }, {
                    name: "disabled",
                    time: 1,
                    frames: [1]
                }]
            }
        }
    };
});