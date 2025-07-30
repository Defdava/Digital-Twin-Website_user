const firebaseConfig = {
    apiKey: "AIzaSyAef3SJwvVVTunr6CWki79aenfpXlgYc0s",
    authDomain: "digitaltwinparkingbrin.firebaseapp.com",
    databaseURL: "https://digitaltwinparkingbrin-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "digitaltwinparkingbrin",
    storageBucket: "digitaltwinparkingbrin.firebasestorage.app",
    messagingSenderId: "608462498913",
    appId: "1:608462498913:web:73695d8c91f923e2db8e20",
    measurementId: "G-F1TRY65RTG"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase berhasil diinisialisasi');
} catch (error) {
    console.error('Inisialisasi Firebase gagal:', error);
}
const database = firebase.database();

// Firebase parking slot management
const slotsRef = database.ref('slots');
const slots = document.querySelectorAll('.slot');
const carsCount = document.getElementById('carsCount');
const slotsAvailable = document.getElementById('slotsAvailable');

// Track slot states to detect changes
const slotStates = {};

// Update UI based on Firebase data with animations
slotsRef.on('value', (snapshot) => {
    try {
        const data = snapshot.val();
        let occupiedCount = 0;
        const totalSlots = 20;

        slots.forEach(slot => {
            const slotId = slot.dataset.slot;
            const isOccupied = data && data[`slot${slotId}`] && data[`slot${slotId}`].occupied;
            const wasOccupied = slotStates[slotId] || false;

            if (isOccupied && !wasOccupied) {
                // Slot menjadi terisi, aktifkan animasi carEnter
                slot.classList.remove('exiting');
                slot.classList.add('occupied');
                const car = slot.querySelector('.car');
                if (car) {
                    car.style.animation = 'carEnter 0.5s ease-in-out';
                    setTimeout(() => {
                        car.style.animation = ''; // Reset animasi
                    }, 500);
                }
            } else if (!isOccupied && wasOccupied) {
                // Slot menjadi kosong, aktifkan animasi carExit
                slot.classList.add('exiting');
                const car = slot.querySelector('.car');
                if (car) {
                    car.style.animation = 'carExit 0.5s ease-in-out';
                    setTimeout(() => {
                        slot.classList.remove('occupied');
                        slot.classList.remove('exiting');
                        car.style.animation = ''; // Reset animasi
                    }, 500);
                }
            }

            slotStates[slotId] = isOccupied;
            if (isOccupied) occupiedCount++;
        });

        // Update statistik Tinjauan Langsung
        if (carsCount && slotsAvailable) {
            carsCount.textContent = `${occupiedCount} / ${totalSlots}`;
            slotsAvailable.textContent = `${totalSlots - occupiedCount} / ${totalSlots}`;
        } else {
            console.error('Elemen carsCount atau slotsAvailable tidak ditemukan');
        }
    } catch (error) {
        console.error('Kesalahan listener Firebase:', error);
    }
}, (error) => {
    console.error('Kesalahan listener Firebase:', error);
});

// Handle slot click to toggle occupancy
slots.forEach(slot => {
    slot.addEventListener('click', () => {
        try {
            const slotId = slot.dataset.slot;
            const isOccupied = slot.classList.contains('occupied');

            if (isOccupied) {
                // Aktifkan animasi keluar dan perbarui Firebase
                slot.classList.add('exiting');
                const car = slot.querySelector('.car');
                if (car) {
                    car.style.animation = 'carExit 0.5s ease-in-out';
                    setTimeout(() => {
                        slot.classList.remove('occupied');
                        slot.classList.remove('exiting');
                        car.style.animation = '';
                        slotsRef.child(`slot${slotId}`).update({ occupied: false, licensePlate: "" });
                    }, 500);
                }
            } else {
                // Aktifkan animasi masuk dan perbarui Firebase
                slot.classList.add('occupied');
                const car = slot.querySelector('.car');
                if (car) {
                    car.style.animation = 'carEnter 0.5s ease-in-out';
                    slotsRef.child(`slot${slotId}`).update({ occupied: true, licensePlate: "" });
                    setTimeout(() => {
                        car.style.animation = '';
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Kesalahan saat mengklik slot:', error);
        }
    });
});