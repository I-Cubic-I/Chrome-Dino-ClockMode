// Make distanceMeter display 6 score units
// YYMMSS (high score), hhmmss (current score) format can be expressed
Runner.instance_.distanceMeter.maxScoreUnits = 6;

// Mute all sounds. (action sound, achive sound, etc.)
Runner.sounds = {}

Runner.instance_.distanceMeter.setHighScore = function(distance) {
    date = new Date();
    distance = date.getYear() * 10000 + date.getMonth() * 100 + 100 + date.getDate(); // @ modified to Clock Mode
    const highScoreStr = (this.defaultString +
        distance).substr(-this.maxScoreUnits);

    this.highScore = ['10', '11', ''].concat(highScoreStr.split(''));
}

Runner.instance_.distanceMeter.update = function(deltaTime, distance) {
    let paint = true;
    let playSound = false;

    if (!this.achievement) {
      date = new Date();
      distance = date.getHours() * 10000 + date.getMinutes() * 100 + date.getSeconds();  // @ modified to Clock Mode
      // Score has gone beyond the initial digit count.
      if (distance > this.maxScore && this.maxScoreUnits ==
        this.config.MAX_DISTANCE_UNITS) {
        this.maxScoreUnits++;
        this.maxScore = parseInt(this.maxScore + '9', 10);
      } else {
        this.distance = 0;
      }

      if (distance > 0) {
        // Achievement unlocked.
        if (distance % this.config.ACHIEVEMENT_DISTANCE === 0) {
          // Flash score and play sound.
          this.achievement = true;
          this.flashTimer = 0;
          playSound = true;
        }

        // Create a string representation of the distance with leading 0.
        const distanceStr = (this.defaultString +
            distance).substr(-this.maxScoreUnits);
        this.digits = distanceStr.split('');
      } else {
        this.digits = this.defaultString.split('');
      }
    } else {
      // Control flashing of the score on reaching acheivement.
      if (this.flashIterations <= this.config.FLASH_ITERATIONS) {
        this.flashTimer += deltaTime;

        if (this.flashTimer < this.config.FLASH_DURATION) {
          paint = false;
        } else if (this.flashTimer > this.config.FLASH_DURATION * 2) {
          this.flashTimer = 0;
          this.flashIterations++;
        }
      } else {
        this.achievement = false;
        this.flashIterations = 0;
        this.flashTimer = 0;
      }
    }

    // Draw the digits if not flashing.
    if (paint) {
      for (let i = this.digits.length - 1; i >= 0; i--) {
        this.draw(i, parseInt(this.digits[i], 10));
      }
    }

    this.drawHighScore();
    return playSound;
  }

// Prevent game from pausing if the tab is not in focus.
Runner.prototype.onVisibilityChange = function(){}

// Night mode. Comment it out if you don't want it.
Runner.prototype.invert()

// Always night mode. (or day mode if night mode is not activated)
Runner.prototype.invert = function(){}

// I don't want speedy screen. (minSpeed for a PTERODACTYL to appear is 8.5)
Runner.instance_.config.MAX_SPEED = 8.5;

/* Naive autoplay code
Runner.instance_.gameOver = function() {
    if (!this.tRex.jumping)
        this.tRex.startJump(this.currentSpeed);
}
*/

// This code periodically checks for the closest obstacle (cactus or pterodactyl) and then jumps or ducks based on the obstacle’s position.
// from blog of Mathew Sachin
function dispatchKey(type, key) {
    document.dispatchEvent(new KeyboardEvent(type, {keyCode: key}));
}
setInterval(function () {
    const KEY_CODE_SPACE_BAR = 32
    const KEY_CODE_ARROW_DOWN = 40
    const CANVAS_HEIGHT = Runner.instance_.dimensions.HEIGHT
    const DINO_HEIGHT = Runner.instance_.tRex.config.HEIGHT

    const obstacle = Runner.instance_.horizon.obstacles[0]
    const speed = Runner.instance_.currentSpeed

    if (obstacle) {
        const w = obstacle.width
        const x = obstacle.xPos // measured from left of canvas
        const y = obstacle.yPos // measured from top of canvas
        const yFromBottom = CANVAS_HEIGHT - y - obstacle.typeConfig.height
        const isObstacleNearby = x < 25 * speed - w / 2

        if (isObstacleNearby) {
            if (yFromBottom > DINO_HEIGHT) {
                // Pterodactyl going from above, do nothing
            } else if (y > CANVAS_HEIGHT / 2) {
                // Jump
                dispatchKey("keyup", KEY_CODE_ARROW_DOWN)
                dispatchKey("keydown", KEY_CODE_SPACE_BAR)
            } else {
                // Duck
                dispatchKey("keydown", KEY_CODE_ARROW_DOWN)
            }
        }
    }
}, Runner.instance_.msPerFrame);
