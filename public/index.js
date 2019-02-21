/* global PIXI */
/// <reference types="pixi.js" />

const { Application, Texture, Sprite, TilingSprite, Text, TextStyle } = PIXI;

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function isLeftOf(x1, x2) {
    return x1 < x2;
}

function isRightOf(x1, x2) {
    return x1 > x2;
}

// game settings
const ORANGE_VELOCIRAPTOR_COLLISIONS = true;
const BLUE_VELOCIRAPTOR_COLLISIONS = true;
const PTERODACTYLUS_COLLISIONS = true;
const SCORE_INCREMENT = 0.1;

const BACKGROUND_URL = "sprites/bg.png";
const BACKGROUND_WIDTH = 800;
const BACKGROUND_HEIGHT = 600;

const GAME_OVER_URL = "sprites/gameover.png";

const SATURN_URL = "sprites/saturn.png";
const SATURN_POSITION_X = 100;
const SATURN_POSITION_Y = 60;
const SATURN_ROTATION = 0.3;

const JUPITER_URL = "sprites/jupiter.png";
const JUPITER_POSITION_X = 640;
const JUPITER_POSITION_Y = 30;
const JUPITER_ROTATION = 0.1;

const CLOUDS_URL = "sprites/clouds.png";
const CLOUDS_POSITION_X = 900;
const CLOUDS_POSITION_Y = 50;
const CLOUDS_SPEED_X = 0.3;

const TRICERATOPS_URL = "sprites/triceratops.png";
const TRICERATOPS_SCALE = 0.5;

const PLAYER_URL = "sprites/brachiosaurus.png";
const PLAYER_DUCK_URL = "sprites/brachiosaurus-down.png";
const JUMP_SOUND_URL = "jump.mp3";

const ORANGE_VELOCIRAPTOR_URL = "sprites/velociraptor1.png";
const BLUE_VELOCIRAPTOR_URL = "sprites/velociraptor2.png";
const PTERODACTYLUS_URL = "sprites/pterodactylus.png";

const SCORE_POSITION_X = 780;
const SCORE_POSITION_Y = 10;

const BACKGROUND_SPEED_X = 2;

const PLAYER_POSITION_X = 50;
const FLOOR_POSITION_Y = 550;

const MAX_PLAYER_JUMP_HEIGHT = 226;
const PLAYER_JUMP_DELAY = 500;
const PLAYER_JUMP_HEIGHT = 90;
const PLAYER_HEIGHT = 144;
const PLAYER_WIDTH = 164;

const VELOCIRAPTOR_HEIGHT = 82;
const VELOCIRAPTOR_WIDTH = 102;
const ORANGE_VELOCIRAPTOR_SPEED_X = 8;
const BLUE_VELOCIRAPTOR_SPEED_X = 9;
const PTERODACTYLUS_WIDTH = 94;

const ARROW_UP = 38;
const ARROW_DOWN = 40;
const ENTER = 13;

const bg = Texture.fromImage(BACKGROUND_URL);
const background = new TilingSprite(bg, BACKGROUND_WIDTH, BACKGROUND_HEIGHT);

const saturn = Sprite.fromImage(SATURN_URL);
const jupiter = Sprite.fromImage(JUPITER_URL);
const clouds = Sprite.fromImage(CLOUDS_URL);

const triceratops = Sprite.fromImage(TRICERATOPS_URL);
const player = Texture.fromImage(PLAYER_URL);
const playerDown = Texture.fromImage(PLAYER_DUCK_URL);
const brachiosaurus = new Sprite(player);

const orangeVelociraptor = Sprite.fromImage(ORANGE_VELOCIRAPTOR_URL);
const blueVelociraptor = Sprite.fromImage(BLUE_VELOCIRAPTOR_URL);
const pterodactylus = Sprite.fromImage(PTERODACTYLUS_URL);

const jumpSound = PIXI.sound.Sound.from(JUMP_SOUND_URL);

