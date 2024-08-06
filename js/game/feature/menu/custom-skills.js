ig.module("game.feature.menu.gui.al-skill-menu").requires("impact.feature.gui.gui", "impact.feature.gui.base.basic-gui").defines(function() {
	sc.AlSkillMenu = sc.BaseMenu.extend({
        helpGui: null,
        bg: null,
		elementBox: [],
		elementSelecter: null,
		elementStartMenu: null,
		skillSelecter: null,
        init: function() {
            this.parent();
            this.hook.size.x = ig.system.width;
            this.hook.size.y = ig.system.height;
			sc.menu.setOptionTab(0);
            this.bg = new sc.AlSkillMenuContainer;
            this.addChildGui(new sc.DummyContainer(this.bg));
			for(var i=0; i<6; i++) {
				this.elementBox[i] = new sc.AlSkillSetMenu(i);
				this.addChildGui(this.elementBox[i]);
			}
			this.elementSelecter = new sc.AlSkillGroupSelectMenu;
			this.addChildGui(this.elementSelecter);
			this.elementStartMenu = new sc.AlSkillStartMenu;
			this.addChildGui(this.elementStartMenu);
			this.skillSelecter = new sc.AlCurrentSkillListMenu;
			this.addChildGui(this.skillSelecter);
            this.doStateTransition("DEFAULT")
        },
        addObservers: function() {
            sc.Model.addObserver(sc.menu, this);
            this.bg.addObservers()
        },
        removeObservers: function() {
            sc.Model.removeObserver(sc.menu, this);
			this.bg.removeObservers()
        },
        showMenu: function() {
            this.addObservers();
            sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
            ig.interact.setBlockDelay(0.2);
            this.onAddHotkeys();
            this.bg.show();
			for(var boxes of this.elementBox) {
				boxes.show();
			}
            this.elementSelecter.show();
            this.elementStartMenu.show()
        },
        hideMenu: function() {
            this.removeObservers();
            this.exitMenu()
        },
        exitMenu: function() {
            this.bg.hide();
			for(var boxes of this.elementBox) {
				boxes.hide();
			}
			this.elementSelecter.hide();
			this.elementStartMenu.hide()
        },
        onAddHotkeys: function(b) {
            this.commitHotKeysToTopBar(b)
        },
        commitHotKeysToTopBar: function(b) {
            sc.menu.commitHotkeys(b)
        },
        onBackButtonPress: function() {
            sc.menu.popBackCallback();
            sc.menu.popMenu()
        },
        modelChanged: function(b, a, d) {
            if (b == sc.menu) {
				if (a == sc.MENU_EVENT.SKILL_TREE_SELECT) {
					if(sc.menu.skillSwapMoved) {
						this.elementSelecter.hide();
						this.elementStartMenu.hide();
						for(var boxes of this.elementBox) {
							if(boxes.currentElement == sc.menu.optionCurrentTab) {
								boxes.doSizeTransition(250, 250, 0.2, 0);
								sc.menu.buttonInteract.pushButtonGroup(boxes.buttongroup);
								sc.menu.pushBackCallback(boxes.onBackButtonPress.bind(boxes));
							} else {
								boxes.hide();
							}
						}
					} else {
						this.elementSelecter.show();
						this.elementStartMenu.show();
						this.skillSelecter.hide();
						for(var boxes of this.elementBox) {
							if(boxes.currentElement == sc.menu.optionCurrentTab) {
								boxes.doSizeTransition(150, 140, 0.2, 0);
								sc.menu.buttonInteract.removeButtonGroup(boxes.buttongroup);
							} else {
								boxes.show();
							}
						}
						sc.menu.popBackCallback();
					}
				} else if (a == sc.MENU_EVENT.SKILL_NODE_SELECT) {
					this.skillSelecter.show();
				} else if (a == sc.MENU_EVENT.SKILL_NODE_EXIT) {
					this.skillSelecter.hide();
					sc.menu.popBackCallback();
				} else if (a == sc.MENU_EVENT.SKILL_SHOW_EFFECT) {
					for(var eBox of this.elementBox) {
						for(var eImg of eBox.skillSlot) {
							if(eImg !== undefined) {
								eImg.reloadImage() //todo: should optimize
							}
						}
					}
				}
			}
		}
    });
	sc.AlSkillMenuContainer = ig.GuiElementBase.extend({
        gfx: new ig.Image("media/gui/al-custom-skill.png"),
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
        patternSheet: null,
		scroll: 0,
		init: function(){
			this.parent();
            this.setSize(ig.system.width, ig.system.height);
            this.setPivot(ig.system.width / 2, ig.system.height / 2);
			this.patternSheet = this.gfx.createPattern(0, 0, 64, 64, ig.ImagePattern.OPT.REPEAT_X_AND_Y);
			this.doStateTransition("HIDDEN", true)
		},
		update: function() {
			this.scroll = this.scroll - ig.system.actualTick * 6;
		},
		updateDrawables: function(a) {
			a.addColor("#0e0e0e", 0, 0, this.hook.size.x, this.hook.size.y);
			//a.addColor("#405390", 0, 0, this.hook.size.x, this.hook.size.y);//base
			//a.addColor("#535360", 0, 0, this.hook.size.x, this.hook.size.y);//neutral
			//a.addColor("#c32c01", 0, 0, this.hook.size.x, this.hook.size.y);//heat
			//a.addColor("#215bbd", 0, 0, this.hook.size.x, this.hook.size.y);//cold
			//a.addColor("#8b307b", 0, 0, this.hook.size.x, this.hook.size.y);//shock
			//a.addColor("#017977", 0, 0, this.hook.size.x, this.hook.size.y);//wave
			//todo: GLOWING BACKGROUND
			a.addPattern(this.patternSheet, 0, 0, this.scroll/2, this.scroll, this.hook.size.x, this.hook.size.y);
		},
		show: function() {
            this.doScrollTransition(sc.menu.mapCamera.x, sc.menu.mapCamera.y, 0, KEY_SPLINES.LINEAR);
            this.doStateTransition("DEFAULT", false, false, function() {
                this._alpha = this._alphaTimer = 0
            }.bind(this))
		},
		hide: function() {
            this.doStateTransition("HIDDEN")
		},
        addObservers: function() {
            sc.Model.addObserver(sc.menu, this)
        },
        removeObservers: function() {
            sc.Model.removeObserver(sc.menu, this)
        },
		modelChanged: function() {}
	});
    sc.AlSkillStartMenu = ig.BoxGui.extend({
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
                    offsetY: -257
                },
                time: 0.2,
                timeFunction: KEY_SPLINES.LINEAR
            }
        },
        buttonCustom: null,
        buttongroup: null,
        init: function() {
            this.parent(162, 35);
            this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
            this.setSize(162, 35);
            this.setPos(0, 55);
            this.buttongroup = new sc.ButtonGroup;
            this.buttongroup.addPressCallback(this.onButtonPress.bind(this));
            this.buttonCustom = new sc.ButtonGui(ig.lang.get("sc.gui.menu.al-custom-skill.custom"), 150);
            this.buttonCustom.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
            this.buttonCustom.setPos(0, 1);
            this.buttonCustom.setData(0);
            this.addChildGui(this.buttonCustom);
            this.buttongroup.addFocusGui(this.buttonCustom, 0, 0);
            this.doStateTransition("HIDDEN", true)
        },
        show: function() {
            sc.menu.buttonInteract.pushButtonGroup(this.buttongroup);
            sc.menu.setInfoText("", true);
            this.doStateTransition("DEFAULT")
        },
        hide: function(b, a) {
            sc.menu.buttonInteract.removeButtonGroup(this.buttongroup);
            this.doStateTransition("HIDDEN", a)
        },
        onButtonPress: function(b) {
			sc.menu.skillSwapMoved = true;
			sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.SKILL_TREE_SELECT);
        }
    });
	sc.AlSkillGroupSelectMenu = sc.MenuPanel.extend({
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
        pageText: null,
        cycleLeft: null,
        cycleRight: null,
		elementList: ["base", "neutral", "heat", "cold", "shock", "wave"],
		init: function() {
            this.parent();
            this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
            this.setSize(158, 21);
            this.setPos(0, 29);
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
            sc.menu.buttonInteract.addGlobalButton(this.cycleLeft, this.onLeftPressCheck.bind(this), true);
            sc.menu.buttonInteract.addGlobalButton(this.cycleRight, this.onRightPressCheck.bind(this), true);
            this.doStateTransition("DEFAULT");
			this.pageText.setText(ig.lang.get("sc.gui.menu.al-custom-skill."+this.elementList[sc.menu.optionCurrentTab]));
		},
		hide: function() {
            sc.menu.buttonInteract.removeGlobalButton(this.cycleLeft);
            sc.menu.buttonInteract.removeGlobalButton(this.cycleRight);
            this.doStateTransition("HIDDEN")
		},
        cycleGroups: function(b) {
			var d = sc.menu.optionCurrentTab + b;
			b < 0 ? d < 0 && (d = 5) : b > 0 && d >= 6 && (d = 0);
			sc.menu.setOptionTab(d);
			this.pageText.setText(ig.lang.get("sc.gui.menu.al-custom-skill."+this.elementList[sc.menu.optionCurrentTab]))
        },
        onLeftPressCheck: function() {
            return sc.control.menuCircleLeft()
			//return sc.control.menuListUp()
        },
        onRightPressCheck: function() {
            return sc.control.menuCircleRight()
			//return sc.control.menuListDown()
        }
	});
    sc.AlSkillSetMenu = ig.BoxGui.extend({
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
        ninepatch: new ig.NinePatch("media/gui/al-custom-skill.png", {
            width: 8,
            height: 8,
            left: 26,
            top: 26,
            right: 26,
            bottom: 26,
            offsets: {
                "base": {
                    x: 0,
                    y: 88
                },
                neutral: {
                    x: 0,
                    y: 148
                },
                heat: {
                    x: 60,
                    y: 88
                },
                cold: {
                    x: 120,
                    y: 88
                },
                shock: {
                    x: 60,
                    y: 148
                },
                wave: {
                    x: 120,
                    y: 148
                }
            }
        }),
		currentElement: 0,
		elementList: ["base", "neutral", "heat", "cold", "shock", "wave"],
		menuBoxesRotate: 0,
		skillSlot: [],
        sizeTransition: null,
        buttongroup: null,
		buttonCustom: [],
        init: function(a) {
            this.parent(150, 140);
            this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
            this.buttongroup = new sc.ButtonGroup(false, ig.BUTTON_GROUP_SELECT_TYPE.ALL);
            this.buttongroup.addSelectionCallback(function(a) {
				sc.menu.optionLastButtonData = a.data;
                if (a.data && a.data != 1) {
                    sc.menu.setInfoText(a.data.description ? a.data.description : a.data);
				}
            }.bind(this));
            this.buttongroup.setMouseFocusLostCallback(function() {
                sc.menu.setInfoText("", true);
				sc.menu.optionLastButtonData = null;
            }.bind(this));
            this.buttongroup.addPressCallback(this.onButtonPress.bind(this));
			this.currentElement = a;
			this.currentTileOffset = this.elementList[a];
			this.menuBoxesRotate = (6-a)*60;
			var slotX = 0,
				slotY = 0,
				blackList = [-1, -1, 8, 10, 11, 9];
			for(var i=0;(a>0)?(a==1?(i<8):(i<12)):(i<4);i++) {
				if(i != blackList[a]) {
					this.skillSlot[i] = new sc.AlSkillSlotImage(a, i, slotX*32 - (a>0?4:2)*16 + 16, slotY*32 - (a>1?4:2)*8);
					this.addChildGui(this.skillSlot[i]);
					this.buttongroup.addFocusGui(this.skillSlot[i].skillSlotButton, slotX, slotY);
				}
				slotX += 1;
				if(slotX >= (a>0?4:2)) {
					slotX = 0;
					slotY += 1;
				}
			}
            this.doStateTransition("HIDDEN", true)
        },
		update: function() {
			
			if(sc.menu.skillSwapMoved) {
				this.doPosTranstition(-150, 0, 0.1, KEY_SPLINES.EASE);
			} else {
				var targetAngle = (sc.menu.optionCurrentTab-this.currentElement) * 60;
				var diff = targetAngle - this.menuBoxesRotate;
				while (diff > 180) {
					diff -= 360;
				}
				while (diff < -180) {
					diff += 360;
				}
				if(Math.abs(diff) < 5.7) {
					this.menuBoxesRotate = targetAngle;
				} else {
					this.menuBoxesRotate += Math.sign(diff) * 9;
				}
				this.doPosTranstition(-Math.sin((Math.PI/180)*this.menuBoxesRotate)*255, -130+Math.cos((Math.PI/180)*this.menuBoxesRotate)*180, 0.1, KEY_SPLINES.EASE);
			}
			
            if (this.sizeTransition) {
                this.sizeTransition.timer = this.sizeTransition.timer + ig.system.actualTick;
                var b = Math.min(1, Math.max(0, this.sizeTransition.timer) / this.sizeTransition.time),
                    b = this.sizeTransition.timeFunction.get(b);
                this.hook.size.x = Math.round(this.sizeTransition.startWidth *
                    (1 - b) + this.sizeTransition.width * b);
                this.hook.size.y = Math.round(this.sizeTransition.startHeight * (1 - b) + this.sizeTransition.height * b);
                if (b == 1) this.sizeTransition = null
            }
			
		},
        updateDrawables: function(a) {
            this.parent(a);
        },
        doSizeTransition: function(b, a, d, c) {
            this.sizeTransition = {
                startWidth: this.hook.size.x,
                width: b || 0,
                startHeight: this.hook.size.y,
                height: a || 0,
                time: d,
                timeFunction: KEY_SPLINES.EASE,
                timer: 0 - (c || 0)
            }
        },
        show: function(a) {
            this.doStateTransition("DEFAULT");
            this.active = true
        },
        hide: function(a) {
            this.doStateTransition("HIDDEN", a);
            this.active = false
        },
        onBackButtonPress: function() {
			sc.menu.skillSwapMoved = false;
			sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.SKILL_TREE_SELECT)
        },
        onButtonPress: function(b) {
			sc.menu.currentSkillFocus = b;
			sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.SKILL_NODE_SELECT);
        }
    });
	sc.AlSkillSlotImage = ig.GuiElementBase.extend({
		gfx: new ig.Image("media/gui/al-custom-skill.png"),
		vanillaIcons: new ig.Image("media/gui/circuit-icons.png"),
		baseIcons: new ig.Image("media/gui/custom-skills/base-skills.png"),
		lockIcon: new ig.Image("media/gui/custom-skills/locked.png"),
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
		slotImgPos: {
			0: {
				x: 64,
				y: 0
			},
			1: {
				x: 64,
				y: 44
			},
			2: {
				x: 108,
				y: 0
			},
			3: {
				x: 152,
				y: 0
			},
			4: {
				x: 108,
				y: 44
			},
			5: {
				x: 152,
				y: 44
			}
		},
		iconSlot: null,
		icon: {},
		locked: false,
		customIcon: null,
		currentAction: null,
		assignedPos: {},
		curTrans: 0,
		currentElement: 0,
		skillSlotButton: null,
		baseSkillList: [
			"THROW_NORMAL",
			"ATTACK",
			"DASH",
			"GUARD"
		],
		elementSkillList: [
			"THROW_SPECIAL1",
			"ATTACK_SPECIAL1",
			"DASH_SPECIAL1",
			"GUARD_SPECIAL1",
			"THROW_SPECIAL2",
			"ATTACK_SPECIAL2",
			"DASH_SPECIAL2",
			"GUARD_SPECIAL2",
			"THROW_SPECIAL3",
			"ATTACK_SPECIAL3",
			"DASH_SPECIAL3",
			"GUARD_SPECIAL3"
		],
		init: function(a, b, x, y) {
			this.parent();
            this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
			this.setPos(x, y);
			this.assignedPos.x = x;
			this.assignedPos.y = y;
			this.currentElement = a;
			if(a>0) {
				this.currentAction = this.elementSkillList[b];
				var getSkill = null,
					q = sc.model.player.getActiveCombatArt(a-1, sc.PLAYER_ACTION[this.currentAction]);
				if(q) {
					getSkill = sc.model.player.getCombatArt(a-1, q.name);
					this.icon.src = this.vanillaIcons;
					this.icon.offX = getSkill.icon % 10 * 24;
					this.icon.offY = Math.floor(getSkill.icon / 10) * 24;
				} else {
					this.icon.src = this.lockIcon;
					this.icon.offX = this.icon.offY = 0;
					this.locked = true;
				}
			} else {
				this.currentAction = this.baseSkillList[b];
				this.icon.src = this.baseIcons;
				this.icon.offX = b * 24;
				this.icon.offY = 0;
			}
			this.skillSlotButton = new sc.AlSkillSlotButton(a, b);
			this.addChildGui(this.skillSlotButton);
			this.reloadImage();
			this.doStateTransition("DEFAULT");
		},
		update: function() {
			var tranX = this.assignedPos.x,
				tranY = this.assignedPos.y;
			if(sc.menu.skillSwapMoved) {
				tranX *= 2;
				tranY *= 2;
				this.curTrans += (1 - this.curTrans)/4;
			} else {
				this.curTrans += (0 - this.curTrans)/4;
			}
			this.doPosTranstition(tranX, tranY, 0.1, KEY_SPLINES.EASE);
		},
		updateDrawables: function(a) {
			a.addGfx(this.gfx, -22, -22, this.slotImgPos[this.currentElement].x, this.slotImgPos[this.currentElement].y, 44, 44).setAlpha(this.curTrans);
			if(this.customIcon) {
				a.addGfx(this.customIcon.src, -12, -12, this.customIcon.offX, this.customIcon.offY, 24, 24);
			} else {
				a.addGfx(this.icon.src, -12, -12, this.icon.offX, this.icon.offY, 24, 24);
			}
			if(this.locked) {
				a.addGfx(this.lockIcon, -12, -12, 24, 0, 24, 24);
			}
		},
		reloadImage: function() { //todo: should optimize
			var dbs = ig.arcaneLabDatabase.get("customSkills"),
				elementList = ["BASE", "NEUTRAL", "HEAT", "COLD", "SHOCK", "WAVE"];
			for (var dbd in dbs) {
				var dbo = dbs[dbd];
				if(ig.vars.get("custom-skills."+elementList[this.currentElement]+"."+dbd) == true && elementList[this.currentElement] == dbo.element && new ig.VarCondition(dbo.activeCondition || "true").evaluate()) {
					for(var dbl of dbo.list) {
						if(dbl.actionCheckKey === this.currentAction) {
							this.customIcon = {};
							this.customIcon.src = new ig.Image(dbo.icon.src);
							this.customIcon.offX = dbo.icon.offX || 0;
							this.customIcon.offY = dbo.icon.offY || 0;
							return;
						}
					}
				}
			}
			this.customIcon = null;
		}
	});
	sc.AlSkillSlotButton = sc.ButtonGui.extend({
		baseSkillList: [
			"THROW_NORMAL",
			"ATTACK",
			"DASH",
			"GUARD"
		],
		elementSkillList: [
			"THROW_SPECIAL1",
			"ATTACK_SPECIAL1",
			"DASH_SPECIAL1",
			"GUARD_SPECIAL1",
			"THROW_SPECIAL2",
			"ATTACK_SPECIAL2",
			"DASH_SPECIAL2",
			"GUARD_SPECIAL2",
			"THROW_SPECIAL3",
			"ATTACK_SPECIAL3",
			"DASH_SPECIAL3",
			"GUARD_SPECIAL3"
		],
		init: function(a, b) {
			var skillButtonData = {
					description: ig.lang.get("sc.gui.menu.al-custom-skill.locked"),
					element: a,
					skill: null
				},
				skillSlotType = {
					height: 44,
					ninepatch: new ig.NinePatch("media/gui/al-custom-skill.png", {
						width: 16,
						height: 0,
						left: 8,
						top: 24,
						right: 8,
						bottom: 0,
						offsets: {
							"default": {
								x: 500,
								y: 0
							},
							focus: {
								x: 500,
								y: 0
							},
							pressed: {
								x: 500,
								y: 0
							}
						}
					}),
					highlight: {
						startX: 196,
						endX: 240,
						leftWidth: 22,
						rightWidth: 22,
						offsetY: 0,
						gfx: new ig.Image("media/gui/al-custom-skill.png"),
						pattern: new ig.ImagePattern("media/gui/al-custom-skill.png",
							0, 0, 15, 24, ig.ImagePattern.OPT.NONE)
					}
				};
			this.parent("", 44, true, skillSlotType);
			this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
			this.setWidth(44);
			this.setHeight(44);
			if(a>0) {
				var getSkill = null,
					q = sc.model.player.getActiveCombatArt(a-1, sc.PLAYER_ACTION[this.elementSkillList[b]]);
				if(q) {
					skillButtonData.skill = this.elementSkillList[b];
					skillButtonData.description = ig.lang.get("sc.gui.menu.al-custom-skill.type."+this.baseSkillList[b%4]) + " " + Math.ceil((b+1)/4) + " - " + sc.model.player.getCombatArt(a-1, q.name).name.value;
				}
			} else {
				skillButtonData.skill = this.baseSkillList[b];
				skillButtonData.description = ig.lang.get("sc.gui.menu.al-custom-skill.base") + " " + ig.lang.get("sc.gui.menu.al-custom-skill.type."+this.baseSkillList[b]);
			}
			this.setData(skillButtonData);
		}
	});
	sc.AlCurrentSkillListMenu = sc.MenuPanel.extend({
		elementList: {
			"BASE": 0,
			"NEUTRAL": 1,
			"HEAT": 2,
			"COLD": 3,
			"SHOCK": 4,
			"WAVE": 5
		},
        list: null,
        buttongroup: null,
		init: function() {
            this.parent();
            this.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_CENTER);
            this.setSize(252, 141);
            this.setPos(5, -36);
            this.setPivot(126, 0);
            this.list = new sc.ButtonListBox(1, 0, 40);
            this.list.setSize(252, 141);
            this.list.setPos(0, 0);
            this.addChildGui(this.list);
            this.buttongroup = this.list.buttonGroup;
            this.buttongroup.addSelectionCallback(function(a) {
				sc.menu.optionLastButtonData = a.data;
                if (a.data && a.data != 1) {
                    sc.menu.setInfoText(a.data.description ? new ig.LangLabel(a.data.description).value : a.data);
				}
            }.bind(this));
            this.buttongroup.setMouseFocusLostCallback(function() {
                sc.menu.setInfoText("", true);
				sc.menu.optionLastButtonData = null;
            }.bind(this));
            this.buttongroup.addPressCallback(function(a) {
				var dbs = ig.arcaneLabDatabase.get("customSkills");
				for (var dbd in dbs) {
					var dbo = dbs[dbd];
					if(a.data.hasWalkAnims && dbo.hasWalkAnims){
						ig.vars.set("custom-skills."+a.data.element+"."+dbd, false);
					}
					if(dbo.element == a.data.element || (a.data.comm == "unequip" && a.data.element == "BASE")) {
						for (var dbl of dbo.list) {
							if(a.data.comm == "unequip") {
								if(dbl.actionCheckKey == sc.menu.currentSkillFocus.data.skill) {
									ig.vars.set("custom-skills."+a.data.element+"."+dbd, false);
									if (dbo.hasWalkAnims){
										ig.vars.set("custom-skills.walk-anims.active", false);
									}
									break;
								}
							} else {
								for (var dbld of a.data.list) {
									if(dbl.actionCheckKey == dbld.actionCheckKey) {
										ig.vars.set("custom-skills."+a.data.element+"."+dbd, false);
										if (dbo.hasWalkAnims){
											ig.vars.set("custom-skills.walk-anims.active", false);
										}
										break;
									}
								}
							}
						}
					}
				}
				var chkElemWA = ig.vars.get("custom-skills.walk-anims.source.element");
				var chkNameWA = ig.vars.get("custom-skills.walk-anims.source.name");
				if(ig.vars.get("custom-skills."+chkElemWA+"."+chkNameWA)){
					ig.vars.set("custom-skills.walk-anims.active", true);
					ig.vars.set("custom-skills.walk-anims.source.element", dbs[chkNameWA].element);
					ig.vars.set("custom-skills.walk-anims.source.name", chkNameWA);
					ig.vars.set("custom-skills.walk-anims.activeCondition", dbs[chkNameWA].activeCondition);
					ig.vars.set("custom-skills.walk-anims.data", dbs[chkNameWA].walkAnims);
				}
				if(a.data.comm != "unequip") {
					ig.vars.set("custom-skills."+a.data.element+"."+a.data.dbId, true);
					if(a.data.hasWalkAnims){
						ig.vars.set("custom-skills.walk-anims.active", true);
						ig.vars.set("custom-skills.walk-anims.source.element", a.data.element);
						ig.vars.set("custom-skills.walk-anims.source.name", a.data.dbId);
						ig.vars.set("custom-skills.walk-anims.activeCondition", a.data.activeCondition);
						ig.vars.set("custom-skills.walk-anims.data", a.data.walkAnims);
					}
				}
				sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.SKILL_SHOW_EFFECT);
            }.bind(this));
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
            sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
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
			var elementListRev = ["BASE", "NEUTRAL", "HEAT", "COLD", "SHOCK", "WAVE"],
				unequipButtonData = {
				name: {"en_US":"- unequip -"},
				description: {"en_US":"Take off your current custom skill curcuit."},
				comm: "unequip",
				element: elementListRev[sc.menu.currentSkillFocus.data.element],
				icon: {
					src: "media/gui/custom-skills/locked.png"
				}
			};
			var unequipButton = new sc.AlCurrentSkillListButton(unequipButtonData);
			unequipButton.setText(ig.lang.get("sc.gui.menu.al-custom-skill.unequip"));
			this.list.addButton(unequipButton, false);
			var dbs = ig.arcaneLabDatabase.get("customSkills");
            for (var dbd in dbs) {
				var dbo = dbs[dbd];
				if(new ig.VarCondition(dbo.activeCondition || "true").evaluate() && sc.menu.currentSkillFocus.data.element == this.elementList[dbo.element]) {
					for(var dbl of dbo.list) {
						if(dbl.actionCheckKey === sc.menu.currentSkillFocus.data.skill) {
							dbo.dbId = dbd;
							this.list.addButton(new sc.AlCurrentSkillListButton(dbo), false);
							break;
						}
					}
				}
            }
		},
		getTeleportEvent: function(a, z) {
            var b = ig.game.playerEntity,
                c = [];
            c.push({
                type: "DO_ACTION",
                entity: ig.game.playerEntity,
                action: [{
                    type: "SET_Z_GRAVITY_FACTOR",
                    value: 0
                }, {
                    type: "SET_Z_VEL",
                    value: 0
                }, {
                    type: "WAIT",
                    time: 5
                }]
            });
            c.push({
                time: 0.2,
                ignoreSlowDown: false,
                type: "WAIT"
            });
            c.push({
                type: "SET_TELEPORT_COLOR",
                lighter: true,
                color: "white"
            });
            c.push({
                color: "white",
                alpha: 1,
                time: 1,
                lighter: true,
                type: "SET_OVERLAY"
            });
            c.push({
                type: "SET_CAMERA_TARGET",
                entity: b,
                speed: "NORMAL",
                transition: "EASE_IN_OUT",
                zoom: 1.5
            });
            c.push({
                time: 0.2,
                ignoreSlowDown: false,
                type: "WAIT"
            });
            c.push({
                type: "SHOW_EFFECT",
                entity: b,
                effect: {
                    sheet: "teleport",
                    name: "hideMapTeleport"
                }
            });
            for (b = sc.party.getPartySize(); b--;) {
                var e = sc.party.getPartyMemberEntityByIndex(b);
                c.push({
                    type: "SHOW_EFFECT",
                    entity: e,
                    effect: {
                        sheet: "teleport",
                        name: "hideFast"
                    }
                })
            }
            c.push({
                time: 1,
                ignoreSlowDown: false,
                type: "WAIT"
            });
            c.push({
                type: "TELEPORT",
                map: a,
                marker: z
            });
            c.push({
                time: 3,
                ignoreSlowDown: false,
                type: "WAIT"
            });
            a = new ig.Event({
                steps: c
            });
            a.addHint("SKIN_ALLOWED");
            return a
        },
        onBackButtonPress: function() {
			sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.SKILL_NODE_EXIT)
        }
	});
	sc.AlCurrentSkillListButton = sc.ListBoxButton.extend({
        symbol: null,
        init: function(a) {
            this.parent(new ig.LangLabel(a.name).value, 228, 24);
			this.setData(a);
            this.symbol = new ig.ImageGui(new ig.Image(a.icon.src), a.icon.offX || 0, a.icon.offY || 0, a.icon.width || 24, a.icon.height || 24);
            this.symbol.hook.transitions = {
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
            this.symbol.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_CENTER);
            this.symbol.setPos(1, 1);
            this.addChildGui(this.symbol);
            this.symbol.doStateTransition("DEFAULT");
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

ig.module("game.feature.menu.al-skill").requires("game.feature.menu.menu-model")
.defines(function() {
	sc.MENU_SUBMENU.AL_CUSTOM_SKILL = Math.max(...Object.values(sc.MENU_SUBMENU)) + 1;
	sc.SUB_MENU_INFO[sc.MENU_SUBMENU.AL_CUSTOM_SKILL] = {
		Clazz: sc.AlSkillMenu,
		name: "al-skill"
	};
});