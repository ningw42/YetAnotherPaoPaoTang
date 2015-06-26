
exports.Character = function (id, position, material) {
    this.alive = true;
    this.id = id;
    this.position = position;
    this.material = material;
}

exports.Bomb = function (position, strengh) {
        this.position = position;
        this.isExploded = false;
        this.strength = strengh;
    }

exports.Flame = function(position, bomb) {
        this.bomb = bomb;
        this.position = position;
    }