const gameOverScreen = Sprite.fromImage(GAME_OVER_URL);

const game = new Application();

// add canvas to the HTML generated by PIXI
document.body.appendChild(game.view);

// background
game.stage.addChild(background);
game.ticker.add(() => {
    background.tilePosition.x -= BACKGROUND_SPEED_X;
});

// extras
saturn.position.set(SATURN_POSITION_X, SATURN_POSITION_Y);
saturn.rotation = SATURN_ROTATION;
game.stage.addChild(saturn);

jupiter.position.set(JUPITER_POSITION_X, JUPITER_POSITION_Y);
jupiter.rotation = JUPITER_ROTATION;
game.stage.addChild(jupiter);

clouds.position.set(CLOUDS_POSITION_X, CLOUDS_POSITION_Y);
game.stage.addChild(clouds);
game.ticker.add(() => {
    clouds.position.x -= CLOUDS_SPEED_X;

    if (clouds.position.x < -400) {
        clouds.position.x = 1000;
    }
});

// score
const style = new TextStyle({
    align: "right",
    fontFamily: "arcade",
    fontSize: 46,
    fill: "white",
    letterSpacing: 2
});

let score = -1;
const scoreText = new Text("", style);
scoreText.anchor.set(1.0, 0.0);
scoreText.position.x = SCORE_POSITION_X;
scoreText.position.y = SCORE_POSITION_Y;
game.stage.addChild(scoreText);
game.ticker.add(() => {
    score += SCORE_INCREMENT;
    if (score >= 0) {
        scoreText.text = ("0000000" + String(Math.floor(score))).slice(-6);
    }
});

// background triceratops
triceratops.position.set(900, FLOOR_POSITION_Y - 50);
triceratops.scale.set(TRICERATOPS_SCALE, TRICERATOPS_SCALE);
game.ticker.add(() => {
    triceratops.position.x -= 1;

    if (triceratops.position.x < -600) {
        triceratops.position.x = 1000;
    }
});
game.stage.addChild(triceratops);

// player
brachiosaurus.position.set(PLAYER_POSITION_X, FLOOR_POSITION_Y - PLAYER_HEIGHT);
game.stage.addChild(brachiosaurus);

// obstacles
orangeVelociraptor.position.set(
    getRandom(1000, 3000),
    FLOOR_POSITION_Y - VELOCIRAPTOR_HEIGHT
);

function checkVelociraptorCollision(player, velociraptor) {
    const playerTail = PLAYER_POSITION_X;
    const playerFront = PLAYER_POSITION_X + PLAYER_WIDTH;
    const playerBottomSide = player.position.y + PLAYER_HEIGHT;

    const velociraptorHead = velociraptor.position.x;
    const velociraptorTail = velociraptorHead + VELOCIRAPTOR_WIDTH;
    const velociraptorTop = velociraptor.position.y;

    if (
        isLeftOf(velociraptorHead, playerFront - 8) &&
        isRightOf(velociraptorTail, playerTail + 30) &&
        velociraptorTop < playerBottomSide
    ) {
        gameOver();
    }
}

game.ticker.add(() => {
    orangeVelociraptor.position.x -= ORANGE_VELOCIRAPTOR_SPEED_X;

    if (ORANGE_VELOCIRAPTOR_COLLISIONS) {
        checkVelociraptorCollision(brachiosaurus, orangeVelociraptor);
    }

    // loop the sprite again when disappearing on the left side
    const min = 1400;
    const max = 1800;
    const randomPosition = getRandom(min, max);
    if (orangeVelociraptor.position.x < -200) {
        orangeVelociraptor.position.x = randomPosition;
    }
});
game.stage.addChild(orangeVelociraptor);

blueVelociraptor.position.set(
    getRandom(2000, 4000),
    FLOOR_POSITION_Y - VELOCIRAPTOR_HEIGHT
);

