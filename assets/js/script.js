// Initialize Canvas Matrix
const canvas = new fabric.Canvas('a4Canvas', {
    backgroundColor: '#ffffff',
    preserveObjectStacking: true 
});

// Configure global default styling for selection controls (Pixora Purple Branding)
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.cornerColor = '#8b3dff';
fabric.Object.prototype.borderColor = '#8b3dff';
fabric.Object.prototype.cornerSize = 12;
fabric.Object.prototype.cornerStyle = 'circle';
fabric.Object.prototype.borderScaleFactor = 1.5;

// Sleek Custom Toast Notification Helper
function showToast(message, type = 'info', duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    else if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';
    else if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `
        <span class="toast-icon"><i class="${iconClass}"></i></span>
        <span class="toast-message">${message}</span>
        <button class="toast-close-btn"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });

    setTimeout(() => {
        removeToast(toast);
    }, duration);

    function removeToast(el) {
        el.style.animation = 'toast-fade-out 0.25s ease forwards';
        el.addEventListener('animationend', () => {
            el.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        });
    }
}

// Sleek Custom Confirm Modal Helper
function showConfirm(message) {
    return new Promise((resolve) => {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'confirm-overlay';
        
        modalOverlay.innerHTML = `
            <div class="confirm-card">
                <div class="confirm-header">
                    <span class="confirm-title"><i class="fa-solid fa-circle-question"></i> Confirmation</span>
                </div>
                <div class="confirm-body">${message}</div>
                <div class="confirm-footer">
                    <button class="btn btn-secondary confirm-cancel-btn">Cancel</button>
                    <button class="btn btn-purple confirm-ok-btn">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        const okBtn = modalOverlay.querySelector('.confirm-ok-btn');
        const cancelBtn = modalOverlay.querySelector('.confirm-cancel-btn');

        okBtn.addEventListener('click', () => {
            closeModal(true);
        });

        cancelBtn.addEventListener('click', () => {
            closeModal(false);
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal(false);
            }
        });

        function closeModal(result) {
            modalOverlay.style.animation = 'confirm-fade-out 0.2s ease forwards';
            const card = modalOverlay.querySelector('.confirm-card');
            if (card) {
                card.style.animation = 'confirm-scale-out 0.2s ease forwards';
            }
            modalOverlay.addEventListener('animationend', () => {
                modalOverlay.remove();
                resolve(result);
            });
        }
    });
}

// Helper to strip trailing timestamp if present (e.g. "My Design-1770000000000" -> "My Design")
function getCleanName(name) {
    if (!name) return "";
    return name.replace(/-\d{10,15}$/, '');
}

