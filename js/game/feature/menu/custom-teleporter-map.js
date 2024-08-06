//ig.gui.menues.splice(ig.gui.menues.findIndex(m => m.gui instanceof sc.StatusHudGui), 1)
// HUD hide command

ig.module("game.feature.menu.gui.al-telepoter-menu").requires("impact.feature.gui.gui", "impact.feature.gui.base.basic-gui").defines(function() {
	sc.AlTeleportMenu = sc.BaseMenu.extend({
        area: null,
		areaGui: null,
		areaPreview: null,
		areaGroupSelecter: null,
        areaList: null,
        init: function() {
            this.parent();
            this.hook.size.x = ig.system.width;
            this.hook.size.y = ig.system.height;
            this.area = new sc.AlMapAreaContainer;
            this.addChildGui(new sc.DummyContainer(this.area));
            this.areaGui = new sc.AlMapAreaOverGui;
            this.addChildGui(this.areaGui);
            this.areaPreview = new sc.AlAreaPreviewInfo;
            this.addChildGui(this.areaPreview);
			this.areaGroupSelecter = new sc.AlAreaGroupSelectMenu;
            this.addChildGui(this.areaGroupSelecter);
            this.areaList = new sc.AlAreaListMenu;
            this.addChildGui(this.areaList);
            this.doStateTransition("DEFAULT")
        },
		update: function() {
			var dt = sc.menu.optionLastButtonData;
			if(dt && dt.preview) {
				this.areaPreview.show();
				this.areaPreview.icon.setImage(new ig.Image(dt.preview), 0, 0, 142, 80)
			} else {
				this.areaPreview.hide();
			}
		},
        addObservers: function() {
            sc.Model.addObserver(sc.menu, this);
            this.area.addObservers()
        },
        removeObservers: function() {
            sc.Model.removeObserver(sc.menu, this);
			this.area.removeObservers()
        },
        showMenu: function() {
            this.addObservers();
            sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
            ig.interact.setBlockDelay(0.2);
            this.onAddHotkeys();
            this.area.show();
            this.areaGui.show();
            this.areaPreview.show();
            this.areaGroupSelecter.show()
            this.areaList.show()
        },
        hideMenu: function() {
            this.removeObservers();
            this.exitMenu()
        },
        exitMenu: function() {
            this.area.hide();
            this.areaGui.hide();
            this.areaPreview.hide();
            this.areaGroupSelecter.hide()
            this.areaList.hide()
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
				if (a == sc.MENU_EVENT.OPTION_CHANGED_TAB) {
					this.areaList.loadSlots()
					this.area.resetSplineData();
				}
			}
		}
    });
	sc.AlMapAreaContainer = ig.GuiElementBase.extend({
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
		curPos: {
			x: 0,
			y: 0
		},
		curZoom: 1,
		gfxSpline: [],
		scroll: 0,
		init: function(){
			this.parent();
            this.setSize(ig.system.width, ig.system.height);
            this.setPivot(ig.system.width / 4, ig.system.height / 2);
			this.doStateTransition("HIDDEN", true);
			this.resetSplineData();
		},
		update: function() {
			var dt = sc.menu.optionLastButtonData;
			if(dt && dt.pos) {
				this.curPos.x += (-(this.hook.size.x/4)+dt.pos.x - this.curPos.x)/6;
				this.curPos.y += (-(this.hook.size.y/2)+dt.pos.y - this.curPos.y)/6;
				this.curZoom += (2 - this.curZoom)/6;
			} else {
				this.curPos.x += -this.curPos.x/5;
				this.curPos.y += -this.curPos.y/5;
				this.curZoom += (1 - this.curZoom)/5;
			}
			this.scroll = this.scroll+ig.system.actualTick;
		},
        updateDrawables: function(a) {
			this.hook.setScale(this.curZoom, this.curZoom);
            var dbs = ig.arcaneLabDatabase.get("teleporter")[sc.menu.optionCurrentTab],
                dbo = null,
				selectedPoint = -1,
				drawIcons = [];
            for (var h = 0; h < dbs.points.length; h++) {
                dbo = dbs.points[h];
				if(new ig.VarCondition(dbo.showCondition || "true").evaluate()) {
					var pointActive = 0;
					if(JSON.stringify(dbo) === JSON.stringify(sc.menu.optionLastButtonData)) {
						pointActive = 24;
						selectedPoint = h+1;
					}
					drawIcons.push({
						data: dbo,
						srcY: pointActive
					});
				}
            }
			ig.vars.set("tmp.arcaneTeleporter.selectedPoint", selectedPoint);
			var tempImg = null,
				tempPattern = null,
				tempGfx = null;
			
            for (var h = 0; h < dbs.map.length; h++) {
                dbo = dbs.map[h];
				var applyOffset = this.curPos;
				if(dbo.fix) {
					applyOffset = Vec2.createC(0, 0);
				}
				switch(dbo.type) {
					case "IMAGE":
						tempImg = new ig.Image(dbo.img);
						tempGfx = a.addGfx(tempImg, dbo.pos.x-applyOffset.x, dbo.pos.y-applyOffset.y, dbo.src?dbo.src.x:0, dbo.src?dbo.src.y:0, dbo.size?dbo.size.x:tempImg.width, dbo.size?dbo.size.y:tempImg.height).setAlpha(dbo.alpha||1).setCompositionMode(dbo.renderMode||"source-over");
						break;
					case "PATTERN":
						tempImg = new ig.Image(dbo.img);
						tempPattern = tempImg.createPattern(0, 0, tempImg.width, tempImg.height, ig.ImagePattern.OPT.REPEAT_X_AND_Y);
						tempGfx = a.addPattern(tempPattern, dbo.pos.x-applyOffset.x, dbo.pos.y-applyOffset.y, dbo.src?dbo.src.x:0, dbo.src?dbo.src.y:0, dbo.size?dbo.size.x:this.hook.size.x, dbo.size?dbo.size.y:this.hook.size.y).setAlpha(dbo.alpha||1).setCompositionMode(dbo.renderMode||"source-over");
						if(dbo.scroll) {
							tempGfx.setSrc((dbo.scroll.x*this.scroll)+(dbo.src?dbo.src.x:0), (dbo.scroll.y*this.scroll)+(dbo.src?dbo.src.y:0));
						}
						break;
					case "COLOR":
						tempGfx = a.addColor(dbo.color, dbo.pos.x-applyOffset.x, dbo.pos.y-applyOffset.y, dbo.size?dbo.size.x:this.hook.size.x, dbo.size?dbo.size.y:this.hook.size.y).setAlpha(dbo.alpha||1).setCompositionMode(dbo.renderMode||"source-over");
						break;
					default:
						throw new Error("Invaild custom worldmap image type: "+dbo.type);
				}
				if(dbo.move) {
					if(this.gfxSpline[h] === undefined) {
						this.gfxSpline[h] = 0;
					} else if(new ig.VarCondition(dbo.move.condition || "false").evaluate()) {
						this.gfxSpline[h] += ig.system.actualTick/dbo.move.duration;
					} else {
						this.gfxSpline[h] -= ig.system.actualTick/dbo.move.duration;
					}
					this.gfxSpline[h] = this.gfxSpline[h].limit(0,1);
					var lerpPos = Vec2.create();
					Vec2.lerp(dbo.pos, dbo.move.newPos, KEY_SPLINES[dbo.move.keySpline].get(this.gfxSpline[h]), lerpPos);
					tempGfx.setPos(lerpPos.x-applyOffset.x, lerpPos.y-applyOffset.y);
				}
            }
			for(var h = 0; h < drawIcons.length; h++) {
				var dbl = drawIcons[h];
				a.addGfx(new ig.Image(dbl.data.icon), 0, 0, 0, dbl.srcY, 24, 24).setPos(dbl.data.pos.x - this.curPos.x - 12, dbl.data.pos.y - this.curPos.y - 12);
			}
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
		resetSplineData: function() {
			this.gfxSpline = []
		},
		modelChanged: function() {}
	});
	
	sc.AlMapAreaOverGui = ig.GuiElementBase.extend({
        gfxCrosshair: new ig.Image("media/gui/teleporter-map/gui-crosshair.png"),
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
		curTrans: 2,
		init: function(){
			this.parent();
            this.setSize(82, 82);
			this.setPivot(41, 41);
			this.doStateTransition("HIDDEN", true);
		},
		update: function() {
			var dt = sc.menu.optionLastButtonData;
			if(dt && dt.pos) {
				this.curTrans += (1 - this.curTrans)/4;
			} else {
				this.curTrans += (2 - this.curTrans)/4;
			}
		},
        updateDrawables: function(a) {
			this.setPos((ig.system.width/4) - 41, (ig.system.height/2) - 41);
			this.hook.setScale(this.curTrans*2, this.curTrans*2);
			a.addGfx(this.gfxCrosshair, 0, 0, 0, 0, 82, 82).setAlpha(2-this.curTrans);
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
	
    sc.AlAreaPreviewInfo = ig.BoxGui.extend({
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
                    y: 304
                },
                flipped: {
                    x: 456,
                    y: 304
                }
            }
        }),
        gfx: new ig.Image("media/gui/teleporter-map/black.png"),
        icon: null,
        init: function() {
            this.parent(148, 100);
            this.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_BOTTOM);
            this.setPos(5, 26);
            this.title = new sc.TextGui("PREVIEW", {
                font: sc.fontsystem.smallFont
            });
            this.title.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
            this.title.setPos(0, 2);
            this.addChildGui(this.title);
            (new ig.ColorGui("#CCCCCC", 144, 82)).setPos(3, 18);
            this.icon = new ig.ImageGui(this.gfx, 0, 0, 142, 80);
            this.icon.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
            this.icon.setPos(0, 17);
            this.addChildGui(this.icon);
            this.doStateTransition("HIDDEN", true)
        },
        updateDrawables: function(a) {
            this.parent(a);
            a.addColor("#CCCCCC", 3, this.title.hook.size.y + 1, 142, 1)
        },
        show: function(a) {
            this.doStateTransition("DEFAULT");
            this.active = true
        },
        hide: function(a) {
            this.doStateTransition("HIDDEN", a);
            this.active = false
        }
    });
	
	
	
	sc.AlAreaGroupSelectMenu = sc.MenuPanel.extend({
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
            this.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
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
            sc.menu.buttonInteract.addGlobalButton(this.cycleLeft, this.onLeftPressCheck.bind(this), true);
            sc.menu.buttonInteract.addGlobalButton(this.cycleRight, this.onRightPressCheck.bind(this), true);
            this.doStateTransition("DEFAULT");
			sc.menu.setOptionTab(0);
			this.pageText.setText(ig.LangLabel.getText(ig.arcaneLabDatabase.get("teleporter")[0].name));
		},
		hide: function() {
            sc.menu.buttonInteract.removeGlobalButton(this.cycleLeft);
            sc.menu.buttonInteract.removeGlobalButton(this.cycleRight);
            this.doStateTransition("HIDDEN")
		},
        cycleGroups: function(b) {
            var a = ig.arcaneLabDatabase.get("teleporter");
            if (a.length != 1) {
                var d = sc.menu.optionCurrentTab + b;
                b < 0 ? d < 0 && (d = a.length - 1) : b > 0 && d >= a.length && (d = 0);
                sc.menu.setOptionTab(d);
                this.pageText.setText(ig.LangLabel.getText(a[sc.menu.optionCurrentTab].name))
            }
        },
        onLeftPressCheck: function() {
            return sc.control.menuCircleLeft()
        },
        onRightPressCheck: function() {
            return sc.control.menuCircleRight()
        }
	});
	sc.AlAreaListMenu = sc.MenuPanel.extend({
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
				if(a.active) {
					var b = ig.lang.get("sc.gui.menu.map-menu.teleport"),
						b = ig.lang.grammarReplace(b, new ig.LangLabel(a.data.title).value);
					sc.Dialogs.showYesNoDialog(b, null, function(b) {
						if (b.data == 0) {
							sc.model.enterPrevSubState();
							this.teleportEvent = this.getTeleportEvent(a.data.map, a.data.marker);
							sc.stats.addMap("player", "teleports", 1);
							sc.model.enterRunning();
							sc.Cutscene.startCutscene(this.teleportEvent)
						}
					}.bind(this));
				} else {
					this.blockedSound && this.blockedSound.play();
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
            var d = ig.input.mouseGuiActive,
                c = this.buttongroup.current.y || 1,
                e = -this.list.box.hook.scroll.y || 0;
            this.buttongroup.clear();
            this.list.clear();
            var f = ig.arcaneLabDatabase.get("teleporter")[sc.menu.optionCurrentTab].points,
                g = null;
            for (var h = 0; h < f.length; h++) {
                g = f[h];
				if(new ig.VarCondition(g.showCondition || "true").evaluate()) {
					var ac = new ig.VarCondition(g.activeCondition || "true").evaluate();
					g = new sc.AlAreaPointButton(g);
					if(!ac) {
						g.setActive(false);
					}
					this.list.addButton(g, false);
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
        }
	});
	sc.AlAreaPointButton = sc.ListBoxButton.extend({
        symbol: null,
        init: function(a) {
            this.parent(new ig.LangLabel(a.title).value, 228, 24);
			this.setData(a);
            this.symbol = new ig.ImageGui(new ig.Image(a.icon), 0, 0, 24, 24);
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

ig.module("game.feature.menu.al-teleporter-map").requires("game.feature.menu.menu-model")
.defines(function() {
	sc.MENU_SUBMENU.AL_TELEPORTER = Math.max(...Object.values(sc.MENU_SUBMENU)) + 1;
	sc.SUB_MENU_INFO[sc.MENU_SUBMENU.AL_TELEPORTER] = {
		Clazz: sc.AlTeleportMenu,
		name: "al-telepoter"
	};
});