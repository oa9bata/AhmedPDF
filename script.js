const SUPABASE_URL = window.ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.ENV.API_KEY;

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentLanguage = 'en';
let contentItems = [];
let isConverting = false;

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthState();
});

function initializeApp() {
    loadLanguagePreference();
    applyLanguage();
}

function loadLanguagePreference() {
    const savedLanguage = localStorage.getItem('pdfConverterLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
    }
}

function setupEventListeners() {
    document.getElementById('languageBtn').addEventListener('click', toggleLanguage);
    document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('imageInput').click());
    document.getElementById('imageInput').addEventListener('change', handleImageUpload);
    document.getElementById('addTextBtn').addEventListener('click', showTextInput);
    document.getElementById('saveTextBtn').addEventListener('click', saveTextContent);
    document.getElementById('cancelTextBtn').addEventListener('click', hideTextInput);
    document.getElementById('convertBtn').addEventListener('click', convertToPDF);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllContent);
    document.getElementById('donateBtn').addEventListener('click', showDonationModal);
    document.getElementById('closeDonationModal').addEventListener('click', hideDonationModal);
    
    // Add event listeners for text input direction
    const titleInput = document.getElementById('textTitleInput');
    const contentInput = document.getElementById('textContentInput');
    
    if (titleInput) {
        titleInput.addEventListener('input', updateTextDirection);
    }
    if (contentInput) {
        contentInput.addEventListener('input', updateTextDirection);
    }
    
    setupDragAndDrop();
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    localStorage.setItem('pdfConverterLanguage', currentLanguage);
    applyLanguage();
}

function applyLanguage() {
    const elements = document.querySelectorAll('[data-en][data-ar]');
    elements.forEach(element => {
        const text = currentLanguage === 'en' ? element.getAttribute('data-en') : element.getAttribute('data-ar');
        element.textContent = text;
    });
    
    // Update placeholders for input fields
    const titleInput = document.getElementById('textTitleInput');
    const contentInput = document.getElementById('textContentInput');
    
    if (titleInput) {
        const placeholder = currentLanguage === 'en' ? 
            titleInput.getAttribute('data-en-placeholder') : 
            titleInput.getAttribute('data-ar-placeholder');
        titleInput.placeholder = placeholder;
        
        // Update text direction based on language
        if (currentLanguage === 'ar') {
            titleInput.style.textAlign = 'right';
            titleInput.style.direction = 'rtl';
        } else {
            titleInput.style.textAlign = 'left';
            titleInput.style.direction = 'ltr';
        }
    }
    
    if (contentInput) {
        const placeholder = currentLanguage === 'en' ? 
            contentInput.getAttribute('data-en-placeholder') : 
            contentInput.getAttribute('data-ar-placeholder');
        contentInput.placeholder = placeholder;
        
        // Update text direction based on language
        if (currentLanguage === 'ar') {
            contentInput.style.textAlign = 'right';
            contentInput.style.direction = 'rtl';
        } else {
            contentInput.style.textAlign = 'left';
            contentInput.style.direction = 'ltr';
        }
    }
    
    document.body.className = currentLanguage === 'ar' ? 
        'bg-gradient-to-br from-white via-purple-50 to-purple-100 min-h-screen font-arabic' : 
        'bg-gradient-to-br from-white via-purple-50 to-purple-100 min-h-screen font-inter';
    
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    
    const languageBtn = document.getElementById('languageBtn');
    const languageText = languageBtn.querySelector('span');
    languageText.textContent = currentLanguage === 'en' ? 'EN' : 'عربي';
}

async function checkAuthState() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        showProfileUI(user);
        checkAdminAccess(user);
    } else {
        showSignInUI();
    }
}

function checkAdminAccess(user) {
    if (user.email === window.ENV.ADMIN_EMAIL) {
        const analyticsLink = document.getElementById('analyticsLink');
        analyticsLink.classList.remove('hidden');
    }
}

function showProfileUI(user) {
    document.getElementById('signInBtn').classList.add('hidden');
    document.getElementById('profileBtn').classList.remove('hidden');
    
    loadProfileData(user);
}

