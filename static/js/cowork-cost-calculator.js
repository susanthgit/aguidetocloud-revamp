// Cowork Cost Calculator
// Namespace: cowcalc

(function() {
  'use strict';

  // DOM elements
  const inUsers = document.getElementById('in-users');
  const inPrompts = document.getElementById('in-prompts');
  const inComplexity = document.getElementById('in-complexity');
  
  const outBurn = document.getElementById('out-burn');
  const outCredits = document.getElementById('out-credits');
  const outAvg = document.getElementById('out-avg');
  const outSeatCost = document.getElementById('out-seat-cost');
  const outSeatUsers = document.getElementById('out-seat-users');
  const outAllIn = document.getElementById('out-allin');
  
  const pctLight = document.getElementById('pct-light');
  const pctMedium = document.getElementById('pct-medium');
  const pctHeavy = document.getElementById('pct-heavy');
  
  // Constants
  const LIGHT_CREDITS = 20;
  const MEDIUM_CREDITS = 100;
  const HEAVY_CREDITS = 400;
  const CREDIT_COST = 0.01; // PayGo $0.01 per credit
  const SEAT_COST_MONTHLY = 30;
  
  // Get task mix from slider value
  function getTaskMix(complexityValue) {
    const val = parseInt(complexityValue);
    
    if (val <= 20) {
      return { light: 0.75, medium: 0.20, heavy: 0.05 };
    } else if (val <= 40) {
      return { light: 0.60, medium: 0.30, heavy: 0.10 };
    } else if (val <= 60) {
      return { light: 0.40, medium: 0.40, heavy: 0.20 };
    } else if (val <= 80) {
      return { light: 0.30, medium: 0.40, heavy: 0.30 };
    } else {
      return { light: 0.20, medium: 0.30, heavy: 0.50 };
    }
  }
  
  // Format numbers
  function formatNumber(num) {
    return num.toLocaleString('en-US');
  }
  
  function formatCurrency(num) {
    return '$' + formatNumber(Math.round(num));
  }
  
  // Calculate and update display
  function calculate() {
    const userCount = parseInt(inUsers.value) || 0;
    const promptCount = parseInt(inPrompts.value) || 0;
    const mix = getTaskMix(inComplexity.value);
    
    // Update task mix display
    pctLight.textContent = Math.round(mix.light * 100) + '%';
    pctMedium.textContent = Math.round(mix.medium * 100) + '%';
    pctHeavy.textContent = Math.round(mix.heavy * 100) + '%';
    
    // Calculate total prompts
    const totalPrompts = userCount * promptCount;
    
    // Calculate credits by task type
    const lightPrompts = totalPrompts * mix.light;
    const mediumPrompts = totalPrompts * mix.medium;
    const heavyPrompts = totalPrompts * mix.heavy;
    
    const lightCredits = lightPrompts * LIGHT_CREDITS;
    const mediumCredits = mediumPrompts * MEDIUM_CREDITS;
    const heavyCredits = heavyPrompts * HEAVY_CREDITS;
    
    const totalCreditsValue = lightCredits + mediumCredits + heavyCredits;
    const variableSpend = totalCreditsValue * CREDIT_COST;
    const seatSpend = userCount * SEAT_COST_MONTHLY;
    const allInCost = seatSpend + variableSpend;
    const avgPerUser = userCount > 0 ? variableSpend / userCount : 0;
    
    // Update outputs
    outBurn.textContent = formatCurrency(variableSpend);
    outCredits.textContent = formatNumber(Math.round(totalCreditsValue));
    outAvg.textContent = formatCurrency(avgPerUser) + '/mo';
    outSeatCost.textContent = formatCurrency(seatSpend);
    outSeatUsers.textContent = formatNumber(userCount);
    outAllIn.textContent = formatCurrency(allInCost);
    
    // Update preset burn displays
    updatePresetBurns();
  }
  
  // Update preset card burn amounts
  function updatePresetBurns() {
    const presets = {
      light: { users: 30, prompts: 40, complexity: 20 },
      balanced: { users: 45, prompts: 60, complexity: 30 },
      heavy: { users: 60, prompts: 80, complexity: 50 },
      runaway: { users: 100, prompts: 120, complexity: 60 }
    };
    
    for (const [key, preset] of Object.entries(presets)) {
      const mix = getTaskMix(preset.complexity);
      const totalPrompts = preset.users * preset.prompts;
      const totalCreditsValue = 
        (totalPrompts * mix.light * LIGHT_CREDITS) +
        (totalPrompts * mix.medium * MEDIUM_CREDITS) +
        (totalPrompts * mix.heavy * HEAVY_CREDITS);
      const variableSpend = totalCreditsValue * CREDIT_COST;
      
      const burnEl = document.querySelector(`.cowcalc-preset[data-preset="${key}"] [data-burn]`);
      if (burnEl) {
        burnEl.textContent = formatCurrency(variableSpend);
      }
    }
  }
  
  // Tab switching
  function activateTab(name) {
    const tabs = document.querySelectorAll('.cowcalc-tab');
    tabs.forEach(t => {
      const isTarget = t.getAttribute('data-tab') === name;
      t.classList.toggle('active', isTarget);
      t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
    document.querySelectorAll('.cowcalc-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('panel-' + name);
    if (panel) panel.classList.add('active');
  }

  function initTabs() {
    document.querySelectorAll('.cowcalc-tab').forEach(btn => {
      btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab')));
    });
  }

  // Load a preset (then jump to the Calculator tab so the result is visible)
  window.loadPreset = function(presetName) {
    const presets = {
      light: { users: 30, prompts: 40, complexity: 20 },
      balanced: { users: 45, prompts: 60, complexity: 30 },
      heavy: { users: 60, prompts: 80, complexity: 50 },
      runaway: { users: 100, prompts: 120, complexity: 60 }
    };
    
    const preset = presets[presetName];
    if (preset) {
      inUsers.value = preset.users;
      inPrompts.value = preset.prompts;
      inComplexity.value = preset.complexity;
      calculate();
      
      // Visual feedback
      document.querySelectorAll('.cowcalc-preset').forEach(card => {
        card.classList.remove('active');
      });
      const activeCard = document.querySelector(`.cowcalc-preset[data-preset="${presetName}"]`);
      if (activeCard) activeCard.classList.add('active');

      activateTab('calculator');
    }
  };
  
  // Event listeners
  inUsers.addEventListener('input', calculate);
  inPrompts.addEventListener('input', calculate);
  inComplexity.addEventListener('input', calculate);

  // Keyboard support for preset cards (role="button")
  document.querySelectorAll('.cowcalc-preset').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const preset = card.getAttribute('data-preset');
        if (preset) window.loadPreset(preset);
      }
    });
  });

  // Init tabs + initial calculation
  initTabs();
  calculate();
  
})();
