
exports.Character = function (id, position, material, bmpPosition) {
    this.alive = true;
    this.id = id;
    this.position = position;
    this.material = material;
    if (bmpPosition) {
        this.bmpPosition = bmpPosition;
    } else {
        this.bmpPosition = null;
    }
};

exports.Bomb = function (position, strengh) {
        this.position = position;
        this.isExploded = false;
        this.strength = strengh;
    }

exports.Flame = function(position, bomb) {
        this.bomb = bomb;
        this.position = position;
    }