// Flipbook JavaScript - מעודכן לתמיכה בתצוגה דו-צדדית אמיתית
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const book = document.getElementById('book');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageNum = document.getElementById('page-num');
    const pageCount = document.getElementById('page-count');
    const thumbnailsContainer = document.getElementById('thumbnails');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    // Variables
    let currentPage = 0;
    const totalPages = catalogData.pages;
    let isAnimating = false; // למניעת לחיצות מרובות בזמן אנימציה
    
    // Initialize
    function init() {
        // Set page count
        pageCount.textContent = totalPages;
        
        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isPortrait = window.innerHeight > window.innerWidth;
        
        // Add mobile class if needed
        if (isMobile) {
            document.querySelector('.flipbook-container').classList.add('mobile');
            if (isPortrait) {
                document.querySelector('.flipbook-container').classList.add('portrait');
            } else {
                document.querySelector('.flipbook-container').classList.add('landscape');
            }
        }
        
        // Create pages
        createPages();
        
        // Create thumbnails
        createThumbnails();
        
        // Set event listeners
        prevBtn.addEventListener('click', function() {
            if (!isAnimating) prevPage();
        });
        nextBtn.addEventListener('click', function() {
            if (!isAnimating) nextPage();
        });
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' && !isAnimating) {
                prevPage();
            } else if (e.key === 'ArrowRight' && !isAnimating) {
                nextPage();
            } else if (e.key === 'Escape') {
                // Exit fullscreen on Escape key
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                    document.querySelector('.flipbook-container').classList.remove('fullscreen');
                }
            }
        });
        
        // Touch events for mobile
        if (isMobile) {
            let touchStartX = 0;
            let touchEndX = 0;
            
            document.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, false);
            
            document.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, false);
            
            function handleSwipe() {
                if (!isAnimating) {
                    if (touchEndX < touchStartX - 50) { // Swipe left
                        nextPage();
                    }
                    if (touchEndX > touchStartX + 50) { // Swipe right
                        prevPage();
                    }
                }
            }
            
            // Listen for orientation changes
            window.addEventListener('orientationchange', function() {
                setTimeout(() => {
                    const container = document.querySelector('.flipbook-container');
                    container.classList.remove('portrait', 'landscape');
                    
                    if (window.innerHeight > window.innerWidth) {
                        container.classList.add('portrait');
                    } else {
                        container.classList.add('landscape');
                    }
                    
                    // Refresh the current spread
                    showSpread(currentPage);
                }, 300);
            });
        }
        
        // Show first spread (pages 0-1)
        showSpread(0);
        
        // Automatically enter fullscreen mode after a short delay
        setTimeout(() => {
            enterFullscreen();
        }, 500);
    }
    
    // Create pages - מימוש משופר לתמיכה בדפים דו-צדדיים
    function createPages() {
        // יצירת מיכל לכל עמוד
        for (let i = 0; i < totalPages; i++) {
            const page = document.createElement('div');
            page.className = 'page';
            
            // קביעת מיקום ו-z-index
            page.style.zIndex = totalPages - i;
            page.setAttribute('data-page', i);
            
            // קביעת מיקום העמוד - ימין או שמאל
            if (i % 2 === 0) { // עמודים זוגיים בצד ימין
                page.classList.add('right-page');
            } else { // עמודים אי-זוגיים בצד שמאל
                page.classList.add('left-page');
            }
            
            // יצירת תוכן העמוד
            const pageContent = document.createElement('div');
            pageContent.className = 'page-content';
            
            // הוספת התמונה
            const img = document.createElement('img');
            img.src = catalogData.pageInfo[i].imagePath;
            img.alt = `עמוד ${i + 1}`;
            img.setAttribute('data-page-num', i + 1);
            
            // הוספת מספר עמוד
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            pageNumber.textContent = i + 1;
            
            // הוספת אפקט צל בקצה העמוד
            const pageShadow = document.createElement('div');
            pageShadow.className = 'page-shadow';
            
            // הוספת האלמנטים לעמוד
            pageContent.appendChild(img);
            pageContent.appendChild(pageNumber);
            page.appendChild(pageContent);
            page.appendChild(pageShadow);
            book.appendChild(page);
            
            // הוספת אירוע לחיצה
            page.addEventListener('click', function() {
                if (isAnimating) return;
                
                const pageIndex = parseInt(this.getAttribute('data-page'));
                const isRightPage = this.classList.contains('right-page');
                
                if (isRightPage) {
                    // אם לחצו על עמוד ימני, עוברים קדימה
                    nextPage();
                } else {
                    // אם לחצו על עמוד שמאלי, חוזרים אחורה
                    prevPage();
                }
            });
        }
        
        // הסתרת כל העמודים בהתחלה
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.style.display = 'none';
        });
    }
    
    // Create thumbnails
    function createThumbnails() {
        // התמונות הממוזערות הוסרו כדי לנצל את כל שטח המסך
        // משאירים את הפונקציה ריקה כדי לא לשבור את הקוד
        thumbnails = []; // מאתחלים מערך ריק
    }
    
    // פונקציה חדשה להצגת מרווח (שני עמודים זה לצד זה או עמוד אחד במכשירים ניידים במצב פורטרט)
    function showSpread(spreadStartIndex) {
        // מניעת אינדקס לא חוקי
        if (spreadStartIndex < 0 || spreadStartIndex >= totalPages) {
            return;
        }
        
        // מניעת לחיצות בזמן אנימציה
        isAnimating = true;
        
        // בדיקה אם זה מכשיר נייד במצב פורטרט
        const container = document.querySelector('.flipbook-container');
        const isMobilePortrait = container.classList.contains('mobile') && container.classList.contains('portrait');
        
        // במצב פורטרט במובייל, נציג עמוד אחד בכל פעם
        if (isMobilePortrait) {
            // קבלת כל העמודים
            const pages = Array.from(book.querySelectorAll('.page'));
            
            // הסתרת כל העמודים תחילה
            pages.forEach(page => {
                page.style.display = 'none';
                page.classList.remove('flipped');
            });
            
            // הצגת העמוד הנוכחי בלבד
            if (pages[spreadStartIndex]) {
                pages[spreadStartIndex].style.display = 'block';
                console.log(`מציג עמוד ${spreadStartIndex + 1} במצב פורטרט`);
            }
            
            // עדכון מספר העמוד הנוכחי
            currentPage = spreadStartIndex;
            pageNum.textContent = currentPage + 1;
            
            // עדכון מצב הכפתורים
            prevBtn.disabled = currentPage === 0;
            nextBtn.disabled = currentPage >= totalPages - 1;
        } else {
            // במצב רגיל או לנדסקייפ - נציג שני עמודים
            
            // וידוא שהעמוד הראשון במרווח הוא זוגי
            spreadStartIndex = spreadStartIndex % 2 === 0 ? spreadStartIndex : spreadStartIndex - 1;
            
            // קבלת כל העמודים
            const pages = Array.from(book.querySelectorAll('.page'));
            
            // הסתרת כל העמודים תחילה
            pages.forEach(page => {
                page.style.display = 'none';
                page.classList.remove('flipped');
            });
            
            // הפיכת עמודים קודמים
            for (let i = 0; i < spreadStartIndex; i++) {
                if (pages[i]) {
                    pages[i].classList.add('flipped');
                    pages[i].style.display = 'block'; // מציג את כל העמודים הקודמים כדי שהאנימציה תעבוד
                }
            }
            
            // הצגת העמוד הימני (הזוגי)
            if (pages[spreadStartIndex]) {
                pages[spreadStartIndex].style.display = 'block';
                console.log(`מציג עמוד ימני ${spreadStartIndex + 1}`);
            }
            
            // הצגת העמוד השמאלי (האי-זוגי) אם קיים
            if (spreadStartIndex + 1 < totalPages && pages[spreadStartIndex + 1]) {
                pages[spreadStartIndex + 1].style.display = 'block';
                console.log(`מציג עמוד שמאלי ${spreadStartIndex + 2}`);
            }
            
            // עדכון מספר העמוד הנוכחי - מציג את העמוד הראשון במרווח
            currentPage = spreadStartIndex;
            pageNum.textContent = currentPage + 1;
            
            // עדכון מצב הכפתורים
            prevBtn.disabled = currentPage === 0;
            nextBtn.disabled = currentPage >= totalPages - 2;
        }
        
        // מאפשר לחיצות שוב אחרי האנימציה
        setTimeout(() => {
            isAnimating = false;
        }, 800); // זמן האנימציה
    }
    
    // Previous spread - פונקציה משופרת למעבר למרווח הקודם
    function prevPage() {
        if (currentPage > 0) {
            // בדיקה אם זה מכשיר נייד במצב פורטרט
            const container = document.querySelector('.flipbook-container');
            const isMobilePortrait = container.classList.contains('mobile') && container.classList.contains('portrait');
            
            if (isMobilePortrait) {
                // במצב פורטרט במובייל, נעבור עמוד אחד אחורה
                const newPage = currentPage - 1;
                showSpread(newPage);
            } else {
                // במצב רגיל או לנדסקייפ, נעבור שני עמודים אחורה
                const newPage = Math.max(0, currentPage - 2);
                // וידוא שהעמוד הראשון במרווח הוא זוגי
                const spreadStartIndex = newPage % 2 === 0 ? newPage : newPage - 1;
                showSpread(spreadStartIndex);
            }
        }
    }
    
    // Next spread - פונקציה משופרת למעבר למרווח הבא
    function nextPage() {
        if (currentPage < totalPages - 1) {
            // בדיקה אם זה מכשיר נייד במצב פורטרט
            const container = document.querySelector('.flipbook-container');
            const isMobilePortrait = container.classList.contains('mobile') && container.classList.contains('portrait');
            
            if (isMobilePortrait) {
                // במצב פורטרט במובייל, נעבור עמוד אחד קדימה
                const newPage = Math.min(totalPages - 1, currentPage + 1);
                showSpread(newPage);
            } else {
                // במצב רגיל או לנדסקייפ, נעבור שני עמודים קדימה
                const newPage = Math.min(totalPages - 1, currentPage + 2);
                // וידוא שהעמוד הראשון במרווח הוא זוגי
                const spreadStartIndex = newPage % 2 === 0 ? newPage : newPage - 1;
                showSpread(spreadStartIndex);
            }
        }
    }
    
    // Toggle fullscreen
    function toggleFullscreen() {
        const container = document.querySelector('.flipbook-container');
        
        if (!document.fullscreenElement) {
            enterFullscreen();
        } else {
            document.exitFullscreen();
            container.classList.remove('fullscreen');
        }
    }
    
    // Enter fullscreen mode
    function enterFullscreen() {
        const container = document.querySelector('.flipbook-container');
        
        container.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
            // Fallback to CSS fullscreen if browser API fails
            container.classList.add('fullscreen');
        });
        container.classList.add('fullscreen');
    }
    
    // Initialize the flipbook
    init();
});
