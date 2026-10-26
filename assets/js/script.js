/* ============================================
   NCRDeal.com — Script.js
   All Interactive Features
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initScrollAnimations();
  initStickyNav();
  initMobileNav();
  initEMICalculator();
  initPropertyFilters();
  initBlogFilters();
  initForms();
  initSmoothScroll();
  initBedroomFilter();
});

/* ============================================
   0. THEME TOGGLE
   ============================================ */
function initThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  // Check saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  if (initialTheme === 'dark') {
    document.body.classList.add('dark-mode');
    toggle.innerHTML = '<span class="material-symbols-outlined">light_mode</span>';
  } else {
    toggle.innerHTML = '<span class="material-symbols-outlined">dark_mode</span>';
  }

  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    toggle.innerHTML = isDark 
      ? '<span class="material-symbols-outlined">light_mode</span>'
      : '<span class="material-symbols-outlined">dark_mode</span>';
  });
}

/* ============================================
   1. SCROLL ANIMATIONS (Intersection Observer)
   ============================================ */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade').forEach(el => observer.observe(el));
}

/* ============================================
   2. STICKY NAV + SCROLL SHRINK
   ============================================ */
function initStickyNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  });
}

/* ============================================
   3. MOBILE NAVIGATION
   ============================================ */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');

    // Animate hamburger
    const spans = toggle.querySelectorAll('span');
    toggle.classList.toggle('active');

    if (links.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translateY(8px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close on link click
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      const spans = toggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });
}

/* ============================================
   4. EMI CALCULATOR
   ============================================ */
function initEMICalculator() {
  const loanSlider = document.getElementById('emi-loan');
  const rateSlider = document.getElementById('emi-rate');
  const tenureSlider = document.getElementById('emi-tenure');

  if (!loanSlider || !rateSlider || !tenureSlider) return;

  const loanDisplay = document.getElementById('loan-display');
  const rateDisplay = document.getElementById('rate-display');
  const tenureDisplay = document.getElementById('tenure-display');
  const emiResult = document.getElementById('emi-result');
  const totalInterest = document.getElementById('total-interest');
  const totalPayment = document.getElementById('total-payment');

  function formatINR(num) {
    return '₹ ' + num.toLocaleString('en-IN');
  }

  function calculateEMI() {
    const P = parseInt(loanSlider.value);
    const annualRate = parseFloat(rateSlider.value);
    const years = parseInt(tenureSlider.value);
    const R = annualRate / 1200;
    const N = years * 12;

    let emi;
    if (R === 0) {
      emi = P / N;
    } else {
      emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    }

    const totalPay = emi * N;
    const totalInt = totalPay - P;

    // Update displays
    if (loanDisplay) loanDisplay.textContent = formatINR(P);
    if (rateDisplay) rateDisplay.textContent = annualRate.toFixed(1) + '%';
    if (tenureDisplay) tenureDisplay.textContent = years + ' Years';
    if (emiResult) emiResult.textContent = formatINR(Math.round(emi));
    if (totalInterest) totalInterest.textContent = formatINR(Math.round(totalInt));
    if (totalPayment) totalPayment.textContent = formatINR(Math.round(totalPay));

    // Update slider fill
    updateSliderFill(loanSlider);
    updateSliderFill(rateSlider);
    updateSliderFill(tenureSlider);
  }

  function updateSliderFill(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const pct = ((val - min) / (max - min)) * 100;

    const fill = slider.parentElement.querySelector('.emi-range-fill');
    if (fill) fill.style.width = pct + '%';
  }

  loanSlider.addEventListener('input', calculateEMI);
  rateSlider.addEventListener('input', calculateEMI);
  tenureSlider.addEventListener('input', calculateEMI);

  // Initial calc
  calculateEMI();
}

/* ============================================
   5. PROPERTY FILTERS (Listing Page)
   ============================================ */
function initPropertyFilters() {
  const cards = document.querySelectorAll('.listing-card[data-type]');
  if (cards.length === 0) return;

  const typeCheckboxes = document.querySelectorAll('.filter-type');
  const statusRadios = document.querySelectorAll('.filter-status');
  const budgetSlider = document.getElementById('filter-budget');

  function filterProperties() {
    const selectedTypes = [];
    typeCheckboxes.forEach(cb => {
      if (cb.checked) selectedTypes.push(cb.value);
    });

    let selectedStatus = '';
    statusRadios.forEach(r => {
      if (r.checked) selectedStatus = r.value;
    });

    const maxBudget = budgetSlider ? parseInt(budgetSlider.value) * 10000000 : Infinity;

    let visibleCount = 0;

    cards.forEach(card => {
      const type = card.dataset.type;
      const status = card.dataset.status;
      const price = parseInt(card.dataset.price);

      let show = true;

      if (selectedTypes.length > 0 && !selectedTypes.includes(type)) show = false;
      if (selectedStatus && status !== selectedStatus) show = false;
      if (price > maxBudget) show = false;

      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    // Update count
    const countEl = document.querySelector('.listings-count');
    if (countEl) countEl.textContent = `Showing ${visibleCount} properties`;
  }

  typeCheckboxes.forEach(cb => cb.addEventListener('change', filterProperties));
  statusRadios.forEach(r => r.addEventListener('change', filterProperties));
  if (budgetSlider) budgetSlider.addEventListener('input', filterProperties);
}

/* ============================================
   6. BEDROOM FILTER
   ============================================ */
function initBedroomFilter() {
  const btns = document.querySelectorAll('.bed-btn');
  if (btns.length === 0) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const beds = btn.dataset.beds;
      const cards = document.querySelectorAll('.listing-card[data-beds]');

      cards.forEach(card => {
        if (!beds || beds === 'all') {
          card.style.display = '';
        } else if (beds === '4+') {
          card.style.display = parseInt(card.dataset.beds) >= 4 ? '' : 'none';
        } else {
          card.style.display = card.dataset.beds === beds ? '' : 'none';
        }
      });
    });
  });
}

