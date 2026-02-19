/* ===== BOOK OF LIFE - Main JS ===== */

(function() {
    'use strict';

    // ===== LOADING =====
    const loading = document.querySelector('.loading');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loading.classList.add('hidden');
            setTimeout(() => loading.remove(), 500);
        }, 800);
    });

    // ===== GOLDEN PARTICLES =====
    const particlesCanvas = document.getElementById('particles-canvas');
    const ctx = particlesCanvas.getContext('2d');
    let particles = [];
    let animFrame;

    function resizeCanvas() {
        particlesCanvas.width = window.innerWidth;
        particlesCanvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor(forceY) {
            this.reset(forceY);
        }

        reset(forceY) {
            this.x = Math.random() * particlesCanvas.width;
            this.y = forceY ? -10 : Math.random() * particlesCanvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedY = Math.random() * 0.3 + 0.1;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.fadeDir = Math.random() > 0.5 ? 1 : -1;
            this.fadeSpeed = Math.random() * 0.003 + 0.001;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.opacity += this.fadeDir * this.fadeSpeed;

            if (this.opacity > 0.5) this.fadeDir = -1;
            if (this.opacity < 0.05) this.fadeDir = 1;

            if (this.y > particlesCanvas.height + 10) {
                this.reset(true);
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201, 169, 110, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create particles
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 25 : 50;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(false));
    }

    function animateParticles() {
        ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animFrame = requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // ===== CURSOR TRAIL (desktop only) =====
    if (!isMobile) {
        const trailDots = [];
        const trailCount = 12;

        for (let i = 0; i < trailCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'cursor-dot';
            dot.style.width = (6 - i * 0.4) + 'px';
            dot.style.height = (6 - i * 0.4) + 'px';
            document.body.appendChild(dot);
            trailDots.push({ el: dot, x: 0, y: 0 });
        }

        let mouseX = 0, mouseY = 0;
        let cursorVisible = false;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!cursorVisible) {
                cursorVisible = true;
                trailDots.forEach(d => d.el.style.opacity = '1');
            }
        });

        document.addEventListener('mouseleave', () => {
            cursorVisible = false;
            trailDots.forEach(d => d.el.style.opacity = '0');
        });

        function animateTrail() {
            let prevX = mouseX, prevY = mouseY;
            trailDots.forEach((dot, i) => {
                const speed = 0.3 - i * 0.015;
                dot.x += (prevX - dot.x) * speed;
                dot.y += (prevY - dot.y) * speed;
                dot.el.style.transform = `translate(${dot.x - 3}px, ${dot.y - 3}px)`;
                dot.el.style.opacity = cursorVisible ? (1 - i / trailCount) * 0.6 : 0;
                prevX = dot.x;
                prevY = dot.y;
            });
            requestAnimationFrame(animateTrail);
        }

        animateTrail();
    }

    // ===== SCROLL ANIMATIONS (Intersection Observer) =====
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.dedication-text, .dedication-ornament, .chapter-content, .congrats-chapter, .congrats-title, .finale-subtitle, .cake-container, .life-timer, .gallery-subtitle, .gallery-title, .gallery-grid').forEach(el => {
        observer.observe(el);
    });

    // ===== CONGRATULATION TEXT - LINE BY LINE =====
    const congratsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const lines = entry.target.querySelectorAll('.congrats-line');
                lines.forEach((line, i) => {
                    setTimeout(() => {
                        line.classList.add('visible');
                    }, i * 400);
                });
                congratsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const congratsText = document.querySelector('.congrats-text');
    if (congratsText) {
        congratsObserver.observe(congratsText);
    }

    // ===== CAKE & CANDLES =====
    const cakeContainer = document.querySelector('.cake-container');
    const flames = document.querySelectorAll('.flame');
    const flameGlows = document.querySelectorAll('.flame-glow');
    const blowHint = document.querySelector('.blow-hint');
    let candlesBlown = false;

    if (cakeContainer) {
        cakeContainer.addEventListener('click', blowCandles);
    }

    function blowCandles() {
        if (candlesBlown) return;
        candlesBlown = true;

        // Blow out candles one by one with slight delay
        flames.forEach((flame, i) => {
            setTimeout(() => {
                flame.classList.add('blown');
            }, i * 150);
        });

        flameGlows.forEach((glow, i) => {
            setTimeout(() => {
                glow.classList.add('blown');
            }, i * 150);
        });

        if (blowHint) {
            blowHint.classList.add('hidden');
        }

        // Confetti after all candles blown
        setTimeout(() => {
            launchConfetti();
        }, flames.length * 150 + 300);
    }

    // ===== CONFETTI =====
    function launchConfetti() {
        const colors = [
            '#C9A96E', '#D4BA8A', '#A8884E',
            '#FDF8F0', '#E8DDD3', '#F5E6D0',
            '#FFD700', '#FFEFD5'
        ];

        const confettiCount = isMobile ? 80 : 150;

        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                createConfettiPiece(colors);
            }, Math.random() * 800);
        }
    }

    function createConfettiPiece(colors) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        const isCircle = Math.random() > 0.5;

        piece.style.cssText = `
            left: ${Math.random() * 100}vw;
            top: -10px;
            width: ${size}px;
            height: ${isCircle ? size : size * 0.6}px;
            background: ${color};
            border-radius: ${isCircle ? '50%' : '2px'};
            opacity: ${Math.random() * 0.5 + 0.5};
        `;

        document.body.appendChild(piece);

        const duration = Math.random() * 3000 + 2000;
        const rotateEnd = Math.random() * 720 - 360;
        const driftX = (Math.random() - 0.5) * 200;

        piece.animate([
            {
                transform: `translateY(0) translateX(0) rotate(0deg)`,
                opacity: 1
            },
            {
                transform: `translateY(${window.innerHeight + 50}px) translateX(${driftX}px) rotate(${rotateEnd}deg)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => piece.remove();
    }

    // ===== LIFE TIMER =====
    const birthDate = new Date(1977, 1, 20); // Feb 20, 1977

    function updateTimer() {
        const now = new Date();
        const diff = now - birthDate;

        const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
        const remaining = diff - years * 365.25 * 24 * 60 * 60 * 1000;
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

        const yearsEl = document.getElementById('timer-years');
        const daysEl = document.getElementById('timer-days');
        const hoursEl = document.getElementById('timer-hours');
        const minutesEl = document.getElementById('timer-minutes');

        if (yearsEl) yearsEl.textContent = years;
        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = hours;
        if (minutesEl) minutesEl.textContent = minutes;
    }

    updateTimer();
    setInterval(updateTimer, 60000); // Update every minute

    // ===== LIGHTBOX GALLERY =====
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
    const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
    const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;
    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentLightboxIndex = 0;

    function openLightbox(index) {
        currentLightboxIndex = index;
        const img = galleryItems[index].querySelector('img');
        lightboxImg.src = img.src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function prevLightbox() {
        currentLightboxIndex = (currentLightboxIndex - 1 + galleryItems.length) % galleryItems.length;
        const img = galleryItems[currentLightboxIndex].querySelector('img');
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = img.src;
            lightboxImg.style.opacity = '1';
        }, 150);
    }

    function nextLightbox() {
        currentLightboxIndex = (currentLightboxIndex + 1) % galleryItems.length;
        const img = galleryItems[currentLightboxIndex].querySelector('img');
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = img.src;
            lightboxImg.style.opacity = '1';
        }, 150);
    }

    galleryItems.forEach((item, i) => {
        item.addEventListener('click', () => openLightbox(i));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', nextLightbox);

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevLightbox();
        if (e.key === 'ArrowRight') nextLightbox();
    });

    // ===== PARALLAX ON PHOTOS (desktop only) =====
    if (!isMobile) {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const photos = document.querySelectorAll('.photo-frame');
                    photos.forEach(photo => {
                        const rect = photo.getBoundingClientRect();
                        const centerY = rect.top + rect.height / 2;
                        const viewportCenter = window.innerHeight / 2;
                        const offset = (centerY - viewportCenter) * 0.04;
                        photo.style.transform = `rotate(${photo.dataset.rotation || -2}deg) translateY(${offset}px)`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

})();
