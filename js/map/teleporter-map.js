ig.module("game.feature.map-content.gui.arcane-map").requires(
        "game.feature.map-content.gui.rhombus-map")
    .defines(function() {
        sc.ArcaneMapMenu = sc.RhombusMapMenu.extend({
            init: function(a) {
                this.parent();
                this.hook.zIndex = 90;
                this.hook.temporary = true;
                this.hook.size.x = ig.system.width;
                this.hook.size.y = ig.system.height;
                this.callback = a || null;
                this.buttonInteract = new ig.ButtonInteractEntry;
                this.buttonGroup = new sc.MouseButtonGroup;
                this.buttonGroup.ignoreActiveFocus =
                    true;
                this.buttonGroup.addSelectionCallback(function(a) {
                    a && a.entity && this.info.setText(a.entity.description)
                }.bind(this));
                this.buttonGroup.setMouseFocusLostCallback(function() {
                    this.info.setText("", 0.2);
                    this.infoBox.hide()
                }.bind(this));
                this.buttonGroup.onButtonTraversal = function() {
                    if (ig.input.currentDevice == ig.INPUT_DEVICES.GAMEPAD && sc.control.menuConfirm() && this.currentFocus) this.currentFocus.onButtonPress()
                }.bind(this);
                this.buttonInteract.pushButtonGroup(this.buttonGroup);
                this.container = new ig.GuiElementBase;
                this.container.setSize(ig.system.width, ig.system.height);
                this.addChildGui(this.container);
                this.cursor = new sc.MapCursor;
                this.addChildGui(this.cursor);
                this.info = new sc.InfoBar(this.hook.size.x, 21, true);
                this.info.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_BOTTOM);
                this.addChildGui(this.info);
                this.info.doStateTransition("DEFAULT");
                this.help = new sc.InfoBar(this.hook.size.x, 21, true);
                this.help.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
                this.help.text.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER);
                this.help.setText(ig.lang.get("sc.gui.menu.rhombus.help"));
                this.addChildGui(this.help);
                this.help.doStateTransition("DEFAULT");
                this.infoBox = new sc.ArcaneMenuInfo;
                this.addChildGui(this.infoBox);
                ig.interact.addEntry(this.buttonInteract);
                this.createLocationUIs();
                this.doStateTransition("DEFAULT", true)
            },
            createLocationUI: function(a) {
                var b = new sc.ArcaneMenuLocation(a, this),
                    d = b.hook,
                    a = a.coll;
                ig.system.getScreenFromMapPos(c, Math.round(a.pos.x + a.size.x / 2), Math.round(a.pos.y - a.pos.z - a.size.z / 2 + a.size.y / 2));
                if (c.x < 0) c.x = 0;
                if (c.x > ig.system.width) c.x = ig.system.width;
                if (c.y < 0) c.y = 0;
                if (c.y > ig.system.height) c.y = ig.system.height;
                d.pos.x = c.x - d.size.x / 2;
                d.pos.y = c.y - d.size.y / 2;
                return b
            }
        });
        sc.ArcaneMenuInfo = ig.BoxGui.extend({
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
            gfx: new ig.Image("media/gui/rhombus-map.png"),
            title: null,
            arrow: null,
            icon: null,
            preview: "",
            init: function() {
                this.parent(148, 100);
                this.title = new sc.TextGui("", {
                    font: sc.fontsystem.smallFont
                });
                this.title.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
                this.title.setPos(0, 2);
                this.addChildGui(this.title);
                (new ig.ColorGui("#CCCCCC", 144, 82))
                .setPos(3, 18);
                this.prevPrev = a.preview;
                this.icon = new ig.ImageGui(new ig.Image("media/gui/teleporter-map/black.png"), 0, 0, 142, 80);
                this.icon.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP);
                this.icon.setPos(0, 17);
                this.addChildGui(this.icon);
                this.arrow = new sc.RhombusMenuArrow;
                this.addChildGui(this.arrow);
                this.doStateTransition("HIDDEN", true)
            },
            updateDrawables: function(a) {
                this.parent(a);
                a.addColor("#CCCCCC", 3, this.title.hook.size.y + 1, 142, 1)
            },
            show: function(a) {
                this.alignToBase(a.hook);
                this.setData(a.entity);
                this.doStateTransition("DEFAULT");
                this.active = true
            },
            hide: function(a) {
                this.doStateTransition("HIDDEN", a);
                this.active = false
            },
            setData: function(a) {
                this.icon.setImage((a.preview ? new ig.Image(a.preview) : new ig.Image("media/gui/teleporter-map/black.png")), 0, 0, 142, 80);
                this.title.setText(a.title)
            },
            alignToBase: function(a) {
                var b =
                    this.hook,
                    d = b.currentState.alpha == 0;
                c.x = a.pos.x + Math.floor(a.size.x / 2);
                c.y = a.pos.y + Math.floor(a.size.y / 2);
                a = c.y + -46;
                c.y = Math.max(10, Math.min(ig.system.height - 100 - 10, c.y + -46));
                if (d) b.pos.y = c.y;
                var h = 38 + (a - c.y);
                if (c.x + 173 < ig.system.width) {
                    this.currentTileOffset = "default";
                    if (d) b.pos.x = c.x + 20 + 10;
                    b.doPosTranstition(c.x + 20, c.y, 0.2, KEY_SPLINES.EASE);
                    this.arrow.setPosition(-10, Math.max(7, Math.min(125, h)), false)
                } else {
                    this.currentTileOffset = "flipped";
                    if (d) b.pos.x = c.x - b.size.x - 20 - 10 - 1;
                    b.doPosTranstition(c.x -
                        b.size.x - 20 - 1, c.y, 0.2, KEY_SPLINES.EASE);
                    this.arrow.setPosition(b.size.x + 1, Math.max(7, Math.min(125, 38 + (a - c.y))), true)
                }
                this.arrow.bottomAnchor = false;
                this.arrow.flipY = false;
                if (h < 7) {
                    this.arrow.bottomAnchor = true;
                    this.arrow.flipY = true
                } else if (h > 125) this.arrow.bottomAnchor = true
            }
        });
        var b = [0.1, 0.1, 0.1, 0.1],
            a = [0, 0, 0, 0],
            d = sc.BUTTON_SOUND.submit,
            c = Vec2.createC(0, 0);
        sc.ArcaneMenuLocation = ig.FocusGui.extend({
            transitions: {
                DEFAULT: {
                    state: {},
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
                },
                HIDDEN: {
                    state: {
                        alpha: 0,
                        scaleX: 0
                    },
                    time: 0.2,
                    timeFunction: KEY_SPLINES.LINEAR
                }
            },
            gfx: new ig.Image("media/gui/rhombus-map.png"),
            entity: null,
            callback: null,
            icon: "",
            origin: false,
            focusTimer: 0,
            focusFrame: 0,
            init: function(a, b) {
                this.parent(true, false);
                this.setSize(16, 16);
                this.setPivot(8, 8);
                this.entity = a;
                this.callback = b;
                this.origin = a.map == ig.game.previousMap;
                this.icon = new ig.Image(this.entity.icon);
                this.doStateTransition("HIDDEN", true);
                this.doStateTransition("DEFAULT", false, false, function() {}.bind(this))
            },
            onButtonPress: function() {
                if (ig.input.currentDevice == ig.INPUT_DEVICES.KEYBOARD_AND_MOUSE) {
                    var a = Math.floor(sc.control.getMouseY());
                    if (a <= 21 || a >= 299) return
                }
                d.play();
                this.callback.onButtonPress(this.entity)
            },
            update: function() {
                if (this.focus) {
                    this.focusTimer = this.focusTimer + ig.system.actualTick;
                    if (this.focusTimer >= b[this.focusFrame]) {
                        this.focusFrame = (this.focusFrame + 1) % a.length;
                        this.focusTimer = 0
                    }
                }
            },
            updateDrawables: function(b) {
                this.focus && b.addGfx(this.gfx, -this.hook.pivot.x, -this.hook.pivot.y, 144 + 32 * a[this.focusFrame],
                        0, 32, 32)
                    .setCompositionMode("lighter");
                b.addGfx(this.icon, this.hook.pivot.x - 12, this.hook.pivot.y - 12, 0, (this.origin ? 24 : 0), 24, 24);
                this.origin && b.addGfx(this.gfx, -21, -13, 208, 32, 22, 17)
            },
            isMouseOver: function() {
                if (!ig.interact.isBlocked()) {
                    if (ig.input.currentDevice == ig.INPUT_DEVICES.GAMEPAD) {
                        var a = this.getDistanceToCursor();
                        if (this.callback._cursorMoved) {
                            this.callback.unfocus(this);
                            return false
                        }
                        if (a <= 10) {
                            a = this.hook;
                            this.callback.focusLocation(a.pos.x + Math.floor(a.size.x / 2) - 1, a.pos.y + Math.floor(a.size.y /
                                2) + 1, this, true);
                            return true
                        }
                        this.callback.unfocus(this)
                    } else if (ig.input.currentDevice == ig.INPUT_DEVICES.KEYBOARD_AND_MOUSE) {
                        var b = Math.floor(sc.control.getMouseX()),
                            c = Math.floor(sc.control.getMouseY()),
                            a = this.hook;
                        (b = b >= a.pos.x && b <= a.pos.x + a.size.x && c >= a.pos.y && c <= a.pos.y + a.size.y) ? this.callback.focusLocation(a.pos.x + Math.floor(a.size.x / 2) - 1, a.pos.y + Math.floor(a.size.y / 2) + 1, this): this.callback.unfocus(this);
                        return b
                    }
                    return false
                }
            },
            unfocus: function() {
                this.focusTimer = 0;
                this.focusFrame = -1;
                this.callback.unfocus(this)
            },
            getDistanceToCursor: function() {
                return Math.floor(Vec2.distanceC(this.callback._worldCursor.x, this.callback._worldCursor.y, this.hook.pos.x + Math.floor(this.hook.size.x / 2), this.hook.pos.y + Math.floor(this.hook.size.y / 2)))
            }
        })
    });