game.ticker.add(() => {
    const min = 1800;
    const max = 2000;
    let randomPosition = getRandom(min, max);

    blueVelociraptor.position.x -= BLUE_VELOCIRAPTOR_SPEED_X;

    if (BLUE_VELOCIRAPTOR_COLLISIONS) {
        checkVelociraptorCollision(brachiosaurus, blueVelociraptor);
    }

    if (blueVelociraptor.position.x < -800) {
        blueVelociraptor.position.x = randomPosition;
    }
});
game.stage.addChild(blueVelociraptor);

pterodactylus.position.set(getRandom(3000, 5000), FLOOR_POSITION_Y - 120);

game.ticker.add(() => {
    pterodactylus.position.x -= ORANGE_VELOCIRAPTOR_SPEED_X;

    if (PTERODACTYLUS_COLLISIONS && !isDucked && !isDoubleJumping) {
        const playerTail = PLAYER_POSITION_X;
        const playerFront = PLAYER_POSITION_X + PLAYER_WIDTH;
        const pterodactylusHead = pterodactylus.position.x;
        const pterodactylusTail = pterodactylusHead + PTERODACTYLUS_WIDTH;

        if (
            isLeftOf(pterodactylusHead, playerFront - 8) &&
            isRightOf(pterodactylusTail, playerTail + 140)
        ) {
            gameOver();
        }
    }

    if (pterodactylus.position.x < -1500) {
        pterodactylus.position.x = 2000;
    }
});
game.stage.addChild(pterodactylus);

// player movement
let jumpTimeout;
let duckTimeout;
let isJumping = false;
let isDoubleJumping = false;
let isDucked = false;
let isGameOver = false;

window.addEventListener("keydown", event => {
    // restart game
    if (event.keyCode === ENTER) {
        if (isGameOver) {
            isGameOver = false;
            return restartGame();
        }
    }

    if (isGameOver) {
        return;
    }

    // jump
    if (event.keyCode === ARROW_UP) {
        // cannot duck and jump at the same time
        if (isDucked) {
            isDucked = false;
            brachiosaurus.texture = player;
        }
        // allow jump as long as it hasn't reached the maximum jump height
        if (brachiosaurus.position.y > MAX_PLAYER_JUMP_HEIGHT) {
            jumpSound.play();
            if (isJumping) {
                isDoubleJumping = true;
            }
            isJumping = true;
            brachiosaurus.position.y -= PLAYER_JUMP_HEIGHT;
            clearTimeout(jumpTimeout);
            jumpTimeout = setTimeout(() => {
                isJumping = false;
                isDoubleJumping = false;
                brachiosaurus.position.y = FLOOR_POSITION_Y - PLAYER_HEIGHT;
            }, PLAYER_JUMP_DELAY);
        }
    }

    // duck
    if (event.keyCode === ARROW_DOWN) {
        // cannot duck if in the middle of a jump
        if (isJumping) {
            return;
        }
        isDucked = true;
        brachiosaurus.texture = playerDown;
        if (duckTimeout) {
            return;
        }
        duckTimeout = setTimeout(() => {
            brachiosaurus.texture = player;
            duckTimeout = null;
            isDucked = false;
        }, PLAYER_JUMP_DELAY);
    }
});

function restartGame() {
    score = 0;

    game.stage.removeChild(gameOverScreen);

    clouds.position.set(CLOUDS_POSITION_X, CLOUDS_POSITION_Y);
    triceratops.position.set(900, FLOOR_POSITION_Y - 55);
    orangeVelociraptor.position.set(
        getRandom(1000, 3000),
        FLOOR_POSITION_Y - VELOCIRAPTOR_HEIGHT
    );
    blueVelociraptor.position.set(
        getRandom(2000, 4000),
        FLOOR_POSITION_Y - VELOCIRAPTOR_HEIGHT
    );
    pterodactylus.position.set(getRandom(3000, 5000), FLOOR_POSITION_Y - 120);

    game.start();
}

function gameOver() {
    isGameOver = true;
    game.stage.addChild(gameOverScreen);

    game.stop();
}
