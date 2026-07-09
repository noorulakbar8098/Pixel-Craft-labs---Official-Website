import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as THREE from 'three';
import './style.css';

// Register GreenSock ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// 1. Lenis Smooth Scroll Configuration
const lenis = new Lenis({
  duration: 1.6, // longer duration for slower, ultra-feather roll-off
  easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t), // smooth exponential out
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 0.9, // slightly damped wheel input for calmness
  touchMultiplier: 1.5,
  infinite: false,
});

// Sync ScrollTrigger updates with Lenis scroll movements
lenis.on('scroll', ScrollTrigger.update);

// Run Lenis in requestAnimationFrame
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// 2. Navigation Control: Bottom Horizon Dynamic Morphing
let lastScrollY = 0;
const navbarWrapper = document.querySelector('.navbar-wrapper');
const navLinks = document.querySelector('.nav-links');
const navActiveBg = document.querySelector('.nav-active-bg');
const navItems = document.querySelectorAll('.nav-item');

lenis.on('scroll', (e) => {
  const currentScrollY = e.scroll;
  if (currentScrollY > 120) {
    if (currentScrollY > lastScrollY) {
      // Scrolling down: collapse to Dynamic Island center pill
      if (!navbarWrapper.classList.contains('expanded-via-hover')) {
        navbarWrapper.classList.add('collapsed');
      }
    } else {
      // Scrolling up: expand back to full navbar
      navbarWrapper.classList.remove('collapsed');
      navbarWrapper.classList.remove('expanded-via-hover');
    }
  } else {
    navbarWrapper.classList.remove('collapsed');
    navbarWrapper.classList.remove('expanded-via-hover');
  }
  lastScrollY = currentScrollY;
});

// Expand/Collapse morphing animations on hover & click
if (navbarWrapper) {
  navbarWrapper.addEventListener('mouseenter', () => {
    if (navbarWrapper.classList.contains('collapsed')) {
      navbarWrapper.classList.remove('collapsed');
      navbarWrapper.classList.add('expanded-via-hover');
      // Trigger background alignment reflow
      const activeItem = navLinks.querySelector('.nav-item.active');
      if (activeItem) moveActiveBg(activeItem);
    }
  });

  navbarWrapper.addEventListener('mouseleave', () => {
    if (navbarWrapper.classList.contains('expanded-via-hover')) {
      navbarWrapper.classList.remove('expanded-via-hover');
      navbarWrapper.classList.add('collapsed');
    }
  });

  navbarWrapper.addEventListener('click', (e) => {
    if (navbarWrapper.classList.contains('collapsed')) {
      navbarWrapper.classList.remove('collapsed');
      navbarWrapper.classList.add('expanded-via-hover');
      const activeItem = navLinks.querySelector('.nav-item.active');
      if (activeItem) moveActiveBg(activeItem);
      e.stopPropagation();
    }
  });
}

// Active background highlight slide logic
function moveActiveBg(item) {
  if (!item || !navActiveBg || !navLinks) return;
  if (navbarWrapper.classList.contains('collapsed')) return;

  const rect = item.getBoundingClientRect();
  const parentRect = navLinks.getBoundingClientRect();

  gsap.to(navActiveBg, {
    left: rect.left - parentRect.left,
    width: rect.width,
    opacity: 1,
    duration: 0.35,
    ease: 'power3.out',
    overwrite: 'auto'
  });
}

navItems.forEach((item) => {
  item.addEventListener('mouseenter', () => {
    moveActiveBg(item);
  });
});

if (navLinks) {
  navLinks.addEventListener('mouseleave', () => {
    const activeItem = navLinks.querySelector('.nav-item.active');
    if (activeItem) {
      moveActiveBg(activeItem);
    } else {
      gsap.to(navActiveBg, { opacity: 0, duration: 0.2 });
    }
  });
}

// Initialize active position tracking
setTimeout(() => {
  const activeItem = navLinks.querySelector('.nav-item.active');
  if (activeItem) moveActiveBg(activeItem);
}, 600);

// Dynamic Active Nav Indicator highlighting
const sections = document.querySelectorAll('section');

lenis.on('scroll', () => {
  let activeSection = '';
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
      activeSection = section.getAttribute('id');
    }
  });

  navItems.forEach((item) => {
    item.classList.remove('active');
    const href = item.getAttribute('href').slice(1);
    if (href === activeSection) {
      item.classList.add('active');
      moveActiveBg(item);
    }
  });
});

// Mobile Navigation Toggle Menu Panel
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinksContainer = document.querySelector('.nav-links');

if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinksContainer.classList.toggle('mobile-active');
  });

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navLinksContainer.classList.remove('mobile-active');
    });
  });
}

// 3. Hero Text reveal & Statistics incremental counters
gsap.fromTo(
  '.hero-headline .line-text',
  { y: '100%' },
  { y: '0%', duration: 1.2, ease: 'power4.out', stagger: 0.18, delay: 0.2 }
);

gsap.fromTo(
  '.reveal-item',
  { opacity: 0, y: 30 },
  { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.6, stagger: 0.18 }
);

// Statistics increment animations
const statNumbers = document.querySelectorAll('.stat-number');
statNumbers.forEach((stat) => {
  const target = parseInt(stat.getAttribute('data-target'), 10);
  gsap.fromTo(
    stat,
    { textContent: 0 },
    {
      textContent: target,
      duration: 2.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: stat,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      snap: { textContent: 1 },
      onUpdate: function () {
        stat.innerHTML = Math.floor(stat.textContent);
      },
    }
  );
});

// 4. Custom Follower Cursor
const cursorDot = document.getElementById('custom-cursor-dot');
const cursorRing = document.getElementById('custom-cursor');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  cursorDot.style.left = `${mouseX}px`;
  cursorDot.style.top = `${mouseY}px`;
});

// Dampen follower cursor ring using lerp loop
function lerpCursor() {
  const easeFactor = 0.15;
  ringX += (mouseX - ringX) * easeFactor;
  ringY += (mouseY - ringY) * easeFactor;

  cursorRing.style.left = `${ringX}px`;
  cursorRing.style.top = `${ringY}px`;

  requestAnimationFrame(lerpCursor);
}
lerpCursor();

// Magnify Cursor ring on active element hover
const interactiveControls = document.querySelectorAll('a, button, select, input, textarea, .faq-trigger, .tech-badge');
interactiveControls.forEach((item) => {
  item.addEventListener('mouseenter', () => {
    document.body.classList.add('hover-interactive');
  });
  item.addEventListener('mouseleave', () => {
    document.body.classList.remove('hover-interactive');
  });
});

// 5. Spotlight Glow effects inside cards
const cards = document.querySelectorAll('.glass-card');
cards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// 6. Magnetic Buttons
const magneticButtons = document.querySelectorAll('.magnetic-btn');
magneticButtons.forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const pullX = e.clientX - btnCenterX;
    const pullY = e.clientY - btnCenterY;

    // Pull button elements slightly toward mouse pointer coords
    gsap.to(btn, {
      x: pullX * 0.35,
      y: pullY * 0.35,
      duration: 0.3,
      ease: 'power2.out',
    });
  });

  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    });
  });
});

