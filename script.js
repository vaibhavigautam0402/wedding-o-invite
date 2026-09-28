document.addEventListener('DOMContentLoaded', () => {
const fadeElements = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
    if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    }
});
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

fadeElements.forEach(el => observer.observe(el));

document.querySelectorAll('nav a').forEach(link => {
link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
});

updateCountdown();
setInterval(updateCountdown, 1000);
updateGuestCount();

// ==========================================
// AUTO-SET GUESTS TO 0 WHEN REGRETFULLY CANNOT ATTEND
// ==========================================
const joiningSelect = document.getElementById('joining');
const guestsSelect = document.getElementById('guests');

joiningSelect.addEventListener('change', function() {
if (this.value === 'Regretfully cannot attend') {
    guestsSelect.value = '0';
    guestsSelect.disabled = true; // Prevents user from changing it while regretting
} else {
    guestsSelect.disabled = false; // Re-enables if they change back to "Yes"
}
});
});

function updateCountdown() {
const weddingDate = new Date('November 5, 2026 10:00:00').getTime();
const now = new Date().getTime();
const distance = weddingDate - now;

if (distance < 0) {
document.getElementById('countdown').innerHTML = '<div class="countdown-item"><span class="countdown-number">Today</span></div>';
return;
}

const days = Math.floor(distance / (1000 * 60 * 60 * 24));
const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((distance % (1000 * 60)) / 1000);

document.getElementById('days').textContent = String(days).padStart(2, '0');
document.getElementById('hours').textContent = String(hours).padStart(2, '0');
document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

function openPasswordModal() {
document.getElementById('passwordModal').classList.add('show');
document.getElementById('passwordInput').value = '';
document.getElementById('passwordError').classList.remove('show');
setTimeout(() => document.getElementById('passwordInput').focus(), 100);
}

function checkPassword() {
const password = document.getElementById('passwordInput').value;
if (password === 'VG2026') {
document.getElementById('passwordModal').classList.remove('show');
document.getElementById('secretCompartment').classList.add('show');
updateGuestCount();
} else {
document.getElementById('passwordError').classList.add('show');
document.getElementById('passwordInput').value = '';
}
}

function closeSecretCompartment() {
document.getElementById('secretCompartment').classList.remove('show');
}

document.getElementById('passwordInput').addEventListener('keypress', function(e) {
if (e.key === 'Enter') checkPassword();
});

// ==========================================
// 1. LIVE COUNT FUNCTION
// ==========================================
function updateGuestCount() {
const scriptURL = 'https://script.google.com/macros/s/AKfycbzzqAV6J1L1mwvCiqbMTiWMf1ihAqtfOEYeSXBGhMWI6Fno4GhHBA1acO2pCbFHJZQVUA/exec';
const countElement = document.getElementById('guestCount');

countElement.textContent = '...'; 

fetch(scriptURL + '?t=' + Date.now())
.then(response => response.json())
.then(data => {
    countElement.textContent = data.count;
})
.catch(error => {
    console.error('Error fetching count:', error);
    countElement.textContent = '0'; 
});
}

// ==========================================
// 2. SILENT RSVP FORM HANDLER
// ==========================================
document.getElementById('rsvpForm').addEventListener('submit', function(e) {
e.preventDefault(); 

const name = document.getElementById('name').value;
const joining = document.getElementById('joining').value;
const guests = parseInt(document.getElementById('guests').value);

const submitBtn = document.querySelector('.btn-submit');
submitBtn.textContent = 'Sending...';
submitBtn.disabled = true;

const scriptURL = 'https://script.google.com/macros/s/AKfycbzzqAV6J1L1mwvCiqbMTiWMf1ihAqtfOEYeSXBGhMWI6Fno4GhHBA1acO2pCbFHJZQVUA/exec';

fetch(scriptURL, {
method: 'POST',
headers: { 'Content-Type': 'text/plain;charset=utf-8' },
body: JSON.stringify({
    name: name,
    joining: joining,
    guests: guests
})
})
.then(response => response.json())
.then(data => {
if (data.status === 'success') {
    document.getElementById('rsvpForm').style.display = 'none';
    document.getElementById('rsvpSuccess').classList.add('show');
    updateGuestCount();
} else {
    throw new Error('Submission failed');
}
})
.catch(error => {
console.error('Error submitting RSVP:', error);
submitBtn.textContent = 'Try Again';
submitBtn.disabled = false;
alert('There was an error sending your RSVP. Please check your internet and try again.');
});
});