const API_KEY = 'Z6kBaNQ4Z9RDxDPYZGwa1XVS';

export default class BackgroundRemover {
    constructor() {
        this.initElements();
        this.addEventListeners();
        this.setupDarkMode();
    }

    initElements() {
        this.uploadBtn = document.getElementById('uploadBtn');
        this.imageUpload = document.getElementById('imageUpload');
        this.imagePreview = document.getElementById('imagePreview');
        this.originalImage = document.getElementById('originalImage');
        this.removeBackgroundBtn = document.getElementById('removeBackgroundBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.processedImageContainer = document.getElementById('processedImageContainer');
        this.processedImage = document.getElementById('processedImage');
        this.processingScreen = document.getElementById('processingScreen');
        this.darkModeToggle = document.getElementById('darkModeToggle');
    }

    addEventListeners() {
        this.uploadBtn.addEventListener('click', () => this.imageUpload.click());
        
        this.imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                this.originalImage.src = event.target.result;
                this.imagePreview.style.display = 'block';
                this.removeBackgroundBtn.style.display = 'block';
                this.downloadBtn.style.display = 'none';
                this.processedImageContainer.style.display = 'none';
                this.processingScreen.style.display = 'none';

                // Show image details
                const imageDetails = document.getElementById('imageDetails');
                imageDetails.textContent = `${file.name} - ${this.formatFileSize(file.size)}`;
            };

            reader.readAsDataURL(file);
        });

        this.removeBackgroundBtn.addEventListener('click', () => this.removeBackground());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
    }

    setupDarkMode() {
        // Check for saved dark mode preference
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'enabled') {
            document.body.classList.add('dark-mode');
            this.darkModeToggle.checked = true;
        }

        // Toggle dark mode
        this.darkModeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
            
            // Save preference
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('darkMode', 'enabled');
            } else {
                localStorage.removeItem('darkMode');
            }
        });
    }

    async removeBackground() {
        // Show processing screen
        this.processingScreen.style.display = 'flex';
        this.removeBackgroundBtn.style.display = 'none';

        const formData = new FormData();
        formData.append('image_file', this.dataURLtoFile(this.originalImage.src));
        formData.append('size', 'auto');

        try {
            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': API_KEY
                },
                body: formData
            });

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            // Hide processing screen
            this.processingScreen.style.display = 'none';
            
            // Show processed image
            this.processedImage.src = imageUrl;
            this.processedImageContainer.style.display = 'block';
            this.downloadBtn.style.display = 'block';
        } catch (error) {
            console.error('Error removing background:', error);
            this.processingScreen.style.display = 'none';
            this.removeBackgroundBtn.style.display = 'block';
            alert('حدث خطأ أثناء إزالة الخلفية');
        }
    }

    downloadImage() {
        const link = document.createElement('a');
        link.href = this.processedImage.src;
        link.download = 'image_without_background.png';
        link.click();
    }

    dataURLtoFile(dataUrl) {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new File([u8arr], 'image.png', { type: mime });
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return `${bytes} بايت`;
        else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
        else return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
    }
}

new BackgroundRemover();