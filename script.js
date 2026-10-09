/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://hvgrfsbhfddzztzowkco.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_yDAPuJJvHl4-pl5KzGK4rQ_yPBgwEfS";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
        }
    }
);


/* =========================================================
   EDGE FUNCTION
========================================================= */

const CREATE_STUDENT_FUNCTION =
    `${SUPABASE_URL}/functions/v1/create-student`;

const TELEGRAM_LINK_FUNCTION = `${SUPABASE_URL}/functions/v1/telegram-link`;


/* =========================================================
   STATE
========================================================= */

let currentUser = null;
let currentProfile = null;

let students = [];
let workHours = [];
let residentNotifications = [];
let publicTasks = [];
let notificationsChannel = null;

let assignPicker = null;
let completePicker = null;


/* =========================================================
   DOM
========================================================= */

const mainContent =
    document.getElementById("mainContent");

const notLogged =
    document.getElementById("notLogged");

const loginModal =
    document.getElementById("loginModal");

const loginBtn =
    document.getElementById("loginBtn");

const loginBtnMain =
    document.getElementById("loginBtnMain");

const logoutBtn =
    document.getElementById("logoutBtn");

const closeLoginModal =
    document.getElementById("closeLoginModal");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const userInfo =
    document.getElementById("userInfo");

const userName =
    document.getElementById("userName");

const adminPanel =
    document.getElementById("adminPanel");

const themeBtn =
    document.getElementById("themeBtn");

const notificationsList = document.getElementById("notificationsList");
const markNotificationsReadBtn = document.getElementById("markNotificationsRead");
const residentTasksList = document.getElementById("residentTasksList");
const refreshTasksBtn = document.getElementById("refreshTasksBtn");
const publishTaskForm = document.getElementById("publishTaskForm");
const publishTaskMessage = document.getElementById("publishTaskMessage");
const telegramConnectCard = document.getElementById("telegramConnectCard");
const telegramConnectStatus = document.getElementById("telegramConnectStatus");
const connectTelegramBtn = document.getElementById("connectTelegramBtn");
const disconnectTelegramBtn = document.getElementById("disconnectTelegramBtn");

const addStudentForm =
    document.getElementById("addStudentForm");

const addStudentMessage =
    document.getElementById("addStudentMessage");

const assignHoursForm =
    document.getElementById("assignHoursForm");

const assignMessage =
    document.getElementById("assignMessage");

const completeHoursForm =
    document.getElementById("completeHoursForm");

const completeMessage =
    document.getElementById("completeMessage");

const assignStudentSelect =
    document.getElementById("assignStudentSelect");

const completeStudentSelect =
    document.getElementById("completeStudentSelect");

const studentsTableBody =
    document.getElementById("studentsTableBody");

const studentSearch =
    document.getElementById("studentSearch");

const studentSearchClear =
    document.getElementById("studentSearchClear");

const studentSearchInfo =
    document.getElementById("studentSearchInfo");

const historyToggle =
    document.getElementById("historyToggle");

const historyToggleText =
    document.getElementById("historyToggleText");

const historyArrow =
    document.getElementById("historyArrow");

const historyContent =
    document.getElementById("historyContent");

const historyTableBody =
    document.getElementById("historyTableBody");

const historySearch =
    document.getElementById("historySearch");

const historySearchClear =
    document.getElementById("historySearchClear");

const historySearchInfo =
    document.getElementById("historySearchInfo");

const themePanel =
    document.getElementById("themePanel");

const themeSelect =
    document.getElementById("themeSelect");

const accentColor =
    document.getElementById("accentColor");

const resetAccentColor =
    document.getElementById("resetAccentColor");
const backgroundColor = document.getElementById("backgroundColor");
const resetBackgroundColor = document.getElementById("resetBackgroundColor");
const panelColor = document.getElementById("panelColor");
const resetPanelColor = document.getElementById("resetPanelColor");
const backgroundImageInput = document.getElementById("backgroundImageInput");
const resetBackgroundImage = document.getElementById("resetBackgroundImage");
const textColor = document.getElementById("textColor");
const resetTextColor = document.getElementById("resetTextColor");
const fontFamilySelect = document.getElementById("fontFamilySelect");
const resetFontFamily = document.getElementById("resetFontFamily");
const backgroundImageFileName = document.getElementById("backgroundImageFileName");


/* =========================================================
   UTILS
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function normalizeText(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase();
}


function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


function formatHours(value) {

    const number = Number(value || 0);

    if (Number.isInteger(number)) {
        return `${number} ч.`;
    }

    return `${number.toFixed(1)} ч.`;
}


/*
    В базе может быть:

    "Маковский Данила"
    "Маковский Данила Иванович"

    В выпадающем списке показываем только
    первые два слова.
*/

function getShortFullName(fullName) {

    const parts =
        String(fullName || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (parts.length <= 2) {
        return parts.join(" ");
    }

    return parts.slice(0, 2).join(" ");
}


/* =========================================================
   MESSAGES
========================================================= */

function showMessage(element, text, type = "") {

    if (!element) {
        return;
    }

    element.textContent = text;

    element.className =
        "form-message" +
        (type ? ` ${type}` : "");
}


function clearMessage(element) {

    if (!element) {
        return;
    }

    element.textContent = "";
    element.className = "form-message";
}


/* =========================================================
   LOGIN MODAL
========================================================= */

function openLoginModal() {

    loginError.textContent = "";

    loginModal.classList.remove("hidden");

    setTimeout(() => {

        const nickname =
            document.getElementById("loginNickname");

        if (nickname) {
            nickname.focus();
        }

    }, 50);
}


function closeLoginModalWindow() {

    loginModal.classList.add("hidden");

    loginError.textContent = "";

    loginForm.reset();
}


loginBtn.addEventListener(
    "click",
    openLoginModal
);


loginBtnMain.addEventListener(
    "click",
    openLoginModal
);


closeLoginModal.addEventListener(
    "click",
    closeLoginModalWindow
);


document.querySelector(".modal-overlay")
    .addEventListener(
        "click",
        closeLoginModalWindow
    );


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            !loginModal.classList.contains("hidden")
        ) {
            closeLoginModalWindow();
        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        loginError.textContent = "";

        const nickname =
            document
                .getElementById("loginNickname")
                .value
                .trim();

        const password =
            document
                .getElementById("loginPassword")
                .value;


        if (!nickname || !password) {

            loginError.textContent =
                "Введите ник и пароль.";

            return;
        }


        const submitButton =
            loginForm.querySelector("button[type='submit']");

        submitButton.disabled = true;

        submitButton.textContent =
            "Вход...";


        try {

            /*
                Берём настоящий email пользователя
                через RPC.
            */

            const {
                data: email,
                error: emailError
            } =
                await supabaseClient
                    .rpc(
                        "get_login_email",
                        {
                            p_nickname: nickname
                        }
                    );


            if (emailError) {
                throw emailError;
            }


            if (!email) {

                throw new Error(
                    "Пользователь с таким ником не найден."
                );
            }


            const {
                data,
                error
            } =
                await supabaseClient.auth
                    .signInWithPassword({
                        email,
                        password
                    });


            if (error) {
                throw error;
            }


            currentUser = data.user;


            closeLoginModalWindow();

            await loadProfile();

        } catch (error) {

            console.error(error);

            loginError.textContent =
                getFriendlyAuthError(error);

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Войти";
        }

    }
);


/* =========================================================
   AUTH ERROR
========================================================= */

function getFriendlyAuthError(error) {

    const message =
        String(error?.message || "")
            .toLowerCase();

    if (
        message.includes("invalid login") ||
        message.includes("invalid credentials")
    ) {
        return "Неверный ник или пароль.";
    }

    if (message.includes("email not confirmed")) {
        return "Аккаунт ещё не подтверждён.";
    }

    return error?.message ||
        "Не удалось войти в систему.";
}


