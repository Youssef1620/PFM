// ==========================================
// 1. المتغيرات الأساسية وجلب عناصر الـ DOM
// ==========================================
const sideBarShow = document.getElementById('side-icon');
const userName = document.getElementById('user');
const editBtn = document.getElementById('edit-user');
const sideSections = document.querySelectorAll('.side-section');
const allContentSections = document.querySelectorAll('.content-sec');

const addForm = document.getElementById('add-form');
const expTitle = document.getElementById('exp-title');
const expAmount = document.getElementById('exp-amount');
const expCategory = document.getElementById('exp-category');
const todayTotal = document.getElementById('today-total');
const todayList = document.getElementById('today-list');
const clearAllBtn = document.getElementById('clear-all-btn');

const monthTotalEl = document.getElementById('month-total');
const topCategoryEl = document.getElementById('top-category');
const budgetBar = document.getElementById('budget-bar');
const dynamicBudgetLimitEl = document.getElementById('dynamic-budget-limit');

// خطط الشراء
const planTitle = document.getElementById('plan-title');
const planPrice = document.getElementById('plan-price');
const addPlanForm = document.getElementById('add-plan-form');
const plansList = document.getElementById('plans-list');

// المستشار المالي
const plannerIncomeInput = document.getElementById('planner-income');
const updatePlannerBtn = document.getElementById('update-planner-btn');
const plannerDisplayIncome = document.getElementById('planner-display-income');
const recSpend = document.getElementById('rec-spend');
const recSave = document.getElementById('rec-save');
const recInvest = document.getElementById('rec-invest');

const customSaveRange = document.getElementById('custom-save-range');
const customSavePercent = document.getElementById('custom-save-percent');
const customSaveAmount = document.getElementById('custom-save-amount');
const customSpendAmount = document.getElementById('custom-spend-amount');

// الحصالة والمدخرات
const addSavingForm = document.getElementById('add-saving-form');
const saveAmountInput = document.getElementById('save-amount');
const saveNoteInput = document.getElementById('save-note');
const monthSavedTotal = document.getElementById('month-saved-total');
const monthSavingsList = document.getElementById('month-savings-list');
const yearSavedTotal = document.getElementById('year-saved-total');
const yearSavingsList = document.getElementById('year-savings-list');
const allTimeSaved = document.getElementById('all-time-saved');

const displayAnnualIncome = document.getElementById('display-annual-income');
const annualSaveForm = document.getElementById('annual-save-form');
const annualSaveTargetInput = document.getElementById('annual-save-target');
const reqMonthlySave = document.getElementById('req-monthly-save');
const reqWeeklySave = document.getElementById('req-weekly-save');

const allTimeTotalEl = document.getElementById('all-time-total');
const allTimeCountEl = document.getElementById('all-time-count');
const allExpensesList = document.getElementById('all-expenses-list');
const clearAllTimeBtn = document.getElementById('clear-all-time-btn');
const searchExpenses = document.getElementById('search-expenses');

// ==========================================
// 2. LocalStorage (حفظ نسبة التحويش والدخل)
// ==========================================
let expenses = JSON.parse(localStorage.getItem('my_expenses')) || [];
let budgetData = JSON.parse(localStorage.getItem('my_budget_data')) || {};
if (typeof budgetData.income === 'undefined') budgetData.income = 0;
if (typeof budgetData.savePercent === 'undefined') budgetData.savePercent = 20;

let buyPlans = JSON.parse(localStorage.getItem('my_buy_plans')) || [];
let savingsData = JSON.parse(localStorage.getItem('my_savings_data')) || { annual: 0 };
let savingsLog = JSON.parse(localStorage.getItem('my_savings_log')) || [];

// ==========================================
// 3. Chart.js
// ==========================================
Chart.defaults.color = '#fff';

