//Zoom×0.5 Trick

ig.module("game.feature.puzzle.entities.vector-background")
    .requires("impact.base.entity")
    .defines(function() {
        ig.ENTITY.MovingImage = ig.AnimatedEntity.extend({
            tileSheet: new ig.TileSheet("media/parallax/planet/stars.png", 568, 360),
            timer: 0,
            _wm: new ig.Config({
                spawnable: true,
                attributes: {
                    sprite: {
                        _type: "Image",
                        _info: "Path of the sprite to use."
                    },
                    xSize: {
                        _type: "Number",
                        _info: "X Size"
                    },
                    ySize: {
                        _type: "Number",
                        _info: "Y Size"
                    },
                    xMove: {
                        _type: "Number",
                        _info: "X Movememnt"
                    },
                    yMove: {
                        _type: "Number",
                        _info: "Y Movememnt"
                    }
                }
            }),
            init: function(b, a, d, c) {
                this.parent(b, a, d, c);
                this.coll.type = ig.COLLTYPE.NONE;
                this.coll.setSize(568, 360, 0);
                this.firstPosX = this.coll.pos.x;
                this.firstPosY = this.coll.pos.y;
                this.xSize = c.xSize || 0;
                this.ySize = c.ySize || 0;
                this.xMove = c.xMove || 0;
                this.yMove = c.yMove || 0;
                this.sprite = c.sprite || "";
                this.initAnimations({
                    sheet: new ig.TileSheet(this.sprite, this.xSize, this.ySize),
                    SUB: [{
                        name: "normal",
                        aboveZ: -65535,
                        time: 1,
                        frames: [0]
                    }]
                })
            },
            update: function() {
                this.timer = this.timer + ig.system.tick;
                this.coll.pos.x = this.firstPosX - (this.timer * this.xMove) % this.xSize;
                this.coll.pos.y = this.firstPosY - (this.timer * this.yMove) % this.ySize;
                this.parent()
            }
        })
    });