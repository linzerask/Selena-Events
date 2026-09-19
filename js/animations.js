document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initAnimations, 100);
});

function initAnimations() {
    // 1. Initial Page Load Animation
    const tl = anime.timeline({
        easing: 'easeOutExpo'
    });

    // Animate Header
    tl.add({
        targets: 'nav',
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 1000
    });

    // Animate Hero Content
    tl.add({
        targets: '.animate-fade-up',
        translateY: [30, 0],
        opacity: [0, 1],
        delay: anime.stagger(150),
        duration: 1000
    }, '-=500');

    // 2. Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('scroll-stagger-group')) {
                    const children = entry.target.querySelectorAll('.stagger-item');
                    anime({
                        targets: children,
                        translateY: [30, 0],
                        opacity: [0, 1],
                        easing: 'easeOutExpo',
                        duration: 1000,
                        delay: anime.stagger(100)
                    });
                } else {
                    anime({
                        targets: entry.target,
                        translateY: [30, 0],
                        opacity: [0, 1],
                        easing: 'easeOutExpo',
                        duration: 1000
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-animate').forEach(el => scrollObserver.observe(el));
    document.querySelectorAll('.scroll-stagger-group').forEach(el => scrollObserver.observe(el));
}
