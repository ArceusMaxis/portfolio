document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initScrollEffects();
    initCarousels();
    initScrollWindow();
    initPageLoader();
    initScrollToTop();
    initMediaPopup();
    initShowcaseGrid();
    initDemoPopup();
    initDemoGrid();
});

function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            themeToggle.classList.add('rotating');
            setTimeout(() => themeToggle.classList.remove('rotating'), 300);
        });
    }
    
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            const spans = navToggle.querySelectorAll('span');
            if (navToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
    }
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            if (navToggle) {
                navToggle.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
    });
    
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            item.classList.add('active');
        }
    });
    
    const nav = document.querySelector('.nav-container');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.style.boxShadow = '0 5px 30px var(--glow-color)';
            } else {
                nav.style.boxShadow = 'none';
            }
        });
    }
}

function initScrollEffects() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            
                const children = entry.target.querySelectorAll('.stagger-child');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('visible');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll(
        '.about-card, .showcase-item, .spotlight-item, .section-header'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    const style = document.createElement('style');
    style.textContent = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

function initCarousels() {
    const carousels = document.querySelectorAll('.media-carousel');
    
    carousels.forEach(carousel => {
        const slides = carousel.querySelector('.carousel-slides');
        const slideItems = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        
        if (!slides || slideItems.length === 0) return;
        
        let currentSlide = 0;
        const totalSlides = slideItems.length;
        
        if (dotsContainer) {
            slideItems.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                if (index === 0) dot.classList.add('active');
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.addEventListener('click', () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
        }
        
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];
        
        function updateSlide() {
            slides.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
            
            slideItems.forEach((slide, index) => {
                const video = slide.querySelector('video');
                if (video) {
                    if (index === currentSlide) {
                        video.play();
                    } else {
                        video.pause();
                    }
                }
            });
        }
        
        function goToSlide(index) {
            currentSlide = index;
            if (currentSlide >= totalSlides) currentSlide = 0;
            if (currentSlide < 0) currentSlide = totalSlides - 1;
            updateSlide();
        }
        
        function nextSlide() {
            goToSlide(currentSlide + 1);
        }
        
        function prevSlide() {
            goToSlide(currentSlide - 1);
        }
        
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        
        carousel.setAttribute('tabindex', '0');
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        });
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }, { passive: true });
        
        setInterval(nextSlide, 5000);
    });
}


function initScrollWindow() {
    const scrollTrack = document.querySelector('.scroll-track');
    
    if (!scrollTrack) return;
    
    const items = scrollTrack.innerHTML;
    scrollTrack.innerHTML = items + items;
    
    scrollTrack.addEventListener('mouseenter', () => {
        scrollTrack.style.animationPlayState = 'paused';
    });
    
    scrollTrack.addEventListener('mouseleave', () => {
        scrollTrack.style.animationPlayState = 'running';
    });
    
    const updateAnimationDuration = () => {
        const trackWidth = scrollTrack.scrollWidth / 2;
        const duration = trackWidth / 50;
        scrollTrack.style.animationDuration = `${duration}s`;
    };
    
    window.addEventListener('load', updateAnimationDuration);
    window.addEventListener('resize', updateAnimationDuration);
}

function initPageLoader() {
    const loader = document.querySelector('.page-loader');
    
    if (!loader) return;
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500);
    });
    
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 3000);
}

function initScrollToTop() {
    const scrollTopBtn = document.querySelector('.scroll-top');
    
    if (!scrollTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function smoothScrollTo(element) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function initGlitchEffect() {
    const glitchElements = document.querySelectorAll('.glitch');
    
    glitchElements.forEach(el => {
        el.setAttribute('data-text', el.textContent);
    });
}

document.addEventListener('DOMContentLoaded', initGlitchEffect);

function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);
    
    const cursorTrail = document.createElement('div');
    cursorTrail.classList.add('cursor-trail');
    document.body.appendChild(cursorTrail);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            cursorTrail.style.left = e.clientX + 'px';
            cursorTrail.style.top = e.clientY + 'px';
        }, 100);
    });
    
    const style = document.createElement('style');
    style.textContent = `
        .custom-cursor {
            position: fixed;
            width: 30px;
            height: 30px;
            border: 1px solid var(--primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 99999;
            transform: translate(-50%, -50%);
            transition: transform 0.1s ease;
            mix-blend-mode: difference;
        }
        
        .cursor-trail {
            position: fixed;
            width: 15px;
            height: 15px;
            background: var(--primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 99998;
            transform: translate(-50%, -50%);
            opacity: 0.5;
        }
        
        a:hover ~ .custom-cursor,
        button:hover ~ .custom-cursor {
            transform: translate(-50%, -50%) scale(1.5);
        }
    `;
    document.head.appendChild(style);
    document.body.style.cursor = 'none';
}

