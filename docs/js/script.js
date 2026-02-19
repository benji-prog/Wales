let jsonData = {};
let gameRunning = false;
let animationFrameId;
let frameCount = 0;

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    if(localStorage.getItem('theme') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        if(body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });

    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            initGeography();
            initHistory();
            initCulture();
            initLiterature();
            initAttractions();
        })
        .catch(err => console.error(err));
});

function initGeography() {
    const grid = document.getElementById("geographyGrid");
    if(!jsonData.geography) return;
    jsonData.geography.forEach(item => {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm">
                <img src="${item.img}" class="card-img-top" style="height:200px; object-fit:cover;" alt="${item.title}">
                <div class="card-body">
                    <h5 class="card-title fw-bold text-danger">${item.title}</h5>
                    <p class="card-text">${item.text}</p>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });
}

function initHistory() {
    const list = document.getElementById("historyList");
    const title = document.getElementById("historyTitle");
    const text = document.getElementById("historyText");
    const img = document.getElementById("historyImg");
    if(!jsonData.history) return;
    jsonData.history.forEach((item, index) => {
        const btn = document.createElement("button");
        btn.className = `list-group-item list-group-item-action ${index === 0 ? 'active' : ''}`;
        btn.textContent = item.title || "Korszak";
        btn.onclick = () => {
            document.querySelectorAll("#historyList .list-group-item").forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            title.textContent = item.title;
            text.textContent = item.text;
            if(item.img) img.src = item.img;
        };
        list.appendChild(btn);
    });
    if(jsonData.history.length > 0) {
        title.textContent = jsonData.history[0].title;
        text.textContent = jsonData.history[0].text;
        img.src = jsonData.history[0].img;
    }
}

function initCulture() {
    const dropdown = document.getElementById("cultureDropdown");
    const title = document.getElementById("cultureTitle");
    const text = document.getElementById("cultureText");
    const img = document.getElementById("cultureImg");
    if(!jsonData.culture) return;
    title.textContent = jsonData.culture[0].title;
    text.textContent = jsonData.culture[0].text;
    img.src = jsonData.culture[0].img;
    jsonData.culture.forEach(item => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "dropdown-item";
        a.href = "#";
        a.textContent = item.title;
        a.onclick = (e) => {
            e.preventDefault();
            title.textContent = item.title;
            text.textContent = item.text;
            img.src = item.img;
        };
        li.appendChild(a);
        dropdown.appendChild(li);
    });
}

function initLiterature() {
    const grid = document.getElementById("literatureGrid");
    if(!jsonData.literature) return;
    jsonData.literature.forEach(item => {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.innerHTML = `<div class="card h-100 shadow-sm border-0"><img src="${item.img}" class="card-img-top" style="height: 250px; object-fit: cover;"><div class="card-body"><h5 class="card-title fw-bold text-danger">${item.title}</h5><p class="card-text">${item.text}</p></div></div>`;
        grid.appendChild(col);
    });
}

function initAttractions() {
    const container = document.getElementById("attractionsCarouselInner");
    if(!jsonData.attractions) return;
    jsonData.attractions.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        div.innerHTML = `<img src="${item.img}" class="d-block w-100" style="height: 500px; object-fit: cover; filter: brightness(0.8);"><div class="carousel-caption d-md-block bg-dark bg-opacity-75 rounded p-3 mb-4"><h3 class="fw-bold text-warning">${item.title}</h3><p class="lead">${item.text}</p></div>`;
        container.appendChild(div);
    });
}

const dragon = document.getElementById('dragon');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const speedDisplay = document.getElementById('speed-tag');

let dragonY = 180;
let score = 0;
let gameSpeed = 5;
let keys = {};
let gameObjects = []; 