// 7. 3D Card Tilt interactions
const tiltBlocks = document.querySelectorAll('.tilt-target');
tiltBlocks.forEach((block) => {
  block.addEventListener('mousemove', (e) => {
    const rect = block.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Generate perspective rotations
    const rotateX = ((y / rect.height) - 0.5) * -8;
    const rotateY = ((x / rect.width) - 0.5) * 8;

    gsap.to(block, {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      duration: 0.3,
      ease: 'power2.out',
    });
  });

  block.addEventListener('mouseleave', () => {
    gsap.to(block, {
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      duration: 0.5,
      ease: 'power2.out',
    });
  });
});

// 8. Vertical About Timeline Animation triggers
const timelineProgress = document.querySelector('.timeline-progress');
const timelineItems = document.querySelectorAll('.timeline-item');

if (timelineProgress && timelineItems.length > 0) {
  gsap.to(timelineProgress, {
    height: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: '.timeline-container',
      start: 'top 70%',
      end: 'bottom 65%',
      scrub: 1.8, // smooth lag decay for feather-like motion
    },
  });

  timelineItems.forEach((item) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 70%',
      onEnter: () => item.classList.add('active'),
      onLeaveBack: () => item.classList.remove('active'),
    });
  });
}

// 9. Horizontal Process Steps Animation triggers
const processSteps = document.querySelectorAll('.process-step');
const processActiveBar = document.querySelector('.process-progress-active');

if (processActiveBar && processSteps.length > 0) {
  gsap.to(processActiveBar, {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: '.process-flow',
      start: 'top 75%',
      end: 'bottom 65%',
      scrub: 1.8, // smooth lag decay for feather-like motion
    },
  });

  processSteps.forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 75%',
      onEnter: () => step.classList.add('active'),
      onLeaveBack: () => step.classList.remove('active'),
    });
  });
}

// 10. Portfolio Item reveal animations
const portfolioItems = document.querySelectorAll('.portfolio-item');
portfolioItems.forEach((item) => {
  const textContent = item.querySelector('.portfolio-content');
  const mockupGraphics = item.querySelector('.portfolio-mockup');

  gsap.fromTo(
    textContent,
    { opacity: 0, x: -40 },
    {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      },
    }
  );

  gsap.fromTo(
    mockupGraphics,
    { opacity: 0, x: 40, scale: 0.95 },
    {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      },
    }
  );
});

// 11. Interactive Tech Cloud badge floats & mouse push vectors
const cloudContainer = document.getElementById('tech-cloud');
const techBadges = document.querySelectorAll('.tech-badge');

if (cloudContainer && techBadges.length > 0) {
  // Constant slow background float
  techBadges.forEach((badge, index) => {
    gsap.to(badge, {
      x: 'random(-12, 12)',
      y: 'random(-12, 12)',
      duration: 'random(3.5, 6.5)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: index * 0.15,
    });
  });

  // Pull badges based on mouse direction coordinates
  cloudContainer.addEventListener('mousemove', (e) => {
    const rect = cloudContainer.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const midY = rect.top + rect.height / 2;

    const pullMultiplierX = e.clientX - midX;
    const pullMultiplierY = e.clientY - midY;

    techBadges.forEach((badge) => {
      const speed = parseFloat(badge.getAttribute('data-speed')) || 0.05;
      gsap.to(badge, {
        x: pullMultiplierX * speed * 1.8,
        y: pullMultiplierY * speed * 1.8,
        overwrite: 'auto',
        duration: 0.5,
        ease: 'power2.out',
      });
    });
  });

  // Smooth bounce snap back when cursor leaves tech section
  cloudContainer.addEventListener('mouseleave', () => {
    techBadges.forEach((badge) => {
      gsap.to(badge, {
        x: 0,
        y: 0,
        overwrite: 'auto',
        duration: 0.8,
        ease: 'elastic.out(1, 0.35)',
      });
    });
  });
}

// 12. FAQ Accordion panel Toggles
const faqTriggers = document.querySelectorAll('.faq-trigger');
faqTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const itemParent = trigger.parentElement;
    const content = trigger.nextElementSibling;
    const isCurrentlyExpanded = trigger.getAttribute('aria-expanded') === 'true';

    // Auto-collapse other active questions
    document.querySelectorAll('.faq-item').forEach((item) => {
      if (item !== itemParent) {
        item.classList.remove('active');
        item.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
        item.querySelector('.faq-content').style.maxHeight = null;
      }
    });

    if (isCurrentlyExpanded) {
      trigger.setAttribute('aria-expanded', 'false');
      itemParent.classList.remove('active');
      content.style.maxHeight = null;
    } else {
      trigger.setAttribute('aria-expanded', 'true');
      itemParent.classList.add('active');
      content.style.maxHeight = `${content.scrollHeight}px`;
    }
  });
});

// 13. Luxury Contact Form Handling & Validation
const inquiryForm = document.getElementById('inquiry-form');
if (inquiryForm) {
  const fields = inquiryForm.querySelectorAll('.form-input');
  const btnSubmit = inquiryForm.querySelector('.btn-submit');
  const successMessage = inquiryForm.querySelector('.status-success');
  const errorMessage = inquiryForm.querySelector('.status-error');

  fields.forEach((field) => {
    field.addEventListener('blur', () => {
      validateInput(field);
    });
    field.addEventListener('input', () => {
      if (field.parentElement.classList.contains('has-error')) {
        validateInput(field);
      }
    });
  });

  function validateInput(input) {
    let isValid = true;
    
    if (input.required && !input.value.trim()) {
      isValid = false;
    }
    
    if (input.type === 'email' && input.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(input.value.trim());
    }

    const parent = input.parentElement;
    if (!isValid) {
      parent.classList.add('has-error');
    } else {
      parent.classList.remove('has-error');
    }
    return isValid;
  }

  inquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasValidationErrors = false;

    fields.forEach((field) => {
      if (!validateInput(field)) {
        hasValidationErrors = true;
      }
    });

    if (hasValidationErrors) {
      errorMessage.style.display = 'flex';
      successMessage.style.display = 'none';
      return;
    }

    // Hide error banner and show loader status
    errorMessage.style.display = 'none';
    const labelSpan = btnSubmit.querySelector('span:first-child');
    const loadSpinner = btnSubmit.querySelector('.spinner');

    labelSpan.style.opacity = '0.5';
    loadSpinner.style.display = 'block';
    btnSubmit.disabled = true;

    // Pack form values
    const formData = new FormData(inquiryForm);
    const accessKey = formData.get('access_key');

    // If access key is mock placeholder, simulate delay (fallback)
    if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
      setTimeout(() => {
        labelSpan.style.opacity = '1';
        loadSpinner.style.display = 'none';
        btnSubmit.disabled = false;
        successMessage.style.display = 'flex';
        inquiryForm.reset();
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 6000);
      }, 2000);
      return;
    }

    // Submit form values to Web3Forms API
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
      .then(async (response) => {
        let json = await response.json();
        if (response.status === 200) {
          labelSpan.style.opacity = '1';
          loadSpinner.style.display = 'none';
          btnSubmit.disabled = false;
          successMessage.style.display = 'flex';
          inquiryForm.reset();
          setTimeout(() => {
            successMessage.style.display = 'none';
          }, 6000);
        } else {
          console.error(json);
          labelSpan.style.opacity = '1';
          loadSpinner.style.display = 'none';
          btnSubmit.disabled = false;
          errorMessage.style.display = 'flex';
        }
      })
      .catch((error) => {
        console.error(error);
        labelSpan.style.opacity = '1';
        loadSpinner.style.display = 'none';
        btnSubmit.disabled = false;
        errorMessage.style.display = 'flex';
      });
  });
}

