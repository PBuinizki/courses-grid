// ---- DATA  ----
import img1 from '/assets/card/image-8.jpg';
import img2 from '/assets/card/image-7.jpg';
import img3 from '/assets/card/image-6.jpg';
import img4 from '/assets/card/image-5.jpg';
import img5 from '/assets/card/image-4.jpg';
import img6 from '/assets/card/image-3.jpg';
import img7 from '/assets/card/image-2.jpg';
import img8 from '/assets/card/image-1.jpg';
import img9 from '/assets/card/image.jpg';

const coursesData = {
  "courses": [
    { "id": 1, "name": "The Ultimate Google Ads Training Course", "category": "marketing", "author": "Jerome Bell", "price": 100, "image": img1 },
    { "id": 2, "name": "Product Management Fundamentals", "category": "management", "author": "Marvin McKinney", "price": 480, "image": img2 },
    { "id": 3, "name": "HR Management and Analytics", "category": "hr", "author": "Leslie Alexander Li", "price": 200, "image": img3 },
    { "id": 4, "name": "Brand Management & PR Communications", "category": "marketing", "author": "Kristin Watson", "price": 530, "image": img4 },
    { "id": 5, "name": "Graphic Design Basic", "category": "design", "author": "Guy Hawkins", "price": 500, "image": img5 },
    { "id": 6, "name": "Business Development Management", "category": "management", "author": "Dianne Russell", "price": 400, "image": img6 },
    { "id": 7, "name": "Highload Software Architecture", "category": "development", "author": "Brooklyn Simmons", "price": 600, "image": img7 },
    { "id": 8, "name": "Human Resources – Selection and Recruitment", "category": "hr", "author": "Kathryn Murphy", "price": 150, "image": img8 },
    { "id": 9, "name": "User Experience. Human-centered Design", "category": "design", "author": "Cody Fisher", "price": 240, "image": img9 },
    { "id": 10, "name": "Social Media Marketing Masterclass", "category": "marketing", "author": "Emily Johnson", "price": 420, "image": "" },
    { "id": 11, "name": "SEO for Beginners", "category": "marketing", "author": "Michael Brown", "price": 380, "image": "" },
    { "id": 12, "name": "Agile Project Management", "category": "management", "author": "Robert Fox", "price": 550, "image": "" },
    { "id": 13, "name": "HR Digital Transformation", "category": "hr", "author": "Natalya Krylova", "price": 429, "image": "" },
    { "id": 14, "name": "Talent Management Strategies", "category": "hr", "author": "Olivia Wilson", "price": 300, "image": "" },
    { "id": 15, "name": "Compensation and Benefits", "category": "hr", "author": "William Davis", "price": 275, "image": "" },
    { "id": 16, "name": "Full Stack JavaScript", "category": "development", "author": "Jacob Jones", "price": 720, "image": "" },
    { "id": 17, "name": "Python for Data Science", "category": "development", "author": "Jane Cooper", "price": 680, "image": "" }
  ]
};

// ---- STATE ----
let allCourses = coursesData.courses;
let filteredCourses = [...allCourses];
let currentCategory = 'all';
let currentSearch = '';
let visibleCount = 9;
const loadAmount = 9;
let isLoading = false;
let filterTimeout = null;

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

// ---- Показать скелетоны карточек временно, скрыть реальную сетку и кнопку ----
function showSkeletons() {
    if (skeletonCourses) skeletonCourses.style.display = 'flex';
    if (coursesGrid) coursesGrid.style.display = 'none';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
}

// ---- Скрыть скелетоны, показать реальную сетку ----
function hideSkeletons() {
    if (skeletonCourses) skeletonCourses.style.display = 'none';
    if (coursesGrid) coursesGrid.style.display = 'flex';
}

