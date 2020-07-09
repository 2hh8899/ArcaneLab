ig.module("impact.feature.bgm.bgm-arcane-lab")
  .requires("impact.feature.bgm.bgm")
  .defines(function () {
    ig.merge(ig.BGM_TRACK_LIST, {
      "pre-killing-two-birds": {
        path: "assets/media/bgm/pre-killing-two-birds.ogg",
        loopEnd: 57.313,
        volume: 0.8,
      },
      "mustache-girl": {
        path: "assets/media/bgm/mustache-girl.ogg",
        loopEnd: 147.692,
        volume: 0.8,
      },
      "preliminary-opener": {
        path: "assets/media/bgm/preliminary-opener.ogg",
        loopEnd: 135.005,
        volume: 0.8,
      },
      susie: {
        intro: "assets/media/bgm/susie-i.ogg",
        path: "assets/media/bgm/susie.ogg",
        introEnd: 117.6,
        loopEnd: 86.4,
        volume: 0.8,
      },
      "susie-loop": {
        path: "assets/media/bgm/susie.ogg",
        loopEnd: 86.4,
        volume: 0.8,
      },
      eisus: {
        path: "assets/media/bgm/eisus.ogg",
        loopEnd: 96,
        volume: 0.8,
      },
      "breached-beach": {
        path: "assets/media/bgm/breached-beach.ogg",
        loopEnd: 177.78,
        volume: 0.8,
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
      "breachedBeach": {
        field: {
          track: "breached-beach",
          volume: 0.7,
        },
        battle: {
          track: "breached-beach",
          volume: 0.8,
        },
      },
    });
  });