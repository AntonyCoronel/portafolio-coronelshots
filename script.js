document.addEventListener('DOMContentLoaded', () => {
    // 1. Actualizar el año en el footer automáticamente
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Lógica para el Menú Hamburguesa (Mobile)
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Cambiar el ícono (barras a 'X')
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Cerrar menú al hacer clic en un enlace (útil en móviles)
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if(icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // 3. Efecto de la barra de navegación al hacer scroll (se hace más delgada)
    const navbar = document.getElementById('navbar');
    const navContainer = document.querySelector('.nav-container');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 15px rgba(92, 75, 51, 0.08)';
            navContainer.style.padding = '1rem 2rem';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            navContainer.style.padding = '1.5rem 2rem';
        }
    });

    // 4. Lógica de Tabs para la sección de Portafolio
    const tabBtns = document.querySelectorAll('.tab-btn');
    const galleries = document.querySelectorAll('.portfolio-gallery');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Quitar clase 'active' a todos los botones
            tabBtns.forEach(b => b.classList.remove('active'));
            // Agregar clase 'active' al botón seleccionado
            btn.classList.add('active');

            const targetId = btn.getAttribute('data-target');
            
            // Ocultar todas las galerías
            galleries.forEach(gallery => {
                gallery.classList.add('hidden');
                gallery.classList.remove('visible'); // Remover clase de animación
            });

            // Mostrar la galería correspondiente
            const targetGallery = document.getElementById(`gallery-${targetId}`);
            if (targetGallery) {
                targetGallery.classList.remove('hidden');
                
                // Pequeño retardo para que la transición CSS funcione correctamente
                // al quitar el display:none
                setTimeout(() => {
                    targetGallery.classList.add('visible');
                }, 50);
            }
        });
    });

    // 5. Animación "Fade-In" al hacer scroll (Scroll Reveal)
    const fadeElements = document.querySelectorAll('.fade-in');

    // Configuración del observer (cuándo se dispara la animación)
    const observerOptions = {
        threshold: 0.1, // Se dispara cuando el 10% del elemento es visible
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Dejar de observar una vez que ya apareció
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // 6. Lógica del formulario de contacto (Usando Mailto por JavaScript)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Evitamos que la página se recargue
            
            const nombre = document.getElementById('form-name').value;
            const correo = document.getElementById('form-email').value;
            const mensaje = document.getElementById('form-message').value;
            
            // Construimos el enlace para abrir la aplicación de correo
            const subject = encodeURIComponent(`Nuevo mensaje de ${nombre} desde el portafolio`);
            const body = encodeURIComponent(`Nombre: ${nombre}\nCorreo: ${correo}\n\nMensaje:\n${mensaje}`);
            
            // Abrimos el cliente de correo predeterminado del usuario
            window.location.href = `mailto:coroneljoseantonio06@gmail.com?subject=${subject}&body=${body}`;
        });
    }
});

// ==========================================
// 7. Lógica Global del Modal y Carruseles
// ==========================================
let currentSlides = {
    'social': 0,
    'retrato': 0,
    'producto': 0,
    'especial': 0
};

window.openModal = function(categoryId) {
    const modal = document.getElementById('photoModal');
    const carousels = document.querySelectorAll('.carousel-container');
    
    // Ocultar todos los carruseles
    carousels.forEach(c => c.classList.add('hidden'));
    
    // Mostrar el carrusel clickeado
    const targetCarousel = document.getElementById(`carousel-${categoryId}`);
    if (targetCarousel) {
        targetCarousel.classList.remove('hidden');
        showSlide(currentSlides[categoryId], categoryId);
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevenir scroll de la página
};

window.closeModal = function() {
    const modal = document.getElementById('photoModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restaurar scroll
};

window.changeSlide = function(step, categoryId) {
    currentSlides[categoryId] += step;
    showSlide(currentSlides[categoryId], categoryId);
};

function showSlide(index, categoryId) {
    const carousel = document.getElementById(`carousel-${categoryId}`);
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;
    
    if (index >= slides.length) { currentSlides[categoryId] = 0; }
    if (index < 0) { currentSlides[categoryId] = slides.length - 1; }
    
    slides.forEach(slide => slide.classList.remove('active'));
    slides[currentSlides[categoryId]].classList.add('active');
}

// Cerrar modal al hacer clic fuera del contenido
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
});
