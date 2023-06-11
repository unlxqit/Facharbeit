//https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
window.requestAnimFrame = (function() {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    );
})();

let canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d");

let width = 422,
    height = 552;

canvas.width = width;
canvas.height = height;

//Allgemeine Variablen
let platforms = [];
let image = document.getElementById("graphic");
let player;
let platformCount = 10;
let position = 0;
let gravity = 0.1155;
let animloop;
let flag = 0;
let menuloop;
let broken = 0;
let dir;
let score = 0;
let firstRun = true;

let Base = function() {
    this.height = 5;
    this.width = width;

    //Zurechtschneiden der Bildelemente
    this.cx = 0;
    this.cy = 614;
    this.cwidth = 100;
    this.cheight = 5;

    this.moved = 0;

    this.x = 0;
    this.y = height - this.height;

    this.draw = function() {
        try {
            ctx.drawImage(
                image,
                this.cx,
                this.cy,
                this.cwidth,
                this.cheight,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } catch (e) {}
    };
};

let base = new Base();

let Player = function() {
    this.vy = 11;
    this.vx = 0;

    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isDead = false;

    this.width = 55;
    this.height = 40;

    //Zurechtschneiden der Bildelemente
    this.cx = 0;
    this.cy = 0;
    this.cwidth = 110;
    this.cheight = 80;

    this.dir = "left";

    this.x = width / 2 - this.width / 2;
    this.y = height;

    //Zeichnen
    this.draw = function() {
        try {
            if (this.dir == "right") this.cy = 121;
            else if (this.dir == "left") this.cy = 201;
            else if (this.dir == "right_land") this.cy = 289;
            else if (this.dir == "left_land") this.cy = 371;

            ctx.drawImage(
                image,
                this.cx,
                this.cy,
                this.cwidth,
                this.cheight,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } catch (e) {}
    };

    this.jump = function() {
        this.vy = -8;
    };

    this.jumpHigh = function() {
        this.vy = -16;
    };
};

player = new Player();

function Platform() {
    this.width = 70;
    this.height = 17;

    this.x = Math.random() * (width - this.width);
    this.y = position;

    position += height / platformCount;

    this.flag = 0;
    this.state = 0;

    //Zurechtschneiden der Bildelemente
    this.cx = 0;
    this.cy = 0;
    this.cwidth = 122;
    this.cheight = 31;

    //Zeichnen
    this.draw = function() {
        try {
            if (this.type == 1) this.cy = 0;
            else if (this.type == 2) this.cy = 61;
            else if (this.type == 3 && this.flag === 0) this.cy = 31;
            else if (this.type == 3 && this.flag == 1) this.cy = 1000;
            else if (this.type == 4 && this.state === 0) this.cy = 90;
            else if (this.type == 4 && this.state == 1) this.cy = 1000;

            ctx.drawImage(
                image,
                this.cx,
                this.cy,
                this.cwidth,
                this.cheight,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } catch (e) {}
    };

    //Platformen
    //1: normal
    //2: bewegend
    //3: zerbrechlich
    //4: wolken
    if (score >= 5000) this.types = [2, 3, 3, 3, 4, 4, 4, 4];
    else if (score >= 2000 && score < 5000)
        this.types = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
    else if (score >= 1000 && score < 2000) this.types = [2, 2, 2, 3, 3, 3, 3, 3];
    else if (score >= 500 && score < 1000)
        this.types = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
    else if (score >= 100 && score < 500) this.types = [1, 1, 1, 1, 2, 2];
    else this.types = [1];

    this.type = this.types[Math.floor(Math.random() * this.types.length)];

    if (this.type == 3 && broken < 1) {
        broken++;
    } else if (this.type == 3 && broken >= 1) {
        this.type = 1;
        broken = 0;
    }

    this.moved = 0;
    this.vx = 1;
}

for (let i = 0; i < platformCount; i++) {
    platforms.push(new Platform());
}

//zerbrechliche Platformen
let Platform_broken = function() {
    this.height = 30;
    this.width = 70;

    this.x = 0;
    this.y = 0;

    //Zurechtschneiden der Bildelemente
    this.cx = 0;
    this.cy = 554;
    this.cwidth = 105;
    this.cheight = 60;

    this.appearance = false;

    this.draw = function() {
        try {
            if (this.appearance === true)
                ctx.drawImage(
                    image,
                    this.cx,
                    this.cy,
                    this.cwidth,
                    this.cheight,
                    this.x,
                    this.y,
                    this.width,
                    this.height
                );
            else return;
        } catch (e) {}
    };
}

let platform_broken = new Platform_broken();

let spring = function() {
    this.x = 0;
    this.y = 0;

    this.width = 26;
    this.height = 30;

    //Zurechtschneiden der Bildelemente
    this.cx = 0;
    this.cy = 0;
    this.cwidth = 45;
    this.cheight = 53;

    this.state = 0;

    this.draw = function() {
        try {
            if (this.state === 0) this.cy = 445;
            else if (this.state == 1) this.cy = 501;

            ctx.drawImage(
                image,
                this.cx,
                this.cy,
                this.cwidth,
                this.cheight,
                this.x,
                this.y,
                this.width,
                this.height
            );
        } catch (e) {}
    };
};

let Spring = new spring();

//allgemeine Funktion für den Start des Spieles
function init() {
    //Variablen
    let dir = "left",
        jumpCount = 0;

    firstRun = false;
    
    //Leeren der einzelnen aufeinanderfolgenden Frames
    function paintCanvas() {
        ctx.clearRect(0, 0, width, height);
    }

    //Spielerbezogene Berechnungen und Funktionen
    function playerCalc() {
        if (dir == "left") {
            player.dir = "left";
            if (player.vy < -7 && player.vy > -15) player.dir = "left_land";
        } else if (dir == "right") {
            player.dir = "right";
            if (player.vy < -7 && player.vy > -15) player.dir = "right_land";
        }

        //Tastenbelegungen(hinsichtlich der Bewerbung/Position des Players)
        document.onkeydown = function(e) {
            let key = e.keyCode;

            if (key == 37) {
                dir = "left";
                player.isMovingLeft = true;
            } else if (key == 39) {
                dir = "right";
                player.isMovingRight = true;
            }

            if (key == 13) {
                if (firstRun === true) init();
                else reset();
            }
        };

        document.onkeyup = function(e) {
            let key = e.keyCode;

            if (key == 37) {
                dir = "left";
                player.isMovingLeft = false;
            } else if (key == 39) {
                dir = "right";
                player.isMovingRight = false;
            }
        };

        //Bewegungsverhalten/Beschleunigungen durch drücken der einzelnen Tasten
        if (player.isMovingLeft === true) {
            player.x += player.vx;
            player.vx -= 0.05;
        } else {
            player.x += player.vx;
            if (player.vx < 0) player.vx += 0.1;
        }

        if (player.isMovingRight === true) {
            player.x += player.vx;
            player.vx += 0.05;
        } else {
            player.x += player.vx;
            if (player.vx > 0) player.vx -= 0.1;
        }

        //Geschwindigkeitslimit
        if (player.vx > 2) player.vx = 2;
        else if (player.vx < -2) player.vx = -2;

        //Player springt bei Kontakt mit der Base
        if (player.y + player.height > base.y && base.y < height) player.jump();

        //Spiel endet bei Berührung mit der untersten Spielfeldkante
        if (
            base.y > height &&
            player.y + player.height > height &&
            player.isDead != "Tod!"
        )
            player.isDead = true;

        //Durch die Spielfeldwand springen/Positionsveränderungen(hinsichtlich der Bewegung/Position des Players)
        if (player.x > width) player.x = 0 - player.width;
        else if (player.x < 0 - player.width) player.x = width;

        //Gravitation/Anziehungskraft die auf den Player wirkt
        if (player.y >= height / 2 - player.height / 2) {
            player.y += player.vy;
            player.vy += gravity;
        }else {
            platforms.forEach(function(p, i) {
                if (player.vy < 0) {
                    p.y -= player.vy;
                }

                if (p.y > height) {
                    platforms[i] = new Platform();
                    platforms[i].y = p.y - height;
                }
            });

            base.y -= player.vy;
            player.vy += gravity;

            if (player.vy >= 0) {
                player.y += player.vy;
                player.vy += gravity;
            }

            score++;
        }

        //Sprung bei Berührung mit den Plattformen(hinsichtlich der Bewerbung/Position des Players)
        collides();

        if (player.isDead === true)
            gameOver();
    }

    //Springalgorithmus
    function springCalc() {
        let s = Spring;
        let p = platforms[0];

        if (p.type == 1 || p.type == 2) {
            s.x = p.x + p.width / 2 - s.width / 2;
            s.y = p.y - p.height - 10;

            if (s.y > height / 1.1) s.state = 0;

            s.draw();
        } else {
            s.x = 0 - s.width;
            s.y = 0 - s.height;
        }
    }

    //Algorithmus zu den Plattformen
    function platformCalc() {
        let subs = platform_broken;

        platforms.forEach(function(p, i) {
            if (p.type == 2) {
                if (p.x < 0 || p.x + p.width > width) p.vx *= -1;

                p.x += p.vx;
            }

            if (p.flag == 1 && subs.appearance === false && jumpCount === 0) {
                subs.x = p.x;
                subs.y = p.y;
                subs.appearance = true;

                jumpCount++;
            }

            p.draw();
        });

        if (subs.appearance === true) {
            subs.draw();
            subs.y += 8;
        }

        if (subs.y > height) subs.appearance = false;
    }

    function collides() {
        //Plattformen
        platforms.forEach(function(p, i) {
            if (
                player.vy > 0 &&
                p.state === 0 &&
                player.x + 15 < p.x + p.width &&
                player.x + player.width - 15 > p.x &&
                player.y + player.height > p.y &&
                player.y + player.height < p.y + p.height
            ) {
                if (p.type == 3 && p.flag === 0) {
                    p.flag = 1;
                    jumpCount = 0;
                    return;
                } else if (p.type == 4 && p.state === 0) {
                    player.jump();
                    p.state = 1;
                } else if (p.flag == 1) return;
                else {
                    player.jump();
                }
            }
        });

        //Springen über Sprungfeder
        let s = Spring;
        if (
            player.vy > 0 &&
            s.state === 0 &&
            player.x + 15 < s.x + s.width &&
            player.x + player.width - 15 > s.x &&
            player.y + player.height > s.y &&
            player.y + player.height < s.y + s.height
        ) {
            s.state = 1;
            player.jumpHigh();
        }
    }

    function updateScore() {
        let scoreText = document.getElementById("score");
        scoreText.innerHTML = score;
    }

    function gameOver() {
        platforms.forEach(function(p, i) {
            p.y -= 12;
        });

        if (player.y > height / 2 && flag === 0) {
            player.y -= 8;
            player.vy = 0;
        } else if (player.y < height / 2) flag = 1;
        else if (player.y + player.height > height) {
            showGoMenu();
            hideScore();
            bestscore();
            player.isDead = "Tod!";
        }
    }

    //Aktualisierung aller Elemente
    function update() {
        paintCanvas();
        platformCalc();

        springCalc();

        playerCalc();
        player.draw();

        base.draw();

        updateScore();
    }

    menuLoop = function() {
        return;
    };
    animloop = function() {
        update();
        requestAnimFrame(animloop);
    };

    animloop();

    hideMenu();
    showScore();
}

//zurücksetzen des Spieles
function reset() {
    location.reload(true);
}

//Ausblenden des Hauptmenüs
function hideMenu() {
    let menu = document.getElementById("start-main");
    menu.style.zIndex = -1;
}

//Einblenden des Todesmenüs
function showGoMenu() {
    let menu = document.getElementById("lost-main");
    menu.style.zIndex = 1;
    menu.style.visibility = "visible";

    let scoreText = document.getElementById("finish_score");
    scoreText.innerHTML = "Du hast <B>" + score + " Punkte</B> erreicht!";
}

//Ausblenden des Todesmenüs
function hideGoMenu() {
    let menu = document.getElementById("lost-main");
    menu.style.zIndex = -1;
    menu.style.visibility = "hidden";
}

//Score während des Spieles
function showScore() {
    let menu = document.getElementById("result");
    menu.style.zIndex = 1;
}

//Der sich im Spiel veränderne Score wird ausgeblendet
function hideScore() {
    let menu = document.getElementById("result");
    menu.style.zIndex = -1;
}

//Player im Hauptmenü
function playerJump() {
    player.y += player.vy;
    player.vy += gravity;

    if (
        player.vy > 0 &&
        player.x + 15 < 260 &&
        player.x + player.width - 15 > 155 &&
        player.y + player.height > 475 &&
        player.y + player.height < 500
    )
        player.jump();

    if (dir == "left") {
        player.dir = "left";
        if (player.vy < -7 && player.vy > -15) player.dir = "left_land";
    } else if (dir == "right") {
        player.dir = "right";
        if (player.vy < -7 && player.vy > -15) player.dir = "right_land";
    }

    //Tastenbelegung (hinsichtlich des Sprunges)
    document.onkeydown = function(e) {
        let key = e.keyCode;

        if (key == 37) {
            dir = "left";
            player.isMovingLeft = true;
        } else if (key == 39) {
            dir = "right";
            player.isMovingRight = true;
        }

        if (key == 13) {
            if (firstRun === true) {
                init();
                firstRun = false;
            } else reset();
        }
    };

    document.onkeyup = function(e) {
        let key = e.keyCode;

        if (key == 37) {
            dir = "left";
            player.isMovingLeft = false;
        } else if (key == 39) {
            dir = "right";
            player.isMovingRight = false;
        }
    };

    //Beschleunigung durch gedrückthalten der Tasten
    if (player.isMovingLeft === true) {
        player.x += player.vx;
        player.vx -= 0.05;
    } else {
        player.x += player.vx;
        if (player.vx < 0) player.vx += 0.1;
    }

    if (player.isMovingRight === true) {
        player.x += player.vx;
        player.vx += 0.05;
    } else {
        player.x += player.vx;
        if (player.vx > 0) player.vx -= 0.1;
    }

    //Player springt bei Berührung mit dem Boden (hinsichtlich des Sprunges)
    if (player.y + player.height > base.y && base.y < height) player.jump();

    //Durch die Spielfeldwand springen/Positionsveränderungen(hinsichtlich des Sprunges)
    if (player.x > width) player.x = 0 - player.width;
    else if (player.x < 0 - player.width) player.x = width;

    //Geschwindigkeitslimit
    if (player.vx > 2) player.vx = 2;
    else if (player.vx < -2) player.vx = -2;

    player.draw();
}

//Aktualisierung des Hauptmenüs
function update() {
    ctx.clearRect(0, 0, width, height);
    playerJump();
}

menuLoop = function() {
    update();
    requestAnimFrame(menuLoop);
};

//Wiederholung aller Elemente und Komponenten
menuLoop();