function showSignInUI() {
    document.getElementById('signInBtn').classList.remove('hidden');
    document.getElementById('profileBtn').classList.add('hidden');
}

async function loadProfileData(user) {
    try {
        // First try to get the profile
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
        
        if (error) {
            console.error('Error fetching profile:', error);
        }
        
        let finalProfile = profile;
        
        // If no profile exists, create one
        if (!profile) {
            const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.raw_user_meta_data?.full_name || '',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();
            
            if (createError) {
                console.error('Error creating profile:', createError);
            } else {
                finalProfile = newProfile;
            }
        }
        
        if (finalProfile && !finalProfile.full_name && (user.user_metadata?.full_name || user.raw_user_meta_data?.full_name)) {
            const fullName = user.user_metadata?.full_name || user.raw_user_meta_data?.full_name;
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ full_name: fullName })
                .eq('id', user.id);
            
            if (!updateError) {
                finalProfile.full_name = fullName;
            }
        }
        
        if (finalProfile) {
            const displayName = finalProfile.full_name || user.email;
            document.getElementById('profileName').textContent = displayName;
            document.getElementById('dropdownName').textContent = displayName;
            document.getElementById('dropdownEmail').textContent = user.email;
            
            if (finalProfile.avatar_url) {
                document.getElementById('profileAvatar').src = finalProfile.avatar_url;
                document.getElementById('dropdownAvatar').src = finalProfile.avatar_url;
            } else {
                const initial = displayName.charAt(0).toUpperCase();
                const svgPlaceholder = `data:image/svg+xml;base64,${btoa(`
                    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="32" fill="#8B5CF6"/>
                        <text x="16" y="22" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">${initial}</text>
                    </svg>
                `)}`;
                document.getElementById('profileAvatar').src = svgPlaceholder;
                document.getElementById('dropdownAvatar').src = svgPlaceholder;
            }
            
            const { data: donations } = await supabase
                .from('donations')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'completed');
            
            if (donations && donations.length > 0) {
                document.getElementById('donorBadge').classList.remove('hidden');
                document.getElementById('dropdownDonorBadge').classList.remove('hidden');
            }
        } else {
            document.getElementById('profileName').textContent = user.email;
            document.getElementById('dropdownName').textContent = user.email;
            document.getElementById('dropdownEmail').textContent = user.email;
            
            const initial = user.email.charAt(0).toUpperCase();
            const svgPlaceholder = `data:image/svg+xml;base64,${btoa(`
                <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" fill="#8B5CF6"/>
                    <text x="16" y="22" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">${initial}</text>
                </svg>
            `)}`;
            document.getElementById('profileAvatar').src = svgPlaceholder;
            document.getElementById('dropdownAvatar').src = svgPlaceholder;
        }
        
    } catch (error) {
        console.error('Error loading profile data:', error);
        document.getElementById('profileName').textContent = user.email;
        document.getElementById('dropdownName').textContent = user.email;
        document.getElementById('dropdownEmail').textContent = user.email;
    }
}

function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        handleFiles(files);
    });
}

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length === 0) return;
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                addImageContent(e.target.result, file.name);
            };
            reader.readAsDataURL(file);
        }
    });
}

function addImageContent(src, filename) {
    const item = {
        id: generateId(),
        type: 'image',
        src: src,
        filename: filename,
        timestamp: Date.now()
    };
    
    contentItems.push(item);
    updateContentDisplay();
}

function showTextInput() {
    document.getElementById('textInputContainer').classList.remove('hidden');
    const titleInput = document.getElementById('textTitleInput');
    titleInput.focus();
    
    // Reset text direction based on current language
    if (currentLanguage === 'ar') {
        titleInput.style.textAlign = 'right';
        titleInput.style.direction = 'rtl';
        document.getElementById('textContentInput').style.textAlign = 'right';
        document.getElementById('textContentInput').style.direction = 'rtl';
    } else {
        titleInput.style.textAlign = 'left';
        titleInput.style.direction = 'ltr';
        document.getElementById('textContentInput').style.textAlign = 'left';
        document.getElementById('textContentInput').style.direction = 'ltr';
    }
}