document.addEventListener('DOMContentLoaded', initCustomCursor);

function initBackgroundMusic() {
    const audio = document.createElement('audio');
    audio.id = 'bg-music';
    audio.loop = true;
    audio.volume = 0.3;
    audio.src = 'media/music/thesmalluniverseinyourheart-yukakemonster.mp3'; 
    document.body.appendChild(audio);

    const savedTime = localStorage.getItem('musicTime');
    const isPlaying = localStorage.getItem('musicPlaying') === 'true';

    if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
    }

    setInterval(() => {
        if (!audio.paused) {
            localStorage.setItem('musicTime', audio.currentTime);
        }
    }, 500);

    window.addEventListener('beforeunload', () => {
        localStorage.setItem('musicTime', audio.currentTime);
        localStorage.setItem('musicPlaying', !audio.paused);
    });

    const musicToggle = document.createElement('button');
    musicToggle.className = 'music-toggle';
    musicToggle.setAttribute('aria-label', 'Toggle music');
    musicToggle.innerHTML = '<span class="music-on">♫</span><span class="music-off">♪</span>';
    document.body.appendChild(musicToggle);

    function updateButtonState() {
        if (audio.paused) {
            musicToggle.classList.add('paused');
        } else {
            musicToggle.classList.remove('paused');
        }
    }

    musicToggle.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            localStorage.setItem('musicPlaying', 'true');
        } else {
            audio.pause();
            localStorage.setItem('musicPlaying', 'false');
        }
        updateButtonState();
    });

    if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                document.addEventListener('click', function resumeAudio() {
                    if (localStorage.getItem('musicPlaying') === 'true') {
                        audio.play();
                        updateButtonState();
                    }
                    document.removeEventListener('click', resumeAudio);
                }, { once: true });
            });
        }
    }

    updateButtonState();
}

document.addEventListener('DOMContentLoaded', initBackgroundMusic);

