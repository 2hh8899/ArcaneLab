ig.module("game.feature.menu.gui.al-modifier-card-menu").requires("impact.feature.gui.gui", "impact.feature.gui.base.basic-gui").defines(function() {
	
	const defaultModifierIcon = new ig.Image("media/gui/menu.png");
	const getModifierIcon = (a) => {
		if(sc.MODIFIERS[a].altSheet) {
			return [new ig.Image(sc.MODIFIERS[a].altSheet), sc.MODIFIERS[a].offX, sc.MODIFIERS[a].offY, sc.MODIFIER_ICON_DRAW.SIZE];
		}else {
			return [defaultModifierIcon, sc.MODIFIER_ICON_DRAW.X + ((sc.MODIFIERS[a].icon % sc.MODIFIER_ICON_DRAW.MAX_PER_ROW) * (sc.MODIFIER_ICON_DRAW.SIZE + 1)), sc.MODIFIER_ICON_DRAW.Y + ((Math.floor(sc.MODIFIERS[a].icon / sc.MODIFIER_ICON_DRAW.MAX_PER_ROW)) * (sc.MODIFIER_ICON_DRAW.SIZE + 1)), sc.MODIFIER_ICON_DRAW.SIZE];
		}
	};
	const reLinkEquipVarPointer = () => {
		for(var i=0; i<6; i++) {
			var j = ig.vars.get("modifier-cards.equip")[i];
			if(j != null) {
				ig.vars.get("modifier-cards.equip")[i] = ig.vars.get("modifier-cards.list")[j.indexData];
			}
		}
	};
	
	sc.AlModifierCardMenu = sc.BaseMenu.extend({
		start: null,
		menuTitle: null,
		craftMenuGui: null,
		dismantleMenuGui: null,
		enchantMenuListGui: null,
		enchantMenuGui: null,
		equipMenuGui: null,
		equipMenuListGui: null,
		init: function() {
			this.parent();
			if(ig.vars.get("modifier-cards")===null) {
				ig.vars.set("modifier-cards", {
					"list": [],
					"equip": [null, null, null, null, null, null]
				});
			}else {
				reLinkEquipVarPointer();
			}
			this.hook.size.x = ig.system.width;
			this.hook.size.y = ig.system.height;
			sc.menu.setOptionTab(0);
			this.start = new sc.AlModifierCardStartMenu;
			this.addChildGui(this.start);
			this.menuTitle = new sc.AlModifierCardStartTitle;
			this.addChildGui(this.menuTitle);
			this.craftMenuGui = new sc.AlModifierCardGuiCraft;
			this.addChildGui(this.craftMenuGui);
			this.dismantleMenuGui = new sc.AlModifierCardGuiDismantleList;
			this.addChildGui(this.dismantleMenuGui);
			this.enchantMenuListGui = new sc.AlModifierCardGuiEnchantList;
			this.addChildGui(this.enchantMenuListGui);
            this.enchantMenuGui = new sc.AlModifierCardGuiEnchant;
            this.addChildGui(this.enchantMenuGui);
			this.enchantMenuListGui.enchantGui = this.enchantMenuGui;
			this.enchantMenuGui.enchantListGui = this.enchantMenuListGui;
			this.equipMenuGui = new sc.AlModifierCardGuiEquip;
			this.addChildGui(this.equipMenuGui);
			this.equipMenuListGui = new sc.AlModifierCardGuiEquipList();
            this.addChildGui(this.equipMenuListGui);
			this.equipMenuGui.equipList = this.equipMenuListGui;
			this.equipMenuListGui.equipGui = this.equipMenuGui;
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
			this.start.show();
			this.menuTitle.show();
			sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
			ig.interact.setBlockDelay(0.2)
		},
		hideMenu: function() {
			this.removeObservers();
			this.exitMenu()
		},
		exitMenu: function() {
			this.start.hide();
			this.menuTitle.hide()
		},
		onAddHotkeys: function(b) {
			this.commitHotKeysToTopBar(b)
		},
		onBackButtonPress: function() {
			sc.menu.popBackCallback();
			sc.menu.popMenu()
		},
		modelChanged: function(b, a, d) {
			if (b == sc.menu) {
				if (a == sc.MENU_EVENT.OPTION_CHANGED_TAB) {
					this.start.hide(true);
					this.menuTitle.hide(true);
					switch(sc.menu.optionCurrentTab) {
						case 1:
							this.craftMenuGui.show();
							break;
						case 2:
							this.dismantleMenuGui.show();
							break;
						case 3:
							this.enchantMenuListGui.show();
							this.enchantMenuGui.show();
							break;
						case 4:
							this.equipMenuGui.show();
							break;
					}
				}else if(a == sc.MENU_EVENT.SHOP_STATE_CHANGED) {
					sc.menu.popBackCallback();
					this.craftMenuGui.hide();
					this.dismantleMenuGui.hide();
					this.enchantMenuListGui.hide();
					this.enchantMenuGui.hide();
					this.equipMenuGui.hide();
					this.start.show();
					this.menuTitle.show();
				}
			}
		}
	});
	sc.AlModifierCardStartMenu = ig.BoxGui.extend({
		ninepatch: new ig.NinePatch("media/gui/menu.png", {
			width: 16,
			height: 9,
			left: 4,
			top: 4,
			right: 4,
			bottom: 4,
			offsets: {
				"default": {
					x: 512,
					y: 457
				}
			}
		}),
		transitions: {
			DEFAULT: {
				state: {},
				time: 0.2,
				timeFunction: KEY_SPLINES.LINEAR
			},
			HIDDEN: {
				state: {
					alpha: 0,
					offsetY: 10
				},
				time: 0.2,
				timeFunction: KEY_SPLINES.LINEAR
			},
			HIDDEN_SCALE: {
				state: {
					alpha: 0,
					scaleX: 0
				},
				time: 0.2,
				timeFunction: KEY_SPLINES.LINEAR
			}
		},
		buttonCraft: null,
		buttonDismantle: null,
		buttonEnchant: null,
		buttonEquip: null,
		buttongroup: null,
		init: function() {
			this.parent(275, 70);
			this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
			this.setSize(275, 70);
			this.setPos(0, -1);
			this.buttongroup = new sc.ButtonGroup;
			this.buttongroup.addPressCallback(this.onButtonPress.bind(this));
			this.buttonCraft = new sc.ButtonGui(ig.lang.get("sc.gui.menu.al-modifier-card.craft"), 125);
			this.buttonCraft.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
			this.buttonCraft.setPos(8, 8);
			this.buttonCraft.setData(1);
			this.addChildGui(this.buttonCraft);
			this.buttonDismantle = new sc.ButtonGui(ig.lang.get("sc.gui.menu.al-modifier-card.dismantle"), 125);
			this.buttonDismantle.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
			this.buttonDismantle.setPos(8, 8);
			this.buttonDismantle.setData(2);
			this.addChildGui(this.buttonDismantle);
			this.buttonEnchant = new sc.ButtonGui(ig.lang.get("sc.gui.menu.al-modifier-card.enchant"), 125);
			this.buttonEnchant.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM);
			this.buttonEnchant.setPos(8, 8);
			this.buttonEnchant.setData(3);
			this.addChildGui(this.buttonEnchant);
			this.buttonEquip = new sc.ButtonGui(ig.lang.get("sc.gui.menu.al-modifier-card.equip"), 125);
			this.buttonEquip.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_BOTTOM);
			this.buttonEquip.setPos(8, 8);
			this.buttonEquip.setData(4);
			this.addChildGui(this.buttonEquip);
			this.buttongroup.addFocusGui(this.buttonCraft, 0, 0);
			this.buttongroup.addFocusGui(this.buttonDismantle, 1, 0);
			this.buttongroup.addFocusGui(this.buttonEnchant, 0, 1);
			this.buttongroup.addFocusGui(this.buttonEquip, 1, 1);
			this.doStateTransition("HIDDEN", true)
		},
		show: function() {
			sc.menu.buttonInteract.pushButtonGroup(this.buttongroup);
			sc.menu.setInfoText("", true);
			this.doStateTransition("DEFAULT")
		},
		hide: function(a) {
			sc.menu.buttonInteract.removeButtonGroup(this.buttongroup);
			this.doStateTransition(a ? "HIDDEN_SCALE" : "HIDDEN")
		},
		onButtonPress: function(b) {
			if(!isNaN(b.data)) {
				sc.menu.setOptionTab(b.data);
			}
		}
	});
	sc.AlModifierCardStartTitle = ig.BoxGui.extend({
		ninepatch: new ig.NinePatch("media/gui/menu.png", {
			width: 16,
			height: 9,
			left: 4,
			top: 4,
			right: 4,
			bottom: 4,
			offsets: {
				"default": {
					x: 512,
					y: 457
				}
			}
		}),
		transitions: {
			DEFAULT: {
				state: {},
				time: 0.2,
				timeFunction: KEY_SPLINES.LINEAR
			},
			HIDDEN: {
				state: {
					alpha: 0,
					offsetY: -10
				},
				time: 0.2,
				timeFunction: KEY_SPLINES.LINEAR
			},
			HIDDEN_SCALE: {
				state: {
					alpha: 0,
					scaleX: 0
				},
				time: 0.2,
				timeFunction: KEY_SPLINES.LINEAR
			}
		},
		text: null,
		init: function() {
			this.parent(20, 20);
			this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
			this.setPos(0, 50);
			this.text = new sc.TextGui;
			this.text.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
			this.addChildGui(this.text);
			this.doStateTransition("HIDDEN",
				true)
		},
		show: function() {
			this.text.setText(ig.lang.get("sc.gui.menu.menu-titles.al-modifier-card"));
			this.setSize(this.text.hook.size.x + 12, 20);
			this.doStateTransition("DEFAULT")
		},
		hide: function(a) {
			this.doStateTransition(a ? "HIDDEN_SCALE" : "HIDDEN")
		}
	})
	sc.AlModifierCardGuiCraft = ig.BoxGui.extend({
		transitions: {
			DEFAULT: {
				state: {},
				time: 0.2,
				timeFunction: KEY_SPLINES.LINEAR
			},
			HIDDEN: {
				state: {
					alpha: 0,
					offsetY: -257
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
		craftButton: null,
		crossGui: null,
		craftResultModal: null,
		fragCount: null,
		useCount: null,
		decFrag: null,
		incFrag: null,
		buttongroup: null,
		useAmount: 7,
		modifierIcons: [],
		slotIcons: [],
		init: function() {
			this.parent(227, 180);
			this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
			this.buttongroup = new sc.ButtonGroup;
			this.craftResultModal = new sc.AlModifierCardCraftResultDialog();
			var d = sc.inventory.getItem("key-arcanelab-modifier-frag");
			var b = new sc.TextGui("\\i[" + (d.icon + sc.inventory.getRaritySuffix(d.rarity || 0) || "item-default") + "]" + ig.LangLabel.getText(d.name));
			b.setPos(-16, 6);
			b.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
			this.addChildGui(b);
            var havingCrossGui = new ig.ImageGui(defaultModifierIcon, 136, 432, 5, 5);
            havingCrossGui.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            havingCrossGui.setPos(-10, 9);
            b.addChildGui(havingCrossGui);
            this.fragCount = new sc.NumberGui(99, {
                signed: true,
                transitionTime: 0.2
            });
            this.fragCount.setNumber(this.required);
            this.fragCount.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            this.fragCount.setPos(-28, 7);
            b.addChildGui(this.fragCount);
			b = new sc.TextGui(ig.lang.get("sc.gui.menu.al-modifier-card.usage"));
			b.setPos(-16, 30);
			b.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
			this.addChildGui(b);
			this.crossGui = new ig.ImageGui(defaultModifierIcon, 136, 432, 5, 5);
            this.crossGui.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            this.crossGui.setPos(-10, 9);
            b.addChildGui(this.crossGui);
            this.useCount = new sc.NumberGui(99);
            this.useCount.setNumber(this.required - 6);
            this.useCount.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            this.useCount.setPos(-28, 7);
            b.addChildGui(this.useCount);
			for(var i=0; i<3; i++) {
				var m = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), 110, 0, 22, 22);
				m.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				m.setPos(0, (i-1)*24 + 12);
				this.addChildGui(m);
				this.modifierIcons[i] = m;
			}
			this.craftButton = new sc.ButtonGui("\\i[help2]" + ig.lang.get("sc.gui.trade.trade"));
			this.craftButton.keepMouseFocus = true;
			this.craftButton.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_BOTTOM);
			this.craftButton.setPos(0, 5);
			this.craftButton.submitSound = null;
			this.craftButton.setData({iscraftButton: true});
			this.craftButton.onButtonPress = function() {
				this.doCraft()
			}.bind(this);
			this.addChildGui(this.craftButton);
            this.decFrag = new sc.ButtonGui("\\i[arrow-left]", 34, true, sc.BUTTON_TYPE.SMALL);
            this.decFrag.keepMouseFocus = true;
            this.decFrag.setPos(27, 30);
            this.decFrag.onButtonPress = function() {
                this.changeFragCount(-1)
            }.bind(this);
            this.addChildGui(this.decFrag);
            this.incFrag = new sc.ButtonGui("\\i[arrow-right]", 34, true, sc.BUTTON_TYPE.SMALL);
            this.incFrag.keepMouseFocus = true;
            this.incFrag.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
            this.incFrag.setPos(27,
                30);
            this.incFrag.onButtonPress = function() {
                this.changeFragCount(1)
            }.bind(this);
            this.addChildGui(this.incFrag);
			this.updateNumbers(true);
			this.doStateTransition("HIDDEN", true)
		},
		show: function() {
			sc.menu.buttonInteract.pushButtonGroup(this.buttongroup);
			sc.menu.buttonInteract.addGlobalButton(this.craftButton, this.oncraftButtonCheck.bind(this));
            sc.menu.buttonInteract.addGlobalButton(this.decFrag, this.onLeftPressCheck.bind(this), true);
            sc.menu.buttonInteract.addGlobalButton(this.incFrag, this.onRightPressCheck.bind(this), true);
			sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
			this.useAmount = 3;
			this.decFrag.setActive(false);
			this.incFrag.setActive(true);
			this.updateNumbers(true);
			this.doStateTransition("DEFAULT");
		},
		hide: function() {
			sc.menu.buttonInteract.removeButtonGroup(this.buttongroup);
			sc.menu.buttonInteract.removeGlobalButton(this.craftButton);
            sc.menu.buttonInteract.removeGlobalButton(this.decFrag);
            sc.menu.buttonInteract.removeGlobalButton(this.incFrag);
			this.doStateTransition("HIDDEN")
		},
		doCraft: function() {
			sc.model.player.removeItem("key-arcanelab-modifier-frag", this.useAmount);
			const dbs = ig.arcaneLabDatabase.get("modifierCards");
			var dbsCopy = JSON.parse(JSON.stringify(dbs)),
				dboP = dbsCopy.positive,
				dboB = dbsCopy.both,
				dboN = dbsCopy.negative,
				createCardModifier = (dboA, dboB) => {
					if(Math.random() < (dboA.length/(dboA.length+dboB.length))) {
						return dboA.splice(Math.floor(Math.random() * dboA.length),1)[0];
					}else {
						return dboB.splice(Math.floor(Math.random() * dboB.length),1)[0];
					}
				};
			var modifi1 = createCardModifier(dboP, dboB).modifier,
				modifi2 = createCardModifier(dboP, dboB).modifier,
				modifi3 = createCardModifier(dboB, dboN).modifier;
			ig.gui.addGuiElement(this.craftResultModal);
			this.craftResultModal.show([modifi1, modifi2, modifi3], this.useAmount+4);
			ig.vars.get("modifier-cards.list").push({
				size: this.useAmount+4,
				done: false,
				modifier: [modifi1, modifi2, modifi3],
				tried: [[], [], []],
				chance: 0.75
			});
			sc.BUTTON_SOUND.shop_cash.play();
			this.updateNumbers(false);
		},
		updateNumbers: function(t) {
			this.useCount.setNumber(this.useAmount);
			var a = sc.model.player.getItemAmount("key-arcanelab-modifier-frag");
            this.fragCount.setNumber(a || 0, t);
            if (a >= this.useAmount) {
                this.crossGui.offsetY = 432;
                this.useCount.setColor(sc.GUI_NUMBER_COLOR.WHITE);
				this.craftButton.setActive(true);
            } else {
                this.crossGui.offsetY = 440;
                this.useCount.setColor(sc.GUI_NUMBER_COLOR.RED);
				this.craftButton.setActive(false);
            }
			for(var i of this.modifierIcons) {
				i.removeAllChildren();
			}
			for(var i=0; i<3; i++) {
				for(var j=0; j<(this.useAmount+4); j++) {
					var mm = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), i==2?0:22, 0, 22, 22);
					mm.setPos(18 + (195/(this.useAmount+4))*j, 0);
					this.modifierIcons[i].addChildGui(mm);
					this.slotIcons[(i*(this.useAmount+4)) + j] = mm;
				}
			}
		},
		oncraftButtonCheck: function() {
			return sc.control.menuHotkeyHelp2()
		},
        changeFragCount: function(b) {
			this.useAmount = Math.min(Math.max(this.useAmount + b, 3), 10);
			if(this.useAmount == 3) {
				this.decFrag.setActive(false);
			}else if(this.useAmount == 8) {
				this.incFrag.setActive(false);
			}else {
				this.decFrag.setActive(true);
				this.incFrag.setActive(true);
			}
			this.updateNumbers(true);
        },
        onLeftPressCheck: function() {
            return sc.control.menuCircleLeft()
        },
        onRightPressCheck: function() {
            return sc.control.menuCircleRight()
        },
		onBackButtonPress: function() {
			sc.menu.optionCurrentTab = 0;
			sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.SHOP_STATE_CHANGED);
		}
	});
	sc.AlModifierCardCraftResultDialog = sc.ModalButtonInteract.extend({
		modifierIcon: [],
		modifierName: [],
		slotCount: [],
		init: function() {
			this.parent(ig.lang.get("sc.gui.menu.al-modifier-card.craft")+ig.lang.get("sc.gui.menu.al-modifier-card.result"), null, [ig.lang.get("sc.gui.menu.al-modifier-card.obtain")], this.onDialogCallback.bind(this));
            this.msgBox.centerBox.hook.localAlpha = 1;
            this.textGui.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
			for(var i=0; i<3; i++) {
				var mm = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), i==2?0:22, 0, 22, 22);
				mm.setPos(16, -32 + (i*48));
				mm.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.content.addChildGui(mm);
				this.modifierIcon[i] = new ig.ImageGui(defaultModifierIcon, sc.MODIFIER_ICON_DRAW.X, sc.MODIFIER_ICON_DRAW.Y, sc.MODIFIER_ICON_DRAW.SIZE, sc.MODIFIER_ICON_DRAW.SIZE);
				this.modifierIcon[i].setPos(16, -55 + (i*48));
				this.modifierIcon[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.content.addChildGui(this.modifierIcon[i]);
				this.modifierName[i] = new sc.TextGui();
				this.modifierName[i].setPos(28, -55 + (i*48));
				this.modifierName[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.content.addChildGui(this.modifierName[i]);
				var crossGui = new ig.ImageGui(defaultModifierIcon, 136, 432, 5, 5);
				crossGui.setPos(44, -32 + (i*48));
				crossGui.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.content.addChildGui(crossGui);
				this.slotCount[i] = new sc.NumberGui(99);
				this.slotCount[i].setPos(50, -32 + (i*48));
				this.slotCount[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.content.addChildGui(this.slotCount[i]);
			}
            this.content.setSize(200, 200);
            this.msgBox.resize();
		},
		show: function(a, b) {
			for(var i=0; i<3; i++) {
				var g = getModifierIcon(a[i]);
				this.modifierIcon[i].setImage(g[0], g[1], g[2], g[3], g[3]);
				this.modifierName[i].setText(ig.lang.get("sc.gui.menu.equip.modifier."+a[i]));
				this.slotCount[i].setNumber(b);
			}
			this.parent();
		},
		onDialogCallback: function(b) {
			this.hide();
		}
	});
	
	
	sc.AlModifierCardGuiDismantleList = sc.MenuPanel.extend({
        list: null,
        buttongroup: null,
        confirm: new ig.Sound("media/sound/battle/special/neutral-screw.ogg", 0.8),
		init: function() {
            this.parent();
            this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
            this.setSize(250, 220);
            this.setPos(0, 0);
            this.list = new sc.ButtonListBox(1, 0, 110, sc.LIST_COLUMNS.TWO, 1, 123);
            this.list.setSize(250, 220);
            this.list.setPos(0, 0);
            this.addChildGui(this.list);
            this.buttongroup = this.list.buttonGroup;
            this.buttongroup.addPressCallback(function(a) {
				var b = ig.lang.get("sc.gui.menu.al-modifier-card.dismantleCard"),
					b = ig.lang.grammarReplace(b, Math.floor((a.data.size-3)/2));
				sc.Dialogs.showYesNoDialog(b, sc.DIALOG_INFO_ICON.WARNING, function(b) {
					if (b.data == 0) {
						this.confirm.play();
						sc.model.player.addItem("key-arcanelab-modifier-frag", Math.floor((a.data.size-3)/2), true);
						a.dismantle();
						ig.vars.get("modifier-cards.list").splice(ig.vars.get("modifier-cards.list").indexOf(a.data), 1);
						for(var e of ig.vars.get("modifier-cards.list")) {
							e.indexData = ig.vars.get("modifier-cards.list").indexOf(e);
						}
					}
				}.bind(this));
            }.bind(this));
            this.hook.transitions = {
                DEFAULT: {
                    state: {
                        alpha: 1
                    },
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
                },
                TRANSLUCENT: {
                    state: {
                        alpha: 0.5
                    },
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
                },
                HIDDEN: {
                    state: {
                        alpha: 0,
                        offsetY: -257
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
			sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
            this.doStateTransition("DEFAULT")
		},
        hide: function() {
            sc.menu.buttonInteract.removeButtonGroup(this.buttongroup);
            this.list.deactivate();
            this.doStateTransition("HIDDEN")
        },
		loadSlots: function() {
            this.buttongroup.clear();
            this.list.clear();
            var d = this.slotIndex,
				e = ig.vars.get("modifier-cards.equip").filter(vvv => (vvv!=null)),
				f = ig.vars.get("modifier-cards.list").filter(function(a) {
						for(var i of e) {
							if(i === a) {
								return false;
							}
						}
						return true;
					});
            for(var h of f) {
				var g = new sc.AlModifierCardDismantleButton(h);
				this.list.addButton(g, false);
            }
		},
		onBackButtonPress: function() {
			sc.menu.optionCurrentTab = 0;
			sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.SHOP_STATE_CHANGED);
		}
	});
	sc.AlModifierCardDismantleButton = sc.ListBoxButton.extend({
		symbolCase: [],
        symbol: [],
		sucText: [],
		starIcon: null,
        init: function(a) {
            this.parent("", 98, 24, void 0, void 0, true);
			this.setData(a);
			for(var i=0; i<3; i++) {
				var g = getModifierIcon(a.modifier[i]);
				this.symbolCase[i] = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), i==2?17:0, 142, 17, 17);
				this.symbolCase[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.symbolCase[i].setPos(2 + (i==2?79:(i*33)), 0);
				this.addChildGui(this.symbolCase[i]);
				this.symbol[i] = new ig.ImageGui(g[0], g[1], g[2], g[3], g[3]);
				this.symbol[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.symbol[i].setPos(5 + (i==2?79:(i*33)), 0);
				this.addChildGui(this.symbol[i]);
				var sucCount = a.tried[i].filter(vvv => vvv==true).length;
				this.sucText[i] = new sc.TextGui((i==2?"\\c[1]-":"\\c[2]+") + sucCount + "\\c[0]", {
					font: sc.fontsystem.smallFont
				});
				this.sucText[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.sucText[i].setPos(5 + (i==2?94:((i*33)+15)), 0);
				this.addChildGui(this.sucText[i]);
			}
			if(a.done === true) {
				this.starIcon = new ig.ImageGui(defaultModifierIcon, 544, 496, 11, 10);
				this.starIcon.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.starIcon.setPos(69, -1);
					this.addChildGui(this.starIcon);
			}
		},
		dismantle: function() {
			for(var i of this.sucText) {
				i.remove();
			}
			for(var i of this.symbol) {
				i.remove();
			}
			for(var i of this.symbolCase) {
				i.remove();
			}
			if(this.starIcon != null) {
				this.starIcon.remove();
			}
			this.setText(ig.lang.get("sc.gui.menu.al-modifier-card.dismantled"));
			this.setData({shattered:true});
			this.setActive(false);
		},
        keepButtonPressed: function() {
            this.keepPressed = true;
            this.setPressed(true);
            this.button.keepPressed = true;
            this.button.setPressed(true)
        },
        unPressButton: function() {
            this.keepPressed = false;
            this.setPressed(false);
            this.button.keepPressed = false;
            this.button.setPressed(false)
        }
	})
	sc.AlModifierCardGuiEnchantList = sc.MenuPanel.extend({
		enchantGui: null,
        list: null,
        buttongroup: null,
		init: function() {
            this.parent();
            this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
            this.setSize(78, 220);
            this.setPos(-201, 0);
            this.list = new sc.ButtonListBox(1, 0, 40);
            this.list.setSize(78, 220);
            this.list.setPos(0, 0);
            this.addChildGui(this.list);
            this.buttongroup = this.list.buttonGroup;
            this.buttongroup.addPressCallback(function(a) {
				if(a.active) {
					this.enchantGui.active();
					this.enchantGui.updateChildren(a);
					this.doStateTransition("TRANSLUCENT")
				}
            }.bind(this));
            this.hook.transitions = {
                DEFAULT: {
                    state: {
                        alpha: 1
                    },
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
                },
                TRANSLUCENT: {
                    state: {
                        alpha: 0.5
                    },
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
                },
                HIDDEN: {
                    state: {
                        alpha: 0,
                        offsetY: -257
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
            this.enchantGui.show();
            this.list.activate();
			sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
            this.doStateTransition("DEFAULT")
		},
        hide: function() {
            sc.menu.buttonInteract.removeButtonGroup(this.buttongroup);
            this.enchantGui.hide();
            this.list.deactivate();
            this.doStateTransition("HIDDEN")
        },
		loadSlots: function() {
            this.buttongroup.clear();
            this.list.clear();
            var f = ig.vars.get("modifier-cards.list").filter(a => a.done === false),
                g = null;
            for(var h = 0; h < f.length; h++) {
                g = f[h];
				g = new sc.AlModifierCardEnchantButton(g);
				this.list.addButton(g, false);
            }
		},
		onBackButtonPress: function() {
			sc.menu.optionCurrentTab = 0;
			sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.SHOP_STATE_CHANGED);
		}
	});
	sc.AlModifierCardEnchantButton = sc.ListBoxButton.extend({
        symbol: [],
        init: function(a) {
            this.parent("", 50, 24, void 0, void 0, true);
			this.setData(a);
			for(var i=0; i<3; i++) {
				var g = getModifierIcon(a.modifier[i]);
				var symbolCase = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), i==2?17:0, 142, 17, 17);
				symbolCase.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				symbolCase.setPos(2 + (i==2?49:(i*19)), 0);
				this.addChildGui(symbolCase);
				symbolCase.doStateTransition("DEFAULT");
				this.symbol[i] = new ig.ImageGui(g[0], g[1], g[2], g[3], g[3]);
				this.symbol[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.symbol[i].setPos(5 + (i==2?49:(i*19)), 0);
				this.addChildGui(this.symbol[i]);
				this.symbol[i].doStateTransition("DEFAULT");
			}
		},
        keepButtonPressed: function() {
            this.keepPressed = true;
            this.setPressed(true);
            this.button.keepPressed = true;
            this.button.setPressed(true)
        },
        unPressButton: function() {
            this.keepPressed = false;
            this.setPressed(false);
            this.button.keepPressed = false;
            this.button.setPressed(false)
        },
		makeItDone: function() {
			var starIcon = new ig.ImageGui(defaultModifierIcon, 544, 496, 11, 10);
				starIcon.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				starIcon.setPos(39, -1);
				this.addChildGui(starIcon);
			this.setActive(false);
		}
	})
	sc.AlModifierCardGuiEnchant = ig.BoxGui.extend({
		transitions: {
			DEFAULT: {
				state: {},
				time: 0.2,
				timeFunction: KEY_SPLINES.LINEAR
			},
			TRANSLUCENT: {
				state: {
					alpha: 0.5
				},
				time: 0.2,
				timeFunction: KEY_SPLINES.LINEAR
			},
			HIDDEN: {
				state: {
					alpha: 0,
					offsetY: 257
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
		modifierData: null,
		enchantResultModal: null,
		enchantListGui: null,
		enchantIcon: [],
		enchantName: [],
		enchantSlotParents: [],
		enchantSlot: [],
		enchantButton: [],
		enchantChance: [],
		buttongroup: null,
		enchantSuccessSound: new ig.Sound("media/sound/puzzle/counter.ogg", 0.5),
		enchantFailSound: new ig.Sound("media/sound/puzzle/elemental-pole-cancel.ogg", 0.5),
		enchantDoneSound: new ig.Sound("media/sound/hud/quest-task-solved.ogg", 0.5),
		init: function() {
			this.parent(400, 220);
			this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
			this.setPos(40, 0);
			this.buttongroup = new sc.ButtonGroup;
			this.buttongroup.addPressCallback(this.onButtonPress.bind(this));
			this.enchantResultModal = new sc.AlModifierCardEnchantResultDialog();
			for(var i=0; i<3; i++) {
				var basePos = (i==2?72:((i-1)*60));
				var symbolCase = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), i==2?17:0, 142, 17, 17);
				symbolCase.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				symbolCase.setPos(8, basePos - 24);
				this.addChildGui(symbolCase);
				symbolCase.doStateTransition("DEFAULT");
				this.enchantIcon[i] = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), 116, 6, 11, 11);
				this.enchantIcon[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.enchantIcon[i].setPos(11, basePos - 24);
				this.addChildGui(this.enchantIcon[i]);
				this.enchantIcon[i].doStateTransition("DEFAULT");
				this.enchantName[i] = new sc.TextGui();
				this.enchantName[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.enchantName[i].setPos(28, basePos - 24);
				this.addChildGui(this.enchantName[i]);
				if(i!=1) {
					this.enchantChance[i] = new sc.TextGui("", {
						font: sc.fontsystem.smallFont
					});
					this.enchantChance[i].setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_CENTER);
					this.enchantChance[i].setPos(12, basePos - 24);
					this.addChildGui(this.enchantChance[i]);
				}
				this.enchantButton[i] = new sc.ButtonGui("\\i[hammer]");
				this.enchantButton[i].keepMouseFocus = true;
				this.enchantButton[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.enchantButton[i].setPos(8, basePos);
				this.enchantButton[i].submitSound = null;
				this.enchantButton[i].setData(i);
				this.buttongroup.addFocusGui(this.enchantButton[i], 0, i);
				this.addChildGui(this.enchantButton[i]);
				this.enchantSlotParents[i] = new ig.GuiElementBase();
				this.enchantSlotParents[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.enchantSlotParents[i].setPos(52, basePos);
				this.addChildGui(this.enchantSlotParents[i]);
			}
			this.doStateTransition("HIDDEN", true)
		},
		show: function() {
			this.doStateTransition("TRANSLUCENT")
		},
		active: function() {
            sc.menu.buttonInteract.pushButtonGroup(this.buttongroup);
			sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
			this.doStateTransition("DEFAULT")
		},
		deactive: function() {
            sc.menu.buttonInteract.removeButtonGroup(this.buttongroup);
			this.doStateTransition("TRANSLUCENT")
		},
		hide: function() {
			this.doStateTransition("HIDDEN")
		},
		updateChildren: function(a) {
			this.modifierData = a;
			for(var slotParent of this.enchantSlotParents) {
				slotParent.removeAllChildren();
			}
			this.updateChildrenChance();
			for(var i=0; i<3; i++) {
				var g = getModifierIcon(a.data.modifier[i]);
				this.enchantIcon[i].setImage(g[0], g[1], g[2], g[3], g[3]);
				this.enchantName[i].setText(ig.lang.get("sc.gui.menu.equip.modifier."+a.data.modifier[i]));
				this.enchantSlot[i] = new sc.AlModifierCardEnchantSlot(i, a.data);
				this.enchantSlot[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.enchantSlot[i].updateSlotAll(a.data.tried[i]);
				if(a.data.tried[i].length >= a.data.size) {
					this.enchantButton[i].setActive(false);
					this.enchantButton[i].setText("\\i[hammer_grey]");
				}else {
					this.enchantButton[i].setActive(true);
					this.enchantButton[i].setText("\\i[hammer]");
				}
				this.enchantSlotParents[i].addChildGui(this.enchantSlot[i]);
			}
		},
		updateChildrenChance: function() {
			for(var i=0; i<3; i+=2) {
				this.enchantChance[i].setText(ig.lang.get("sc.gui.menu.al-modifier-card." + (i==0?"increase":"decrease")) + Math.round(this.modifierData.data.chance*100) + "%");
			}
		},
		onButtonPress: function(b) {
			var isSuccess = Math.random()<this.modifierData.data.chance;
			this.modifierData.data.tried[b.data].push(isSuccess);
			this.modifierData.data.chance = Math.min(0.75, Math.max(0.25, this.modifierData.data.chance + (isSuccess?(-0.1):0.1)));
			this.updateChildrenChance();
			this.enchantSlot[b.data].updateSlot(this.modifierData.data.tried[b.data]);
			if(this.modifierData.data.tried[b.data].length >= this.modifierData.data.size) {
				b.setActive(false);
				b.setText("\\i[hammer_grey]");
			}
			var totalTried = 0;
			for(var i=0; i<3; i++) {
				totalTried += this.modifierData.data.tried[i].length;
			}
			if(totalTried >= this.modifierData.data.size*3) {
				this.modifierData.data.done = true;
				this.modifierData.makeItDone();
				ig.gui.addGuiElement(this.enchantResultModal);
				this.enchantResultModal.show(this.modifierData.data);
				this.enchantDoneSound.play();
			}else {
				if(isSuccess) {
					this.enchantSuccessSound.play();
				}else {
					this.enchantFailSound.play();
				}
			}
		},
		onBackButtonPress: function() {
			this.deactive();
			sc.menu.popBackCallback();
			this.enchantListGui.doStateTransition("DEFAULT")
		}
	});
	sc.AlModifierCardEnchantSlot = ig.GuiElementBase.extend({
		slotGap: 0,
		slotType: false,
		modifierData: false,
		noPercentData: 0,
		init: function(a, b) {
			this.parent();
			const dbs = ig.arcaneLabDatabase.get("modifierCards");
			const dbl = dbs.both.concat(dbs.positive, dbs.negative);
			this.slotGap = (300/Math.max(1, b.size-1));
			this.modifierData = dbl.filter(vvv => vvv.modifier==b.modifier[a])[0];
			this.slotType = a==2?true:false;
			for(var i=0; i<b.size; i++) {
				var slotImg = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), a==2?0:22, 0, 22, 22);
				slotImg.setPos(this.slotGap * i, 0);
				slotImg.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.addChildGui(slotImg);
			}
		},
		updateSlot: function(a) {
			var isSuccess = a[a.length - 1];
			var gemImg = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), isSuccess?(this.slotType?44:66):88, 0, 22, 22);
			if(isSuccess) {
				this.noPercentData++;
				this.addSlotText(gemImg, this.noPercentData);
			}
			gemImg.setPos(this.slotGap * (a.length - 1), 0);
			gemImg.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
			this.addChildGui(gemImg);
			var gemImgEffect = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), 132, 0, 22, 22);
			if(isSuccess) {
				gemImgEffect.setAnimation([0, 1, 2, 3, 4, 5, 6], 0.04, 7, false);
				gemImgEffect.setPos(this.slotGap * (a.length - 1), 0);
				gemImgEffect.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.addChildGui(gemImgEffect);
			}
		},
		updateSlotAll: function(a) {
			for(var i=0; i<a.length; i++) {
				var gemImg = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), a[i]?(this.slotType?44:66):88, 0, 22, 22);
				if(a[i]) {
					this.noPercentData++;
					this.addSlotText(gemImg, this.noPercentData);
				}
				gemImg.setPos(this.slotGap * i, 0);
				gemImg.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.addChildGui(gemImg);
			}
		},
		addSlotText: function(a, b) {
			var textInsert;
			if(this.modifierData.noPercent) {
				textInsert = (b>this.modifierData.required?"\\c[3]":(this.slotType?"\\c[1]":"\\c[2]")) + "(" + b + "/" + this.modifierData.required + ")";
			}else {
				textInsert = (this.slotType?"\\c[1]-":"\\c[2]+") + Math.round(this.modifierData.amount*100) + "%\\c[0]";
			}
			var statAmount = new sc.TextGui(textInsert, {
				font: sc.fontsystem.tinyFont
			});
			statAmount.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_BOTTOM);
			statAmount.setPos(0, -10);
			a.addChildGui(statAmount);
		}
	});
	sc.AlModifierCardEnchantResultDialog = sc.ModalButtonInteract.extend({
		modifierIcon: [],
		modifierName: [],
		slotResult: [],
		init: function() {
			this.parent(ig.lang.get("sc.gui.menu.al-modifier-card.enchant")+ig.lang.get("sc.gui.menu.al-modifier-card.result"), null, [ig.lang.get("sc.gui.menu.al-modifier-card.obtain")], this.onDialogCallback.bind(this));
            this.msgBox.centerBox.hook.localAlpha = 1;
            this.textGui.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
			for(var i=0; i<3; i++) {
				var mm = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), i==2?0:22, 0, 22, 22);
				mm.setPos(16, -32 + (i*48));
				mm.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.content.addChildGui(mm);
				var mmm = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), i==2?44:66, 0, 22, 22);
				mm.addChildGui(mmm);
				this.modifierIcon[i] = new ig.ImageGui(defaultModifierIcon, sc.MODIFIER_ICON_DRAW.X, sc.MODIFIER_ICON_DRAW.Y, sc.MODIFIER_ICON_DRAW.SIZE, sc.MODIFIER_ICON_DRAW.SIZE);
				this.modifierIcon[i].setPos(16, -55 + (i*48));
				this.modifierIcon[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.content.addChildGui(this.modifierIcon[i]);
				this.modifierName[i] = new sc.TextGui();
				this.modifierName[i].setPos(28, -55 + (i*48));
				this.modifierName[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.content.addChildGui(this.modifierName[i]);
				this.slotResult[i] = new sc.TextGui("", {
					font: sc.fontsystem.smallFont
				});
				this.slotResult[i].setPos(40, -32 + (i*48));
				this.slotResult[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
				this.content.addChildGui(this.slotResult[i]);
			}
            this.content.setSize(200, 200);
            this.msgBox.resize();
		},
		show: function(a) {
			const dbs = ig.arcaneLabDatabase.get("modifierCards");
			const dbl = dbs.both.concat(dbs.positive, dbs.negative);
			for(var i=0; i<3; i++) {
				var g = getModifierIcon(a.modifier[i]);
				this.modifierIcon[i].setImage(g[0], g[1], g[2], g[3], g[3]);
				this.modifierName[i].setText(ig.lang.get("sc.gui.menu.equip.modifier."+a.modifier[i]));
				var modifierData = dbl.filter(vvv => vvv.modifier==a.modifier[i])[0],
					h = a.tried[i].filter(vvv => vvv==true),
					textInsert = "";
				if(modifierData.noPercent) {
					textInsert = (h.length>modifierData.required?"\\c[3]":(i==2?"\\c[1]":"\\c[2]")) + "(" + h.length + "/" + modifierData.required + ")\\c[0]";
				}else {
					textInsert = (i==2?"\\c[1]-":"\\c[2]+") + Math.round(h.length*modifierData.amount*100) + "%\\c[0]";
				}
				this.slotResult[i].setText(textInsert);
			}
			this.parent();
		},
		onDialogCallback: function(b) {
			this.hide();
		}
	});
	
	
	

	sc.AlModifierCardGuiEquip = ig.GuiElementBase.extend({
		transitions: {
			DEFAULT: {
				state: {},
				time: 0.2,
				timeFunction: KEY_SPLINES.LINEAR
			},
			HIDDEN: {
				state: {
					alpha: 0,
					offsetY: -257
				},
				time: 0.2,
				timeFunction: KEY_SPLINES.LINEAR
			}
		},
		equipImage: [],
		equipButton: [],
		buttongroup: null,
		equipList: null,
		listOpened: false,
		init: function() {
			this.parent();
			this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
			this.buttongroup = new sc.ButtonGroup;
			this.buttongroup.addPressCallback(this.onButtonPress.bind(this));
			var buttonLangGet = ["default", "neutral", "heat", "cold", "shock", "wave"];
			for(var i=0; i<6; i++) {
				this.equipImage[i] = new sc.AlModifierCardGuiEquipSlotImage(i);
				this.equipImage[i].setPos((Math.floor(i/2)-1)*160, (((i%2)-0.5)*120)-24);
				this.equipImage[i].setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
				this.addChildGui(this.equipImage[i]);
				this.equipButton[i] = new sc.ButtonGui(ig.lang.get("sc.gui.combat."+buttonLangGet[i]), 75);
				this.equipButton[i].keepMouseFocus = true;
				this.equipButton[i].setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
				this.equipButton[i].setPos((Math.floor(i/2)-1)*160, (((i%2)-0.5)*120)+24);
				this.equipButton[i].hook.transitions = {
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
				};
				this.equipButton[i].setData(i);
				this.buttongroup.addFocusGui(this.equipButton[i], Math.floor(i/2), i%2);
				this.addChildGui(this.equipButton[i]);
			}
			this.doStateTransition("HIDDEN", true)
		},
		show: function() {
            sc.menu.buttonInteract.pushButtonGroup(this.buttongroup);
			sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
			this.doStateTransition("DEFAULT");
		},
		hide: function() {
            sc.menu.buttonInteract.removeButtonGroup(this.buttongroup);
			this.doStateTransition("HIDDEN")
		},
		onButtonPress: function(b) {
			this.equipList.slotIndex = b.data;
			this.equipList.show();
			for(var i=0; i<6; i++) {
				this.equipButton[i].doStateTransition("HIDDEN");
			}
			this.doPosTranstition(-b.hook.pos.x + 24, -b.hook.pos.y + 48, 0.4, KEY_SPLINES.EASE);
			this.listOpened = true;
		},
		onBackButtonPress: function() {
			if(this.listOpened) {
				this.equipList.hide();
				for(var i=0; i<6; i++) {
					this.equipButton[i].doStateTransition("DEFAULT");
				}
				this.doPosTranstition(0, 0, 0.4, KEY_SPLINES.EASE);
				this.listOpened = false;
			}else {
				sc.menu.optionCurrentTab = 0;
				sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.SHOP_STATE_CHANGED);
			}
		}
	});
	sc.AlModifierCardGuiEquipSlotImage = ig.GuiElementBase.extend({
		elementType: 0,
		modifierIcon: [],
		modifierAmount: [],
		init: function(a) {
			this.parent();
			this.elementType = a;
			var equipInfoImg = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), Math.floor(a/2)*88, 22+((a%2)*60), 88, 60);
			equipInfoImg.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
			this.addChildGui(equipInfoImg);
			for(var i=0; i<3; i++) {
				this.modifierIcon[i] = new ig.ImageGui();
				this.modifierIcon[i].setPos(i==2?-12:-31, i==2?-17:2+(i*14));
				this.addChildGui(this.modifierIcon[i]);
				this.modifierAmount[i] = new sc.TextGui();
				this.modifierAmount[i].setPos(i==2?2:-17, i==2?-19:(i*13));
				this.addChildGui(this.modifierAmount[i]);
			}
			this.updateModifier();
		},
		updateModifier: function() {
			const dbs = ig.arcaneLabDatabase.get("modifierCards");
			const dbl = dbs.both.concat(dbs.positive, dbs.negative);
			var getModifier = ig.vars.get("modifier-cards.equip")[this.elementType];
			if(getModifier == null || getModifier.unequip) {
				for(var i=0; i<3; i++) {
					this.modifierIcon[i].setImage(new ig.Image("media/gui/al-modifier-card.png"), 34, 142, 11, 11);
					this.modifierAmount[i].setText("-");
				}
			}else {
				for(var i=0; i<3; i++) {
					var g = getModifierIcon(getModifier.modifier[i]);
					this.modifierIcon[i].setImage(g[0], g[1], g[2], g[3], g[3]);
					var modifierData = dbl.filter(vvv => vvv.modifier==getModifier.modifier[i])[0],
						h = getModifier.tried[i].filter(vvv => vvv==true),
						textInsert = "";
					if(modifierData.noPercent) {
						textInsert = (i==2?"\\c[1]":"\\c[2]") + h.length + "/" + modifierData.required + "\\c[0]";
					}else {
						textInsert = (i==2?"\\c[1]-":"\\c[2]+") + Math.round(h.length*modifierData.amount*100) + "%\\c[0]";
					}
					this.modifierAmount[i].setText(textInsert);
				}
			}
		}
	});
	sc.AlModifierCardGuiEquipList = sc.MenuPanel.extend({
        list: null,
        buttongroup: null,
		equipGui: null,
		slotIndex: 0,
		init: function() {
            this.parent();
            this.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
            this.setSize(126, 220);
            this.setPos(5, 0);
            this.list = new sc.ButtonListBox(1, 0, 40);
            this.list.setSize(126, 220);
            this.list.setPos(0, 0);
            this.addChildGui(this.list);
            this.buttongroup = this.list.buttonGroup;
            this.buttongroup.addPressCallback(function(a) {
				if(a.data == null || a.data.unequip) {
					ig.vars.get("modifier-cards.equip")[this.slotIndex] = null;
				}else {
					a.data.indexData = ig.vars.get("modifier-cards.list").indexOf(a.data);
				ig.vars.get("modifier-cards.equip")[this.slotIndex] = a.data;
				}
				this.equipGui.equipImage[this.slotIndex].updateModifier();
				sc.model.player.updateStats();
				sc.BUTTON_SOUND.equip.play();
            }.bind(this));
            this.hook.transitions = {
                DEFAULT: {
                    state: {
                        alpha: 1
                    },
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
                },
                TRANSLUCENT: {
                    state: {
                        alpha: 0.5
                    },
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
                },
                HIDDEN: {
                    state: {
                        alpha: 0,
                        offsetY: -257
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
            this.buttongroup.clear();
            this.list.clear();
            var d = this.slotIndex,
				e = ig.vars.get("modifier-cards.equip").filter(vvv => (vvv!=null && vvv!=ig.vars.get("modifier-cards.equip")[d])),
				f = ig.vars.get("modifier-cards.list").filter(function(a) {
						if(a.done === true) {
							for(var i of e) {
								if(i === a) {
									return false;
								}
							}
							return true;
						}
						return false;
					}),
                g = null;
            for(var h = -1; h < f.length; h++) {
                g = h==-1?null:f[h];
				g = new sc.AlModifierCardEquipButton(g);
				this.list.addButton(g, false);
            }
		}
	});
	sc.AlModifierCardEquipButton = sc.ListBoxButton.extend({
        symbol: [],
        init: function(a) {
            this.parent("", 98, 24, void 0, void 0, true);
			this.button.submitSound = null;
			if(a == null) {
				this.setText(ig.lang.get("sc.gui.menu.al-modifier-card.unequip"));
				this.setData({unequip:true});
			}else {
				this.setData(a);
				for(var i=0; i<3; i++) {
					var g = getModifierIcon(a.modifier[i]);
					var symbolCase = new ig.ImageGui(new ig.Image("media/gui/al-modifier-card.png"), i==2?17:0, 142, 17, 17);
					symbolCase.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
					symbolCase.setPos(6 + (i==2?75:(i*33)), 0);
					this.addChildGui(symbolCase);
					symbolCase.doStateTransition("DEFAULT");
					this.symbol[i] = new ig.ImageGui(g[0], g[1], g[2], g[3], g[3]);
					this.symbol[i].setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
					this.symbol[i].setPos(9 + (i==2?75:(i*33)), 0);
					this.addChildGui(this.symbol[i]);
					var sucCount = a.tried[i].filter(vvv => vvv==true).length,
						sucText = new sc.TextGui((i==2?"\\c[1]-":"\\c[2]+") + sucCount + "\\c[0]", {
						font: sc.fontsystem.smallFont
					});
					sucText.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
					sucText.setPos(9 + (i==2?90:((i*33)+15)), 0);
					this.addChildGui(sucText);
				}
			}
		},
        keepButtonPressed: function() {
            this.keepPressed = true;
            this.setPressed(true);
            this.button.keepPressed = true;
            this.button.setPressed(true)
        },
        unPressButton: function() {
            this.keepPressed = false;
            this.setPressed(false);
            this.button.keepPressed = false;
            this.button.setPressed(false)
        }
	})
	
});

ig.module("game.feature.menu.al-modifier-card").requires("game.feature.menu.menu-model")
.defines(function() {
	sc.MENU_SUBMENU.AL_MODIFIER_CARD = Math.max(...Object.values(sc.MENU_SUBMENU)) + 1;
	sc.SUB_MENU_INFO[sc.MENU_SUBMENU.AL_MODIFIER_CARD] = {
		Clazz: sc.AlModifierCardMenu,
		name: "al-modifier-card"
	};
});