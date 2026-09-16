function initHeaderScroll() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  window.addEventListener('scroll', () => {
    const isScrolled = window.scrollY > 8;
    header.classList.toggle('is-scrolled', isScrolled);
  }, { passive: true });
}

function initMobileMenu() {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (!menuToggle || !nav) return;

  const toggleMenu = (open) => {
    menuToggle.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    toggleMenu(!isOpen);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      toggleMenu(false);
      menuToggle.focus();
    }
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  document.addEventListener('click', (e) => {
    if (
      nav.classList.contains('is-open') &&
      !nav.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      toggleMenu(false);
    }
  });
}

function initNavScrollSpy() {
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const sections = document.querySelectorAll('main > section[id]');

  if (navLinks.length === 0 || sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.href.endsWith(`#${id}`));
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' } // narrow band near mid-viewport marks the "active" section
  );

  sections.forEach((section) => {
    observer.observe(section);
  });
}

function initScrollReveal() {
  const reveals = document.querySelectorAll('[data-reveal]');

  if (reveals.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px' }
  );

  reveals.forEach((el) => {
    observer.observe(el);
  });
}

function initFooterYear() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function initContactForm() {
  const form = document.querySelector('[data-form]');
  if (!form) return;

  const submitBtn = form.querySelector('[data-submit]');
  const statusEl = form.querySelector('[data-form-status]');
  const originalBtnText = submitBtn.textContent;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9+()\s.\-]{6,20}$/;

  const fields = {
    prenom: { required: true, validator: (v) => v.trim().length > 0 },
    nom: { required: true, validator: (v) => v.trim().length > 0 },
    email: { required: true, validator: (v) => emailRegex.test(v) },
    telephone: { required: false, validator: (v) => !v || phoneRegex.test(v) },
    projet: { required: false, validator: () => true },
    message: { required: false, validator: () => true },
    consent: { required: true, validator: (v) => v },
  };

  const getFieldElement = (name) => form.querySelector(`[name="${name}"]`);
  const getErrorElement = (name) => form.querySelector(`#${name}-error`);

  const setFieldError = (name, message) => {
    const field = getFieldElement(name);
    const error = getErrorElement(name);
    if (!field || !error) return;

    if (message) {
      error.textContent = message;
      error.hidden = false;
      field.setAttribute('aria-invalid', 'true');
    } else {
      error.hidden = true;
      field.setAttribute('aria-invalid', 'false');
    }
  };

  const clearAllErrors = () => {
    Object.keys(fields).forEach((name) => {
      setFieldError(name, '');
    });
  };

  const getFieldValue = (name) => {
    const field = getFieldElement(name);
    if (!field) return null;
    return field.type === 'checkbox' ? field.checked : field.value;
  };

  const validateField = (name) => {
    const field = getFieldElement(name);
    if (!field) return true;

    const value = getFieldValue(name);
    const config = fields[name];

    if (config.required && !value) {
      const messages = {
        prenom: 'Merci de renseigner votre prénom.',
        nom: 'Merci de renseigner votre nom.',
        email: 'Merci de renseigner votre email.',
        telephone: 'Merci de vérifier ce numéro de téléphone.',
        consent: 'Merci d\'accepter cette condition pour continuer.',
      };
      setFieldError(name, messages[name] || 'Ce champ est requis.');
      return false;
    }

    if (value && !config.validator(value)) {
      const messages = {
        email: 'Merci de renseigner une adresse email valide.',
        telephone: 'Merci de vérifier ce numéro de téléphone.',
      };
      setFieldError(name, messages[name] || 'Cette valeur n\'est pas valide.');
      return false;
    }

    setFieldError(name, '');
    return true;
  };

  const validateAll = () => {
    // .map then .every, not .every directly: every() short-circuits and would skip
    // validating (and thus showing errors for) fields after the first invalid one
    const results = Object.keys(fields).map((name) => validateField(name));
    return results.every(Boolean);
  };

  Object.keys(fields).forEach((name) => {
    const field = getFieldElement(name);
    if (field) {
      field.addEventListener('blur', () => validateField(name));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') {
          validateField(name);
        }
      });
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateAll()) {
      statusEl.textContent =
        'Merci de corriger les champs indiqués avant d\'envoyer votre demande.';
      statusEl.className = 'form-status is-error';
      const firstInvalid = Array.from(
        document.querySelectorAll('[aria-invalid="true"]')
      )[0];
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    try {
      // Netlify intercepts POSTs to "/" for form processing; outside Netlify (e.g. local dev) this 404s, which is expected
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });

      if (response.ok) {
        statusEl.textContent =
          'Merci, votre demande a bien été envoyée. Je vous recontacte sous 48 h ouvrées.';
        statusEl.className = 'form-status is-success';
        clearAllErrors();
        form.reset();
        Object.keys(fields).forEach((name) => {
          const field = getFieldElement(name);
          if (field) field.setAttribute('aria-invalid', 'false');
        });
      } else {
        throw new Error('Network response was not ok');
      }
    } catch {
      statusEl.textContent =
        'Une erreur est survenue lors de l\'envoi. Vous pouvez nous écrire directement à contact@rija-patrimoine.fr.';
      statusEl.className = 'form-status is-error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}

initHeaderScroll();
initMobileMenu();
initNavScrollSpy();
initScrollReveal();
initFooterYear();
initContactForm();