// Sleek Custom Prompt Modal Helper for entering design name and displaying preview with timestamp
function showSaveTemplatePrompt(defaultName = "My Card Design") {
    return new Promise((resolve) => {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'confirm-overlay';
        
        const timestamp = Date.now();
        const getFilename = (name) => {
            const sanitized = name.trim().replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '-');
            return sanitized ? `${sanitized}-${timestamp}` : `${timestamp}`;
        };

        modalOverlay.innerHTML = `
            <div class="confirm-card" style="width: 400px;">
                <div class="confirm-header">
                    <span class="confirm-title"><i class="fa-solid fa-file-export"></i> Save Template</span>
                </div>
                <div class="confirm-body" style="display: flex; flex-direction: column; gap: 10px;">
                    <label style="font-size: 12px; color: #495057; font-weight: 500;">Design Name:</label>
                    <input type="text" id="promptDesignName" value="${defaultName}" placeholder="Enter template name...">
                    
                    <div style="margin-top: 6px; padding: 10px; background: #f8f9fa; border-radius: 8px; border: 1px dashed #dee2e6; box-sizing: border-box;">
                        <div style="font-size: 10px; color: #6c757d; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">Filename & Timestamp preview</div>
                        <div id="promptFilenamePreview" style="font-size: 11px; color: #495057; word-break: break-all; font-family: monospace;">${getFilename(defaultName)}.json</div>
                    </div>
                </div>
                <div class="confirm-footer">
                    <button class="btn btn-secondary prompt-cancel-btn">Cancel</button>
                    <button class="btn btn-purple prompt-save-btn">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        const input = modalOverlay.querySelector('#promptDesignName');
        const preview = modalOverlay.querySelector('#promptFilenamePreview');
        const saveBtn = modalOverlay.querySelector('.prompt-save-btn');
        const cancelBtn = modalOverlay.querySelector('.prompt-cancel-btn');

        // Focus & select input content
        input.focus();
        input.select();

        const updatePreview = () => {
            const name = input.value;
            preview.textContent = `${getFilename(name)}.json`;
            if (name.trim() === "") {
                saveBtn.disabled = true;
                saveBtn.style.opacity = 0.5;
                saveBtn.style.cursor = 'not-allowed';
            } else {
                saveBtn.disabled = false;
                saveBtn.style.opacity = 1;
                saveBtn.style.cursor = 'pointer';
            }
        };

        input.addEventListener('input', updatePreview);
        updatePreview(); // Initial preview check

        // Enter key triggers Save, Escape triggers Cancel
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !saveBtn.disabled) {
                closeModal({ designName: input.value, timestamp });
            } else if (e.key === 'Escape') {
                closeModal(null);
            }
        });

        saveBtn.addEventListener('click', () => {
            closeModal({ designName: input.value, timestamp });
        });

        cancelBtn.addEventListener('click', () => {
            closeModal(null);
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal(null);
            }
        });

        function closeModal(result) {
            modalOverlay.style.animation = 'confirm-fade-out 0.2s ease forwards';
            const card = modalOverlay.querySelector('.confirm-card');
            if (card) {
                card.style.animation = 'confirm-scale-out 0.2s ease forwards';
            }
            modalOverlay.addEventListener('animationend', () => {
                modalOverlay.remove();
                resolve(result);
            });
        }
    });
}

// Helper to resize base64 images to target width (110px) keeping aspect ratio
function resizeThumbnail(dataUrl, callback) {
    const img = new Image();
    img.onload = function() {
        const targetWidth = 110;
        const ratio = img.height / img.width;
        const targetHeight = Math.round(targetWidth * ratio);

        const canvasTmp = document.createElement('canvas');
        canvasTmp.width = targetWidth;
        canvasTmp.height = targetHeight;

        const ctx = canvasTmp.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const resizedDataUrl = canvasTmp.toDataURL('image/png');
        callback(resizedDataUrl);
    };
    img.src = dataUrl;
}

canvas.on('mouse:down', function(options) {
    // 1. Right Click Selection Support
    if (options.e && (options.e.button === 2 || options.button === 3)) {
        const target = options.target;
        if (target && target.selectable) {
            canvas.setActiveObject(target);
            canvas.renderAll();
            updateSidebarControlsFromCanvasSelection();
        }
    }
    // 2. Ctrl+Click Layer Cycling for Overlapping/Obscured Layers
    else if (options.e && options.e.ctrlKey) {
        const pointer = canvas.getPointer(options.e);
        const objects = canvas.getObjects();
        const targets = [];
        
        // Find all selectable objects under pointer coordinates
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            if (obj.selectable && obj.containsPoint(pointer)) {
                targets.push(obj);
            }
        }
        
        if (targets.length > 1) {
            const activeObj = canvas.getActiveObject();
            let nextIndex = 0;
            if (activeObj) {
                const currIndex = targets.indexOf(activeObj);
                if (currIndex !== -1) {
                    nextIndex = (currIndex + 1) % targets.length;
                }
            }
            
            // Cycle active object selection
            canvas.discardActiveObject();
            canvas.setActiveObject(targets[nextIndex]);
            canvas.renderAll();
            
            // Sync properties toolbar UI
            updateSidebarControlsFromCanvasSelection();
            
            options.e.preventDefault();
            options.e.stopPropagation();
        }
    }
});

// --- CUSTOM CONTEXT MENU FOR CANVAS LAYERS ---
const customContextMenu = document.getElementById('customContextMenu');

function showContextMenu(x, y) {
    if (!customContextMenu) return;
    
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    const isLocked = !!activeObj.isLocked;

    // Enabled/disabled buttons depending on locked status
    const bringToFrontItem = document.getElementById('ctxBringToFront');
    const bringForwardItem = document.getElementById('ctxBringForward');
    const sendBackwardItem = document.getElementById('ctxSendBackward');
    const sendToBackItem = document.getElementById('ctxSendToBack');
    const deleteItem = document.getElementById('ctxDelete');
    const duplicateItem = document.getElementById('ctxDuplicate');
    const toggleLockItem = document.getElementById('ctxToggleLock');

    if (isLocked) {
        bringToFrontItem.classList.add('disabled');
        bringForwardItem.classList.add('disabled');
        sendBackwardItem.classList.add('disabled');
        sendToBackItem.classList.add('disabled');
        deleteItem.classList.add('disabled');
        if (duplicateItem) duplicateItem.classList.add('disabled');
        toggleLockItem.innerHTML = '<i class="fa-solid fa-lock"></i> Unlock Layer';
    } else {
        bringToFrontItem.classList.remove('disabled');
        bringForwardItem.classList.remove('disabled');
        sendBackwardItem.classList.remove('disabled');
        sendToBackItem.classList.remove('disabled');
        deleteItem.classList.remove('disabled');
        if (duplicateItem) duplicateItem.classList.remove('disabled');
        toggleLockItem.innerHTML = '<i class="fa-solid fa-lock-open"></i> Lock Layer';
    }

    customContextMenu.style.display = 'block';
    
    // Bounds clamping
    const menuWidth = customContextMenu.offsetWidth;
    const menuHeight = customContextMenu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let posX = x;
    let posY = y;
    
    if (x + menuWidth > windowWidth) posX = windowWidth - menuWidth - 10;
    if (y + menuHeight > windowHeight) posY = windowHeight - menuHeight - 10;
    
    customContextMenu.style.left = posX + 'px';
    customContextMenu.style.top = posY + 'px';
}

function hideContextMenu() {
    if (customContextMenu) {
        customContextMenu.style.display = 'none';
    }
}

// Intercept browser contextmenu on the canvas element
if (canvas.upperCanvasEl) {
    canvas.upperCanvasEl.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            showContextMenu(e.clientX, e.clientY);
        } else {
            hideContextMenu();
        }
    });
}

// Hide context menu when clicking elsewhere or pressing keys
document.addEventListener('click', function(e) {
    if (customContextMenu && !customContextMenu.contains(e.target)) {
        hideContextMenu();
    }
});

document.addEventListener('keydown', function() {
    hideContextMenu();
});

// Hide context menu when scrolling the canvas workspace area
const workspaceScrollArea = document.querySelector('.workspace-scroll-area');
if (workspaceScrollArea) {
    workspaceScrollArea.addEventListener('scroll', function() {
        hideContextMenu();
    });
}

// Bind Context Menu Item Actions
document.getElementById('ctxBringToFront').addEventListener('click', function() {
    arrangeObject('front');
    hideContextMenu();
});
document.getElementById('ctxBringForward').addEventListener('click', function() {
    arrangeObject('forward');
    hideContextMenu();
});
document.getElementById('ctxSendBackward').addEventListener('click', function() {
    arrangeObject('backward');
    hideContextMenu();
});
document.getElementById('ctxSendToBack').addEventListener('click', function() {
    arrangeObject('back');
    hideContextMenu();
});
document.getElementById('ctxToggleLock').addEventListener('click', function() {
    toggleLockActiveObject();
    hideContextMenu();
});
document.getElementById('ctxDuplicate').addEventListener('click', function() {
    duplicateActiveObject();
    hideContextMenu();
});
document.getElementById('ctxDelete').addEventListener('click', function() {
    deleteActiveObject();
    hideContextMenu();
});


// Canvas Base Dimensions for Zoom Scaling
let baseWidth = 595;
let baseHeight = 842;


// DOM Setup Framework
const imageUploadInput = document.getElementById('imageUploadInput');
const deleteSelectedBtn = document.getElementById('deleteSelected');
const downloadCanvasBtn = document.getElementById('downloadCanvas');
const clearCanvasBtn = document.getElementById('clearCanvas');

const addTextBtn = document.getElementById('addTextBtn');
const textStringInput = document.getElementById('textString');
const fontFamilySelect = document.getElementById('fontFamilySelect');
const alignButtons = document.querySelectorAll('.align-group .align-btn');

const textColorPicker = document.getElementById('textColorPicker');
const textColorHex = document.getElementById('textColorHex');

const fontSizeInput = document.getElementById('fontSizeInput');
const lineHeightInput = document.getElementById('lineHeightInput');
const btnBold = document.getElementById('btnBold');
const btnItalic = document.getElementById('btnItalic');
const btnUnderline = document.getElementById('btnUnderline');
const btnStrike = document.getElementById('btnStrike');
const btnOverline = document.getElementById('btnOverline');

// Floating Topbar controls
const textToolbar = document.getElementById('textToolbar');
const tbFontFamilySelect = document.getElementById('tbFontFamilySelect');
const tbFontSizeInput = document.getElementById('tbFontSizeInput');
const tbLineHeightInput = document.getElementById('tbLineHeightInput');
const tbTextColorPicker = document.getElementById('tbTextColorPicker');
const tbTextColorHex = document.getElementById('tbTextColorHex');
const tbBtnBold = document.getElementById('tbBtnBold');
const tbBtnItalic = document.getElementById('tbBtnItalic');
const tbBtnUnderline = document.getElementById('tbBtnUnderline');
const tbBtnStrike = document.getElementById('tbBtnStrike');
const tbBtnOverline = document.getElementById('tbBtnOverline');
const tbAlignButtons = document.querySelectorAll('#textToolbar .align-btn');

const bringToFrontBtn = document.getElementById('bringToFront');
const bringForwardBtn = document.getElementById('bringForward');
const sendBackwardBtn = document.getElementById('sendBackward');
const sendToBackBtn = document.getElementById('sendToBack');

// Size Modal Elements Setup
const sizeModal = document.getElementById('sizeModal');
const presetItems = document.querySelectorAll('.preset-item');
const customWidthInput = document.getElementById('customWidthInput');
const customHeightInput = document.getElementById('customHeightInput');
const createDesignBtn = document.getElementById('createDesignBtn');

// Element Floating Toolbar Selectors
const elementToolbar = document.getElementById('elementToolbar');
const elFillColorPicker = document.getElementById('elFillColorPicker');
const elFillColorHex = document.getElementById('elFillColorHex');
const elOpacitySlider = document.getElementById('elOpacitySlider');
const elOpacityVal = document.getElementById('elOpacityVal');
const elStrokeWidthInput = document.getElementById('elStrokeWidthInput');
const elStrokeColorPicker = document.getElementById('elStrokeColorPicker');
const elStrokeColorHex = document.getElementById('elStrokeColorHex');
const elCornerRadiusContainer = document.getElementById('elCornerRadiusContainer');
const elCornerRadiusDivider = document.getElementById('elCornerRadiusDivider');
const elCornerRadiusSlider = document.getElementById('elCornerRadiusSlider');
const elCornerRadiusVal = document.getElementById('elCornerRadiusVal');

// Canvas Zoom Controls DOM
const canvasZoomSlider = document.getElementById('canvasZoomSlider');
const canvasZoomVal = document.getElementById('canvasZoomVal');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');

// Canvas Lock Controls DOM
const tbBtnLock = document.getElementById('tbBtnLock');
const elBtnLock = document.getElementById('elBtnLock');
const sidebarLockBtn = document.getElementById('sidebarLockBtn');

// Canvas Duplicate Controls DOM
const tbBtnDuplicate = document.getElementById('tbBtnDuplicate');
const elBtnDuplicate = document.getElementById('elBtnDuplicate');

// Canvas Alignment Controls DOM
const tbBtnCanvasAlignLeft = document.getElementById('tbBtnCanvasAlignLeft');
const tbBtnCanvasAlignCenter = document.getElementById('tbBtnCanvasAlignCenter');
const tbBtnCanvasAlignRight = document.getElementById('tbBtnCanvasAlignRight');
const elBtnCanvasAlignLeft = document.getElementById('elBtnCanvasAlignLeft');
const elBtnCanvasAlignCenter = document.getElementById('elBtnCanvasAlignCenter');
const elBtnCanvasAlignRight = document.getElementById('elBtnCanvasAlignRight');

function applyZoom(zoomValue) {
    const factor = zoomValue / 100;
    
    // Scale canvas viewport
    canvas.setZoom(factor);
    
    // Update canvas element width/height to trigger parent overflow scrollbars
    canvas.setWidth(baseWidth * factor);
    canvas.setHeight(baseHeight * factor);
    
    // Sync UI controls
    canvasZoomSlider.value = zoomValue;
    canvasZoomVal.textContent = Math.round(zoomValue) + '%';
    
    canvas.renderAll();
}

// Fit canvas zoom scale to the workspace viewport boundaries
function fitCanvasToViewport() {
    const scrollArea = document.querySelector('.workspace-scroll-area');
    if (!scrollArea) return;

    // Detect mobile viewport
    const isMobile = window.innerWidth <= 768;
    const paddingTotal = isMobile ? 32 : 80;

    const viewWidth = scrollArea.clientWidth - paddingTotal;
    const viewHeight = scrollArea.clientHeight - paddingTotal;

    if (viewWidth <= 0 || viewHeight <= 0) {
        applyZoom(100);
        return;
    }

    const scaleX = viewWidth / baseWidth;
    const scaleY = viewHeight / baseHeight;
    const fitScale = Math.min(scaleX, scaleY);

    // Clamp fit zoom between zoom bounds (20% to 300%)
    const fitZoom = Math.max(20, Math.min(300, Math.round(fitScale * 100)));
    applyZoom(fitZoom);
}

// Bind Zoom Event Handlers
canvasZoomSlider.addEventListener('input', function() {
    applyZoom(parseInt(this.value, 10));
});

zoomInBtn.addEventListener('click', function() {
    let currentVal = parseInt(canvasZoomSlider.value, 10);
    let newVal = Math.min(300, Math.floor(currentVal / 10) * 10 + 10);
    if (newVal === currentVal && newVal < 300) {
        newVal = Math.min(300, newVal + 10);
    }
    applyZoom(newVal);
});

zoomOutBtn.addEventListener('click', function() {
    let currentVal = parseInt(canvasZoomSlider.value, 10);
    let newVal = Math.max(20, Math.ceil(currentVal / 10) * 10 - 10);
    if (newVal === currentVal && newVal > 20) {
        newVal = Math.max(20, newVal - 10);
    }
    applyZoom(newVal);
});

// Window resize handler with simple debounce
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(fitCanvasToViewport, 150);
});

// Size Modal Dynamic Selection & Resizing Hooks
presetItems.forEach(item => {
    item.addEventListener('click', function() {
        presetItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        const wVal = this.dataset.width;
        const hVal = this.dataset.height;
        customWidthInput.value = wVal;
        customHeightInput.value = hVal;
    });
});

function clearPresetSelection() {
    presetItems.forEach(i => i.classList.remove('active'));
}

customWidthInput.addEventListener('input', clearPresetSelection);
customHeightInput.addEventListener('input', clearPresetSelection);

createDesignBtn.addEventListener('click', function() {
    const width = parseInt(customWidthInput.value, 10);
    const height = parseInt(customHeightInput.value, 10);
    
    if (isNaN(width) || width < 100 || width > 4000) {
        showToast('Please enter a valid width between 100 and 4000 pixels.', 'warning');
        return;
    }
    if (isNaN(height) || height < 100 || height > 4000) {
        showToast('Please enter a valid height between 100 and 4000 pixels.', 'warning');
        return;
    }
    
    // Clear canvas and reset background color
    canvas.clear();
    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
    
    // Hide toolbars
    if (typeof textToolbar !== 'undefined' && textToolbar) textToolbar.classList.remove('visible');
    if (typeof elementToolbar !== 'undefined' && elementToolbar) elementToolbar.classList.remove('visible');
    
    // Set Fabric Canvas dimensions & adjust fit zoom
    baseWidth = width;
    baseHeight = height;
    fitCanvasToViewport();
    
    // Hide startup size modal
    sizeModal.classList.add('hidden');
});

// Curated dynamic typography engine array compilation
const googleFontsList = [
    "Poppins", "Roboto", "Montserrat", "Inter", "Open Sans", "Oswald", "Raleway", "Ubuntu", "Nunito", 
    "Playfair Display", "Merriweather", "Lora", "PT Serif", "Cinzel", 
    "Pacifico", "Lobster", "Dancing Script", "Great Vibes", "Caveat", "Satisfy", 
    "Bebas Neue", "Anton", "Righteous", "Abril Fatface", "Permanent Marker", "Luckiest Guy", "Fredoka One", "Sacramento"
];

// Hydrate typographic dropdown listings with inline styled previews
function initFontDropdownWithPreviews() {
    googleFontsList.sort();
    const formattedNames = googleFontsList.map(name => name.replace(/ /g, '+')).join('|');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css?family=${formattedNames}&display=swap`;
    document.head.appendChild(link);

    googleFontsList.forEach(font => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        option.style.fontFamily = `"${font}", sans-serif`;
        fontFamilySelect.appendChild(option);

        const tbOption = option.cloneNode(true);
        tbFontFamilySelect.appendChild(tbOption);
    });
}
initFontDropdownWithPreviews();