window.addEventListener('keydown', (e) => {
    if(["ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        keys[e.key] = true;
    }
});
window.addEventListener('keyup', (e) => {
    if(["ArrowUp", "ArrowDown"].includes(e.key)) keys[e.key] = false;
});

function createElem(cls, style) {
    const div = document.createElement('div');
    div.className = cls;
    Object.assign(div.style, style);
    gameContainer.appendChild(div);
    return div;
}

function spawnCastle() {
    if (!gameRunning) return;
    const gap = 160; 
    const h = gameContainer.clientHeight;
    const minWall = 50;
    const randomH = Math.random() * (h - gap - (minWall*2)) + minWall;
    const startX = gameContainer.clientWidth;

    const top = createElem('castle', { height: randomH + 'px', top: '0', left: startX + 'px', borderBottom: '5px solid #222' });
    const bot = createElem('castle', { height: (h - randomH - gap) + 'px', bottom: '0', left: startX + 'px', borderTop: '5px solid #222' });

    gameObjects.push({ 
        elems: [top, bot], 
        x: startX, 
        isObstacle: true, 
        active: true,
        originalTopHeight: randomH,
        originalBotHeight: (h - randomH - gap)
    });
}

function spawnCoin() {
    if (!gameRunning) return;
    const startX = gameContainer.clientWidth;
    const startY = Math.random() * (gameContainer.clientHeight - 60) + 20;
    const coin = createElem('coin', { 
        top: startY + 'px',
        left: startX + 'px'
    });
    coin.innerHTML = "⚜️"; 
    gameObjects.push({ elems: [coin], x: startX, y: startY, isObstacle: false, active: true });
}

let castleInterval, coinInterval;

function startGame() {
    if(gameRunning) return;
    gameRunning = true;
    document.getElementById('game-overlay').classList.add('hidden');
    dragonY = 200;
    score = 0;
    gameSpeed = 5;
    scoreDisplay.innerText = "Érmék: 0";
    speedDisplay.innerText = "Sebesség: 1.0x";
    gameObjects.forEach(obj => obj.elems.forEach(el => el.remove()));
    gameObjects = [];
    
    castleInterval = setInterval(spawnCastle, 2000);
    coinInterval = setInterval(spawnCoin, 1500);
    loop();
}

function gameOver() {
    gameRunning = false;
    clearInterval(castleInterval);
    clearInterval(coinInterval);
    cancelAnimationFrame(animationFrameId);
    
    document.getElementById('game-overlay').classList.remove('hidden');
    document.querySelector('#game-overlay h3').innerHTML = `VÉGE!<br>Pontszám: ${score}`;
    document.querySelector('#game-overlay button').innerText = "ÚJRA";
}

function loop() {
    if (!gameRunning) return;
    
    frameCount++;

    let dragonImg = (Math.floor(frameCount / 28) % 2 === 0) 
                    ? 'img/flying_dragon-red1.png' 
                    : 'img/flying_dragon-red2.png';
    
    const limit = gameContainer.clientHeight - dragon.offsetHeight;
    if (keys['ArrowUp'] && dragonY > 0) {
        dragonY -= 6;
        dragon.style.transform = "rotate(-20deg)";
    } 
    else if (keys['ArrowDown'] && dragonY < limit) {
        dragonY += 6;
        dragon.style.transform = "rotate(20deg)";
    } else {
        dragon.style.transform = "rotate(0deg)";
    }
    
    dragon.style.top = dragonY + 'px';
    dragon.style.backgroundImage = `url('${dragonImg}')`;

    const dR = {
        top: dragonY + 15,
        bottom: dragonY + dragon.offsetHeight - 15,
        left: 60 + 15,
        right: 60 + dragon.offsetWidth - 15
    };

    const time = Date.now();

    for (let i = gameObjects.length - 1; i >= 0; i--) {
        let obj = gameObjects[i];
        obj.x -= gameSpeed;

        if (!obj.isObstacle && score >= 10) {
            const hover = Math.sin(time / 200) * 30;
            obj.elems[0].style.top = (obj.y + hover) + "px";
        }

        if (obj.isObstacle && score >= 20) {
            const shift = Math.sin(time / 500) * 40;
            obj.elems[0].style.height = (obj.originalTopHeight + shift) + "px";
            obj.elems[1].style.height = (obj.originalBotHeight - shift) + "px";
        }

        obj.elems.forEach(el => el.style.left = obj.x + 'px');

        if (obj.active) {
            let hit = false;
            obj.elems.forEach(el => {
                const eR = {
                    top: el.offsetTop,
                    bottom: el.offsetTop + el.offsetHeight,
                    left: el.offsetLeft,
                    right: el.offsetLeft + el.offsetWidth
                };
                if (dR.right > eR.left && dR.left < eR.right && dR.top < eR.bottom && dR.bottom > eR.top) {
                   hit = true;
                }
            });

            if (hit) {
                if (obj.isObstacle) {
                    gameOver();
                    return;
                } else {
                    score++;
                    scoreDisplay.innerText = "Érmék: " + score;
                    if(score % 5 === 0) {
                        gameSpeed += 0.5;
                        speedDisplay.innerText = `Sebesség: ${(gameSpeed/5).toFixed(1)}x`;
                    }
                    obj.active = false;
                    obj.elems.forEach(el => el.remove());
                }
            }
        }

        if (obj.x < -100) {
            obj.elems.forEach(el => el.remove());
            gameObjects.splice(i, 1);
        }
    }
    animationFrameId = requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', () => {
    const sourceBtn = document.getElementById('sourceBtn');
    const sourceToast = document.getElementById('sourceToast');
    if (sourceBtn && sourceToast) {
        sourceBtn.addEventListener('click', () => {
            const toast = new bootstrap.Toast(sourceToast);
            toast.show();
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');

    if (!btnUp || !btnDown) return;

    const setKeyState = (key, isPressed) => {
        keys[key] = isPressed;
    };

    const setupControl = (element, key) => {
        element.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            setKeyState(key, true);
        }, { passive: false });

        element.addEventListener('touchend', () => setKeyState(key, false));
        element.addEventListener('touchcancel', () => setKeyState(key, false));
        element.addEventListener('mousedown', () => setKeyState(key, true));
        window.addEventListener('mouseup', () => setKeyState(key, false)); 
    };

    setupControl(btnUp, 'ArrowUp');
    setupControl(btnDown, 'ArrowDown');
});