function initMediaPopup() {
    const mediaPopup = document.getElementById('media-popup');
    if (!mediaPopup) return;

    let allMediaItems = [];

    const collectMediaItems = () => {
        allMediaItems = [];
        const showcaseItems = document.querySelectorAll('.showcase-item');
        
        showcaseItems.forEach((item) => {
            const projectTitle = item.querySelector('.showcase-title')?.textContent || 'Project';
            const slides = item.querySelectorAll('.carousel-slide');
            
            slides.forEach((slide) => {
                const img = slide.querySelector('img');
                const video = slide.querySelector('video');
                
                if (img) {
                    allMediaItems.push({
                        type: 'image',
                        src: img.src,
                        alt: img.alt,
                        projectTitle: projectTitle,
                        element: img
                    });
                } else if (video) {
                    const source = video.querySelector('source');
                    if (source) {
                        allMediaItems.push({
                            type: 'video',
                            src: source.src,
                            alt: 'Video',
                            projectTitle: projectTitle,
                            element: video
                        });
                    }
                }
            });
        });
    };

    collectMediaItems();

    let currentMediaIndex = 0;
    let isOpen = false;

    const attachMediaClickHandlers = () => {
        allMediaItems.forEach((media, index) => {
            if (media.element) {
                media.element.style.cursor = 'pointer';
                media.element.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openPopup(index);
                });
            }
        });
    };

    const openPopup = (index) => {
        if (allMediaItems.length === 0) return;
        
        currentMediaIndex = index;
        isOpen = true;
        displayMedia(currentMediaIndex);
        mediaPopup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    const closePopup = () => {
        isOpen = false;
        mediaPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
        delete mediaPopup.dataset.currentProject;
        delete mediaPopup.dataset.currentMediaIndex;
        if (mediaPopup.autoRotationTimer) {
            clearInterval(mediaPopup.autoRotationTimer);
            mediaPopup.autoRotationTimer = null;
        }
    };

    const displayMedia = (index) => {
        if (allMediaItems.length === 0) return;
        
        if (index >= allMediaItems.length) {
            currentMediaIndex = 0;
        } else if (index < 0) {
            currentMediaIndex = allMediaItems.length - 1;
        } else {
            currentMediaIndex = index;
        }

        const media = allMediaItems[currentMediaIndex];
        const imgEl = mediaPopup.querySelector('#media-popup-img');
        const videoEl = mediaPopup.querySelector('#media-popup-video');
        const titleEl = mediaPopup.querySelector('.media-popup-title');

        imgEl.style.display = 'none';
        videoEl.style.display = 'none';

        if (media.type === 'image') {
            imgEl.src = media.src;
            imgEl.alt = media.alt;
            imgEl.style.display = 'block';
        } else if (media.type === 'video') {

            videoEl.innerHTML = '';
            const source = document.createElement('source');
            source.src = media.src;
            source.type = 'video/mp4';
            videoEl.appendChild(source);
            videoEl.style.display = 'block';
            videoEl.play().catch(() => {
            });
        }

        titleEl.textContent = media.alt;
    };
    const nextMedia = () => {
        const mediaPopup = document.getElementById('media-popup');
        if (mediaPopup.dataset.currentProject !== undefined && typeof showcaseProjects !== 'undefined') {
            const projectIndex = parseInt(mediaPopup.dataset.currentProject);
            const currentIndex = parseInt(mediaPopup.dataset.currentMediaIndex || 0);
            displayProjectMedia(showcaseProjects[projectIndex], currentIndex + 1);
        } else {
            displayMedia(currentMediaIndex + 1);
        }
    };

    const prevMedia = () => {
        const mediaPopup = document.getElementById('media-popup');
        if (mediaPopup.dataset.currentProject !== undefined && typeof showcaseProjects !== 'undefined') {
            const projectIndex = parseInt(mediaPopup.dataset.currentProject);
            const currentIndex = parseInt(mediaPopup.dataset.currentMediaIndex || 0);
            displayProjectMedia(showcaseProjects[projectIndex], currentIndex - 1);
        } else {
            displayMedia(currentMediaIndex - 1);
        }
    };

    const closeBtn = mediaPopup.querySelector('.media-popup-close');
    const nextBtn = mediaPopup.querySelector('.media-popup-next');
    const prevBtn = mediaPopup.querySelector('.media-popup-prev');
    const overlay = mediaPopup.querySelector('.media-popup-overlay');

    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (nextBtn) nextBtn.addEventListener('click', nextMedia);
    if (prevBtn) prevBtn.addEventListener('click', prevMedia);
    if (overlay) overlay.addEventListener('click', closePopup);

    document.addEventListener('keydown', (e) => {
        if (!isOpen) return;
        
        if (e.key === 'Escape') closePopup();
        if (e.key === 'ArrowRight') nextMedia();
        if (e.key === 'ArrowLeft') prevMedia();
    });

    attachMediaClickHandlers();
}

