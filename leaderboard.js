/* SIMPLE — leaderboard data + rendering
 *
 * To add or update a model, edit the MODELS array below. Each entry holds the
 * raw number of successes (out of ROLLOUTS) for every task at the three
 * domain-randomization levels [L0, L1, L2]. The script computes the per-level
 * and overall success rates, sorts policies by Overall (descending), and
 * renders the ranked table. No other edits are required.
 */
(function () {
  'use strict';

  const TASKS = ['XMovePick', 'BendPick', 'Handover', 'Mobile P&P', 'Grasp', 'XMoveBendPick'];
  const ROLLOUTS = 10; // rollouts per level per task

  // name: HTML allowed (for subscripts). type: policy family chip.
  const MODELS = [
    {
      name: '&Psi;<sub>0</sub>', type: 'VLA',
      s: { XMovePick: [10, 10, 6], BendPick: [10, 10, 10], Handover: [7, 7, 10], 'Mobile P&P': [7, 5, 6], Grasp: [10, 10, 8], XMoveBendPick: [10, 9, 9] },
    },
    {
      name: 'GR00T N1.6', type: 'VLA',
      s: { XMovePick: [10, 10, 7], BendPick: [7, 7, 6], Handover: [1, 3, 3], 'Mobile P&P': [0, 0, 0], Grasp: [9, 9, 7], XMoveBendPick: [4, 4, 1] },
    },
    {
      name: '&pi;<sub>0.5</sub>', type: 'VLA',
      s: { XMovePick: [7, 5, 1], BendPick: [10, 10, 8], Handover: [5, 4, 5], 'Mobile P&P': [3, 3, 3], Grasp: [10, 10, 8], XMoveBendPick: [0, 0, 0] },
    },
    {
      name: 'InternVLA', type: 'VLA',
      s: { XMovePick: [0, 0, 0], BendPick: [5, 5, 0], Handover: [0, 0, 0], 'Mobile P&P': [0, 0, 0], Grasp: [0, 0, 0], XMoveBendPick: [3, 5, 7] },
    },
    {
      name: 'H-RDT', type: 'Video',
      s: { XMovePick: [0, 0, 2], BendPick: [0, 0, 1], Handover: [0, 1, 0], 'Mobile P&P': [0, 0, 0], Grasp: [0, 0, 0], XMoveBendPick: [0, 0, 0] },
    },
    {
      name: 'DreamZero', type: 'WAM',
      s: { XMovePick: [10, 10, 10], BendPick: [9, 9, 8], Handover: [7, 8, 9], 'Mobile P&P': [5, 3, 3], Grasp: [9, 10, 7], XMoveBendPick: [0, 0, 1] },
    },
    {
      name: 'EgoVLA', type: 'Video',
      s: { XMovePick: [0, 1, 2], BendPick: [7, 5, 8], Handover: [0, 4, 3], 'Mobile P&P': [0, 0, 0], Grasp: [10, 10, 7], XMoveBendPick: [3, 5, 4] },
    },
    {
      name: 'DP', type: 'IL',
      s: { XMovePick: [3, 3, 2], BendPick: [10, 8, 6], Handover: [3, 2, 4], 'Mobile P&P': [4, 0, 0], Grasp: [8, 9, 8], XMoveBendPick: [0, 0, 0] },
    },
    {
      name: 'ACT', type: 'IL',
      s: { XMovePick: [10, 10, 5], BendPick: [10, 9, 9], Handover: [7, 7, 10], 'Mobile P&P': [5, 5, 5], Grasp: [10, 10, 8], XMoveBendPick: [9, 10, 10] },
    },
  ];

  /* ---------- Metric computation ---------- */
  function levelRate(model, levelIdx) {
    let sum = 0;
    for (const task of TASKS) sum += model.s[task][levelIdx];
    return (sum / (TASKS.length * ROLLOUTS)) * 100;
  }

  function computeRows() {
    const rows = MODELS.map((m) => {
      const l0 = levelRate(m, 0);
      const l1 = levelRate(m, 1);
      const l2 = levelRate(m, 2);
      const overall = (l0 + l1 + l2) / 3;
      return { name: m.name, type: m.type, l0, l1, l2, overall };
    });
    rows.sort((a, b) => b.overall - a.overall);
    return rows;
  }

  function fmt(v) {
    return v.toFixed(1);
  }

  const RANK_LABELS = ['1st', '2nd', '3rd'];

  function rankCell(i) {
    if (i < 3) {
      const variant = ['gold', 'silver', 'bronze'][i];
      return '<span class="rank-badge rank--' + variant + '" aria-label="' + RANK_LABELS[i] + '">' + (i + 1) + '</span>';
    }
    return '<span class="rank-num">#' + (i + 1) + '</span>';
  }

  /* ---------- Render ---------- */
  function render() {
    const body = document.getElementById('lbBody');
    if (!body) return;
    const rows = computeRows();

    body.innerHTML = rows
      .map((r, i) => {
        const top = i < 3 ? ' lb-row--top' : '';
        return (
          '<tr class="' + top.trim() + '">' +
          '<td class="lb-rank">' + rankCell(i) + '</td>' +
          '<td class="sticky-col lb-name">' + r.name + '</td>' +
          '<td class="lb-type"><span class="type-pill">' + r.type + '</span></td>' +
          '<td class="lb-overall">' + fmt(r.overall) + '</td>' +
          '<td class="lb-num">' + fmt(r.l0) + '</td>' +
          '<td class="lb-num">' + fmt(r.l1) + '</td>' +
          '<td class="lb-num">' + fmt(r.l2) + '</td>' +
          '</tr>'
        );
      })
      .join('');

    const countEl = document.getElementById('lbCount');
    if (countEl) countEl.textContent = String(MODELS.length);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