/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadProfile() {

    if (!currentUser) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("students")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();


    if (error) {

        console.error(error);

        alert(
            "Не удалось загрузить профиль."
        );

        return;
    }


    if (!data) {

        await supabaseClient.auth.signOut({
            scope: "local"
        });

        showLoggedOut();

        alert(
            "Профиль пользователя не найден."
        );

        return;
    }


    currentProfile = data;

    showLoggedIn();
    await refreshTelegramConnectionStatus();

    await loadAllData();
}


/* =========================================================
   SHOW LOGGED IN
========================================================= */

function showLoggedIn() {

    mainContent.classList.remove("hidden");

    notLogged.classList.add("hidden");

    loginBtn.classList.add("hidden");

    userInfo.classList.remove("hidden");

    if(accountSettingsBtn) accountSettingsBtn.classList.remove("hidden");

    userName.textContent =
        currentProfile?.full_name ||
        currentProfile?.nickname ||
        "Пользователь";


    /*
        ВАЖНО:

        Только администратор видит кнопку "Выйти".
        У обычного жильца её нет.
    */

    const isAdmin =
        currentProfile?.role === "admin";

    logoutBtn.classList.toggle(
        "hidden",
        !isAdmin
    );

    adminPanel.classList.toggle(
        "hidden",
        !isAdmin
    );
}


/* =========================================================
   SHOW LOGGED OUT
========================================================= */

function showLoggedOut() {

    currentUser = null;

    currentProfile = null;
    if (telegramConnectCard) telegramConnectCard.classList.add("hidden");

    students = [];

    workHours = [];
    residentNotifications = [];
    publicTasks = [];
    if (notificationsChannel) {
        supabaseClient.removeChannel(notificationsChannel);
        notificationsChannel = null;
    }

    mainContent.classList.add("hidden");

    notLogged.classList.remove("hidden");

    loginBtn.classList.remove("hidden");

    logoutBtn.classList.add("hidden");

    userInfo.classList.add("hidden");

    if(accountSettingsBtn) accountSettingsBtn.classList.add("hidden");

    adminPanel.classList.add("hidden");

    userName.textContent = "";

    studentsTableBody.innerHTML = "";

    historyTableBody.innerHTML = "";
}


/* =========================================================
   LOAD ALL DATA
========================================================= */

async function loadAllData() {

    await Promise.all([
        loadStudents(),
        loadWorkHours()
    ]);

    renderStudents();

    populateResidentSelects();

    renderHistory();

    await Promise.all([loadNotifications(), loadPublicTasks()]);
    renderNotifications();
    renderPublicTasks();
    subscribeToResidentUpdates();
}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {

    let query =
        supabaseClient
            .from("students")
            .select("*")
            .order("room", {
                ascending: true
            });


    /*
        Обычный жилец может получить только
        свои данные.

        Администратор получает всех.
    */

    if (currentProfile?.role !== "admin") {

        query =
            supabaseClient
                .from("students")
                .select("*")
                .eq("id", currentUser.id);
    }


    const {
        data,
        error
    } = await query;


    if (error) {

        console.error(error);

        alert(
            "Не удалось загрузить список жильцов."
        );

        return;
    }


    students = data || [];
}


/* =========================================================
   LOAD WORK HOURS
========================================================= */

async function loadWorkHours() {

    let query =
        supabaseClient
            .from("work_hours")
            .select("*")
            .order("created_at", {
                ascending: false
            });


    /*
        Для обычного жильца загружаем только
        его отработки.
    */

    if (currentProfile?.role !== "admin") {

        query =
            query.eq(
                "student_id",
                currentUser.id
            );
    }


    const {
        data,
        error
    } = await query;


    if (error) {

        console.error(error);

        alert(
            "Не удалось загрузить отработки."
        );

        return;
    }


    workHours = data || [];
}


/* =========================================================
   CALCULATE BALANCE
========================================================= */

function getStudentStats(studentId) {

    const records =
        workHours.filter(
            item =>
                item.student_id === studentId
        );


    let assigned = 0;
    let completed = 0;


    for (const record of records) {

        const hours =
            Number(record.hours || 0);


        if (record.type === "assigned") {
            assigned += hours;
        }

        if (record.type === "completed") {
            completed += hours;
        }
    }


    return {
        assigned,
        completed,
        debt: assigned - completed
    };
}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents() {

    const search =
        normalizeText(
            studentSearch.value
        );


    let visibleStudents =
        [...students];


    if (search) {

        visibleStudents =
            visibleStudents.filter(
                student => {

                    const fullName =
                        normalizeText(
                            student.full_name
                        );

                    const room =
                        normalizeText(
                            student.room
                        );

                    const nickname =
                        normalizeText(
                            student.nickname
                        );

                    return (
                        fullName.includes(search) ||
                        room.includes(search) ||
                        nickname.includes(search)
                    );
                }
            );
    }


    /*
        Сортируем по комнате.
    */

    visibleStudents.sort(
        (a, b) => {

            return String(a.room || "")
                .localeCompare(
                    String(b.room || ""),
                    "ru",
                    {
                        numeric: true
                    }
                );

        }
    );


    studentsTableBody.innerHTML = "";


    if (!visibleStudents.length) {

        studentsTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-cell">
                    Жильцы не найдены.
                </td>
            </tr>
        `;

        studentSearchInfo.textContent =
            search
                ? "Ничего не найдено"
                : "";

        return;
    }


    studentSearchInfo.textContent =
        search
            ? `Найдено: ${visibleStudents.length}`
            : `${visibleStudents.length} жильцов`;


    for (const student of visibleStudents) {

        const stats =
            getStudentStats(student.id);


        const debtClass =
            stats.debt > 0
                ? "debt-positive"
                : "debt-zero";


        const shortName =
            getShortFullName(
                student.full_name
            );


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td class="room-cell">
                ${escapeHtml(student.room)}
            </td>

            <td class="name-cell">
                ${escapeHtml(shortName)}
            </td>

            <td class="hours-cell">
                ${formatHours(stats.assigned)}
            </td>

            <td class="hours-cell">
                ${formatHours(stats.completed)}
            </td>

            <td class="hours-cell ${debtClass}">
                ${formatHours(Math.max(stats.debt, 0))}
            </td>

        `;


        studentsTableBody.appendChild(row);
    }
}


/* =========================================================
   STUDENT SEARCH
========================================================= */

studentSearch.addEventListener("input", () => {
    const searchValue = studentSearch.value.trim().toLocaleLowerCase();
    const modal = document.getElementById("minesweeperModal");
    if (searchValue === "kanareika" && modal?.classList.contains("hidden")) {
        openMinesweeper();
    }
});

studentSearch.addEventListener(
    "input",
    () => {

        const hasValue =
            studentSearch.value.trim().length > 0;


        studentSearchClear.classList.toggle(
            "hidden",
            !hasValue
        );


        renderStudents();
    }
);


studentSearchClear.addEventListener(
    "click",
    () => {

        studentSearch.value = "";

        studentSearchClear.classList.add(
            "hidden"
        );

        renderStudents();

        studentSearch.focus();
    }
);


/* =========================================================
   RESIDENT PICKER
========================================================= */

/*
    Создаёт красивый dropdown:

    [ Выберите жильца ▼ ]

    После открытия:

    [ 🔎 Поиск по имени или комнате... ]

    [ Фамилия Имя       ]
    [ комната 304       ]

    [ Фамилия Имя       ]
    [ комната 305       ]

    [ Фамилия Имя       ]
    [ комната 306       ]

    Одновременно максимум 3 строки.
    Если жильцов больше — появляется прокрутка.
*/