function initShowcaseGrid() {
    const gridContainer = document.getElementById('showcase-grid');
    if (!gridContainer || typeof showcaseProjects === 'undefined') return;

    showcaseProjects.forEach((project, projectIndex) => {
        const card = document.createElement('div');
        card.className = 'showcase-card';
        
        const isThumbnailVideo = project.thumbnail && (project.thumbnail.endsWith('.mp4') || project.thumbnail.endsWith('.mkv'));
        
        let objectPosition = 'center';
        if (project.thumbnailOffset && typeof project.thumbnailOffset === 'number') {
            const percentage = 50 + (project.thumbnailOffset * 50);
            objectPosition = `${percentage}% center`;
        }
        
        const thumbnailHTML = isThumbnailVideo 
            ? `<video class="showcase-card-thumbnail" preload="metadata" style="object-position: ${objectPosition};"><source src="${project.thumbnail}" type="video/mp4"></video>`
            : `<img src="${project.thumbnail}" alt="${project.title}" class="showcase-card-thumbnail" style="object-position: ${objectPosition};" />`;
        
        card.innerHTML = `
            ${thumbnailHTML}
            <div class="showcase-card-overlay">
                <div class="showcase-card-header">
                    <h3 class="showcase-card-title">${project.title}</h3>
                    <div class="showcase-card-meta">
                        <span class="showcase-card-year">${project.year}</span>
                        <div class="showcase-card-status">
                            ${project.status === 'released' ? '<span class="showcase-card-status-icon">▶</span>' : '<span class="showcase-card-status-icon">⚙</span>'}
                            <span>${project.status === 'released' ? 'PLAYABLE' : 'DEMO VIDEO'}</span>
                        </div>
                    </div>
                </div>
                <div class="showcase-card-footer">
                    <button class="showcase-card-btn album-btn" title="View album">OPEN ALBUM</button>
                    ${project.status === 'released' ? `<button class="showcase-card-btn play-btn" title="Play on itch.io">PLAY</button>` : ''}
                </div>
            </div>
        `;

        const thumbnail = card.querySelector('.showcase-card-thumbnail');
        
        const albumBtn = card.querySelector('.album-btn');
        if (albumBtn) {
            albumBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openProjectMediaPopup(project, projectIndex);
            });
        }

        const playBtn = card.querySelector('.play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(project.itchUrl, '_blank');
            });
        }

        const imageCount = project.media.filter(m => m.type === 'image').length;
        if (imageCount > 1) {
            let currentImageIndex = 0;
            const imageIndices = project.media
                .map((m, i) => m.type === 'image' ? i : -1)
                .filter(i => i !== -1);

            card.thumbnailRotationTimer = setInterval(() => {
                currentImageIndex = (currentImageIndex + 1) % imageIndices.length;
                const mediaIndex = imageIndices[currentImageIndex];
                if (thumbnail.tagName === 'IMG') {
                    thumbnail.src = project.media[mediaIndex].src;
                }
            }, 1300);

            card.addEventListener('mouseleave', () => {
                if (card.thumbnailRotationTimer) {
                    currentImageIndex = 0;
                    if (thumbnail.tagName === 'IMG') {
                        thumbnail.src = project.thumbnail;
                    }
                }
            });
        }

        gridContainer.appendChild(card);
    });

    const cards = gridContainer.querySelectorAll('.showcase-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // Use intersection observer for animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    cards.forEach(card => observer.observe(card));
}

function openProjectMediaPopup(project, projectIndex) {
    const mediaPopup = document.getElementById('media-popup');
    if (!mediaPopup || !project.media || project.media.length === 0) return;

    if (mediaPopup.autoRotationTimer) {
        clearInterval(mediaPopup.autoRotationTimer);
    }

    updateMediaPopupWithProject(project);

    displayProjectMedia(project, 0);

    mediaPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    mediaPopup.dataset.currentProject = projectIndex;
    mediaPopup.dataset.currentMediaIndex = 0;
}

function updateMediaPopupWithProject(project) {
    const titleEl = document.querySelector('.media-popup-title');
    const yearEl = document.querySelector('.media-popup-year');
    const contributionEl = document.querySelector('.media-popup-contribution');
    const descEl = document.querySelector('.media-popup-description');
    const playBtn = document.getElementById('media-popup-play-btn');

    if (titleEl) titleEl.textContent = project.title;
    if (yearEl) yearEl.textContent = project.year ? `Year: ${project.year}` : '';
    if (contributionEl) {
        const prefix = project.solo ? 'Solo - ' : 'Team - ';
        contributionEl.textContent = project.contributions ? `Contributions: ${prefix}${project.contributions.join(', ')}` : '';
    }
    if (descEl) descEl.textContent = project.description;

    if (playBtn) {
        if (project.status === 'released') {
            playBtn.textContent = 'PLAY ▶';
            playBtn.style.cursor = 'pointer';
            playBtn.onclick = () => window.open(project.itchUrl, '_blank');
        } else {
            playBtn.textContent = 'WIP';
            playBtn.style.cursor = 'default';
            playBtn.onclick = null;
        }
    }
}

function displayProjectMedia(project, index) {
    if (!project.media || project.media.length === 0) return;

    if (index >= project.media.length) {
        index = 0;
    } else if (index < 0) {
        index = project.media.length - 1;
    }

    const media = project.media[index];
    const imgEl = document.querySelector('#media-popup-img');
    const videoEl = document.querySelector('#media-popup-video');
    const infoEl = document.querySelector('.media-popup-info');

    imgEl.style.display = 'none';
    videoEl.style.display = 'none';

    if (media.type === 'image') {
        imgEl.src = media.src;
        imgEl.alt = media.alt;
        imgEl.style.display = 'block';
        if (infoEl) infoEl.style.display = 'flex';
    } else if (media.type === 'video') {
        videoEl.pause();
        videoEl.currentTime = 0;
        videoEl.innerHTML = '';
        
        const source = document.createElement('source');
        source.src = media.src;
        source.type = 'video/mp4';
        videoEl.appendChild(source);
        
        videoEl.load();
        videoEl.style.display = 'block';
        videoEl.play().catch(() => {});
        if (infoEl) infoEl.style.display = 'flex';
    }

    const mediaPopup = document.getElementById('media-popup');
    if (mediaPopup) {
        mediaPopup.dataset.currentMediaIndex = index;
    }
}

