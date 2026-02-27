/*  MAIN JAVASCRIPT - SAFE ROW EXIM */

// Mobile Menu Toggle
window.toggleMenu = function () {
    const nav = document.getElementById('mainNav');
    const menuBtnIcon = document.querySelector('.mobile-menu-btn i');
    const body = document.body;

    if (!nav) return;

    nav.classList.toggle('active');
    const isActive = nav.classList.contains('active');

    if (isActive) {
        body.classList.add('menu-open');
    } else {
        body.classList.remove('menu-open');
    }

    if (menuBtnIcon) {
        if (isActive) {
            menuBtnIcon.classList.remove('fa-bars');
            menuBtnIcon.classList.add('fa-xmark');
        } else {
            menuBtnIcon.classList.remove('fa-xmark');
            menuBtnIcon.classList.add('fa-bars');
        }
    }
}

// Close menu when clicking links or outside
document.addEventListener('click', (e) => {
    const nav = document.getElementById('mainNav');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const menuBtnIcon = document.querySelector('.mobile-menu-btn i');
    const isMobile = window.innerWidth <= 1024;

    if (!nav || !menuBtn) return;

    // Detect click targets
    const dropdownTrigger = e.target.closest('.dropdown-parent > a');
    const dropdownSubLink = e.target.closest('.header-dropdown-menu a');
    const regularLink = e.target.closest('#mainNav a:not(.dropdown-parent > a):not(.header-dropdown-menu a)');
    const isOutside = !nav.contains(e.target) && !menuBtn.contains(e.target) && nav.classList.contains('active');

    // MOBILE specific logic
    if (isMobile) {
        // 1. If clicking the 'Products' parent - toggle dropdown
        if (dropdownTrigger) {
            e.preventDefault();
            const parent = dropdownTrigger.closest('.dropdown-parent');
            parent.classList.toggle('dropdown-open');
            return; // Don't close the main menu
        }

        // 2. If clicking a sub-link or a regular link - close menu
        if (dropdownSubLink || regularLink || isOutside) {
            nav.classList.remove('active');
            document.body.classList.remove('menu-open');

            // Reset dropdowns for next time
            document.querySelectorAll('.dropdown-parent').forEach(p => p.classList.remove('dropdown-open'));

            if (menuBtnIcon) {
                menuBtnIcon.classList.remove('fa-xmark');
                menuBtnIcon.classList.add('fa-bars');
            }
        }
    }
    // DESKTOP specific logic
    else {
        if (isOutside) {
            nav.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    }
});

// Safety Check on Resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
        document.body.classList.remove('menu-open');
        const nav = document.getElementById('mainNav');
        if (nav) nav.classList.remove('active');

        const menuBtnIcon = document.querySelector('.mobile-menu-btn i');
        if (menuBtnIcon) {
            menuBtnIcon.classList.remove('fa-xmark');
            menuBtnIcon.classList.add('fa-bars');
        }
    }
});

// --- UPDATED LOAD HEADER FUNCTION ---
function loadHeader() {
    const headerHTML = `
    <!-- Header Container -->
    <header class="main-header">
        <!-- Top Bar -->
        <div class="top-bar">
            <div class="container">
                <div class="tagline">Where Trust Begins</div>
                <div class="contact-header">
                    <span><i class="fa-regular fa-envelope"></i> contact@saferowexim.com</span>
                    <span><i class="fa-solid fa-phone"></i> +91 72010 83853</span>
                </div>
            </div>
        </div>

        <!-- Main Nav Bar Wrapper -->
        <div class="header-nav-wrapper">
            <div class="container header-inner">
                <a href="index.html">
                    <img src="images/logo-header.webp" alt="Safe Row Exim Logo" class="header-logo">
                </a>

                <nav id="mainNav">
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="about.html">About Us</a></li>
                        <li class="dropdown-parent">
                            <a href="products.html">Products <i class="fa-solid fa-chevron-down" style="font-size: 10px; margin-left: 4px; transition: transform 0.3s ease;"></i></a>
                            <ul class="header-dropdown-menu">
                                <li><a href="products.html?category=health">Healthcare Solutions</a></li>
                                <li><a href="products.html?category=pulses">Agro-Commodities (Pulses)</a></li>
                                <li><a href="products.html?category=spices">Agro-Spices</a></li>
                                <li><a href="products.html?category=other">Other Agro Products</a></li>
                            </ul>
                        </li>
                        <li><a href="contact.html" class="nav-cta">Get A Quote</a></li>
                    </ul>
                </nav>

                <div class="mobile-menu-btn" onclick="toggleMenu()">
                    <i class="fa-solid fa-bars"></i>
                </div>
            </div>
        </div>
    </header>
    `;

    const headerElement = document.getElementById('header-placeholder');
    if (headerElement) {
        headerElement.innerHTML = headerHTML;
        highlightActiveLink();
    }
}

function highlightActiveLink() {
    const pathName = window.location.pathname.split('/').pop() || 'index.html';
    const searchParam = window.location.search;
    const fullRelativePath = pathName + searchParam;

    const navLinks = document.querySelectorAll('#mainNav ul li a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('active');

        // Check for exact match first
        if (href === fullRelativePath) {
            link.classList.add('active');
        }
        // Special case for Products dropdown: if we are on products.html, the main link should be active
        else if (pathName === 'products.html' && href === 'products.html') {
            link.classList.add('active');
        }
        // Base page match (e.g., index.html without params)
        else if (href === pathName && !href.includes('?')) {
            link.classList.add('active');
        }
    });

    // Also highlight dropdown items if they match the query exactly
    const dropdownLinks = document.querySelectorAll('.header-dropdown-menu li a');
    dropdownLinks.forEach(link => {
        if (link.getAttribute('href') === fullRelativePath) {
            link.classList.add('active');
        }
    });
}

