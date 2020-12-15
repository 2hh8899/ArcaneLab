ig.module("impact.feature.bgm.bgm-arcane-lab")
  .requires("impact.feature.bgm.bgm")
  .defines(function () {
    ig.merge(ig.BGM_TRACK_LIST, {
      "pre-killing-two-birds": {
        path: "media/bgm/pre-killing-two-birds.ogg",
        loopEnd: 57.313,
        volume: 0.8,
      },
      "mustache-girl": {
        path: "media/bgm/mustache-girl.ogg",
        loopEnd: 147.692,
        volume: 0.8,
      },
      "preliminary-opener": {
        path: "media/bgm/preliminary-opener.ogg",
        loopEnd: 135.005,
        volume: 0.8,
      },
      "arena-al": {
        path: "media/bgm/arena-al.ogg",
        loopEnd: 252,
        volume: 0.7,
      },
      "boss-rush-al": {
        path: "media/bgm/boss-rush-al.ogg",
        loopEnd: 117.333,
        volume: 0.7,
      },
      "arcane-lab": {
        path: "media/bgm/arcane-lab.ogg",
        loopEnd: 178.604,
        volume: 0.7,
      },
      susie: {
        intro: "media/bgm/susie-i.ogg",
        path: "media/bgm/susie.ogg",
        introEnd: 117.6,
        loopEnd: 86.4,
        volume: 0.7,
      },
      "susie-loop": {
        path: "media/bgm/susie.ogg",
        loopEnd: 86.4,
        volume: 0.7,
      },
      eisus: {
        path: "media/bgm/eisus.ogg",
        loopEnd: 96,
        volume: 0.7,
      },
      "breached-beach": {
        path: "media/bgm/breached-beach.ogg",
        loopEnd: 177.78,
        volume: 0.7,
      },
    });

    ig.merge(ig.BGM_DEFAULT_TRACKS, {
      conductor: {
        field: {
          track: "pre-killing-two-birds",
          volume: 1,
        },
        battle: {
          track: "mustache-girl",
          volume: 1,
        },
      },
      arcaneLab: {
        field: {
          track: "arcane-lab",
          volume: 0.7,
        },
        battle: {
          track: "tutorial-battle",
          volume: 1,
        },
		rankBattle: {
			track: "fieldBattle",
			volume: 1
		},
		sRankBattle: {
			track: "s-rank",
			volume: 1
		}
      },
      breachedBeach: {
        field: {
          track: "breached-beach",
          volume: 0.7,
        },
        battle: {
          track: "tutorial-battle",
          volume: 1,
        },
		rankBattle: {
			track: "fieldBattle",
			volume: 1
		},
		sRankBattle: {
			track: "s-rank",
			volume: 1
		}
      }
    });
  });