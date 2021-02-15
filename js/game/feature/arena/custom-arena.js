ig.module("game.feature.arena.arcane-lab-arena").requires("game.feature.arena.arena", "impact.feature.arcane-lab-database").defines(function() {
	sc.ArenaAL = sc.Arena.extend({
		init: function() {
			this.parent("Arena");
			var b = ig.arcaneLabDatabase.get("cups")[0];
			for(var c in b) this.registerCup(c, b[c])
		}
		
		
	});
	ig.addGameAddon(function() {
        return sc.arena = new sc.ArenaAL;
    });
});