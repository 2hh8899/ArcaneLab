var b = function() {
	var a = sc.options.get("text-speed") != void 0 ? sc.options.get("text-speed") : ig.TextBlock.SPEED.FAST;
	if (sc.model.message.autoScript) a = ig.TextBlock.SPEED.SLOW;
	if (ig.system.skipMode) a = ig.TextBlock.SPEED.IMMEDIATE;
	return a
};
ig.MessageOverlayGui.Entry.inject({
	addMessage: function(a, d) {
		var c = this.lookRight ? sc.ArrowBoxGui.POINTER.TOP_LEFT : sc.ArrowBoxGui.POINTER.TOP_RIGHT,
			cTwo = this.lookRight ? sc.ArrowBoxGui.POINTER.TOP_LEFT : sc.ArrowBoxGui.POINTER.TOP_RIGHT,
			e = b();
		if (!ig.system.skipMode && ig.dreamFx.isActive()) e = ig.TextBlock.SPEED.NORMAL;
		c = new sc.MsgBoxGui(a, c, d, e, this, ig.dreamFx.isActive() ? null : this.beepSound);
		c.setAlign(this.lookRight ? ig.GUI_ALIGN.X_LEFT : ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_BOTTOM);
		c.setPos(112, 13);
		
		
		if(ig.vars.get("tmp.msgSimult")>0) {
			for(var ii=0;ii<ig.vars.get("tmp.msgSimult");ii++){
				var ccc = new sc.MsgBoxGui(a, cTwo, d, e, this, null);
				ccc.setAlign(this.lookRight ? ig.GUI_ALIGN.X_LEFT : ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_BOTTOM);
				ccc.setPos(ii*8, ii*5);
				c.addChildGui(ccc);
			}
		}
		
		this.area.clickToContinue = false;
		c.setOnFinish(this.area.onTextFinished.bind(this.area));
		this.addChildGui(c);
		c.doStateTransition("HIDDEN", true);
		c.doStateTransition("DEFAULT");
		if (c.isFinished()) this.area.onTextFinished();
		return c
	}
});