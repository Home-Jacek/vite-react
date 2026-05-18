(function () {
    "use strict";

    const GRID_SIZE = 20;
    const CELL_SIZE = 20;
    const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
    const INITIAL_SPEED = 150;
    const SPEED_INCREMENT = 2;
    const MIN_SPEED = 60;

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    const scoreEl = document.getElementById("score");
    const highScoreEl = document.getElementById("highScore");
    const overlay = document.getElementById("overlay");
    const overlayTitle = document.getElementById("overlayTitle");
    const overlayMessage = document.getElementById("overlayMessage");
    const startBtn = document.getElementById("startBtn");

    const Direction = { UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3 };

    let snake, direction, nextDirection, food, score, highScore, speed, gameLoop, running, paused;

    highScore = parseInt(localStorage.getItem("snakeHighScore")) || 0;
    highScoreEl.textContent = highScore;

    function init() {
        const midX = Math.floor(GRID_SIZE / 2);
        const midY = Math.floor(GRID_SIZE / 2);
        snake = [
            { x: midX, y: midY },
            { x: midX - 1, y: midY },
            { x: midX - 2, y: midY }
        ];
        direction = Direction.RIGHT;
        nextDirection = Direction.RIGHT;
        score = 0;
        speed = INITIAL_SPEED;
        paused = false;
        scoreEl.textContent = score;
        placeFood();
    }

    function placeFood() {
        let pos;
        do {
            pos = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
        } while (snake.some(function (s) { return s.x === pos.x && s.y === pos.y; }));
        food = pos;
    }

    function update() {
        if (paused) return;

        direction = nextDirection;

        var head = { x: snake[0].x, y: snake[0].y };

        switch (direction) {
            case Direction.UP: head.y--; break;
            case Direction.DOWN: head.y++; break;
            case Direction.LEFT: head.x--; break;
            case Direction.RIGHT: head.x++; break;
        }

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            gameOver();
            return;
        }

        for (var i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreEl.textContent = score;
            if (speed > MIN_SPEED) {
                speed = Math.max(MIN_SPEED, speed - SPEED_INCREMENT);
            }
            placeFood();
            restartLoop();
        } else {
            snake.pop();
        }
    }

    function draw() {
        ctx.fillStyle = "#0a0a1a";
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        drawGrid();
        drawFood();
        drawSnake();

        if (paused) {
            ctx.fillStyle = "rgba(10, 10, 26, 0.7)";
            ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            ctx.fillStyle = "#4ecca3";
            ctx.font = "bold 28px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("PAUSED", CANVAS_SIZE / 2, CANVAS_SIZE / 2);
        }
    }

    function drawGrid() {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 0.5;
        for (var i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
            ctx.stroke();
        }
    }

    function drawSnake() {
        for (var i = 0; i < snake.length; i++) {
            var seg = snake[i];
            var isHead = (i === 0);

            if (isHead) {
                ctx.fillStyle = "#4ecca3";
                ctx.shadowColor = "#4ecca3";
                ctx.shadowBlur = 8;
            } else {
                var alpha = 1 - (i / (snake.length + 5)) * 0.6;
                ctx.fillStyle = "rgba(78, 204, 163, " + alpha + ")";
                ctx.shadowBlur = 0;
            }

            var padding = isHead ? 0.5 : 1;
            roundRect(
                seg.x * CELL_SIZE + padding,
                seg.y * CELL_SIZE + padding,
                CELL_SIZE - padding * 2,
                CELL_SIZE - padding * 2,
                3
            );
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function drawFood() {
        var x = food.x * CELL_SIZE + CELL_SIZE / 2;
        var y = food.y * CELL_SIZE + CELL_SIZE / 2;
        var radius = CELL_SIZE / 2 - 2;

        ctx.shadowColor = "#e94560";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#e94560";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
    }

    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function gameOver() {
        running = false;
        clearInterval(gameLoop);

        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem("snakeHighScore", highScore);
        }

        overlayTitle.textContent = "Game Over";
        overlayMessage.textContent = "Score: " + score + " | Press Start to play again";
        startBtn.textContent = "Play Again";
        overlay.classList.remove("hidden");
    }

    function tick() {
        update();
        draw();
    }

    function restartLoop() {
        clearInterval(gameLoop);
        gameLoop = setInterval(tick, speed);
    }

    function startGame() {
        init();
        overlay.classList.add("hidden");
        running = true;
        draw();
        restartLoop();
    }

    function setDirection(dir) {
        if (!running || paused) return;

        if (dir === Direction.UP && direction !== Direction.DOWN) nextDirection = Direction.UP;
        if (dir === Direction.DOWN && direction !== Direction.UP) nextDirection = Direction.DOWN;
        if (dir === Direction.LEFT && direction !== Direction.RIGHT) nextDirection = Direction.LEFT;
        if (dir === Direction.RIGHT && direction !== Direction.LEFT) nextDirection = Direction.RIGHT;
    }

    document.addEventListener("keydown", function (e) {
        switch (e.key) {
            case "ArrowUp": case "w": case "W":
                e.preventDefault();
                setDirection(Direction.UP);
                break;
            case "ArrowDown": case "s": case "S":
                e.preventDefault();
                setDirection(Direction.DOWN);
                break;
            case "ArrowLeft": case "a": case "A":
                e.preventDefault();
                setDirection(Direction.LEFT);
                break;
            case "ArrowRight": case "d": case "D":
                e.preventDefault();
                setDirection(Direction.RIGHT);
                break;
            case "p": case "P":
                e.preventDefault();
                if (running) {
                    paused = !paused;
                    draw();
                }
                break;
        }
    });

    startBtn.addEventListener("click", startGame);

    var btnUp = document.getElementById("btnUp");
    var btnDown = document.getElementById("btnDown");
    var btnLeft = document.getElementById("btnLeft");
    var btnRight = document.getElementById("btnRight");

    if (btnUp) btnUp.addEventListener("click", function () { setDirection(Direction.UP); });
    if (btnDown) btnDown.addEventListener("click", function () { setDirection(Direction.DOWN); });
    if (btnLeft) btnLeft.addEventListener("click", function () { setDirection(Direction.LEFT); });
    if (btnRight) btnRight.addEventListener("click", function () { setDirection(Direction.RIGHT); });

    draw();
})();
