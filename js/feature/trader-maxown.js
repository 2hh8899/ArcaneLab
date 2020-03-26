sc.TradeModel.inject({
    canTrade: function() {
        for (var b = this.options[this.tradeIndex], a = sc.model.player, d = b.require, ggg = b.get, mmm = b.maxOwn, c = d.length; c--;)
            if (a.getItemAmountWithEquip(ggg[0].id) >= mmm || a.getItemAmountWithEquip(d[c].id) < d[c].amount) return false;
        for (var d = b.get, c = d.length,
                e = false, f = 0; c--;) {
            a.getItemAmountWithEquip(d[c].id) < 99 && (e = true);
            b.cost == void 0 && (f = f + sc.inventory.getItem(d[c].id)
                .cost * (d[c].amount || 1))
        }
        f = b.cost != void 0 ? b.cost : Math.floor((f || 1) * (b.scale || 1));
        a.credit - f < 0 && (e = false);
        return e
    }
});