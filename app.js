/**
 * Portfolio JavaScript — Clean Code Architecture
 * Modules: Animations, Navigation, Interactions, Modal, GSAP
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ========================================================================
  // 1. UTILITY HELPERS
  // ========================================================================
  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];
  const isMobile = () => window.innerWidth < 768;
  const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

  // ========================================================================
  // 2. SCROLL REVEAL (Intersection Observer)
  // ========================================================================
  function initScrollReveal() {
    const elements = $$('.reveal-up');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || 0, 10);
          setTimeout(() => el.classList.add('visible'), delay);
          observer.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.05 }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // ========================================================================
  // 3. SPLIT TEXT REVEAL (Character-by-character scroll reveal)
  // ========================================================================
  function initSplitTextReveal() {
    const elements = $$('.split-text-reveal');
    if (!elements.length) return;

    // Build character spans
    elements.forEach((el) => {
      const text = el.textContent;
      el.innerHTML = '';
      el.setAttribute('aria-label', text);

      text.split(' ').forEach((word, wi, words) => {
        const wordSpan = document.createElement('span');
        wordSpan.style.cssText = 'display:inline-block;white-space:nowrap';

        for (const char of word) {
          const charSpan = document.createElement('span');
          charSpan.textContent = char;
          charSpan.className = 'split-char';
          charSpan.style.cssText =
            'display:inline-block;color:rgba(255,255,255,0.15);transition:color 0.1s ease';
          wordSpan.appendChild(charSpan);
        }

        el.appendChild(wordSpan);
        if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
    });

    // Update on scroll
    function update() {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const wh = window.innerHeight;
        const start = wh * 0.85;
        const end = wh * 0.2;
        const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));

        const chars = el.querySelectorAll('.split-char');
        const total = chars.length;
        const revealed = Math.floor(progress * total);

        chars.forEach((char, i) => {
          if (i < revealed) {
            char.style.color = 'rgba(255,255,255,1)';
          } else if (i === revealed) {
            const cp = progress * total - revealed;
            char.style.color = `rgba(255,255,255,${0.15 + cp * 0.85})`;
          } else {
            char.style.color = 'rgba(255,255,255,0.15)';
          }
        });
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ========================================================================
  // 4. COUNT-UP ANIMATION
  // ========================================================================
  function initCountUp() {
    const elements = $$('.stat-value[data-count]');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          animateValue(el, 0, target, suffix, 2000);
          observer.unobserve(el);
        });
      },
      { threshold: 0.3 }
    );

    elements.forEach((el) => observer.observe(el));
  }

  function animateValue(el, start, end, suffix, duration) {
    const startTime = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * easeOutExpo(progress));
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = end + suffix;
    }

    requestAnimationFrame(tick);
  }

  // ========================================================================
  // 5. SIDEBAR NAVIGATION ACTIVE STATE
  // ========================================================================
  function initSidebarNav() {
    const sections = $$('section[id]');
    const dots = $$('.sidebar-nav .nav-dot');
    if (!sections.length || !dots.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          dots.forEach((dot) => {
            dot.classList.toggle('active', dot.dataset.section === id);
          });
        });
      },
      { rootMargin: '-35% 0px -35% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // ========================================================================
  // 6. SERVICES ACCORDION
  // ========================================================================
  function initAccordion() {
    const headers = $$('.service-header');
    headers.forEach((header) => {
      header.addEventListener('click', () => {
        const accordion = header.parentElement;
        const isOpen = accordion.classList.contains('open');

        // Close all
        $$('.service-accordion').forEach((acc) => {
          acc.classList.remove('open');
          acc.querySelector('.service-header').setAttribute('aria-expanded', 'false');
        });

        // Toggle clicked
        if (!isOpen) {
          accordion.classList.add('open');
          header.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ========================================================================
  // 7. SMOOTH SCROLL FOR ANCHOR LINKS
  // ========================================================================
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = $(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ========================================================================
  // 8. PARALLAX & HEADER SCROLL EFFECTS
  // ========================================================================
  function initScrollEffects() {
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        // Hero photo parallax
        const heroPhoto = $('.hero-photo-frame');
        if (heroPhoto) {
          heroPhoto.style.transform = `translateY(${scrollY * 0.08}px)`;
        }

        // Header background
        const header = $('.header');
        if (header) {
          header.classList.toggle('header-scrolled', scrollY > 80);
        }

        ticking = false;
      });
      ticking = true;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ========================================================================
  // 9. MAGNETIC HOVER EFFECT
  // ========================================================================
  function initMagneticHover() {
    $$('.btn-primary, .arrow-circle, .social-circle').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
        el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      });

      el.addEventListener('mouseenter', () => {
        el.style.transition = 'transform 0.15s ease-out';
      });
    });
  }

  // ========================================================================
  // 10. WORK CARD TILT EFFECT
  // ========================================================================
  function initCardTilt() {
    $$('.work-card-inner').forEach((inner) => {
      inner.addEventListener('mousemove', (e) => {
        const rect = inner.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        inner.style.transform = `perspective(1000px) rotateX(${(y - 0.5) * 6}deg) rotateY(${(x - 0.5) * -6}deg) translateY(-4px)`;
      });

      inner.addEventListener('mouseleave', () => {
        inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        inner.style.transition = 'transform 0.4s ease';
      });

      inner.addEventListener('mouseenter', () => {
        inner.style.transition = 'none';
      });
    });
  }

  // ========================================================================
  // 11. CUSTOM CURSOR
  // ========================================================================
  function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    });

    function animate() {
      cursorX += (mouseX - cursorX) * 0.12;
      cursorY += (mouseY - cursorY) * 0.12;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      requestAnimationFrame(animate);
    }
    animate();

    // Hover state for interactive elements
    $$('a, button, .work-card, .social-circle, .arrow-circle, .nav-dot').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
  }

  // ========================================================================
  // 12. PROJECT DETAIL MODAL
  // ========================================================================
  const projectData = [
    {
      title: 'Sistem Deteksi Cacat Green Bean Kopi Untuk Penentuan Mutu',
      category: 'Computer Vision',
      date: 'June 2026',
      description:
        'This is my finale project for undergraduate thesis, utilizing computer vision and deep learning to detect defects in green coffee beans and determine their quality. Using YOLOv11 instance segmentation method. Using API for the Backend best model and flutter for mobile implementation.',
      tags: ['Python', 'Computer Vision', 'Deep Learning', "Roboflow", "YOLOv11", "Instance Segmentation"],
      gradient: 'grad-1',
      media: [
        { type: 'video', src: 'assets/demo.mp4', alt: 'Demo Video' },
      ],
      link: 'https://github.com/nrlaini04/Deteksi-Green-Bean-Kopi' // <-- Masukkan link proyek Anda di sini
    },
    {
      title: 'Deteksi Organ Tumbuhan Sawit',
      category: 'Website Design',
      date: 'May 2026',
      description:
        'Complete website redesign for Helve, a modern tech startup. The project involved rethinking information architecture, creating a compelling visual narrative, and optimizing for conversion.',
      tags: ['UI Design', 'Web Design', 'Responsive', 'Wireframing', 'Brand Strategy'],
      gradient: 'grad-2',
      media: [
        { type: 'image', src: 'assets/p1.png', alt: 'Helve preview 1' },
        { type: 'image', src: 'assets/p1.png', alt: 'Helve preview 2' },
      ],
      link: '#' // Gunakan '#' jika belum ada link
    },
    {
      title: 'UI/UX Agency Design',
      category: 'Website Design',
      date: 'January 2026',
      description:
        'A full-spectrum design agency website showcasing portfolio work, services, and team culture. Built with a focus on storytelling through design and interactive elements.',
      tags: ['UX Strategy', 'Visual Design', 'Interaction Design', 'Next.js', 'Framer'],
      gradient: 'grad-3',
      media: [
        { type: 'image', src: 'assets/p1.png', alt: 'Agency preview 1' },
        { type: 'image', src: 'assets/p1.png', alt: 'Agency preview 2' },
      ],
      link: '#' // Gunakan '#' jika belum ada link
    },
  ];

  function initProjectModal() {
    const overlay = $('#projectModal');
    const closeBtn = $('#modalClose');
    const category = $('#modalCategory');
    const title = $('#modalTitle');
    const date = $('#modalDate');
    const description = $('#modalDescription');
    const tags = $('#modalTags');
    const previewPlaceholder = $('#modalPreviewPlaceholder');
    const previewContainer = $('#modalPreview');
    const prevBtn = $('#modalPrevBtn');
    const nextBtn = $('#modalNextBtn');
    const indicators = $('#modalSlideIndicators');
    let activeProject = null;
    let activeIndex = 0;

    if (!overlay) return;

    function renderPreview(project, index) {
      previewPlaceholder.className = `modal-preview-placeholder ${project.gradient}`;
      previewPlaceholder.innerHTML = '';
      const slide = project.media && project.media[index];

      if (slide) {
        if (slide.type === 'image') {
          const img = document.createElement('img');
          img.src = slide.src;
          img.alt = slide.alt || project.title;
          previewPlaceholder.appendChild(img);
        } else if (slide.type === 'video') {
          if (slide.src.includes('youtube.com') || slide.src.includes('youtu.be') || slide.src.includes('vimeo.com')) {
            const iframe = document.createElement('iframe');
            iframe.src = slide.src;
            iframe.title = slide.alt || project.title;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            previewPlaceholder.appendChild(iframe);
          } else {
            // Local video file with download protection
            const video = document.createElement('video');
            video.src = slide.src;
            video.controls = true;
            video.autoplay = false;
            // Disable right-click context menu
            video.addEventListener('contextmenu', (e) => e.preventDefault());
            // Disable download button and other controls
            video.setAttribute('controlsList', 'nodownload');
            video.setAttribute('disablePictureInPicture', 'true');
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.borderRadius = 'calc(var(--radius-lg) - 4px)';
            previewPlaceholder.appendChild(video);
          }
        }
      } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'modal-preview-icon';
        placeholder.textContent = '🖥️';
        previewPlaceholder.appendChild(placeholder);
      }

      // Update indicators
      indicators.innerHTML = '';
      if (project.media && project.media.length > 1) {
        project.media.forEach((_, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = idx === index ? 'active' : '';
          btn.addEventListener('click', () => {
            activeIndex = idx;
            renderPreview(project, activeIndex);
          });
          indicators.appendChild(btn);
        });
      }
    }

    function open(index) {
      const project = projectData[index];
      if (!project) return;
      activeProject = project;
      activeIndex = 0;

      category.textContent = project.category;
      title.textContent = project.title;
      date.textContent = project.date;
      description.textContent = project.description;

      tags.innerHTML = '';
      project.tags.forEach((tag) => {
        const span = document.createElement('span');
        span.textContent = tag;
        tags.appendChild(span);
      });

      const visitBtn = $('#modalVisitBtn');
      if (visitBtn) {
        if (project.link && project.link !== '#') {
          visitBtn.href = project.link;
          visitBtn.target = '_blank';
          visitBtn.style.display = 'inline-flex';
        } else {
          visitBtn.style.display = 'none';
        }
      }

      // Hide/show slide navigation buttons based on media length
      if (prevBtn && nextBtn) {
        if (project.media && project.media.length > 1) {
          prevBtn.style.display = 'flex';
          nextBtn.style.display = 'flex';
        } else {
          prevBtn.style.display = 'none';
          nextBtn.style.display = 'none';
        }
      }

      renderPreview(project, activeIndex);
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    prevBtn?.addEventListener('click', () => {
      if (!activeProject) return;
      activeIndex = (activeIndex - 1 + activeProject.media.length) % activeProject.media.length;
      renderPreview(activeProject, activeIndex);
    });

    nextBtn?.addEventListener('click', () => {
      if (!activeProject) return;
      activeIndex = (activeIndex + 1) % activeProject.media.length;
      renderPreview(activeProject, activeIndex);
    });

    // Open modal when clicking anywhere on a work card
    $$('.work-card').forEach((card, index) => {
      card.addEventListener('click', (e) => {
        // Prevent opening if user clicked a link inside that is not the arrow-circle
        if (e.target.closest('a') && !e.target.closest('.arrow-circle')) return;

        const info = card.querySelector('.work-info');
        if (info && info.dataset.project !== undefined) {
          open(parseInt(info.dataset.project, 10));
        } else {
          open(index);
        }
      });
      card.style.cursor = 'pointer';
    });

    // Close handlers
    closeBtn?.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  // ========================================================================
  // 13. GSAP SCROLLTRIGGER (Work Cards Stacking)
  // ========================================================================
  function initGsapCards() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const wrapper = $('.work-cards-wrapper');
    const cards = gsap.utils.toArray('.work-card');
    if (!wrapper || cards.length === 0) return;

    // Set initial positions
    cards.forEach((card, i) => {
      gsap.set(card, {
        xPercent: -50,
        yPercent: i === 0 ? -50 : 200,
      });
      const info = card.querySelector('.work-info');
      if (info) gsap.set(info, { opacity: i === 0 ? 1 : 0 });
    });

    // Higher scrollPerCard values make card scrolling slower and more controllable.
    // Higher scrub value creates smooth luxury inertia.
    const scrollPerCard = isMobile() ? 240 : 360;
    const totalScroll = (cards.length - 1) * scrollPerCard;
    const scrubValue = isMobile() ? 1.0 : 1.5;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: `+=${totalScroll}vh`,
        pin: wrapper,
        pinSpacing: true,
        scrub: scrubValue,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    cards.forEach((card, i) => {
      if (i >= cards.length - 1) return;

      const currentInner = card.querySelector('.work-card-inner');
      const currentInfo = card.querySelector('.work-info');
      const nextCard = cards[i + 1];
      const nextInfo = nextCard.querySelector('.work-info');
      const seg = i;

      if (currentInfo) {
        tl.to(currentInfo, { opacity: 0, duration: 0.4, ease: 'power2.out' }, seg);
      }

      tl.to(currentInner, { scale: 0.86, opacity: 0.25, duration: 1.0, ease: 'power2.inOut' }, seg);

      tl.to(nextCard, { yPercent: -50, duration: 1.0, ease: 'power2.inOut' }, seg);

      if (nextInfo) {
        tl.to(nextInfo, { opacity: 1, duration: 0.5, ease: 'power2.out' }, seg + 0.5);
      }
    });

  }

  // ========================================================================
  // 14. EXPERIENCE TABS SWITCHER
  // ========================================================================
  function initExperienceTabs() {
    const btns = $$('.exp-tab-btn');
    const timelines = $$('.experience-timeline');
    if (btns.length === 0 || timelines.length === 0) return;

    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        // Update active class on buttons
        btns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Toggle active class on timelines
        timelines.forEach((timeline) => {
          if (timeline.id === `timeline-${targetTab}`) {
            timeline.classList.add('active');
            if (typeof ScrollTrigger !== 'undefined') {
              ScrollTrigger.refresh();
            }
          } else {
            timeline.classList.remove('active');
          }
        });
      });
    });
  }

  // ========================================================================
  // 15. SKILLS CAROUSEL WITH SCROLL-SNAP & DESKTOP DRAG
  // ========================================================================
  function initSkillsCarousel() {
    const containers = $$('.tech-marquee-container');
    
    containers.forEach((container) => {
      const track = container.querySelector('.tech-marquee-track');
      if (!track) return;

      let autoPlayInterval;
      
      const scrollAmount = () => {
        const card = container.querySelector('.tech-card');
        if (!card) return container.clientWidth;
        const cardWidth = card.getBoundingClientRect().width;
        const gap = window.innerWidth < 640 ? 12 : 24; // Gaps in CSS
        // Scroll by 2 cards on mobile, 3 cards on desktop
        const cardsToScroll = window.innerWidth < 768 ? 2 : 3;
        return (cardWidth + gap) * cardsToScroll;
      };

      function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
          const maxScroll = container.scrollWidth - container.clientWidth;
          if (container.scrollLeft >= maxScroll - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            container.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
          }
        }, 4000);
      }

      function stopAutoPlay() {
        clearInterval(autoPlayInterval);
      }

      // Mouse drag-to-scroll logic (Desktop)
      let isDown = false;
      let startX;
      let scrollLeft;

      container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('dragging');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        stopAutoPlay();
      });

      container.addEventListener('mouseleave', () => {
        if (isDown) {
          isDown = false;
          container.classList.remove('dragging');
          startAutoPlay();
        }
      });

      container.addEventListener('mouseup', () => {
        if (isDown) {
          isDown = false;
          container.classList.remove('dragging');
          startAutoPlay();
        }
      });

      container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5; // Drag speed multiplier
        container.scrollLeft = scrollLeft - walk;
      });

      // Touch events to stop/resume autoplay on mobile (native swipe is used)
      container.addEventListener('touchstart', () => {
        stopAutoPlay();
      }, { passive: true });

      container.addEventListener('touchend', () => {
        startAutoPlay();
      }, { passive: true });

      // Start initial autoplay
      startAutoPlay();
    });
  }

  // ========================================================================
  // INITIALIZE ALL MODULES
  // ========================================================================
  initScrollReveal();
  initSplitTextReveal();
  initCountUp();
  initSidebarNav();
  // initAccordion(); // Removed - Services section deleted
  initSmoothScroll();
  initScrollEffects();
  initMagneticHover();
  initCardTilt();
  initCustomCursor();
  initProjectModal();
  initGsapCards();
  initExperienceTabs();
  initSkillsCarousel();
});