// --- UPDATED LOAD FOOTER FUNCTION ---
function loadFooter() {
    const footerHTML = `
        <footer class="app-footer">
        <div class="footer-bg-svg-wrapper">
            <svg viewBox="0 0 2400 500" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="350">SAFE ROW EXIM</text>
            </svg>
        </div>
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand-col">
                    <div class="footer-logo">
                        <img src="images/Gemini_Generated_Image_bnhy18bnhy18bnhy.webp" alt="Safe Row Logo" style="height: 50px;">
                    </div>
                    <p>Safe Row Exim: Bridging global markets with premium agro-commodities and certified healthcare solutions.</p>
                    <div class="social-links-square">
                        <a href="https://www.facebook.com/profile.php?id=61565407442612"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.instagram.com/saferowexim/"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/company/safe-row/"><i class="fab fa-linkedin-in"></i></a>
                        <a href="https://x.com/SafeRowExim"><i class="fab fa-x-twitter"></i></a>
                        <a href="https://www.youtube.com/@SafeRowExim"><i class="fab fa-youtube"></i></a>
                    </div>
                </div>

                <div class="footer-links-col">
                    <h3>Links</h3>
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="about.html">About Us</a></li>
                        <li><a href="products.html">Products</a></li>
                    </ul>
                </div>

                <div class="footer-contact-col">
                    <h3>Contact Us</h3>
                    <ul>
                        <li>+91 72010 83853</li>
                        <li>contact@saferowexim.com</li>
                        <li>A-708, Titanium City Center,<br>100 Feet Anand Nagar Rd, near sachin tower,<br>Ahmedabad, Gujarat 380015</li>
                    </ul>
                </div>

                <div class="footer-cta-col">
                    <h3>Have Question<br>In Mind?</h3>
                    <a href="https://wa.me/917201083853" class="whatsapp-btn">
                        <i class="fab fa-whatsapp"></i> TALK TO US IN WHATSAPP
                    </a>
                </div>
            </div>

            <div class="footer-bottom-line">
                <p>&copy; 2025 Safe Row Exim. All Rights Reserved.</p>
                <div class="footer-legal">
                    <a href="privacy-policy.html" target="_blank">Privacy Policy</a>
                    <a href="terms-conditions.html" target="_blank">Terms & Conditions</a>
                </div>
            </div>
        </div>
    </footer>
        `;

    const footerElement = document.getElementById('footer-placeholder');
    if (footerElement) {
        footerElement.innerHTML = footerHTML;
    }
}

// Counter Animation Logic
function initCounterAnimation() {
    const stats = document.querySelectorAll('.stat-number');
    const speed = 700; // Higher is slower

    const animate = (el) => {
        const target = +el.getAttribute('data-target');
        const count = +el.innerText;
        const inc = target / speed;

        if (count < target) {
            el.innerText = Math.ceil(count + inc);
            setTimeout(() => animate(el), 1);
        } else {
            el.innerText = target + "+";
        }
    };

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                animate(el);
                observer.unobserve(el);
            }
        });
    }, observerOptions);

    stats.forEach(stat => {
        observer.observe(stat);
    });
}

// Ensure the header and footer load
window.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadFooter();
    initCounterAnimation();
});

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header && window.scrollY > 50) {
        header.classList.add('scrolled');
    } else if (header) {
        header.classList.remove('scrolled');
    }
});

// Team Section Interaction (About Page)
document.addEventListener('DOMContentLoaded', () => {
    const teamItems = document.querySelectorAll('.team-img-item');
    const infoName = document.getElementById('infoName');
    const infoRole = document.getElementById('infoRole');
    const infoDesc = document.getElementById('infoDesc');
    const detailBox = document.getElementById('teamDetailBox');

    if (teamItems.length > 0 && infoName && detailBox) {
        teamItems.forEach(item => {
            item.addEventListener('click', function () {
                teamItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');

                const name = this.getAttribute('data-name');
                const role = this.getAttribute('data-role');
                const desc = this.getAttribute('data-desc');

                detailBox.classList.remove('fade-in');
                void detailBox.offsetWidth; // Trigger reflow

                infoName.innerText = name;
                infoRole.innerText = role;
                infoDesc.innerText = desc;

                detailBox.classList.add('fade-in');
            });
        });
    }
});

// EmailJS Configuration
(function () {
    emailjs.init("3gCnXifY5Lkf0b54E");
})();

let currentForm = null;

function sendMail(event) {
    if (event) event.preventDefault();
    currentForm = event ? event.target : null;
    processEmailSending();
}

async function processEmailSending() {
    if (!currentForm) return;

    const submitBtn = currentForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;

    try {
        // Replace "YOUR_SERVICE_ID" and "YOUR_TEMPLATE_ID" with your actual IDs from EmailJS dashboard
        await emailjs.sendForm("service_xmv5o5p", "template_cldcty4", currentForm);

        alert("Thank you! Your inquiry has been sent successfully.");
        currentForm.reset();
    } catch (err) {
        console.error("EmailJS Error:", err);
        alert("Oops! Something went wrong. Please try again later.");
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}


