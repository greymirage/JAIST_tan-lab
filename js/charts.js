// 5. Build Charts & Heatmap Grid

// Stacked Yearly Bar Chart (Master + PhD)
function buildYearlyChart() {
    const ctx = document.getElementById('yearlyChart').getContext('2d');
    
    const mastersCounts = {};
    const phdsCounts = {};
    window.ALL_DATA.forEach(t => {
        if (t.year) {
            if (t.degree_type === "博士") {
                phdsCounts[t.year] = (phdsCounts[t.year] || 0) + 1;
            } else {
                mastersCounts[t.year] = (mastersCounts[t.year] || 0) + 1;
            }
        }
    });

    const yearsSorted = [...new Set(window.ALL_DATA.map(t => t.year).filter(Boolean))].sort();
    const mastersData = yearsSorted.map(y => mastersCounts[y] || 0);
    const phdsData = yearsSorted.map(y => phdsCounts[y] || 0);

    window.yearlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: yearsSorted.map(y => `${y}年`),
            datasets: [
                {
                    label: '修士論文',
                    data: mastersData,
                    backgroundColor: 'rgba(0, 64, 128, 0.75)',
                    borderColor: '#004080',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: '博士論文',
                    data: phdsData,
                    backgroundColor: 'rgba(234, 179, 8, 0.75)',
                    borderColor: '#ca8a04',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    stacked: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#475569' }
                },
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: { color: '#475569' }
                }
            },
            onClick: (evt, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const targetYear = yearsSorted[index];
                    document.getElementById('filter-year').value = targetYear;
                    handleSearchFilter();
                    document.getElementById('list').scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    });
}

// Keyword Ranking Chart with period tabs
function updateKeywordChart(period) {
    const currentYear = 2026;
    let filterFunc = t => true;

    if (period === '15y') filterFunc = t => (currentYear - t.year <= 15);
    else if (period === '10y') filterFunc = t => (currentYear - t.year <= 10);
    else if (period === '5y') filterFunc = t => (currentYear - t.year <= 5);

    // Collect keyword frequencies
    const kwCounts = {};
    window.ALL_DATA.filter(filterFunc).flatMap(t => t.keywords).forEach(k => {
        if (k && k !== "未登録") kwCounts[k] = (kwCounts[k] || 0) + 1;
    });

    const topKws = Object.entries(kwCounts)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 20);

    const labels = topKws.map(entry => entry[0]);
    const dataVals = topKws.map(entry => entry[1]);

    // Handle tab active state UI
    const buttons = document.querySelectorAll('.tab-buttons .tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    const targetBtn = Array.from(buttons).find(b => b.innerText.includes(period === 'all' ? '全期間' : period === '15y' ? '近15年' : period === '10y' ? '近10年' : '近5年'));
    if (targetBtn) targetBtn.classList.add('active');

    const ctx = document.getElementById('keywordChart').getContext('2d');

    if (window.keywordChartInstance) {
        window.keywordChartInstance.data.labels = labels;
        window.keywordChartInstance.data.datasets[0].data = dataVals;
        window.keywordChartInstance.update();
    } else {
        window.keywordChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: dataVals,
                    backgroundColor: 'rgba(29, 78, 216, 0.7)',
                    borderColor: '#1d4ed8',
                    borderWidth: 1.5,
                    borderRadius: 4,
                    hoverBackgroundColor: '#1d4ed8'
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { color: '#475569' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#475569' }
                    }
                },
                onClick: (evt, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const targetKw = labels[index];
                        document.getElementById('filter-kw').value = targetKw;
                        document.getElementById('filter-year').value = "";
                        handleSearchFilter();
                        document.getElementById('list').scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });
    }
}

// Timeline Heatmap Grid
function buildHeatmap() {
    const table = document.getElementById('heatmap-table');
    table.innerHTML = "";

    // Years list
    const years = [...new Set(window.ALL_DATA.map(t => t.year).filter(Boolean))].sort();
    
    // Top 15 Keywords for the heatmap rows
    const kwCounts = {};
    window.ALL_DATA.flatMap(t => t.keywords).forEach(k => {
        if (k && k !== "未登録") kwCounts[k] = (kwCounts[k] || 0) + 1;
    });
    const topKws = Object.entries(kwCounts)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 15)
        .map(e => e[0]);

    // Header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const emptyTh = document.createElement('th');
    emptyTh.textContent = "キーワード";
    emptyTh.style.textAlign = "left";
    emptyTh.style.position = "sticky";
    emptyTh.style.left = "0";
    emptyTh.style.background = "#f8fafc";
    emptyTh.style.zIndex = "3";
    headerRow.appendChild(emptyTh);
    
    years.forEach(y => {
        const th = document.createElement('th');
        th.textContent = y;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body rows
    const tbody = document.createElement('tbody');
    topKws.forEach(kw => {
        const row = document.createElement('tr');
        const labelTd = document.createElement('td');
        labelTd.className = "kw-label";
        labelTd.textContent = kw;
        row.appendChild(labelTd);

        years.forEach(y => {
            const count = window.ALL_DATA.filter(t => t.year === y && t.keywords.includes(kw)).length;
            
            const cell = document.createElement('td');
            cell.className = `heatmap-cell hm-${count >= 4 ? '4plus' : count}`;
            cell.textContent = count > 0 ? count : "";
            
            cell.addEventListener('mouseover', (e) => {
                showHeatmapTooltip(e, kw, y, count);
            });
            cell.addEventListener('mouseout', hideHeatmapTooltip);
            
            cell.addEventListener('click', () => {
                document.getElementById('filter-kw').value = kw;
                document.getElementById('filter-year').value = y;
                handleSearchFilter();
                document.getElementById('list').scrollIntoView({ behavior: 'smooth' });
            });

            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
}

function showHeatmapTooltip(e, kw, year, count) {
    const tooltip = document.getElementById('heatmap-tooltip');
    tooltip.innerHTML = `
        <div class="tooltip-title">${kw}</div>
        <div>年度: ${year}年度</div>
        <div>発表論文数: <strong>${count}</strong> 件</div>
        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:0.4rem; border-top:1px solid var(--card-border); padding-top:0.3rem;">クリックしてこの年度の論文を表示</div>
    `;
    tooltip.style.display = "block";
    tooltip.style.left = `${e.pageX + 15}px`;
    tooltip.style.top = `${e.pageY + 15}px`;
}

function hideHeatmapTooltip() {
    document.getElementById('heatmap-tooltip').style.display = "none";
}
