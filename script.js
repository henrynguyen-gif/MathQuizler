document.addEventListener('DOMContentLoaded', () => {
    // Các phần tử giao diện
    const splashScreen = document.getElementById('splash-screen');
    const loadingTextElement = document.getElementById('loading-text');
    const authScreen = document.getElementById('auth-screen');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const registerUsernameInput = document.getElementById('register-username');
    const registerPasswordInput = document.getElementById('register-password');
    const registerConfirmPasswordInput = document.getElementById('register-confirm-password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    const userInfoScreen = document.getElementById('user-info-screen');
    const displayNameInput = document.getElementById('display-name');
    const ageInput = document.getElementById('age');
    const emailInput = document.getElementById('email');
    const saveInfoBtn = document.getElementById('save-info-btn');

    const mapScreen = document.getElementById('map-screen');
    const mapLessonBtns = document.querySelectorAll('.map-lesson-btn');

    const lessonScreen = document.getElementById('lesson-screen');
    const progressBar = document.getElementById('progress-bar');
    const questionText = document.getElementById('question-text');
    const answerOptions = document.getElementById('answer-options');
    const checkBtn = document.getElementById('check-btn');
    const continueBtn = document.getElementById('continue-btn');
    const feedbackMessage = document.getElementById('feedback-message');

    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    const lessons = {
        1: [
            { question: "2 + 3 = ?", options: ["4", "5", "6", "7"], answer: "5" },
            { question: "8 - 5 = ?", options: ["2", "3", "4", "5"], answer: "3" },
            { question: "10 + 2 = ?", options: ["11", "12", "13", "14"], answer: "12" }
        ],
        2: [
            { question: "2 x 5 = ?", options: ["8", "10", "12", "15"], answer: "10" },
            { question: "9 / 3 = ?", options: ["2", "3", "4", "5"], answer: "3" }
        ]
    };

    let currentUser = null;
    let currentLesson = null;
    let currentQuestionIndex = 0;
    let selectedAnswer = null;

    // Các dòng văn bản cho hiệu ứng tải
    const loadingMessages = [
        "Đang tải tài nguyên...",
        "Chuẩn bị bài học đầu tiên...",
        "Sắp hoàn tất..."
    ];

    // Hàm để tạo hiệu ứng đánh máy chữ
    function typeWriter(text, element, callback, delay = 50) {
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(interval);
                if (callback) {
                    callback();
                }
            }
        }, delay);
    }

    // Hàm để hiển thị các dòng văn bản lần lượt
    function showLoadingMessages(messages, index = 0) {
        if (index < messages.length) {
            loadingTextElement.innerHTML = '';
            typeWriter(messages[index], loadingTextElement, () => {
                setTimeout(() => {
                    showLoadingMessages(messages, index + 1);
                }, 1000); // Thời gian chờ giữa các dòng
            });
        } else {
            // Sau khi tất cả các dòng đã hiển thị, chuyển sang màn hình đăng nhập
            setTimeout(() => {
                splashScreen.style.opacity = '0';
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                    authScreen.style.display = 'flex';
                }, 1000);
            }, 500); // Thời gian chờ cuối cùng
        }
    }

    // Bắt đầu hiệu ứng tải ngay khi ứng dụng khởi động
    showLoadingMessages(loadingMessages);

    // Chuyển đổi tên đăng nhập thành chữ thường
    loginUsernameInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toLowerCase();
    });
    registerUsernameInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toLowerCase();
    });

    // Thêm logic cho nút ẩn/hiện mật khẩu
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const passwordInput = btn.previousElementSibling;
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                btn.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                btn.textContent = '👁️';
            }
        });
    });

    // Chuyển đổi giữa các tab Đăng nhập/Đăng ký
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn.dataset.tab === 'login') {
                loginForm.style.display = 'flex';
                registerForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'flex';
            }
            loginError.textContent = '';
            registerError.textContent = '';
        });
    });

    // Xử lý nút Đăng ký
    registerBtn.addEventListener('click', () => {
        const username = registerUsernameInput.value;
        const password = registerPasswordInput.value;
        const confirmPassword = registerConfirmPasswordInput.value;

        if (!username || !password || !confirmPassword) {
            registerError.textContent = "Vui lòng điền đầy đủ thông tin.";
            return;
        }
        if (password !== confirmPassword) {
            registerError.textContent = "Mật khẩu không khớp. Vui lòng nhập lại.";
            return;
        }
        if (username.length < 5) {
            registerError.textContent = "Tên đăng nhập phải có ít nhất 5 ký tự.";
            return;
        }
        if (!/\d/.test(username)) {
            registerError.textContent = "Tên đăng nhập phải chứa ít nhất một chữ số.";
            return;
        }
        if (/[A-Z]/.test(username)) {
            registerError.textContent = "Tên đăng nhập không được chứa chữ hoa.";
            return;
        }

        if (localStorage.getItem(username)) {
            registerError.textContent = "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.";
            return;
        }

        localStorage.setItem(username, password);
        localStorage.setItem(`${username}_hasInfo`, 'false');

        registerError.textContent = "Đăng ký thành công! Vui lòng đăng nhập.";
        registerError.style.color = 'green';
        setTimeout(() => {
            document.querySelector('.tab-btn[data-tab="login"]').click();
            registerError.textContent = '';
        }, 1500);
    });

    // Xử lý nút Đăng nhập
    loginBtn.addEventListener('click', () => {
        const username = loginUsernameInput.value;
        const password = loginPasswordInput.value;
        const storedPassword = localStorage.getItem(username);

        if (!username || !password) {
            loginError.textContent = "Vui lòng điền đầy đủ thông tin.";
            return;
        }
        if (storedPassword && storedPassword === password) {
            currentUser = username;
            authScreen.style.display = 'none';

            const hasInfo = localStorage.getItem(`${currentUser}_hasInfo`);
            if (hasInfo === 'false' || hasInfo === null) {
                userInfoScreen.style.display = 'flex';
            } else {
                mapScreen.style.display = 'flex';
            }

            loginError.textContent = '';
        } else {
            loginError.textContent = "Tên đăng nhập hoặc mật khẩu không đúng.";
        }
    });

    // Xử lý nút Lưu thông tin người dùng
    saveInfoBtn.addEventListener('click', () => {
        const displayName = displayNameInput.value;
        const age = ageInput.value;
        const email = emailInput.value;

        if (!displayName || !age) {
            alert("Vui lòng nhập tên hiển thị và tuổi của bạn.");
            return;
        }

        const userInfo = {
            displayName: displayName,
            age: age,
            email: email
        };

        localStorage.setItem(`${currentUser}_info`, JSON.stringify(userInfo));
        localStorage.setItem(`${currentUser}_hasInfo`, 'true');

        userInfoScreen.style.display = 'none';
        mapScreen.style.display = 'flex';
    });

    // Chọn bài học trên bản đồ -> Hiển thị bài học
    mapLessonBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('unlocked')) {
                const lessonNumber = btn.dataset.lesson;
                currentLesson = lessons[lessonNumber];
                currentQuestionIndex = 0;
                mapScreen.style.display = 'none';
                lessonScreen.style.display = 'flex';
                showQuestion();
            }
        });
    });

    // Hiển thị câu hỏi
    function showQuestion() {
        if (!currentLesson || currentQuestionIndex >= currentLesson.length) {
            lessonScreen.style.display = 'none';
            mapScreen.style.display = 'flex';
            return;
        }

        const question = currentLesson[currentQuestionIndex];
        questionText.textContent = question.question;
        answerOptions.innerHTML = '';
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('answer-btn');
            button.textContent = option;
            button.addEventListener('click', () => {
                selectedAnswer = option;
                document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
                button.classList.add('selected');
            });
            answerOptions.appendChild(button);
        });

        checkBtn.style.display = 'block';
        continueBtn.style.display = 'none';
        feedbackMessage.textContent = '';
    }

    // Kiểm tra câu trả lời
    checkBtn.addEventListener('click', () => {
        if (selectedAnswer === null) {
            feedbackMessage.textContent = "Vui lòng chọn một đáp án.";
            return;
        }
        const question = currentLesson[currentQuestionIndex];
        if (selectedAnswer === question.answer) {
            feedbackMessage.textContent = "Chính xác!";
            feedbackMessage.style.color = 'green';
            checkBtn.style.display = 'none';
            continueBtn.style.display = 'block';
        } else {
            feedbackMessage.textContent = "Sai rồi! Thử lại nhé.";
            feedbackMessage.style.color = 'red';
        }
    });

    // Chuyển sang câu hỏi tiếp theo
    continueBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        selectedAnswer = null;
        showQuestion();
    });

    // --- LOGIC CHO NÚT NGÔN NGỮ ---
    const langVieBtns = document.querySelectorAll('[id^="lang-vie-btn"]');
    const langEngBtns = document.querySelectorAll('[id^="lang-eng-btn"]');
    const allLanguageButtons = document.querySelectorAll('.lang-btn');
    const allTranslatableElements = document.querySelectorAll('[data-lang-key]');

    const translations = {
        'vi': {
            'help-btn': 'HƯỚNG DẪN',
            'tab-btn-login': 'Đăng nhập',
            'tab-btn-register': 'Đăng ký',
            'login-h2': 'Đăng nhập',
            'register-h2': 'Đăng ký',
            'login-username-placeholder': 'Tên đăng nhập',
            'password-placeholder': 'Mật khẩu',
            'register-username-placeholder': 'Tên đăng nhập',
            'confirm-password-placeholder': 'Xác nhận mật khẩu',
            'login-btn': 'Đăng nhập',
            'register-btn': 'Đăng ký',
            'user-info-h2': 'Thông tin của bạn',
            'display-name-placeholder': 'Tên hiển thị',
            'age-placeholder': 'Tuổi',
            'email-placeholder': 'Email (tùy chọn)',
            'save-info-btn': 'Lưu thông tin',
            'check-btn': 'Kiểm tra',
            'continue-btn': 'Tiếp tục',
            'feedback-message-correct': 'Chính xác!',
            'feedback-message-wrong': 'Sai rồi! Thử lại nhé.',
            'feedback-message-empty': 'Vui lòng chọn một đáp án.',
        },
        'en': {
            'help-btn': 'HELP',
            'tab-btn-login': 'Log in',
            'tab-btn-register': 'Register',
            'login-h2': 'Log in',
            'register-h2': 'Register',
            'login-username-placeholder': 'Username',
            'password-placeholder': 'Password',
            'register-username-placeholder': 'Username',
            'confirm-password-placeholder': 'Confirm Password',
            'login-btn': 'Log in',
            'register-btn': 'Register',
            'user-info-h2': 'Your Info',
            'display-name-placeholder': 'Display Name',
            'age-placeholder': 'Age',
            'email-placeholder': 'Email (optional)',
            'save-info-btn': 'Save Info',
            'check-btn': 'Check',
            'continue-btn': 'Continue',
            'feedback-message-correct': 'Correct!',
            'feedback-message-wrong': 'Wrong! Try again.',
            'feedback-message-empty': 'Please select an answer.',
        }
    };

    function setLanguage(lang) {
        localStorage.setItem('language', lang);

        allTranslatableElements.forEach(el => {
            const key = el.dataset.langKey;
            if (el.tagName === 'INPUT' && el.type === 'text' || el.type === 'number' || el.type === 'email' || el.type === 'password') {
                el.placeholder = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        });
        
        // Cập nhật trạng thái active của các nút ngôn ngữ
        allLanguageButtons.forEach(btn => btn.classList.remove('active'));
        if (lang === 'vi') {
            langVieBtns.forEach(btn => btn.classList.add('active'));
        } else {
            langEngBtns.forEach(btn => btn.classList.add('active'));
        }
    }

    langVieBtns.forEach(btn => {
        btn.addEventListener('click', () => setLanguage('vi'));
    });

    langEngBtns.forEach(btn => {
        btn.addEventListener('click', () => setLanguage('en'));
    });

    // Kiểm tra ngôn ngữ đã lưu khi tải trang
    const savedLang = localStorage.getItem('language') || 'vi';
    setLanguage(savedLang);
});