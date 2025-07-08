document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("bookingModal");
  const closeBtn = document.querySelector(".close");

  // --- Открытие формы ---
  document.getElementById("openBookingForm")?.addEventListener("click", function () {
    modal.style.display = "block";
  });

  // --- Закрытие по крестику ---
  closeBtn?.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // --- Закрытие по клику вне окна ---
  window.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // --- Инициализация календаря ---
  flatpickr("#datepicker", {
    minDate: "today",
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "F j, Y",
    inline: true
  });

  // --- Обработка отправки заявки ---
  document.getElementById("bookingForm")?.addEventListener("submit", function (e) {
    e.preventDefault();
    const form = this;
    const result = document.getElementById("result");

    // Собираем данные
    const formData = {
      name: form.querySelector("[name=name]")?.value.trim() || '',
      surname: form.querySelector("[name=surname]")?.value.trim() || '',
      email: form.querySelector("[name=email]")?.value.trim() || '',
      phone: form.querySelector("[name=phone]")?.value.trim() || '',
      date: document.getElementById("datepicker")?._flatpickr?.selectedDates[0]?.toISOString().split('T')[0] || 'Не выбрана'
    };

    // Проверяем заполнение всех полей
    if (!formData.name || !formData.surname || !formData.email || !formData.phone) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }

    // Получаем chat_id из Google Sheets
    fetch("https://script.google.com/macros/s/AKfycbzWCrgMMEkMHHhmj9g5DETl-nXKlBGroLS4LVlyxAs2S876--PwEDrcqD4rQon94E8LMA/exec")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const chat_id = data.chat_id;

        if (!chat_id) {
          result.innerHTML = "Ошибка: нет активного получателя.";
          result.style.color = "red";
          setTimeout(() => { result.innerHTML = ""; }, 3000);
          return;
        }

        // Формируем текст сообщения
        const messageText = `
🔔 Новая заявка на бронирование:

👤 Имя: ${formData.name}
👥 Фамилия: ${formData.surname}
📧 Email: ${formData.email}
📞 Телефон: ${formData.phone}
📅 Дата заезда: ${formData.date}
`;

        // Отправляем через Telegram Bot API
        fetch(` https://api.telegram.org/bot7845893683:AAHkvxCz0g5e_OTNVGO7Bs5DFHf-p5uj-pY/sendMessage `, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id: chat_id,
            text: messageText,
            parse_mode: "HTML"
          })
        }).then(response => {
          if (response.ok) {
            result.innerHTML = "Ваша заявка успешно отправлена!";
            result.style.color = "green";
            form.reset();
            document.getElementById("datepicker")?._flatpickr.clear(); // Очистка календаря
            setTimeout(() => {
              modal.style.display = "none";
              result.innerHTML = "";
            }, 3000);
          } else {
            result.innerHTML = "Ошибка при отправке заявки.";
            result.style.color = "red";
          }
        }).catch(err => {
          console.error("Ошибка:", err);
          result.innerHTML = "Произошла ошибка при отправке.";
          result.style.color = "red";
        });
      })
      .catch(err => {
        console.error("Не удалось получить chat_id:", err);
        result.innerHTML = "Сервер недоступен. Попробуйте позже.";
        result.style.color = "red";
      });
  });
});
