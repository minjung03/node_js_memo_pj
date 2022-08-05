const modal = document.querySelector('.modal');
const modalok = document.querySelector('.modal_ok');
const modalno = document.querySelector('.modal_no');
const deleteBtn = document.querySelector('#delete');
modal.style.display = 'none';
const href = deleteBtn.href;
deleteBtn.removeAttribute('href');
const deleteChk = (e) => {
    modal.style.display = 'block';
};
modalok.addEventListener('click', () => {
    location.href = href;
    modal.style.display = 'none';
});
modalno.addEventListener('click', () => {
    modal.style.display = 'none';
});

deleteBtn.addEventListener('click', deleteChk);
