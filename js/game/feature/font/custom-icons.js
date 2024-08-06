ig.module("game.feature.font.al-custom-icons")
	.requires("game.feature.font.font-system")
	.defines(function() {
		var fontIdx = sc.fontsystem.font.iconSets.length,
			smallFontIdx = sc.fontsystem.smallFont.iconSets.length;
		
		sc.fontsystem.font.pushIconSet(new ig.Font("media/font/al-icons-custom.png", 16, ig.MultiFont.ICON_START));
		sc.fontsystem.smallFont.pushIconSet(new ig.Font("media/font/al-icons-small-custom.png", 14, ig.MultiFont.ICON_START));
		
		sc.fontsystem.font.setMapping({"element-base" :[fontIdx, 0]});
		sc.fontsystem.font.setMapping({"hammer" :[fontIdx, 1]});
		sc.fontsystem.font.setMapping({"hammer_grey" :[fontIdx, 2]});
		
		sc.fontsystem.smallFont.setMapping({"poison" :[smallFontIdx, 0]});
		sc.fontsystem.smallFont.setMapping({"susie" :[smallFontIdx, 1]});
		sc.fontsystem.smallFont.setMapping({"susie-hacked" :[smallFontIdx, 2]});
		sc.fontsystem.smallFont.setMapping({"shooty" :[smallFontIdx, 3]});
		sc.fontsystem.smallFont.setMapping({"nevi" :[smallFontIdx, 4]});
		sc.fontsystem.smallFont.setMapping({"riko" :[smallFontIdx, 5]});
		sc.fontsystem.smallFont.setMapping({"ciel" :[smallFontIdx, 6]});
		sc.fontsystem.smallFont.setMapping({"hazel" :[smallFontIdx, 7]});
		sc.fontsystem.smallFont.setMapping({"quadrotect-when" :[smallFontIdx, 8]});
	});