fontFamilySelect.addEventListener('change', function() {
    this.style.fontFamily = `"${this.value}", sans-serif`;
    tbFontFamilySelect.value = this.value;
    tbFontFamilySelect.style.fontFamily = `"${this.value}", sans-serif`;
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('fontFamily', this.value);
        canvas.renderAll();
    }
});

function handleImageUpload(e, callback) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) { callback(event.target.result); };
    reader.readAsDataURL(file);
}

imageUploadInput.addEventListener('change', function(e) {
    handleImageUpload(e, function(imgUrl) {
        fabric.Image.fromURL(imgUrl, function(img) {
            // Scale proportionally to fit within 80% of canvas area
            const scaleX = baseWidth / img.width;
            const scaleY = baseHeight / img.height;
            const scale = Math.min(scaleX, scaleY, 1) * 0.8;
            
            img.set({
                left: baseWidth / 2,
                top: baseHeight / 2,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale,
                selectable: true,
                evented: true,
                cornerColor: '#8b3dff',
                cornerSize: 12,
                transparentCorners: false,
                borderColor: '#8b3dff',
                cornerStyle: 'circle',
                perPixelTargetFind: true // Enable pixel-perfect selection for transparent areas
            });

            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();


            
            // Clear input value so selecting same file triggers change again
            imageUploadInput.value = '';
        });
    });
});

addTextBtn.addEventListener('click', function() {
    const userString = textStringInput.value;
    const chosenFont = fontFamilySelect.value;
    const activeAlign = document.querySelector('.align-group .align-btn.active').dataset.align;

    const isBold = btnBold.classList.contains('active');
    const isItalic = btnItalic.classList.contains('active');
    const hasUnderline = btnUnderline.classList.contains('active');
    const hasStrike = btnStrike.classList.contains('active');
    const hasOverline = btnOverline.classList.contains('active');
    
    const fSize = parseInt(fontSizeInput.value, 10) || 36;
    const lHeight = parseFloat(lineHeightInput.value) || 1.1;

    const textItem = new fabric.IText(userString, {
        left: baseWidth / 2,
        top: baseHeight / 4,
        originX: 'center',
        originY: 'center',
        fontFamily: chosenFont,
        fontSize: fSize,
        lineHeight: lHeight,
        fill: textColorPicker.value,
        textAlign: activeAlign,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        underline: hasUnderline,
        linethrough: hasStrike,
        overline: hasOverline,
        cornerColor: '#8b3dff',
        cornerSize: 12,
        transparentCorners: false,
        cornerStyle: 'circle',
        borderColor: '#8b3dff'
    });

    canvas.add(textItem);
    


    canvas.setActiveObject(textItem);
    canvas.renderAll();
});

alignButtons.forEach(button => {
    button.addEventListener('click', function() {
        alignButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const selectedAlignment = this.dataset.align;
        const activeObj = canvas.getActiveObject();

        if (activeObj && activeObj.type === 'i-text') {
            activeObj.set('textAlign', selectedAlignment);
            canvas.renderAll();
        }
    });
});

canvas.on('selection:created', updateSidebarControlsFromCanvasSelection);
canvas.on('selection:updated', updateSidebarControlsFromCanvasSelection);