// 8. Dark/Light Theme Switching with Circular Ripple Animation
const themeToggle = document.getElementById('theme-toggle');

// Initialize theme from storage or system preferences
const savedTheme = localStorage.getItem('theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
  document.documentElement.classList.add('dark-theme');
} else {
  document.documentElement.classList.remove('dark-theme');
}

if (themeToggle) {
  themeToggle.addEventListener('click', (event) => {
    const isDark = document.documentElement.classList.contains('dark-theme');
    
    // View Transition API Fallback
    if (!document.startViewTransition) {
      document.documentElement.classList.toggle('dark-theme');
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
      return;
    }
    
    // Calculate circular ripple bounds
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    
    // Set variables on document root
    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);
    document.documentElement.style.setProperty('--r', `${endRadius}px`);
    
    document.startViewTransition(() => {
      document.documentElement.classList.toggle('dark-theme');
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
  });
}

// 9. Dynamic local clock in the footer
function updateFooterClock() {
  const clockElement = document.getElementById('footer-clock');
  if (!clockElement) return;

  const now = new Date();
  const options = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  const timeString = now.toLocaleTimeString('en-US', options);
  clockElement.textContent = `Studio Time: ${timeString} IST`;
}

setInterval(updateFooterClock, 1000);
updateFooterClock();

// 10. Newsletter Form quick submit
const newsletterForm = document.getElementById('newsletter-form');
const newsletterSuccess = document.getElementById('newsletter-success');

if (newsletterForm && newsletterSuccess) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    newsletterSuccess.style.display = 'block';
    newsletterForm.reset();
    setTimeout(() => {
      newsletterSuccess.style.display = 'none';
    }, 4000);
  });
}

// 11. Interactive 3D Particle Constellation (Hero background canvas)
const init3DCanvas = () => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);

  const particles = [];
  const particleCount = 65;
  const connectionDistance = 110;
  
  let targetCameraX = 0;
  let targetCameraY = 0;
  let currentCameraX = 0;
  let currentCameraY = 0;
  
  // Dynamic scaling resize handler
  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });

  // Track cursor coordinates
  window.addEventListener('mousemove', (e) => {
    targetCameraX = (e.clientX - window.innerWidth / 2) * 0.08;
    targetCameraY = (e.clientY - window.innerHeight / 2) * 0.08;
  });

  // Particle constructor
  class Particle {
    constructor() {
      this.reset();
      this.z = Math.random() * 800 + 200; // depth coordinate
    }

    reset() {
      this.x = (Math.random() - 0.5) * width * 1.5;
      this.y = (Math.random() - 0.5) * height * 1.5;
      this.z = 1000;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.vz = -Math.random() * 0.4 - 0.1; // moves forward (towards screen)
      this.size = Math.random() * 1.5 + 0.5;
    }

    update(scrollOffset) {
      this.x += this.vx;
      this.y += this.vy;
      this.z += this.vz - scrollOffset * 0.15; // Z shifts based on scroll speed

      // Reset when particle goes behind viewer or too far
      if (this.z <= 100 || this.z > 1200) {
        this.reset();
        this.z = 1200;
      }
    }

    project(cameraX, cameraY) {
      // 3D Perspective Projection
      const fov = 400; // Focal length
      const scale = fov / (fov + this.z);
      
      const projX = (this.x - cameraX) * scale + width / 2;
      const projY = (this.y - cameraY) * scale + height / 2;
      
      return { x: projX, y: projY, size: this.size * scale * 2, scale };
    }
  }

  // Populate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  let lastScrollY = window.scrollY;

  // Render loop
  const render = () => {
    ctx.clearRect(0, 0, width, height);

    // Easing for camera tracking
    currentCameraX += (targetCameraX - currentCameraX) * 0.05;
    currentCameraY += (targetCameraY - currentCameraY) * 0.05;

    // Track scroll velocity
    const scrollDelta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;

    const projected = [];

    // Update and project particles
    particles.forEach((p) => {
      p.update(scrollDelta);
      projected.push(p.project(currentCameraX, currentCameraY));
    });

    const isDark = document.documentElement.classList.contains('dark-theme');
    const colorLine = isDark ? 'rgba(99, 102, 241,' : 'rgba(37, 99, 235,';
    const colorParticle = isDark ? 'rgba(255, 255, 255,' : 'rgba(15, 23, 42,';

    // Draw connecting lines (constellations)
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        const dist = Math.hypot(dx, dy, dz);

        if (dist < connectionDistance) {
          const proj1 = projected[i];
          const proj2 = projected[j];

          // Fade out based on distance and projection depth
          const alpha = (1 - dist / connectionDistance) * 0.18 * Math.min(proj1.scale, proj2.scale);
          ctx.beginPath();
          ctx.moveTo(proj1.x, proj1.y);
          ctx.lineTo(proj2.x, proj2.y);
          ctx.strokeStyle = `${colorLine} ${alpha})`;
          ctx.lineWidth = 0.5 * Math.min(proj1.scale, proj2.scale);
          ctx.stroke();
        }
      }
    }

    // Draw particle points
    projected.forEach((proj) => {
      if (proj.x >= 0 && proj.x <= width && proj.y >= 0 && proj.y <= height) {
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
        ctx.fillStyle = `${colorParticle} ${proj.scale * 0.75})`;
        ctx.fill();
      }
    });

    requestAnimationFrame(render);
  };

  render();
};

init3DCanvas();

