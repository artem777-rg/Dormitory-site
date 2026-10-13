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
let councilResidentIds = new Set();
let moopResidentIds = new Set();
let councilMemberTags = new Map();
let moopMemberTags = new Map();
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
                "Введите логин и пароль.";

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
                    "Пользователь с таким логином не найден."
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
        return "Неверный логин или пароль.";
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

    // Админские инструменты открываются только через кнопку «Открыть панель управления»
    adminPanel?.classList.add("hidden");

    syncDataTabsForRole();
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

    await loadResidentRoleMemberships();
    renderStudents();
    await renderTopDormitory();
    renderAchievements();
    renderStudentPersonalStats();
    updateStudentNavigation();

    populateResidentSelects();
    populateImmunityStudentSelect();

    renderHistory();

    await Promise.all([loadNotifications(), loadPublicTasks()]);
    renderNotifications();
    renderPublicTasks();
    subscribeToResidentUpdates();
}


/* =========================================================
   PERSONAL STUDENT STATISTICS + ROLE-BASED NAVIGATION
========================================================= */
function renderStudentPersonalStats() {
    const section = document.getElementById("studentPersonalStats");
    if (!section || !currentUser) return;
    const isStudent = currentProfile?.role !== "admin";
    section.classList.toggle("hidden", !isStudent);
    if (!isStudent) return;

    const stats = getStudentStats(currentUser.id);
    const assigned = Math.max(0, Number(stats.assigned) || 0);
    const completed = Math.max(0, Number(stats.completed) || 0);
    const debt = Math.max(0, assigned - completed);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    let monthAssigned = 0;
    let monthCompleted = 0;

    for (const record of workHours) {
        if (record.student_id !== currentUser.id || !record.created_at) continue;
        const date = new Date(record.created_at);
        if (Number.isNaN(date.getTime()) || date < monthStart || date >= nextMonth) continue;
        const hours = Math.max(0, Number(record.hours) || 0);
        if (record.type === "assigned") monthAssigned += hours;
        if (record.type === "completed") monthCompleted += hours;
    }

    const progress = assigned > 0 ? Math.min(100, Math.round(completed / assigned * 100)) : 0;
    const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    setText("personalDebt", `${formatTopHours(debt)} ч.`);
    setText("personalCompleted", `${formatTopHours(completed)} ч.`);
    setText("personalImmunity", `${formatTopHours(Number(currentProfile?.immunity_hours ?? students.find(x => x.id === currentUser.id)?.immunity_hours ?? 0))} ч.`);
    setText("monthAssigned", `${formatTopHours(monthAssigned)} ч.`);
    setText("monthCompleted", `${formatTopHours(monthCompleted)} ч.`);
    setText("personalProgressLabel", `${progress}%`);
    const bar = document.getElementById("personalProgressBar");
    if (bar) bar.style.width = `${progress}%`;
}

function updateStudentNavigation() {
    const isStudent = currentProfile?.role !== "admin";
    const main = document.getElementById("mainContent");
    main?.classList.toggle("is-admin-dashboard", !isStudent);
    const mobileNav = document.getElementById("residentMobileNav");
    if (mobileNav) mobileNav.classList.toggle("hidden", !isStudent);
    const residentsTab = document.getElementById("residentsTab");
    const studentsSection = document.querySelector(".students-section:not(.history-section):not(.public-residents-section)");
    const tabs = document.querySelector(".data-tabs");
    if (residentsTab) residentsTab.classList.toggle("hidden", isStudent);
    if (studentsSection) studentsSection.classList.toggle("hidden", isStudent);
    if (tabs) tabs.classList.remove("hidden");
    document.querySelector(".section-header")?.classList.toggle("hidden", isStudent);
    document.getElementById("residentExtrasLauncher")?.classList.toggle("hidden", !isStudent);
    if (isStudent) {
        const workspace = document.querySelector(".resident-workspace");
        const leaderboard = document.querySelector(".global-ranking-card");
        const stats = document.getElementById("studentPersonalStats");
        if (workspace && leaderboard && leaderboard.parentElement) leaderboard.insertAdjacentElement("afterend", workspace);
        if (stats && stats.parentElement) {
            const tabsWrap = document.querySelector(".data-tabs");
            if (tabsWrap) stats.insertAdjacentElement("afterend", tabsWrap);
        }
        document.getElementById("historySection")?.classList.add("hidden");
        document.getElementById("publicResidentsSection")?.classList.add("hidden");
    } else {
        const history = document.getElementById("historySection");
        if (history) history.style.display = "";
    }
}