function updateSidebarControlsFromCanvasSelection(e) {
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
        const isLocked = !!activeObj.isLocked;

        // Toggle delete, duplicate and layering controls depending on locked state
        deleteSelectedBtn.disabled = isLocked;
        bringToFrontBtn.disabled = isLocked;
        bringForwardBtn.disabled = isLocked;
        sendBackwardBtn.disabled = isLocked;
        sendToBackBtn.disabled = isLocked;
        if (tbBtnDuplicate) tbBtnDuplicate.disabled = isLocked;
        if (elBtnDuplicate) elBtnDuplicate.disabled = isLocked;
        
        // Canvas alignment controls locked state sync
        if (tbBtnCanvasAlignLeft) tbBtnCanvasAlignLeft.disabled = isLocked;
        if (tbBtnCanvasAlignCenter) tbBtnCanvasAlignCenter.disabled = isLocked;
        if (tbBtnCanvasAlignRight) tbBtnCanvasAlignRight.disabled = isLocked;
        if (elBtnCanvasAlignLeft) elBtnCanvasAlignLeft.disabled = isLocked;
        if (elBtnCanvasAlignCenter) elBtnCanvasAlignCenter.disabled = isLocked;
        if (elBtnCanvasAlignRight) elBtnCanvasAlignRight.disabled = isLocked;
        
        // Update Sidebar Lock button state
        sidebarLockBtn.disabled = false;
        if (isLocked) {
            sidebarLockBtn.classList.add('locked');
            sidebarLockBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Unlock Layer';
            sidebarLockBtn.title = 'Unlock Layer';
        } else {
            sidebarLockBtn.classList.remove('locked');
            sidebarLockBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Lock Layer';
            sidebarLockBtn.title = 'Lock Layer';
        }

        // Update Floating Lock buttons
        if (tbBtnLock) {
            tbBtnLock.classList.toggle('locked', isLocked);
            tbBtnLock.innerHTML = isLocked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>';
            tbBtnLock.title = isLocked ? 'Unlock Text' : 'Lock Text';
        }
        if (elBtnLock) {
            elBtnLock.classList.toggle('locked', isLocked);
            elBtnLock.innerHTML = isLocked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>';
            elBtnLock.title = isLocked ? 'Unlock Element' : 'Lock Element';
        }

        if(activeObj.type === 'i-text') {
            textStringInput.value = activeObj.text;
            textStringInput.disabled = isLocked;
            fontFamilySelect.value = activeObj.fontFamily;
            fontFamilySelect.style.fontFamily = `"${activeObj.fontFamily}", sans-serif`;
            fontFamilySelect.disabled = isLocked;
            
            alignButtons.forEach(b => {
                b.classList.remove('active');
                if(b.dataset.align === activeObj.textAlign) b.classList.add('active');
                b.disabled = isLocked;
            });

            textColorPicker.disabled = isLocked;
            textColorHex.disabled = isLocked;
            if (activeObj.fill) {
                if (/^#[0-9A-F]{6}$/i.test(activeObj.fill)) {
                    textColorPicker.value = activeObj.fill;
                }
                textColorHex.value = activeObj.fill.toUpperCase();
            }

            fontSizeInput.disabled = isLocked;
            lineHeightInput.disabled = isLocked;
            fontSizeInput.value = activeObj.fontSize;
            lineHeightInput.value = activeObj.lineHeight || 1.1;

            btnBold.disabled = isLocked;
            btnItalic.disabled = isLocked;
            btnUnderline.disabled = isLocked;
            btnStrike.disabled = isLocked;
            btnOverline.disabled = isLocked;

            btnBold.classList.toggle('active', activeObj.fontWeight === 'bold');
            btnItalic.classList.toggle('active', activeObj.fontStyle === 'italic');
            btnUnderline.classList.toggle('active', !!activeObj.underline);
            btnStrike.classList.toggle('active', !!activeObj.linethrough);
            btnOverline.classList.toggle('active', !!activeObj.overline);

            // Populate and Show Floating Topbar
            textToolbar.classList.add('visible');
            tbFontFamilySelect.value = activeObj.fontFamily;
            tbFontFamilySelect.style.fontFamily = `"${activeObj.fontFamily}", sans-serif`;
            tbFontFamilySelect.disabled = isLocked;
            
            tbFontSizeInput.value = activeObj.fontSize;
            tbFontSizeInput.disabled = isLocked;
            
            tbLineHeightInput.value = activeObj.lineHeight || 1.1;
            tbLineHeightInput.disabled = isLocked;
            
            tbTextColorPicker.disabled = isLocked;
            tbTextColorHex.disabled = isLocked;
            if (activeObj.fill) {
                if (/^#[0-9A-F]{6}$/i.test(activeObj.fill)) {
                    tbTextColorPicker.value = activeObj.fill;
                }
                tbTextColorHex.value = activeObj.fill.toUpperCase();
            }

            tbBtnBold.disabled = isLocked;
            tbBtnItalic.disabled = isLocked;
            tbBtnUnderline.disabled = isLocked;
            tbBtnStrike.disabled = isLocked;
            tbBtnOverline.disabled = isLocked;

            tbBtnBold.classList.toggle('active', activeObj.fontWeight === 'bold');
            tbBtnItalic.classList.toggle('active', activeObj.fontStyle === 'italic');
            tbBtnUnderline.classList.toggle('active', !!activeObj.underline);
            tbBtnStrike.classList.toggle('active', !!activeObj.linethrough);
            tbBtnOverline.classList.toggle('active', !!activeObj.overline);

            tbAlignButtons.forEach(b => {
                b.classList.remove('active');
                if (b.dataset.align === activeObj.textAlign) b.classList.add('active');
                b.disabled = isLocked;
            });

            // Hide element properties toolbar
            elementToolbar.classList.remove('visible');
        } else if (activeObj.isShapeElement || activeObj.type === 'image') {
            // Hide text toolbar
            textToolbar.classList.remove('visible');
            
            // Show shape element toolbar
            elementToolbar.classList.add('visible');
            
            const isImage = activeObj.type === 'image';
            
            // Toggle Fill Color Container displaying for shapes but not images
            const elFillColorContainer = document.getElementById('elFillColorContainer');
            const elFillColorDivider = document.getElementById('elFillColorDivider');
            if (elFillColorContainer && elFillColorDivider) {
                if (isImage) {
                    elFillColorContainer.style.display = 'none';
                    elFillColorDivider.style.display = 'none';
                } else {
                    elFillColorContainer.style.display = 'flex';
                    elFillColorDivider.style.display = 'block';
                }
            }
            
            // Sync fill color (only if not an image)
            if (!isImage && activeObj.fill) {
                let fillVal = activeObj.fill;
                if (/^#[0-9A-F]{6}$/i.test(fillVal)) {
                    elFillColorPicker.value = fillVal;
                    elFillColorHex.value = fillVal.toUpperCase();
                } else if (/^#[0-9A-F]{3}$/i.test(fillVal)) {
                    let fullHex = "#" + fillVal[1] + fillVal[1] + fillVal[2] + fillVal[2] + fillVal[3] + fillVal[3];
                    elFillColorPicker.value = fullHex;
                    elFillColorHex.value = fullHex.toUpperCase();
                }
            }
            
            // Enable/disable fill color fields
            elFillColorPicker.disabled = isLocked;
            elFillColorHex.disabled = isLocked;
            
            // Sync opacity
            const opacityPct = Math.round((activeObj.opacity !== undefined ? activeObj.opacity : 1) * 100);
            elOpacitySlider.value = opacityPct;
            elOpacityVal.textContent = opacityPct + '%';
            elOpacitySlider.disabled = isLocked;
            
            // Sync corner radius if rect
            if (activeObj.type === 'rect') {
                elCornerRadiusContainer.style.display = 'flex';
                elCornerRadiusDivider.style.display = 'block';
                elCornerRadiusSlider.value = activeObj.rx || 0;
                elCornerRadiusVal.textContent = (activeObj.rx || 0) + 'px';
                elCornerRadiusSlider.disabled = isLocked;
            } else {
                elCornerRadiusContainer.style.display = 'none';
                elCornerRadiusDivider.style.display = 'none';
            }
            
            // Sync stroke width & color
            elStrokeWidthInput.value = activeObj.strokeWidth || 0;
            elStrokeWidthInput.disabled = isLocked;
            
            if (activeObj.stroke) {
                let strokeVal = activeObj.stroke;
                if (/^#[0-9A-F]{6}$/i.test(strokeVal)) {
                    elStrokeColorPicker.value = strokeVal;
                    elStrokeColorHex.value = strokeVal.toUpperCase();
                } else if (/^#[0-9A-F]{3}$/i.test(strokeVal)) {
                    let fullHex = "#" + strokeVal[1] + strokeVal[1] + strokeVal[2] + strokeVal[2] + strokeVal[3] + strokeVal[3];
                    elStrokeColorPicker.value = fullHex;
                    elStrokeColorHex.value = fullHex.toUpperCase();
                }
            } else {
                elStrokeColorPicker.value = '#000000';
                elStrokeColorHex.value = '#000000';
            }
            elStrokeColorPicker.disabled = isLocked;
            elStrokeColorHex.disabled = isLocked;
        } else {
            textToolbar.classList.remove('visible');
            elementToolbar.classList.remove('visible');
            
            textColorPicker.disabled = true;
            textColorHex.disabled = true;
            fontSizeInput.disabled = true;
            lineHeightInput.disabled = true;
            btnBold.disabled = true;
            btnItalic.disabled = true;
            btnUnderline.disabled = true;
            btnStrike.disabled = true;
            btnOverline.disabled = true;

            btnBold.classList.remove('active');
            btnItalic.classList.remove('active');
            btnUnderline.classList.remove('active');
            btnStrike.classList.remove('active');
            btnOverline.classList.remove('active');
        }
    } else {
        sidebarLockBtn.disabled = true;
        sidebarLockBtn.classList.remove('locked');
        sidebarLockBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Lock Layer';
        sidebarLockBtn.title = 'Lock Layer';

        deleteSelectedBtn.disabled = true;
        bringToFrontBtn.disabled = true;
        bringForwardBtn.disabled = true;
        sendBackwardBtn.disabled = true;
        sendToBackBtn.disabled = true;

        textColorPicker.disabled = false;
        textColorHex.disabled = false;
        fontSizeInput.disabled = false;
        lineHeightInput.disabled = false;
        btnBold.disabled = false;
        btnItalic.disabled = false;
        btnUnderline.disabled = false;
        btnStrike.disabled = false;
        btnOverline.disabled = false;

        textToolbar.classList.remove('visible');
        elementToolbar.classList.remove('visible');
    }
}

canvas.on('selection:cleared', function() {
    sidebarLockBtn.disabled = true;
    sidebarLockBtn.classList.remove('locked');
    sidebarLockBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Lock Layer';
    sidebarLockBtn.title = 'Lock Layer';

    deleteSelectedBtn.disabled = true;
    bringToFrontBtn.disabled = true;
    bringForwardBtn.disabled = true;
    sendBackwardBtn.disabled = true;
    sendToBackBtn.disabled = true;
    if (tbBtnDuplicate) tbBtnDuplicate.disabled = true;
    if (elBtnDuplicate) elBtnDuplicate.disabled = true;
    
    // Disable canvas alignment controls
    if (tbBtnCanvasAlignLeft) tbBtnCanvasAlignLeft.disabled = true;
    if (tbBtnCanvasAlignCenter) tbBtnCanvasAlignCenter.disabled = true;
    if (tbBtnCanvasAlignRight) tbBtnCanvasAlignRight.disabled = true;
    if (elBtnCanvasAlignLeft) elBtnCanvasAlignLeft.disabled = true;
    if (elBtnCanvasAlignCenter) elBtnCanvasAlignCenter.disabled = true;
    if (elBtnCanvasAlignRight) elBtnCanvasAlignRight.disabled = true;
    textColorPicker.disabled = false;
    textColorHex.disabled = false;
    fontSizeInput.disabled = false;
    lineHeightInput.disabled = false;
    btnBold.disabled = false;
    btnItalic.disabled = false;
    btnUnderline.disabled = false;
    btnStrike.disabled = false;
    btnOverline.disabled = false;
    textToolbar.classList.remove('visible');
    elementToolbar.classList.remove('visible');
});

function deleteActiveObject() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && !activeObject.isLocked) {
        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        deleteSelectedBtn.disabled = true;
    }
}

