/**
 * SIGMA-PLI - Sistema de Layout Responsivo Automático
 * Detecta o tamanho da tela e aplica configurações otimizadas
 */

class PLIResponsiveLayout {
  constructor() {
    this.breakpoints = {
      xs: 375, // Telefones pequenos
      sm: 576, // Telefones
      md: 768, // Tablets
      lg: 992, // Desktops pequenos
      xl: 1200, // Desktops
      xxl: 1400, // Monitores grandes
      ultrawide: 1920, // Ultrawide
    };

    this.init();
  }

  init() {
    this.detectScreenSize();
    this.applyResponsiveClasses();
    this.setupResizeListener();
    this.optimizeForDevice();
    console.log('🎯 PLI Responsive Layout inicializado');
  }

  detectScreenSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Detectar tipo de dispositivo
    this.deviceType = this.getDeviceType(width);
    this.screenSize = this.getScreenSize(width);
    this.orientation = width > height ? 'landscape' : 'portrait';

    console.log(`📱 Dispositivo detectado: ${this.deviceType} (${width}x${height}) - ${this.orientation}`);
  }

  getDeviceType(width) {
    if (width <= this.breakpoints.xs) return 'phone-small';
    if (width <= this.breakpoints.sm) return 'phone';
    if (width <= this.breakpoints.md) return 'tablet';
    if (width <= this.breakpoints.lg) return 'desktop-small';
    if (width <= this.breakpoints.xl) return 'desktop';
    if (width <= this.breakpoints.xxl) return 'desktop-large';
    return 'ultrawide';
  }

  getScreenSize(width) {
    if (width <= this.breakpoints.xs) return 'xs';
    if (width <= this.breakpoints.sm) return 'sm';
    if (width <= this.breakpoints.md) return 'md';
    if (width <= this.breakpoints.lg) return 'lg';
    if (width <= this.breakpoints.xl) return 'xl';
    if (width <= this.breakpoints.xxl) return 'xxl';
    return 'ultrawide';
  }

  applyResponsiveClasses() {
    const body = document.body;

    // Remover classes antigas
    body.classList.forEach((className) => {
      if (className.startsWith('pli-device-') || className.startsWith('pli-screen-')) {
        body.classList.remove(className);
      }
    });

    // Aplicar novas classes
    body.classList.add(`pli-device-${this.deviceType}`);
    body.classList.add(`pli-screen-${this.screenSize}`);
    body.classList.add(`pli-orientation-${this.orientation}`);
  }

  optimizeForDevice() {
    const root = document.documentElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Otimizações específicas por dispositivo
    switch (this.deviceType) {
      case 'phone-small':
        this.optimizeForSmallPhone(root);
        break;
      case 'phone':
        this.optimizeForPhone(root);
        break;
      case 'tablet':
        this.optimizeForTablet(root);
        break;
      case 'desktop':
      case 'desktop-large':
        this.optimizeForDesktop(root);
        break;
      case 'ultrawide':
        this.optimizeForUltrawide(root);
        break;
    }

    // Detectar densidade de tela (retina)
    if (window.devicePixelRatio > 1.5) {
      root.classList.add('pli-high-density');
    }
  }

  optimizeForSmallPhone(root) {
    root.style.setProperty('--hd-header-height', '45px');
    root.style.setProperty('--ft-footer-height', '65px');
    root.style.setProperty('--pli-container-padding', '12px');
    root.style.setProperty('--pli-font-size-base', '0.85rem');
  }

  optimizeForPhone(root) {
    root.style.setProperty('--hd-header-height', '55px');
    root.style.setProperty('--ft-footer-height', '75px');
    root.style.setProperty('--pli-container-padding', '16px');
    root.style.setProperty('--pli-font-size-base', '0.9rem');
  }

  optimizeForTablet(root) {
    root.style.setProperty('--hd-header-height', '65px');
    root.style.setProperty('--ft-footer-height', '80px');
    root.style.setProperty('--pli-container-padding', '24px');
    root.style.setProperty('--pli-font-size-base', '1rem');
  }

  optimizeForDesktop(root) {
    root.style.setProperty('--hd-header-height', '70px');
    root.style.setProperty('--ft-footer-height', '85px');
    root.style.setProperty('--pli-container-padding', '40px');
    root.style.setProperty('--pli-font-size-base', '1rem');
  }

  optimizeForUltrawide(root) {
    root.style.setProperty('--hd-header-height', '80px');
    root.style.setProperty('--ft-footer-height', '90px');
    root.style.setProperty('--pli-container-padding', '60px');
    root.style.setProperty('--pli-container-max-width', '1600px');
  }

  setupResizeListener() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.detectScreenSize();
        this.applyResponsiveClasses();
        this.optimizeForDevice();
        console.log('🔄 Layout atualizado para nova resolução');
      }, 250);
    });
  }

  // Método público para forçar redimensionamento
  forceResize() {
    this.detectScreenSize();
    this.applyResponsiveClasses();
    this.optimizeForDevice();
  }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.PLILayout = new PLIResponsiveLayout();
});

// Também disponibilizar globalmente
window.PLIResponsiveLayout = PLIResponsiveLayout;