/* =========================================================
   GLOBAL DORMITORY RANKING
   The RPC returns only top 5 and the current user's rank.
========================================================= */
async function renderTopDormitory() {
    const list = document.getElementById("topDormitoryList");
    const myRankBox = document.getElementById("myDormitoryRank");
    if (!list || !myRankBox || !currentUser) return;
    list.innerHTML = '<div class="top-empty">Загружаем общий рейтинг…</div>';
    myRankBox.innerHTML = '<span>Ваше место среди всех жильцов</span><strong>Загрузка…</strong>';

    const { data, error } = await supabaseClient.rpc("get_dormitory_hour_ranking");
    if (error || !data) {
        console.error("Не удалось загрузить общий рейтинг:", error);
        list.innerHTML = '<div class="top-empty">Не удалось загрузить рейтинг. Администратору нужно выполнить SQL-файл из архива в Supabase.</div>';
        myRankBox.innerHTML = '<span>Ваше место среди всех жильцов</span><strong>—</strong>';
        return;
    }

    const top = Array.isArray(data.top5) ? data.top5 : [];
    const medals = ["🥇", "🥈", "🥉"];
    if (!top.length) {
        list.innerHTML = '<div class="top-empty">Пока нет данных для рейтинга.</div>';
    } else {
        const maxDebt = Math.max(1, ...top.map(row => Number(row.debt_hours) || 0));
        list.innerHTML = top.map((row, index) => {
            const debt = Math.max(0, Number(row.debt_hours) || 0);
            const pct = Math.round(debt / maxDebt * 100);
            const name = escapeHtml(row.full_name || "Без имени");
            const room = escapeHtml(row.room || "—");
            return `<div class="top-rank-row ${index === 0 ? 'rank-first' : ''}">
              <div class="top-rank-medal">${medals[index] || `#${index + 1}`}</div>
              <div class="top-rank-name">${name}<span class="top-rank-meta">Комната ${room}</span><div class="top-progress"><span style="width:${pct}%"></span></div></div>
              <div class="top-rank-hours"><strong>${formatTopHours(debt)} ч</strong><small>кол-во часов</small></div>
            </div>`;
        }).join("");
    }

    const rank = data.my_rank == null ? null : Number(data.my_rank);
    const debt = Math.max(0, Number(data.my_debt_hours) || 0);
    myRankBox.innerHTML = `<span>Ваше место среди всех жильцов</span><strong>${rank ? `#${rank}` : 'Нет в рейтинге'}</strong><small>Кол-во часов: ${formatTopHours(debt)} ч · всего жильцов: ${Number(data.total_residents) || 0}</small>`;
}

function formatTopHours(value) {
    const n = Math.round((Number(value)||0)*100)/100;
    return Number.isInteger(n) ? String(n) : n.toLocaleString("ru-RU",{maximumFractionDigits:2});
}

/* =========================================================
   RESIDENT ACHIEVEMENTS
========================================================= */
function renderAchievements() {
    const grid = document.getElementById("achievementGrid");
    const completedEl = document.getElementById("achievementCompletedHours");
    const unlockedEl = document.getElementById("achievementUnlockedCount");
    if (!grid || !currentUser) return;

    const stats = getStudentStats(currentUser.id);
    const completed = Math.max(0, Number(stats.completed) || 0);
    const assigned = Math.max(0, Number(stats.assigned) || 0);
    const debt = Math.max(0, assigned - completed);
    const definitions = [
        { id: "start", icon: "🌱", title: "Первый шаг", description: "Выполни первый час", unlocked: completed >= 1 },
        { id: "five", icon: "🧹", title: "Разминка", description: "Закрой 5 часов", unlocked: completed >= 5 },
        { id: "ten", icon: "⭐", title: "Уверенный старт", description: "Закрой 10 часов", unlocked: completed >= 10 },
        { id: "twentyfive", icon: "🔥", title: "В ударе", description: "Закрой 25 часов", unlocked: completed >= 25 },
        { id: "fifty", icon: "💎", title: "Мастер отработок", description: "Закрой 50 часов", unlocked: completed >= 50 },
        { id: "half", icon: "🎯", title: "Половина пути", description: "Выполни не меньше половины назначенных часов", unlocked: assigned > 0 && completed >= assigned / 2 },
        { id: "clear", icon: "🏆", title: "Долг закрыт", description: "Погаси весь текущий долг", unlocked: assigned > 0 && debt <= 0 }
    ];
    const unlocked = definitions.filter(item => item.unlocked).length;

    if (completedEl) completedEl.textContent = `${formatTopHours(completed)} ч.`;
    if (unlockedEl) unlockedEl.textContent = `${unlocked} из ${definitions.length}`;

    grid.innerHTML = definitions.map(item => `
        <article class="achievement-item ${item.unlocked ? "is-unlocked" : "is-locked"}" aria-label="${escapeHtml(item.title)}: ${item.unlocked ? "получено" : "ещё не получено"}">
            <div class="achievement-icon">${item.unlocked ? item.icon : "🔒"}</div>
            <div class="achievement-copy">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
            </div>
            <span class="achievement-status">${item.unlocked ? "Получено" : "Впереди"}</span>
        </article>
    `).join("");
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


/* Load Council/MOOP memberships so the residents table can highlight them. */
async function loadResidentRoleMemberships() {
    councilResidentIds = new Set();
    moopResidentIds = new Set();
    councilMemberTags = new Map();
    moopMemberTags = new Map();

    // Загружаем роли вместе с тегами, созданными администратором.
    const [councilResult, moopResult] = await Promise.all([
        supabaseClient.from("council_members").select("student_id, tag"),
        supabaseClient.from("moop_members").select("student_id, tag")
    ]);

    if (!councilResult.error) {
        (councilResult.data || []).forEach(x => {
            const id = String(x.student_id);
            councilResidentIds.add(id);
            councilMemberTags.set(id, x.tag || "Совет");
        });
    }

    if (!moopResult.error) {
        (moopResult.data || []).forEach(x => {
            const id = String(x.student_id);
            moopResidentIds.add(id);
            moopMemberTags.set(id, x.tag || "МООП");
        });
    }
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
                String(item.student_id) === String(studentId)
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
        debt: Math.max(0, assigned - completed)
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
                <td colspan="7" class="empty-cell">
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
        const isMoop = moopResidentIds.has(String(student.id));
        const isCouncil = councilResidentIds.has(String(student.id));
        const moopTag = moopMemberTags?.get(String(student.id)) || "МООП";
        const councilTag = councilMemberTags?.get(String(student.id)) || "Совет";
        row.classList.add("resident-role-row");
        if (isMoop) row.classList.add("resident-role-moop");
        else if (isCouncil) row.classList.add("resident-role-council");

        row.innerHTML = `

            <td class="room-cell">
                ${escapeHtml(student.room || "—")}
            </td>

            <td class="name-cell">
                <span class="resident-role-fullname">${escapeHtml(shortName)}</span>
                
                ${isMoop ? `<span class="resident-role-label">● ${escapeHtml(moopTag)}</span>` : isCouncil ? `<span class="resident-role-label">✦ ${escapeHtml(councilTag)}</span>` : ""}
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
            <td class="hours-cell immunity-hours-cell">${formatHours(Number(student.immunity_hours || 0))}</td>

            <td class="resident-actions-cell">
                ${currentProfile?.role === "admin" && student.id !== currentUser?.id ? `
                    <button type="button" class="resident-delete-btn" data-delete-student="${escapeHtml(student.id)}" aria-label="Удалить жильца ${escapeHtml(shortName)}" title="Удалить жильца">
                        <span aria-hidden="true">✕</span> Удалить жильца
                    </button>
                ` : ""}
            </td>

        `;


        studentsTableBody.appendChild(row);
    }
    if (currentProfile?.role === "admin") { renderCouncilAdmin(); renderMoopAdmin(); }
}


/* =========================================================
   ADMIN: DELETE RESIDENT
========================================================= */

studentsTableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-student]");
    if (!button) return;

    if (currentProfile?.role !== "admin") {
        alert("Удалять жильцов может только администратор.");
        return;
    }

    const studentId = button.dataset.deleteStudent;
    const student = students.find(item => String(item.id) === String(studentId));
    if (!student || studentId === currentUser?.id) return;

    const residentName = student.full_name || student.nickname || "этого жильца";
    const confirmed = confirm(`Удалить жильца «${residentName}» из списка?\n\nЕсли база данных запрещает удаление или у жильца есть связанные записи, операция не будет выполнена.`);
    if (!confirmed) return;

    button.disabled = true;
    button.textContent = "Удаление…";

    try {
        // Запрашиваем удалённые строки: Supabase может вернуть success без ошибки,
        // даже если RLS не разрешил удалить ни одной записи.
        const { data: deletedRows, error } = await supabaseClient
            .from("students")
            .delete()
            .eq("id", studentId)
            .select("id");

        if (error) throw error;
        if (!deletedRows || deletedRows.length === 0) {
            throw new Error("Запись не удалена: Supabase не вернул удалённую строку. Проверьте RLS-политику DELETE для администратора.");
        }

        students = students.filter(item => String(item.id) !== String(studentId));
        workHours = workHours.filter(item => String(item.student_id) !== String(studentId));
        // Сразу перерисовываем таблицу, затем синхронизируем остальные разделы.
        renderStudents();
        renderHistory();
        populateResidentSelects();
        await Promise.all([renderTopDormitory(), renderAchievements()]);
        renderStudentPersonalStats();
        updateStudentNavigation();
        alert(`Жилец «${residentName}» удалён из списка.`);
    } catch (error) {
        console.error("Не удалось удалить жильца:", error);
        alert(`Не удалось удалить жильца. Проверь права DELETE для администратора в Supabase и связанные ограничения.\n\n${error?.message || "Неизвестная ошибка"}`);
        button.disabled = false;
        button.innerHTML = '<span aria-hidden="true">✕</span> Удалить жильца';
    }
});


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
                    Логин здесь тоже используется
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
   IMMUNITY HOURS (admin)
========================================================= */
function populateImmunityStudentSelect() {
    const select = document.getElementById("immunityStudentSelect");
    if (!select) return;
    const oldValue = select.value;
    select.innerHTML = '<option value="">Выбери жильца</option>';
    [...students].sort((a,b) => String(a.room || "").localeCompare(String(b.room || ""), "ru", {numeric:true})).forEach(student => {
        const option = document.createElement("option");
        option.value = student.id;
        option.textContent = `${student.full_name || student.nickname || "Жилец"} — комната ${student.room || "—"} (иммунитет: ${Number(student.immunity_hours || 0)} ч.)`;
        select.appendChild(option);
    });
    if (oldValue) select.value = oldValue;
}

const immunityForm = document.getElementById("immunityForm");
if (immunityForm) immunityForm.addEventListener("submit", async event => {
    event.preventDefault();
    const message = document.getElementById("immunityMessage");
    clearMessage(message);
    if (currentProfile?.role !== "admin") { showMessage(message, "Недостаточно прав.", "error"); return; }
    const studentId = document.getElementById("immunityStudentSelect").value;
    const amount = Number(document.getElementById("immunityHours").value);
    const student = students.find(x => String(x.id) === String(studentId));
    if (!student) { showMessage(message, "Выберите жильца.", "error"); return; }
    if (!Number.isFinite(amount) || amount <= 0) { showMessage(message, "Укажите количество часов больше нуля.", "error"); return; }
    const button = immunityForm.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
        // Apply newly granted immunity to existing debt first. Only the unused
        // remainder stays as immunity for future assignments.
        const { data: freshStudent, error: studentError } = await supabaseClient
            .from("students").select("id, immunity_hours").eq("id", studentId).single();
        if (studentError) throw studentError;

        const { data: records, error: recordsError } = await supabaseClient
            .from("work_hours").select("hours, type").eq("student_id", studentId);
        if (recordsError) throw recordsError;

        let assigned = 0;
        let completed = 0;
        for (const record of (records || [])) {
            const value = Number(record.hours || 0);
            if (record.type === "assigned") assigned += value;
            if (record.type === "completed") completed += value;
        }
        const currentDebt = Math.max(0, assigned - completed);
        const currentImmunity = Math.max(0, Number(freshStudent.immunity_hours || 0));
        const totalAvailable = currentImmunity + amount;
        const debtCovered = Math.min(currentDebt, totalAvailable);
        const remainingImmunity = Math.max(0, totalAvailable - debtCovered);

        // Keep history/stats consistent by recording covered debt as completed hours.
        if (debtCovered > 0) {
            const { error: coverError } = await supabaseClient.from("work_hours").insert({
                student_id: studentId,
                hours: debtCovered,
                reason: "Погашение иммунитетом",
                type: "completed"
            });
            if (coverError) throw coverError;
        }

        const { error: updateError } = await supabaseClient.from("students")
            .update({ immunity_hours: remainingImmunity }).eq("id", studentId);
        if (updateError) throw updateError;

        showMessage(message,
            `Добавлено ${formatHours(amount)} ч. иммунитета. Долг погашен: ${formatHours(debtCovered)} ч. Остаток долга: ${formatHours(Math.max(0, currentDebt - debtCovered))} ч. Остаток иммунитета: ${formatHours(remainingImmunity)} ч.`,
            "success");
        immunityForm.reset();
        await loadAllData();
    } catch (error) {
        console.error(error);
        showMessage(message, "Не удалось добавить иммунитет. Проверь, что добавлена колонка immunity_hours в таблице students.", "error");
    } finally { button.disabled = false; }
});

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
            // Read the latest immunity directly from Supabase; the local students
            // array can be stale if another admin changed the balance.
            const { data: freshStudent, error: freshStudentError } = await supabaseClient
                .from("students").select("id, immunity_hours").eq("id", studentId).single();
            if (freshStudentError) throw freshStudentError;

            const availableImmunity = Math.max(0, Number(freshStudent?.immunity_hours ?? 0));
            const immunityUsed = Math.min(availableImmunity, hours);
            const effectiveHours = Math.max(0, hours - immunityUsed);

            // Consume immunity first, then add only the uncovered hours to the debt.
            if (immunityUsed > 0) {
                const { error: immunityError } = await supabaseClient.from("students")
                    .update({ immunity_hours: Math.max(0, availableImmunity - immunityUsed) }).eq("id", studentId);
                if (immunityError) throw immunityError;
            }

            if (effectiveHours > 0) {
                const { error: insertError } = await supabaseClient.from("work_hours").insert({
                    student_id: studentId, hours: effectiveHours, reason, type: "assigned"
                });
                if (insertError) {
                    if (immunityUsed > 0) {
                        const { error: rollbackError } = await supabaseClient.from("students")
                            .update({ immunity_hours: availableImmunity }).eq("id", studentId);
                        if (rollbackError) console.error("Не удалось восстановить иммунитет после ошибки начисления:", rollbackError);
                    }
                    throw insertError;
                }
            }


            showMessage(
                assignMessage,
                immunityUsed > 0
                    ? `Начислено ${formatHours(hours)} ч.; иммунитет погасил ${formatHours(immunityUsed)} ч. В долг добавлено ${formatHours(effectiveHours)} ч. Остаток иммунитета: ${formatHours(availableImmunity - immunityUsed)} ч.`
                    : "Отработка успешно назначена.",
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
            // Refresh the student's balance so completed hours beyond the current
            // debt become immunity instead of disappearing into an over-completion.
            const { data: freshStudent, error: studentError } = await supabaseClient
                .from("students")
                .select("id, immunity_hours")
                .eq("id", studentId)
                .single();
            if (studentError) throw studentError;

            const { data: records, error: recordsError } = await supabaseClient
                .from("work_hours")
                .select("hours, type")
                .eq("student_id", studentId);
            if (recordsError) throw recordsError;

            let assigned = 0;
            let alreadyCompleted = 0;
            (records || []).forEach(record => {
                const value = Math.max(0, Number(record.hours) || 0);
                if (record.type === "assigned") assigned += value;
                else if (record.type === "completed") alreadyCompleted += value;
            });

            const debtBefore = Math.max(0, assigned - alreadyCompleted);
            const hoursAppliedToDebt = Math.min(hours, debtBefore);
            const hoursToImmunity = Math.max(0, hours - hoursAppliedToDebt);
            const oldImmunity = Math.max(0, Number(freshStudent.immunity_hours) || 0);

            // Only the part that clears existing debt is logged as completed work.
            if (hoursAppliedToDebt > 0) {
                const { error: insertError } = await supabaseClient
                    .from("work_hours")
                    .insert({
                        student_id: studentId,
                        hours: hoursAppliedToDebt,
                        reason: "Выполнение отработки",
                        type: "completed"
                    });
                if (insertError) throw insertError;
            }

            // Any extra completed hours are stored as immunity for future assignments.
            if (hoursToImmunity > 0) {
                const { error: immunityError } = await supabaseClient
                    .from("students")
                    .update({ immunity_hours: oldImmunity + hoursToImmunity })
                    .eq("id", studentId);
                if (immunityError) {
                    // Roll back the completed-hours entry if the immunity update fails.
                    if (hoursAppliedToDebt > 0) {
                        const { error: rollbackError } = await supabaseClient
                            .from("work_hours")
                            .delete()
                            .eq("student_id", studentId)
                            .eq("type", "completed")
                            .eq("reason", "Выполнение отработки")
                            .order("created_at", { ascending: false })
                            .limit(1);
                        if (rollbackError) console.error("Не удалось откатить запись выполнения:", rollbackError);
                    }
                    throw immunityError;
                }
            }

            const newDebt = Math.max(0, debtBefore - hoursAppliedToDebt);
            showMessage(
                completeMessage,
                hoursToImmunity > 0
                    ? `Выполнение отмечено. Долг уменьшен на ${formatHours(hoursAppliedToDebt)} ч.; в иммунитет добавлено ${formatHours(hoursToImmunity)} ч. Новый долг: ${formatHours(newDebt)} ч.`
                    : `Выполнение отмечено. Долг уменьшен на ${formatHours(hoursAppliedToDebt)} ч. Остаток долга: ${formatHours(newDebt)} ч.`,
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


/* Поиск по истории начислений */
historySearch?.addEventListener("input", () => renderHistory());
historySearchClear?.addEventListener("click", () => {
    if (historySearch) historySearch.value = "";
    renderHistory();
    historySearch?.focus();
});

/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {

    historyTableBody.innerHTML = "";

    const search = (historySearch?.value || "").trim().toLocaleLowerCase("ru");

    const studentMap = new Map(
        students.map(student => [String(student.id), student])
    );

    const visibleRecords = [...workHours].filter(record => {
        if (!search) return true;
        const student = studentMap.get(String(record.student_id));
        const haystack = [
            student?.full_name,
            student?.room,
            record.reason,
            record.type === "assigned" ? "назначено начислено назначение" : "выполнено закрыто выполнение",
            String(record.hours ?? ""),
            formatDate(record.created_at)
        ].join(" ").toLocaleLowerCase("ru");
        return haystack.includes(search);
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


/* =========================================================
   PUBLIC RESIDENT ROSTER (names + room only)
========================================================= */
async function renderPublicResidents() {
    const body = document.getElementById("publicResidentsTableBody");
    if (!body) return;
    body.innerHTML = '<tr><td colspan="2" class="empty-cell">Загружаем список…</td></tr>';
    let data = null;
    if (currentProfile?.role === "admin") {
        data = students.map(({full_name, room}) => ({full_name, room}));
    } else {
        const { data: rows, error } = await supabaseClient.rpc("get_public_resident_roster");
        if (error) {
            console.error("Не удалось загрузить список жильцов:", error);
            body.innerHTML = '<tr><td colspan="2" class="empty-cell">Не удалось загрузить список. Администратору нужно выполнить SQL-файл public_resident_roster.sql в Supabase.</td></tr>';
            return;
        }
        data = rows || [];
    }
    // В публичном списке не показываем комнату 000 (воспитатель).
    data = (data || []).filter(person => String(person.room || "").trim() !== "000");
    // Подтягиваем публичные теги Совета, чтобы отметить участников и в общем списке.
    const [councilRosterResult, moopRosterResult] = await Promise.all([
        supabaseClient.rpc("get_public_council_roster"),
        supabaseClient.rpc("get_public_moop_roster")
    ]);
    const councilMembers = councilRosterResult.data;
    const councilError = councilRosterResult.error;
    const councilByPerson = new Map();
    const moopByPerson = new Map();
    moopMemberTags = new Map();
    councilMemberTags = new Map();
    if (!moopRosterResult.error) (moopRosterResult.data || []).forEach(member => {
        if (member.student_id) moopMemberTags.set(String(member.student_id), member.tag || "МООП");
        moopByPerson.set(`${String(member.room || "").trim()}|${String(member.full_name || "").trim().toLocaleLowerCase("ru")}`, member);
    });
    if (!councilError) (councilMembers || []).forEach(member => {
        if (member.student_id) councilMemberTags.set(String(member.student_id), member.tag || "Совет");
        councilByPerson.set(`${String(member.room || "").trim()}|${String(member.full_name || "").trim().toLocaleLowerCase("ru")}`, member.tag || "Совет общежития");
    });
    data.sort((a, b) => String(a.room || "").localeCompare(String(b.room || ""), "ru", {numeric:true}));
    if (!data.length) {
        body.innerHTML = '<tr><td colspan="2" class="empty-cell">Список жильцов пока пуст.</td></tr>';
        return;
    }
    body.innerHTML = data.map(person => {
        const key = `${String(person.room || "").trim()}|${String(person.full_name || "").trim().toLocaleLowerCase("ru")}`;
        const tag = councilByPerson.get(key);
        const moopMember = moopByPerson.get(key);
        const isMoop = Boolean(moopMember);
        const isCouncil = Boolean(tag) && !isMoop;
        const personName = escapeHtml(person.full_name || "Без имени");
        const roleClass = isMoop ? "resident-role-moop" : isCouncil ? "resident-role-council" : "";
        const roleTag = isMoop
            ? ` <span class="resident-role-label">● ${escapeHtml(moopMember.tag || "МООП")}</span>`
            : isCouncil ? ` <span class="resident-role-label">✦ ${escapeHtml(tag || "Совет")}</span>` : "";
        return `<tr class="${roleClass}"><td class="room-cell">${escapeHtml(person.room || "—")}</td><td class="name-cell"><span class="resident-role-fullname">${personName}</span>${roleTag}</td></tr>`;
    }).join("");
    filterPublicResidents();
}

function filterPublicResidents() {
    const input = document.getElementById("publicResidentsSearch");
    const body = document.getElementById("publicResidentsTableBody");
    if (!input || !body) return;
    const query = input.value.trim().toLocaleLowerCase("ru");
    let visible = 0;
    body.querySelectorAll("tr").forEach(row => {
        const matches = !query || row.textContent.toLocaleLowerCase("ru").includes(query);
        row.classList.toggle("hidden", !matches);
        if (matches) visible++;
    });
    let empty = body.querySelector(".public-residents-no-results");
    if (query && visible === 0) {
        if (!empty) {
            empty = document.createElement("tr");
            empty.className = "public-residents-no-results";
            empty.innerHTML = '<td colspan="2" class="empty-cell">Ничего не найдено.</td>';
            body.appendChild(empty);
        }
        empty.classList.remove("hidden");
    } else if (empty) {
        empty.classList.add("hidden");
    }
}

const publicResidentsSearch = document.getElementById("publicResidentsSearch");
publicResidentsSearch?.addEventListener("input", filterPublicResidents);

/* =========================================================
   DORMITORY COUNCIL
========================================================= */
async function renderCouncilRoster() {
    const list = document.getElementById("councilRosterList");
    if (!list) return;
    list.innerHTML = '<p class="empty-cell">Загружаем состав Совета…</p>';
    const { data, error } = await supabaseClient.rpc("get_public_council_roster");
    if (error) {
        console.error("Не удалось загрузить Совет общежития:", error);
        list.innerHTML = '<p class="empty-cell">Не удалось загрузить Совет. Администратору нужно выполнить файл council_members.sql в Supabase.</p>';
        return;
    }
    const members = data || [];
    if (!members.length) {
        list.innerHTML = '<div class="council-empty"><span>✦</span><strong>Совет пока формируется</strong><p>Здесь появятся назначенные участники.</p></div>';
        return;
    }
    list.innerHTML = members.map((member, index) => `<article class="council-member-card council-tag-${index % 5}"><div class="council-member-avatar">${escapeHtml((member.full_name || "Ж").trim().charAt(0).toUpperCase())}</div><div class="council-member-details"><strong class="council-member-name">${escapeHtml(member.full_name || "Без имени")}</strong>${member.nickname ? `<span class="council-member-nickname">@${escapeHtml(member.nickname)}</span>` : ""}<span>Комната ${escapeHtml(member.room || "—")}</span></div><span class="council-member-badge">✦ ${escapeHtml(member.tag || "Совет")}</span></article>`).join("");
}

async function renderCouncilAdmin() {
    if (currentProfile?.role !== "admin") return;
    const select = document.getElementById("councilStudentSelect");
    const body = document.getElementById("councilAdminTableBody");
    if (!select || !body) return;
    const previous = select.value;
    select.innerHTML = '<option value="">Выбери пользователя</option>' + students.map(st => `<option value="${escapeHtml(st.id)}">${escapeHtml(st.full_name || st.nickname || "Без имени")} · ${st.role === "admin" ? "администратор" : `комната ${escapeHtml(st.room || "—")}`}</option>`).join("");
    if (previous) select.value = previous;
    const { data, error } = await supabaseClient.from("council_members").select("student_id, tag, created_at").order("created_at", {ascending:true});
    if (error) {
        body.innerHTML = '<tr><td colspan="3" class="empty-cell">Выполните council_members.sql в Supabase, чтобы настроить Совет.</td></tr>';
        return;
    }
    if (!data?.length) {
        body.innerHTML = '<tr><td colspan="3" class="empty-cell">Пока никого не добавили в Совет.</td></tr>';
        return;
    }
    body.innerHTML = data.map(m => {
        const st = students.find(x => x.id === m.student_id);
        return `<tr><td>${escapeHtml(st?.full_name || st?.nickname || "Жилец")}${st?.room ? ` · ${escapeHtml(st.room)}` : ""}</td><td><span class="council-member-badge">✦ ${escapeHtml(m.tag || "Совет")}</span></td><td><button type="button" class="btn btn-secondary council-remove-btn" data-council-remove="${escapeHtml(m.student_id)}">Убрать</button></td></tr>`;
    }).join("");
}

const councilMemberForm = document.getElementById("councilMemberForm");
councilMemberForm?.addEventListener("submit", async event => {
    event.preventDefault();
    if (currentProfile?.role !== "admin") return;
    const select = document.getElementById("councilStudentSelect");
    const tagInput = document.getElementById("councilMemberTag");
    const message = document.getElementById("councilAdminMessage");
    const studentId = select?.value;
    const tag = tagInput?.value.trim();
    if (!studentId || !tag) return;
    const { error } = await supabaseClient.from("council_members").upsert({student_id:studentId, tag}, {onConflict:"student_id"});
    if (error) {
        if (message) message.textContent = "Не удалось сохранить. Проверьте, что выполнен council_members.sql в Supabase.";
        console.error(error);
        return;
    }
    if (message) message.textContent = "Участник Совета сохранён.";
    tagInput.value = "";
    await loadResidentRoleMemberships();
    renderStudents();
    await Promise.all([renderCouncilAdmin(), renderCouncilRoster()]);
});

document.getElementById("councilAdminTableBody")?.addEventListener("click", async event => {
    const button = event.target.closest("[data-council-remove]");
    if (!button || currentProfile?.role !== "admin") return;
    const { error } = await supabaseClient.from("council_members").delete().eq("student_id", button.dataset.councilRemove);
    const message = document.getElementById("councilAdminMessage");
    if (error) { if (message) message.textContent = "Не удалось убрать участника Совета."; return; }
    if (message) message.textContent = "Участник удалён из Совета.";
    await loadResidentRoleMemberships();
    renderStudents();
    await Promise.all([renderCouncilAdmin(), renderCouncilRoster()]);
});


/* Представители МООП */
async function renderMoopRoster() {
    const list = document.getElementById("moopRosterList");
    if (!list) return;
    const { data, error } = await supabaseClient.rpc("get_public_moop_roster");
    if (error) { list.innerHTML = '<p class="empty-cell">Не удалось загрузить список. Администратору нужно выполнить файл moop_members.sql в Supabase.</p>'; return; }
    if (!data?.length) { list.innerHTML = '<div class="council-empty moop-empty"><span>●</span><strong>Представители МООП пока не добавлены</strong><p>Здесь появятся назначенные представители.</p></div>'; return; }
    list.innerHTML = data.map((m, i) => `<article class="council-member-card moop-member-card"><div class="council-member-avatar">${escapeHtml((m.full_name || "Ж").trim().charAt(0).toUpperCase())}</div><div class="council-member-details"><strong class="moop-member-name">${escapeHtml(m.full_name || "Без имени")}</strong>${m.nickname ? `<span class="moop-member-nickname">@${escapeHtml(m.nickname)}</span>` : ""}<span>Комната ${escapeHtml(m.room || "—")}</span></div><span class="council-member-badge moop-member-badge">● ${escapeHtml(m.tag || "МООП")}</span></article>`).join("");
}
async function renderMoopAdmin() {
    if (currentProfile?.role !== "admin") return;
    const select = document.getElementById("moopStudentSelect"), body = document.getElementById("moopAdminTableBody");
    if (!select || !body) return;
    const previous = select.value;
    select.innerHTML = '<option value="">Выбери пользователя</option>' + students.map(st => `<option value="${escapeHtml(st.id)}">${escapeHtml(st.full_name || st.nickname || "Без имени")} · ${st.role === "admin" ? "администратор" : `комната ${escapeHtml(st.room || "—")}`}</option>`).join("");
    if (previous) select.value = previous;
    const { data, error } = await supabaseClient.from("moop_members").select("student_id, tag, created_at").order("created_at", {ascending:true});
    if (error) { body.innerHTML = '<tr><td colspan="3" class="empty-cell">Выполните moop_members.sql в Supabase.</td></tr>'; return; }
    if (!data?.length) { body.innerHTML = '<tr><td colspan="3" class="empty-cell">Пока никого не добавили в МООП.</td></tr>'; return; }
    body.innerHTML = data.map(m => { const st = students.find(x => x.id === m.student_id); return `<tr><td>${escapeHtml(st?.full_name || st?.nickname || "Жилец")}${st?.room ? ` · ${escapeHtml(st.room)}` : ""}</td><td><span class="council-member-badge moop-member-badge">● ${escapeHtml(m.tag || "МООП")}</span></td><td><button type="button" class="btn btn-secondary" data-moop-remove="${escapeHtml(m.student_id)}">Убрать</button></td></tr>`; }).join("");
}
const moopMemberForm = document.getElementById("moopMemberForm");
moopMemberForm?.addEventListener("submit", async event => {
    event.preventDefault(); if (currentProfile?.role !== "admin") return;
    const studentId = document.getElementById("moopStudentSelect")?.value, tag = document.getElementById("moopMemberTag")?.value.trim(), message = document.getElementById("moopAdminMessage");
    if (!studentId || !tag) return;
    const { error } = await supabaseClient.from("moop_members").upsert({student_id:studentId, tag}, {onConflict:"student_id"});
    if (error) { if (message) message.textContent = "Не удалось сохранить. Проверьте, что выполнен moop_members.sql."; console.error(error); return; }
    if (message) message.textContent = "Представитель МООП добавлен.";
    document.getElementById("moopMemberTag").value = "";
    await loadResidentRoleMemberships();
    renderStudents();
    await Promise.all([renderMoopAdmin(), renderMoopRoster()]);
});
document.getElementById("moopAdminTableBody")?.addEventListener("click", async event => {
    const button = event.target.closest("[data-moop-remove]"); if (!button || currentProfile?.role !== "admin") return;
    const { error } = await supabaseClient.from("moop_members").delete().eq("student_id", button.dataset.moopRemove);
    const message = document.getElementById("moopAdminMessage"); if (error) { if (message) message.textContent = "Не удалось убрать представителя МООП."; return; }
    if (message) message.textContent = "Представитель удалён из МООП.";
    await loadResidentRoleMemberships();
    renderStudents();
    await Promise.all([renderMoopAdmin(), renderMoopRoster()]);
});


const rosterAllTab = document.getElementById("rosterAllTab");
const rosterCouncilTab = document.getElementById("rosterCouncilTab");
function activateRosterSubtab(tab) {
    const showAll = tab === "all";
    document.getElementById("rosterAllPane")?.classList.toggle("hidden", !showAll);
    document.getElementById("rosterCouncilPane")?.classList.toggle("hidden", showAll);
    rosterAllTab?.classList.toggle("active", showAll);
    rosterCouncilTab?.classList.toggle("active", !showAll);
    rosterAllTab?.setAttribute("aria-selected", String(showAll));
    rosterCouncilTab?.setAttribute("aria-selected", String(!showAll));
    if (!showAll) renderCouncilRoster();
}
rosterAllTab?.addEventListener("click", () => activateRosterSubtab("all"));
rosterCouncilTab?.addEventListener("click", () => activateRosterSubtab("council"));

/* =========================================================
   HISTORY TAB NAVIGATION
========================================================= */

/* =========================================================
   COLLAPSE / EXPAND RESIDENTS
========================================================= */

const residentsTab = document.getElementById("residentsTab");
const siteNotificationsTab = document.getElementById("siteNotificationsTab");
const telegramNotificationsTab = document.getElementById("telegramNotificationsTab");
const siteNotificationsPane = document.getElementById("siteNotificationsPane");
const telegramNotificationsPane = document.getElementById("telegramNotificationsPane");
function activateNotificationChannel(channel) {
    const showSite = channel === "site";
    siteNotificationsPane?.classList.toggle("hidden", !showSite);
    telegramNotificationsPane?.classList.toggle("hidden", showSite);
    siteNotificationsTab?.classList.toggle("active", showSite);
    telegramNotificationsTab?.classList.toggle("active", !showSite);
    siteNotificationsTab?.setAttribute("aria-selected", String(showSite));
    telegramNotificationsTab?.setAttribute("aria-selected", String(!showSite));
}
siteNotificationsTab?.addEventListener("click", () => activateNotificationChannel("site"));
telegramNotificationsTab?.addEventListener("click", () => activateNotificationChannel("telegram"));
// По умолчанию при каждом открытии/обновлении сайта показываем Telegram.
activateNotificationChannel("telegram");

const historyTab = document.getElementById("historyTab");
const publicResidentsTab = document.getElementById("publicResidentsTab");
const councilTab = document.getElementById("councilTab");
const moopTab = document.getElementById("moopTab");
const moopSection = document.getElementById("moopSection");
const historySection = document.getElementById("historySection");
const publicResidentsSection = document.getElementById("publicResidentsSection");
const councilSection = document.getElementById("councilSection");
const studentsSection = document.querySelector(".students-section:not(.history-section):not(.public-residents-section):not(.council-section)");

function syncDataTabsForRole() {
    const isAdmin = currentProfile?.role === "admin";
    document.querySelector(".admin-tools-launcher-card")?.classList.toggle("hidden", !isAdmin);
    publicResidentsTab?.classList.toggle("hidden", isAdmin);
    publicResidentsSection?.classList.toggle("hidden", isAdmin || !publicResidentsTab?.classList.contains("active"));
    councilSection?.classList.toggle("hidden", !councilTab?.classList.contains("active"));
    moopSection?.classList.toggle("hidden", !moopTab?.classList.contains("active"));
    const tabs = document.querySelector(".data-tabs");
    tabs?.classList.toggle("admin-data-tabs", isAdmin);
}

function activateDataTab(tab) {
    const showResidents = tab === "residents";
    const showHistory = tab === "history";
    const showPublicResidents = tab === "publicResidents" && currentProfile?.role !== "admin";
    const showCouncil = tab === "council";
    const showMoop = tab === "moop";
    if (studentsSection) studentsSection.classList.toggle("hidden", !showResidents);
    if (historySection) historySection.classList.toggle("hidden", !showHistory);
    if (publicResidentsSection) publicResidentsSection.classList.toggle("hidden", !showPublicResidents);
    if (councilSection) councilSection.classList.toggle("hidden", !showCouncil);
    if (moopSection) moopSection.classList.toggle("hidden", !showMoop);
    for (const [button, active] of [[residentsTab, showResidents], [historyTab, showHistory], [publicResidentsTab, showPublicResidents], [councilTab, showCouncil], [moopTab, showMoop]]) {
        button?.classList.toggle("active", active);
        button?.setAttribute("aria-selected", String(active));
    }
    if (showHistory) renderHistory();
    if (showPublicResidents) renderPublicResidents();
    if (showCouncil) renderCouncilRoster();
    if (showMoop) renderMoopRoster();
    syncDataTabsForRole();
}

residentsTab?.addEventListener("click", () => activateDataTab("residents"));
historyTab?.addEventListener("click", () => activateDataTab("history"));
publicResidentsTab?.addEventListener("click", () => activateDataTab("publicResidents"));
councilTab?.addEventListener("click", () => activateDataTab("council"));
moopTab?.addEventListener("click", () => activateDataTab("moop"));
syncDataTabsForRole();

const publicResidentsCollapseToggle = document.getElementById("publicResidentsCollapseToggle");
const publicResidentsCollapsibleContent = document.getElementById("publicResidentsCollapsibleContent");
const publicResidentsCollapseLabel = document.getElementById("publicResidentsCollapseLabel");
const publicResidentsCollapseIcon = document.getElementById("publicResidentsCollapseIcon");
publicResidentsCollapseToggle?.addEventListener("click", () => {
    const willCollapse = publicResidentsCollapseToggle.getAttribute("aria-expanded") !== "false";
    publicResidentsCollapsibleContent?.classList.toggle("hidden", willCollapse);
    publicResidentsCollapseToggle.setAttribute("aria-expanded", String(!willCollapse));
    if (publicResidentsCollapseLabel) publicResidentsCollapseLabel.textContent = willCollapse ? "Развернуть" : "Свернуть";
    if (publicResidentsCollapseIcon) publicResidentsCollapseIcon.textContent = willCollapse ? "▼" : "▲";
});

const historyCollapseToggle = document.getElementById("historyCollapseToggle");
const historyCollapsibleContent = document.getElementById("historyCollapsibleContent");
const historyCollapseLabel = document.getElementById("historyCollapseLabel");
const historyCollapseIcon = document.getElementById("historyCollapseIcon");
historyCollapseToggle?.addEventListener("click", () => {
    const willCollapse = historyCollapseToggle.getAttribute("aria-expanded") !== "false";
    historyCollapsibleContent?.classList.toggle("hidden", willCollapse);
    historyCollapseToggle.setAttribute("aria-expanded", String(!willCollapse));
    if (historyCollapseLabel) historyCollapseLabel.textContent = willCollapse ? "Развернуть" : "Свернуть";
    if (historyCollapseIcon) historyCollapseIcon.textContent = willCollapse ? "▼" : "▲";
});

const studentsCollapseToggle = document.getElementById("studentsCollapseToggle");

studentsCollapseToggle?.addEventListener("click", () => {
    const contentElements = [
        document.querySelector(".students-section > .section-description"),
        document.querySelector(".students-section > .table-tools"),
        document.querySelector(".students-section > .table-wrapper")
    ].filter(Boolean);

    const shouldCollapse = studentsCollapseToggle.getAttribute("aria-expanded") !== "false";
    contentElements.forEach(element => element.classList.toggle("hidden", shouldCollapse));
    studentsCollapseToggle.setAttribute("aria-expanded", String(!shouldCollapse));
    studentsCollapseToggle.textContent = shouldCollapse ? "Развернуть ▼" : "Свернуть ▲";
});


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
        // Администратору показываем, какие именно жильцы забронировали задание.
        const bookedResidents = isAdmin && Array.isArray(task.bookings)
            ? task.bookings.map(booking => {
                const resident = students.find(student => String(student.id) === String(booking.resident_id));
                if (!resident) return `Жилец (ID: ${String(booking.resident_id).slice(0, 8)}…)`;
                const room = resident.room ? ` · комната ${resident.room}` : "";
                return `${resident.full_name || resident.nickname || "Жилец"}${room}`;
            })
            : [];
        const bookedResidentsMarkup = isAdmin && bookedResidents.length
            ? `<div class="task-booked-residents"><strong>Кто забронировал:</strong><ul>${bookedResidents.map(name => `<li>${escapeHtml(name)}</li>`).join("")}</ul></div>`
            : (isAdmin ? '<div class="task-booked-residents task-booked-residents-empty">Пока никто не забронировал</div>' : "");
        return `<article class="resident-task-item"><div class="resident-task-info"><div class="resident-task-title">${escapeHtml(task.title)}</div><div>${escapeHtml(task.details || "")}</div><div class="resident-task-meta"><span>⏱ ${escapeHtml(formatHours(task.hours))} ч. каждому</span><span>📅 ${escapeHtml(dueText)}</span><span>👥 ${bookedCount}/${capacity}</span><span class="task-status ${isFull ? 'booked' : ''}">${statusText}</span></div>${bookedResidentsMarkup}</div><div class="task-actions">${action}</div></article>`;
    }).join("");
}

// Публикация события: серверная RPC проверяет роль администратора,
// создаёт уведомления на сайте и ставит Telegram-сообщения в очередь.
const publishEventForm = document.getElementById("publishEventForm");
const publishEventMessage = document.getElementById("publishEventMessage");
if (publishEventForm) {
    publishEventForm.addEventListener("submit", async event => {
        event.preventDefault();
        clearMessage(publishEventMessage);
        if (currentProfile?.role !== "admin") {
            showMessage(publishEventMessage, "Публиковать события может только администратор.", "error");
            return;
        }
        const title = document.getElementById("eventTitle").value.trim();
        const date = document.getElementById("eventDate").value;
        const time = document.getElementById("eventTime").value;
        const details = document.getElementById("eventDetails").value.trim();
        if (!title || !date || !time) {
            showMessage(publishEventMessage, "Укажи название, дату и время события.", "error");
            return;
        }
        const startsAt = new Date(`${date}T${time}:00`).toISOString();
        const button = publishEventForm.querySelector("button[type='submit']");
        const originalLabel = button.textContent;
        button.disabled = true;
        button.textContent = "Публикуем…";
        try {
            const { data, error } = await supabaseClient.rpc("publish_dorm_event", {
                p_title: title,
                p_details: details,
                p_event_at: startsAt
            });
            if (error) throw error;
            const result = Array.isArray(data) ? data[0] : data;
            const siteCount = Number(result?.site_notifications ?? result?.site_count ?? 0);
            const telegramCount = Number(result?.telegram_notifications ?? result?.telegram_count ?? 0);
            showMessage(publishEventMessage,
                `Событие опубликовано. Уведомления на сайте: ${siteCount}. Сообщения поставлены в очередь Telegram: ${telegramCount}.`,
                "success");
            publishEventForm.reset();
            document.getElementById("eventTime").value = "19:00";
            await loadNotifications();
            renderNotifications();
        } catch (error) {
            console.error("Не удалось опубликовать событие:", error);
            showMessage(publishEventMessage,
                error.message || "Не удалось опубликовать событие. Проверь, что выполнен SQL-файл event_announcements.sql.",
                "error");
        } finally {
            button.disabled = false;
            button.textContent = originalLabel;
        }
    });
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


        // INITIAL_SESSION обрабатывается функцией init(), чтобы гостевой экран
        // не мелькал до восстановления сохранённой сессии.
        if (event === "INITIAL_SESSION" && !authInitializationFinished) {
            return;
        }

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

    try {
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) throw error;

        if (data?.session?.user) {
            currentUser = data.session.user;
            await loadProfile();
        } else {
            showLoggedOut();
        }
    } catch (error) {
        console.error("Ошибка восстановления сессии:", error);
        showLoggedOut();
    } finally {
        authInitializationFinished = true;
        document.documentElement.classList.remove("auth-pending");
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
     if(nicknameChanges >= 2) throw new Error("Логин можно менять только 2 раза.");
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
        if (pendingTap) clearTimeout(pendingTap.timer);
        pendingTap = null;
        clearTimeout(longPressTimer);
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
        if (pendingTap) clearTimeout(pendingTap.timer);
        pendingTap = null;
        clearTimeout(longPressTimer);
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
    // Reuse existing cell buttons: updating one move must not rebuild the whole board.
    let cellButtons = [];
    let pendingTap = null;
    let lastTouchCell = -1;
    let lastTouchTime = 0;
    let suppressClickUntil = 0;
    let longPressTimer = null;
    let longPressTriggered = false;

    function render(showAllMines = false) {
        boardElement.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
        boardElement.style.minWidth = "0";
        flagsElement.textContent = `${flags} / ${mineCount}`;
        const needsRebuild = cellButtons.length !== cells.length;
        if (needsRebuild) {
            boardElement.replaceChildren();
            cellButtons = cells.map((cell, i) => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "mine-cell";
                button.setAttribute("aria-label", `Клетка ${Math.floor(i / cols) + 1}, ${i % cols + 1}`);
                button.dataset.index = String(i);
                button.addEventListener("click", event => handleCellClick(i, event));
                button.addEventListener("contextmenu", event => { event.preventDefault(); toggleFlag(i); });
                // Long press is an additional mobile option; double tap is supported too.
                button.addEventListener("pointerdown", event => {
                    if (event.pointerType !== "touch") return;
                    longPressTriggered = false;
                    clearTimeout(longPressTimer);
                    longPressTimer = setTimeout(() => {
                        longPressTriggered = true;
                        suppressClickUntil = Date.now() + 700;
                        toggleFlag(i);
                    }, 500);
                }, { passive: true });
                const stopLongPress = () => clearTimeout(longPressTimer);
                button.addEventListener("pointerup", stopLongPress, { passive: true });
                button.addEventListener("pointercancel", stopLongPress, { passive: true });
                button.addEventListener("pointerleave", stopLongPress, { passive: true });
                boardElement.appendChild(button);
                return button;
            });
        }
        for (let i = 0; i < cells.length; i++) updateCell(i, showAllMines);
    }

    function updateCell(index, showAllMines = false) {
        const button = cellButtons[index];
        if (!button) return;
        const cell = cells[index];
        button.className = "mine-cell";
        button.textContent = "";
        button.style.color = "";
        if (cell.flagged && !cell.revealed) {
            button.textContent = "🚩";
            button.classList.add("flagged");
        } else if (cell.revealed || (showAllMines && cell.mine)) {
            button.classList.add("revealed");
            if (cell.mine) {
                button.textContent = "💣";
                if (cell.revealed) button.classList.add("mine-hit");
            } else if (cell.count) {
                button.textContent = cell.count;
                button.style.color = ["", "#2563eb", "#15803d", "#dc2626", "#6d28d9", "#b45309", "#0e7490", "#111827", "#475569"][cell.count];
            }
        }
        button.disabled = gameOver || cell.revealed;
        button.setAttribute("aria-label", `Клетка ${Math.floor(index / cols) + 1}, ${index % cols + 1}${cell.flagged ? ", флажок" : cell.revealed ? ", открыта" : ""}`);
    }

    function handleCellClick(index, event) {
        if (Date.now() < suppressClickUntil || longPressTriggered) {
            longPressTriggered = false;
            return;
        }
        // Mouse clicks reveal immediately. Touch taps wait briefly so a second tap can flag.
        if (event.detail === 0 || !('ontouchstart' in window && event.pointerType !== "mouse")) {
            reveal(index);
            return;
        }
        const now = Date.now();
        if (pendingTap && pendingTap.index === index && now - pendingTap.time < 320) {
            clearTimeout(pendingTap.timer);
            pendingTap = null;
            lastTouchCell = -1;
            lastTouchTime = 0;
            suppressClickUntil = now + 450;
            toggleFlag(index);
            return;
        }
        if (pendingTap) {
            clearTimeout(pendingTap.timer);
            reveal(pendingTap.index);
        }
        const timer = setTimeout(() => {
            if (pendingTap && pendingTap.index === index) {
                pendingTap = null;
                reveal(index);
            }
        }, 300);
        pendingTap = { index, time: now, timer };
        lastTouchCell = index;
        lastTouchTime = now;
    }
    function reveal(index) {
        if (gameOver || cells[index].revealed || cells[index].flagged) return;
        if (cells[index].mine) {
            cells[index].revealed = true;
            gameOver = true;
            statusElement.textContent = "Бум! Попробуй ещё раз.";
            cells.forEach((cell, i) => updateCell(i, true));
            return;
        }
        const stack = [index];
        const changed = new Set();
        while (stack.length) {
            const current = stack.pop(), cell = cells[current];
            if (cell.revealed || cell.flagged || cell.mine) continue;
            cell.revealed = true;
            changed.add(current);
            if (cell.count === 0) neighbors(current).forEach(n => {
                if (!cells[n].revealed && !cells[n].flagged && !cells[n].mine) stack.push(n);
            });
        }
        if (cells.every(cell => cell.mine || cell.revealed)) {
            gameOver = true;
            statusElement.textContent = "Победа! Все безопасные клетки открыты 🎉";
        }
        changed.forEach(i => updateCell(i));
    }

    function toggleFlag(index) {
        if (gameOver || !cells[index] || cells[index].revealed) return;
        if (!cells[index].flagged && flags >= mineCount) return;
        cells[index].flagged = !cells[index].flagged;
        flags += cells[index].flagged ? 1 : -1;
        flagsElement.textContent = `${flags} / ${mineCount}`;
        updateCell(index);
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


/* Mobile resident panel switcher: three buttons */
(function setupResidentMobileNav(){
  const nav = document.getElementById("residentMobileNav");
  const workspace = document.querySelector(".resident-workspace");
  const options = document.getElementById("residentMobileNavOptions");
  if (!nav || !workspace || !options) return;
  const extrasPanel = document.getElementById("residentExtrasPanel");
  const notifications = workspace.querySelector(".notifications-card");
  const tasks = workspace.querySelector(".tasks-card");
  const achievementsLauncher = workspace.querySelector(".achievements-launcher-card");
  const panels = [notifications, tasks, achievementsLauncher].filter(Boolean);

  function showView(view) {
    workspace.dataset.mobileView = view;
    panels.forEach(panel => {
      panel.classList.remove("hidden");
      panel.style.removeProperty("display");
    });
    if (view === "notifications") {
      if (tasks) { tasks.classList.add("hidden"); tasks.style.setProperty("display", "none", "important"); }
      if (achievementsLauncher) { achievementsLauncher.classList.add("hidden"); achievementsLauncher.style.setProperty("display", "none", "important"); }
      extrasPanel?.classList.add("hidden");
    } else if (view === "tasks") {
      if (notifications) { notifications.classList.add("hidden"); notifications.style.setProperty("display", "none", "important"); }
      if (achievementsLauncher) { achievementsLauncher.classList.add("hidden"); achievementsLauncher.style.setProperty("display", "none", "important"); }
      extrasPanel?.classList.add("hidden");
    } else {
      panels.forEach(panel => { panel.classList.add("hidden"); panel.style.setProperty("display", "none", "important"); });
      if (currentProfile?.role !== "admin" && extrasPanel) {
        extrasPanel.classList.remove("hidden");
        extrasPanel.classList.add("is-centered-modal");
        document.body.classList.add("resident-extras-modal-open");
        document.getElementById("achievementsTab")?.click();
      } else if (achievementsLauncher) {
        achievementsLauncher.classList.remove("hidden");
        achievementsLauncher.style.removeProperty("display");
      }
    }
    nav.querySelectorAll("[data-mobile-view]").forEach(btn => {
      const active = btn.dataset.mobileView === view;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }
  nav.addEventListener("click", event => {
    const button = event.target.closest("[data-mobile-view]");
    if (!button) return;
    event.preventDefault();
    showView(button.dataset.mobileView);
    if (button.dataset.mobileView === "notifications") notifications?.scrollIntoView({behavior:"smooth", block:"start"});
    else if (button.dataset.mobileView === "tasks") tasks?.scrollIntoView({behavior:"smooth", block:"start"});
    // Achievements open as a centered modal; do not scroll the page to the inline panel.
  });
  workspace.dataset.mobileView = "notifications";
  // Telegram tab is the default channel on every load.
  document.getElementById("telegramNotificationsTab")?.classList.add("active");
  document.getElementById("telegramNotificationsTab")?.setAttribute("aria-selected", "true");
  document.getElementById("siteNotificationsTab")?.classList.remove("active");
  document.getElementById("siteNotificationsTab")?.setAttribute("aria-selected", "false");
  document.getElementById("telegramNotificationsPane")?.classList.remove("hidden");
  document.getElementById("siteNotificationsPane")?.classList.add("hidden");
})();

/* Student achievements / bonuses panel */
(function setupResidentExtrasPanel(){
  const openBtn=document.getElementById("openResidentExtras");
  const closeBtn=document.getElementById("closeResidentExtras");
  const panel=document.getElementById("residentExtrasPanel");
  const achievementsTab=document.getElementById("achievementsTab");
  const bonusesTab=document.getElementById("bonusesTab");
  const achievementsPane=document.getElementById("achievementsPane");
  const bonusesPane=document.getElementById("bonusesPane");
  function showPane(which){const ach=which==="achievements"; achievementsPane?.classList.toggle("hidden",!ach); bonusesPane?.classList.toggle("hidden",ach); achievementsTab?.classList.toggle("active",ach); bonusesTab?.classList.toggle("active",!ach); achievementsTab?.setAttribute("aria-selected",String(ach)); bonusesTab?.setAttribute("aria-selected",String(!ach));}
  function openPanel(which="achievements") {
    if (currentProfile?.role === "admin" || !panel) return;
    panel.classList.remove("hidden");
    panel.classList.add("is-centered-modal");
    document.body.classList.add("resident-extras-modal-open");
    showPane(which);
  }
  function closePanel() {
    panel?.classList.add("hidden");
    panel?.classList.remove("is-centered-modal");
    document.body.classList.remove("resident-extras-modal-open");
  }
  openBtn?.addEventListener("click",()=>openPanel("achievements"));
  closeBtn?.addEventListener("click",closePanel);
  achievementsTab?.addEventListener("click",()=>showPane("achievements"));
  bonusesTab?.addEventListener("click",()=>showPane("bonuses"));
  document.addEventListener("keydown", event => { if (event.key === "Escape" && panel && !panel.classList.contains("hidden")) closePanel(); });
})();


/* Centered, tabbed admin tools modal. Existing form nodes are moved (not cloned),
   so all existing form handlers and database behavior remain intact. */
(function setupAdminToolsModal(){
  const modal = document.getElementById('adminToolsModal');
  const openBtn = document.getElementById('openAdminTools');
  const closeBtn = document.getElementById('closeAdminTools');
  if (!modal || !openBtn) return;

  const cardFor = id => document.getElementById(id)?.closest('.admin-card');
  const targets = {
    residents: cardFor('addStudentForm'),
    assign: cardFor('assignHoursForm'),
    complete: cardFor('completeHoursForm'),
    council: cardFor('councilMemberForm'),
    moop: cardFor('moopMemberForm'),
    publish: cardFor('publishTaskForm'),
    immunity: cardFor('immunityForm')
  };
  const panes = Object.fromEntries([...modal.querySelectorAll('[data-admin-tool-pane]')].map(el => [el.dataset.adminToolPane, el]));
  Object.entries(targets).forEach(([key, card]) => {
    if (card && panes[key]) {
      panes[key].appendChild(card);
      card.classList.add('admin-tools-modal-card');
    }
  });

  function showTab(key){
    modal.querySelectorAll('[data-admin-tool-tab]').forEach(btn => {
      const active = btn.dataset.adminToolTab === key;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    modal.querySelectorAll('[data-admin-tool-pane]').forEach(pane => pane.classList.toggle('hidden', pane.dataset.adminToolPane !== key));
  }
  function open(){
    if (currentProfile && currentProfile.role !== 'admin') return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('admin-tools-modal-open');
    showTab('residents');
    closeBtn?.focus({preventScroll:true});
  }
  function close(){
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('admin-tools-modal-open');
    openBtn.focus({preventScroll:true});
  }
  openBtn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  modal.querySelectorAll('[data-close-admin-tools]').forEach(el => el.addEventListener('click', close));
  modal.querySelectorAll('[data-admin-tool-tab]').forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.adminToolTab)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) close();
  });
})();


/* FINAL FIX - COUNCIL/MOOP TAG FALLBACK */
function getMemberTag(member) {
    return member?.tag || member?.position || member?.title || member?.role_name || "";
}
