// ===== OPTIMIZED CONNECT-UI PRESENTATION =====

// Cache DOM elements for better performance
const CACHE = {
  scroller: document.getElementById('presentation-scroller') as HTMLElement,
  profileButton: document.getElementById('profile-button') as HTMLButtonElement,
  profileMenu: document.getElementById('profile-menu') as HTMLDivElement,
  navDots: document.querySelectorAll('.nav-dot') as NodeListOf<HTMLElement>,
  slides: document.querySelectorAll('.slide') as NodeListOf<HTMLElement>
};

// ===== ZONE MANAGEMENT =====
class ZoneController {
  private lightLayer: HTMLDivElement;
  private airflowLayer: HTMLDivElement;
  private lightToggle: HTMLInputElement;
  private airflowToggle: HTMLInputElement;

  constructor(zoneNumber: number) {
    this.lightLayer = document.getElementById(`lights-zone${zoneNumber}-layer`) as HTMLDivElement;
    this.airflowLayer = document.getElementById(`airflow-zone${zoneNumber}-layer`) as HTMLDivElement;
    this.lightToggle = document.getElementById(`light-toggle-${zoneNumber}`) as HTMLInputElement;
    this.airflowToggle = document.getElementById(`airflow-toggle-${zoneNumber}`) as HTMLInputElement;

    if (this.isValid()) {
      this.init();
    }
  }

  private isValid(): boolean {
    return !!(this.lightLayer && this.airflowLayer && this.lightToggle && this.airflowToggle);
  }

  private init(): void {
    // Preload images
    this.preloadImage(`/lights_zone${this.getZoneNumber()}.svg`);
    this.preloadImage(`/airflow_zone${this.getZoneNumber()}.svg`);

    // Set background images
    this.lightLayer.style.backgroundImage = `url('/lights_zone${this.getZoneNumber()}.svg')`;
    this.airflowLayer.style.backgroundImage = `url('/airflow_zone${this.getZoneNumber()}.svg')`;

    // Set initial state
    this.updateLightLayer();
    this.updateAirflowLayer();

    // Add event listeners with passive option for better scroll performance
    this.lightToggle.addEventListener('change', () => this.updateLightLayer(), { passive: true });
    this.airflowToggle.addEventListener('change', () => this.updateAirflowLayer(), { passive: true });
  }

  private getZoneNumber(): number {
    return parseInt(this.lightToggle.id.split('-')[2]);
  }

  private updateLightLayer(): void {
    requestAnimationFrame(() => {
      this.lightLayer.style.opacity = this.lightToggle.checked ? '1' : '0';
    });
  }

  private updateAirflowLayer(): void {
    requestAnimationFrame(() => {
      this.airflowLayer.style.opacity = this.airflowToggle.checked ? '1' : '0';
    });
  }

  private preloadImage(src: string): void {
    const img = new Image();
    img.src = src;
  }
}

// ===== STATIC LAYERS SETUP =====
function setupStaticLayers(): void {
  const layers = [
    { id: 'back-layer', src: '/unit_base.svg' },
    { id: 'glass-layer', src: '/unit_glass.svg' },
    { id: 'top-layer', src: '/unit_top.svg' }
  ];

  layers.forEach(({ id, src }) => {
    const layer = document.getElementById(id) as HTMLDivElement;
    if (layer) {
      layer.style.backgroundImage = `url('${src}')`;
      // Preload
      const img = new Image();
      img.src = src;
    }
  });
}

// ===== THEME MANAGEMENT =====
class ThemeManager {
  private button: HTMLButtonElement;
  private menu: HTMLDivElement;
  private isMenuOpen = false;

  constructor(button: HTMLButtonElement, menu: HTMLDivElement) {
    this.button = button;
    this.menu = menu;
    this.init();
  }

  private init(): void {
    // Toggle menu
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.button.contains(e.target as Node) && !this.menu.contains(e.target as Node)) {
        this.closeMenu();
      }
    });

    // Handle theme selection
    this.menu.addEventListener('click', (e) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A') {
        e.preventDefault();
        const theme = target.dataset.themeSet;
        if (theme) {
          this.setTheme(theme);
          this.closeMenu();
        }
      }
    });
  }

  private toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.menu.classList.remove('hidden');
      // Force reflow for animation
      void this.menu.offsetWidth;
      this.menu.classList.add('visible');
    } else {
      this.closeMenu();
    }
  }

  private closeMenu(): void {
    this.isMenuOpen = false;
    this.menu.classList.remove('visible');
    setTimeout(() => {
      this.menu.classList.add('hidden');
    }, 300);
  }

  private setTheme(theme: string): void {
    document.body.dataset.theme = theme;
    // Store preference
    localStorage.setItem('connect-ui-theme', theme);
  }
}

