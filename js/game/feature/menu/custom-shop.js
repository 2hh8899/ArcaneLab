ig.module("game.feature.menu.gui.al-shop-menu").requires("impact.feature.gui.gui", "impact.feature.gui.base.basic-gui").defines(function() {
	
	const cantTradeableNow = (g) => {
		var ac = new ig.VarCondition(g.activeCondition || "true").evaluate(),
			mc = false,
			mf = (a, b, c) => {
				var md;
				for(var i of a) {
					switch(i.type) {
						case "ITEM":
							md = sc.model.player.getItemAmount(i.id);
							//getItemAmountWithEquip
							break;
						case "MONEY":
							md = sc.model.player.credit;
							break;
						case "VAR":
							md = ig.vars.get(i.id);
							break;
					}
					if(b) {
						if(md < i.amount)
							return true;
					}else {
						if(md >= c)
							return true;

					}
				}
			};
		if(g.maxOwn) {
			if(mf(g.get, false, g.maxOwn))
				mc = true;
		}
		if(mf(g.require, true))
			mc = true;
		return (!ac || mc);
	}
	
	sc.AlShopMenu = sc.BaseMenu.extend({
		shopGroup: null,
        shopList: null,
		init: function() {
            this.parent();
            this.hook.size.x = ig.system.width;
            this.hook.size.y = ig.system.height;
            this.shopGroup = new sc.AlShopGroupSelectMenu;
            this.addChildGui(this.shopGroup);
            this.shopList = new sc.AlShopListMenu;
            this.addChildGui(this.shopList);
			this.shopList.offerDisplay = new sc.AlShopTradeOfferDisplay();
            this.addChildGui(this.shopList.offerDisplay);
            this.doStateTransition("DEFAULT")
		},
        addObservers: function() {
            sc.Model.addObserver(sc.menu, this)
        },
        removeObservers: function() {
            sc.Model.removeObserver(sc.menu, this)
        },
        showMenu: function() {
            this.addObservers();
            sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
            this.shopGroup.show();
            this.shopList.show();
            ig.interact.setBlockDelay(0.2)
        },
        hideMenu: function() {
            this.removeObservers();
            this.exitMenu()
        },
        exitMenu: function() {
            this.shopGroup.hide();
            this.shopList.hide()
        },
        onBackButtonPress: function() {
            sc.menu.popBackCallback();
            sc.menu.popMenu()
        },
        modelChanged: function(b, a, d) {
            if (b == sc.menu) {
				if (a == sc.MENU_EVENT.OPTION_CHANGED_TAB) {
					this.shopList.loadSlots()
				}else if (a == sc.MENU_EVENT.SHOP_STATE_CHANGED) {
					for(var i of this.shopList.listButtons) {
						i.updateTradeItem();
					}
				}
			}
		}
	});
	sc.AlShopGroupSelectMenu = sc.MenuPanel.extend({
        transitions: {
            DEFAULT: {
                state: {},
                time: 0.2,
                timeFunction: KEY_SPLINES.LINEAR
            },
            HIDDEN: {
                state: {
                    alpha: 0,
                    offsetX: -257
                },
                time: 0.2,
                timeFunction: KEY_SPLINES.LINEAR
            }
        },
        pageText: null,
        cycleLeft: null,
        cycleRight: null,
		init: function() {
            this.parent();
            this.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
            this.setSize(158, 21);
            this.setPos(52, 29);
            this.hook.localAlpha = 0.5;
            this.pageText = new sc.TextGui("");
            this.pageText.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
            this.addChildGui(this.pageText);
            this.cycleLeft = new sc.ButtonGui("\\i[arrow-left]", 34, true, sc.BUTTON_TYPE.SMALL);
            this.cycleLeft.keepMouseFocus = true;
            this.cycleLeft.setPos(-27, 0);
            this.cycleLeft.onButtonPress = function() {
                this.cycleGroups(-1)
            }.bind(this);
            this.addChildGui(this.cycleLeft);
            this.cycleRight = new sc.ButtonGui("\\i[arrow-right]", 34, true, sc.BUTTON_TYPE.SMALL);
            this.cycleRight.keepMouseFocus = true;
            this.cycleRight.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            this.cycleRight.setPos(-27,
                0);
            this.cycleRight.onButtonPress = function() {
                this.cycleGroups(1)
            }.bind(this);
            this.addChildGui(this.cycleRight);
            this.doStateTransition("HIDDEN", true)
		},
		show: function() {
			const dbs = ig.arcaneLabDatabase.get("customShop");
            sc.menu.buttonInteract.addGlobalButton(this.cycleLeft, this.onLeftPressCheck.bind(this), true);
            sc.menu.buttonInteract.addGlobalButton(this.cycleRight, this.onRightPressCheck.bind(this), true);
            this.doStateTransition("DEFAULT");
			sc.menu.setOptionTab(0);
			
			this.cycleLeft.setActive(true);
			this.cycleRight.setActive(true);
			this.cycleLeft.setText("\\i[arrow-left]");
			this.cycleRight.setText("\\i[arrow-right]")

			if(sc.menu.shopID) {
				this.pageText.setText(ig.LangLabel.getText(dbs[sc.menu.shopID[sc.menu.optionCurrentTab]].name));
				if(sc.menu.shopID.length <= 1) {
					this.cycleLeft.setActive(false);
					this.cycleRight.setActive(false);
					this.cycleLeft.setText("\\i[arrow-left-off]");
					this.cycleRight.setText("\\i[arrow-right-off]")
				}
			}else {
				this.pageText.setText(ig.LangLabel.getText(dbs[Object.keys(dbs)[sc.menu.optionCurrentTab]].name));
				if(Object.keys(dbs).length <= 1) {
					this.cycleLeft.setActive(false);
					this.cycleRight.setActive(false);
					this.cycleLeft.setText("\\i[arrow-left-off]");
					this.cycleRight.setText("\\i[arrow-right-off]")
				}
			}
		},
		hide: function() {
            sc.menu.buttonInteract.removeGlobalButton(this.cycleLeft);
            sc.menu.buttonInteract.removeGlobalButton(this.cycleRight);
            this.doStateTransition("HIDDEN")
		},
        cycleGroups: function(b) {
			const dbs = ig.arcaneLabDatabase.get("customShop");
			if(sc.menu.shopID) {
				var dg = sc.menu.shopID;
			}else {
				var dg = Object.keys(dbs);
			}
			var a = dg.length;
            if (a != 1) {
                var d = sc.menu.optionCurrentTab + b;
                b < 0 ? d < 0 && (d = a - 1) : b > 0 && d >= a && (d = 0);
                sc.menu.setOptionTab(d);
                this.pageText.setText(ig.LangLabel.getText(dbs[dg[sc.menu.optionCurrentTab]].name))
            }
        },
        onLeftPressCheck: function() {
            return sc.control.menuCircleLeft()
        },
        onRightPressCheck: function() {
            return sc.control.menuCircleRight()
        }
	});
	sc.AlShopListMenu = sc.MenuPanel.extend({
		offerDisplay: null,
        list: null,
		listButtons: [],
        buttongroup: null,
		init: function() {
            this.parent();
            this.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
            this.setSize(252, 241);
            this.setPos(5, 14);
            this.setPivot(126, 0);
            this.list = new sc.ButtonListBox(1, 0, 40);
            this.list.setSize(252, 230);
            this.list.setPos(0, 0);
            this.addChildGui(this.list);
            this.buttongroup = this.list.buttonGroup;
            this.buttongroup.addSelectionCallback(function(a) {
				sc.menu.optionLastButtonData = a.data;
                if (a.data && a.data != 1) {
					var gt = a.data;
					if(a.data.description) {
						gt = new ig.LangLabel(a.data.description).value;
					}else {
						if(a.data.get) {
							switch(a.data.get[0].type) {
								case "ITEM":
									gt = new ig.LangLabel(sc.inventory.getItem(a.data.get[0].id).description).value;
									break;
								case "MONEY":
									gt = "";
									break;
							}
						}
					}
					sc.menu.setInfoText(gt);
				}
				if (a.data && a.data.isProduct) {
					this.offerDisplay.show(a.data, a.active);
				}else if (a.data && a.data.isTradeButton == false) {
					this.offerDisplay.hide();
				}
            }.bind(this));
            this.buttongroup.setMouseFocusLostCallback(function() {
                sc.menu.setInfoText("", true);
				sc.menu.optionLastButtonData = null;
            }.bind(this));
            //this.buttongroup.addPressCallback(function(a) {}.bind(this));
            this.hook.transitions = {
                DEFAULT: {
                    state: {
                        alpha: 1
                    },
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
                },
                HIDDEN: {
                    state: {
                        alpha: 0,
                        offsetX: -257
                    },
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
                }
            };
            this.doStateTransition("HIDDEN", true)
		},
        show: function() {
            sc.menu.buttonInteract.pushButtonGroup(this.buttongroup);
            this.loadSlots();
            this.list.activate();
            this.doStateTransition("DEFAULT")
		},
        hide: function() {
            sc.menu.buttonInteract.removeButtonGroup(this.buttongroup);
            this.list.deactivate();
            this.doStateTransition("HIDDEN")
        },
		loadSlots: function() {
			const dbs = ig.arcaneLabDatabase.get("customShop");
			this.listButtons = [];
            this.buttongroup.clear();
            this.list.clear();
			var f = null;
			if(sc.menu.shopID) {
				f = dbs[sc.menu.shopID[sc.menu.optionCurrentTab]].list;
			}else {
				f = dbs[Object.keys(dbs)[sc.menu.optionCurrentTab]].list;
			}
            var mw = 0,
				g = null,
				gbtn = null;
            for (var h = 0; h < f.length; h++) {
                g = f[h];
				g.isProduct = true;
				if(new ig.VarCondition(g.showCondition || "true").evaluate()) {
					gbtn = new sc.AlShopProductButton(g);
					if(cantTradeableNow(g)) {
						gbtn.setActive(false);
					}
					this.list.addButton(gbtn, false);
					this.listButtons[this.listButtons.length] = gbtn;
				}
            }
		}
	});
	sc.AlShopProductButton = sc.ListBoxButton.extend({
        init: function(a) {
			var buttonText = "";
			if(a.title) {
				buttonText = new ig.LangLabel(a.title).value;
			}else {
				var i = a.get[0];
				switch(i.type) {
					case "ITEM":
						var d = sc.inventory.getItem(i.id);
						buttonText += ("\\i[" + (d.icon + sc.inventory.getRaritySuffix(d.rarity || 0) || "item-default") + "]" + ig.LangLabel.getText(d.name));
						break;
					case "MONEY":
						buttonText += ("\\i[credit]" + i.amount);
						break;
					case "VAR":
						buttonText += (i.amount);
						break;
				}
				if(a.get.length > 1) {
					buttonText += (" (+" + a.get.length + ")");
				}
			}
            this.parent(buttonText, 224, 24, void 0, void 0, true);
			this.setData(a);
		},
        updateTradeItem: function() {
			if(cantTradeableNow(this.data)) {
				this.setActive(false);
			}else {
				this.setActive(true);
			}
		}
	});
	
	sc.AlShopTradeOfferDisplay = ig.BoxGui.extend({
        transitions: {
            DEFAULT: {
                state: {},
                time: 0.2,
                timeFunction: KEY_SPLINES.LINEAR
            },
            HIDDEN: {
                state: {
					alpha: 0,
                    offsetX: -257
                },
                time: 0.2,
                timeFunction: KEY_SPLINES.LINEAR
            }
        },
        ninepatch: new ig.NinePatch("media/gui/menu.png", {
            width: 8,
            height: 8,
            left: 8,
            top: 8,
            right: 8,
            bottom: 8,
            offsets: {
                "default": {
                    x: 432,
                    y: 280
                }
            }
        }),
		data: null,
		arrow: null,
		getGui: null,
		requireGui: null,
		ownedText: null,
		forText: null,
		tradeButton: null,
		statsButton: null,
		creditList: [],
		money: 0,
		varList: [],
        init: function() {
            this.parent(227, 100);
            this.setPos(8, 53);
            this.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            this.arrow = new ig.ImageGui(this.ninepatch.gfx, 432, 256, 16, 17);
            this.arrow.setPos(7, 44);
            this.arrow.setPivot(17, 17);
            this.arrow.hook.transitions = {
                DEFAULT: {
                    state: {},
                    time: 0.2,
                    timeFunction: KEY_SPLINES.EASE
                },
                HIDDEN: {
                    state: {
                        scaleX: 0.2,
                        scaleY: 0.5,
                        offsetY: 5
                    },
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
                }
            };
            this.addChildGui(this.arrow);
			this.getGui = new sc.AlShopTradeItemBox(null);
            this.getGui.setPos(2, 16);
            this.addChildGui(this.getGui);
			this.requireGui = new sc.AlShopTradeItemBox(null);
            this.requireGui.setPos(25, 30);
            this.addChildGui(this.requireGui);
            var b = new sc.TextGui(ig.lang.get("sc.gui.trade.trade"), {
                font: sc.fontsystem.tinyFont
            });
            b.setPos(9, 6);
            this.addChildGui(b);
            b = new sc.TextGui(ig.lang.get("sc.gui.trade.owned"), {
                font: sc.fontsystem.tinyFont
            });
            b.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            b.setPos(26, 6);
            this.addChildGui(b);
            this.forText = new sc.TextGui(ig.lang.get("sc.gui.trade.for"), {
                font: sc.fontsystem.tinyFont
            });
            this.forText.setPos(33, 20);
            this.ownedText = new sc.TextGui(ig.lang.get("sc.gui.trade.owned"), {
                font: sc.fontsystem.tinyFont
            });
            this.ownedText.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            this.ownedText.setPos(5, 20);
            this.addChildGui(this.forText);
            this.addChildGui(this.ownedText);
			this.tradeButton = new sc.ButtonGui("\\i[help2]" + ig.lang.get("sc.gui.trade.trade"));
            this.tradeButton.keepMouseFocus = true;
            this.tradeButton.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_BOTTOM);
            this.tradeButton.setPos(0, 5);
            this.tradeButton.submitSound = null;
			this.tradeButton.setData({isTradeButton: true});
			this.tradeButton.onButtonPress = function() {
                this.doTrade()
            }.bind(this);
            this.addChildGui(this.tradeButton);
            this.doStateTransition("HIDDEN", true)
		},
        show: function(a, b) {
			for(var dbr of this.creditList) {
				this.removeChildGui(dbr);
			}
			this.creditList = [];
			this.data = a;
			this.money = 0;
			this.varList = [];
			var guiYOffset = this.getGui.setContent(a.get);
			this.requireGui.setPos(25, 30+guiYOffset);
			this.ownedText.setPos(5, 20+guiYOffset);
			this.forText.setPos(33, 20+guiYOffset);
			this.arrow.setPos(7, 20+guiYOffset);
			guiYOffset += this.requireGui.setContent(a.require);
			var i = 0,
				j = 0,
				varCheck = false;
			for (var m = 0; m < a.get.length; m++) {
				if(a.get[m].type == "MONEY") {
					this.money -= a.get[m].amount;
				}else if(a.get[m].type == "VAR") {
					for(i=0; i < this.varList.length; i++){
						if(this.varList[i].id == a.get[m].id) {
							varCheck = true;
							this.varList[i].amount -= a.get[m].amount;
							break;
						}
					}
					if(varCheck == false) {
						this.varList[i] = {
							id: a.get[m].id,
							icon: a.get[m].icon,
							amount: -a.get[m].amount
						}
					}
				}
			}
			for (var m = 0; m < a.require.length; m++) {
				if(a.require[m].type == "MONEY") {
					this.money += a.require[m].amount;
				}else if(a.require[m].type == "VAR") {
					for(i=0; i < this.varList.length; i++){
						if(this.varList[i].id == a.require[m].id) {
							varCheck = true;
							this.varList[i].amount += a.require[m].amount;
							break;
						}
					}
					if(varCheck == false) {
						this.varList[i] = {
							id: a.require[m].id,
							icon: a.require[m].icon,
							amount: a.require[m].amount
						}
					}
				}
			}
			if(this.money !=0) {
				this.creditList[j] = new sc.AlShopTradeCreditGui(false, {amount: this.money});
				this.creditList[j].setPos(2, 30 + guiYOffset);
				this.addChildGui(this.creditList[j]);
				guiYOffset += this.creditList[j].hook.size.y - 1;
				j++;
			}
			for(var vbd of this.varList) {
				if(vbd.amount != 0) {
					this.creditList[j] = new sc.AlShopTradeCreditGui(true, vbd);
					this.creditList[j].setPos(2, 30 + guiYOffset);
					this.addChildGui(this.creditList[j]);
					guiYOffset += this.creditList[j].hook.size.y - 1;
					j++;
				}
			}
			this.setSize(227, 96+guiYOffset);
			sc.menu.buttonInteract.removeGlobalButton(this.tradeButton);
			sc.menu.buttonInteract.addGlobalButton(this.tradeButton, this.onTradeButtonCheck.bind(this));
			this.tradeButton.setActive(b);
            this.doStateTransition("DEFAULT");
        },
        hide: function() {
			sc.menu.buttonInteract.removeGlobalButton(this.tradeButton);
            this.doStateTransition("HIDDEN")
        },
		doTrade: function() {
			//unEquip
            sc.stats.addMap("trade", "total", 1);
			var d = sc.model.player;
			if(this.money>0) {
				d.removeCredit(this.money, true);
				sc.stats.addMap("trade", "moneyLost", this.money);
			}else if(this.money<0) {
				d.addCredit(-this.money, true);
			}
			
			for(var vbd of this.varList) {
				if(vbd.amount != 0) {
					ig.vars.sub(vbd.id, vbd.amount);
				}
			}
			
			for(var i of this.creditList) {
				i.updateTradeItem();
			}
			
			var glb,
				rlb;
			for(glb = 0; glb < this.getGui.offerButtons.length; glb++) {
				d.addItem(this.getGui.offerButtons[glb].data.id, this.getGui.offerButtons[glb].data.amount);
				this.getGui.offerButtons[glb].updateTradeItem();
			}
			for(rlb = 0; rlb < this.requireGui.offerButtons.length; rlb++) {
				d.removeItem(this.requireGui.offerButtons[rlb].data.id, this.requireGui.offerButtons[rlb].data.amount);
				this.requireGui.offerButtons[rlb].updateTradeItem();
			}
			
            sc.stats.addMap("trade", "got", glb);
            sc.stats.addMap("trade", "lost", rlb);
            sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.SHOP_STATE_CHANGED);
			
			sc.BUTTON_SOUND.shop_cash.play();
			
			this.tradeButton.setActive(!cantTradeableNow(this.data));
		},
        onTradeButtonCheck: function() {
            return sc.control.menuHotkeyHelp2()
        }
	});
    sc.AlShopTradeItemBox = ig.GuiElementBase.extend({
        gfx: new ig.Image("media/gui/menu.png"),
		offerButtons: [],
        init: function(a) {
            this.parent();
            this.hook.size.x = 200;
            this.setContent(a)
        },
        updateDrawables: function(b) {
            var a = this.hook.size;
            b.addColor("#000", 0, 0, a.x, a.y);
            b.addColor(this.dividerColor || "#7E7E7E",
                0, 0, a.x, 1);
            b.addColor(this.dividerColor || "#7E7E7E", 0, a.y - 1, a.x, 1)
        },
        setContent: function(a) {
            this.removeAllChildren();
			this.offerButtons = [];
            var e = 2,
				i = 0;
            if (a) {
                for (var m = 0; m < a.length; m++) {
					if(a[m].type == "ITEM") {
						this.offerButtons[i] = new sc.AlShopProductOfferButton(a[m]);
						this.offerButtons[i].setPos(1, e);
						this.addChildGui(this.offerButtons[i]);
						e += this.offerButtons[i].hook.size.y;
						i++;
					}
				}
				if(this.offerButtons.length == 0) {
					this.offerButtons[0] = new sc.AlShopNothingButton();
					this.offerButtons[0].setPos(1, e);
					this.addChildGui(this.offerButtons[0]);
					e += this.offerButtons[0].hook.size.y;
				}
			}else {
				e = 20;
			}
            this.hook.size.y = e + 1;
            return e
        }
    });
	sc.AlShopProductOfferButton = sc.ListBoxButton.extend({
        helperGfx: new ig.Image("media/gui/menu.png"),
        requiredGui: null,
        amount: null,
        crossGui: null,
        required: 0,
        init: function(a) {
            this.parent("", 142, 56);
			this.setData(a);
            this.required = a.amount || 0;
            this.crossGui = new ig.ImageGui(this.helperGfx, 136, 432, 5, 5);
            this.crossGui.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            this.crossGui.setPos(48, 9);
            this.addChildGui(this.crossGui);
            this.requiredGui = new sc.NumberGui(99);
            this.requiredGui.setNumber(this.required);
            this.requiredGui.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            this.requiredGui.setPos(30, 7);
            this.addChildGui(this.requiredGui);
            var b = new ig.ImageGui(this.helperGfx, 136, 416, 3, 9);
            b.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            b.setPos(22, 6);
            this.addChildGui(b);
            b = new ig.ImageGui(this.helperGfx, 139, 416, 3, 9);
            b.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            b.setPos(1, 6);
            this.addChildGui(b);
            this.amount = new sc.NumberGui(99);
            this.amount.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            this.amount.setPos(5, 7);
            this.addChildGui(this.amount);
			var d = sc.inventory.getItem(a.id);
			this.updateTradeItem(true);
			this.setText("\\i[" + (d.icon + sc.inventory.getRaritySuffix(d.rarity || 0) || "item-default") + "]" + ig.LangLabel.getText(d.name));
		},
        updateTradeItem: function(t) {
			var a = sc.model.player.getItemAmount(this.data.id);
            this.amount.setNumber(a || 0, t);
            if (a >= this.required) {
                this.crossGui.offsetY = 432;
                this.requiredGui.setColor(sc.GUI_NUMBER_COLOR.WHITE)
            } else {
                this.crossGui.offsetY = 440;
                this.requiredGui.setColor(sc.GUI_NUMBER_COLOR.RED);
                this.setActive(false)
            }
        }
	});
	sc.AlShopTradeCreditGui = ig.GuiElementBase.extend({
        gfx: new ig.Image("media/gui/menu.png"),
        transitions: {
            DEFAULT: {
                state: {},
                time: 0.2,
                timeFunction: KEY_SPLINES.LINEAR
            },
            HIDDEN: {
                state: {
                    alpha: 0
                },
                time: 0.2,
                timeFunction: KEY_SPLINES.LINEAR
            }
        },
        content: null,
        money: 0,
		have: 0,
        credit: null,
        fee: null,
        current: null,
        dividerColor: null,
        init: function(c, m) {
            this.parent();
            this.setSize(223, 26);
            this.money = m.amount;
			if(c) {
				this.have = () => {return ig.vars.get(m.id)};
			}else {
				this.have = () => {return sc.model.player.credit};
			}
            this.content = new ig.GuiElementBase;
            this.content.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
            this.content.setSize(142, 26);
            this.addChildGui(this.content);
            var a = new sc.TextGui(ig.lang.get("sc.gui.trade.rest"), {
                font: sc.fontsystem.tinyFont
            });
            a.setPos(0, 15);
            this.content.addChildGui(a);
            if (c) {
                a = new sc.TextGui(ig.lang.get("sc.gui.trade.credits"), {
                    font: sc.fontsystem.tinyFont
                });
                a.setPos(0, 4);
                this.content.addChildGui(a)
            }else {
				a = new sc.TextGui(ig.lang.get("sc.gui.trade.fee"), {
					font: sc.fontsystem.tinyFont
				});
				a.setPos(0, 4);
				this.content.addChildGui(a);
			}
            this.credit = new sc.NumberGui(99999999, {
                signed: true,
                transitionTime: 0.2
            });
            this.credit.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
			this.updateTradeItem(true);
            this.credit.setPos(14, 15);
            this.content.addChildGui(this.credit);
            this.fee = new sc.NumberGui(99999999, {
                signed: true,
                transitionTime: 0.2
            });
            this.fee.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            this.fee.setNumber(-this.money, true);
			if(-this.money < 0) {
				this.fee.setColor(sc.GUI_NUMBER_COLOR.RED);
			}else {
				this.fee.setColor(sc.GUI_NUMBER_COLOR.GREEN);
			}
            this.fee.setPos(14, 4);
            this.content.addChildGui(this.fee);
			if(c) {
				a = new ig.ImageGui(new ig.Image(m.icon.src), m.icon.offX || 0, m.icon.offY || 0, m.icon.width, m.icon.height);
			}else {
				a = new ig.ImageGui(this.gfx, 488, 32, 12, 10);
			}
				a.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
				a.setPos(0, 14);
            this.content.addChildGui(a);
        },
        updateDrawables: function(b) {
            var a = this.hook.size;
            b.addColor("#000", 0, 0, a.x, a.y);
            b.addColor("#7E7E7E", 0, 0, a.x, 1);
            b.addColor("#7E7E7E", 0, a.y - 1, a.x, 1)
        },
        updateTradeItem: function(t) {
			var a = this.have() - this.money;
            this.credit.setNumber(a || 0, t);
			if(a < 0) {
				this.credit.setColor(sc.GUI_NUMBER_COLOR.RED);
			}else {
				this.credit.setColor(sc.GUI_NUMBER_COLOR.WHITE);
			}
		}
    });
	sc.AlShopNothingButton = sc.ListBoxButton.extend({
        init: function() {
            this.parent(ig.lang.get("sc.gui.menu.al-custom-shop.none"), 142, 56, void 0, void 0, true);
		},
		updateTradeItem: function(t) {}
	});
	

});
ig.module("game.feature.menu.al-shop").requires("game.feature.menu.menu-model")
.defines(function() {
	sc.MENU_SUBMENU.AL_CUSTOM_SHOP = Math.max(...Object.values(sc.MENU_SUBMENU)) + 1;
	sc.SUB_MENU_INFO[sc.MENU_SUBMENU.AL_CUSTOM_SHOP] = {
		Clazz: sc.AlShopMenu,
		name: "al-shop"
	};
});