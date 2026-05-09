// ===== TRACKER DATA =====
var trackerData = {};
var currentNoteDate = null;

// Load tracker data from localStorage
function loadTrackerData() {
  var stored = localStorage.getItem('gymTrackerData');
  trackerData = stored ? JSON.parse(stored) : {};
}

// Save tracker data to localStorage
function saveTrackerData() {
  localStorage.setItem('gymTrackerData', JSON.stringify(trackerData));
}

// Get status for a date (went, rest, skipped, or empty)
function getDateStatus(year, month, day) {
  var key = year + '-' + month + '-' + day;
  return trackerData[key] ? trackerData[key].status : null;
}

// Set status for a date
function setDateStatus(year, month, day, status) {
  var key = year + '-' + month + '-' + day;
  if (!trackerData[key]) trackerData[key] = {};
  trackerData[key].status = status;
  saveTrackerData();
}

// Get note for a date
function getDateNote(year, month, day) {
  var key = year + '-' + month + '-' + day;
  return trackerData[key] ? trackerData[key].note : '';
}

// Set note for a date
function setDateNote(year, month, day, note) {
  var key = year + '-' + month + '-' + day;
  if (!trackerData[key]) trackerData[key] = {};
  trackerData[key].note = note;
  saveTrackerData();
}

// Cycle through statuses: empty → went → rest → skipped → empty
function cycleStatus(year, month, day) {
  var current = getDateStatus(year, month, day);
  var next = null;
  if (current === null) next = 'went';
  else if (current === 'went') next = 'rest';
  else if (current === 'rest') next = 'skipped';
  else if (current === 'skipped') next = null;
  
  setDateStatus(year, month, day, next);
  renderCalendar();
}

// Generate calendar for the selected month
function renderCalendar() {
  var monthSelect = document.getElementById('monthSelect');
  var month = parseInt(monthSelect.value);
  var year = 2026;
  
  var firstDay = new Date(year, month - 1, 1).getDay();
  var daysInMonth = new Date(year, month, 0).getDate();
  
  var calendarGrid = document.getElementById('calendarGrid');
  calendarGrid.innerHTML = '';
  
  // Empty cells for days before month starts
  for (var i = 0; i < firstDay; i++) {
    var emptyCell = document.createElement('div');
    emptyCell.style.opacity = '0.2';
    emptyCell.style.pointerEvents = 'none';
    calendarGrid.appendChild(emptyCell);
  }
  
  // Days of the month
  for (var day = 1; day <= daysInMonth; day++) {
    var dayEl = document.createElement('div');
    dayEl.className = 'cal-day';
    dayEl.innerHTML = '<div class="cal-date">' + day + '</div><div class="cal-status"></div><div class="cal-note-btn">📝</div>';
    
    var status = getDateStatus(year, month, day);
    if (status) dayEl.classList.add(status);
    
    // Status emoji
    var statusEl = dayEl.querySelector('.cal-status');
    if (status === 'went') statusEl.textContent = '✓';
    else if (status === 'rest') statusEl.textContent = '●';
    else if (status === 'skipped') statusEl.textContent = '✗';
    
    // Click to cycle status
    (function(d, m, y) {
      dayEl.addEventListener('click', function(e) {
        if (e.target.classList.contains('cal-note-btn')) {
          openNoteModal(y, m, d);
        } else {
          cycleStatus(y, m, d);
        }
      });
    })(day, month, year);
    
    calendarGrid.appendChild(dayEl);
  }
}

// Open note modal
function openNoteModal(year, month, day) {
  currentNoteDate = { year: year, month: month, day: day };
  var existingNote = getDateNote(year, month, day);
  
  var modal = document.getElementById('noteModal');
  var input = document.getElementById('noteInput');
  input.value = existingNote || '';
  modal.classList.add('active');
  input.focus();
}

// Close note modal
function closeNoteModal() {
  var modal = document.getElementById('noteModal');
  modal.classList.remove('active');
  currentNoteDate = null;
}

// Save note
function saveNote() {
  if (!currentNoteDate) return;
  var input = document.getElementById('noteInput');
  setDateNote(currentNoteDate.year, currentNoteDate.month, currentNoteDate.day, input.value);
  closeNoteModal();
  renderCalendar();
}

// Delete note
function deleteNote() {
  if (!currentNoteDate) return;
  setDateNote(currentNoteDate.year, currentNoteDate.month, currentNoteDate.day, '');
  closeNoteModal();
  renderCalendar();
}

// ===== SECTION TOGGLE =====
document.addEventListener('DOMContentLoaded', function() {
  // Load tracker data
  loadTrackerData();
  
  // Section toggle (Gym / Meal Plan / Tracker)
  document.querySelectorAll('.stab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = this.getAttribute('data-section');
      document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
      document.querySelectorAll('.stab').forEach(function(b) { b.classList.remove('active'); });
      document.getElementById(target).classList.add('active');
      this.classList.add('active');
      
      // Render calendar when tracker is opened
      if (target === 'tracker') {
        renderCalendar();
      }
    });
  });

  // Gym day tabs
  document.querySelectorAll('.tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = this.getAttribute('data-target');
      document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
      document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
      document.getElementById(target).classList.add('active');
      this.classList.add('active');
    });
  });
  
  // Month selector
  document.getElementById('monthSelect').addEventListener('change', function() {
    renderCalendar();
  });
  
  // Note modal handlers
  var noteModal = document.getElementById('noteModal');
  if (noteModal) {
    document.getElementById('noteSaveBtn').addEventListener('click', saveNote);
    document.getElementById('noteCancelBtn').addEventListener('click', closeNoteModal);
    document.getElementById('noteDeleteBtn').addEventListener('click', deleteNote);
    
    document.getElementById('noteInput').addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeNoteModal();
    });
  }
  
  // Initial calendar render
  renderCalendar();
});