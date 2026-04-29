document.addEventListener('DOMContentLoaded', () => {
    // Current date fixed to 2026-04-13 as per request
    const TODAY_STR = '2026-04-13';
    const today = new Date(TODAY_STR);
    
    // DOM Elements
    const todoInput = document.getElementById('todo-text');
    const importanceSelect = document.getElementById('importance');
    const dateInput = document.getElementById('target-date');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const itemCount = document.getElementById('item-count');
    
    // Modal Elements
    const modal = document.getElementById('alert-modal');
    const alertMsg = document.getElementById('alert-message');
    const modalCloseBtn = document.querySelector('.modal-close-btn');

    // Load data from localStorage
    const savedData = localStorage.getItem('smart-daily-mate-items');
    let items = savedData ? JSON.parse(savedData) : [];

    // Save data to localStorage
    function saveData() {
        localStorage.setItem('smart-daily-mate-items', JSON.stringify(items));
    }

    // Initialize date input with today's date placeholder or value
    dateInput.min = TODAY_STR;
    render(); // Initial render for saved items

    // Show Custom Alert Modal
    function showAlert(message) {
        alertMsg.innerText = message;
        modal.style.display = 'flex';
    }

    // Close Modal
    modalCloseBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Calculate D-Day
    function calculateDDay(targetStr) {
        const targetDate = new Date(targetStr);
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'D-Day';
        return `D-${diffDays}`;
    }

    // Add Todo Function
    function addTodo() {
        const content = todoInput.value.trim();
        const importance = importanceSelect.value;
        const dateValue = dateInput.value;

        // 1. Check if content is empty
        if (!content) {
            showAlert('할 일 내용을 입력하지 않았습니다. 내용을 채워주세요!');
            return;
        }

        // 2. Check if date format is valid
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateValue || !dateRegex.test(dateValue)) {
            showAlert('날짜 형식이 올바르지 않습니다(예: 2026-05-20).');
            return;
        }

        // 3. Check if date is in the future
        const targetDate = new Date(dateValue);
        if (targetDate < today) {
            showAlert('미래의 날짜를 선택해야 D-Day 계산이 가능합니다.');
            return;
        }

        // Create Item Object
        const newItem = {
            id: Date.now(),
            content,
            importance,
            date: dateValue,
            dDay: calculateDDay(dateValue),
            completed: false
        };

        items.push(newItem);
        saveData();
        render();
        
        // Reset Inputs
        todoInput.value = '';
        importanceSelect.value = '중';
        dateInput.value = '';
    }

    // Delete Todo function
    function deleteItem(id) {
        items = items.filter(item => item.id !== id);
        saveData();
        render();
    }

    // Toggle Complete function
    function toggleComplete(id) {
        items = items.map(item => {
            if (item.id === id) {
                return { ...item, completed: !item.completed };
            }
            return item;
        });
        saveData();
        render();
    }

    // Render List
    function render() {
        todoList.innerHTML = '';
        itemCount.innerText = `${items.length} items`;

        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = `todo-item importance-${item.importance} ${item.completed ? 'completed' : ''}`;
            
            itemEl.innerHTML = `
                <div class="todo-main">
                    <div class="check-container">
                        <div class="check-circle">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    </div>
                    <div class="todo-info">
                        <span class="todo-content">${item.content}</span>
                        <span class="todo-date">${item.date}</span>
                    </div>
                </div>
                <div class="todo-actions">
                    <div class="d-day-tag">${item.dDay}</div>
                    <button class="delete-btn" title="삭제">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            
            // Add click event to toggle completion
            const checkBtn = itemEl.querySelector('.check-container');
            checkBtn.addEventListener('click', () => toggleComplete(item.id));

            // Add delete event listener
            const deleteBtn = itemEl.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering toggle when clicking delete
                deleteItem(item.id);
            });
            
            todoList.appendChild(itemEl);
        });
    }

    // Event Listeners
    addBtn.addEventListener('click', addTodo);
    
    // Enter key support
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
});