function initDemoPopup() {
    const demoPopup = document.getElementById('demo-popup');
    if (!demoPopup) return;

    const overlay = demoPopup.querySelector('.demo-popup-overlay');
    const closeBtn = demoPopup.querySelector('.demo-popup-close');
    const prevBtn = demoPopup.querySelector('.demo-popup-prev');
    const nextBtn = demoPopup.querySelector('.demo-popup-next');

    // Close popup function
    const closePopup = () => {
        demoPopup.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Clear auto-rotation timer if exists
        if (demoPopup.autoRotationTimer) {
            clearInterval(demoPopup.autoRotationTimer);
        }
    };

    // Close on overlay click
    if (overlay) {
        overlay.addEventListener('click', closePopup);
    }

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closePopup);
    }

    // Keyboard close (Escape)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && demoPopup.style.display !== 'none') {
            closePopup();
        }
    });

    // Navigation
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (typeof demoDemos === 'undefined') return;
            
            let currentDemoIndex = parseInt(demoPopup.dataset.currentDemoIndex || 0);
            let currentMediaIndex = parseInt(demoPopup.dataset.currentMediaIndex || 0);
            
            // First try to go to previous media within current demo
            if (currentMediaIndex > 0) {
                currentMediaIndex--;
            } else if (currentDemoIndex > 0) {
                // If no previous media, go to previous demo's last media
                currentDemoIndex--;
                currentMediaIndex = demoDemos[currentDemoIndex].media.length - 1;
            } else {
                // Wrap around to last demo's last media
                currentDemoIndex = demoDemos.length - 1;
                currentMediaIndex = demoDemos[currentDemoIndex].media.length - 1;
            }
            
            displayDemoMedia(currentDemoIndex, currentMediaIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (typeof demoDemos === 'undefined') return;
            
            let currentDemoIndex = parseInt(demoPopup.dataset.currentDemoIndex || 0);
            let currentMediaIndex = parseInt(demoPopup.dataset.currentMediaIndex || 0);
            const currentDemo = demoDemos[currentDemoIndex];
            
            // First try to go to next media within current demo
            if (currentMediaIndex < currentDemo.media.length - 1) {
                currentMediaIndex++;
            } else if (currentDemoIndex < demoDemos.length - 1) {
                // If no next media, go to next demo's first media
                currentDemoIndex++;
                currentMediaIndex = 0;
            } else {
                // Wrap around to first demo's first media
                currentDemoIndex = 0;
                currentMediaIndex = 0;
            }
            
            displayDemoMedia(currentDemoIndex, currentMediaIndex);
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (demoPopup.style.display === 'none') return;
        if (typeof demoDemos === 'undefined') return;
        
        let currentDemoIndex = parseInt(demoPopup.dataset.currentDemoIndex || 0);
        let currentMediaIndex = parseInt(demoPopup.dataset.currentMediaIndex || 0);
        const currentDemo = demoDemos[currentDemoIndex];
        
        if (e.key === 'ArrowLeft') {
            if (currentMediaIndex > 0) {
                currentMediaIndex--;
            } else if (currentDemoIndex > 0) {
                currentDemoIndex--;
                currentMediaIndex = demoDemos[currentDemoIndex].media.length - 1;
            } else {
                currentDemoIndex = demoDemos.length - 1;
                currentMediaIndex = demoDemos[currentDemoIndex].media.length - 1;
            }
            displayDemoMedia(currentDemoIndex, currentMediaIndex);
        } else if (e.key === 'ArrowRight') {
            if (currentMediaIndex < currentDemo.media.length - 1) {
                currentMediaIndex++;
            } else if (currentDemoIndex < demoDemos.length - 1) {
                currentDemoIndex++;
                currentMediaIndex = 0;
            } else {
                currentDemoIndex = 0;
                currentMediaIndex = 0;
            }
            displayDemoMedia(currentDemoIndex, currentMediaIndex);
        }
    });
}