// 11.5. Interactive 3D WebGL Skill Constellation Network Graph (Three.js)
const initTechConstellation = () => {
  const container = document.getElementById('tech-constellation-container');
  if (!container) return;

  const detailCard = document.getElementById('tech-details');
  const detailName = document.getElementById('tech-details-name');
  const detailDesc = document.getElementById('tech-details-desc');
  const detailDot = document.getElementById('tech-details-dot');

  // Scene setup
  const scene = new THREE.Scene();

  // Camera setup
  const camera = new THREE.PerspectiveCamera(40, container.offsetWidth / container.offsetHeight, 0.1, 100);
  camera.position.z = 7.5;

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Group that holds the entire network graph
  const graphGroup = new THREE.Group();
  scene.add(graphGroup);

  // Initial tilt stance
  graphGroup.rotation.x = 0.25;
  graphGroup.rotation.y = -0.35;

  // 1. SKILLS DATASET CONFIGURATION
  const skills = [
    { name: 'Kotlin', size: 0.36, pos: [0, 0, 0], color: 0x6366F1, info: 'Primary programming language for native Android systems and Kotlin Multiplatform.' },
    { name: 'Compose', size: 0.26, pos: [-1.6, 1.2, 0.7], color: 0x22D3EE, info: 'Modern declarative layout engine for building fluid native Android and KMP components.' },
    { name: 'KMP', size: 0.28, pos: [1.6, -1.0, -0.6], color: 0x3B82F6, info: 'Kotlin Multiplatform allows sharing core business logic seamlessly across iOS, Android, and Web.' },
    { name: 'Supabase', size: 0.24, pos: [-0.6, -1.6, 1.2], color: 0x34D399, info: 'Open-source Firebase alternative providing real-time PostgreSQL databases and user auth.' },
    { name: 'Firebase', size: 0.24, pos: [1.4, 1.3, -1.4], color: 0xEF4444, info: 'Cloud infrastructure suite covering Firestore databases, Auth, and app notifications.' },
    { name: 'Coroutines', size: 0.23, pos: [2.0, 0.6, 0.9], color: 0xF59E0B, info: 'Asynchronous programming model in Kotlin for non-blocking UI and network operations.' },
    { name: 'SQLite / Room', size: 0.22, pos: [-1.5, -0.7, -1.4], color: 0xEC4899, info: 'Local relational database system optimized for native offline-first mobile app storage.' }
  ];

  // 2. CONNECTION LINES LINK CONFIGURATION
  const connections = [
    [0, 1], // Kotlin -> Compose
    [0, 2], // Kotlin -> Postgres
    [0, 3], // Kotlin -> WebSockets
    [0, 5], // Kotlin -> Flutter
    [0, 6], // Kotlin -> Firebase
    [2, 4], // Postgres -> Next.js
    [3, 1], // WebSockets -> Compose
    [3, 6]  // WebSockets -> Firebase
  ];

  // 3. GENERATE DYNAMIC CANVAS SPRITE LABELS
  const createTextSprite = (text) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Transparent round rect pill border
    ctx.fillStyle = 'rgba(10, 10, 18, 0.85)';
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(4, 4, 248, 56, 16);
    ctx.fill();
    ctx.stroke();

    // Solder font
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.4, 0.35, 1);
    return sprite;
  };

  // 4. CONSTRUCT 3D NODES & SPHERES
  const nodeMeshes = [];
  const sphereGeom = new THREE.SphereGeometry(1, 32, 32);

  skills.forEach((skill, idx) => {
    // Standard glossy material for a nice physical feel
    const sphereMat = new THREE.MeshStandardMaterial({
      color: skill.color,
      roughness: 0.18,
      metalness: 0.8,
      bumpScale: 0.05
    });

    const mesh = new THREE.Mesh(sphereGeom, sphereMat);
    mesh.scale.setScalar(skill.size);
    mesh.position.set(skill.pos[0], skill.pos[1], skill.pos[2]);
    mesh.userData = { skill, idx }; // Save data for Raycasting checks

    // Add node label sprite floating above
    const sprite = createTextSprite(skill.name);
    sprite.position.copy(mesh.position);
    sprite.position.y += skill.size + 0.38;

    graphGroup.add(mesh);
    graphGroup.add(sprite);
    nodeMeshes.push(mesh);
  });

  // 5. DRAW CONNECTIONS (GLOWING LINE SEGMENTS)
  connections.forEach(([fromIdx, toIdx]) => {
    const fromPos = new THREE.Vector3(...skills[fromIdx].pos);
    const toPos = new THREE.Vector3(...skills[toIdx].pos);

    const lineGeom = new THREE.BufferGeometry().setFromPoints([fromPos, toPos]);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x4F46E5, // indigo trace line
      transparent: true,
      opacity: 0.42,
      linewidth: 1.5
    });

    const line = new THREE.Line(lineGeom, lineMat);
    graphGroup.add(line);
  });

  // 6. LIGHTING
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  const innerGlow = new THREE.PointLight(0x6366F1, 2.5, 10);
  innerGlow.position.set(0, 0, 0);
  scene.add(innerGlow);

  // 7. DRAG-TO-ROTATE ORBIT CONTROLS
  let isDragging = false;
  let prevMousePosition = { x: 0, y: 0 };
  let autoRotateActive = true;
  let rotationVelocityX = 0;
  let rotationVelocityY = 0.002; // slow initial rotation

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    autoRotateActive = false;
    prevMousePosition = { x: e.clientX, y: e.clientY };
  });

  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    autoRotateActive = false;
    prevMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMousePosition.x;
    const deltaY = e.clientY - prevMousePosition.y;

    rotationVelocityY = deltaX * 0.004;
    rotationVelocityX = deltaY * 0.004;

    graphGroup.rotation.y += rotationVelocityY;
    graphGroup.rotation.x += rotationVelocityX;

    prevMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - prevMousePosition.x;
    const deltaY = e.touches[0].clientY - prevMousePosition.y;

    rotationVelocityY = deltaX * 0.004;
    rotationVelocityX = deltaY * 0.004;

    graphGroup.rotation.y += rotationVelocityY;
    graphGroup.rotation.x += rotationVelocityX;

    prevMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  const stopDrag = () => {
    isDragging = false;
    // Release locks auto rotate activation check after 3 seconds
    setTimeout(() => {
      if (!isDragging) autoRotateActive = true;
    }, 3000);
  };
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchend', stopDrag);

  // 8. RAYCASTING INTERACTIVE HOVERS
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredNode = null;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  // 9. ANIMATION LOOP
  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);

    // Apply auto-rotation fallback when not dragging
    if (autoRotateActive) {
      graphGroup.rotation.y += 0.0025;
      graphGroup.rotation.x += Math.sin(clock.getElapsedTime() * 0.4) * 0.0003;
    } else if (!isDragging) {
      // Add friction inertia to spin damping
      rotationVelocityX *= 0.95;
      rotationVelocityY *= 0.95;
      graphGroup.rotation.y += rotationVelocityY;
      graphGroup.rotation.x += rotationVelocityX;
    }

    // Raycast check
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodeMeshes);

    if (intersects.length > 0) {
      const node = intersects[0].object;
      
      if (hoveredNode !== node) {
        // Reset old hovered node scale
        if (hoveredNode) {
          gsap.to(hoveredNode.scale, { x: hoveredNode.userData.skill.size, y: hoveredNode.userData.skill.size, z: hoveredNode.userData.skill.size, duration: 0.2 });
        }

        hoveredNode = node;
        
        // Scale up new node
        gsap.to(node.scale, {
          x: node.userData.skill.size * 1.35,
          y: node.userData.skill.size * 1.35,
          z: node.userData.skill.size * 1.35,
          duration: 0.25,
          ease: 'back.out(2)'
        });

        // Trigger cinematic hover chime if play function exists
        if (typeof playHoverChime === 'function') {
          playHoverChime();
        }

        // Show card details overlay
        detailName.textContent = node.userData.skill.name;
        detailDesc.textContent = node.userData.skill.info;
        detailDot.style.backgroundColor = '#' + node.userData.skill.color.toString(16);
        
        detailCard.style.opacity = '1';
        detailCard.style.transform = 'translateY(0)';
      }
    } else {
      if (hoveredNode) {
        gsap.to(hoveredNode.scale, {
          x: hoveredNode.userData.skill.size,
          y: hoveredNode.userData.skill.size,
          z: hoveredNode.userData.skill.size,
          duration: 0.25
        });
        hoveredNode = null;

        // Hide overlay details card
        detailCard.style.opacity = '0';
        detailCard.style.transform = 'translateY(10px)';
      }
    }

    renderer.render(scene, camera);
  };

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  });
};

