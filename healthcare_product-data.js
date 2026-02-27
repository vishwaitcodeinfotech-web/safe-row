/**
 * SafeRow Exim - Google Sheet Data Loader
 */

const SHEET_ID = '17DTo1MdiHcHx-CTCK-g0_WS9nL1TmWvv';
const SHEET_GID = '309524638';
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQLYvusFtlGswKHD37kDCa0UCrI8TUIuDOKNyve0F9xZATkj3u-XUAH1H3KWp-fjQ/pub?output=csv';

/**
 * Global variable for fallback products.
 * Loaded from healthcare-product-data.js
 */
const FALLBACK_PRODUCTS = typeof HEALTHCARE_PRODUCTS !== 'undefined' ? HEALTHCARE_PRODUCTS : [];

async function fetchProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            console.warn("products.json not found. Using fallback data.");
            return FALLBACK_PRODUCTS;
        }
        const products = await response.json();

        if (!products || products.length === 0) {
            console.warn('products.json returned 0 products. Using fallback data.');
            return FALLBACK_PRODUCTS;
        }
        return products;

    } catch (error) {
        console.error('Error loading products from products.json:', error);
        return FALLBACK_PRODUCTS;
    }
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const result = [];
    if (lines.length === 0) return result;

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const obj = {};
        const currentLine = parseCSVLine(lines[i]);

        headers.forEach((header, index) => {
            if (currentLine[index] !== undefined) {
                obj[header] = currentLine[index].trim();
            }
        });
        result.push(obj);
    }
    return result;
}

function parseCSVLine(text) {
    const result = [];
    let startValueIndex = 0;
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        if (text[i] === '"') {
            inQuotes = !inQuotes;
        } else if (text[i] === ',' && !inQuotes) {
            let val = text.substring(startValueIndex, i).trim();
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1);
            }
            result.push(val.replace(/""/g, '"'));
            startValueIndex = i + 1;
        }
    }
    let lastVal = text.substring(startValueIndex).trim();
    if (lastVal.startsWith('"') && lastVal.endsWith('"')) {
        lastVal = lastVal.substring(1, lastVal.length - 1);
    }
    result.push(lastVal.replace(/""/g, '"'));

    return result;
}

