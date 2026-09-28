(function() {
    'use strict';
    
    // Register GSAP plugins
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    } else {
        console.warn('GSAP or ScrollTrigger is not loaded.');
    }

    let lenis;
    
    // 1. Preloader Animation
    function initPreloader() {
        const counter = document.querySelector('.preloader-counter');
        const preloader = document.querySelector('.preloader');
        const textSpans = document.querySelectorAll('.preloader-text span');
        
        if (!preloader || !counter) {
            document.body.classList.remove('loading');
            initHeroAnimation();
            return;
        }

        let progress = { value: 0 };
        
        const tl = gsap.timeline({
            onComplete: () => {
                document.body.classList.remove('loading');
                initHeroAnimation();
            }
        });
        
        tl.to(progress, {
            value: 100,
            duration: 2.5,
            ease: "power2.inOut",
            onUpdate: () => {
                counter.textContent = `${Math.round(progress.value)}%`;
            }
        })
        .to(textSpans, {
            yPercent: -100,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.inOut"
        }, "-=0.2")
        .to(preloader, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                preloader.style.display = 'none';
            }
        }, "-=0.4");
    }

    // 2. Lenis Smooth Scroll
    function initSmoothScroll() {
        if (typeof Lenis === 'undefined') {
            console.warn('Lenis is not loaded.');
            return;
        }

        lenis = new Lenis({
            lerp: 0.09,
            smoothWheel: true,
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5,
            infinite: false
        });

        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
        }

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        if (typeof gsap !== 'undefined') {
            gsap.ticker.lagSmoothing(0);
        }
    }

    // 3. Custom Cursor
    function initCursor() {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');
        
        // Touch device check
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            if (cursor) cursor.style.display = 'none';
            if (follower) follower.style.display = 'none';
            return;
        }
        
        if (!cursor || !follower || typeof gsap === 'undefined') return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let followerX = mouseX;
        let followerY = mouseY;

        // Initialize cursor position
        gsap.set(cursor, { x: mouseX, y: mouseY });
        gsap.set(follower, { x: followerX, y: followerY });

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            gsap.set(cursor, {
                x: mouseX,
                y: mouseY
            });
        });

        // Loop for follower for smooth trailing effect
        gsap.ticker.add(() => {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            
            gsap.set(follower, {
                x: followerX,
                y: followerY
            });
        });

        // Hover states
        const hoverTargets = document.querySelectorAll('a, button, .project-item, .skill-tag');
        
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                follower.classList.add('hovering');
                gsap.to(follower, {
                    scale: 1.5,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            target.addEventListener('mouseleave', () => {
                follower.classList.remove('hovering');
                gsap.to(follower, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
        
        // Click state
        window.addEventListener('mousedown', () => {
            gsap.to(follower, { scale: 0.8, duration: 0.1 });
        });
        
        window.addEventListener('mouseup', () => {
            if (follower.classList.contains('hovering')) {
                gsap.to(follower, { scale: 1.5, duration: 0.1 });
            } else {
                gsap.to(follower, { scale: 1, duration: 0.1 });
            }
        });
    }

    // 4. Navigation
    function initNavigation() {
        const nav = document.querySelector('.nav');
        const menuBtn = document.querySelector('.nav-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileLinks = document.querySelectorAll('.mobile-menu-links a');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        if (!nav) return;

        // Scrolled nav
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
        });

        // Mobile Menu Toggle
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                menuBtn.classList.toggle('active');
                mobileMenu.classList.toggle('active');
                document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
            });
        }

        // Close mobile menu on link click and smooth scroll
        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                menuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#') && lenis) {
                    lenis.scrollTo(targetId, { duration: 1.2 });
                }
            });
        });

        // Desktop nav links smooth scroll
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault();
                    if (lenis) {
                        lenis.scrollTo(targetId, { duration: 1.2 });
                    }
                }
            });
        });

        // Active Nav Link based on scroll
        if (typeof ScrollTrigger === 'undefined') return;
        
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: "top 50%",
                end: "bottom 50%",
                onToggle: self => {
                    if (self.isActive) {
                        const id = section.getAttribute('id');
                        document.querySelectorAll('.nav-links a, .mobile-menu-links a').forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href') === `#${id}`) {
                                link.classList.add('active');
                            }
                        });
                    }
                }
            });
        });
    }

    // 5. Hero Entrance Animation
    function initHeroAnimation() {
        if (typeof gsap === 'undefined') return;

        const subtitle = document.querySelector('.hero-subtitle');
        const titleLines = document.querySelectorAll('.hero-line span');
        const infoParagraphs = document.querySelectorAll('.hero-info p');
        const ctaLinks = document.querySelectorAll('.hero-cta a');
        const artShowcase = document.querySelector('.hero-art-showcase');
        const artStatus = document.querySelector('.hero-art-status');
        
        const tl = gsap.timeline();
        
        if (subtitle) {
            tl.fromTo(subtitle, 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
            );
        }
        
        if (titleLines.length) {
            tl.fromTo(titleLines,
                { y: "100%" },
                { y: "0%", stagger: 0.15, duration: 1, ease: "power4.out" },
                "-=0.4"
            );
        }
        
        if (infoParagraphs.length) {
            tl.fromTo(infoParagraphs,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" },
                "-=0.6"
            );
        }
        
        if (ctaLinks.length) {
            tl.fromTo(ctaLinks,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" },
                "-=0.5"
            );
        }

        if (artShowcase) {
            tl.fromTo(artShowcase,
                { opacity: 0, y: 40, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power3.out" },
                "-=0.7"
            );
        }
    }

    // 6. Scroll-Triggered Animations
    function initScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        const revealElements = document.querySelectorAll('.reveal-up');
        
        revealElements.forEach(el => {
            gsap.fromTo(el,
                { opacity: 0, y: 60 },
                {
                    opacity: 1, 
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        once: true
                    }
                }
            );
        });

        // Handle specific staggered groups
        const staggerGroups = [
            '.stat-item', 
            '.detail-row', 
            '.skill-category', 
            '.experience-card',
            '.project-item', 
            '.achievement-item',
            '.contact-link-item'
        ];

        staggerGroups.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                // Remove individual reveals to prevent duplicate animations if classes overlap
                elements.forEach(el => {
                    if (el.classList.contains('reveal-up')) {
                        el.classList.remove('reveal-up');
                    }
                });

                ScrollTrigger.batch(selector, {
                    onEnter: batch => {
                        gsap.fromTo(batch, 
                            { opacity: 0, y: 60 },
                            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", overwrite: true }
                        );
                    },
                    start: "top 85%",
                    once: true
                });
            }
        });
    }

    // 7. Parallax Effects
    function initParallax() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        
        // Disable heavy parallax on mobile for performance
        if (window.innerWidth < 768) return;

        // Hero Section Parallax
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            gsap.to(heroContent, {
                yPercent: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });
        }

        // Marquee Parallax
        const marqueeSection = document.querySelector('.marquee-section');
        const marqueeTrack = document.querySelector('.marquee-track');
        if (marqueeSection && marqueeTrack) {
            gsap.to(marqueeTrack, {
                xPercent: -15,
                ease: "none",
                scrollTrigger: {
                    trigger: marqueeSection,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });
        }

        // Section Headers Parallax
        const sectionHeaders = document.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            gsap.to(header, {
                y: 30,
                ease: "none",
                scrollTrigger: {
                    trigger: header.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });
    }

    // 8. Achievement Counters
    function initCounters() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        const counters = document.querySelectorAll('.achievement-number');
        if (counters.length === 0) return;

        counters.forEach(counter => {
            const targetAttr = counter.getAttribute('data-target');
            const targetNumber = parseInt(targetAttr || counter.textContent.replace(/[^0-9]/g, ''));
            
            if (isNaN(targetNumber)) return;

            // Start display from 0
            counter.textContent = "0";

            let obj = { val: 0 };

            ScrollTrigger.create({
                trigger: counter,
                start: "top 85%",
                once: true,
                onEnter: () => {
                    gsap.to(obj, {
                        val: targetNumber,
                        duration: 2.2,
                        ease: "power2.out",
                        onUpdate: () => {
                            let formatted = Math.floor(obj.val).toString();
                            if (targetNumber >= 1000) {
                                formatted = Math.floor(obj.val).toLocaleString('en-US');
                            }
                            counter.textContent = formatted;
                        }
                    });
                }
            });
        });
    }

    // 9. Magnetic Button Effect
    function initMagnetic() {
        if (typeof gsap === 'undefined') return;

        const magneticElements = document.querySelectorAll('.magnetic');
        
        if (window.innerWidth < 768) return; // Disable on mobile

        magneticElements.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(btn, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.5,
                    ease: "power3.out"
                });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.7,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }

    // 10. Project Hover
    function initProjectHover() {
        if (typeof gsap === 'undefined') return;

        const projects = document.querySelectorAll('.project-item');
        
        if (window.innerWidth < 768) return; // Simplified on mobile

        projects.forEach(project => {
            const title = project.querySelector('.project-title');
            
            project.addEventListener('mouseenter', () => {
                if (title) {
                    gsap.to(title, {
                        x: 16,
                        duration: 0.4,
                        ease: "power2.out"
                    });
                }
                
                gsap.to(project, {
                    backgroundColor: 'rgba(235, 229, 221, 0.7)',
                    duration: 0.4
                });
            });
            
            project.addEventListener('mouseleave', () => {
                if (title) {
                    gsap.to(title, {
                        x: 0,
                        duration: 0.4,
                        ease: "power2.out"
                    });
                }
                
                gsap.to(project, {
                    backgroundColor: 'transparent',
                    duration: 0.4
                });
            });
        });
    }

    // 13. Skill Tags Animation
    function initSkillTags() {
        if (typeof gsap === 'undefined') return;

        const skillTags = document.querySelectorAll('.skill-tag');
        
        skillTags.forEach(tag => {
            tag.addEventListener('mouseenter', () => {
                gsap.to(tag, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            tag.addEventListener('mouseleave', () => {
                gsap.to(tag, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }

    // Init function
    function init() {
        // Run preloader first (it calls initHeroAnimation on completion)
        initPreloader();
        
        // Initialize other components
        initSmoothScroll();
        initCursor();
        initNavigation();
        initScrollAnimations();
        initParallax();
        initCounters();
        initMagnetic();
        initProjectHover();
        initSkillTags();
        
        // Refresh ScrollTrigger after layout stabilizes
        if (typeof ScrollTrigger !== 'undefined') {
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 500);
        }
    }
    
    // Check if DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
