document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const doodler = document.createElement('div');
    const DOODLER_WIDTH = 60;
    const GRID_WIDTH_MINUS_PLAT_WIDTH = 315;
    const GRID_WIDTH_MINUS_DOODLER_WIDTH = 340;
    const INITIAL_DOODLER_POSITION = 200;
    const INITIAL_PLAT_POSITION = 600;
    const PLAT_HEIGHT = 15;
    const PLAT_WIDTH = 85;
    const PIXEL_ADJUST = 4;
    const PIXEL_JUMP = 20;
    const FALL_DELAY = 20;
    const DELAY = 30;
    const platforms = [];
    let score = 0;
    let startPoint = 150;
    let doodlerBottomSpace = startPoint;
    let doodlerLeftSpace = 50
    let isGameOver = false;
    let isJumping = false;
    let isGoingLeft = false;
    let isGoingRight = false;
    let platformCount = 5;
    let upTimerId = null;
    let leftTimerId = null;
    let rightTimerId = null;
    let downTimerId = null;
    let moveTimerId = null;

    class Platform {
        constructor(platBottom) {
            this.left = Math.random() * GRID_WIDTH_MINUS_PLAT_WIDTH;
            this.bottom = platBottom;
            this._visual = createVisual(grid, this.left, this.bottom);
        }

        /**
         * @param {number} decValue
         */
        decreaseBottom(decValue) {
            this.bottom -= decValue;
            this._visual.style.bottom = `${this.bottom}px`;
        }

        update() {
            if (this.bottom < 10) {
                this._visual.classList.remove('platform');
                platforms.shift();
                platforms.push(new Platform(INITIAL_PLAT_POSITION));
                score++;
            }

        }
    }

    /**
     * @param {Document} holder 
     * @param {number} left 
     * @param {number} bottom 
     */
    function createVisual(holder, left, bottom) {
        const visual = document.createElement('div');
        visual.style.left = `${left}px`;
        visual.style.bottom = `${bottom}px`;
        visual.classList.add('platform');
        holder.appendChild(visual);

        return visual;
    }

    /**
     * @param {Document} holder 
     */
    function createDoodler(holder) {
        doodler.classList.add('doodler');
        doodlerLeftSpace = platforms[0].left;
        doodler.style.left = `${doodlerLeftSpace}px`;
        doodler.style.bottom = `${doodlerBottomSpace}px`;
        holder.appendChild(doodler);
    }

    function createPlatforms() {
        for (let index = 0; index < platformCount; index++) {
            let platGap = 600 / platformCount;
            let platBottom = 100 + (index * platGap);
            let newPlatform = new Platform(platBottom);

            platforms.push(newPlatform);
        }
    }

    function jump() {
        isJumping = true;
        clearInterval(downTimerId);
        upTimerId = setInterval(incDoodlerBottom, DELAY)
    }

    function fall() {
        isJumping = false;
        clearInterval(upTimerId);
        downTimerId = setInterval(decDoodlerBottom, FALL_DELAY);
    }

    function checkForCollisions() {
        platforms.forEach(platform => {
            if (
                (doodlerBottomSpace >= platform.bottom) &&
                (doodlerBottomSpace <= platform.bottom + PLAT_HEIGHT) &&
                ((doodlerLeftSpace + DOODLER_WIDTH) >= platform.left) &&
                (doodlerLeftSpace <= (platform.left + PLAT_WIDTH)) &&
                !isJumping
            ) {
                startPoint = doodlerBottomSpace;
                jump();
            }
        });
    }

    const decDoodlerBottom = () => {
        if (doodlerBottomSpace <= 0) {
            return gameOver();
        }

        doodlerBottomSpace -= PIXEL_ADJUST;
        doodler.style.bottom = `${doodlerBottomSpace}px`;
        checkForCollisions();
    }

    const incDoodlerBottom = () => {
        if (doodlerBottomSpace > startPoint + INITIAL_DOODLER_POSITION) {
            return fall();
        }

        doodlerBottomSpace += PIXEL_JUMP;
        doodler.style.bottom = `${doodlerBottomSpace}px`;
    }

    const decDoodlerLeft = () => {
        if (doodlerLeftSpace <= 0) {
            return moveRight();
        }

        doodlerLeftSpace -= PIXEL_ADJUST;
        doodler.style.left = `${doodlerLeftSpace}px`;
    }

    const incDoodlerLeft = () => {
        if (doodlerLeftSpace >= GRID_WIDTH_MINUS_DOODLER_WIDTH) {
            return moveLeft()
        }

        doodlerLeftSpace += PIXEL_ADJUST;
        doodler.style.left = `${doodlerLeftSpace}px`;
    }

    const movePlatforms = () => (doodlerBottomSpace > INITIAL_DOODLER_POSITION)
        ? platforms.forEach(platform => {
            platform.decreaseBottom(PIXEL_ADJUST);
            platform.update();
        })
        : null;

    function moveLeft() {
        isGoingLeft = true;

        if (isGoingRight) {
            clearInterval(rightTimerId);
            isGoingRight = false;
        }

        leftTimerId = setInterval(decDoodlerLeft, DELAY);
    }

    function moveRight() {
        isGoingRight = true;

        if (isGoingLeft) {
            clearInterval(leftTimerId);
            isGoingLeft = false;
        }

        rightTimerId = setInterval(incDoodlerLeft, DELAY);
    }

    function moveStraight() {
        isGoingLeft = false;
        isGoingRight = false;
        clearInterval(leftTimerId);
        clearInterval(rightTimerId);
    }

    function controls(event) {
        event.preventDefault();
        const { key } = event

        switch (key) {
            case 'ArrowLeft':
                return moveLeft();
            case 'ArrowUp':
                return moveStraight();
            case 'ArrowRight':
                return moveRight();
            default:
                break;
        }
    }

    function gameOver() {
        isGameOver = true;

        while (grid.firstChild) {
            grid.removeChild(grid.firstChild);
        }
        grid.innerHTML = score;
        clearInterval(upTimerId);
        clearInterval(downTimerId);
        clearInterval(leftTimerId);
        clearInterval(rightTimerId);
        clearInterval(moveTimerId);
        console.log('GAME OVER!!');
        console.log('SCORE: ', score);
    }

    function start() {
        if (!isGameOver) {
            createPlatforms();
            createDoodler(grid);
            document.addEventListener('keydown', controls);
            moveTimerId = setInterval(movePlatforms, DELAY);
            jump();
        }
    }

    start();
});