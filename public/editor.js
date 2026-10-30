document.querySelectorAll('input[name="tagsText"]').forEach((input) => {
  input.form.addEventListener('submit', () => {
    input.name = 'tagsText';
    const hidden = document.createElement('input');
    hidden.type = 'hidden'; hidden.name = 'tags';
    hidden.value = JSON.stringify(input.value.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 10));
    input.form.appendChild(hidden);
  });
});
