// Alternar menu responsivo
const btnMenu = document.getElementById('btn-menu');
const navbar = document.querySelector('.navbar');

btnMenu.addEventListener('click', () => {
    navbar.classList.toggle('active');
});

// Modo escuro já está funcional se você quiser alternar o tema com JS
const toggleTema = document.getElementById('toggle-tema');
toggleTema.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});