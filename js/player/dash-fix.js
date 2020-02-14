ig.ENTITY.Player.inject({
	getMaxDashes: function() {
		return this.model.name == "Shizuka0" ? 3 : sc.newgame.get("dash-1") ? 1 : 3
	}
});