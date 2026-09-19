const blogList = document.getElementById('blog-list');
const modal = document.getElementById('blog-modal');
const modalOverlay = document.getElementById('blog-modal-overlay');
const closeBtn = document.getElementById('blog-modal-close');
const modalContent = document.getElementById('blog-modal-content');

function renderBlogs() {
    if (!blogList) return;
    blogList.innerHTML = '';
    blogs.forEach((blog, index) => {
        const article = document.createElement('article');
        article.className = 'flex flex-col md:flex-row gap-8 items-center bg-white p-6 shadow-sm hover:shadow-md transition-shadow stagger-item cursor-pointer';
        article.onclick = () => window.location.href = blog.link;
        
        article.innerHTML = `
            <div class="md:w-5/12 overflow-hidden aspect-[4/3] w-full">
                <img src="${blog.img}" alt="${blog.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
            </div>
            <div class="md:w-7/12">
                <span class="text-xs font-semibold tracking-widest text-gold uppercase mb-2 block">Journal</span>
                <h2 class="text-2xl font-serif mb-3"><a href="javascript:void(0)" class="hover:text-gold transition-colors">${blog.title}</a></h2>
                <p class="text-gray-500 font-light mb-4 text-sm leading-relaxed">${blog.excerpt}</p>
                <span class="text-gold text-sm uppercase tracking-wider font-semibold hover:text-gray-800 transition-colors">Story lesen &rarr;</span>
            </div>
        `;
        blogList.appendChild(article);
    });
}


if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

// Initialize
renderBlogs();
