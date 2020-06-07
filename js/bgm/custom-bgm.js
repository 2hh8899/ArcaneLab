ig.module("impact.feature.bgm.bgm-arcane-lab").requires("impact.feature.bgm.bgm").defines(function() {

  ig.merge(ig.BGM_TRACK_LIST, {

    "pre-killing-two-birds": {
      "path": "assets/media/bgm/pre-killing-two-birds.ogg",
      "loopEnd": 57.313,
      "volume": 0.8
  },
  "mustache-girl": {
      "path": "assets/media/bgm/mustache-girl.ogg",
      "loopEnd": 147.692,
      "volume": 0.8
  },
  "susie": {
      "intro": "assets/media/bgm/susie-i.ogg",
      "path": "assets/media/bgm/susie.ogg",
      "introEnd": 117.6,
      "loopEnd": 86.4,
      "volume": 0.8
  },
  "susie-loop": {
      "path": "assets/media/bgm/susie.ogg",
      "loopEnd": 86.4,
      "volume": 0.8
  }
  });

  ig.merge(ig.BGM_DEFAULT_TRACKS, {
    conductor: {
      field: {
          track: "pre-killing-two-birds",
          volume: 1
      },
      battle: {
          track: "mustache-girl",
          volume: 1
      }
  }
  })

});