ig.module("game.feature.font.al-custom-fonts")
	.requires("impact.base.entity")
	.defines(function() {
		var smallFontIdx = sc.fontsystem.smallFont.iconSets.length;
		sc.fontsystem.smallFont.pushIconSet(new ig.Font("media/font/icons-small-custom.png", 14, ig.MultiFont.ICON_START));
		sc.fontsystem.smallFont.setMapping({"poison" :[smallFontIdx, 0]});
	});