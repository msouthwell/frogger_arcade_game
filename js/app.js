/* The Item class is for all of the collectable objects.  There are
 * five in the game.  Objects initially start hidden off screen.
 * Parameter: url of the sprite image.
 */
var Item = function(url) {
    this.sprite = url;
    this.x = -200;
    this.y = 400;
    this.collected = false;
};
Item.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
/* When an item is collected it is moved to the top of the screen (water) to
 * its designated location.
 * Parameter: the index location for the item being collected.
 */
Item.prototype.collect = function(itemcount) {
    this.collected = true;
    this.x = 100 * itemcount;
    this.y = 0;
};
/* unhide() moves the item from offscreen onto the road tiles.  It can
 * be placed in any three rows and anywhere on the x-axis.
 */
Item.prototype.unhide = function() {
    this.x = Math.floor(Math.random() * 400); //canvas is 500px wide, but items are 100px wide. 400 keeps item on canvas
    //Randomly seeded across the three brick rows
    var start = Math.floor((Math.random() * 3) + 1);
    if (start === 1) {
        this.y = 65;
    } else if (start === 2) {
        this.y = 145;
    } else {
        this.y = 225;
    }
};
/* hide() puts the item outside the canvas viewing area.  All items are still
 * rendered every animation frame.
 */
Item.prototype.hide = function() {
    this.x = -200;
    this.y = 400;
};

// Enemies our player must avoid
var Enemy = function() {

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    // Fast and Slow Bugs
    this.speed = Math.floor((Math.random() * 150) + 40);
    // Some randomly seeded on the map, some off the map
    this.x = Math.floor((Math.random() * 500) - 200);
    //Randomly seeded across the three brick rows
    var start = Math.floor((Math.random() * 3) + 1);
    if (start === 1) {
        this.y = 65;
    } else if (start === 2) {
        this.y = 145;
    } else {
        this.y = 225;
    }
};
// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    /* If the enemy moves completely off of the screen to the right then it
     * is moved to a new random row off screen to the left.  This limits the
     * amount of total enemy entities by reusing them.
     */
    if (this.x > 500) {
        this.speed = Math.floor((Math.random() * 150) + 40);
        // Some randomly seeded off of the map
        this.x = Math.floor((Math.random() * 20) - 200);
        //Randomly seeded across the three brick rows
        var start = Math.floor((Math.random() * 3) + 1);
        if (start === 1) {
            this.y = 65;
        } else if (start === 2) {
            this.y = 145;
        } else {
            this.y = 225;
        }
    } else {
        this.x = this.x + dt * this.speed;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// The main character
// NOTE: I cropped the Udacity provided player sprites in gimp to remove the large excess transparent image area.
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.speedX = 25; //Design choice to not limit the player movement to the tile size in the x-axis
    this.speedY = 80; //limits player movement to the tile rows
    this.x = 215; // center screen
    this.y = 460; //bottom row
};
// the project instructions state an update function is needed.  I didn't require it but left a stub for grading.
Player.prototype.update = function(dt) {
    this.x = this.x;
    this.y = this.y;
};
// puts the player back in its original starting position
Player.prototype.reset = function() {
    this.x = 215;
    this.y = 460;
};
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
// checks keyboard input and ensures that player will not move out of bounds
Player.prototype.handleInput = function(key) {
    if (key === 'left') {
        if (this.x - this.speedX > -20) {
            this.x = this.x - this.speedX;
        }
    } else if (key === 'right') {
        if (this.x + this.speedX < 420) {
            this.x = this.x + this.speedX;
        }
    } else if (key === 'up') {
        if (this.y - this.speedY > -20) {
            this.y = this.y - this.speedY;
        }
    } else if (key === 'down') {
        if (this.y + this.speedY < 480) {
            this.y = this.y + this.speedY;
        }
    }
};

var score = 0; // player score. increases every time the player reaches water porportionally to the number of enemies

var player = new Player();
var allEnemies = [];
var allItems = [new Item('images/Gem Blue.png'),
    new Item('images/Gem Green.png'),
    new Item('images/Gem Orange.png'),
    new Item('images/Heart.png'),
    new Item('images/Star.png')
];

// Creates a new enemy object and adds it to the enemy array
var CreateEnemy = function() {
    allEnemies.push(new Enemy());
};

// Helper for debugging
// document.addEventListener("click", function(event) {
//     var x = event.clientX;
//     var y = event.clientY;
//     console.log("x: " + x + " y: " + y);
// });

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});