function createResidentPicker(
    pickerElement,
    selectElement
) {

    const button =
        pickerElement.querySelector(
            ".resident-picker-button"
        );

    const selectedText =
        pickerElement.querySelector(
            ".picker-selected-text"
        );

    const searchInput =
        pickerElement.querySelector(
            ".picker-search-input"
        );

    const optionsContainer =
        pickerElement.querySelector(
            ".picker-options"
        );


    let selectedId = "";


    function getFilteredStudents() {

        const search =
            normalizeText(
                searchInput.value
            );


        if (!search) {
            return [...students];
        }


        return students.filter(
            student => {

                const fullName =
                    normalizeText(
                        student.full_name
                    );

                const room =
                    normalizeText(
                        student.room
                    );


                /*
                    Ник здесь тоже используется
                    для поиска, но НИКОГДА
                    не показывается в списке.
                */

                const nickname =
                    normalizeText(
                        student.nickname
                    );


                return (
                    fullName.includes(search) ||
                    room.includes(search) ||
                    nickname.includes(search)
                );
            }
        );
    }


    function renderOptions() {

        const filtered =
            getFilteredStudents();


        optionsContainer.innerHTML = "";


        if (!filtered.length) {

            optionsContainer.innerHTML = `
                <div class="picker-empty">
                    Ничего не найдено
                </div>
            `;

            return;
        }


        /*
            Показываем максимум 3 элемента.
            Остальные доступны через scroll.
        */

        for (const student of filtered) {

            const option =
                document.createElement("button");

            option.type = "button";

            option.className =
                "picker-option";


            if (
                String(student.id) ===
                String(selectedId)
            ) {
                option.classList.add(
                    "selected"
                );
            }


            const name =
                getShortFullName(
                    student.full_name
                );


            option.innerHTML = `

                <span class="picker-option-name">
                    ${escapeHtml(name)}
                </span>

                <span class="picker-option-room">
                    Комната ${escapeHtml(student.room)}
                </span>

            `;


            option.addEventListener(
                "click",
                () => {

                    selectedId =
                        String(student.id);


                    /*
                        Синхронизируем скрытый
                        select.
                    */

                    selectElement.value =
                        String(student.id);


                    selectedText.textContent =
                        `${name} — комната ${student.room}`;

                    selectedText.classList.remove(
                        "placeholder"
                    );


                    pickerElement.classList.remove(
                        "open"
                    );


                    searchInput.value = "";


                    renderOptions();
                }
            );


            optionsContainer.appendChild(
                option
            );
        }
    }


    function openPicker() {

        /*
            Закрываем остальные picker.
        */

        document
            .querySelectorAll(".resident-picker.open")
            .forEach(
                picker => {

                    if (picker !== pickerElement) {
                        picker.classList.remove(
                            "open"
                        );
                    }

                }
            );


        pickerElement.classList.add(
            "open"
        );


        renderOptions();


        setTimeout(() => {

            searchInput.focus();

        }, 30);
    }


    function closePicker() {

        pickerElement.classList.remove(
            "open"
        );
    }


    button.addEventListener(
        "click",
        () => {

            if (
                pickerElement.classList.contains(
                    "open"
                )
            ) {
                closePicker();
            } else {
                openPicker();
            }

        }
    );


    searchInput.addEventListener(
        "input",
        renderOptions
    );


    searchInput.addEventListener(
        "click",
        event => {
            event.stopPropagation();
        }
    );


    /*
        Если значение select поменялось
        программно — обновляем picker.
    */

    selectElement.addEventListener(
        "change",
        () => {

            selectedId =
                selectElement.value;


            const student =
                students.find(
                    item =>
                        String(item.id) ===
                        String(selectedId)
                );


            if (!student) {

                selectedText.textContent =
                    "Выберите жильца";

                selectedText.classList.add(
                    "placeholder"
                );

                return;
            }


            const name =
                getShortFullName(
                    student.full_name
                );


            selectedText.textContent =
                `${name} — комната ${student.room}`;

            selectedText.classList.remove(
                "placeholder"
            );
        }
    );


    return {

        refresh() {

            renderOptions();
        },

        reset() {

            selectedId = "";

            selectElement.value = "";

            selectedText.textContent =
                "Выберите жильца";

            selectedText.classList.add(
                "placeholder"
            );

            searchInput.value = "";

            renderOptions();
        },

        getValue() {

            return selectedId;
        }
    };
}


/* =========================================================
   INIT PICKERS
========================================================= */

assignPicker =
    createResidentPicker(
        document.getElementById("assignPicker"),
        assignStudentSelect
    );


completePicker =
    createResidentPicker(
        document.getElementById("completePicker"),
        completeStudentSelect
    );


/* =========================================================
   CLICK OUTSIDE PICKER
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                ".resident-picker"
            )
        ) {

            document
                .querySelectorAll(
                    ".resident-picker.open"
                )
                .forEach(
                    picker =>
                        picker.classList.remove(
                            "open"
                        )
                );
        }

    }
);


/* =========================================================
   ESCAPE PICKER
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }


        document
            .querySelectorAll(
                ".resident-picker.open"
            )
            .forEach(
                picker =>
                    picker.classList.remove(
                        "open"
                    )
            );
    }
);


/* =========================================================
   POPULATE SELECTS
========================================================= */

function populateResidentSelects() {

    /*
        Сначала очищаем скрытые select.
    */

    assignStudentSelect.innerHTML = `
        <option value="">
            Выберите жильца
        </option>
    `;


    completeStudentSelect.innerHTML = `
        <option value="">
            Выберите жильца
        </option>
    `;


    const sortedStudents =
        [...students].sort(
            (a, b) => {

                return String(a.room || "")
                    .localeCompare(
                        String(b.room || ""),
                        "ru",
                        {
                            numeric: true
                        }
                    );

            }
        );


    for (const student of sortedStudents) {

        const name =
            getShortFullName(
                student.full_name
            );


        const text =
            `${name} — комната ${student.room}`;


        const option1 =
            document.createElement("option");

        option1.value =
            student.id;

        option1.textContent =
            text;

        assignStudentSelect.appendChild(
            option1
        );


        const option2 =
            document.createElement("option");

        option2.value =
            student.id;

        option2.textContent =
            text;

        completeStudentSelect.appendChild(
            option2
        );
    }


    /*
        Обновляем custom dropdown.
    */

    if (assignPicker) {
        assignPicker.refresh();
    }

    if (completePicker) {
        completePicker.refresh();
    }
}


/* =========================================================
   ADD STUDENT
========================================================= */

addStudentForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        clearMessage(addStudentMessage);


        if (currentProfile?.role !== "admin") {

            showMessage(
                addStudentMessage,
                "Недостаточно прав.",
                "error"
            );

            return;
        }


        const nickname =
            document
                .getElementById("addNickname")
                .value
                .trim();


        const password =
            document
                .getElementById("addPassword")
                .value;


        const fullName =
            document
                .getElementById("addName")
                .value
                .trim();


        const room =
            document
                .getElementById("addRoom")
                .value
                .trim();


        if (
            !nickname ||
            !password ||
            !fullName ||
            !room
        ) {

            showMessage(
                addStudentMessage,
                "Заполните все поля.",
                "error"
            );

            return;
        }


        const submitButton =
            addStudentForm.querySelector(
                "button[type='submit']"
            );


        submitButton.disabled = true;

        submitButton.textContent =
            "Создание...";


        try {

            const {
                data: sessionData
            } =
                await supabaseClient.auth
                    .getSession();


            const session =
                sessionData?.session;


            if (!session) {

                throw new Error(
                    "Сессия администратора не найдена."
                );
            }


            const response =
                await fetch(
                    CREATE_STUDENT_FUNCTION,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${session.access_token}`
                        },

                        body: JSON.stringify({
                            nickname,
                            password,
                            full_name:
                                fullName,
                            room
                        })
                    }
                );


            let result = {};

            try {
                result =
                    await response.json();
            } catch {
                result = {};
            }


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Не удалось создать жильца."
                );
            }


            showMessage(
                addStudentMessage,
                "Жилец успешно создан.",
                "success"
            );


            addStudentForm.reset();


            /*
                После создания обновляем
                список жильцов.
            */

            await loadAllData();


        } catch (error) {

            console.error(error);

            showMessage(
                addStudentMessage,
                error.message ||
                "Ошибка создания жильца.",
                "error"
            );

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Добавить жильца";
        }

    }
);


/* =========================================================
   ASSIGN HOURS
========================================================= */

assignHoursForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        clearMessage(assignMessage);


        if (currentProfile?.role !== "admin") {

            showMessage(
                assignMessage,
                "Недостаточно прав.",
                "error"
            );

            return;
        }


        const studentId =
            assignStudentSelect.value;


        const reason =
            document
                .getElementById("assignReason")
                .value
                .trim();


        const hours =
            Number(
                document
                    .getElementById("assignHours")
                    .value
            );


        if (!studentId) {

            showMessage(
                assignMessage,
                "Выберите жильца.",
                "error"
            );

            return;
        }


        if (!reason) {

            showMessage(
                assignMessage,
                "Укажите причину.",
                "error"
            );

            return;
        }


        if (
            !Number.isFinite(hours) ||
            hours <= 0
        ) {

            showMessage(
                assignMessage,
                "Введите корректное количество часов.",
                "error"
            );

            return;
        }


        const submitButton =
            assignHoursForm.querySelector(
                "button[type='submit']"
            );


        submitButton.disabled = true;

        submitButton.textContent =
            "Сохранение...";


        try {

            const {
                error
            } =
                await supabaseClient
                    .from("work_hours")
                    .insert({
                        student_id:
                            studentId,

                        hours,

                        reason,

                        type:
                            "assigned"
                    });


            if (error) {
                throw error;
            }


            showMessage(
                assignMessage,
                "Отработка успешно назначена.",
                "success"
            );


            assignHoursForm.reset();

            assignPicker.reset();


            await loadAllData();


        } catch (error) {

            console.error(error);

            showMessage(
                assignMessage,
                error.message ||
                "Не удалось назначить отработку.",
                "error"
            );

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Назначить";
        }

    }
);


/* =========================================================
   COMPLETE HOURS
========================================================= */

completeHoursForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        clearMessage(completeMessage);


        if (currentProfile?.role !== "admin") {

            showMessage(
                completeMessage,
                "Недостаточно прав.",
                "error"
            );

            return;
        }


        const studentId =
            completeStudentSelect.value;


        const hours =
            Number(
                document
                    .getElementById("completeHours")
                    .value
            );


        if (!studentId) {

            showMessage(
                completeMessage,
                "Выберите жильца.",
                "error"
            );

            return;
        }


        if (
            !Number.isFinite(hours) ||
            hours <= 0
        ) {

            showMessage(
                completeMessage,
                "Введите корректное количество часов.",
                "error"
            );

            return;
        }


        const submitButton =
            completeHoursForm.querySelector(
                "button[type='submit']"
            );


        submitButton.disabled = true;

        submitButton.textContent =
            "Сохранение...";


        try {

            const {
                error
            } =
                await supabaseClient
                    .from("work_hours")
                    .insert({
                        student_id:
                            studentId,

                        hours,

                        reason:
                            "Выполнение отработки",

                        type:
                            "completed"
                    });


            if (error) {
                throw error;
            }


            showMessage(
                completeMessage,
                "Выполнение успешно отмечено.",
                "success"
            );


            completeHoursForm.reset();

            completePicker.reset();


            await loadAllData();


        } catch (error) {

            console.error(error);

            showMessage(
                completeMessage,
                error.message ||
                "Не удалось отметить выполнение.",
                "error"
            );

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Отметить выполнение";
        }

    }
);


/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {

    historyTableBody.innerHTML = "";

    const search = normalizeText(historySearch?.value || "");

    const studentMap = new Map(
        students.map(student => [String(student.id), student])
    );

    const visibleRecords = workHours.filter(record => {
        if (!search) return true;

        const student = studentMap.get(String(record.student_id));
        const fullName = normalizeText(student?.full_name || "Неизвестный жилец");

        // Поиск работает по полному ФИО, включая фамилию и имя.
        // Если введено несколько слов, каждое должно встретиться в ФИО.
        const words = search.split(/\s+/).filter(Boolean);
        return words.every(word => fullName.includes(word));
    });

    if (historySearchInfo) {
        historySearchInfo.textContent = search
            ? `Найдено записей: ${visibleRecords.length}`
            : `Всего записей: ${visibleRecords.length}`;
    }

    if (historySearchClear) {
        historySearchClear.classList.toggle("hidden", !search);
    }

    if (!visibleRecords.length) {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cell">
                    ${search ? "В истории ничего не найдено." : "История пока пустая."}
                </td>
            </tr>
        `;
        return;
    }

    for (const record of visibleRecords) {
        const student = studentMap.get(String(record.student_id));

        const studentName = student
            ? getShortFullName(student.full_name)
            : "Неизвестный жилец";

        const room = student?.room || "—";
        const isAssigned = record.type === "assigned";
        const typeText = isAssigned ? "Назначено" : "Выполнено";
        const typeClass = isAssigned
            ? "history-type-assigned"
            : "history-type-completed";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="name-cell">${escapeHtml(studentName)}</td>
            <td class="room-cell">${escapeHtml(room)}</td>
            <td class="hours-cell">${formatHours(record.hours)}</td>
            <td class="${typeClass}">${typeText}</td>
            <td>${escapeHtml(record.reason || "—")}</td>
            <td>${formatDate(record.created_at)}</td>
        `;

        historyTableBody.appendChild(row);
    }
}


historySearch?.addEventListener("input", () => {
    renderHistory();
});

historySearchClear?.addEventListener("click", () => {
    historySearch.value = "";
    renderHistory();
    historySearch.focus();
});


/* =========================================================
   HISTORY TOGGLE
========================================================= */

historyToggle.addEventListener(
    "click",
    () => {

        const isHidden =
            historyContent.classList.contains(
                "hidden"
            );


        historyContent.classList.toggle(
            "hidden",
            !isHidden
        );


        if (isHidden) {

            historyToggleText.textContent =
                "Скрыть историю";

            historyArrow.textContent =
                "▲";

        } else {

            historyToggleText.textContent =
                "Показать историю";

            historyArrow.textContent =
                "▼";
        }

    }
);


/* =========================================================
   LOGOUT
========================================================= */

logoutBtn.addEventListener(
    "click",
    async () => {

        /*
            Жилец физически не имеет кнопки,
            но дополнительно проверяем роль.
        */

        if (
            !currentProfile ||
            currentProfile.role !== "admin"
        ) {
            return;
        }


        const {
            error
        } =
            await supabaseClient.auth
                .signOut({
                    scope: "local"
                });


        if (error) {

            console.error(error);

            alert(
                "Не удалось выйти."
            );

            return;
        }


        showLoggedOut();
    }
);


/* =========================================================
   ТЕМЫ И СОБСТВЕННЫЙ ЦВЕТ
========================================================= */

const THEME_NAMES = {
    dark: "🌌 Тёмно-синяя",
    light: "☀️ Светлая",
    forest: "🌿 Лесная",
    sunset: "🌅 Закат",
    rose: "🌸 Розовая"
};

function applyTheme(theme) {
    const allowedThemes = ["dark", "light", "forest", "sunset", "rose"];
    const selectedTheme = allowedThemes.includes(theme) ? theme : "dark";

    document.body.classList.remove(
        "light-theme",
        "theme-forest",
        "theme-sunset",
        "theme-rose"
    );

    if (selectedTheme === "light") {
        document.body.classList.add("light-theme");
    } else if (selectedTheme !== "dark") {
        document.body.classList.add(`theme-${selectedTheme}`);
    }

    if (themeSelect) {
        themeSelect.value = selectedTheme;
    }

    localStorage.setItem("onshaga-theme", selectedTheme);
}

function applyAccentColor(color) {
    const validColor = /^#[0-9a-f]{6}$/i.test(color) ? color : "#7657ff";

    document.documentElement.style.setProperty("--custom-accent", validColor);

    // Второй оттенок слегка затемняется, чтобы сохранить градиент кнопок.
    const number = parseInt(validColor.slice(1), 16);
    const r = Math.max(0, ((number >> 16) & 255) - 35);
    const g = Math.max(0, ((number >> 8) & 255) - 35);
    const b = Math.max(0, (number & 255) - 35);
    const darker = "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");

    document.documentElement.style.setProperty("--custom-accent-2", darker);
    // Единый цвет применяется ко всем основным кнопкам и интерактивным элементам.
    localStorage.setItem("onshaga-accent-color", validColor);
}

function applyBackgroundColor(color, persist = true) {
    const validColor = /^#[0-9a-f]{6}$/i.test(color) ? color : "#28172f";
    document.documentElement.style.setProperty("--custom-page-background", validColor);
    document.body.classList.add("custom-page-background-active");
    // Selecting a solid color clears any image background so the control behaves predictably.
    document.body.classList.remove("custom-background-image-active");
    document.documentElement.style.removeProperty("--custom-background-image");
    localStorage.removeItem("onshaga-background-image");
    if (backgroundImageInput) backgroundImageInput.value = "";
    if (persist) localStorage.setItem("onshaga-background-color", validColor);
}

function resetBackgroundColorToTheme() {
    localStorage.removeItem("onshaga-background-color");
    document.body.classList.remove("custom-page-background-active");
    document.documentElement.style.removeProperty("--custom-page-background");
    if (backgroundColor) backgroundColor.value = "#28172f";
}

function applyPanelColor(color, persist = true) {
    const validColor = /^#[0-9a-f]{6}$/i.test(color) ? color : "#172d2b";
    document.documentElement.style.setProperty("--custom-panel-color", validColor);
    document.body.classList.add("custom-panels-active");
    if (persist) localStorage.setItem("onshaga-panel-color", validColor);
}

function resetPanelColorToTheme() {
    localStorage.removeItem("onshaga-panel-color");
    document.body.classList.remove("custom-panels-active");
    document.documentElement.style.removeProperty("--custom-panel-color");
    if (panelColor) panelColor.value = "#172d2b";
}

function applyBackgroundImage(dataUrl, persist = true) {
    if (!dataUrl || !String(dataUrl).startsWith("data:image/")) return;
    document.body.classList.remove("custom-page-background-active");
    document.body.classList.add("custom-background-image-active");
    document.documentElement.style.setProperty("--custom-background-image", `url("${dataUrl}")`);
    localStorage.removeItem("onshaga-background-color");
    if (persist) localStorage.setItem("onshaga-background-image", dataUrl);
}

function resetBackgroundImageToTheme() {
    localStorage.removeItem("onshaga-background-image");
    document.body.classList.remove("custom-background-image-active");
    document.documentElement.style.removeProperty("--custom-background-image");
    if (backgroundImageInput) backgroundImageInput.value = "";
}

const FONT_FAMILIES = {
    system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    arial: 'Arial, Helvetica, sans-serif',
    verdana: 'Verdana, Geneva, sans-serif',
    georgia: 'Georgia, "Times New Roman", serif',
    trebuchet: '"Trebuchet MS", sans-serif',
    tahoma: 'Tahoma, Geneva, sans-serif',
    monospace: 'ui-monospace, SFMono-Regular, Consolas, monospace'
};

function applyTextColor(color, persist = true) {
    const validColor = /^#[0-9a-f]{6}$/i.test(color) ? color : "#f3f5ff";
    document.documentElement.style.setProperty("--custom-text-color", validColor);
    document.body.classList.add("custom-text-color-active");
    if (textColor) textColor.value = validColor;
    if (persist) localStorage.setItem("onshaga-text-color", validColor);
}

function resetTextColorToTheme() {
    localStorage.removeItem("onshaga-text-color");
    document.body.classList.remove("custom-text-color-active");
    document.documentElement.style.removeProperty("--custom-text-color");
    if (textColor) textColor.value = document.body.classList.contains("light-theme") ? "#17203b" : "#f3f5ff";
}

function applyFontFamily(font, persist = true) {
    const key = Object.prototype.hasOwnProperty.call(FONT_FAMILIES, font) ? font : "system";
    document.documentElement.style.setProperty("--custom-font-family", FONT_FAMILIES[key]);
    document.body.classList.toggle("custom-font-active", key !== "system");
    if (fontFamilySelect) fontFamilySelect.value = key;
    if (persist) localStorage.setItem("onshaga-font-family", key);
}

function loadTheme() {
    const savedTheme = localStorage.getItem("onshaga-theme") || "dark";
    const savedAccent = localStorage.getItem("onshaga-accent-color") || "#7657ff";
    const savedBackground = localStorage.getItem("onshaga-background-color");
    const savedPanel = localStorage.getItem("onshaga-panel-color");
    const savedImage = localStorage.getItem("onshaga-background-image");
    const savedTextColor = localStorage.getItem("onshaga-text-color");
    const savedFont = localStorage.getItem("onshaga-font-family") || "system";

    applyTheme(savedTheme);
    applyAccentColor(savedAccent);
    if (savedBackground) {
        applyBackgroundColor(savedBackground, false);
        if (backgroundColor) backgroundColor.value = savedBackground;
    } else {
        resetBackgroundColorToTheme();
    }
    if (savedPanel) {
        applyPanelColor(savedPanel, false);
        if (panelColor) panelColor.value = savedPanel;
    } else {
        resetPanelColorToTheme();
    }
    if (savedImage) applyBackgroundImage(savedImage, false);
    if (accentColor) accentColor.value = savedAccent;
    if (savedTextColor) applyTextColor(savedTextColor, false);
    else resetTextColorToTheme();
    applyFontFamily(savedFont, false);
    if (savedImage && backgroundImageFileName) backgroundImageFileName.textContent = "Сохранённое изображение";
}

themeBtn.addEventListener("click", () => {
    const isHidden = themePanel.classList.contains("hidden");
    themePanel.classList.toggle("hidden", !isHidden);
    themeBtn.setAttribute("aria-expanded", String(isHidden));
});

themeSelect?.addEventListener("change", () => {
    applyTheme(themeSelect.value);
});

accentColor?.addEventListener("input", () => {
    applyAccentColor(accentColor.value);
});

resetAccentColor?.addEventListener("click", () => {
    if (accentColor) accentColor.value = "#7657ff";
    applyAccentColor("#7657ff");
});

textColor?.addEventListener("input", () => applyTextColor(textColor.value));
resetTextColor?.addEventListener("click", resetTextColorToTheme);
fontFamilySelect?.addEventListener("change", () => applyFontFamily(fontFamilySelect.value));
resetFontFamily?.addEventListener("click", () => applyFontFamily("system"));

backgroundColor?.addEventListener("input", () => {
    applyBackgroundColor(backgroundColor.value);
});

resetBackgroundColor?.addEventListener("click", () => {
    resetBackgroundColorToTheme();
});

panelColor?.addEventListener("input", () => {
    applyPanelColor(panelColor.value);
});

resetPanelColor?.addEventListener("click", () => {
    resetPanelColorToTheme();
});

backgroundImageInput?.addEventListener("change", () => {
    const file = backgroundImageInput.files && backgroundImageInput.files[0];
    if (!file) return;
    if (backgroundImageFileName) backgroundImageFileName.textContent = file.name;
    if (!file.type.startsWith("image/")) {
        alert("Выбери файл изображения.");
        backgroundImageInput.value = "";
        if (backgroundImageFileName) backgroundImageFileName.textContent = "JPG, PNG, WEBP · до 2 МБ";
        return;
    }
    // Limit image size because localStorage has a browser-dependent quota.
    if (file.size > 2 * 1024 * 1024) {
        alert("Выбери картинку размером до 2 МБ, чтобы она надёжно сохранилась в браузере.");
        backgroundImageInput.value = "";
        if (backgroundImageFileName) backgroundImageFileName.textContent = "JPG, PNG, WEBP · до 2 МБ";
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        try {
            applyBackgroundImage(String(reader.result));
        } catch (error) {
            alert("Не удалось сохранить картинку. Попробуй изображение меньшего размера.");
        }
    };
    reader.onerror = () => alert("Не удалось прочитать выбранную картинку.");
    reader.readAsDataURL(file);
});

resetBackgroundImage?.addEventListener("click", () => {
    resetBackgroundImageToTheme();
});

document.addEventListener("click", event => {
    if (
        themePanel &&
        !themePanel.classList.contains("hidden") &&
        !event.target.closest(".theme-controls")
    ) {
        themePanel.classList.add("hidden");
        themeBtn.setAttribute("aria-expanded", "false");
    }
});


/* =========================================================
   УВЕДОМЛЕНИЯ И БРОНИРОВАНИЕ ЗАДАНИЙ
   Требуются таблицы notifications и work_tasks из SQL-файла.
========================================================= */

function readableDate(value) {
    if (!value) return "Дата не указана";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

async function loadNotifications() {
    if (!currentUser || !notificationsList) return;
    const { data, error } = await supabaseClient
        .from("notifications")
        .select("id, title, body, kind, is_read, created_at")
        .eq("recipient_id", currentUser.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(50);
    if (error) {
        console.error("Не удалось загрузить уведомления:", error);
        residentNotifications = [];
        notificationsList.innerHTML = '<p class="muted">Не удалось загрузить уведомления. Проверь SQL-настройку.</p>';
        return;
    }
    residentNotifications = data || [];
}

function renderNotifications() {
    if (!notificationsList) return;
    if (!residentNotifications.length) {
        notificationsList.innerHTML = '<p class="muted">Пока уведомлений нет.</p>';
        if (markNotificationsReadBtn) markNotificationsReadBtn.disabled = true;
        return;
    }
    if (markNotificationsReadBtn) markNotificationsReadBtn.disabled = !residentNotifications.some(n => !n.is_read);
    notificationsList.innerHTML = residentNotifications.map(n => `
        <article class="notification-item ${n.is_read ? '' : 'unread'}" data-notification-id="${escapeHtml(n.id)}">
            <div class="notification-top"><div class="notification-title">${escapeHtml(n.title || 'Уведомление')}</div><span class="notification-time">${escapeHtml(readableDate(n.created_at))}</span></div>
            <div class="notification-body">${escapeHtml(n.body || '')}</div>
        </article>`).join("");
}

async function loadPublicTasks() {
    if (!currentUser || !residentTasksList) return;
    const { data, error } = await supabaseClient
        .from("work_tasks")
        .select("id, title, details, hours, due_date, due_time, status, booked_by, capacity, created_at")
        .in("status", ["open", "booked"])
        .order("created_at", { ascending: false });
    if (error) {
        console.error("Не удалось загрузить задания:", error);
        publicTasks = [];
        residentTasksList.innerHTML = '<p class="muted">Не удалось загрузить задания. Сначала выполни SQL-настройку из архива.</p>';
        return;
    }
    const taskRows = data || [];
    if (!taskRows.length) { publicTasks = []; return; }
    const taskIds = taskRows.map(task => task.id);
    const { data: bookings, error: bookingsError } = await supabaseClient
        .from("work_task_bookings")
        .select("task_id, resident_id")
        .in("task_id", taskIds);
    if (bookingsError) {
        console.error("Не удалось загрузить бронирования:", bookingsError);
        residentTasksList.innerHTML = '<p class="muted">Не удалось загрузить список бронирований. Проверь SQL-настройку.</p>';
        publicTasks = [];
        return;
    }
    publicTasks = taskRows.map(task => {
        const taskBookings = (bookings || []).filter(row => String(row.task_id) === String(task.id));
        return { ...task, bookings: taskBookings, booked_count: taskBookings.length,
            booked_by_me: taskBookings.some(row => String(row.resident_id) === String(currentUser.id)) };
    });
}

function renderPublicTasks() {
    if (!residentTasksList) return;
    if (!publicTasks.length) {
        residentTasksList.innerHTML = '<p class="muted">Сейчас нет свободных заданий. Загляни позже.</p>';
        return;
    }
    const isAdmin = currentProfile?.role === "admin";
    residentTasksList.innerHTML = publicTasks.map(task => {
        const capacity = Math.max(1, Number(task.capacity || 1));
        const bookedCount = Number(task.booked_count || 0);
        const bookedByMe = Boolean(task.booked_by_me);
        const isFull = bookedCount >= capacity || task.status === "booked";
        const dateText = task.due_date ? new Date(`${task.due_date}T12:00:00`).toLocaleDateString("ru-RU") : "Без даты";
        const timeText = task.due_time ? String(task.due_time).slice(0, 5) : "Время не указано";
        const dueText = `${dateText} · ${timeText}`;
        let action = "";
        if (isAdmin) {
            action = bookedCount > 0
                ? `<div class="task-admin-actions"><span class="task-status booked">Записались: ${bookedCount}/${capacity}</span><button class="btn btn-success" type="button" data-complete-task="${escapeHtml(task.id)}">Выполнено и убрать</button></div>`
                : `<span class="task-status">Записались: 0/${capacity}</span>`;
        } else if (bookedByMe) {
            action = '<span class="task-status booked">Вы записаны</span>';
        } else if (isFull) {
            action = '<span class="task-status booked">Все места заняты</span>';
        } else {
            action = `<button class="btn btn-primary" type="button" data-book-task="${escapeHtml(task.id)}">Забронировать</button>`;
        }
        const statusText = isFull ? "Набор закрыт" : `Свободно мест: ${Math.max(0, capacity - bookedCount)}`;
        return `<article class="resident-task-item"><div class="resident-task-info"><div class="resident-task-title">${escapeHtml(task.title)}</div><div>${escapeHtml(task.details || "")}</div><div class="resident-task-meta"><span>⏱ ${escapeHtml(formatHours(task.hours))} ч. каждому</span><span>📅 ${escapeHtml(dueText)}</span><span>👥 ${bookedCount}/${capacity}</span><span class="task-status ${isFull ? 'booked' : ''}">${statusText}</span></div></div><div class="task-actions">${action}</div></article>`;
    }).join("");
}

if (publishTaskForm) {
    publishTaskForm.addEventListener("submit", async event => {
        event.preventDefault();
        clearMessage(publishTaskMessage);
        if (currentProfile?.role !== "admin") {
            showMessage(publishTaskMessage, "Только администратор может публиковать задания.", "error");
            return;
        }
        const title = document.getElementById("publicTaskTitle").value.trim();
        const hours = Number(document.getElementById("publicTaskHours").value);
        const details = document.getElementById("publicTaskDetails").value.trim();
        const dueDate = document.getElementById("publicTaskDate").value || null;
        const dueTime = document.getElementById("publicTaskTime").value || null;
        const capacity = Number(document.getElementById("publicTaskCapacity").value);
        if (!title || !Number.isFinite(hours) || hours <= 0 || !Number.isInteger(capacity) || capacity < 1 || capacity > 100) {
            showMessage(publishTaskMessage, "Укажи название и корректное количество часов.", "error");
            return;
        }
        const button = publishTaskForm.querySelector("button[type='submit']");
        button.disabled = true;
        try {
            const { error } = await supabaseClient.from("work_tasks").insert({
                title, details, hours, due_date: dueDate, due_time: dueTime, capacity,
                created_by: currentUser.id, status: "open"
            });
            if (error) throw error;
            showMessage(publishTaskMessage, "Задание опубликовано. Жильцы увидят его в списке.", "success");
            publishTaskForm.reset();
            document.getElementById("publicTaskHours").value = "2";
            document.getElementById("publicTaskCapacity").value = "1";
            await Promise.all([loadPublicTasks(), loadNotifications()]);
            renderPublicTasks();
            renderNotifications();
        } catch (error) {
            console.error(error);
            showMessage(publishTaskMessage, error.message || "Не удалось опубликовать задание. Проверь SQL и права доступа.", "error");
        } finally {
            button.disabled = false;
        }
    });
}

if (residentTasksList) {
    residentTasksList.addEventListener("click", async event => {
        const completeButton = event.target.closest("[data-complete-task]");
        if (completeButton) {
            if (!currentUser || currentProfile?.role !== "admin") return;
            const taskId = Number(completeButton.dataset.completeTask);
            if (!confirm("Подтвердить выполнение? Часы будут зачтены жильцу, а задание удалено из активного списка.")) return;
            completeButton.disabled = true;
            completeButton.textContent = "Сохраняем…";
            try {
                const { data, error } = await supabaseClient.rpc("complete_and_remove_work_task", { p_task_id: taskId });
                if (error) throw error;
                if (!data) throw new Error("Задание уже недоступно или не было забронировано.");
                alert("Выполнение зачтено: часы списаны с долга жильца, задание убрано из списка.");
                await Promise.all([loadPublicTasks(), loadNotifications(), loadAllData()]);
                renderPublicTasks();
                renderNotifications();
            } catch (error) {
                console.error(error);
                alert(error.message || "Не удалось завершить задание. Проверь SQL-настройку.");
                completeButton.disabled = false;
                completeButton.textContent = "Выполнено и убрать";
            }
            return;
        }
        const button = event.target.closest("[data-book-task]");
        if (!button || !currentUser || currentProfile?.role === "admin") return;
        const taskId = button.dataset.bookTask;
        button.disabled = true;
        button.textContent = "Бронируем…";
        try {
            // Серверная функция атомарно проверяет свободный статус и бронирует задание.
            const { data, error } = await supabaseClient.rpc("book_work_task", { p_task_id: Number(taskId) });
            if (error) {
                if (String(error.message || "").toLowerCase().includes("уже") || String(error.message || "").toLowerCase().includes("недоступно")) {
                    alert("Все места уже заняты или ты уже записан на это задание. Обнови список.");
                } else {
                    throw error;
                }
            } else if (data) {
                alert("Задание успешно забронировано!");
            } else {
                alert("Это задание уже недоступно. Обнови список.");
            }
            await Promise.all([loadPublicTasks(), loadNotifications()]);
            renderPublicTasks();
            renderNotifications();
        } catch (error) {
            console.error(error);
            alert("Не удалось забронировать задание. Проверь SQL-настройку и права доступа.");
        } finally {
            button.disabled = false;
        }
    });
}

if (refreshTasksBtn) {
    refreshTasksBtn.addEventListener("click", async () => {
        await Promise.all([loadPublicTasks(), loadNotifications()]);
        renderPublicTasks();
        renderNotifications();
    });
}

if (markNotificationsReadBtn) {
    markNotificationsReadBtn.addEventListener("click", async () => {
        if (!currentUser) return;
        const { error } = await supabaseClient.from("notifications")
            .update({ is_read: true }).eq("recipient_id", currentUser.id).eq("is_read", false);
        if (error) {
            console.error(error);
            alert("Не удалось отметить уведомления прочитанными.");
            return;
        }
        await loadNotifications();
        renderNotifications();
    });
}

function subscribeToResidentUpdates() {
    if (!currentUser || notificationsChannel) return;
    notificationsChannel = supabaseClient.channel(`resident-updates-${currentUser.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${currentUser.id}` }, async () => {
            await loadNotifications();
            renderNotifications();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "work_tasks" }, async () => {
            await loadPublicTasks();
            renderPublicTasks();
        })
        .subscribe();
}

/* =========================================================
   TELEGRAM — OPTIONAL NOTIFICATION CHANNEL
   All secrets stay on the server; the browser only calls telegram-link.
========================================================= */
async function callTelegramLink(action) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session?.access_token) throw new Error("Сессия не найдена. Выйди и войди на сайт заново.");
    const response = await fetch(TELEGRAM_LINK_FUNCTION, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ action })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Ошибка Telegram (${response.status})`);
    return result;
}

async function refreshTelegramConnectionStatus() {
    if (!telegramConnectCard || !currentUser) return;
    const isAdmin = currentProfile?.role === "admin";
    telegramConnectCard.classList.toggle("hidden", isAdmin);
    if (isAdmin) return;
    try {
        const result = await callTelegramLink("status");
        const linked = Boolean(result.connected);
        telegramConnectStatus.textContent = linked
            ? "Telegram подключён. Личные уведомления будут приходить в бот."
            : "Telegram не подключён. Подключи его, если хочешь получать уведомления в боте.";
        connectTelegramBtn?.classList.toggle("hidden", linked);
        disconnectTelegramBtn?.classList.toggle("hidden", !linked);
    } catch (error) {
        console.warn("Не удалось проверить Telegram:", error);
        telegramConnectStatus.textContent = "Статус Telegram пока не удалось проверить. Можно попробовать подключить ещё раз.";
        connectTelegramBtn?.classList.remove("hidden");
        disconnectTelegramBtn?.classList.add("hidden");
    }
}

if (connectTelegramBtn) {
    connectTelegramBtn.addEventListener("click", async () => {
        if (!currentUser || currentProfile?.role === "admin") return;
        connectTelegramBtn.disabled = true;
        const label = connectTelegramBtn.textContent;
        connectTelegramBtn.textContent = "Создаём ссылку…";
        try {
            const result = await callTelegramLink("create_link");
            const link = result.url || result.telegram_url || result.start_url;
            if (typeof link !== "string" || !link.startsWith("https://t.me/")) throw new Error("Сервер не вернул корректную ссылку Telegram.");
            window.open(link, "_blank", "noopener,noreferrer");
            telegramConnectStatus.textContent = "Открылся Telegram. Нажми Start в боте в течение 10 минут, чтобы завершить привязку.";
        } catch (error) {
            console.error("Telegram connect error:", error);
            alert(error.message || "Не удалось подключить Telegram.");
        } finally {
            connectTelegramBtn.disabled = false;
            connectTelegramBtn.textContent = label;
        }
    });
}

if (disconnectTelegramBtn) {
    disconnectTelegramBtn.addEventListener("click", async () => {
        if (!currentUser || !confirm("Отключить Telegram-уведомления для этого профиля?")) return;
        disconnectTelegramBtn.disabled = true;
        try {
            await callTelegramLink("disconnect");
            telegramConnectStatus.textContent = "Telegram отключён. Уведомления на сайте продолжают работать.";
            connectTelegramBtn?.classList.remove("hidden");
            disconnectTelegramBtn.classList.add("hidden");
        } catch (error) {
            console.error("Telegram disconnect error:", error);
            alert(error.message || "Не удалось отключить Telegram.");
        } finally {
            disconnectTelegramBtn.disabled = false;
        }
    });
}

/* =========================================================
   AUTH STATE
========================================================= */

supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

        console.log(
            "AUTH:",
            event
        );


        if (session?.user) {

            currentUser =
                session.user;


            /*
                Небольшая задержка нужна,
                чтобы Supabase закончил обработку
                состояния сессии.
            */

            setTimeout(
                async () => {

                    await loadProfile();

                },
                0
            );

        } else {

            showLoggedOut();
        }
    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

async function init() {

    loadTheme();


    const {
        data,
        error
    } =
        await supabaseClient.auth
            .getSession();


    if (error) {

        console.error(error);

        showLoggedOut();

        return;
    }


    if (data?.session?.user) {

        currentUser =
            data.session.user;

        await loadProfile();

    } else {

        showLoggedOut();
    }
}


init();

const accountSettingsBtn = document.getElementById("accountSettingsBtn");
const accountSettingsModal = document.getElementById("accountSettingsModal");
const accountSettingsMessage = document.getElementById("accountSettingsMessage");

if(accountSettingsBtn){
 accountSettingsBtn.onclick=()=>accountSettingsModal.classList.remove("hidden");
 document.getElementById("closeAccountSettings").onclick=()=>accountSettingsModal.classList.add("hidden");
 document.getElementById("accountSettingsOverlay").onclick=()=>accountSettingsModal.classList.add("hidden");
 document.getElementById("saveAccountSettings").onclick=async()=>{
  try{
   let nickname=document.getElementById("newAccountNickname").value.trim();
   let password=document.getElementById("newAccountPassword").value;

   const profile=currentProfile || {};
   let nicknameChanges=Number(profile.nickname_changes || 0);
   let passwordChanges=Number(profile.password_changes || 0);

   let upd={};

   if(nickname){
     if(nicknameChanges >= 2) throw new Error("Ник можно менять только 2 раза.");
     upd.nickname=nickname;
     upd.nickname_changes=nicknameChanges+1;
   }

   if(password){
     if(passwordChanges >= 2) throw new Error("Пароль можно менять только 2 раза.");
   }

   if(Object.keys(upd).length){
     const {error}=await supabaseClient.from("students").update(upd).eq("id",currentUser.id);
     if(error) throw error;
   }

   if(password){
     const {error}=await supabaseClient.auth.updateUser({password});
     if(error) throw error;

     const {error:dbError}=await supabaseClient.from("students").update({password_changes:passwordChanges+1}).eq("id",currentUser.id);
     if(dbError) throw dbError;
   }

   await loadProfile();
   accountSettingsMessage.textContent="Сохранено";
  }catch(e){ accountSettingsMessage.textContent=e.message; }
 };
}


/* =========================================================
   SECRET MINESWEEPER — opens when searching for "kanareika"
========================================================= */
(() => {
    const modal = document.getElementById("minesweeperModal");
    const boardElement = document.getElementById("minesweeperBoard");
    const statusElement = document.getElementById("minesweeperStatus");
    const flagsElement = document.getElementById("minesweeperFlags");
    const closeButton = document.getElementById("closeMinesweeper");
    const overlay = document.getElementById("minesweeperOverlay");
    const restartButton = document.getElementById("minesweeperRestart");
    const difficultySelect = document.getElementById("minesweeperDifficulty");
    if (!modal || !boardElement) return;

    const LEVELS = {
        beginner: { rows: 9, cols: 9, mines: 10 },
        easy:     { rows: 9, cols: 9, mines: 15 },
        medium:   { rows: 16, cols: 16, mines: 40 },
        hard:     { rows: 16, cols: 30, mines: 99 },
        expert:   { rows: 24, cols: 30, mines: 180 }
    };
    let rows = 16, cols = 16, mineCount = 40;
    let cells = [];
    let gameOver = false;
    let flags = 0;

    window.openMinesweeper = function () {
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
        startGame();
    };
    function closeGame() {
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
        const searchInput = document.getElementById("studentSearch");
        if (searchInput && searchInput.value.trim().toLocaleLowerCase() === "kanareika") {
            searchInput.value = "";
            searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }
    function neighbors(index) {
        const row = Math.floor(index / cols), col = index % cols;
        const result = [];
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const r = row + dr, c = col + dc;
            if (r >= 0 && r < rows && c >= 0 && c < cols) result.push(r * cols + c);
        }
        return result;
    }
    function startGame() {
        const level = LEVELS[difficultySelect?.value] || LEVELS.medium;
        rows = level.rows; cols = level.cols; mineCount = level.mines;
        cells = Array.from({ length: rows * cols }, () => ({ mine: false, revealed: false, flagged: false, count: 0 }));
        gameOver = false; flags = 0;
        let placed = 0;
        while (placed < mineCount) {
            const i = Math.floor(Math.random() * cells.length);
            if (!cells[i].mine) { cells[i].mine = true; placed++; }
        }
        cells.forEach((cell, i) => { cell.count = neighbors(i).filter(n => cells[n].mine).length; });
        statusElement.textContent = "Удачи!";
        boardElement.style.setProperty("--mine-cols", cols);
        // Keep small boards compact; expand only for wider difficulties.
        const boardWidth = cols <= 9 ? "360px" : cols <= 16 ? "560px" : "1120px";
        boardElement.style.width = `min(100%, ${boardWidth})`;
        boardElement.dataset.size = cols > 20 ? "wide" : "normal";
        boardElement.setAttribute("aria-label", `Поле сапёра ${rows} на ${cols}`);
        render();
    }
    function render(showAllMines = false) {
        boardElement.innerHTML = "";
        boardElement.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
        boardElement.style.minWidth = "0";
        flagsElement.textContent = `${flags} / ${mineCount}`;
        cells.forEach((cell, i) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "mine-cell";
            button.setAttribute("aria-label", `Клетка ${Math.floor(i / cols) + 1}, ${i % cols + 1}`);
            if (cell.flagged && !cell.revealed) {
                button.textContent = "🚩"; button.classList.add("flagged");
            } else if (cell.revealed || (showAllMines && cell.mine)) {
                button.classList.add("revealed");
                if (cell.mine) { button.textContent = "💣"; if (cell.revealed) button.classList.add("mine-hit"); }
                else if (cell.count) { button.textContent = cell.count; button.style.color = ["", "#2563eb", "#15803d", "#dc2626", "#6d28d9", "#b45309", "#0e7490", "#111827", "#475569"][cell.count]; }
            }
            button.disabled = gameOver || cell.revealed;
            button.addEventListener("click", () => reveal(i));
            button.addEventListener("contextmenu", event => { event.preventDefault(); toggleFlag(i); });
            let holdTimer;
            button.addEventListener("touchstart", () => { holdTimer = setTimeout(() => { toggleFlag(i); holdTimer = null; }, 450); }, { passive: true });
            button.addEventListener("touchend", () => { if (holdTimer) clearTimeout(holdTimer); }, { passive: true });
            boardElement.appendChild(button);
        });
    }
    function reveal(index) {
        if (gameOver || cells[index].revealed || cells[index].flagged) return;
        if (cells[index].mine) {
            cells[index].revealed = true; gameOver = true;
            statusElement.textContent = "Бум! Попробуй ещё раз.";
            render(true); return;
        }
        const stack = [index];
        while (stack.length) {
            const current = stack.pop(), cell = cells[current];
            if (cell.revealed || cell.flagged || cell.mine) continue;
            cell.revealed = true;
            if (cell.count === 0) neighbors(current).forEach(n => { if (!cells[n].revealed) stack.push(n); });
        }
        if (cells.every(cell => cell.mine || cell.revealed)) {
            gameOver = true; statusElement.textContent = "Победа! Все безопасные клетки открыты 🎉";
        }
        render();
    }
    function toggleFlag(index) {
        if (gameOver || cells[index].revealed) return;
        if (!cells[index].flagged && flags >= mineCount) return;
        cells[index].flagged = !cells[index].flagged;
        flags += cells[index].flagged ? 1 : -1;
        render();
    }
    closeButton?.addEventListener("click", closeGame);
    overlay?.addEventListener("click", closeGame);
    restartButton?.addEventListener("click", startGame);
    const levelCards = document.querySelectorAll(".mine-level-card");
    levelCards.forEach(card => card.addEventListener("click", () => {
        if (!difficultySelect) return;
        difficultySelect.value = card.dataset.level;
        levelCards.forEach(item => {
            const selected = item === card;
            item.classList.toggle("is-selected", selected);
            item.setAttribute("aria-pressed", String(selected));
        });
        startGame();
    }));
    levelCards.forEach(card => card.setAttribute("aria-pressed", String(card.dataset.level === (difficultySelect?.value || "medium"))));
    difficultySelect?.addEventListener("change", () => {
        levelCards.forEach(card => {
            const selected = card.dataset.level === difficultySelect.value;
            card.classList.toggle("is-selected", selected);
            card.setAttribute("aria-pressed", String(selected));
        });
        startGame();
    });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.classList.contains("hidden")) closeGame(); });
})();
