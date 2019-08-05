document.body.addEventListener('modsLoaded', function () {
	simplify.registerUpdate(function(){
		if(ig.Gui.controlModule){
			ig.vars.set("tmp.detectMouseVec3", Vec3.createC(ig.Gui.controlModule.getMouseX(),ig.Gui.controlModule.getMouseX(),0));
		}else{
			ig.vars.set("tmp.detectMouseVec3", Vec3.createC(ig.input.mouse.x,ig.input.mouse.y,0));
		}
		if(ig.input.pressed("aim")){
			ig.vars.set("tmp.detectMousePress", 1);
		}
		if(ig.input.pressed("melee")){
			ig.vars.set("tmp.detectMeleePress", 1);
		}
		if(ig.input.pressed("special")){
			ig.vars.set("tmp.detectSpecialPress", 1);
		}
	});
});