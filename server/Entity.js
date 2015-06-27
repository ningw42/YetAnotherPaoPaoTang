
exports.Character = function (id, position, material, bmpPosition) {
    this.id = id;
    this.position = position;
    this.material = material;
    if (bmpPosition) {
        this.bmpPosition = bmpPosition;
    } else {
        this.bmpPosition = null;
    }
};

exports.Bomb = function (position, characterId, id) {
    this.position = position;
    this.characterId = characterId;
    this.id = id;
};

exports.Flame = function(position, bomb) {
        this.bomb = bomb;
        this.position = position;
    }