// ===== NAVIGATION =====
class NavigationController {
  private scroller: HTMLElement;
  private dots: NodeListOf<HTMLElement>;
  private slides: NodeListOf<HTMLElement>;
  private currentSlide = 0;

  constructor(scroller: HTMLElement, dots: NodeListOf<HTMLElement>, slides: NodeListOf<HTMLElement>) {
    this.scroller = scroller;
    this.dots = dots;
    this.slides = slides;
    this.init();
  }

  private init(): void {
    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Scroll listener with debounce
    let scrollTimeout: number;
    this.scroller.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => this.updateActiveDot(), 100);
    }, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.nextSlide();
      if (e.key === 'ArrowLeft') this.prevSlide();
    });

    // Initial dot state
    this.updateActiveDot();
  }

  private goToSlide(index: number): void {
    if (index >= 0 && index < this.slides.length) {
      this.slides[index].scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    }
  }

  private nextSlide(): void {
    if (this.currentSlide < this.slides.length - 1) {
      this.goToSlide(this.currentSlide + 1);
    }
  }

  private prevSlide(): void {
    if (this.currentSlide > 0) {
      this.goToSlide(this.currentSlide - 1);
    }
  }

  private updateActiveDot(): void {
    const scrollLeft = this.scroller.scrollLeft;
    const slideWidth = this.slides[0].offsetWidth;
    const newSlide = Math.round(scrollLeft / slideWidth);

    if (newSlide !== this.currentSlide) {
      this.currentSlide = newSlide;
      this.dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === this.currentSlide);
      });
    }
  }
}

// ===== INITIALIZATION =====
function init(): void {
  // Setup static layers
  setupStaticLayers();

  // Initialize parallax controller (subtle 3D heading effect)
  try {
    const hero = document.querySelector('.hero-product-name') as HTMLElement | null;
    if (hero) {
      new (class ParallaxController {
        private target: HTMLElement;
        private scroller: HTMLElement | null;
        private rafId = 0;

        constructor(target: HTMLElement) {
          this.target = target;
          this.scroller = document.getElementById('presentation-scroller');
          this.bind();
        }

        private bind() {
          if (!this.scroller) return;
          this.scroller.addEventListener('scroll', this.onScroll, { passive: true });
          window.addEventListener('resize', this.onScroll, { passive: true });
          this.onScroll();
        }

        private onScroll = () => {
          cancelAnimationFrame(this.rafId);
          this.rafId = requestAnimationFrame(() => {
            const scroller = this.scroller as HTMLElement;
            const x = scroller ? scroller.scrollLeft : 0;
            // subtle parallax: move heading a fraction of the scroll and rotate slightly
            const translateX = Math.max(-40, Math.min(40, (x / 30)));
            const rotateY = Math.max(-6, Math.min(6, (x / 200)));
            const scale = 1 + Math.min(0.06, Math.abs(x) / 2000);
            this.target.style.transform = `translate3d(${translateX}px, 0, 0) rotateY(${rotateY}deg) scale(${scale})`;
            this.target.style.textShadow = `${-rotateY}px ${Math.abs(rotateY)}px 18px rgba(0,0,0,0.25)`;
          });
        }
      })(hero);
    }
  } catch (e) {
    console.warn('ParallaxController init failed', e);
  }

  // Initialize zones
  [1, 2, 3].forEach(zoneNum => new ZoneController(zoneNum));

  // Initialize theme manager
  if (CACHE.profileButton && CACHE.profileMenu) {
    new ThemeManager(CACHE.profileButton, CACHE.profileMenu);
    
    // Restore theme preference
    const savedTheme = localStorage.getItem('connect-ui-theme');
    if (savedTheme) {
      document.body.dataset.theme = savedTheme;
    }
  }

  // Initialize navigation
  if (CACHE.scroller && CACHE.navDots.length > 0 && CACHE.slides.length > 0) {
    new NavigationController(CACHE.scroller, CACHE.navDots, CACHE.slides);
  }

  // Performance optimization: defer non-critical operations
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      // Preload next slide images
      console.log('Connect-UI Presentation loaded successfully');
    });
  } else {
    setTimeout(() => {
      console.log('Connect-UI Presentation loaded successfully');
    }, 1);
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
