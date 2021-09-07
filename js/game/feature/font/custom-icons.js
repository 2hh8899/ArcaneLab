ig.module("game.feature.font.al-custom-icons")
	.requires("game.feature.font.font-system")
	.defines(function() {
		var smallFontIdx = sc.fontsystem.smallFont.iconSets.length;
		
		sc.fontsystem.smallFont.pushIconSet(new ig.Font("media/font/icons-small-custom.png", 14, ig.MultiFont.ICON_START));
		
		sc.fontsystem.smallFont.setMapping({"poison" :[smallFontIdx, 0]});
		sc.fontsystem.smallFont.setMapping({"susie" :[smallFontIdx, 1]});
		sc.fontsystem.smallFont.setMapping({"susie-hacked" :[smallFontIdx, 2]});
		sc.fontsystem.smallFont.setMapping({"shooty" :[smallFontIdx, 3]});
	});