function renderProductGrid(products, containerId = 'product-grid') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.add('product-grid');

    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; color: #BB0D0F; margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px;">Products Not Loaded</h3>
                <p>We couldn't fetch the product list.</p>
            </div>
        `;
        return;
    }

    // Keep reference to the products being rendered for modal access
    window.currentGridProducts = products;

    container.innerHTML = products.map((product, index) => {
        const isAgro = product.category && product.category.toLowerCase().includes('agro');

        return `
        <div class="product-card ${isAgro ? 'agro' : 'health'}" onclick="openProductModal(${index})">
            <div class="product-img">
                <img src="${product.image || 'images/placeholder.jpg'}" alt="${product.title || 'Product'}" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
                <div class="img-overlay"></div>
            </div>
            <div class="product-info">
                <span class="category-tag">${product.category || 'General'}</span>
                <h4>${product.title || 'Product Name'}</h4>
            </div>
        </div>
    `}).join('');
}

// Modal Control Functions
window.openProductModal = function (index) {
    const products = window.currentGridProducts || [];
    const product = products[index];
    if (!product) return;

    const modal = document.getElementById('productModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');
    const modalDescription = document.getElementById('modalDescription');

    // Select containers
    const specsGrid = document.getElementById('modalSpecsGrid');
    const pkgMain = document.getElementById('modalPkgMain');
    const pkgSub = document.getElementById('modalPkgSub');
    const pkgDetails = document.getElementById('modalPkgDetails');
    const shippingList = document.getElementById('modalShippingList');
    const complianceGrid = document.getElementById('modalComplianceGrid');

    // Basic Info
    modalImage.src = product.image || 'images/placeholder.jpg';
    modalTitle.textContent = product.title || 'Product Name';
    modalCategory.textContent = product.category || 'General';
    modalDescription.textContent = product.description || 'No description available.';

    const isAgro = product.category && product.category.toLowerCase().includes('agro');
    const isSpice = product.category && product.category.toLowerCase().includes('spice');

    // 1. CLEAR PREVIOUS
    specsGrid.innerHTML = '';
    pkgDetails.innerHTML = '';
    shippingList.innerHTML = '';
    complianceGrid.innerHTML = '';

    // 2. SPECS POPULATION
    const specs = [];
    if (isAgro) {
        specs.push({ label: 'Purity', value: product.Purity || product.purity || '99%' });
        specs.push({ label: 'Moisture', value: product.Moisture || product.moisture || '<12%' });

        if (isSpice) {
            specs.push({ label: 'No artificial color', value: product['artificial color or preservatives'] || 'No' });
            specs.push({ label: 'Admixture', value: product.Admixture || '1%' });
        }

        const domestic = product.Domestic || '-';
        const exportVal = product.Export || '-';
        specs.push({ label: 'Domestic / Export', value: `${domestic} / ${exportVal}` });
        specs.push({ label: 'Shelf Life', value: product['Shelf Life'] || '12-24 Months' });
    } else {
        if (product.spec_material) specs.push({ label: 'Material', value: product.spec_material });
        if (product.spec_size) specs.push({ label: 'Sizes', value: product.spec_size });
        if (product.spec_type) specs.push({ label: 'Type', value: product.spec_type });
        if (product.spec_sterilization) specs.push({ label: 'Sterilization', value: product.spec_sterilization });
        if (product['Self-Life']) specs.push({ label: 'Shelf Life', value: product['Self-Life'] });
    }

    specs.forEach(s => {
        specsGrid.innerHTML += `
            <div class="spec-box">
                <span class="label">${s.label}</span>
                <span class="value">${s.value}</span>
            </div>`;
    });

    // 3. PACKAGING
    pkgMain.textContent = product.Packaging || product.packaging || 'Standard Export Quality';
    pkgSub.textContent = isAgro ? 'Standard export quality packaging' : 'Inner Packaging';

    const pDetails = [];
    if (isAgro) {
        pDetails.push({ label: 'Inner Packaging', value: product.packaging_inner || '100g, 500g, 1kg' });
        pDetails.push({ label: 'Outer Container', value: 'PP / Jute Bags' });
        pDetails.push({ label: 'Fumigation', value: product['Fumigation & Phytosanitary available'] || 'Available' });
    } else {
        if (product['Pack Qty (pcs/box)']) pDetails.push({ label: 'Pack Qty', value: product['Pack Qty (pcs/box)'] });
        if (product['Sterile Pack']) pDetails.push({ label: 'Sterile Pack', value: product['Sterile Pack'] });
        if (product['Box Per Carton']) pDetails.push({ label: 'Box Per Carton', value: product['Box Per Carton'] });
        if (product.pack_dims) pDetails.push({ label: 'Carton Dims', value: product.pack_dims });
    }

    pDetails.forEach(pd => {
        pkgDetails.innerHTML += `<div class="p-row"><span>${pd.label}:</span> <strong>${pd.value}</strong></div>`;
    });

    // 4. SHIPPING
    const shipItems = [];
    if (isAgro) {
        shipItems.push({ icon: 'fa-location-dot', label: 'Origin', value: product.Origin || 'India' });
    }
    shipItems.push({ icon: 'fa-barcode', label: 'HS Code', value: product.shipping_hscode || product.hscode || product['HS Code'] || '-' });
    shipItems.push({ icon: 'fa-ship', label: 'Capacity', value: product.shipping_capacity || product.Capacity || 'High Volume' });

    if (product.shipping_port || product.Port) {
        shipItems.push({ icon: 'fa-anchor', label: 'Port', value: product.shipping_port || product.Port });
    }

    shipItems.forEach(si => {
        shippingList.innerHTML += `
            <div class="ship-item">
                <div class="s-left"><i class="fa-solid ${si.icon}"></i> <span>${si.label}</span></div>
                <div class="s-value">${si.value}</div>
            </div>`;
    });

    // 5. COMPLIANCE
    let certsList = [];
    if (product.category && product.category.toLowerCase().includes('health')) {
        certsList = ["CE Certified", "ISO 13485", "ISO 9001", "Biocompatibility Test", "Sterilization Cert.", "MSDS Available"];
    } else {
        const certsStr = product.certifications || (isSpice ? "FSSAI, Spices Board, ISO 9001" : "ISO 9001, FSSAI");
        certsList = certsStr.split(',').map(c => c.trim()).filter(c => c !== "");
    }

    certsList.forEach(cert => {
        complianceGrid.innerHTML += `
            <div class="cert-tag">
                <i class="fa-solid fa-file-circle-check"></i>
                <span>${cert}</span>
            </div>`;
    });

    // Show modal
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');

    // 6. VARIANTS TABLE
    const variantsSection = document.getElementById('modalVariantsSection');
    const vHead = document.getElementById('modalVariantsHead');
    const vBody = document.getElementById('modalVariantsBody');

    if (product.variants_data && product.variants_data.trim() !== "") {
        variantsSection.style.display = 'block';
        vHead.innerHTML = '';
        vBody.innerHTML = '';

        const rows = product.variants_data.split(';');
        rows.forEach((row, idx) => {
            const cols = row.split(',').map(c => c.trim());
            const tr = document.createElement('tr');

            if (idx === 0) {
                // Header row
                cols.forEach(col => {
                    const th = document.createElement('th');
                    th.textContent = col;
                    tr.appendChild(th);
                });
                vHead.appendChild(tr);
            } else {
                // Data row
                cols.forEach((col, colIdx) => {
                    const td = document.createElement('td');
                    const lowerText = col.toLowerCase();
                    // Special color highlighting for medical gauges
                    const colors = ['orange', 'grey', 'gray', 'green', 'pink', 'blue', 'yellow', 'red', 'white', 'black'];
                    if (colors.includes(lowerText)) {
                        td.className = `text-${lowerText === 'gray' ? 'grey' : lowerText}`;
                        td.style.fontWeight = 'bold';
                    }
                    td.textContent = col;
                    tr.appendChild(td);
                });
                vBody.appendChild(tr);
            }
        });
    } else {
        variantsSection.style.display = 'none';
    }
};

window.closeModal = function () {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
};

// Close on 'Esc' key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

function renderProductDetails(products) {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        console.error('No ID found in URL');
        return;
    }

    const product = products.find((p, index) =>
        (p.id && String(p.id).toLowerCase() === String(productId).toLowerCase()) ||
        (String(index) === String(productId))
    );

    if (!product) {
        console.error('Product not found in data for ID:', productId);
        const container = document.querySelector('.product-details-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 100px 0;">
                    <h2>Product Not Found</h2>
                    <p>The product you are looking for does not exist or has been removed.</p>
                    <a href="products.html" class="btn" style="margin-top: 20px;">Back to Products</a>
                </div>
            `;
        }
        return;
    }

    // --- 1. Basic Info ---
    updateText('.product-title', product.title);
    updateText('.product-badges', product.badges);
    updateText('.product-description', product.description);

    const imgEl = document.querySelector('.product-hero-img');
    if (imgEl) {
        imgEl.src = product.image || 'images/placeholder.jpg';
        imgEl.alt = product.title || 'Product Image';
        imgEl.onerror = function () { this.src = 'https://placehold.co/600x400?text=Image+Not+Found'; };
    }
    document.title = (product.title || 'Product') + " | Safe Row Exim";


    // --- 2. Quick Specs (Grid) ---
    const isAgro = product.category && product.category.toLowerCase().includes('agro');

    if (isAgro) {
        updateSpecLabel('Material', 'Origin');
        updateSpecLabel('Sizes', 'Purity');
        updateSpecLabel('Variants', 'Moisture');
        updateSpecLabel('Color/Transparency', 'Packaging');
        updateSpecLabel('Sterilization', 'Shelf Life');
        updateSpecLabel('Application/Usage', 'Certifications');

        updateSpecBox('Origin', product.Origin || product.origin || '-');
        updateSpecBox('Purity', product.Purity || product.purity || '-');
        updateSpecBox('Moisture', product.Moisture || product.moisture || '-');
        updateSpecBox('Packaging', product.Packaging || product.packaging || '-');
        updateSpecBox('Shelf Life', product['Shelf Life'] || product.shelf_life || '-');
        updateSpecBox('Certifications', product.certifications || '-');
    } else {
        updateSpecLabel('Origin', 'Material');
        updateSpecLabel('Purity', 'Sizes');
        updateSpecLabel('Moisture', 'Variants');
        updateSpecLabel('Packaging', 'Color/Transparency');
        updateSpecLabel('Shelf Life', 'Sterilization');
        updateSpecLabel('Certifications', 'Application/Usage');

        updateSpecBox('Material', product.spec_material);
        updateSpecBox('Sizes', product.spec_size);
        updateSpecBox('Variants', product.spec_variant);
        updateSpecBox('Color/Transparency', product.spec_type);
        updateSpecBox('Sterilization', product.spec_sterilization);
        updateSpecBox('Application/Usage', product['Application/Usage']);
    }


    // --- 3. Variants Table ---
    const tableBody = document.querySelector('.gauge-table tbody');
    if (tableBody) {
        if (product.variants_data && product.variants_data.trim() !== "") {
            tableBody.innerHTML = '';
            const rows = product.variants_data.split(';');
            rows.forEach(row => {
                const cols = row.split(',').map(c => c.trim());
                if (cols.length < 2) return;

                const tr = document.createElement('tr');
                cols.forEach((colText, idx) => {
                    const td = document.createElement('td');
                    const lowerText = colText.toLowerCase();
                    if (['orange', 'grey', 'gray', 'green', 'pink', 'blue', 'yellow', 'red', 'white', 'black'].includes(lowerText)) {
                        td.className = `text-${lowerText === 'gray' ? 'grey' : lowerText}`;
                        td.textContent = colText.charAt(0).toUpperCase() + colText.slice(1);
                    } else if (idx === 0) {
                        td.innerHTML = `<strong>${colText}</strong>`;
                    } else {
                        td.textContent = colText;
                    }
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
            });
        }
        else {
            const container = document.querySelector('.table-wrapper');
            if (container) container.style.display = 'none';
        }
    }


    // --- 4. Safety Icons ---
    const safetySection = document.querySelector('.safety-section');
    if (safetySection) {
        safetySection.style.display = isAgro ? 'none' : 'block';
    }

    const safetyGrid = document.querySelector('.safety-grid');
    if (safetyGrid && !isAgro) {
        safetyGrid.innerHTML = '';
        const items = [];
        const safetyStr = (product.safety_features || '').toLowerCase();

        if (product.spec_sterilization) {
            let label = 'EO Sterilized';
            if (product.spec_sterilization.toLowerCase().includes('gamma')) label = 'Gamma Sterilized';
            items.push({ icon: 'fa-shield-halved', label: label });
        }

        const latexVal = product['Latex-Free'] || '';
        if (latexVal.toLowerCase() === 'yes') {
            items.push({ icon: 'fa-ban', label: 'Latex-Free' });
        }

        if (product.category === 'Health' || safetyStr.includes('dehp-free')) {
            items.push({ icon: 'fa-droplet', label: 'DEHP-Free / Non-Toxic' });
        }

        const shelfLife = product['Self-Life'] || '';
        if (shelfLife) {
            const formattedShelfLife = shelfLife.replace(/years/i, 'Years');
            items.push({ icon: 'fa-calendar-check', label: formattedShelfLife + ' Shelf Life' });
        }

        if (safetyStr.includes('single')) {
            items.push({ icon: 'fa-rotate-left', label: 'Single-Use' });
        }

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'safety-item';
            div.innerHTML = `
                <div class="safety-icon"><i class="fa-solid ${item.icon}"></i></div>
                <span class="safety-text">${item.label}</span>
            `;
            safetyGrid.appendChild(div);
        });
    }

    // --- 5. Logistics ---
    updateText('.packaging-inner .pkg-content p', product.packaging_inner || product.Packaging);

    if (isAgro && (product.Domestic || product.Export)) {
        updateText('.packaging-inner .pkg-content p', `Domestic: ${product.Domestic || '-'}, Export: ${product.Export || '-'}`);
    }

    setRowValue('.logistics-col', 'Pack Qty (pcs/box):', product['Pack Qty (pcs/box)']);
    setRowValue('.logistics-col', 'Sterile Pack:', product['Sterile Pack']);
    setRowValue('.logistics-col', 'Box Per Carton:', product['Box Per Carton']);

    setRowValue('.logistics-col', 'Unit Count:', product.pack_unit_count || (isAgro ? product.Packaging : ''));
    setRowValue('.logistics-col', 'Carton Dimensions:', product.pack_dims);
    setRowValue('.logistics-col', 'Gross Weight:', product.pack_weight ? product.pack_weight + (product.pack_weight.toLowerCase().includes('kg') ? '' : ' kg') : '');
    setRowValue('.logistics-col', 'Volume:', product.pack_volume ? product.pack_volume + (product.pack_volume.toLowerCase().includes('cbm') ? '' : ' CBM') : '');

    setShippingValue('.shipping-col', 'HS Code', product.shipping_hscode || product.hscode || product['HS Code']);
    setShippingValue('.shipping-col', 'Lead Time', product.shipping_leadtime);
    setShippingValue('.shipping-col', 'Port', product.shipping_port || product.Port);
    setShippingValue('.shipping-col', 'Capacity', product.shipping_capacity || product.Capacity);


    // --- 6. Compliance ---
    const certGrid = document.querySelector('.tags-container');
    if (certGrid) {
        certGrid.innerHTML = '';

        let certsList = [];
        if (!isAgro) {
            // For health products, show the standard set from the user's image
            certsList = [
                "CE Certified",
                "ISO 13485",
                "ISO 9001",
                "Biocompatibility Test",
                "Sterilization Cert.",
                "MSDS Available"
            ];
        } else {
            // For agro products, use the data from certifications field
            const certsStr = product.certifications || "";
            certsList = certsStr.split(',').map(c => c.trim()).filter(c => c !== "");
        }

        certsList.forEach(certName => {
            const div = document.createElement('div');
            div.className = 'cert-tag';
            div.innerHTML = `
                <div class="cert-icon"><i class="fa-solid fa-file-circle-check"></i></div>
                <div class="cert-text">${certName}</div>
            `;
            certGrid.appendChild(div);
        });
    }
}

