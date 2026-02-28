let jsonData = {};
let gameRunning = false;
let isPaused = false;
let isCountingDown = false;
let animationFrameId;
let frameCount = 0;
let activeHistoryIndex = 0;
let currentHeroImageIndex = 0;
let dragonY = 180;
let score = 0;
let gameSpeed = 5;
let currentDrawSpeed = 5;
let keys = {};
let gameObjects = [];
let castleInterval;
let coinInterval;
let aktualisOldal = 0;
let settingsReturnTo = 'menu';

const heroImages = [
    'url("img/wales_hero_bg.jpg")',
    'url("img/snowdon_mountain.png")',
    'url("img/castle1.jpeg")'
];

const vegsoUzenetek = [
    { limit: 0, szoveg: "A sárkányod most még inkább bárány… Gyere vissza, és mutasd meg Wales erejét!" },
    { limit: 5, szoveg: "Már felcsillant egy kis tűz! De a walesi hegyek ennél többet várnak!" },
    { limit: 10, szoveg: "Szép repülés! A vörös sárkány büszkén figyel Cardiff felől!" },
    { limit: 15, szoveg: "A szárnyaid már magabiztosan hasítják a levegőt! A coin-ok csilingelése messzire hallatszik!" },
    { limit: 20, szoveg: "Ez már igazi hegyi szárnyalás! Snowdonia szelei veled vannak!" },
    { limit: 35, szoveg: "Tűz és arany mindenütt! A repülésed már legendák születését ígéri!" },
    { limit: 50, szoveg: "A vörös sárkány ereje benned él! Wales büszke lehet rád!" },
    { limit: 65, szoveg: "Fenséges repülés! A legendák kapujában jársz… még egy nagy szárnycsapás!" },
    { limit: 82, szoveg: "WALES SÁRKÁNYMESTERE! A legendás vörös sárkány méltó lovasa vagy – a ranglista retteg!" }
];

const tartalom = [
    { cim: "Felfelé mozgás", szoveg: "A felfelé nyíllal tudsz felfelé repülni a sárkánnyal. Ezt megteheted a billentyűzeten, illetve a játékon belüli sárga nyíllal is.", kep: "./img/image_fel.png" },
    { cim: "Lefelé mozgás", szoveg: "A lefelé nyíllal tudsz lefelé repülni a sárkánnyal. Ezt megteheted a billentyűzeten, illetve a játékon belüli sárga nyíllal is.", kep: "./img/image_le.png"},
    { cim: "Akadályok", szoveg: "Kerüld ki a tornyokat, és juss minél tovább! Az akadályok 20 pont után elkezdenek mozogni.", kep: "./img/image.png" },
    { cim: "Coinok", szoveg: "A játék lényege a coinok gyűjtése, hiszen ezekkel tudsz továbbjutni. Vigyázz, mert 10 pont után a coinok elkezdenek mozogni!", kep: "./img/image_coin.png"}
];

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;

    if(localStorage.getItem('theme') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if(body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                if (icon) icon.classList.replace('fa-sun', 'fa-moon');
                localStorage.setItem('theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                if (icon) icon.classList.replace('fa-moon', 'fa-sun');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    setInterval(() => {
        const hero = document.getElementById('heroFader');
        if(hero) {
            currentHeroImageIndex = (currentHeroImageIndex + 1) % heroImages.length;
            hero.style.backgroundImage = heroImages[currentHeroImageIndex];
        }
    }, 5000);

    const heroInit = document.getElementById('heroFader');
    if(heroInit) heroInit.style.backgroundImage = heroImages[0];

    const scrollBtn = document.getElementById("scrollToTopBtn");
    window.addEventListener("scroll", () => {
        const gameSection = document.getElementById("Game");
        let hideForGame = false;

        if (gameSection && window.innerWidth < 768) {
            const rect = gameSection.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                hideForGame = true;
            }
        }

        if ((document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) && !hideForGame) {
            scrollBtn.style.display = "flex";
        } else {
            scrollBtn.style.display = "none";
        }
    });

    scrollBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    function updateActiveNav() {
        let current = "";
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const scrollY = window.scrollY;
        
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - navHeight - 10;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("active");
            if (current && link.getAttribute("href").includes(current)) {
                link.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", updateActiveNav);
    updateActiveNav();

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const collapseEl = document.getElementById('navbarNav');
                    const collapse = bootstrap.Collapse.getInstance(collapseEl);
                    if (collapseEl.classList.contains('show') && collapse) {
                        collapse.hide();
                    }
                    const navHeight = document.querySelector('.navbar').offsetHeight;
                    const offsetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
             
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
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

    const sourceBtn = document.getElementById('sourceBtn');
    const sourceToast = document.getElementById('sourceToast');
    if (sourceBtn && sourceToast) {
        sourceBtn.addEventListener('click', () => {
            const toast = new bootstrap.Toast(sourceToast);
            toast.show();
        });
    }

    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    if (btnUp && btnDown) {
        const setKeyState = (key, isPressed) => { keys[key] = isPressed; };
        const setupControl = (element, key) => {
            element.addEventListener('touchstart', (e) => {
                e.preventDefault(); 
                setKeyState(key, true);
            }, { passive: false });
            element.addEventListener('touchend', () => setKeyState(key, false));
            element.addEventListener('touchcancel', () => setKeyState(key, false));
            element.addEventListener('mousedown', () => setKeyState(key, true));
        };
        setupControl(btnUp, 'ArrowUp');
        setupControl(btnDown, 'ArrowDown');
        window.addEventListener('mouseup', () => {
            keys['ArrowUp'] = false;
            keys['ArrowDown'] = false;
        });
    }

    const volumeSlider = document.getElementById('volumeSlider');
    const muteToggle = document.getElementById('muteToggle');
    const gameMusic = document.getElementById('gameMusic');

    if (volumeSlider && gameMusic && muteToggle) {
        gameMusic.volume = volumeSlider.value;
        
        volumeSlider.addEventListener('input', (e) => {
            if(!muteToggle.checked) {
                gameMusic.volume = e.target.value;
            }
        });

        muteToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                gameMusic.volume = 0;
            } else {
                gameMusic.volume = volumeSlider.value;
            }
        });
    }
});