/* ============================================
   7. BLOG CATEGORY FILTERS
   ============================================ */
function initBlogFilters() {
  const btns = document.querySelectorAll('.blog-filter-btn');
  if (btns.length === 0) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.category;
      const articles = document.querySelectorAll('.blog-card[data-category]');

      articles.forEach(article => {
        if (category === 'all') {
          article.style.display = '';
        } else {
          article.style.display = article.dataset.category === category ? '' : 'none';
        }
      });
    });
  });
}

/* ============================================
   8. FORM HANDLING
   ============================================ */
function initForms() {
  document.querySelectorAll('form[data-lead]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Basic validation
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          field.style.boxShadow = '0 0 0 2px #BA1A1A';
          valid = false;
        } else {
          field.style.boxShadow = '';
        }
      });

      if (!valid) return;

      // Show success
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '✓ Request Sent!';
      submitBtn.style.background = '#16a34a';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        form.reset();
      }, 3000);
    });
  });
}

/* ============================================
   9. SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ============================================
   10. DYNAMIC PROPERTY RENDERING (Homepage)
   ============================================ */
async function loadFeaturedProperties() {
  try {
    const response = await fetch('data/properties.json');
    const properties = await response.json();
    const featured = properties.filter(p => p.featured);
    const container = document.getElementById('featured-properties');
    if (!container) return;

    // Image map for demo (stitch design images)
    const demoImages = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBYoGLg8dA9T_t8gkGFJ3PWA8gjK2YGSxg3dLf8140xiy19laHS7IUok9gIiH33CBPRq4CCWfhiCfwg94-iSWjN5AnSnI1rtFFh5pU3lh-_OjEXpG49CW0pjAzVnxW4UyRjYAqiNIyFx1_BMhtxaCJsFX_mfeAWcgMopZgH7QOdY_7193iC8dr2K2uNjORoAwA_54bg5p69eqpCiSzLcz9teCoevM-34FDkjO-yQ9lU4s4iKkwZsamj5ol9EeLQ_T0Wf57vtrvpBtE',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuByzMUCjPxXWK53oUJpr5UKmrNdfi9zCcdRvaASJ-3tFDxTB94TKG7deAdgk6LCK5o8qFU0wioyWB_R_GBn8ZhmTpMRKEDPnFq85BOJ-0yTHbqMYaYFXXFX1o5m4pY5Ol_3cjXWaUfMWccifilEbWIhQvc-qUbKIHeA8XvfHVpaHk_s2RIw1TkneUeM_WcoBxxecUC5xe4LTz6_nJUsenXOp2m55-k1C5pYE_UnMr9vLvtBmDe2ioV1paKMwvFNS02kbkcVeeVu6O8',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD7egen_wzik8SGTn-etAW_t1m5HnGe1nBz4us9NcUKoO69d-CwEQHDiOlk64JNKQNxeNvZmcz9cor5DjmZ1ga1CWCPQcoQGYqBEWGaCNIvUgXkAmWFgHvQGKhX1WLk1TzBO8vBAdOyNyup_qFARUq0EjX_GyxNHZIovxUP2y-3WWLPNkvs5cjQ2Le1hBwwGwYdKmKKZpLz4KLFJyk45sKWTpOmTCn7nctUfy78VuZ8cSqhotBow5DgTIkx6UyZk03Sgl7qRZthCB4'
    ];

    featured.forEach((p, i) => {
      const tagClass = i === 1 ? 'elite' : '';
      const card = document.createElement('div');
      card.className = 'property-card fade';
      card.innerHTML = `
        <div class="property-card-img">
          <img src="${demoImages[i] || demoImages[0]}" alt="${p.title}" loading="lazy">
          <span class="property-tag ${tagClass}">${p.tag}</span>
        </div>
        <div class="property-card-body">
          <h3>${p.title}</h3>
          <p class="property-location">
            <span class="material-symbols-outlined">location_on</span>
            ${p.location}
          </p>
          <div class="property-footer">
            <span class="property-price">${p.priceDisplay}</span>
            <div class="property-specs">
              <span>${p.beds} Bed</span>
              <span>${p.bath} Bath</span>
              <span>${p.area}</span>
            </div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Re-init scroll animations for new elements
    initScrollAnimations();
  } catch (err) {
    console.log('Properties loaded from inline data');
  }
}

// Auto-load on homepage
if (document.getElementById('featured-properties')) {
  loadFeaturedProperties();
}
