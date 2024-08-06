ig.module("impact.feature.map-content.entities.image")
	.requires("impact.base.entity")
	.defines(function() {
		ig.ENTITY.Image = ig.AnimatedEntity.extend({
			timer: 0,
			_wm: new ig.Config({
				spawnable: true,
				attributes: {
				image: {
					_type: "String",
					_info: ""
				},
				shapeType: {
					_type: "String",
					_info: ""
				},
				xStart: {
					_type: "Number",
					_info: ""
				},
				yStart: {
					_type: "Number",
					_info: ""
				},
				xSize: {
					_type: "Number",
					_info: ""
				},
				ySize: {
					_type: "Number",
					_info: ""
				}
			}
		}),
		init: function(b, a, d, c) {
			this.parent(b, a, d, c);
			this.coll.type = ig.COLLTYPE.NONE;
			this.coll.setSize(c.xSize, c.ySize, 0);
			this.initAnimations({
				shapeType: ig.ANIM_SHAPE_TYPE[c.shapeType],
				sheet: new ig.TileSheet(c.image, c.xSize, c.ySize, c.xStart, c.yStart),
				SUB: [{
						name: "normal",
						time: 1,
						aboveZ: 100,
						frames: [0]
					}]
				})
			}
		})
	});