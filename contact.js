const emailButton = document.getElementById('show-email');

emailButton.addEventListener('click', () => {
    const name = ['markl', 'j', 'markus'].reverse().join('.');
    const domain = ['com', 'gmail'].reverse().join('.');
    const address = [name, domain].join('@');
    const link = document.createElement('a');
    link.className = 'email';
    link.href = 'mailto:' + address;
    link.textContent = address;
    emailButton.replaceWith(link);
    link.focus();
}, { once: true });

emailButton.hidden = false;