const ctxWeek = document.getElementById('weeklyChart').getContext('2d');
let weeklyChart = new Chart(ctxWeek, {
    type: 'doughnut',
    data: {
        labels: ['أكل وشرب', 'مواصلات', 'ترفيه', 'مشتريات', 'أخرى'],
        datasets: [{ data: [0, 0, 0, 0, 0], backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#64748b'], borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
});

const ctxMonth = document.getElementById('monthlyChart').getContext('2d');
let monthlyChart = new Chart(ctxMonth, {
    type: 'bar',
    data: {
        labels: ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع'],
        datasets: [{ label: 'مصروفات', data: [0, 0, 0, 0], backgroundColor: '#117c43', borderRadius: 6 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
});

const ctxPlanner = document.getElementById('plannerChart').getContext('2d');
let plannerChart = new Chart(ctxPlanner, {
    type: 'doughnut',
    data: {
        labels: ['مصروفات مخططة', 'تحويش'],
        datasets: [{ data: [80, 20], backgroundColor: ['#ef4444', '#10b981'], borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
});

// ==========================================
// 4. الدوال الرئيسية
// ==========================================
function renderAllExpenses(searchTerm = '') {
    if (!allExpensesList) return;
    allExpensesList.innerHTML = '';
    let total = 0, count = 0;
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedExpenses.forEach((item) => {
        const originalIndex = expenses.indexOf(item);
        const searchLower = searchTerm.toLowerCase();
        if (searchTerm && !item.title.toLowerCase().includes(searchLower) && !item.category.toLowerCase().includes(searchLower)) return;

        total += item.amount; count++;
        const dateString = new Date(item.date || new Date()).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });

        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:5px;">
                <strong style="font-size: 1.1rem;">${item.title}</strong> 
                <small style="color:#aaa;">${item.category} | ${dateString}</small>
            </div>
            <div style="display:flex; align-items:center; gap:15px;">
                <span style="color:var(--accent); font-weight:bold; font-size:1.2rem;">${item.amount} ج</span>
                <button onclick="deleteItem(${originalIndex})" class="del-item">✕</button>
            </div>
        `;
        allExpensesList.appendChild(li);
    });
    if (allTimeTotalEl) allTimeTotalEl.textContent = total;
    if (allTimeCountEl) allTimeCountEl.textContent = count;
}

function updatePlannerChart(savePercent, totalIncome) {
    const saveAmt = (totalIncome * (savePercent / 100)).toFixed(1);
    const spendAmt = (totalIncome - saveAmt).toFixed(1);

    if (customSavePercent) customSavePercent.textContent = savePercent + '%';
    if (customSaveAmount) customSaveAmount.textContent = saveAmt;
    if (customSpendAmount) customSpendAmount.textContent = spendAmt;

    if (plannerChart) {
        plannerChart.data.datasets[0].data = [spendAmt, saveAmt];
        plannerChart.update();
    }
}

function updateUI() {
    const currentIncome = budgetData.income || 0;
    const savePercent = budgetData.savePercent || 20;
    const spendLimit = currentIncome * ((100 - savePercent) / 100);
    
    // تحديث الحد الأقصى في سكشن 112
    if(dynamicBudgetLimitEl) dynamicBudgetLimitEl.textContent = spendLimit.toFixed(0);

    // تحديث المستشار المالي
    if(plannerDisplayIncome) plannerDisplayIncome.textContent = currentIncome;
    if(plannerIncomeInput && !plannerIncomeInput.value) plannerIncomeInput.value = currentIncome;
    if(customSaveRange) customSaveRange.value = savePercent;
    
    if(recSpend) recSpend.textContent = (currentIncome * 0.8).toFixed(1);
    if(recSave) recSave.textContent = (currentIncome * 0.2).toFixed(1);
    if(recInvest) recInvest.textContent = (currentIncome * 0.1).toFixed(1);

    updatePlannerChart(savePercent, currentIncome);

    const annualIncome = currentIncome * 12;
    if(displayAnnualIncome) displayAnnualIncome.textContent = annualIncome;
    if(reqMonthlySave) reqMonthlySave.textContent = (savingsData.annual / 12).toFixed(1);
    if(reqWeeklySave) reqWeeklySave.textContent = (savingsData.annual / 52).toFixed(1);
    if(annualSaveTargetInput && savingsData.annual > 0 && !annualSaveTargetInput.value) {
        annualSaveTargetInput.value = savingsData.annual;
    }

    todayList.innerHTML = '';
    const now = new Date(), currentMonth = now.getMonth(), currentYear = now.getFullYear();
    const dayOfWeek = now.getDay(), diffToSaturday = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - diffToSaturday); startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6); endOfWeek.setHours(23, 59, 59, 999);

    let weekTotal = 0, monthTotal = 0;
    let catTotalsWeek = { 'أكل وشرب': 0, 'مواصلات': 0, 'ترفيه': 0, 'مشتريات': 0, 'أخرى': 0 };
    let catTotalsMonth = {}, monthWeekTotals = { '1': 0, '2': 0, '3': 0, '4': 0 };

    expenses.forEach((item, index) => {
        const expDate = new Date(item.date || new Date().toISOString()), expDayOfMonth = expDate.getDate();

        if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
            monthTotal += item.amount;
            if (!catTotalsMonth[item.category]) catTotalsMonth[item.category] = 0;
            catTotalsMonth[item.category] += item.amount;
            if (expDayOfMonth <= 7) monthWeekTotals['1'] += item.amount;
            else if (expDayOfMonth <= 14) monthWeekTotals['2'] += item.amount;
            else if (expDayOfMonth <= 21) monthWeekTotals['3'] += item.amount;
            else monthWeekTotals['4'] += item.amount;
        }

        if (expDate >= startOfWeek && expDate <= endOfWeek) {
            weekTotal += item.amount;
            if (catTotalsWeek[item.category] !== undefined) catTotalsWeek[item.category] += item.amount;
            const li = document.createElement('li');
            li.innerHTML = `
                <div><strong>${item.title}</strong> <small style="color:#aaa;">(${item.category})</small></div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="color:#117c43; font-weight:bold;">${item.amount} ج</span>
                    <button onclick="deleteItem(${index})" class="del-item">✕</button>
                </div>
            `;
            todayList.appendChild(li);
        }
    });

    todayTotal.textContent = weekTotal;
    if(monthTotalEl) monthTotalEl.textContent = monthTotal;

    let maxCat = 'لا يوجد', maxVal = 0;
    for (let cat in catTotalsMonth) { if (catTotalsMonth[cat] > maxVal) { maxVal = catTotalsMonth[cat]; maxCat = cat; } }
    if(topCategoryEl) topCategoryEl.textContent = maxCat;

    // تحديث شريط الميزانية بناءً على الحد الأقصى الديناميكي
    if(budgetBar) {
        let budgetPercent = spendLimit > 0 ? (monthTotal / spendLimit) * 100 : (monthTotal > 0 ? 100 : 0);
        budgetBar.style.width = Math.min(budgetPercent, 100) + '%';
        budgetBar.style.backgroundColor = budgetPercent > 85 ? '#ef4444' : '#117c43';
    }

    weeklyChart.data.datasets[0].data = [catTotalsWeek['أكل وشرب'], catTotalsWeek['مواصلات'], catTotalsWeek['ترفيه'], catTotalsWeek['مشتريات'], catTotalsWeek['أخرى']];
    weeklyChart.update();
    monthlyChart.data.datasets[0].data = [monthWeekTotals['1'], monthWeekTotals['2'], monthWeekTotals['3'], monthWeekTotals['4']];
    monthlyChart.update();

    localStorage.setItem('my_expenses', JSON.stringify(expenses));

    if(plansList) {
        plansList.innerHTML = '';
        buyPlans.forEach((plan, index) => {
            let saved = plan.savedAmount || 0, remaining = plan.price - saved;
            let progressPercent = Math.min(100, (saved / plan.price) * 100);
            let statusText = remaining <= 0 
                ? '<span style="color:#10b981; font-size:0.85rem; font-weight:bold;">(تقدر تشتريها دلوقتي!)</span>' 
                : `<span style="color:#f59e0b; font-size:0.85rem;">(متبقي ${remaining} ج)</span>`;

            const li = document.createElement('li');
            li.style.flexDirection = 'column'; li.style.alignItems = 'flex-start';
            li.innerHTML = `
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                    <div>
                        <strong style="font-size: 1.1rem;">${plan.title}</strong>
                        <div style="color:var(--text-muted); font-size:0.9rem; margin-top:5px;">
                            السعر: ${plan.price} ج | مجمع: <span style="color:#10b981; font-weight:bold;">${saved} ج</span> <br> ${statusText}
                        </div>
                    </div>
                    <button onclick="deletePlan(${index})" class="del-item">✕</button>
                </div>
                <div style="display:flex; gap:10px; margin-top:15px; width:100%; flex-wrap: wrap;">
                    <input type="number" id="add-fund-${index}" placeholder="ضيف مبلغ هنا" style="background: var(--bg-input); border: 1px solid #555; color: white; padding: 8px; border-radius: 8px; flex: 1; min-width: 120px;">
                    <button onclick="addFundToPlan(${index})" class="btn" style="background-color: var(--accent); padding: 8px 15px;">حط في الخطة</button>
                </div>
                <div style="background-color: var(--bg-dark); border-radius: 10px; height: 10px; width: 100%; overflow: hidden; margin-top: 15px;">
                    <div style="width: ${progressPercent}%; background-color: ${remaining <= 0 ? '#10b981' : '#3b82f6'}; height: 100%; transition: width 0.5s ease-in-out;"></div>
                </div>
            `;
            plansList.appendChild(li);
        });
    }

    let mSavedTotal = 0, ySavedTotal = 0, allSavedTotal = 0;
    if(monthSavingsList) monthSavingsList.innerHTML = '';
    if(yearSavingsList) yearSavingsList.innerHTML = '';

    const sortedSavings = [...savingsLog].map((item, originalIndex) => ({item, originalIndex})).sort((a, b) => new Date(b.item.date) - new Date(a.item.date));

    sortedSavings.forEach(({item, originalIndex}) => {
        const itemDate = new Date(item.date);
        allSavedTotal += item.amount;
        const dateStr = itemDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
        
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:5px;">
                <strong style="font-size: 1.1rem;">${item.note || 'إيداع في الحصالة'}</strong>
                <small style="color:#aaa;">${dateStr}</small>
            </div>
            <div style="display:flex; align-items:center; gap:15px;">
                <span style="color:#10b981; font-weight:bold; font-size:1.2rem;">${item.amount} ج</span>
                <button onclick="deleteSaving(${originalIndex})" class="del-item">✕</button>
            </div>
        `;

        if (itemDate.getFullYear() === currentYear) {
            ySavedTotal += item.amount;
            if(yearSavingsList) yearSavingsList.appendChild(li.cloneNode(true));
            if (itemDate.getMonth() === currentMonth) {
                mSavedTotal += item.amount;
                if(monthSavingsList) monthSavingsList.appendChild(li.cloneNode(true));
            }
        }
    });

    if (monthSavedTotal) monthSavedTotal.textContent = mSavedTotal;
    if (yearSavedTotal) yearSavedTotal.textContent = ySavedTotal;
    if (allTimeSaved) allTimeSaved.textContent = allSavedTotal;

    renderAllExpenses(searchExpenses ? searchExpenses.value : '');
}

// ==========================================
// 5. أحداث التفاعل الحي (Live Updates)
// ==========================================

// التحديث اللحظي عند إدخال رقم الدخل بدون ضغط أزرار
if (plannerIncomeInput) {
    plannerIncomeInput.addEventListener('input', (e) => {
        const tempIncome = parseFloat(e.target.value) || 0;
        const tempSavePercent = customSaveRange ? parseFloat(customSaveRange.value) : 20;
        updatePlannerChart(tempSavePercent, tempIncome);
    });
}

// التحديث اللحظي عند سحب شريط التحويش وتأثيره المباشر على الحد الأقصى للمصاريف (سكشن 112)
if (customSaveRange) {
    customSaveRange.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        const inc = budgetData.income || 0;
        const spendLimit = inc * ((100 - val) / 100);
        
        // 1. تحديث شكل المخطط والنصوص فوراً
        updatePlannerChart(val, inc);
        
        // 2. تحديث الحد الأقصى في سكشن 112 فوراً
        if (dynamicBudgetLimitEl) dynamicBudgetLimitEl.textContent = spendLimit.toFixed(0);
        
        // 3. تحديث شريط الميزانية (البار) فوراً
        const monthTotal = parseFloat(monthTotalEl.textContent) || 0;
        if(budgetBar) {
            let budgetPercent = spendLimit > 0 ? (monthTotal / spendLimit) * 100 : (monthTotal > 0 ? 100 : 0);
            budgetBar.style.width = Math.min(budgetPercent, 100) + '%';
            budgetBar.style.backgroundColor = budgetPercent > 85 ? '#ef4444' : '#117c43';
        }
    });

    // حفظ التعديل النهائي للشريط في قاعدة البيانات
    customSaveRange.addEventListener('change', (e) => {
        budgetData.savePercent = parseFloat(e.target.value);
        localStorage.setItem('my_budget_data', JSON.stringify(budgetData));
        updateUI(); 
    });
}

if (updatePlannerBtn) {
    updatePlannerBtn.addEventListener('click', () => {
        budgetData.income = parseFloat(plannerIncomeInput.value) || 0;
        localStorage.setItem('my_budget_data', JSON.stringify(budgetData));
        updateUI(); // تأكيد الحفظ وتحديث كامل للواجهة
        updatePlannerBtn.textContent = 'تم الحفظ ✔';
        updatePlannerBtn.style.backgroundColor = '#10b981';
        setTimeout(() => { updatePlannerBtn.textContent = 'حفظ التحديث'; updatePlannerBtn.style.backgroundColor = '#3b82f6'; }, 2000);
    });
}

// ==========================================
// 6. أحداث الحذف والإضافة (Events)
// ==========================================
function deleteItem(index) { expenses.splice(index, 1); updateUI(); }
function deletePlan(index) { buyPlans.splice(index, 1); localStorage.setItem('my_buy_plans', JSON.stringify(buyPlans)); updateUI(); }
window.deleteSaving = function(index) { savingsLog.splice(index, 1); localStorage.setItem('my_savings_log', JSON.stringify(savingsLog)); updateUI(); };

window.addFundToPlan = function(index) {
    const fundInput = document.getElementById(`add-fund-${index}`);
    const amount = parseFloat(fundInput.value);
    if(amount > 0) {
        if(!buyPlans[index].savedAmount) buyPlans[index].savedAmount = 0;
        buyPlans[index].savedAmount += amount;
        localStorage.setItem('my_buy_plans', JSON.stringify(buyPlans));
        updateUI();
    }
};

if(addSavingForm) {
    addSavingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(saveAmountInput.value);
        const note = saveNoteInput.value.trim();
        if(amount > 0) {
            savingsLog.push({ amount, note, date: new Date().toISOString() });
            localStorage.setItem('my_savings_log', JSON.stringify(savingsLog));
            saveAmountInput.value = ''; saveNoteInput.value = ''; updateUI();
        }
    });
}

function loadUserName() { const savedName = localStorage.getItem('myfi_username'); if (savedName) userName.textContent = savedName; }
function editUserName() {
    const currentName = userName.textContent;
    const input = document.createElement('input');
    input.type = 'text'; input.value = currentName; input.className = 'username-input';
    userName.replaceWith(input); input.focus();
    function saveName() {
        const newName = input.value.trim();
        if (newName !== '') { userName.textContent = newName; localStorage.setItem('myfi_username', newName); } 
        else { userName.textContent = currentName; }
        input.replaceWith(userName);
    }
    input.addEventListener('blur', saveName);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveName(); });
}

editBtn.addEventListener('click', editUserName);
document.addEventListener('DOMContentLoaded', loadUserName);

sideSections.forEach(section => {
    section.addEventListener('click', () => {
        sideSections.forEach(sec => sec.classList.remove('active')); section.classList.add('active');
        allContentSections.forEach(content => content.classList.remove('active'));
        const targetId = section.getAttribute('data-target');
        if (targetId) { const targetContent = document.getElementById(targetId); if(targetContent) targetContent.classList.add('active'); }
    });
});

clearAllBtn.addEventListener('click', () => {
    if(confirm('هل أنت متأكد من مسح جميع بيانات الأسبوع الحالي؟')) {
        const now = new Date(), startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (now.getDay() === 6 ? 0 : now.getDay() + 1)); startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6); endOfWeek.setHours(23, 59, 59, 999);
        expenses = expenses.filter(item => { const d = new Date(item.date || new Date().toISOString()); return !(d >= startOfWeek && d <= endOfWeek); });
        updateUI();
    }
});

addForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const title = expTitle.value.trim(), amount = parseFloat(expAmount.value), category = expCategory.value;
    if (title !== '' && amount > 0) {
        expenses.push({ title, amount, category, date: new Date().toISOString() });
        expTitle.value = ''; expAmount.value = ''; expTitle.focus(); updateUI();
    }
});

if(addPlanForm) {
    addPlanForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = planTitle.value.trim(), price = parseFloat(planPrice.value);
        if(title && price > 0) { buyPlans.push({title, price}); localStorage.setItem('my_buy_plans', JSON.stringify(buyPlans)); planTitle.value = ''; planPrice.value = ''; planTitle.focus(); updateUI(); }
    });
}

if(annualSaveForm) {
    annualSaveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        savingsData.annual = parseFloat(annualSaveTargetInput.value) || 0;
        localStorage.setItem('my_savings_data', JSON.stringify(savingsData)); updateUI();
    });
}

if (searchExpenses) { searchExpenses.addEventListener('input', (e) => { renderAllExpenses(e.target.value); }); }

if (clearAllTimeBtn) {
    clearAllTimeBtn.addEventListener('click', () => {
        if(confirm('تحذير خطير: هل أنت متأكد من مسح جميع البيانات؟')) { expenses = []; localStorage.setItem('my_expenses', JSON.stringify(expenses)); updateUI(); }
    });
}

updateUI();

const sideBarElement = document.getElementById('side-bar');
if (sideBarShow && sideBarElement) {
    sideBarShow.addEventListener('click', (e) => { e.stopPropagation(); sideBarElement.classList.toggle('mobile-active'); });
    sideSections.forEach(section => {
        section.addEventListener('click', () => { if (window.innerWidth <= 1800) sideBarElement.classList.remove('mobile-active'); });
    });
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1800) { if (!sideBarElement.contains(e.target) && !sideBarShow.contains(e.target)) sideBarElement.classList.remove('mobile-active'); }
    });
}