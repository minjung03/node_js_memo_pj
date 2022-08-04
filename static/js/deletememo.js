const deleteBtn = document.querySelector('#delete');

const href = deleteBtn.href;
deleteBtn.removeAttribute('href');
const deleteChk = (e) => {

    const ok = confirm('정말 삭제하시겠습니까?');
    if(ok){
        deleteBtn.setAttribute('href', href);
    }
};

deleteBtn.addEventListener('click', deleteChk);