initTechConstellation();

// 12. Scroll-Driven Parallax on the footer brand text
const initFooterParallax = () => {
  const bigBrandText = document.querySelector('.footer-big-brand');
  if (!bigBrandText) return;

  gsap.to(bigBrandText, {
    scrollTrigger: {
      trigger: '.footer',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.8 // smooth lag decay
    },
    x: -120,
    ease: 'none'
  });
};

initFooterParallax();

// 13. Laser-Tracked Interactive Timeline Animation
const initTimeline = () => {
  const timelineContainer = document.getElementById('timeline-container');
  const progressLine = document.getElementById('timeline-progress');
  const laserPointer = document.getElementById('timeline-laser');
  const steps = document.querySelectorAll('.timeline-step');

  if (!timelineContainer || !progressLine || !laserPointer || steps.length === 0) return;

  // Animate progress line height and laser position
  gsap.timeline({
    scrollTrigger: {
      trigger: timelineContainer,
      start: 'top center+=10%',
      end: 'bottom center+=10%',
      scrub: 1.8 // smooth lag decay
    }
  })
  .to(progressLine, { height: '100%', ease: 'none' }, 0)
  .to(laserPointer, { top: '100%', ease: 'none' }, 0);

  // Activate milestone cards as they scroll into view
  steps.forEach((step) => {
    gsap.timeline({
      scrollTrigger: {
        trigger: step,
        start: 'top center+=20%',
        end: 'bottom center+=20%',
        toggleClass: { targets: step, className: 'active' },
        scrub: 1.8 // smooth lag decay
      }
    });
  });
};

initTimeline();

