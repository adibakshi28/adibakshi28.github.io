// Update year
document.getElementById('year').textContent = new Date().getFullYear();

// Lightweight live feed from GitHub REST API (no token)
// Pulls your 6 most recently updated public repos (excluding the featured ones if desired)
(async function loadRecent() {
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
      <h4>${repo.name.replace(/_/g,' ')}</h4>
      <p>${repo.description ?? 'No description.'}</p>
      <div class="tags">
        <span>★ ${repo.stargazers_count}</span>
        <span>${repo.language ?? '—'}</span>
        <span>Updated ${new Date(repo.updated_at).toLocaleDateString()}</span>
      </div>
      <a class="card-link" href="${repo.html_url}" target="_blank" rel="noopener">Repo →</a>
    `;
    grid.appendChild(el);
  });
})();
