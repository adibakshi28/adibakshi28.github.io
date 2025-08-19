// Theme toggle with localStorage
(function() {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme');
  if (saved === 'light') root.classList.add('light');
  toggle.addEventListener('click', () => {
    root.classList.toggle('light');
    localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
  });
})();

// Update year
document.getElementById('year').textContent = new Date().getFullYear();

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Lightweight GitHub feed (no token)
(async function loadRecent() {
  try {
    const username = 'adibakshi28';
    const featured = new Set([
      'Trade-Trek-API',
      'Trade-Trek-FE',
      'Large-Scale-Time-Series-Order-Book-Data-Warehouse',
      'Technical_Strategy_Analyzer-Dash_py',
      'DL-LoRA_Fine_Tune_LLM-Tensorflow',
      'Decentralized_Governance_Framework-Ethereum_Blockchain'
    ]);
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!res.ok) return;
    const repos = (await res.json())
      .filter(r => !featured.has(r.name))
      .slice(0, 6);

    const grid = document.getElementById('live-feed');
    repos.forEach(repo => {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `
        <div class="card-body">
          <h4>${repo.name.replace(/_/g,' ')}</h4>
          <p>${repo.description ?? 'No description.'}</p>
          <div class="tags">
            <span>★ ${repo.stargazers_count}</span>
            <span>${repo.language ?? '—'}</span>
            <span>Updated ${new Date(repo.updated_at).toLocaleDateString()}</span>
          </div>
          <a class="btn small" href="${repo.html_url}" target="_blank" rel="noopener">Repo →</a>
        </div>
      `;
      grid.appendChild(el);
    });
  } catch (e) {
    // ignore
  }
})();
