// Navigation
const viewBtn = document.getElementById('viewBtn');
const addBtn = document.getElementById('addBtn');
const viewSection = document.getElementById('viewSection');
const addSection = document.getElementById('addSection');
const detailSection = document.getElementById('detailSection');
const editSection = document.getElementById('editSection');
const backBtn = document.getElementById('backBtn');
const backFromEditBtn = document.getElementById('backFromEditBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Form Elements
const addForm = document.getElementById('addForm');
const editForm = document.getElementById('editForm');
const commentariesList = document.getElementById('commentariesList');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

let currentCommentaryId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCommentaries();
  setupEventListeners();
});

function setupEventListeners() {
  viewBtn.addEventListener('click', () => showSection('view'));
  addBtn.addEventListener('click', () => showSection('add'));
  backBtn.addEventListener('click', () => showSection('view'));
  backFromEditBtn.addEventListener('click', () => showSection('detail'));
  editBtn.addEventListener('click', () => showSection('edit'));
  deleteBtn.addEventListener('click', deleteCurrentCommentary);
  cancelEditBtn.addEventListener('click', () => showSection('detail'));

  addForm.addEventListener('submit', handleAddCommentary);
  editForm.addEventListener('submit', handleEditCommentary);

  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}

function showSection(section) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  // Show requested section
  switch(section) {
    case 'view':
      viewSection.classList.add('active');
      viewBtn.classList.add('active');
      loadCommentaries();
      break;
    case 'add':
      addSection.classList.add('active');
      addBtn.classList.add('active');
      addForm.reset();
      break;
    case 'detail':
      detailSection.classList.add('active');
      break;
    case 'edit':
      editSection.classList.add('active');
      break;
  }
}

async function loadCommentaries() {
  try {
    const response = await fetch('/api/commentaries');
    const commentaries = await response.json();

    if (commentaries.length === 0) {
      commentariesList.innerHTML = '<p class="loading">Nu exist\u0103 coment\u0103rii \u00eenc\u0103. Adaug\u0103 una pentru a \u00eencepe!</p>';
      return;
    }

    commentariesList.innerHTML = commentaries.map(c => `
      <div class="commentary-card" onclick="showDetail(${c.id})">
        <h3>${c.title}</h3>
        <p>${(c.romanian_translation || '').substring(0, 150)}...</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading commentaries:', error);
    commentariesList.innerHTML = '<p class="loading">Eroare la \u00eenc\u0103rcarea comentariilor</p>';
  }
}

async function showDetail(id) {
  try {
    const response = await fetch(`/api/commentaries/${id}`);
    const commentary = await response.json();

    currentCommentaryId = id;
    document.getElementById('detailTitle').textContent = commentary.title;
    document.getElementById('detailRomanian').textContent = commentary.romanian_translation || '(Încă nu există traducere)';

    // Populate edit form
    document.getElementById('editTitleInput').value = commentary.title;
    document.getElementById('editRomanianInput').value = commentary.romanian_translation || '';

    showSection('detail');
  } catch (error) {
    console.error('Error loading commentary:', error);
    alert('Eroare la \u00eenc\u0103rcarea comentariului');
  }
}

async function handleAddCommentary(e) {
  e.preventDefault();

  const title = document.getElementById('titleInput').value;
  const romanianTranslation = document.getElementById('romanianInput').value;

  try {
    const response = await fetch('/api/commentaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        originalText: romanianTranslation, // Use Romanian as original for storage
        romanianTranslation
      })
    });

    if (response.ok) {
      alert('Comentariu ad\u0103ugat cu succes!');
      showSection('view');
      addForm.reset();
    } else {
      const error = await response.json();
      alert('Eroare: ' + error.error);
    }
  } catch (error) {
    console.error('Error adding commentary:', error);
    alert('Eroare la ad\u0103ugarea comentariului');
  }
}

async function handleEditCommentary(e) {
  e.preventDefault();

  const title = document.getElementById('editTitleInput').value;
  const romanianTranslation = document.getElementById('editRomanianInput').value;

  try {
    const response = await fetch(`/api/commentaries/${currentCommentaryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        originalText: romanianTranslation, // Use Romanian as original for storage
        romanianTranslation
      })
    });

    if (response.ok) {
      alert('Comentariu actualizat cu succes!');
      showSection('view');
    } else {
      alert('Eroare la actualizarea comentariului');
    }
  } catch (error) {
    console.error('Error updating commentary:', error);
    alert('Eroare la actualizarea comentariului');
  }
}

async function deleteCurrentCommentary() {
  if (!confirm('E\u0219ti sigur()\u0103 c\u0103 vrei s\u0103 \u0219tergi acest comentariu?')) {
    return;
  }

  try {
    const response = await fetch(`/api/commentaries/${currentCommentaryId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert('Comentariu \u0219ters cu succes!');
      showSection('view');
    } else {
      alert('Eroare la \u0219tergerea comentariului');
    }
  } catch (error) {
    console.error('Error deleting commentary:', error);
    alert('Eroare la \u0219tergerea comentariului');
  }
}

async function handleSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    loadCommentaries();
    return;
  }

  try {
    const response = await fetch(`/api/search/${encodeURIComponent(query)}`);
    const results = await response.json();

    if (results.length === 0) {
      commentariesList.innerHTML = '<p class="loading">Nu s-au g\u0103sit rezultate</p>';
      return;
    }

    commentariesList.innerHTML = results.map(c => `
      <div class="commentary-card" onclick="showDetail(${c.id})">
        <h3>${c.title}</h3>
        <p>${(c.romanian_translation || '').substring(0, 150)}...</p>
      </div>
    `).join('');

    showSection('view');
  } catch (error) {
    console.error('Error searching:', error);
    alert('Eroare la c\u0103utarea comentariilor');
  }
}