deleteSelectedBtn.addEventListener('click', deleteActiveObject);
window.addEventListener('keydown', function(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if(document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
            deleteActiveObject();
        }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if(document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
            e.preventDefault();
            duplicateActiveObject();
        }
    }
});

downloadCanvasBtn.addEventListener('click', function() {
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    // Store current zoom level
    const currentZoom = parseInt(canvasZoomSlider.value, 10);

    // Reset zoom to 100% for export to ensure original quality and size
    applyZoom(100);

    setTimeout(() => {
        const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 0.95 });
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'pixora-design.jpg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Restore original zoom after download starts
        applyZoom(currentZoom);
    }, 50);
});

clearCanvasBtn.addEventListener('click', function() {
    canvas.clear();
    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
    imageUploadInput.value = '';
    deleteSelectedBtn.disabled = true;
    fontFamilySelect.value = 'Arial';
    fontFamilySelect.style.fontFamily = 'Arial';
    bringToFrontBtn.disabled = true;
    bringForwardBtn.disabled = true;
    sendBackwardBtn.disabled = true;
    sendToBackBtn.disabled = true;
    textColorPicker.value = '#2c3e50';
    textColorHex.value = '#2C3E50';
    textColorPicker.disabled = false;
    textColorHex.disabled = false;
    fontSizeInput.value = '36';
    lineHeightInput.value = '1.1';
    btnBold.classList.remove('active');
    btnItalic.classList.remove('active');
    btnUnderline.classList.remove('active');
    btnStrike.classList.remove('active');
    btnOverline.classList.remove('active');
    fontSizeInput.disabled = false;
    lineHeightInput.disabled = false;
    btnBold.disabled = false;
    btnItalic.disabled = false;
    btnUnderline.disabled = false;
    btnStrike.disabled = false;
    btnOverline.disabled = false;

    // Reset and Hide Floating Topbar
    textToolbar.classList.remove('visible');
    tbFontFamilySelect.value = 'Arial';
    tbFontFamilySelect.style.fontFamily = 'Arial';
    tbFontSizeInput.value = '36';
    tbLineHeightInput.value = '1.1';
    tbTextColorPicker.value = '#2c3e50';
    tbTextColorHex.value = '#2C3E50';
    tbBtnBold.classList.remove('active');
    tbBtnItalic.classList.remove('active');
    tbBtnUnderline.classList.remove('active');
    tbBtnStrike.classList.remove('active');
    tbBtnOverline.classList.remove('active');
});

function arrangeObject(action) {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    switch (action) {
        case 'front':
            canvas.bringToFront(activeObj);
            break;
        case 'forward':
            canvas.bringForward(activeObj);
            break;
        case 'backward':
            canvas.sendBackwards(activeObj);
            break;
        case 'back':
            canvas.sendToBack(activeObj);
            break;
    }
    canvas.renderAll();
}

bringToFrontBtn.addEventListener('click', () => arrangeObject('front'));
bringForwardBtn.addEventListener('click', () => arrangeObject('forward'));
sendBackwardBtn.addEventListener('click', () => arrangeObject('backward'));
sendToBackBtn.addEventListener('click', () => arrangeObject('back'));

textColorPicker.addEventListener('input', function() {
    const color = this.value;
    textColorHex.value = color.toUpperCase();
    tbTextColorPicker.value = color;
    tbTextColorHex.value = color.toUpperCase();
    updateSelectedTextColor(color);
});

textColorHex.addEventListener('input', function() {
    let color = this.value.trim();
    if (!color.startsWith('#')) {
        color = '#' + color;
    }
    if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
        textColorPicker.value = color;
        tbTextColorPicker.value = color;
        tbTextColorHex.value = color.toUpperCase();
        updateSelectedTextColor(color);
    }
});

tbTextColorPicker.addEventListener('input', function() {
    const color = this.value;
    tbTextColorHex.value = color.toUpperCase();
    textColorPicker.value = color;
    textColorHex.value = color.toUpperCase();
    updateSelectedTextColor(color);
});

tbTextColorHex.addEventListener('input', function() {
    let color = this.value.trim();
    if (!color.startsWith('#')) {
        color = '#' + color;
    }
    if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
        tbTextColorPicker.value = color;
        textColorPicker.value = color;
        textColorHex.value = color.toUpperCase();
        updateSelectedTextColor(color);
    }
});

function updateSelectedTextColor(color) {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('fill', color);
        canvas.renderAll();
    }
}

fontSizeInput.addEventListener('input', function() {
    const val = parseInt(this.value, 10);
    tbFontSizeInput.value = this.value;
    if (!isNaN(val) && val > 0) {
        updateSelectedTextProperty('fontSize', val);
    }
});

tbFontSizeInput.addEventListener('input', function() {
    const val = parseInt(this.value, 10);
    fontSizeInput.value = this.value;
    if (!isNaN(val) && val > 0) {
        updateSelectedTextProperty('fontSize', val);
    }
});

lineHeightInput.addEventListener('input', function() {
    const val = parseFloat(this.value);
    tbLineHeightInput.value = this.value;
    if (!isNaN(val) && val > 0) {
        updateSelectedTextProperty('lineHeight', val);
    }
});

tbLineHeightInput.addEventListener('input', function() {
    const val = parseFloat(this.value);
    lineHeightInput.value = this.value;
    if (!isNaN(val) && val > 0) {
        updateSelectedTextProperty('lineHeight', val);
    }
});

tbFontFamilySelect.addEventListener('change', function() {
    this.style.fontFamily = `"${this.value}", sans-serif`;
    fontFamilySelect.value = this.value;
    fontFamilySelect.style.fontFamily = `"${this.value}", sans-serif`;
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('fontFamily', this.value);
        canvas.renderAll();
    }
});

btnBold.addEventListener('click', function() {
    const activeObj = canvas.getActiveObject();
    const isBold = this.classList.contains('active');
    tbBtnBold.classList.toggle('active', !isBold);
    this.classList.toggle('active', !isBold);
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('fontWeight', !isBold ? 'bold' : 'normal');
        canvas.renderAll();
    }
});

tbBtnBold.addEventListener('click', function() {
    const activeObj = canvas.getActiveObject();
    const isBold = this.classList.contains('active');
    btnBold.classList.toggle('active', !isBold);
    this.classList.toggle('active', !isBold);
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('fontWeight', !isBold ? 'bold' : 'normal');
        canvas.renderAll();
    }
});

btnItalic.addEventListener('click', function() {
    const activeObj = canvas.getActiveObject();
    const isItalic = this.classList.contains('active');
    tbBtnItalic.classList.toggle('active', !isItalic);
    this.classList.toggle('active', !isItalic);
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('fontStyle', !isItalic ? 'italic' : 'normal');
        canvas.renderAll();
    }
});

tbBtnItalic.addEventListener('click', function() {
    const activeObj = canvas.getActiveObject();
    const isItalic = this.classList.contains('active');
    btnItalic.classList.toggle('active', !isItalic);
    this.classList.toggle('active', !isItalic);
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('fontStyle', !isItalic ? 'italic' : 'normal');
        canvas.renderAll();
    }
});

btnUnderline.addEventListener('click', function() {
    const activeObj = canvas.getActiveObject();
    const hasUnderline = this.classList.contains('active');
    tbBtnUnderline.classList.toggle('active', !hasUnderline);
    this.classList.toggle('active', !hasUnderline);
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('underline', !hasUnderline);
        canvas.renderAll();
    }
});

tbBtnUnderline.addEventListener('click', function() {
    const activeObj = canvas.getActiveObject();
    const hasUnderline = this.classList.contains('active');
    btnUnderline.classList.toggle('active', !hasUnderline);
    this.classList.toggle('active', !hasUnderline);
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('underline', !hasUnderline);
        canvas.renderAll();
    }
});

btnStrike.addEventListener('click', function() {
    const activeObj = canvas.getActiveObject();
    const hasStrike = this.classList.contains('active');
    tbBtnStrike.classList.toggle('active', !hasStrike);
    this.classList.toggle('active', !hasStrike);
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('linethrough', !hasStrike);
        canvas.renderAll();
    }
});

tbBtnStrike.addEventListener('click', function() {
    const activeObj = canvas.getActiveObject();
    const hasStrike = this.classList.contains('active');
    btnStrike.classList.toggle('active', !hasStrike);
    this.classList.toggle('active', !hasStrike);
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('linethrough', !hasStrike);
        canvas.renderAll();
    }
});

btnOverline.addEventListener('click', function() {
    const activeObj = canvas.getActiveObject();
    const hasOverline = this.classList.contains('active');
    tbBtnOverline.classList.toggle('active', !hasOverline);
    this.classList.toggle('active', !hasOverline);
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('overline', !hasOverline);
        canvas.renderAll();
    }
});

tbBtnOverline.addEventListener('click', function() {
    const activeObj = canvas.getActiveObject();
    const hasOverline = this.classList.contains('active');
    btnOverline.classList.toggle('active', !hasOverline);
    this.classList.toggle('active', !hasOverline);
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('overline', !hasOverline);
        canvas.renderAll();
    }
});