// 14. Systems Architecture Visualizer Interactive Simulation
const initSystemsVisualizer = () => {
  const btnApi = document.getElementById('btn-flow-api');
  const btnDb = document.getElementById('btn-flow-db');
  const btnWs = document.getElementById('btn-flow-ws');
  
  const flowTitle = document.getElementById('flow-title');
  const flowDesc = document.getElementById('flow-desc');
  const teleLatency = document.getElementById('telemetry-latency');
  const teleLoad = document.getElementById('telemetry-load');
  
  const pulseLine = document.getElementById('ws-pulse-line');
  
  // Packets
  const animClientGateway = document.getElementById('anim-client-gateway');
  const animGatewayClient = document.getElementById('anim-gateway-client');
  const animGatewayCache = document.getElementById('anim-gateway-cache');
  const animCacheGateway = document.getElementById('anim-cache-gateway');
  const animGatewayDb = document.getElementById('anim-gateway-db');
  const animDbGateway = document.getElementById('anim-db-gateway');
  
  // Node circles
  const nodeClient = document.querySelector('#node-client circle:nth-child(2)');
  const nodeGateway = document.querySelector('#node-gateway circle:nth-child(2)');
  const nodeCache = document.querySelector('#node-cache circle:nth-child(2)');
  const nodeDb = document.querySelector('#node-db circle:nth-child(2)');

  if (!btnApi || !btnDb || !btnWs) return;

  let activeFlow = 'api';
  let wsInterval = null;

  const resetNodeGlows = () => {
    nodeClient.style.stroke = '';
    nodeGateway.style.stroke = '';
    nodeCache.style.stroke = '';
    nodeDb.style.stroke = '';
  };

  const highlightNode = (node, color) => {
    node.style.stroke = color;
  };

  const stopWebSocketFlow = () => {
    if (wsInterval) clearInterval(wsInterval);
    if (pulseLine) pulseLine.setAttribute('opacity', '0');
  };

  // Run API Caching Simulation Flow
  const runApiSimulation = () => {
    resetNodeGlows();
    stopWebSocketFlow();
    
    // Step 1: Client -> Gateway
    highlightNode(nodeClient, 'var(--accent-cyan)');
    animClientGateway.parentElement.setAttribute('opacity', '1');
    animClientGateway.beginElement();
    
    setTimeout(() => {
      highlightNode(nodeGateway, 'var(--accent-blue)');
      // Step 2: Gateway -> Cache
      animGatewayCache.parentElement.setAttribute('opacity', '1');
      animGatewayCache.beginElement();
      
      setTimeout(() => {
        highlightNode(nodeCache, 'var(--accent-cyan)');
        // Step 3: Cache -> Gateway
        animCacheGateway.parentElement.setAttribute('opacity', '1');
        animCacheGateway.beginElement();
        
        setTimeout(() => {
          highlightNode(nodeGateway, 'var(--accent-blue)');
          // Step 4: Gateway -> Client
          animGatewayClient.parentElement.setAttribute('opacity', '1');
          animGatewayClient.beginElement();
          
          setTimeout(() => {
            highlightNode(nodeClient, 'var(--accent-cyan)');
            // Fade out packet opacities
            animGatewayClient.parentElement.setAttribute('opacity', '0');
            animClientGateway.parentElement.setAttribute('opacity', '0');
            animGatewayCache.parentElement.setAttribute('opacity', '0');
            animCacheGateway.parentElement.setAttribute('opacity', '0');
          }, 600);
        }, 500);
      }, 500);
    }, 600);
  };

  // Run DB Query Simulation Flow
  const runDbSimulation = () => {
    resetNodeGlows();
    stopWebSocketFlow();

    // Step 1: Client -> Gateway
    highlightNode(nodeClient, 'var(--accent-cyan)');
    animClientGateway.parentElement.setAttribute('opacity', '1');
    animClientGateway.beginElement();

    setTimeout(() => {
      highlightNode(nodeGateway, 'var(--accent-blue)');
      // Step 2: Gateway -> DB
      animGatewayDb.parentElement.setAttribute('opacity', '1');
      animGatewayDb.beginElement();

      setTimeout(() => {
        highlightNode(nodeDb, 'var(--accent-emerald)');
        // Step 3: DB -> Gateway
        animDbGateway.parentElement.setAttribute('opacity', '1');
        animDbGateway.beginElement();

        setTimeout(() => {
          highlightNode(nodeGateway, 'var(--accent-blue)');
          // Step 4: Gateway -> Client
          animGatewayClient.parentElement.setAttribute('opacity', '1');
          animGatewayClient.beginElement();

          setTimeout(() => {
            highlightNode(nodeClient, 'var(--accent-cyan)');
            animGatewayClient.parentElement.setAttribute('opacity', '0');
            animClientGateway.parentElement.setAttribute('opacity', '0');
            animGatewayDb.parentElement.setAttribute('opacity', '0');
            animDbGateway.parentElement.setAttribute('opacity', '0');
          }, 600);
        }, 700);
      }, 700);
    }, 600);
  };

  // Run WebSockets Simulation Flow
  const runWsSimulation = () => {
    resetNodeGlows();
    stopWebSocketFlow();

    // Light up nodes in emerald
    highlightNode(nodeClient, 'var(--accent-emerald)');
    highlightNode(nodeGateway, 'var(--accent-emerald)');
    highlightNode(nodeDb, 'var(--accent-emerald)');

    // Make the dotted pulse line visible
    if (pulseLine) pulseLine.setAttribute('opacity', '0.6');

    // Run continuous packet looping
    wsInterval = setInterval(() => {
      // Client to DB and back
      animClientGateway.parentElement.setAttribute('opacity', '1');
      animClientGateway.beginElement();
      
      setTimeout(() => {
        animGatewayDb.parentElement.setAttribute('opacity', '1');
        animGatewayDb.beginElement();
        
        setTimeout(() => {
          animDbGateway.parentElement.setAttribute('opacity', '1');
          animDbGateway.beginElement();
          
          setTimeout(() => {
            animGatewayClient.parentElement.setAttribute('opacity', '1');
            animGatewayClient.beginElement();
          }, 700);
        }, 700);
      }, 600);
    }, 3000);
  };

  const updateTelemetry = (title, desc, latency, load) => {
    flowTitle.textContent = title;
    flowDesc.textContent = desc;
    teleLatency.textContent = latency;
    teleLoad.textContent = load;
  };

  // Set up event listeners
  btnApi.addEventListener('click', () => {
    if (activeFlow === 'api') {
      runApiSimulation();
      return;
    }
    activeFlow = 'api';
    document.querySelectorAll('.flow-btn').forEach(btn => btn.classList.remove('active'));
    btnApi.classList.add('active');
    
    updateTelemetry(
      'API Cache Verification',
      'The client requests data from the API Gateway. The Gateway first checks our Redis memory caching layer (latencies < 5ms). If found, it bypasses the primary database, saving CPU overhead and loading data instantly.',
      '12ms',
      '0.02%'
    );
    runApiSimulation();
  });

  btnDb.addEventListener('click', () => {
    if (activeFlow === 'db') {
      runDbSimulation();
      return;
    }
    activeFlow = 'db';
    document.querySelectorAll('.flow-btn').forEach(btn => btn.classList.remove('active'));
    btnDb.classList.add('active');
    
    updateTelemetry(
      'Database Query Sync',
      'The client requests records that are dynamic or not yet cached. The API Gateway forwards the query to our primary PostgreSQL database. The record is retrieved, cached for subsequent requests, and piped back to the client app.',
      '48ms',
      '12.4%'
    );
    runDbSimulation();
  });

  btnWs.addEventListener('click', () => {
    if (activeFlow === 'ws') return;
    activeFlow = 'ws';
    document.querySelectorAll('.flow-btn').forEach(btn => btn.classList.remove('active'));
    btnWs.classList.add('active');
    
    updateTelemetry(
      'WebSocket Real-Time Sync',
      'Establishes a persistent, bi-directional WebSocket connection between client apps and backend databases. Updates to database rows stream immediately (latencies < 10ms) to all connected clients, bypassing HTTP poll queries.',
      '4ms',
      '1.8%'
    );
    runWsSimulation();
  });

  // Start with default API animation
  runApiSimulation();

  // Run API simulation every 6 seconds as a preview unless user interacts
  let previewTimer = setInterval(() => {
    if (activeFlow === 'api') {
      runApiSimulation();
    } else if (activeFlow === 'db') {
      runDbSimulation();
    }
  }, 6000);

  // Clear preview timer if user clicks
  const clearPreview = () => {
    if (previewTimer) {
      clearInterval(previewTimer);
      previewTimer = null;
    }
  };
  btnApi.addEventListener('click', clearPreview);
  btnDb.addEventListener('click', clearPreview);
  btnWs.addEventListener('click', clearPreview);
};

initSystemsVisualizer();

// 15. Cinematic Audio Feedback (Web Audio API Synth)
let audioCtx = null;
let soundEnabled = localStorage.getItem('soundEnabled') === 'true';

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play warm synth chime on hover
const playHoverChime = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Warm digital synth chime pitch slide
    osc.frequency.setValueAtTime(880, ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);

    gainNode.gain.setValueAtTime(0.03, ctx.currentTime); // Low volume, very subtle!
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.warn('Audio feedback error:', e);
  }
};

// Play soft mechanical tactile click on select
const playClickChime = () => {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1500, ctx.currentTime); 

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04); // Fast decay

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {
    console.warn('Audio feedback error:', e);
  }
};

// Setup Audio Toggle DOM state and click events
const initAudioControls = () => {
  const soundToggle = document.getElementById('sound-toggle');
  if (!soundToggle) return;

  const soundOffIcon = soundToggle.querySelector('.sound-off-icon');
  const soundOnIcon = soundToggle.querySelector('.sound-on-icon');

  const updateSoundIcons = () => {
    if (soundEnabled) {
      soundOffIcon.style.display = 'none';
      soundOnIcon.style.display = 'block';
    } else {
      soundOffIcon.style.display = 'block';
      soundOnIcon.style.display = 'none';
    }
  };

  // Initialize icon visibility
  updateSoundIcons();

  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled ? 'true' : 'false');
    updateSoundIcons();
    
    if (soundEnabled) {
      // Play a quick chime to verify activation
      playHoverChime();
    }
  });

  // Bind hovers and clicks to interactive items
  const bindAudioEvents = (elements) => {
    elements.forEach((el) => {
      el.addEventListener('mouseenter', playHoverChime);
      el.addEventListener('click', playClickChime);
    });
  };

  // Bind to nav items, buttons, links, and grid blocks
  const hoverElements = document.querySelectorAll(
    '.nav-item, .btn, .flow-btn, .theme-toggle-btn, .sound-toggle-btn, .mobile-toggle, .timeline-content, .faq-trigger'
  );
  bindAudioEvents(hoverElements);
};

initAudioControls();

