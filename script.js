(function () {
  const STORAGE_KEY = 'taskflow-tasks';
  let tasks = [];
  let filter = 'all';

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch (e) {
      tasks = [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      /* storage unavailable — app still works for this session */
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const statsText = document.getElementById('statsText');
  const remainingText = document.getElementById('remainingText');
  const addForm = document.getElementById('addForm');
  const taskInput = document.getElementById('taskInput');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clearCompleted');

  function setFilter(f) {
    filter = f;
    filterBtns.forEach((btn) => {
      const active = btn.dataset.filter === f;
      btn.classList.toggle('bg-violet-600', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('text-slate-500', !active);
    });
    render();
  }

  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    tasks.unshift({ id: uid(), text: trimmed, done: false });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const t = tasks.find((x) => x.id === id);
    if (t) t.done = !t.done;
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter((x) => x.id !== id);
    saveTasks();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter((x) => !x.done);
    saveTasks();
    render();
  }

  function visibleTasks() {
    if (filter === 'active') return tasks.filter((t) => !t.done);
    if (filter === 'completed') return tasks.filter((t) => t.done);
    return tasks;
  }

  function render() {
    const items = visibleTasks();
    taskList.innerHTML = '';

    if (items.length === 0) {
      emptyState.classList.remove('hidden');
      emptyState.classList.add('flex');
    } else {
      emptyState.classList.add('hidden');
      emptyState.classList.remove('flex');
    }

    items.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-enter flex items-center gap-3 px-4 py-3';

      li.innerHTML = `
        <button data-action="toggle" data-id="${task.id}"
          class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
            task.done
              ? 'border-violet-600 bg-violet-600 text-white'
              : 'border-slate-300 text-transparent hover:border-violet-400'
          }">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </button>
        <span class="min-w-0 flex-1 truncate text-sm ${task.done ? 'strike text-slate-400' : 'text-slate-700'}">${escapeHtml(task.text)}</span>
        <button data-action="delete" data-id="${task.id}"
          class="flex-shrink-0 rounded-lg p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
        </button>
      `;
      taskList.appendChild(li);
    });

    const total = tasks.length;
    const remaining = tasks.filter((t) => !t.done).length;
    const completed = total - remaining;

    statsText.textContent =
      total === 0 ? 'No tasks yet' : `${completed} of ${total} completed`;
    remainingText.textContent = `${remaining} remaining`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(taskInput.value);
    taskInput.value = '';
    taskInput.focus();
  });

  taskList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'toggle') toggleTask(id);
    if (btn.dataset.action === 'delete') deleteTask(id);
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  loadTasks();
  setFilter('all');
})();