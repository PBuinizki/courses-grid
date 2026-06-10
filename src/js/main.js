// ---- STATE ----
let allCourses = [];
let filteredCourses = [];
let currentCategory = 'all';
let currentSearch = '';
let visibleCount = 6;
const loadAmount = 6;

// ---- DOM Elements ----
const skeletonTabs = document.getElementById('skeletonTabs');
const tabsContainer = document.getElementById('tabsContainer');
const skeletonCourses = document.getElementById('skeletonCourses');
const coursesGrid = document.getElementById('coursesGrid');
const loadMoreBtn = document.getElementById('loadMore');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// ---- Helper: escape HTML ----
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ---- Get category display name ----
function getCategoryDisplayName(cat) {
    const names = {
        'marketing': 'Marketing',
        'management': 'Management',
        'hr': 'HR & Recruting',
        'design': 'Design',
        'development': 'Development'
    };
    return names[cat] || cat;
}

// ---- Render courses (real) ----
function renderCourses() {
    const coursesToShow = filteredCourses.slice(0, visibleCount);

    if (coursesToShow.length === 0) {
        coursesGrid.innerHTML = '<div class="courses__empty">No courses found</div>';
        loadMoreBtn.style.display = 'none';
        return;
    }

    coursesGrid.innerHTML = coursesToShow.map(course => {
        const hasImage = course.image && course.image.trim() !== '';
        const imgHtml = hasImage
            ? `<img src="${course.image}" alt="${escapeHtml(course.name)}" class="card__img">`
            : `<div class="card__img card__img--placeholder" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>`;
        
        return `
            <div class="courses__card card">
                <div class="card__img-wr">
                    ${imgHtml}
                </div>
                <div class="card__body">
                    <div class="card__badges-wr">
                        <span class="card__badge badge badge-${course.category}">${getCategoryDisplayName(course.category)}</span>
                    </div>
                    <h3 class="card__title">${escapeHtml(course.name)}</h3>
                    <div class="card__bottom">
                        <span class="card__price"><span class="card__currency">$</span>${course.price}</span>
                        <span class="card__author">by <span class="author">${escapeHtml(course.author)}</span></span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Show/hide Load more button
    if (visibleCount >= filteredCourses.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }
}

// ---- Update category counters in tabs ----
function updateCategoryCounts() {
    const counts = {
        all: allCourses.length,
        marketing: allCourses.filter(c => c.category === 'marketing').length,
        management: allCourses.filter(c => c.category === 'management').length,
        hr: allCourses.filter(c => c.category === 'hr').length,
        design: allCourses.filter(c => c.category === 'design').length,
        development: allCourses.filter(c => c.category === 'development').length
    };

    document.getElementById('count-all').textContent = counts.all;
    document.getElementById('count-marketing').textContent = counts.marketing;
    document.getElementById('count-management').textContent = counts.management;
    document.getElementById('count-hr').textContent = counts.hr;
    document.getElementById('count-design').textContent = counts.design;
    document.getElementById('count-development').textContent = counts.development;
}

// ---- Apply filters (category + search) ----
function applyFilters() {
    let result = [...allCourses];

    if (currentCategory !== 'all') {
        result = result.filter(course => course.category === currentCategory);
    }

    if (currentSearch.trim() !== '') {
        const searchLower = currentSearch.toLowerCase();
        result = result.filter(course =>
            course.name.toLowerCase().includes(searchLower)
        );
    }

    filteredCourses = result;
    visibleCount = loadAmount;
    renderCourses();
}

// ---- Load more ----
function loadMore() {
    visibleCount += loadAmount;
    renderCourses();
}

// ---- Event: tabs (radio buttons) ----
function initTabs() {
    const radios = document.querySelectorAll('.tabs__radio');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            applyFilters();
        });
    });
}

// ---- Event: search (input + button) ----
function initSearch() {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = e.target.value;
            applyFilters();
        }, 300);
    });

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            currentSearch = searchInput.value;
            applyFilters();
        });
    }
}

// ---- Load data from JSON and hide skeletons ----
async function loadData() {
    try {
        const response = await fetch('./js/data.json');
        const data = await response.json();
        allCourses = data.courses;
        filteredCourses = [...allCourses];

        // Update counters
        updateCategoryCounts();

        // Hide skeletons, show real content
        skeletonTabs.style.display = 'none';
        tabsContainer.style.display = 'flex';
        skeletonCourses.style.display = 'none';
        coursesGrid.style.display = 'flex';

        // Initialize tabs event listeners (after they become visible)
        initTabs();

        // Render first batch
        renderCourses();

        // If total courses <= loadAmount, hide load more button
        if (filteredCourses.length <= loadAmount) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        skeletonCourses.innerHTML = '<div class="error">Failed to load courses. Please refresh the page.</div>';
    }
}

// ---- Initialize everything ----
initSearch();
loadMoreBtn.addEventListener('click', loadMore);
loadData();