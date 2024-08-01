document.addEventListener('DOMContentLoaded', function() {
    const displaybtn = document.getElementById('displaycontent');
    const resultcontent = document.querySelector('.principal-content');
    const aboutpage = document.querySelector('.about-page');

    displaybtn.addEventListener('click', function() {
        if (resultcontent.style.display === 'none') {
            resultcontent.style.display = 'block';
            aboutpage.style.display = 'none';
        } else {
            resultcontent.style.display = 'none';
            aboutpage.style.display = 'block';
        }
    });
});
