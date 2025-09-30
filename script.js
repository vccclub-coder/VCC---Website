// ============================
// 🎉 VCC Featured Events Module
// ============================

document.addEventListener('DOMContentLoaded', () => {
  // --- Tab switching Logic ---
  const tabButtons = document.querySelectorAll('.tab-button');
  const eventContents = document.querySelectorAll('.event-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-event');
      eventContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === target) {
          content.classList.add('active');
        }
      });
      stopAllCarousels();
      startCarousel(target);
    });
  });

  // --- Khởi tạo tất cả slideshow ---
  const eventIds = ['event1', 'event2', 'event3'];
  eventIds.forEach(id => {
    initializeSlides(id);
  });

  startCarousel('event1');
});

// ============================
// 🎠 Slideshow Logic (PHIÊN BẢN VÒNG LẶP LIỀN MẠCH TUYỆT ĐỐI)
// ============================

const slideshowStates = {};
const CLONE_COUNT = 2; // Số lượng slide clone ở mỗi đầu, tăng nếu cần hiệu ứng mượt hơn ở các cạnh

function initializeSlides(eventId) {
  const track = document.getElementById(`track-${eventId}`);
  if (!track) return;

  let slides = Array.from(track.querySelectorAll('.slide'));
  const dotsContainer = document.getElementById(`dots-${eventId}`);
  
  // --- Logic Clone Mới ---
  if (slides.length > 1) {
    const originalSlides = [...slides];
    // Clone các ảnh cuối và chèn vào đầu
    for (let i = 0; i < CLONE_COUNT; i++) {
        const indexToClone = (originalSlides.length - 1 - i + originalSlides.length) % originalSlides.length;
        const clone = originalSlides[indexToClone].cloneNode(true);
        track.insertBefore(clone, track.firstChild);
    }
    // Clone các ảnh đầu và chèn vào cuối
    for (let i = 0; i < CLONE_COUNT; i++) {
        const clone = originalSlides[i].cloneNode(true);
        track.appendChild(clone);
    }
    // Cập nhật lại danh sách slides
    slides = Array.from(track.querySelectorAll('.slide'));
  }

  // Tạo dấu chấm điều hướng (chỉ cho các ảnh gốc)
  const originalSlidesCount = slides.length - (2 * CLONE_COUNT);
  dotsContainer.innerHTML = '';
  for (let i = 0; i < originalSlidesCount; i++) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    dot.addEventListener('click', () => showSlide(eventId, i + CLONE_COUNT));
    dotsContainer.appendChild(dot);
  }

  // Lưu trạng thái
  slideshowStates[eventId] = {
    track: track,
    slides: slides,
    dots: dotsContainer.querySelectorAll('.dot'),
    currentIndex: CLONE_COUNT, // Bắt đầu từ ảnh thật đầu tiên
    totalSlides: slides.length,
    totalOriginalSlides: originalSlidesCount,
    isTransitioning: false,
    intervalId: null,
  };

  showSlide(eventId, CLONE_COUNT, false); // Hiển thị slide đầu tiên (không animation)
  
  track.addEventListener('transitionend', () => handleTransitionEnd(eventId));

  const slideshowContainer = track.closest('.slideshow');
  slideshowContainer.addEventListener('mouseenter', () => stopCarousel(eventId));
  slideshowContainer.addEventListener('mouseleave', () => startCarousel(eventId));
}

function showSlide(eventId, index, animated = true) {
  const state = slideshowStates[eventId];
  if (!state) return;

  state.currentIndex = index;
  const { slides, dots, currentIndex, totalOriginalSlides } = state;

  slides.forEach((slide, i) => {
    const offset = i - currentIndex;
    
    // Áp dụng style dựa trên vị trí tương đối
    const transform = `translateX(${offset * 50}%) rotateY(${offset * -30}deg) scale(${1 - Math.abs(offset) * 0.15})`;
    const opacity = `${1 - Math.abs(offset) * 0.4}`;
    const zIndex = 100 - Math.abs(offset);
    
    slide.style.transition = animated ? 'transform 0.7s ease, opacity 0.7s ease' : 'none';
    slide.style.transform = transform;
    slide.style.opacity = opacity;
    slide.style.zIndex = zIndex;
  });

  // Cập nhật dấu chấm active
  const activeDotIndex = (currentIndex - CLONE_COUNT + totalOriginalSlides) % totalOriginalSlides;
  dots.forEach((dot, i) => dot.classList.toggle('active', i === activeDotIndex));
}

function moveSlide(direction, eventId) {
  const state = slideshowStates[eventId];
  if (state.isTransitioning) return;
  state.isTransitioning = true;
  showSlide(eventId, state.currentIndex + direction);
}

function handleTransitionEnd(eventId) {
  const state = slideshowStates[eventId];
  const { currentIndex, totalOriginalSlides } = state;

  state.isTransitioning = false;
  
  // "Bước nhảy" vô hình khi đến vùng clone
  if (currentIndex < CLONE_COUNT) {
    showSlide(eventId, currentIndex + totalOriginalSlides, false);
  } else if (currentIndex >= totalOriginalSlides + CLONE_COUNT) {
    showSlide(eventId, currentIndex - totalOriginalSlides, false);
  }
}

// --- Logic tự động chạy (giữ nguyên) ---
function startCarousel(eventId) {
    const state = slideshowStates[eventId];
    if (state && !state.intervalId) {
        state.intervalId = setInterval(() => moveSlide(1, eventId), 3000);
    }
}
function stopCarousel(eventId) {
    const state = slideshowStates[eventId];
    if (state && state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
    }
}
function stopAllCarousels() {
    Object.keys(slideshowStates).forEach(id => stopCarousel(id));
}