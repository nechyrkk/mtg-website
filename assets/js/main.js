'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  navigation.classList.remove('is-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});
window.matchMedia('(min-width: 901px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const dialog = document.querySelector('#order-dialog');
const form = document.querySelector('#order-form');
const phone = document.querySelector('#customer-phone');
const phoneError = document.querySelector('#phone-error');
const formStatus = document.querySelector('#form-status');

function openOrder(title) {
    form.reset();
    phoneError.textContent = '';
    phone.removeAttribute('aria-invalid');
    formStatus.textContent = '';
    document.querySelector('#order-product').value = title;
    document.querySelector('#order-context').textContent = title;
    closeMenu();
    dialog.showModal();
    document.body.classList.add('has-dialog');
    document.querySelector('#customer-name').focus();
}
document.querySelectorAll('[data-order]').forEach(button => {
  button.addEventListener('click', () => openOrder(button.dataset.order));
});
document.addEventListener('mtg:order', event => {
  if (typeof event.detail?.title === 'string') openOrder(event.detail.title);
});

dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => document.body.classList.remove('has-dialog'));
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});

phone.addEventListener('input', () => {
  phoneError.textContent = '';
  phone.removeAttribute('aria-invalid');
  formStatus.textContent = '';
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const digits = phone.value.replace(/\D/g, '');
  const name = form.elements.name.value.trim();
  if (!name) {
    form.elements.name.setCustomValidity('Введите ваше имя.');
    form.elements.name.reportValidity();
    return;
  }
  if (digits.length < 10 || digits.length > 15) {
    phoneError.textContent = 'Введите номер телефона: от 10 до 15 цифр.';
    phone.setAttribute('aria-invalid', 'true');
    phone.focus();
    return;
  }
  phoneError.textContent = '';
  phone.removeAttribute('aria-invalid');
  formStatus.textContent = 'Форма заполнена корректно. Это демонстрация: данные не отправлены и не сохранены.';
});

form.elements.name.addEventListener('input', () => {
  form.elements.name.setCustomValidity('');
  formStatus.textContent = '';
});

const certificateDialog = document.querySelector('#certificate-dialog');
if (certificateDialog) {
  document.querySelectorAll('[data-certificate]').forEach(button => {
    button.addEventListener('click', () => {
      const image = document.querySelector('#certificate-full');
      image.src = button.dataset.certificate;
      image.alt = button.dataset.caption;
      document.querySelector('#certificate-caption').textContent = button.dataset.caption;
      closeMenu();
      certificateDialog.showModal();
      document.body.classList.add('has-dialog');
    });
  });
  certificateDialog.querySelector('.dialog-close').addEventListener('click', () => certificateDialog.close());
  certificateDialog.addEventListener('close', () => document.body.classList.remove('has-dialog'));
  certificateDialog.addEventListener('click', event => {
    if (event.target !== certificateDialog) return;
    const rect = certificateDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) certificateDialog.close();
  });
}
