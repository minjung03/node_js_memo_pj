const modal = document.querySelector('.modal');
const modalok = document.querySelector('.modal_ok');
const modalno = document.querySelector('.modal_no');

modal.style.display = 'block';
modalok.addEventListener('click', () => {
    modal.style.display = 'none';
    location.href = '/';
});