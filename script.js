// script.js - Dynamic functionality for CV website

// Modal variables
let modal = null;
let modalImg = null;
let closeBtn = null;
let prevBtn = null;
let nextBtn = null;
let currentImageIndex = 0;
let images = [];

// Function for smooth scrolling to sections
function smoothScrollToSection(event) {
    event.preventDefault();
    const targetId = event.target.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Function to handle print
function printCV() {
    window.print();
}

// Modal functions
function openModal(index) {
    currentImageIndex = index;
    modalImg.src = images[currentImageIndex].src;
    modalImg.alt = images[currentImageIndex].alt;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    modalImg.src = images[currentImageIndex].src;
    modalImg.alt = images[currentImageIndex].alt;
}

function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    modalImg.src = images[currentImageIndex].src;
    modalImg.alt = images[currentImageIndex].alt;
}

function handleKeyDown(event) {
    if (modal.style.display === 'flex') {
        if (event.key === 'ArrowRight') {
            showNextImage();
        } else if (event.key === 'ArrowLeft') {
            showPrevImage();
        } else if (event.key === 'Escape') {
            closeModal();
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Print button
    const printButton = document.getElementById('printButton');
    if (printButton) {
        printButton.addEventListener('click', printCV);
    }

    // Smooth scrolling for nav links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(function(link) {
        link.addEventListener('click', smoothScrollToSection);
    });

    // Modal setup
    modal = document.getElementById('imageModal');
    modalImg = document.getElementById('modalImage');
    closeBtn = document.querySelector('.close');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');

    // Load gallery images dynamically
    loadGallery().then(foundImages => {
        images = foundImages;
        images.forEach(function(img, index) {
            img.addEventListener('click', function() {
                openModal(index);
            });
        });
    });


// function to load gallery images from /img directory
async function loadGallery() {
    const gallery = document.querySelector('.photo-gallery');
    const imageElements = [];
    const fallbackFiles = ['band1.jpg', 'band2.jpg', 'band3.jpg'];
    
    // try manifest first
    try {
        const manifestResp = await fetch('gallery.json');
        if (manifestResp.ok) {
            const list = await manifestResp.json();
            console.log('Loaded gallery manifest:', list);
            list.forEach(file => {
                const img = document.createElement('img');
                img.src = 'Img/' + file;
                img.alt = file;
                img.loading = 'lazy';
                gallery.appendChild(img);
                imageElements.push(img);
            });
            if (imageElements.length > 0) return imageElements;
        }
    } catch (e) {
        console.warn('Could not load gallery.json manifest:', e);
    }

    // if manifest fails or empty, fall back to directory listing
    try {
        const res = await fetch('Img/');
        if (!res.ok) throw new Error('Cannot fetch directory (perhaps running via file://?).');
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const anchors = doc.querySelectorAll('a');
        anchors.forEach(a => {
            const href = a.getAttribute('href');
            if (href.match(/\.(jpe?g|png|gif)$/i)) {
                const img = document.createElement('img');
                img.src = 'Img/' + href;
                img.alt = href;
                img.loading = 'lazy';
                gallery.appendChild(img);
                imageElements.push(img);
            }
        });
        if (imageElements.length > 0) {
            return imageElements;
        } else {
            throw new Error('No images found in directory listing');
        }
    } catch (err) {
        console.warn('Directory load failed, using fallback list:', err);
        fallbackFiles.forEach(file => {
            const img = document.createElement('img');
            img.src = 'Img/' + file;
            img.alt = file;
            img.loading = 'lazy';
            gallery.appendChild(img);
            imageElements.push(img);
        });
    }
    return imageElements;
}

    // Modal event listeners
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', showPrevImage);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', showNextImage);
    }
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyDown);

});