tbAlignButtons.forEach(button => {
    button.addEventListener('click', function() {
        tbAlignButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        alignButtons.forEach(b => {
            b.classList.remove('active');
            if (b.dataset.align === this.dataset.align) b.classList.add('active');
        });

        const selectedAlignment = this.dataset.align;
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.type === 'i-text') {
            activeObj.set('textAlign', selectedAlignment);
            canvas.renderAll();
        }
    });
});

alignButtons.forEach(button => {
    button.addEventListener('click', function() {
        alignButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        tbAlignButtons.forEach(b => {
            b.classList.remove('active');
            if (b.dataset.align === this.dataset.align) b.classList.add('active');
        });

        const selectedAlignment = this.dataset.align;
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj.type === 'i-text') {
            activeObj.set('textAlign', selectedAlignment);
            canvas.renderAll();
        }
    });
});

function updateSelectedTextProperty(prop, value) {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set(prop, value);
        canvas.renderAll();
    }
}

// Live Text Content Input Editor
textStringInput.addEventListener('input', function() {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'i-text') {
        activeObj.set('text', this.value);
        canvas.renderAll();
    }
});

// Tab & Collapsible Panel Management
const tabItems = document.querySelectorAll('.tab-strip .tab-item');
const tabPanels = document.querySelectorAll('.tab-panel-container .tab-panel');
const tabPanelContainer = document.getElementById('tabPanelContainer');
const collapsePanelBtn = document.getElementById('collapsePanelBtn');

tabItems.forEach(item => {
    item.addEventListener('click', function() {
        const targetTab = this.dataset.tab;
        
        if (this.classList.contains('active')) {
            togglePanelCollapse();
            return;
        }

        tabItems.forEach(i => i.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        this.classList.add('active');
        document.getElementById(`panel-${targetTab}`).classList.add('active');

        if (tabPanelContainer.classList.contains('collapsed')) {
            tabPanelContainer.classList.remove('collapsed');
            updateCollapseButtonIcon(false);
        }
    });
});

collapsePanelBtn.addEventListener('click', () => {
    togglePanelCollapse();
});

function togglePanelCollapse() {
    const isCollapsed = tabPanelContainer.classList.toggle('collapsed');
    updateCollapseButtonIcon(isCollapsed);

    if (isCollapsed) {
        tabItems.forEach(i => i.classList.remove('active'));
    } else {
        const activePanel = document.querySelector('.tab-panel-container .tab-panel.active');
        if (activePanel) {
            const activeTabName = activePanel.id.replace('panel-', '');
            const matchingTab = document.querySelector(`.tab-strip .tab-item[data-tab="${activeTabName}"]`);
            if (matchingTab) matchingTab.classList.add('active');
        }
    }
}

function updateCollapseButtonIcon(isCollapsed) {
    const icon = collapsePanelBtn.querySelector('i');
    if (isCollapsed) {
        icon.className = 'fa-solid fa-chevron-right';
    } else {
        icon.className = 'fa-solid fa-chevron-left';
    }
}

// Canva style Text Spawners
const addTextBoxBtn = document.getElementById('addTextBoxBtn');
const addHeadingBtn = document.getElementById('addHeadingBtn');
const addSubheadingBtn = document.getElementById('addSubheadingBtn');
const addBodyTextBtn = document.getElementById('addBodyTextBtn');

function addTextToCanvas(text, size, weight) {
    const chosenFont = fontFamilySelect.value;
    const activeAlign = document.querySelector('.align-group .align-btn.active').dataset.align;

    const isItalic = btnItalic.classList.contains('active');
    const hasUnderline = btnUnderline.classList.contains('active');
    const hasStrike = btnStrike.classList.contains('active');
    const hasOverline = btnOverline.classList.contains('active');
    const lHeight = parseFloat(lineHeightInput.value) || 1.1;

    const textItem = new fabric.IText(text, {
        left: baseWidth / 2,
        top: baseHeight / 4,
        originX: 'center',
        originY: 'center',
        fontFamily: chosenFont,
        fontSize: size,
        lineHeight: lHeight,
        fill: textColorPicker.value,
        textAlign: activeAlign,
        fontWeight: weight,
        fontStyle: isItalic ? 'italic' : 'normal',
        underline: hasUnderline,
        linethrough: hasStrike,
        overline: hasOverline,
        cornerColor: '#8b3dff',
        cornerSize: 12,
        transparentCorners: false,
        cornerStyle: 'circle',
        borderColor: '#8b3dff'
    });

    canvas.add(textItem);
    


    canvas.setActiveObject(textItem);
    canvas.renderAll();
}

addTextBoxBtn.addEventListener('click', function() {
    const val = parseInt(fontSizeInput.value, 10) || 36;
    const isBold = btnBold.classList.contains('active');
    addTextToCanvas('Your Text Here', val, isBold ? 'bold' : 'normal');
});

addHeadingBtn.addEventListener('click', function() {
    addTextToCanvas('Add a heading', 48, 'bold');
});

addSubheadingBtn.addEventListener('click', function() {
    addTextToCanvas('Add a subheading', 32, 'bold');
});

addBodyTextBtn.addEventListener('click', function() {
    addTextToCanvas('Add a little bit of body text', 18, 'normal');
});

// --- SHAPE GENERATION UTILITIES ---
function getRegularPolygonPoints(sides, radius) {
    const points = [];
    const angle = (2 * Math.PI) / sides;
    for (let i = 0; i < sides; i++) {
        const currAngle = i * angle - Math.PI / 2;
        points.push({
            x: radius + radius * Math.cos(currAngle),
            y: radius + radius * Math.sin(currAngle)
        });
    }
    return points;
}

// Custom generator for star points (arms & inner depth)
function getStarPoints(points, outerRadius, innerRadius) {
    const results = [];
    const angle = Math.PI / points;
    const center = outerRadius;
    for (let i = 0; i < 2 * points; i++) {
        const r = (i % 2 === 0) ? outerRadius : innerRadius;
        const currAngle = i * angle - Math.PI / 2;
        results.push({
            x: center + r * Math.cos(currAngle),
            y: center + r * Math.sin(currAngle)
        });
    }
    return results;
}

// --- SHAPE SPAWNING ENGINE ---
function addShapeToCanvas(shapeType) {
    const sharedOptions = {
        left: baseWidth / 2,
        top: baseHeight / 2,
        originX: 'center',
        originY: 'center',
        fill: '#111111',
        stroke: '#000000',
        strokeWidth: 0,
        opacity: 1,
        cornerColor: '#8b3dff',
        cornerSize: 12,
        transparentCorners: false,
        cornerStyle: 'circle',
        borderColor: '#8b3dff',
        isShapeElement: true
    };

    let shapeObj = null;

    switch (shapeType) {
        case 'square':
            shapeObj = new fabric.Rect({
                width: 120,
                height: 120,
                rx: 0,
                ry: 0,
                ...sharedOptions
            });
            break;
        case 'rounded-square':
            shapeObj = new fabric.Rect({
                width: 120,
                height: 120,
                rx: 16,
                ry: 16,
                ...sharedOptions
            });
            break;
        case 'circle':
            shapeObj = new fabric.Circle({
                radius: 60,
                ...sharedOptions
            });
            break;
        case 'triangle':
            shapeObj = new fabric.Triangle({
                width: 120,
                height: 120,
                ...sharedOptions
            });
            break;
        case 'right-triangle':
            shapeObj = new fabric.Polygon([
                { x: 0, y: 0 },
                { x: 120, y: 120 },
                { x: 0, y: 120 }
            ], sharedOptions);
            break;
        case 'pentagon':
            shapeObj = new fabric.Polygon(getRegularPolygonPoints(5, 60), sharedOptions);
            break;
        case 'hexagon':
            shapeObj = new fabric.Polygon(getRegularPolygonPoints(6, 60), sharedOptions);
            break;
        case 'octagon':
            shapeObj = new fabric.Polygon(getRegularPolygonPoints(8, 60), sharedOptions);
            break;
        case 'decagon':
            shapeObj = new fabric.Polygon(getRegularPolygonPoints(10, 60), sharedOptions);
            break;
        case 'star-4':
            shapeObj = new fabric.Polygon(getStarPoints(4, 60, 24), sharedOptions);
            break;
        case 'star-5':
            shapeObj = new fabric.Polygon(getStarPoints(5, 60, 24), sharedOptions);
            break;
        case 'star-6':
            shapeObj = new fabric.Polygon(getStarPoints(6, 60, 28), sharedOptions);
            break;
        case 'star-8':
            shapeObj = new fabric.Polygon(getStarPoints(8, 60, 32), sharedOptions);
            break;
        case 'star-12':
            shapeObj = new fabric.Polygon(getStarPoints(12, 60, 42), sharedOptions);
            break;
        case 'arrow-right':
            shapeObj = new fabric.Path('M 10 35 L 60 35 L 60 15 L 90 50 L 60 85 L 60 65 L 10 65 Z', sharedOptions);
            break;
        case 'arrow-left':
            shapeObj = new fabric.Path('M 90 35 L 40 35 L 40 15 L 10 50 L 40 85 L 40 65 L 90 65 Z', sharedOptions);
            break;
        case 'arrow-up':
            shapeObj = new fabric.Path('M 35 90 L 35 40 L 15 40 L 50 10 L 85 40 L 65 40 L 65 90 Z', sharedOptions);
            break;
        case 'arrow-down':
            shapeObj = new fabric.Path('M 35 10 L 35 60 L 15 60 L 50 90 L 85 60 L 65 60 L 65 10 Z', sharedOptions);
            break;
        case 'arrow-double':
            shapeObj = new fabric.Path('M 35 35 L 65 35 L 65 15 L 95 50 L 65 85 L 65 65 L 35 65 L 35 85 L 5 50 L 35 15 Z', sharedOptions);
            break;
    }

    if (shapeObj) {
        if (shapeObj.type === 'path') {
            const scale = 120 / Math.max(shapeObj.width, shapeObj.height);
            shapeObj.set({ scaleX: scale, scaleY: scale });
        }
        
        canvas.add(shapeObj);
        

        
        canvas.setActiveObject(shapeObj);
        canvas.renderAll();
    }
}

// Bind clicks on sidebar shape buttons
document.querySelectorAll('.shape-item').forEach(item => {
    item.addEventListener('click', function() {
        const shapeType = this.dataset.shape;
        if (shapeType) {
            addShapeToCanvas(shapeType);
        }
    });
});

// --- SHAPE PROPERTY CONTROLS EVENT HANDLERS ---
function updateSelectedShapeProperty(prop, value) {
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.isShapeElement) {
        activeObj.set(prop, value);
        canvas.renderAll();
    }
}

