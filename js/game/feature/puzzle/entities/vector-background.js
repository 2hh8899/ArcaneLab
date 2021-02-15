//Zoom×0.5 Trick

ig.module("game.feature.puzzle.entities.vector-background")
	.requires("impact.base.entity")
	.defines(function() {
		ig.ENTITY.VectorBackground = ig.AnimatedEntity.extend({
			timer: 0,
			_wm: new ig.Config({
				spawnable: true,
				attributes: {}
			}),
			init: function(b, a, d, c) {
				this.parent(b, a, d, c);
				this.coll.type = ig.COLLTYPE.NONE;
				this.coll.setSize(568, 360, 0);
				this.firstPosX = this.coll.pos.x;
				this.movTimer = 0;
				this.accSpeed = 0;
				this.initAnimations({
					sheet: new ig.TileSheet("media/parallax/planet/stars.png", 568, 360),
					SUB: [{
							name: "normal",
							aboveZ: -65535,
							time: 1,
							frames: [0]
						}
					]
				})
			},
			update: function() {
				this.timer = this.timer + ig.system.tick;
				if(new ig.VarCondition("tmp.boss2S").evaluate()) {
					if(this.accSpeed == 1){
						this.accSpeed = 0;
					}else{
						this.accSpeed = Math.max(this.accSpeed -= 0.06, -30);
					}
				}else{
					this.accSpeed = 1;
				}
				this.movTimer = (this.movTimer+this.accSpeed) % 568;
				this.coll.pos.x = this.firstPosX - this.movTimer;
				this.parent()
			}
		})
	});