// ---- Генерация табов ----
function generateTabs() {
    if (!tabsContainer) return;
    const categories = ['all', 'marketing', 'management', 'hr', 'design', 'development'];
    const categoryNames = {
        'all': 'All',
        'marketing': 'Marketing',
        'management': 'Management',
        'hr': 'HR & Recruting',
        'design': 'Design',
        'development': 'Development'
    };
    tabsContainer.innerHTML = '';
    categories.forEach(cat => {
        const tabItem = document.createElement('div');
        tabItem.className = 'tabs__item';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'category';
        radio.id = `tab-${cat}`;
        radio.value = cat;
        radio.className = 'tabs__radio';
        if (cat === 'all') radio.checked = true;
        const label = document.createElement('label');
        label.htmlFor = `tab-${cat}`;
        label.className = 'tabs__label';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'tabs__name';
        nameSpan.textContent = categoryNames[cat];
        const countSup = document.createElement('sup');
        countSup.className = 'tabs__count';
        countSup.id = `count-${cat}`;
        countSup.textContent = '0';
        label.appendChild(nameSpan);
        label.appendChild(countSup);
        tabItem.appendChild(radio);
        tabItem.appendChild(label);
        tabsContainer.appendChild(tabItem);
    });
}

// ---- Рендер реальных карточек ----
function renderCourses() {
    if (!coursesGrid) return;
    const coursesToShow = filteredCourses.slice(0, visibleCount);
    if (coursesToShow.length === 0) {
        coursesGrid.innerHTML = '<div class="courses__empty">No courses found</div>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    coursesGrid.innerHTML = coursesToShow.map(course => {
        const hasImage = course.image && course.image.trim() !== '';
        const imgHtml = hasImage
            ? `<img src="${course.image}" alt="${escapeHtml(course.name)}" class="card__img">`
            : `<img class="card__img">`;
        return `
            <div class="courses__card card">
                <div class="card__img-wr">${imgHtml}</div>
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
    if (loadMoreBtn) {
        if (visibleCount >= filteredCourses.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    }
}

// ---- Обновить счётчики ----
function updateCategoryCounts() {
    const counts = {
        all: allCourses.length,
        marketing: allCourses.filter(c => c.category === 'marketing').length,
        management: allCourses.filter(c => c.category === 'management').length,
        hr: allCourses.filter(c => c.category === 'hr').length,
        design: allCourses.filter(c => c.category === 'design').length,
        development: allCourses.filter(c => c.category === 'development').length
    };
    const categories = ['all', 'marketing', 'management', 'hr', 'design', 'development'];
    categories.forEach(cat => {
        const el = document.getElementById(`count-${cat}`);
        if (el) el.textContent = counts[cat];
    });
}

// ---- Применить фильтры (с анимацией скелетонов) ----
function applyFilters() {
    if (filterTimeout) clearTimeout(filterTimeout);
    // Показать скелетоны, скрыть реальную сетку и кнопку
    showSkeletons();
    filterTimeout = setTimeout(() => {
        let result = [...allCourses];
        if (currentCategory !== 'all') {
            result = result.filter(course => course.category === currentCategory);
        }
        if (currentSearch.trim() !== '') {
            const searchLower = currentSearch.toLowerCase();
            result = result.filter(course => course.name.toLowerCase().includes(searchLower));
        }
        filteredCourses = result;
        visibleCount = loadAmount;
        renderCourses();
        hideSkeletons(); // после рендера показываем реальные карточки
        filterTimeout = null;
    }, 280); // небольшая задержка для плавности
}

// ---- Load more ----
async function loadMore() {
    if (isLoading) return;
    isLoading = true;
    if (loadMoreBtn) loadMoreBtn.classList.add('active');
    await new Promise(resolve => setTimeout(resolve, 200));
    visibleCount += loadAmount;
    renderCourses();
    if (loadMoreBtn) loadMoreBtn.classList.remove('active');
    isLoading = false;
}

// ---- Инициализация обработчиков табов ----
function initTabs() {
    const radios = document.querySelectorAll('.tabs__radio');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            applyFilters();
        });
    });
}

// ---- Инициализация поиска ----
function initSearch() {
    if (!searchInput) return;
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

// ---- Основная инициализация ----
function init() {
    generateTabs();
    updateCategoryCounts();
    initTabs();
    // Прячем скелетоны табов (они больше не нужны, табы уже сгенерированы)
    if (skeletonTabs) skeletonTabs.style.display = 'none';
    if (tabsContainer) tabsContainer.style.display = 'flex';
    // Скелетоны карточек пока оставляем видимыми до первого рендера
    renderCourses();
    // После рендера скрываем скелетоны карточек, показываем реальную сетку
    hideSkeletons();
    if (loadMoreBtn) {
        if (filteredCourses.length <= loadAmount) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
        }
    }
}

// ---- Старт ----
initSearch();
if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMore);
init();