elFillColorPicker.addEventListener('input', function() {
    const color = this.value;
    elFillColorHex.value = color.toUpperCase();
    updateSelectedShapeProperty('fill', color);
});

elFillColorHex.addEventListener('input', function() {
    let color = this.value.trim();
    if (!color.startsWith('#')) {
        color = '#' + color;
    }
    if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
        elFillColorPicker.value = color;
        updateSelectedShapeProperty('fill', color);
    }
});

elOpacitySlider.addEventListener('input', function() {
    const pct = parseInt(this.value, 10);
    elOpacityVal.textContent = pct + '%';
    updateSelectedShapeProperty('opacity', pct / 100);
});

elStrokeWidthInput.addEventListener('input', function() {
    const width = parseInt(this.value, 10) || 0;
    updateSelectedShapeProperty('strokeWidth', width);
});

elStrokeColorPicker.addEventListener('input', function() {
    const color = this.value;
    elStrokeColorHex.value = color.toUpperCase();
    updateSelectedShapeProperty('stroke', color);
});

elStrokeColorHex.addEventListener('input', function() {
    let color = this.value.trim();
    if (!color.startsWith('#')) {
        color = '#' + color;
    }
    if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
        elStrokeColorPicker.value = color;
        updateSelectedShapeProperty('stroke', color);
    }
});

elCornerRadiusSlider.addEventListener('input', function() {
    const radius = parseInt(this.value, 10);
    elCornerRadiusVal.textContent = radius + 'px';
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === 'rect') {
        activeObj.set({ rx: radius, ry: radius });
        canvas.renderAll();
    }
});

// --- TOP MENU BAR & FILE DROPDOWN EVENT HANDLERS ---
const fileMenuBtn = document.getElementById('fileMenuBtn');
const fileMenuDropdown = document.getElementById('fileMenuDropdown');
const menuNewDesignBtn = document.getElementById('menuNewDesignBtn');

fileMenuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    fileMenuDropdown.classList.toggle('open');
});

document.addEventListener('click', function() {
    fileMenuDropdown.classList.remove('open');
});

menuNewDesignBtn.addEventListener('click', function(e) {
    e.preventDefault();
    sizeModal.classList.remove('hidden');
});

function toggleLockActiveObject() {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;
    
    const shouldLock = !activeObj.isLocked;
    
    activeObj.set({
        isLocked: shouldLock,
        // Disable movements and scaling
        lockMovementX: shouldLock,
        lockMovementY: shouldLock,
        lockScalingX: shouldLock,
        lockScalingY: shouldLock,
        lockRotation: shouldLock,
        lockScalingFlip: shouldLock,
        lockSkewingX: shouldLock,
        lockSkewingY: shouldLock,
        hasControls: !shouldLock,
        // For text elements
        editable: !shouldLock,
        // Style feedback
        borderColor: shouldLock ? '#e74c3c' : '#8b3dff',
        cornerColor: shouldLock ? '#e74c3c' : '#8b3dff'
    });
    
    // Refresh selection styling in Fabric.js
    canvas.discardActiveObject();
    canvas.setActiveObject(activeObj);
    canvas.renderAll();
    
    updateSidebarControlsFromCanvasSelection();
}

// Bind Lock Button Click Handlers
tbBtnLock.addEventListener('click', toggleLockActiveObject);
elBtnLock.addEventListener('click', toggleLockActiveObject);
sidebarLockBtn.addEventListener('click', toggleLockActiveObject);

function duplicateActiveObject() {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.isLocked) return;

    activeObj.clone(function(clonedObj) {
        canvas.discardActiveObject();
        
        clonedObj.set({
            left: clonedObj.left + 20,
            top: clonedObj.top + 20,
            evented: true
        });

        if (clonedObj.type === 'activeSelection') {
            clonedObj.canvas = canvas;
            clonedObj.forEachObject(function(obj) {
                canvas.add(obj);
            });
            clonedObj.setCoords();
        } else {
            canvas.add(clonedObj);
        }

        canvas.setActiveObject(clonedObj);
        canvas.requestRenderAll();
        updateSidebarControlsFromCanvasSelection();
    }, ['isShapeElement']);
}

// Align active element to canvas left, center, right
function alignActiveObject(alignment) {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.isLocked) return;

    // Get absolute bounding box of the active object (ignoring viewport scale/pan)
    const rect = activeObj.getBoundingRect(true);
    let diff = 0;

    if (alignment === 'left') {
        diff = -rect.left;
    } else if (alignment === 'center') {
        diff = (baseWidth / 2) - (rect.left + rect.width / 2);
    } else if (alignment === 'right') {
        diff = baseWidth - (rect.left + rect.width);
    }

    activeObj.set({
        left: activeObj.left + diff
    });
    activeObj.setCoords();
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: activeObj });
}

// Bind Duplicate Click Handlers
if (tbBtnDuplicate) tbBtnDuplicate.addEventListener('click', duplicateActiveObject);
if (elBtnDuplicate) elBtnDuplicate.addEventListener('click', duplicateActiveObject);

// Bind Canvas Alignment Click Handlers
if (tbBtnCanvasAlignLeft) tbBtnCanvasAlignLeft.addEventListener('click', function(e) { e.preventDefault(); alignActiveObject('left'); });
if (tbBtnCanvasAlignCenter) tbBtnCanvasAlignCenter.addEventListener('click', function(e) { e.preventDefault(); alignActiveObject('center'); });
if (tbBtnCanvasAlignRight) tbBtnCanvasAlignRight.addEventListener('click', function(e) { e.preventDefault(); alignActiveObject('right'); });
if (elBtnCanvasAlignLeft) elBtnCanvasAlignLeft.addEventListener('click', function(e) { e.preventDefault(); alignActiveObject('left'); });
if (elBtnCanvasAlignCenter) elBtnCanvasAlignCenter.addEventListener('click', function(e) { e.preventDefault(); alignActiveObject('center'); });
if (elBtnCanvasAlignRight) elBtnCanvasAlignRight.addEventListener('click', function(e) { e.preventDefault(); alignActiveObject('right'); });

// Initialize Zoom control state to fit the viewport on start
fitCanvasToViewport();

// --- TEMPLATES SAVE & LOAD ENGINE ---
const API_BASE = window.location.protocol.startsWith('file') ? 'http://localhost:3000' : '';

function loadTemplatesList() {
    // Try to fetch templates.json as a static relative file first (works on any static host or Live Server)
    fetch('assets/templates/templates.json')
    .then(response => {
        if (!response.ok) throw new Error("Static templates.json fetch failed");
        return response.json();
    })
    .then(templates => {
        renderTemplatesGrid(templates, false);
    })
    .catch(err => {
        console.warn("Could not fetch templates.json relatively, falling back to local server URL...", err);
        // Fallback: fetch directly from local Node server templates file
        fetch('http://localhost:3000/assets/templates/templates.json')
        .then(response => {
            if (!response.ok) throw new Error("Node server templates fetch failed");
            return response.json();
        })
        .then(templates => {
            renderTemplatesGrid(templates, true);
        })
        .catch(e => {
            console.error("Failed to load templates list from both relative and server sources:", e);
            renderTemplatesGrid([], false);
        });
    });
}

function renderTemplatesGrid(templates, useServerBase) {
    const grid = document.getElementById('templatesGrid');
    const modalGrid = document.getElementById('modalTemplatesGrid');

    if (grid) {
        populateGrid(grid, templates, useServerBase, 2);
    }
    if (modalGrid) {
        populateGrid(modalGrid, templates, useServerBase, 2);
    }
}