ig.module("game.feature.map-content.entities.arcane-point").requires(
        "impact.base.entity",
        "game.feature.map-content.gui.arcane-map")
    .defines(function() {
        ig.ENTITY.ArcanePoint = ig.ENTITY.RhombusPoint.extend({
            _wm: new ig.Config({
                spawnable: true,
                attributes: {
                    title: {
                        _type: "LangLabel",
                        _info: "Name of the teleport location"
                    },
                    description: {
                        _type: "LangLabel",
                        _info: "Short description of the location",
                        _large: true
                    },
                    map: {
                        _type: "Maps",
                        _info: "Map to be teleported to",
                        _context: "Map"
                    },
                    marker: {
                        _type: "Marker",
                        _info: "Marker on Map to be teleported to"
                    },
                    condition: {
                        _type: "VarCondition",
                        _info: "optional condition for this location to show",
                        _optional: true
                    },
                    icon: {
                        _type: "Image",
                        _info: "Path of the preview icon to use."
                    },
                    preview: {
                        _type: "Image",
                        _info: "Path of the preview screenshot to use."
                    }
                },
                scalableX: true,
                scalableY: true,
                scalableStep: 2,
                drawBox: true,
                boxColor: "rgba(255, 128, 30, 0.5)",
                frontColor: "rgba(128, 128, 0, 1)",
                noZLine: true
            }),
            title: null,
            description: null,
            condition: null,
            map: null,
            marker: null,
            icon: "",
            preview: "",
            init: function(b, a, d, c) {
                this.parent(b, a, d, c);
                this.setSize(16, 16, 0);
                this.coll.type = ig.COLLTYPE.NONE;
                this.title = ig.LangLabel.getText(c.title);
                this.description = ig.LangLabel.getText(c.description);
                this.map = c.map;
                this.marker = c.marker;
                this.icon = c.icon || "";
                this.preview = c.preview || "";
                this.condition = c.condition ? new ig.VarCondition(c.condition) : null
            }
        })
    });

