/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */
var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        itemcount = 0, // global index for the collectable items
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        CreateEnemy();

        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkEnemyCollisions();
        checkPlayerVictory();
        checkItemCollected();
    }

    /* This function is called by update which is called by the main game loop
     * This function firsts checks the player-enemy collision by first checking
     * if the player and the enemy are in the same row.  If they are it then
     * checks if the sprites are overlapping.  If a collision is detected the
     * game resets()
     */
    function checkEnemyCollisions() {
        allEnemies.forEach(function(enemy) {
            if (Math.abs(enemy.y - player.y) === 75) {
                if ((player.x > enemy.x) && player.x - enemy.x < 90) {
                    //console.log("Collision: Player Lost");
                    reset();
                } else if (Math.abs(enemy.x - player.x) < 70) { // A right side and left side comparison is needed due to non-symetry of sprites.
                    //console.log("Collision: Player Lost");
                    reset();
                }
            }
        });
    }

    /* This function checks if the player reached the blue water.  If the
     * water is reached then the player is reset (not the game), the score
     * is increased by the number of current enemies and a new enemy is
     * created.  If there are more than 7 enemies then the cull function is
     * called.
     */
    function checkPlayerVictory() {
        if (player.y < 65) {
            //console.log("Player Reached Next Level");
            score += allEnemies.length;
            //console.log("Score: " + score);
            player.reset();
            CreateEnemy();
            if (allEnemies.length > 7) {
                cull();
            }
        }
    }

    /* This function checks the players location against the item location by
     * first checking the row and then checking if the sprites overlap.
     * If the sprites overlap then item.collect() is called with the current
     * itemcount.
     */
    function checkItemCollected() {
        allItems.forEach(function(item) {
            if (Math.abs(item.y - player.y) === 75) {
                if ((player.x > item.x) && player.x - item.x < 90) {
                    //console.log("Player Collected a Gem");
                    item.collect(itemcount);
                } else if (Math.abs(item.x - player.x) < 70) { // A right side and left side comparison is needed due to non-symetry of sprites.
                    //console.log("Player Collected a Gem");
                    item.collect(itemcount);
                }
            }
        });
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    /* cull() performs two functions.  If there are currently 8 enemies on the
     * screen than a collectable item is unhidden. If the player reaches the
     * water then checkPlayerVictory() will create a new enemy and call cull().
     * cull() will now have more than 8 enemies.  It will now check to see
     * if the item was collected.  If it wasn't then the item will be hide.
     * itemcount is incremented and enemies are destroyed.
     */
    function cull() {
        if (allEnemies.length === 8) {
            allItems[itemcount].unhide();
        } else {
            if (!allItems[itemcount].collected) {
                allItems[itemcount].hide();
            }
            itemcount++;
            for (var i = allEnemies.length - 1; i >= 2; i--) {
                allEnemies.pop();
            }
        }
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png', // Top row is water
                'images/stone-block.png', // Row 1 of 3 of stone
                'images/stone-block.png', // Row 2 of 3 of stone
                'images/stone-block.png', // Row 3 of 3 of stone
                'images/grass-block.png', // Row 1 of 2 of grass
                'images/grass-block.png' // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        /* Display the Current Score */
        ctx.font = "25px Arial";
        ctx.fillText("SCORE: " + score, 0, 580);

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies and allItems
         * arrays and call the render functions.  Call player render function.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        allItems.forEach(function(item) {
            item.render();
        });

        player.render();
    }

    /* This function is called whenever the player collides with an enemy.
     * The player is reset, score and itemcount are set to zero, collected
     * items are hidden, the allEnemies array is brought back to 0.  A new
     * enemy is created and the main game loop starts.
     */
    function reset() {
        player.reset();
        score = 0;
        itemcount = 0;
        allItems.forEach(function(item) {
            item.hide();
        });
        allEnemies = [];
        CreateEnemy();
        main();
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png',
        'images/Heart.png',
        'images/Star.png',

    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);