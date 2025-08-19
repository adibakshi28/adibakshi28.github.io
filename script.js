// ======================= THEME (with system sync + view transitions) =======================
(() => {
  const THEME_KEY = 'theme';
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const prefersDark = matchMedia('(prefers-color-scheme: dark)');

  const saved = localStorage.getItem(THEME_KEY);                 // "light" | "dark" | null
  const initial = saved ?? (prefersDark.matches ? 'dark' : 'light');
  applyTheme(initial, false);

  // Follow system changes only if user hasn't explicitly chosen
  prefersDark.addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light', true);
    }
  });

  toggle?.addEventListener('click', () => {
    const next = root.classList.contains('light') ? 'dark' : 'light';
    // Use View Transitions if available for a buttery swap
    if (document.startViewTransition) {
      document.startViewTransition(() => applyTheme(next, true));
    } else {
      applyTheme(next, true);
    }
  });

  function applyTheme(mode, persist = false) {
    root.classList.toggle('light', mode === 'light');
    root.style.colorScheme = mode === 'light' ? 'light' : 'dark';
    if (persist) localStorage.setItem(THEME_KEY, mode);
    // icon swap
    if (toggle) toggle.textContent = mode === 'light' ? '☀️' : '🌙';
  }
})();

// ======================= SCROLL PROGRESS BAR =======================
(() => {
  const bar = document.createElement('div');
  bar.className = 'scrollbar';
  document.body.appendChild(bar);

  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = Math.max(0, Math.min(1, h.scrollTop / max));
    bar.style.transform = `scaleX(${p || 0})`;
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();

// ======================= REVEAL ON SCROLL (subtle stagger) =======================
(() => {
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        if (!prefersReduced) {
          // tiny stagger based on element index in DOM order
          const i = [...items].indexOf(e.target);
          e.target.style.transitionDelay = `${(i % 8) * 40}ms`;
        }
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
  items.forEach(el => io.observe(el));
})();

// ======================= ACTIVE NAV HIGHLIGHT =======================
(() => {
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) setActive(e.target.id);
    });
  }, { threshold: 0.6 });
  sections.forEach(s => io.observe(s));
})();

// ======================= CARD TILT (desktop, reduced-motion safe) =======================
(() => {
  if (!matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    let raf = 0;
    card.addEventListener('mousemove', (ev) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width - 0.5;
        const y = (ev.clientY - r.top) / r.height - 0.5;
        const rx = (-y * 4).toFixed(2);
        const ry = (x * 6).toFixed(2);
        card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      card.style.transform = '';
    });
  });
})();

// ======================= LIGHTWEIGHT GITHUB FEED (skeletons + cache + relative time) =======================
(async function loadRecent() {
  const grid = document.getElementById('live-feed');
  if (!grid) return;

  // 1) skeletons
  const makeSkel = () => {
    const s = document.createElement('article');
    s.className = 'card skeleton';
    s.innerHTML = `
      <div class="card-body">
        <div class="skel skel-title"></div>
        <div class="skel skel-line"></div>
        <div class="skel skel-line short"></div>
        <div class="tags">
          <span class="skel skel-pill"></span>
          <span class="skel skel-pill"></span>
          <span class="skel skel-pill"></span>
        </div>
      </div>`;
    return s;
  };
  for (let i = 0; i < 6; i++) grid.appendChild(makeSkel());

  // 2) cache helpers
  const CACHE_KEY = 'gh_repos_cache_v2';
  const TTL = 1000 * 60 * 30; // 30 minutes
  const now = Date.now();
  const getCache = () => {
    try {
      const { t, data } = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      if (t && (now - t) < TTL && Array.isArray(data)) return data;
    } catch {}
    return null;
  };
  const setCache = (data) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: now, data })); } catch {}
  };

  const username = 'adibakshi28';
  const featured = new Set([
    'Trade-Trek-API',
    'Trade-Trek-FE',
    'Large-Scale-Time-Series-Order-Book-Data-Warehouse',
    'Technical_Strategy_Analyzer-Dash_py',
    'DL-LoRA_Fine_Tune_LLM-Tensorflow',
    'Decentralized_Governance_Framework-Ethereum_Blockchain'
  ]);

  // language colors (tiny palette)
  const langColor = {
    'Python':'#3572A5','JavaScript':'#f1e05a','TypeScript':'#3178c6',
    'C++':'#f34b7d','C':'#555555','Solidity':'#AA6746','Jupyter Notebook':'#DA5B0B'
  };

  const relTime = (iso) => {
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    const then = new Date(iso).getTime();
    const diff = Math.round((then - now) / (1000 * 60 * 60 * 24)); // in days
    if (Math.abs(diff) < 1) {
      const h = Math.round((then - now) / (1000 * 60 * 60));
      return rtf.format(h, 'hour');
    }
    return rtf.format(diff, 'day');
  };

  const render = (repos) => {
    grid.innerHTML = '';
    repos.forEach(repo => {
      const lang = repo.language ?? '—';
      const dot = langColor[lang] ? `<span class="lang-dot" style="background:${langColor[lang]}"></span>` : '';
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `
        <div class="card-body">
          <h4>${repo.name.replace(/_/g,' ')}</h4>
          <p>${repo.description ?? 'No description.'}</p>
          <div class="tags">
            <span>★ ${repo.stargazers_count}</span>
            <span>${dot}${lang}</span>
            <span>Updated ${relTime(repo.updated_at)}</span>
          </div>
          <a class="btn small" href="${repo.html_url}" target="_blank" rel="noopener">Repo →</a>
        </div>`;
      grid.appendChild(el);
    });
  };

  try {
    const cached = getCache();
    if (cached) render(cached);

    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!res.ok) throw new Error('GitHub API error');
    let repos = await res.json();

    repos = repos
      .filter(r => !featured.has(r.name) && !r.fork && !r.archived)
      .slice(0, 6);

    render(repos);
    setCache(repos);
  } catch (e) {
    // graceful fallback if nothing is cached
    if (!getCache()) {
      grid.innerHTML = `<p class="muted">Couldn’t load recent repos right now.</p>`;
    }
  }
})();