function populateGrid(grid, templates, useServerBase, spanCount) {
    if (templates.length === 0) {
        grid.innerHTML = `<p style="font-size: 11px; color: #868e96; text-align: center; margin-top: 20px; width: 100%; grid-column: span ${spanCount};">No templates saved yet.</p>`;
        return;
    }

    grid.innerHTML = '';

    templates.forEach(tpl => {
        const cleanName = getCleanName(tpl.name);
        const card = document.createElement('div');
        card.className = 'template-card';
        card.title = `Load template: ${cleanName}`;

        const img = document.createElement('img');
        let thumbUrl = tpl.thumbnail;
        if (thumbUrl && !thumbUrl.startsWith('data:') && !thumbUrl.startsWith('http')) {
            const base = useServerBase ? 'http://localhost:3000' : '';
            if (thumbUrl.startsWith('/')) {
                thumbUrl = base + thumbUrl;
            } else {
                thumbUrl = base + '/' + thumbUrl;
            }
        }
        img.src = thumbUrl;
        img.alt = cleanName;

        const info = document.createElement('div');
        info.className = 'template-card-info';
        info.textContent = cleanName;

        card.appendChild(img);
        card.appendChild(info);

        card.addEventListener('click', () => {
            loadTemplateIntoCanvas(tpl, useServerBase);
        });

        grid.appendChild(card);
    });
}

function loadTemplateIntoCanvas(tpl, useServerBase) {
    const cleanName = getCleanName(tpl.name);
    showConfirm(`Are you sure you want to load template "${cleanName}"? This will discard your current canvas.`).then(confirmLoad => {
        if (!confirmLoad) return;

        const applyCanvasData = (canvasData) => {
            canvas.clear();
            
            textToolbar.classList.remove('visible');
            elementToolbar.classList.remove('visible');

            const parsedData = typeof canvasData === 'string' ? JSON.parse(canvasData) : canvasData;
            const canvasObjects = parsedData.canvas ? parsedData.canvas : parsedData;
            
            // Update base dimensions using metadata from file if available, falling back to tpl or defaults
            baseWidth = parsedData.width || tpl.width || 595;
            baseHeight = parsedData.height || tpl.height || 842;

            canvas.loadFromJSON(canvasObjects, () => {
                // Enforce isLocked flags and control constraints when importing objects back
                canvas.getObjects().forEach(obj => {
                    if (obj.isLocked) {
                        obj.set({
                            lockMovementX: true,
                            lockMovementY: true,
                            lockScalingX: true,
                            lockScalingY: true,
                            lockRotation: true,
                            lockScalingFlip: true,
                            lockSkewingX: true,
                            lockSkewingY: true,
                            hasControls: false,
                            editable: false,
                            borderColor: '#e74c3c',
                            cornerColor: '#e74c3c'
                        });
                    } else {
                        obj.set({
                            cornerColor: '#8b3dff',
                            borderColor: '#8b3dff',
                            cornerSize: 12,
                            transparentCorners: false,
                            cornerStyle: 'circle'
                        });
                    }
                });

                canvas.renderAll();
                fitCanvasToViewport();
                updateSidebarControlsFromCanvasSelection();

                // Close start dialog
                sizeModal.classList.add('hidden');
                showToast(`Template "${cleanName}" loaded successfully!`, 'success');
            });
        };

        if (tpl.source) {
            let fetchUrl = tpl.source;
            if (!fetchUrl.startsWith('/') && !fetchUrl.startsWith('http')) {
                fetchUrl = '/' + fetchUrl;
            }
            if (!fetchUrl.startsWith('http')) {
                const base = useServerBase ? 'http://localhost:3000' : '';
                fetchUrl = base + fetchUrl;
            }

            fetch(fetchUrl)
            .then(response => {
                if (!response.ok) throw new Error("Could not download template JSON source.");
                return response.json();
            })
            .then(canvasData => {
                applyCanvasData(canvasData);
            })
            .catch(err => {
                console.error("Error loading template from server:", err);
                showToast("Failed to load template from server: " + err.message, 'error');
            });
        } else {
            applyCanvasData(tpl.canvas);
        }
    });
}

// Load templates on launch
loadTemplatesList();

// --- ARTWORK JSON EXPORT & IMPORT SYSTEM ---
const exportJsonBtn = document.getElementById('exportJsonBtn');
const menuExportJsonBtn = document.getElementById('menuExportJsonBtn');
const menuImportJsonBtn = document.getElementById('menuImportJsonBtn');
const importJsonInput = document.getElementById('importJsonInput');

if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', function(e) {
        e.preventDefault();
        exportArtworkJson();
    });
}

if (menuExportJsonBtn) {
    menuExportJsonBtn.addEventListener('click', function(e) {
        e.preventDefault();
        exportArtworkJson();
    });
}

if (menuImportJsonBtn && importJsonInput) {
    menuImportJsonBtn.addEventListener('click', function(e) {
        e.preventDefault();
        importJsonInput.click();
    });

    importJsonInput.addEventListener('change', handleImportJson);
}

function exportArtworkJson() {
    showSaveTemplatePrompt("My Card Design").then(result => {
        if (!result) return;
        const { designName, timestamp } = result;

        // Sanitize design name to create a safe filename
        const sanitizedName = designName.trim().replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '-');
        const baseFilename = `${sanitizedName}-${timestamp}`;

        canvas.discardActiveObject();
        canvas.requestRenderAll();

        const currentZoom = parseInt(canvasZoomSlider.value, 10);
        
        // Scale to 100% to capture clean thumbnail
        applyZoom(100);

        setTimeout(() => {
            const fullSizeThumbnail = canvas.toDataURL({ format: 'png', quality: 0.9 });
            
            // Restore previous zoom
            applyZoom(currentZoom);

            resizeThumbnail(fullSizeThumbnail, (resizedThumbnailData) => {
                const customProps = [
                    'isShapeElement', 'isLocked', 'lockMovementX', 'lockMovementY', 
                    'lockScalingX', 'lockScalingY', 'lockRotation', 'lockScalingFlip', 
                    'lockSkewingX', 'lockSkewingY', 'hasControls', 'editable', 
                    'borderColor', 'cornerColor'
                ];
                const canvasJson = canvas.toJSON(customProps);

                const artworkData = {
                    name: `${designName.trim()}-${timestamp}`,
                    version: "1.0",
                    width: baseWidth,
                    height: baseHeight,
                    canvas: canvasJson
                };

                // 1. Download JSON file
                const jsonString = JSON.stringify(artworkData, null, 2);
                const jsonBlob = new Blob([jsonString], { type: "application/json" });
                const jsonUrl = URL.createObjectURL(jsonBlob);

                const jsonLink = document.createElement('a');
                jsonLink.href = jsonUrl;
                jsonLink.download = baseFilename + '.json';
                document.body.appendChild(jsonLink);
                jsonLink.click();
                document.body.removeChild(jsonLink);
                URL.revokeObjectURL(jsonUrl);

                // 2. Download Thumbnail Image (PNG) - resized to 110px width!
                const imgLink = document.createElement('a');
                imgLink.href = resizedThumbnailData;
                imgLink.download = baseFilename + '.png';
                document.body.appendChild(imgLink);
                imgLink.click();
                document.body.removeChild(imgLink);

                // 3. Auto-Register as a server Template
                const payload = {
                    id: timestamp,
                    name: `${designName.trim()}-${timestamp}`,
                    filename: baseFilename,
                    width: baseWidth,
                    height: baseHeight,
                    canvas: canvasJson,
                    thumbnail: resizedThumbnailData
                };

                fetch(API_BASE + '/api/save-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    if (!response.ok) throw new Error("API Offline");
                    return response.json();
                })
                .then(data => {
                    console.log("Automatically added exported artwork as a template on the server.");
                    loadTemplatesList();
                })
                .catch(err => {
                    console.error("Server offline. Could not register exported template on server:", err);
                });
            });
        }, 50);
    });
}


function handleImportJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            if (!data.canvas) {
                showToast("Invalid file format. The file is not a valid Pixora Design JSON file.", 'error');
                return;
            }

            showConfirm("Are you sure you want to load this JSON design? Your current canvas will be overwritten.").then(confirmImport => {
                if (!confirmImport) {
                    e.target.value = '';
                    return;
                }

                canvas.clear();

                // Set size
                baseWidth = data.width || 595;
                baseHeight = data.height || 842;

                textToolbar.classList.remove('visible');
                elementToolbar.classList.remove('visible');

                const canvasData = typeof data.canvas === 'string' ? JSON.parse(data.canvas) : data.canvas;

                canvas.loadFromJSON(canvasData, () => {
                    canvas.getObjects().forEach(obj => {
                        if (obj.isLocked) {
                            obj.set({
                                lockMovementX: true,
                                lockMovementY: true,
                                lockScalingX: true,
                                lockScalingY: true,
                                lockRotation: true,
                                lockScalingFlip: true,
                                lockSkewingX: true,
                                lockSkewingY: true,
                                hasControls: false,
                                editable: false,
                                borderColor: '#e74c3c',
                                cornerColor: '#e74c3c'
                            });
                        } else {
                            obj.set({
                                cornerColor: '#8b3dff',
                                borderColor: '#8b3dff',
                                cornerSize: 12,
                                transparentCorners: false,
                                cornerStyle: 'circle'
                            });
                        }
                    });

                    canvas.renderAll();
                    fitCanvasToViewport();
                    updateSidebarControlsFromCanvasSelection();

                    // Close start dialog modal
                    sizeModal.classList.add('hidden');

                    showToast("Design loaded successfully!", 'success');
                });
            });

        } catch (err) {
            console.error("JSON parsing error:", err);
            showToast("Failed to parse JSON design: " + err.message, 'error');
        }

        // Reset file input so same file can be reloaded
        e.target.value = '';
    };
    reader.readAsText(file);
}