function openDemoPopup(demo, demoIndex) {
    const demoPopup = document.getElementById('demo-popup');
    if (!demoPopup || !demo || !demo.media || demo.media.length === 0) return;

    // Store all demos and current demo index for navigation across all demos
    if (typeof demoDemos !== 'undefined') {
        demoPopup.allDemos = demoDemos;
        demoPopup.currentDemoIndex = demoIndex !== undefined ? demoIndex : 0;
    }

    // Display first element of this demo
    displayDemoMedia(demoIndex !== undefined ? demoIndex : 0, 0);

    // Show popup
    demoPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function displayDemoMedia(demoIndex, mediaIndex) {
    const demoPopup = document.getElementById('demo-popup');
    if (!demoPopup || typeof demoDemos === 'undefined') return;

    // Wrap around demos
    if (demoIndex >= demoDemos.length) {
        demoIndex = 0;
    } else if (demoIndex < 0) {
        demoIndex = demoDemos.length - 1;
    }

    const demo = demoDemos[demoIndex];
    if (!demo || !demo.media || demo.media.length === 0) return;

    // Wrap around media within the demo
    if (mediaIndex >= demo.media.length) {
        mediaIndex = 0;
    } else if (mediaIndex < 0) {
        mediaIndex = demo.media.length - 1;
    }

    const media = demo.media[mediaIndex];
    const imgEl = document.querySelector('#demo-popup-img');
    const videoEl = document.querySelector('#demo-popup-video');
    const titleEl = document.querySelector('.demo-popup-title');
    const yearEl = document.querySelector('.demo-popup-year');
    const contributionEl = document.querySelector('.demo-popup-contribution');
    const descEl = document.querySelector('.demo-popup-description');

    // Update title, year, contribution and description
    if (titleEl) titleEl.textContent = demo.title || '';
    if (yearEl) yearEl.textContent = demo.year ? `Year: ${demo.year}` : '';
    if (contributionEl) contributionEl.textContent = demo.contribution || '';
    if (descEl) descEl.textContent = demo.description || '';

    // Hide both elements first
    imgEl.style.display = 'none';
    videoEl.style.display = 'none';

    if (media.type === 'image') {
        imgEl.src = media.src;
        imgEl.alt = media.alt || 'Demo image';
        imgEl.style.display = 'block';
    } else if (media.type === 'video') {
        // Completely reset video element
        videoEl.pause();
        videoEl.currentTime = 0;
        videoEl.innerHTML = '';
        
        const source = document.createElement('source');
        source.src = media.src;
        source.type = 'video/mp4';
        videoEl.appendChild(source);
        
        // Load and play the new video
        videoEl.load();
        videoEl.style.display = 'block';
        videoEl.play().catch(() => {});
    }

    // Update popup data
    demoPopup.dataset.currentDemoIndex = demoIndex;
    demoPopup.dataset.currentMediaIndex = mediaIndex;
}

function initDemoGrid() {
    const gridContainer = document.getElementById('demo-grid');
    if (!gridContainer || typeof demoDemos === 'undefined') return;

    demoDemos.forEach((demo, demoIndex) => {
        const card = document.createElement('div');
        card.className = 'demo-card';
        
        const firstMedia = demo.media && demo.media.length > 0 ? demo.media[0] : null;
        const thumbnailSrc = firstMedia ? firstMedia.src : '';
        const isImage = firstMedia && firstMedia.type === 'image';
        
        let objectPosition = 'center';
        if (demo.thumbnailOffset && typeof demo.thumbnailOffset === 'number') {
            const percentage = 50 + (demo.thumbnailOffset * 50);
            objectPosition = `${percentage}% center`;
        }

        const thumbnailHTML = isImage
            ? `<img src="${thumbnailSrc}" alt="${demo.title || 'Demo'}" class="demo-card-thumbnail" style="object-position: ${objectPosition};" />`
            : `<video class="demo-card-thumbnail" preload="metadata" style="object-position: ${objectPosition};"><source src="${thumbnailSrc}" type="video/mp4"></video>`;
        
        card.innerHTML = thumbnailHTML;

        card.addEventListener('click', () => {
            openDemoPopup(demo, demoIndex);
        });

        gridContainer.appendChild(card);
    });

    // Attach scroll effects to new cards
    const cards = gridContainer.querySelectorAll('.demo-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // Use intersection observer for animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    cards.forEach(card => observer.observe(card));
}