// --- Helpers ---

function updateSpecLabel(oldLabel, newLabel) {
    const labels = document.querySelectorAll('.spec-label');
    for (let l of labels) {
        if (l.textContent.trim().toLowerCase() === oldLabel.toLowerCase()) {
            l.textContent = newLabel;
            return;
        }
    }
}

function updateText(selector, value) {
    const el = document.querySelector(selector);
    if (el && value) el.textContent = value;
}

function updateSpecBox(label, value) {
    if (!value) return;
    const labels = document.querySelectorAll('.spec-label');
    for (let l of labels) {
        if (l.textContent.trim().toLowerCase() === label.toLowerCase()) {
            const valEl = l.nextElementSibling;
            if (valEl) valEl.textContent = value;
            break;
        }
    }
}

function setRowValue(sectionClass, labelText, value) {
    if (!value) return;
    const section = document.querySelector(sectionClass);
    if (!section) return;

    const labelEls = section.querySelectorAll('.data-label');
    for (let l of labelEls) {
        if (l.textContent.trim().toLowerCase() === labelText.toLowerCase()) {
            const row = l.closest('.data-row');
            if (row) {
                const valEl = row.querySelector('.data-value');
                if (valEl) {
                    valEl.textContent = value;
                    return;
                }
            }
        }
    }
}

function setShippingValue(sectionClass, labelText, value) {
    if (!value) return;
    const section = document.querySelector(sectionClass);
    if (!section) return;

    const labelEls = section.querySelectorAll('.label');
    for (let l of labelEls) {
        if (l.textContent.trim().toLowerCase() === labelText.toLowerCase()) {
            const item = l.closest('.ship-item');
            if (item) {
                const valEl = item.querySelector('.value');
                if (valEl) {
                    valEl.textContent = value;
                    return;
                }
            }
        }
    }
}