function openGlobalModal(dataItem) {
    document.getElementById('modalTitle').textContent = dataItem.title;
    document.getElementById('modalTextContent').textContent = dataItem.modalText;
    
    const carouselInner = document.getElementById('modalCarouselInner');
    carouselInner.innerHTML = '';
    
    dataItem.modalImages.forEach((imgSrc, idx) => {
        const div = document.createElement('div');
        div.className = `carousel-item ${idx === 0 ? 'active' : ''}`;
        div.innerHTML = `<img src="${imgSrc}" class="d-block w-100" alt="Modal Image">`;
        carouselInner.appendChild(div);
    });
    
    const modalInstance = new bootstrap.Modal(document.getElementById('globalModal'));
    modalInstance.show();
}

function initGeography() {
    const grid = document.getElementById("geographyGrid");
    if(!grid || !jsonData.geography) return;
    jsonData.geography.forEach(item => {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm cursor-pointer" onclick='openModalById("geography", "${item.id}")'>
                <div class="img-container">
                    <img src="${item.img}" class="card-img-top fixed-img-height" alt="${item.title}">
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold text-danger mb-3">${item.title}</h5>
                    <p class="card-text text-truncate-3 text-secondary">${item.text}</p>
                    <div class="mt-auto pt-3 text-end">
                        <span class="text-danger small fw-bold">Tovább <i class="fa-solid fa-plus"></i></span>
                    </div>
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
    const cardTrigger = document.getElementById("historyCardTrigger");
    
    if(!list || !jsonData.history) return;
    jsonData.history.forEach((item, index) => {
        const btn = document.createElement("button");
        btn.className = `list-group-item list-group-item-action ${index === 0 ? 'active' : ''}`;
        btn.textContent = item.title;
        btn.onclick = () => {
            document.querySelectorAll("#historyList .list-group-item").forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            title.textContent = item.title;
            text.textContent = item.text;
            if(item.img) img.src = item.img;
            activeHistoryIndex = index;
        };
        list.appendChild(btn);
    });
    
    if(jsonData.history.length > 0) {
        title.textContent = jsonData.history[0].title;
        text.textContent = jsonData.history[0].text;
        img.src = jsonData.history[0].img;
        
        cardTrigger.onclick = () => {
            openGlobalModal(jsonData.history[activeHistoryIndex]);
        };
    }
}

function initCulture() {
    const container = document.getElementById("cultureContainer");
    if(!container || !jsonData.culture) return;

    container.innerHTML = "";
    jsonData.culture.forEach(item => {
        const slice = document.createElement("div");
        slice.className = "culture-slice";
        slice.style.backgroundImage = `url('${item.img}')`;
        slice.onclick = () => openGlobalModal(item);
        
        slice.innerHTML = `
            <div class="culture-slice-title">${item.title}</div>
            <div class="culture-overlay">
                <div class="culture-content-inner">
                    <h3 class="text-white fw-bold mb-2">${item.title}</h3>
                    <p class="text-light text-truncate-3 mb-3">${item.text}</p>
                    <span class="btn btn-sm btn-danger rounded-pill px-3">Részletek</span>
                </div>
             </div>
        `;
        container.appendChild(slice);
    });
}

function initLiterature() {
    const grid = document.getElementById("literatureGrid");
    if(!grid || !jsonData.literature) return;
    jsonData.literature.forEach(item => {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 cursor-pointer" onclick='openModalById("literature", "${item.id}")'>
                <div class="img-container">
                    <img src="${item.img}" class="card-img-top fixed-img-height">
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold text-danger mb-3">${item.title}</h5>
                    <p class="card-text text-truncate-3 text-secondary">${item.text}</p>
                    <div class="mt-auto pt-3 text-end">
                         <span class="text-danger small fw-bold">Tovább <i class="fa-solid fa-plus"></i></span>
                    </div>
                </div>
            </div>`;
        grid.appendChild(col);
    });
}

function initAttractions() {
    const container = document.getElementById("attractionsCarouselInner");
    if(!container || !jsonData.attractions) return;
    jsonData.attractions.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = `carousel-item ${index === 0 ? 'active' : ''} cursor-pointer`;
        div.onclick = () => openGlobalModal(item);
        div.innerHTML = `
            <img src="${item.img}" class="d-block w-100" style="height: 550px; object-fit: cover; filter: brightness(0.7);">
            <div class="carousel-caption d-md-block bg-dark bg-opacity-75 rounded p-4 mb-5 border border-secondary shadow">
                 <h3 class="fw-bold text-warning mb-3">${item.title}</h3>
                <p class="lead text-truncate-3 mb-3">${item.text}</p>
                <button class="btn btn-outline-warning btn-sm px-4 rounded-pill">Galéria & Infó</button>
            </div>`;
        container.appendChild(div);
    });
}

function openModalById(category, id) {
    if(jsonData[category]) {
        const item = jsonData[category].find(x => x.id === id);
        if(item) openGlobalModal(item);
    }
}

const dragon = document.getElementById('dragon');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const speedDisplay = document.getElementById('speed-tag');

window.addEventListener('keydown', (e) => {
    if(["ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        keys[e.key] = true;
    }
    if(e.key === 'Escape') {
        if(gameRunning && !isPaused && !isCountingDown) {
            pauseGame();
        } else if (gameRunning && isPaused) {
            initiateResume();
        }
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
    if (!gameRunning || isPaused) return;
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
    if (!gameRunning || isPaused) return;
    const startX = gameContainer.clientWidth;
    const startY = Math.random() * (gameContainer.clientHeight - 60) + 20;
    const coin = createElem('coin', { 
        top: startY + 'px',
        left: startX + 'px'
    });
    coin.innerHTML = "⚜️"; 
    gameObjects.push({ elems: [coin], x: startX, y: startY, isObstacle: false, active: true });
}

function startGame() {
    if(gameRunning) return;
    gameRunning = true;
    isPaused = false;
    isCountingDown = false;
    document.getElementById('game-overlay').classList.add('hidden');
    document.getElementById('pause-overlay').classList.add('hidden');
    dragonY = 200;
    score = 0;
    gameSpeed = 5;
    currentDrawSpeed = 5;
    frameCount = 0;
    scoreDisplay.innerText = "Érmék: 0";
    speedDisplay.innerText = "Sebesség: 1.0x";
    
    gameObjects.forEach(obj => obj.elems.forEach(el => el.remove()));
    gameObjects = [];
    
    if (document.getElementById('gameMusic')) {
        document.getElementById('gameMusic').currentTime = 0;
        document.getElementById('gameMusic').play().catch(e => console.log("Audio play blocked", e));
    }
    
    castleInterval = setInterval(spawnCastle, 2000);
    coinInterval = setInterval(spawnCoin, 1500);
    loop();
}

function pauseGame() {
    if (!gameRunning || isPaused || isCountingDown) return;
    isPaused = true;
    clearInterval(castleInterval);
    clearInterval(coinInterval);
    document.getElementById('pause-overlay').classList.remove('hidden');
    if (document.getElementById('gameMusic')) {
        document.getElementById('gameMusic').pause();
    }
}

function initiateResume() {
    document.getElementById('pause-overlay').classList.add('hidden');
    document.getElementById('settings-overlay').classList.add('hidden');
    isCountingDown = true;
    
    let counter = 3;
    const countdownEl = document.getElementById('countdown-display');
    const countdownText = countdownEl.querySelector('.countdown-text');
    countdownText.innerText = counter;
    countdownEl.classList.remove('hidden');

    const tick = setInterval(() => {
        counter--;
        if (counter > 0) {
            countdownText.innerText = counter;
        } else {
            clearInterval(tick);
            countdownEl.classList.add('hidden');
            isCountingDown = false;
            resumeGame();
        }
    }, 1000);
}

function resumeGame() {
    isPaused = false;
    currentDrawSpeed = gameSpeed * 0.3; 
    castleInterval = setInterval(spawnCastle, 2000);
    coinInterval = setInterval(spawnCoin, 1500);
    if (document.getElementById('gameMusic') && !document.getElementById('muteToggle').checked) {
        document.getElementById('gameMusic').play();
    }
}

function quitGame() {
    gameRunning = false;
    isPaused = false;
    clearInterval(castleInterval);
    clearInterval(coinInterval);
    cancelAnimationFrame(animationFrameId);
    if (document.getElementById('gameMusic')) {
        document.getElementById('gameMusic').pause();
    }
    document.getElementById('pause-overlay').classList.add('hidden');
    document.getElementById('settings-overlay').classList.add('hidden');
    const overlay = document.getElementById('game-overlay');
    overlay.classList.remove('hidden');
    overlay.querySelector('h3').innerHTML = "Készen állsz?";
    const btn = overlay.querySelector('button');
    if(btn) btn.innerText = "INDÍTÁS";
}

function openSettings(from) {
    settingsReturnTo = from;
    document.getElementById('game-overlay').classList.add('hidden');
    document.getElementById('pause-overlay').classList.add('hidden');
    document.getElementById('settings-overlay').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settings-overlay').classList.add('hidden');
    if (settingsReturnTo === 'menu') {
        document.getElementById('game-overlay').classList.remove('hidden');
    } else if (settingsReturnTo === 'pause') {
        document.getElementById('pause-overlay').classList.remove('hidden');
    }
}

function getVegsoUzenet(pontszam) {
    let kivalasztott = vegsoUzenetek[0].szoveg;
    for (let i = 0; i < vegsoUzenetek.length; i++) {
        if (pontszam >= vegsoUzenetek[i].limit) {
            kivalasztott = vegsoUzenetek[i].szoveg;
        }
    }
    return kivalasztott;
}

function gameOver() {
    gameRunning = false;
    clearInterval(castleInterval);
    clearInterval(coinInterval);
    cancelAnimationFrame(animationFrameId);
    
    if (document.getElementById('gameMusic')) {
        document.getElementById('gameMusic').pause();
    }
    
    const uzenet = getVegsoUzenet(score);
    const gameOverlay = document.getElementById('game-overlay');
    
    gameOverlay.classList.remove('hidden');
    
    const h3 = gameOverlay.querySelector('h3');
    if (h3) {
        h3.innerHTML = `
            VÉGE!<br>
            Pontszám: ${score}<br>
            <p style="font-size: 1.2rem; margin-top: 15px; color: #f1c40f; font-style: italic;">${uzenet}</p>
        `;
    }
    
    const button = gameOverlay.querySelector('button');
    if (button) button.innerText = "ÚJRA";
}

function loop() {
    if (!gameRunning || isPaused || isCountingDown) {
        if(gameRunning) animationFrameId = requestAnimationFrame(loop);
        return;
    }
    
    const limit = gameContainer.clientHeight - dragon.offsetHeight;
    frameCount++;
    let currentDragonImg = (Math.floor(frameCount / 20) % 2 === 0) 
        ? "url('img/flying_dragon-red1.png')" 
        : "url('img/flying_dragon-red2.png')";

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
    
    dragon.style.backgroundImage = currentDragonImg;
    dragon.style.top = dragonY + 'px';

    const dR = {
        top: dragonY + 30,
        bottom: dragonY + dragon.offsetHeight - 30,
        left: 60 + 30,
        right: 60 + dragon.offsetWidth - 40
    };

    const time = Date.now();

    if (currentDrawSpeed < gameSpeed) {
        currentDrawSpeed += 0.05;
    } else if (currentDrawSpeed > gameSpeed) {
        currentDrawSpeed = gameSpeed;
    }

    for (let i = gameObjects.length - 1; i >= 0; i--) {
        let obj = gameObjects[i];
        obj.x -= currentDrawSpeed;

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
            const margin = obj.isObstacle ? 0 : 25; 
            obj.elems.forEach(el => {
                const eR = {
                    top: el.offsetTop - margin,
                    bottom: el.offsetTop + el.offsetHeight + margin,
                    left: el.offsetLeft - margin,
                    right: el.offsetLeft + el.offsetWidth + margin
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

function jatekleirasgomb() {
    let popup = document.getElementById('gameInfoModal');
    if (!popup) {
        const popupHTML = `
        <div class="modal fade" id="gameInfoModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-xl modal-fixed-height">
                <div class="modal-content bg-card border-0 shadow-lg rounded-4 overflow-hidden position-relative">
                    <button type="button" class="btn-close custom-close-btn position-absolute top-0 end-0 z-3 m-3" onclick="bezarPopup()"></button>
                    <div class="row g-0 h-100 align-items-stretch">
                        <div class="col-lg-6 h-100 d-none d-lg-block">
                            <img id="p-kep" src="${tartalom[0].kep}" class="w-100 h-100" style="object-fit: cover; min-height: 400px;">
                        </div>
                        <div class="col-lg-6 modal-text-container d-flex flex-column">
                            <div class="p-4 p-md-5 d-flex flex-column h-100 justify-content-between">
                                <div>
                                    <h3 id="p-cim" class="text-danger fw-bold mb-4">${tartalom[0].cim}</h3>
                                    <p id="p-szoveg" class="text-secondary lead mb-0" style="line-height: 1.8;">${tartalom[0].szoveg}</p>
                                </div>
                                <div class="d-flex justify-content-between align-items-center pt-4 border-top mt-4">
                                    <button id="p-vissza" class="btn btn-outline-secondary px-4 rounded-pill" onclick="valtsOldalt(-1)">Vissza</button>
                                    <span id="p-szam" class="fw-bold text-danger font-monospace fs-5">1 / 4</span>
                                    <button id="p-tovabb" class="btn btn-danger px-4 rounded-pill shadow-sm" onclick="valtsOldalt(1)">Tovább</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', popupHTML);
        popup = document.getElementById('gameInfoModal');
    }
    
    aktualisOldal = 0;
    frissitJatekModal();
    const modalInstance = new bootstrap.Modal(popup);
    modalInstance.show();
}

function valtsOldalt(irany) {
    aktualisOldal += irany;
    if (aktualisOldal < 0) { aktualisOldal = 0; return; }
    if (aktualisOldal >= tartalom.length) { 
        bezarPopup(); 
        return; 
    }
    frissitJatekModal();
}

function frissitJatekModal() {
    const pCim = document.getElementById('p-cim');
    const pSzoveg = document.getElementById('p-szoveg');
    const pKep = document.getElementById('p-kep');
    const pSzam = document.getElementById('p-szam');
    const visszaGomb = document.getElementById('p-vissza');
    const tovabbGomb = document.getElementById('p-tovabb');

    if (pCim) pCim.innerText = tartalom[aktualisOldal].cim;
    if (pSzoveg) pSzoveg.innerText = tartalom[aktualisOldal].szoveg;
    if (pKep) pKep.src = tartalom[aktualisOldal].kep;
    if (pSzam) pSzam.innerText = `${aktualisOldal + 1} / 4`;
    
    if (visszaGomb) visszaGomb.style.visibility = aktualisOldal === 0 ? 'hidden' : 'visible';
    
    if (tovabbGomb) {
        if (aktualisOldal === tartalom.length - 1) {
            tovabbGomb.innerText = 'Indítás';
            tovabbGomb.classList.replace('btn-danger', 'btn-success');
        } else {
            tovabbGomb.innerText = 'Tovább';
            tovabbGomb.classList.replace('btn-success', 'btn-danger');
        }
    }
}

function bezarPopup() {
    const popup = document.getElementById('gameInfoModal');
    if (popup) {
        const modalInstance = bootstrap.Modal.getInstance(popup);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
}