var Utils = {};

/**
 * Returns true if positions are equal.
 */
Utils.comparePositions = function(pos1, pos2) {
    return pos1.x == pos2.x && pos1.y == pos2.y;
};


/**
 * Convert bitmap pixels position to entity on grid position.
 */
Utils.convertToEntityPosition = function(pixels) {
    var position = {};
    position.x = Math.round(pixels.x / gameEngine.tilesSize);
    position.y = Math.round(pixels.y /gameEngine.tilesSize);
    return position;
};

/**
 * Convert entity on grid position to bitmap pixels position.
 */
Utils.convertToBitmapPosition = function(entity) {
    var position = {};
    position.x = entity.x * gameEngine.tilesSize;
    position.y = entity.y * gameEngine.tilesSize;
    return position;
};

/**
 * Removes an item from array.
 */
Utils.removeFromArray = function(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (item == array[i]) {
            array.splice(i, 1);
        }
    }
    return array;
};

Utils.intersectRect = function(character , tile) {
    return (character.left <= tile.right && 
            tile.left <= character.right && 
            character.top <= tile.bottom && 
            tile.top <= character.bottom) ;
};