ig.ENTITY.Player.inject({
	getMaxDashes: function() {
		return this.model.name == "Shizuka0" ? 3 : sc.newgame.get("dash-1") ? 1 : 3
	}
});
var b = {
	"holiday-hat": {
		item: 168,
		autoAdd: false,
		type: "Appearance",
		settings: {
			sheet: "player-skins.xmas",
			fx: "skins.xmas",
			gui: "xmas.png"
		}
	},
	"sparkling-boots": {
		item: 101,
		autoAdd: false,
		type: "StepEffect",
		settings: {
			fx: "skin-step.sparkling-boots"
		}
	},
	"holiday-boots": {
		item: 16,
		autoAdd: false,
		type: "StepEffect",
		settings: {
			fx: "skin-step.holiday-boots"
		}
	},
	"element-aura": {
		item: 519,
		autoAdd: false,
		type: "Aura",
		settings: {
			fx: "skin-aura.element"
		}
	},
	"menacing-aura": {
		item: 520,
		autoAdd: false,
		type: "Aura",
		settings: {
			fx: "skin-aura.menacing"
		}
	},
	"testing-pet": {
		item: 521,
		autoAdd: false,
		type: "Pet",
		settings: {
			animSheet: "pets.loops-cat",
			walkAnims: {
				idle: "idle",
				move: "move"
			},
			actorConfig: {
				maxVel: 60,
				jumpingEnabled: false
			}
		}
	},
	"cat-pet": {
		item: 527,
		autoAdd: false,
		type: "Pet",
		settings: {
			animSheet: "pets.cat",
			walkAnims: {
				idle: "idle",
				move: "move",
				run: "run",
				jump: "jump",
				fall: "fall"
			},
			petSound: {
				path: "media/sound/misc/pet-cat.ogg",
				volume: 0.7
			}
		}
	},
	"penguin-pet": {
		item: 528,
		autoAdd: false,
		type: "Pet",
		settings: {
			animSheet: "pets.penguin",
			walkAnims: {
				idle: "idle",
				move: "move",
				run: "run",
				jump: "jump",
				fall: "fall"
			},
			petSound: {
				path: "media/sound/misc/pet-penguin.ogg",
				volume: 0.7
			}
		}
	},
	"fox-pet": {
		item: 529,
		autoAdd: false,
		type: "Pet",
		settings: {
			animSheet: "pets.tank",
			petOffsets: [{
				x: 0,
				y: -7
			}, {
				x: 16,
				y: 2
			}, {
				x: -16,
				y: 2
			}, {
				x: 0,
				y: 7
			}],
			walkAnims: {
				idle: "idle",
				move: "move",
				run: "run",
				jump: "jump",
				fall: "fall"
			},
			petSound: {
				path: "media/sound/misc/pet-tank.ogg",
				volume: 0.7
			}
		}
	},
	shiba: {
		item: 534,
		autoAdd: false,
		type: "Pet",
		settings: {
			animSheet: "pets.shiba",
			petOffsets: [{
				x: 0,
				y: -11
			}, {
				x: 16,
				y: -2
			}, {
				x: -16,
				y: -2
			}, {
				x: 0,
				y: 7
			}],
			walkAnims: {
				idle: "idle",
				move: "move",
				run: "run",
				jump: "jump",
				fall: "fall"
			},
			petSound: {
				path: "media/sound/misc/pet-dog.ogg",
				volume: 0.7
			}
		}
	},
	"dino-pet": {
		item: 537,
		autoAdd: false,
		type: "Pet",
		settings: {
			animSheet: "pets.dino",
			petOffsets: [{
				x: 0,
				y: -11
			}, {
				x: 20,
				y: -2
			}, {
				x: -20,
				y: -2
			}, {
				x: 0,
				y: 7
			}],
			walkAnims: {
				idle: "idle",
				move: "move",
				run: "run",
				jump: "jump",
				fall: "fall"
			},
			petSound: {
				path: "media/sound/misc/pet-rex.ogg",
				volume: 0.9
			}
		}
	},
	"reaper-pet": {
		item: 538,
		autoAdd: false,
		type: "Pet",
		settings: {
			animSheet: "pets.reaper",
			petOffsets: [{
				x: 0,
				y: -11
			}, {
				x: 16,
				y: -2
			}, {
				x: -16,
				y: -2
			}, {
				x: 0,
				y: 7
			}],
			walkAnims: {
				idle: "idle",
				move: "move",
				run: "run",
				jump: "jump",
				fall: "fall"
			},
			actorConfig: {
				floatHeight: 4
			},
			petSound: {
				path: "media/sound/misc/pet-reaper.ogg",
				volume: 0.7
			}
		}
	},
	"dragon-pet": {
		item: 539,
		autoAdd: false,
		type: "Pet",
		settings: {
			animSheet: "pets.dragon",
			petOffsets: [{
				x: 0,
				y: -11
			}, {
				x: 16,
				y: -2
			}, {
				x: -16,
				y: -2
			}, {
				x: 0,
				y: 7
			}],
			walkAnims: {
				idle: "idle",
				move: "move",
				run: "run",
				jump: "jump",
				fall: "fall"
			},
			actorConfig: {
				floatHeight: 8
			}
		}
	},
	"crow-bar": {
		item: 549,
		autoAdd: false,
		type: "Pet",
		settings: {
			animSheet: "pets.crowbar",
			petOffsets: [{
				x: 0,
				y: -11
			}, {
				x: 16,
				y: -2
			}, {
				x: -16,
				y: -2
			}, {
				x: 0,
				y: 7
			}],
			walkAnims: {
				idle: "idle",
				move: "move",
				run: "run",
				jump: "jump",
				fall: "fall"
			}
		}
	},
	"shy-fly": {
		item: 546,
		autoAdd: false,
		type: "Pet",
		settings: {
			animSheet: "pets.shyfly",
			petOffsets: [{
				x: 0,
				y: -11
			}, {
				x: 16,
				y: -2
			}, {
				x: -16,
				y: -2
			}, {
				x: 0,
				y: 7
			}],
			walkAnims: {
				idle: "idle",
				move: "move",
				run: "run",
				jump: "jump",
				fall: "fall"
			},
			actorConfig: {
				floatHeight: 8
			},
			petSound: {
				path: "media/sound/misc/pet-shy-fly.ogg",
				volume: 0.7
			}
		}
	},
	tank: {
		item: 547,
		autoAdd: false,
		type: "Pet",
		settings: {
			animSheet: "pets.tank",
			petOffsets: [{
				x: 0,
				y: -7
			}, {
				x: 16,
				y: 2
			}, {
				x: -16,
				y: 2
			}, {
				x: 0,
				y: 7
			}],
			walkAnims: {
				idle: "idle",
				move: "move",
				run: "run",
				jump: "jump",
				fall: "fall"
			},
			petSound: {
				path: "media/sound/misc/pet-tank.ogg",
				volume: 0.7
			}
		}
	},
	psbot: {
		item: 548,
		autoAdd: false,
		type: "Pet",
		settings: {
			animSheet: "pets.psbot",
			petOffsets: [{
				x: 0,
				y: -11
			}, {
				x: 16,
				y: -2
			}, {
				x: -16,
				y: -2
			}, {
				x: 0,
				y: 7
			}],
			walkAnims: {
				idle: "idle",
				move: "move",
				run: "run",
				jump: "jump",
				fall: "fall"
			},
			petSound: {
				path: "media/sound/misc/pet-roball.ogg",
				volume: 0.7
			}
		}
	}
};
sc.PlayerSkinLibrary.inject({
	init: function() {
		this.parent("PlayerSkins");
		for(var a in b) this.registerSkin(a, b[a]);
		sc.Model.addObserver(sc.model.player, this);
		ig.extensions.addListener(this, "skin")
	},
	registerSkin: function(a, b) {
		this.skins[a] = {
			item: b.item,
			autoAdd: b.autoAdd,
			type: b.type,
			settings: b.settings
		};
		this.itemToSkin[b.item] = a
	}
});

sc.PARTY_OPTIONS.push("Susie");
sc.PARTY_OPTIONS.push("Eisus");