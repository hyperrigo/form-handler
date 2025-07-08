<script>
  document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("bookingModal");
    const closeBtn = document.querySelector(".close");

    
    // --- Открытие формы ---
    document.getElementById("openBookingForm").addEventListener("click", function () {
      modal.style.display = "block";
    });

    // --- Закрытие по крестику ---
    closeBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });

    // --- Закрытие по клику вне окна ---
    window.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });

    // --- Инициализация календаря (flatpickr) ---
    flatpickr("#datepicker", {
      minDate: "today",
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "F j, Y",
      inline: true
    });

    // --- Обработка отправки формы ---
    document.getElementById("bookingForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const form = this;

      // Собираем данные из формы
      const formData = {
        name: form.querySelector("[name=name]").value.trim(),
        surname: form.querySelector("[name=surname]").value.trim(),
        email: form.querySelector("[name=email]").value.trim(),
        phone: form.querySelector("[name=phone]").value.trim(),
        date: document.getElementById("datepicker")._flatpickr.selectedDates[0]?.toISOString().split('T')[0] || "Не выбрана"
      };

      // Проверяем, что все поля заполнены
      if (!formData.name || !formData.surname || !formData.email || !formData.phone || !formData.date) {
        alert("Пожалуйста, заполните все поля.");
        return;
      }

      // --- Шаг 1: Получаем chat_id с Google Apps Script через GET-запрос ---
      fetch("https://script.google.com/macros/s/AKfycbyUeKGjipUlt8klhj3dMf-q0WZBzUSICz9cIypIwc4K86Z-RFIFuKTKb1O28SHSyFdvaw/exec ")
        .then(res => {
          if (!res.ok) {
            throw new Error("Ошибка сети при получении chat_id");
          }
          return res.json();
        })
        .then(data => {
          const chat_id = data.chat_id;

          if (!chat_id) {
            alert("Ошибка связи с офисом. Свяжитесь с менеджером по телефону пожалуйста");
            return;
          }

          // --- Шаг 2: Формируем текст сообщения ---
          const messageText = `
🔔 Новая заявка на бронирование:

👤 Имя: ${formData.name}
👥 Фамилия: ${formData.surname}
📧 Email: ${formData.email}
📞 Телефон: ${formData.phone}
📅 Дата заезда: ${formData.date}
`;

          // --- Шаг 3: Отправляем в Telegram ---
          fetch(`https://api.telegram.org/bot7845893683:AAHkvxCz0g5e_OTNVGO7Bs5DFHf-p5uj-pY/sendMessage `, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              chat_id: chat_id,
              text: messageText,
              parse_mode: "HTML"
            })
          })
          .then(response => {
            if (response.ok) {
              // Успех
              alert("Заявка успешно отправлена!");
              form.reset();
              document.getElementById("datepicker")._flatpickr.clear(); // Очистка календаря
              modal.style.display = "none";
            } else {
              // Ошибка в Telegram API
              alert("Ошибка при отправке заявки.");
            }
          })
          .catch(err => {
            console.error("Ошибка отправки:", err);
            alert("Произошла ошибка при отправке заявки.");
          });
        })
        .catch(err => {
          console.error("Ошибка получения chat_id:", err);
          alert("Сервер недоступен. Попробуйте позже.");
        });
    });
</script>
