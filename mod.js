ig.module("impact.feature.base.action-steps.give-item").requires("impact.feature.base.action-steps").defines(function() {
	ig.ACTION_STEP.GIVE_ITEM = ig.ActionStepBase.extend({
		item: 0,
		amount: 0,
		skip: false,
		_wm: new ig.Config({
			attributes: {
				item: {
					_type: "Item",
					_info: "The item to spawn."
				},
				amount: {
					_type: "NumberExpression",
					_info: "Amount of the given item. 0 = 1.",
					_default: 1
				},
				skip: {
					_type: "Boolean",
					_info: "True if the side gui should hide the obtained item",
					_default: false
				}
			},
			label: function() {
				return "<b>GIVE ITEM: </b> <em>" + wmPrint("Item", this.item) + "</em> x" + this.amount + (this.skip ? "  <i>+ Skip Display</i>" : "")
			}
		}),
		init: function(a) {
			this.item = a.item || 0;
			this.amount = a.amount || 1;
			this.skip = a.skip || false
		},
		start: function() {
			var a = ig.Event.getExpressionValue(this.amount);
			sc.model.player.addItem(this.item, a, this.skip)
		}
	});
});

ig.module("impact.feature.base.action-steps.give-money").requires("impact.feature.base.action-steps").defines(function() {
	ig.ACTION_STEP.GIVE_MONEY = ig.ActionStepBase.extend({
		amount: 0,
		_wm: new ig.Config({
			attributes: {
				amount: {
					_type: "Number",
					_info: "Amount to add",
					_default: 0
				}
			},
			label: function() {
				return "<b>ADD MONEY: </b> <em>" + this.amount + "</em>"
			}
		}),
		init: function(a) {
			this.amount = a.amount || 0
		},
		start: function() {
			this.amount > 0 && sc.model.player.addCredit(this.amount)
		}
	});
});

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