function hideTextInput() {
    document.getElementById('textInputContainer').classList.add('hidden');
    document.getElementById('textTitleInput').value = '';
    document.getElementById('textContentInput').value = '';
}

function saveTextContent() {
    const title = document.getElementById('textTitleInput').value.trim();
    const content = document.getElementById('textContentInput').value.trim();
    
    if (!title || !content) {
        showPopup(currentLanguage === 'en' ? 'Please fill in both title and content' : 'يرجى ملء العنوان والمحتوى', 'warning');
        return;
    }
    
    const item = {
        id: generateId(),
        type: 'text',
        title: title,
        content: content,
        timestamp: Date.now()
    };
    
    contentItems.push(item);
    hideTextInput();
    updateContentDisplay();
}

function updateContentDisplay() {
    const container = document.getElementById('contentContainer');
    container.innerHTML = '';
    
    if (contentItems.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-500">
                    <span data-en="No content added yet" data-ar="لم يتم إضافة محتوى بعد">No content added yet</span>
                </p>
            </div>
        `;
        applyLanguage();
        return;
    }
    
    contentItems.forEach((item, index) => {
        const element = createContentElement(item, index);
        container.appendChild(element);
    });
    
    initializeSortable();
}

function createContentElement(item, index) {
    const div = document.createElement('div');
    div.className = 'content-preview fade-in-up';
    div.setAttribute('data-id', item.id);
    
    if (item.type === 'image') {
        div.innerHTML = `
            <div class="image-preview">
                <img src="${item.src}" alt="${item.filename}">
                <div class="image-counter">${index + 1}</div>
                <button class="remove-btn" onclick="removeContent('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
                <div class="drag-handle">
                    <i class="fas fa-grip-vertical mr-1"></i>
                    <span data-en="Reorder" data-ar="إعادة ترتيب">Reorder</span>
                </div>
            </div>
        `;
    } else {
        div.innerHTML = `
            <div class="text-preview">
                <div class="text-type-badge">
                    <i class="fas fa-align-left mr-1"></i>
                    <span data-en="Text" data-ar="نص">Text</span>
                </div>
                <div class="text-title">${item.title}</div>
                <div class="text-content">${item.content}</div>
                <button class="remove-btn" onclick="removeContent('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
                <div class="drag-handle">
                    <i class="fas fa-grip-vertical mr-1"></i>
                    <span data-en="Reorder" data-ar="إعادة ترتيب">Reorder</span>
                </div>
            </div>
        `;
    }
    
    return div;
}

function removeContent(id) {
    contentItems = contentItems.filter(item => item.id !== id);
    updateContentDisplay();
}

function clearAllContent() {
    contentItems = [];
    updateContentDisplay();
}

function initializeSortable() {
    const container = document.getElementById('contentContainer');
    new Sortable(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: function(evt) {
            const newOrder = Array.from(container.children).map(child => child.getAttribute('data-id'));
            contentItems = newOrder.map(id => contentItems.find(item => item.id === id));
        }
    });
}

async function convertToPDF() {
    if (contentItems.length === 0) {
        showPopup(currentLanguage === 'en' ? 'Please add some content first' : 'يرجى إضافة بعض المحتوى أولاً', 'warning');
        return;
    }
    
    if (isConverting) return;
    
    isConverting = true;
    document.getElementById('loadingState').classList.remove('hidden');
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Add Arabic font support
        let arabicFontsLoaded = false;
        try {
            const arabicFontRegular = await loadFont('fonts/IBMPlexSansArabic-Regular.ttf');
            const arabicFontBold = await loadFont('fonts/IBMPlexSansArabic-Medium.ttf');
            
            if (arabicFontRegular && arabicFontBold) {
                pdf.addFileToVFS('IBMPlexSansArabic-Regular.ttf', arabicFontRegular);
                pdf.addFileToVFS('IBMPlexSansArabic-Medium.ttf', arabicFontBold);
                pdf.addFont('IBMPlexSansArabic-Regular.ttf', 'Arabic', 'normal');
                pdf.addFont('IBMPlexSansArabic-Medium.ttf', 'Arabic', 'bold');
                arabicFontsLoaded = true;
            }
        } catch (error) {
            console.warn('Could not load Arabic fonts, falling back to default fonts:', error);
        }
        
        let yPosition = 20;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const rightAlignedX = pageWidth - 20; // 20mm from right edge
        
        for (let i = 0; i < contentItems.length; i++) {
            const item = contentItems[i];
            
            // Add new page for each new content item (except the first one)
            if (i > 0) {
                pdf.addPage();
                yPosition = 20;
            }
            
            if (item.type === 'text') {
                const title = item.title;
                const content = item.content;
                
                // Check if text contains Arabic characters (more precise detection)
                const hasArabic = function() {
                    // More specific Arabic script ranges - only actual Arabic characters
                    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
                    const combinedText = title + content;
                    
                    // Check if there are actual Arabic characters
                    const arabicChars = combinedText.match(arabicRegex);
                    if (!arabicChars) return false;
                    
                    // Count only actual Arabic script characters (not Latin with diacritics)
                    let actualArabicCount = 0;
                    for (let char of combinedText) {
                        const code = char.charCodeAt(0);
                        // Main Arabic block: 0x0600-0x06FF
                        // Arabic Supplement: 0x0750-0x077F  
                        // Arabic Extended-A: 0x08A0-0x08FF
                        // Arabic Presentation Forms-A: 0xFB50-0xFDFF
                        // Arabic Presentation Forms-B: 0xFE70-0xFEFF
                        if ((code >= 0x0600 && code <= 0x06FF) ||
                            (code >= 0x0750 && code <= 0x077F) ||
                            (code >= 0x08A0 && code <= 0x08FF) ||
                            (code >= 0xFB50 && code <= 0xFDFF) ||
                            (code >= 0xFE70 && code <= 0xFEFF)) {
                            actualArabicCount++;
                        }
                    }
                    
                    const totalCharCount = combinedText.replace(/\s/g, '').length;
                    
                    // If more than 20% of characters are actual Arabic, consider it Arabic text
                    return (actualArabicCount / totalCharCount) > 0.2;
                }();
                
                const textOptions = {};
                if (hasArabic && arabicFontsLoaded) {
                    textOptions.align = 'right';
                    textOptions.rtl = true;
                }
                
                pdf.setFontSize(16);
                if (hasArabic && arabicFontsLoaded) {
                    pdf.setFont('Arabic', 'bold');
                } else {
                    pdf.setFont(undefined, 'bold');
                }
                pdf.text(title, hasArabic && arabicFontsLoaded ? rightAlignedX : 20, yPosition, textOptions);
                yPosition += 10;
                
                pdf.setFontSize(12);
                if (hasArabic && arabicFontsLoaded) {
                    pdf.setFont('Arabic', 'normal');
                } else {
                    pdf.setFont(undefined, 'normal');
                }
                
                const lines = pdf.splitTextToSize(content, 170);
                for (let line of lines) {
                    if (yPosition > 280) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                    pdf.text(line, hasArabic && arabicFontsLoaded ? rightAlignedX : 20, yPosition, textOptions);
                    yPosition += 7;
                }
                
            } else if (item.type === 'image') {
                const img = new Image();
                img.src = item.src;
                
                await new Promise((resolve) => {
                    img.onload = () => {
                        const imgWidth = 170;
                        const imgHeight = (img.height * imgWidth) / img.width;
                        
                        if (yPosition + imgHeight > 280) {
                            pdf.addPage();
                            yPosition = 20;
                        }
                        
                        pdf.addImage(img, 'JPEG', 20, yPosition, imgWidth, imgHeight);
                        yPosition += imgHeight + 10;
                        resolve();
                    };
                });
            }
        }
        
        const filename = `pdf_converter_${Date.now()}.pdf`;
        pdf.save(filename);
        
        showPopup(currentLanguage === 'en' ? 'PDF created successfully!' : 'تم إنشاء PDF بنجاح!', 'success');
        
        await logUsage();
        
    } catch (error) {
        console.error('Error creating PDF:', error);
        showPopup(currentLanguage === 'en' ? 'Error creating PDF. Please try again.' : 'خطأ في إنشاء PDF. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
        isConverting = false;
        document.getElementById('loadingState').classList.add('hidden');
    }
}

async function loadFont(fontPath) {
    try {
        const response = await fetch(fontPath);
        const fontArrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(fontArrayBuffer);
        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
            binaryString += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binaryString);
    } catch (error) {
        console.error('Error loading font:', error);
        return null;
    }
}

function updateTextDirection(event) {
    const text = event.target.value;
    
    // More precise Arabic detection - only actual Arabic script characters
    let actualArabicCount = 0;
    for (let char of text) {
        const code = char.charCodeAt(0);
        // Main Arabic block: 0x0600-0x06FF
        // Arabic Supplement: 0x0750-0x077F  
        // Arabic Extended-A: 0x08A0-0x08FF
        // Arabic Presentation Forms-A: 0xFB50-0xFDFF
        // Arabic Presentation Forms-B: 0xFE70-0xFEFF
        if ((code >= 0x0600 && code <= 0x06FF) ||
            (code >= 0x0750 && code <= 0x077F) ||
            (code >= 0x08A0 && code <= 0x08FF) ||
            (code >= 0xFB50 && code <= 0xFDFF) ||
            (code >= 0xFE70 && code <= 0xFEFF)) {
            actualArabicCount++;
        }
    }
    
    const totalCharCount = text.replace(/\s/g, '').length;
    
    // If more than 20% of characters are actual Arabic, consider it Arabic text
    const hasArabic = (actualArabicCount / totalCharCount) > 0.2;
    
    if (hasArabic) {
        event.target.style.textAlign = 'right';
        event.target.style.direction = 'rtl';
    } else {
        event.target.style.textAlign = 'left';
        event.target.style.direction = 'ltr';
    }
}

async function logUsage() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user ? user.id : null;
        
        const sessionId = getSessionId();
        const userAgent = navigator.userAgent;
        const browser = getBrowserInfo(userAgent);
        const os = getOSInfo(userAgent);
        const deviceType = getDeviceType();
        
        // Calculate total size
        let totalSize = 0;
        for (let item of contentItems) {
            if (item.type === 'image' && item.file) {
                totalSize += item.file.size || 0;
            }
        }
        const totalSizeMB = Math.round((totalSize / (1024 * 1024)) * 100) / 100;
        
        const usageData = {
            user_id: userId,
            session_id: sessionId,
            pages: contentItems.length,
            file_count: contentItems.filter(item => item.type === 'image').length,
            text_count: contentItems.filter(item => item.type === 'text').length,
            total_size_mb: totalSizeMB,
            browser: browser,
            os: os,
            device_type: deviceType,
            created_at: new Date().toISOString()
        };
        
        const { error } = await supabase
            .from('usage_logs')
            .insert([usageData]);
        
        if (error) {
            console.error('Error logging usage:', error);
            // Try to log without user_id for anonymous users
            if (error.code === '42501' && !userId) {
                const { error: anonError } = await supabase
                    .from('usage_logs')
                    .insert([{
                        ...usageData,
                        user_id: null
                    }]);
                if (anonError) {
                    console.error('Error logging anonymous usage:', anonError);
                }
            }
        }
    } catch (error) {
        console.error('Error logging usage:', error);
    }
}

function showDonationModal() {
    const modal = document.getElementById('donationModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);
    
    showPaymentMethods();
}

function hideDonationModal() {
    const modal = document.getElementById('donationModal');
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 200);
    
    showPaymentMethods();
}

function showPaymentMethods() {
    document.getElementById('thankYouMessage').classList.remove('hidden');
    document.getElementById('paymentDetails').classList.add('hidden');
    document.getElementById('backButton').classList.add('hidden');
    
    // Show the payment method cards
    const paymentMethods = document.querySelector('.space-y-4.mb-6');
    if (paymentMethods) {
        paymentMethods.classList.remove('hidden');
    }
}

function showPaymentDetails(method) {
    // Hide thank you message and payment methods
    document.getElementById('thankYouMessage').classList.add('hidden');
    const paymentMethods = document.querySelector('.space-y-4.mb-6');
    if (paymentMethods) {
        paymentMethods.classList.add('hidden');
    }
    
    // Show payment details and back button
    document.getElementById('paymentDetails').classList.remove('hidden');
    document.getElementById('backButton').classList.remove('hidden');
    
    // Hide all detail sections
    document.getElementById('sadadDetails').classList.add('hidden');
    document.getElementById('paypalDetails').classList.add('hidden');
    document.getElementById('cryptoDetails').classList.add('hidden');
    
    // Show the selected method details
    switch(method) {
        case 'sadad':
            document.getElementById('sadadDetails').classList.remove('hidden');
            break;
        case 'paypal':
            document.getElementById('paypalDetails').classList.remove('hidden');
            break;
        case 'crypto':
            document.getElementById('cryptoDetails').classList.remove('hidden');
            break;
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showPopup(
            currentLanguage === 'en' ? 
            'Wallet address copied to clipboard!' : 
            'تم نسخ عنوان المحفظة إلى الحافظة!', 
            'success'
        );
    }).catch(() => {
        showPopup(
            currentLanguage === 'en' ? 
            'Failed to copy to clipboard' : 
            'فشل في النسخ إلى الحافظة', 
            'error'
        );
    });
}

async function handleDonation(amount) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user ? user.id : null;
        
        const { data, error } = await supabase
            .from('donations')
            .insert([{
                user_id: userId,
                amount: amount,
                status: 'pending',
                message: currentLanguage === 'en' ? 'Thank you for your support!' : 'شكراً لك على دعمك!'
            }]);
        
        if (error) throw error;
        
        showPopup(
            currentLanguage === 'en' ? 
            'Thank you for your donation! Please complete your payment using one of the methods above.' : 
            'شكراً لك على تبرعك! يرجى إكمال عملية الدفع باستخدام إحدى الطرق أعلاه.', 
            'success'
        );
        
    } catch (error) {
        showPopup(
            currentLanguage === 'en' ? 
            'Error processing donation: ' + error.message : 
            'خطأ في معالجة التبرع: ' + error.message, 
            'error'
        );
    }
}

function showPopup(message, type = 'info') {
    const popup = document.createElement('div');
    popup.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    popup.className += ` ${colors[type] || colors.info}`;
    
    popup.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button class="ml-4 text-white hover:text-gray-200 transition-colors" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        popup.classList.add('translate-x-full');
        setTimeout(() => {
            if (popup.parentElement) {
                popup.remove();
            }
        }, 300);
    }, 4000);
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('pdfConverterSessionId');
    if (!sessionId) {
        sessionId = generateId();
        sessionStorage.setItem('pdfConverterSessionId', sessionId);
    }
    return sessionId;
}

function getBrowserInfo(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
}

function getOSInfo(userAgent) {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
}

function getDeviceType() {
    const userAgent = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
        return 'Tablet';
    }
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(userAgent)) {
        return 'Mobile';
    }
    return 'Desktop';
}

document.getElementById('profileDropdownBtn').addEventListener('click', () => {
    document.getElementById('profileDropdown').classList.toggle('hidden');
});

document.getElementById('viewProfileBtn').addEventListener('click', () => {
    window.location.href = 'profile.html';
});

document.getElementById('myDonationsBtn').addEventListener('click', () => {
    window.location.href = 'donations.html';
});

document.getElementById('signOutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.reload();
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#profileBtn')) {
        document.getElementById('profileDropdown').classList.add('hidden');
    }
});