// 16. 3D Interactive Tech Cube Mouse Tracking Rotation
const init3DInteractiveCube = () => {
  const card = document.querySelector('.founder-profile-card');
  const cube = document.getElementById('cube3d');
  
  if (!card || !cube) return;

  let targetX = -20;
  let targetY = 35;
  let currentX = -20;
  let currentY = 35;

  let autoRotateActive = true;
  let autoRotateAngle = 0;

  // Track cursor offsets over the profile card
  card.addEventListener('mousemove', (e) => {
    autoRotateActive = false;
    const rect = card.getBoundingClientRect();
    
    // Normalize coordinates (-0.5 to 0.5)
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Scale to rotation angles
    targetX = -normY * 110 - 15; // rotate on X based on vertical movement
    targetY = normX * 110 + 35;  // rotate on Y based on horizontal movement
  });

  // Re-enable auto-rotation when mouse leaves the card
  card.addEventListener('mouseleave', () => {
    autoRotateActive = true;
  });

  // Render loop for smooth lerp transition
  const updateCube = () => {
    if (autoRotateActive) {
      // Auto-rotation spins slowly on the Y axis
      autoRotateAngle += 0.35;
      targetX = -15 + Math.sin(autoRotateAngle * 0.02) * 10;
      targetY = autoRotateAngle;
    }

    // Apply linear interpolation (lerp) for smooth easing
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    cube.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg)`;
    requestAnimationFrame(updateCube);
  };

  updateCube();
};

init3DInteractiveCube();



// 18. Scroll-Driven 3D Depth Tunnel Portfolio (Three.js + GSAP)
const initPortfolioTunnel = () => {
  const container = document.getElementById('portfolio-tunnel-container');
  if (!container) return;

  const getContainerSize = () => {
    let w = container.clientWidth || container.offsetWidth;
    let h = container.clientHeight || container.offsetHeight;
    if (!w || !h) {
      w = window.innerWidth;
      h = window.innerHeight;
    }
    return { width: w, height: h };
  };

  const { width, height } = getContainerSize();

  // Scene setup
  const scene = new THREE.Scene();

  // Camera setup
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 0); // start at Z=0

  // WebGL Renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Group that holds the spinning tunnel rings
  const tunnelGroup = new THREE.Group();
  scene.add(tunnelGroup);

  // Group that holds the static glass portfolio panels
  const panelsGroup = new THREE.Group();
  scene.add(panelsGroup);

  // 1. GENERATE DYNAMIC FIBER OPTIC CYBER RINGS
  const ringCount = 25;
  const ringGeom = new THREE.TorusGeometry(3.2, 0.015, 8, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x4F46E5, // brand indigo
    transparent: true,
    opacity: 0.2
  });

  const rings = [];
  for (let i = 0; i < ringCount; i++) {
    const ring = new THREE.Mesh(ringGeom, ringMat);
    // Space rings along the Z-axis from 0 to -38
    ring.position.set(0, 0, -i * 1.6);
    ring.rotation.z = Math.random() * Math.PI;
    tunnelGroup.add(ring);
    rings.push(ring);
  }

  // 2. PORTFOLIO DATA SETTINGS (WITH UNSPLASH MOCKUP SCREENSHOTS)
  const tunnelPanels = [
    {
      title: 'Neerthuli Water App',
      category: 'SALES & OPERATIONS',
      stats: 'Records sales, profits, revenue, and expenses. Tracks employee shifts and admin controls.',
      tech: 'Kotlin, Compose, Firebase',
      pos: [-1.75, 0.3, -8],
      color: '#34D399',
      imgUrl: '/neerthuli-mockup.jpg'
    },
    {
      title: 'Vika Billing Software',
      category: 'INVOICING & REVENUE',
      stats: 'Billing software built for multiple bill invoices. Tracks accounts and revenue streams.',
      tech: 'Kotlin Multiplatform (KMP), Supabase',
      pos: [1.75, -0.25, -17],
      color: '#EF4444',
      imgUrl: '/vika-mockup.jpg'
    },
    {
      title: 'Uniwatt Elektrik',
      category: 'STAFF MONITORING',
      stats: 'Employee enforcement application. Manages shift security and operations logs.',
      tech: 'Kotlin, Compose, WebSockets, Postgres',
      pos: [-1.75, -0.3, -26],
      color: '#F59E0B',
      imgUrl: '/uniwatt-mockup.jpg'
    }
  ];

  // 3. HELPER: Draw glassmorphic mockup cards on canvas (Text layout only to avoid CORS taint)
  const drawCardCanvas = (data) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 576;
    const ctx = canvas.getContext('2d');

    // Text wrapping helper
    const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, currentY);
      return currentY;
    };

    const hasImage = !!data.imgUrl;
    const textMaxWidth = hasImage ? 460 : 900;

    // 1. Soft organic ambient backdrop vignette (no hard rectangular corners or strokes)
    const glowX = hasImage ? 280 : 512;
    const bgGlow = ctx.createRadialGradient(glowX, 288, 50, glowX, 288, hasImage ? 450 : 750);
    bgGlow.addColorStop(0, 'rgba(6, 7, 12, 0.94)'); // solid enough behind text for contrast
    bgGlow.addColorStop(0.5, 'rgba(6, 7, 12, 0.75)');
    bgGlow.addColorStop(0.85, 'rgba(6, 7, 12, 0.25)');
    bgGlow.addColorStop(1, 'transparent');
    
    ctx.fillStyle = bgGlow;
    ctx.beginPath();
    ctx.roundRect(10, 10, 1004, 556, 80); // very soft oval capsule path for backing
    ctx.fill();

    // 2. Soft color ambient tint behind text matching the theme color (no borders)
    const colorSpot = ctx.createRadialGradient(glowX, 288, 0, glowX, 288, 300);
    colorSpot.addColorStop(0, data.color + '0f'); // ultra-subtle 6% color bleed
    colorSpot.addColorStop(1, 'transparent');
    ctx.fillStyle = colorSpot;
    ctx.beginPath();
    ctx.roundRect(10, 10, 1004, 556, 80);
    ctx.fill();

    // 3. Muted category label with small color dot anchor
    ctx.fillStyle = data.color;
    ctx.beginPath();
    ctx.arc(56, 91, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 12px monospace';
    const categoryText = data.category.toUpperCase();
    let cx = 70;
    for (let i = 0; i < categoryText.length; i++) {
      ctx.fillText(categoryText[i], cx, 96);
      cx += ctx.measureText(categoryText[i]).width + 2; // Simulate letter-spacing
    }

    // 4. Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
    ctx.fillText(data.title, 56, 160);

    // 5. Wrapped description paragraph
    ctx.fillStyle = '#94A3B8';
    ctx.font = '400 19px system-ui, -apple-system, sans-serif';
    const descY = 215;
    wrapText(ctx, data.stats, 56, descY, textMaxWidth, 28);

    // 6. Minimalist tech stack label line
    ctx.fillStyle = '#475569';
    ctx.font = '600 12px monospace';
    const formattedTech = 'STACK // ' + data.tech.split(',').map(t => t.trim()).join('  •  ');
    ctx.fillText(formattedTech, 56, 380);

    // 7. Muted CTA Link
    ctx.fillStyle = data.color;
    ctx.font = 'bold 12px monospace';
    ctx.fillText('EXPLORE SYSTEM DESIGN ➜', 56, 500);

    return canvas;
  };

  // 4. CONSTRUCT double-layered 3D meshes (canvas text overlay + native texture loader)
  const panelGeom = new THREE.PlaneGeometry(2.8, 1.575); // scaled down for airy space
  const panelMeshes = [];

  tunnelPanels.forEach((panelData) => {
    // A Group represents the entire 3D card layout
    const cardGroup = new THREE.Group();
    cardGroup.position.set(panelData.pos[0], panelData.pos[1], panelData.pos[2]);
    panelsGroup.add(cardGroup);

    // Background Canvas Text layer
    const canvas = drawCardCanvas(panelData);
    const texture = new THREE.CanvasTexture(canvas);
    const backdropMat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      roughness: 0.15,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    const backdropMesh = new THREE.Mesh(panelGeom, backdropMat);
    cardGroup.add(backdropMesh);

    // Reference elements for scroll updates
    cardGroup.userData = {
      backdropMesh: backdropMesh
    };

    // Foreground Screenshot layer (Loaded natively with custom rounded corner shader)
    if (panelData.imgUrl) {
      const imgGeom = new THREE.PlaneGeometry(1.15, 1.25); // scaled down screenshot
      const textureLoader = new THREE.TextureLoader();
      textureLoader.setCrossOrigin('anonymous');
      const imgTexture = textureLoader.load(panelData.imgUrl);

      // Custom rounded rectangle shaders
      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform sampler2D uTexture;
        uniform float uOpacity;
        uniform float uRadius;
        uniform float uAspect;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          vec2 p = uv - 0.5;
          p.x *= uAspect;

          vec2 size = vec2(0.5 * uAspect, 0.5);
          vec2 d = abs(p) - size + vec2(uRadius);
          float dist = length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - uRadius;

          // anti-aliased edge smoothing for rounded corners
          float alpha = 1.0 - smoothstep(-0.006, 0.006, dist);

          vec4 texColor = texture2D(uTexture, uv);
          gl_FragColor = vec4(texColor.rgb, texColor.a * alpha * uOpacity);
        }
      `;

      const imgMat = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: imgTexture },
          uOpacity: { value: 0.0 },
          uRadius: { value: 0.06 }, // corner radius control
          uAspect: { value: 1.15 / 1.25 }
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide
      });

      const screenshotMesh = new THREE.Mesh(imgGeom, imgMat);
      // Place it on the right side of the card, offset slightly forward (z = 0.05) for awesome parallax depth
      screenshotMesh.position.set(0.62, 0, 0.05); // shifted for smaller width
      cardGroup.add(screenshotMesh);
      cardGroup.userData.screenshotMesh = screenshotMesh;
    }

    panelMeshes.push(cardGroup);
  });

  // Helper to adjust positions based on aspect ratio
  const adjustResponsiveLayout = () => {
    const { width: newW, height: newH } = getContainerSize();
    const aspect = newW / newH;

    panelMeshes.forEach((cardGroup, index) => {
      const originalX = tunnelPanels[index].pos[0];
      if (aspect < 0.8) {
        // Mobile vertical: Center cards so they do not clip off-screen
        cardGroup.position.x = 0;
      } else if (aspect < 1.2) {
        // Tablet / squareish: Shift slightly inward
        cardGroup.position.x = originalX * 0.55;
      } else {
        // Desktop: Full original lateral offset
        cardGroup.position.x = originalX;
      }
    });
  };

  // Run once initially
  adjustResponsiveLayout();

  // 5. LIGHTING
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
  dirLight.position.set(2, 4, 8);
  scene.add(dirLight);

  // Point lights drifting down the tunnel for chromatic glows
  const coreGlow = new THREE.PointLight(0x6366F1, 2, 20);
  coreGlow.position.set(0, 0, -10);
  scene.add(coreGlow);

  // 6. MOUSE LOOK-AROUND PARALLAX VARIABLES
  let mouseX = 0;
  let mouseY = 0;
  let targetCameraX = 0;
  let targetCameraY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  // 7. GSAP SCROLL-DRIVEN CAMERA Z POS
  gsap.timeline({
    scrollTrigger: {
      trigger: '.portfolio-tunnel-section',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.8 // ultra-feather smooth scrub lag
    }
  })
  .to(camera.position, {
    z: -29, // fly down the tunnel past the last card
    ease: 'none'
  }, 0);

  // 8. RENDER LOOP WITH DYNAMIC OPACITY TRANSITIONS
  const animate = () => {
    requestAnimationFrame(animate);

    // Ambient loop rotations for tunnel rings
    rings.forEach((ring, idx) => {
      ring.rotation.z += (idx % 2 === 0 ? 0.002 : -0.002);
      ring.scale.setScalar(1 + Math.sin(window.scrollY * 0.005 + idx) * 0.015);
    });

    // Lerp cursor look-around offset values
    targetCameraX = mouseX * 1.6;
    targetCameraY = -mouseY * 1.2;
    camera.position.x += (targetCameraX - camera.position.x) * 0.06;
    camera.position.y += (targetCameraY - camera.position.y) * 0.06;

    // Responsive scaling factor based on current size
    const { width: currentW, height: currentH } = getContainerSize();
    const aspect = currentW / currentH;
    let responsiveScale = 1.0;
    if (aspect < 0.8) {
      responsiveScale = aspect * 1.25; // scale down on mobile vertical viewports
    } else if (aspect < 1.2) {
      responsiveScale = 0.9;
    }

    // Dynamic card fade in/out based on camera distance (Z-difference)
    panelMeshes.forEach((cardGroup) => {
      // Calculate distance where positive means the card is ahead of the camera
      const distZ = camera.position.z - cardGroup.position.z;
      let opacity = 0;
      let scale = 1.0;

      // Card dissolves and fades out completely BEFORE camera reaches it (clipping/zoom prevention)
      if (distZ < 0.4) {
        opacity = 0;
        scale = 0.8;
      } else if (distZ < 2.0) {
        const ratio = Math.max(0, (distZ - 0.4) / 1.6);
        opacity = ratio * 0.95;
        scale = 0.8 + ratio * 0.2;
      } else if (distZ < 8.0) {
        opacity = 0.95;
        scale = 1.0;
      } else if (distZ < 14.0) {
        const ratio = (14.0 - distZ) / 6.0;
        opacity = ratio * 0.95;
        scale = 0.85 + ratio * 0.15;
      } else {
        opacity = 0;
        scale = 0.85;
      }

      // Apply visibility opacity properties to child card layers
      if (cardGroup.userData.backdropMesh) {
        cardGroup.userData.backdropMesh.material.opacity = opacity;
      }
      if (cardGroup.userData.screenshotMesh) {
        cardGroup.userData.screenshotMesh.material.uniforms.uOpacity.value = opacity;
      }
      cardGroup.scale.setScalar(scale * responsiveScale);
    });

    renderer.render(scene, camera);
  };

  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    const { width: newW, height: newH } = getContainerSize();
    camera.aspect = newW / newH;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, newH);
    adjustResponsiveLayout();
  });
};

initPortfolioTunnel();