ig.module("game.feature.map-content.gui.teleporter-map").requires(
        "impact.base.action",
        "impact.base.event")
    .defines(function() {
        ig.EVENT_STEP.OPEN_ARCANE_MAP = ig.EventStepBase.extend({
            _wm: new ig.Config({
                attributes: {}
            }),
            _characterName: null,
            _mapName: null,
            init: function(b) {
                this.quest = sc.quests.staticQuests[b.quest];
                this.npc = b.npc || null;
                this.map = b.map || null
            },
            start: function(b, a) {
                b.done = false;
                sc.model.stopSkip();
                sc.model.skipBlock = true;
                var d = new sc.ArcaneMapMenu(function(c, d, f) {
                    b.done = true;
                    sc.model.skipBlock =
                        false;
                    ig.game.teleport(c, d ? new ig.TeleportPosition(d) : null);
                    c = new ig.Camera.TargetHandle(new ig.Camera.EntityTarget(f), 0, 0);
                    c.setZoom(1.5);
                    ig.camera.pushTarget(c, 0.5, KEY_SPLINES.EASE_IN, null);
                    a.addEventAttached(c)
                }.bind(this));
                ig.gui.addGuiElement(d)
            },
            run: function(b) {
                return b.done
            }
        })
    });

//ig.gui.menues.splice(ig.gui.menues.findIndex(m => m.gui instanceof sc.StatusHudGui), 1)
// HUD hide command