(function() {
    class TodoTask {
        constructor(taskDesc) {
            this.taskDesc = taskDesc;
            this.isComplete = false;
        }

        complete() {
            this.isComplete = true;
        }
    }

    class TodoList {
        constructor() {
            this.todoList = [];
        }
    }

    class TodoListElement extends HTMLUListElement {
        constructor() {
            super();

        }
    }

    class TodoListItemElement extends HTMLLIElement {
        constructor() {
            super();
        }
    }


    function createNewTask(taskDesc) {
        const todoListEL = document.getElementById('todoList');
        const li = document.createElement('li');
        li.setAttribute('class', 'todo-box todo-list-item');
        li.draggable = true;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        li.appendChild(checkbox);

        const checkIcon = document.createElement('span');
        checkIcon.setAttribute('class', 'icon empty-circle');
        checkIcon.setAttribute('data-action', 'complete');
        li.appendChild(checkIcon);

        const taskText = document.createElement('span');
        taskText.setAttribute('class', 'todo-text');
        taskText.setAttribute('data-action', 'complete');
        taskText.innerText = taskDesc;
        li.appendChild(taskText);

        const deleteIcon = document.createElement('span');
        deleteIcon.setAttribute('class', 'icon cross');
        deleteIcon.setAttribute('data-action', 'delete');
        li.appendChild(deleteIcon);

        todoListEL.prepend(li);
        updateTodoCount();
    }

    function updateTodoCount() {
        const todoListEL = document.querySelectorAll('.todo-list-item:not(.completed)');
        const countEl = document.getElementById('count');
        countEl.innerText = todoListEL.length;
    }

    function clearCompleted() {

    }

    function getTheme() {
        return document.documentElement.getAttribute('data-theme');
    }

    function setTheme(theme) {
        const documentEL = document.documentElement;
        documentEL.setAttribute('data-theme', theme);
    }

    function setTodoState(state) {
        const todoListEL = document.getElementById('todoList');
        todoListEL.setAttribute('data-state', state);
    }

    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(function(registration) {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
              }, function(err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
              });
        }
    }

    function initializeApp() {
        registerServiceWorker();
        const todoList = new TodoList();
        const todoInputEL = document.getElementById('todoInput');
        const todoListEL = document.getElementById('todoList');
        const todoTabEL = document.getElementById('todoTab');
        const todoTabDesktopEL = document.getElementById('todoTabDesktop');
        const themeBtn = document.getElementById('themeBtn');
        const clearCompletedBtn = document.getElementById('clearCompleted');

        todoInputEL.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const taskDesc = String(todoInputEL.value).trim();
                if (taskDesc) {
                    try {
                        createNewTask(taskDesc);
                        todoInputEL.value = '';
                    } catch(err) {

                    }
                } else {
                    alert('Input is required');
                }
            }
        });

        todoListEL.addEventListener('click', function(e){
            if(e.target.tagName === 'SPAN') {
                const dataset = e.target.dataset;
                if (dataset && dataset.action === 'complete') {
                    const parentLI = e.target.parentElement;
                    const checkbox = parentLI.firstElementChild;
                    checkbox.checked = !checkbox.checked;
                    parentLI.classList.toggle('completed');
                } 
                if (dataset && dataset.action === 'delete') {
                    e.target.parentElement.animate([
                        // keyframes
                        { transform: `translateX(-${ e.target.parentElement.offsetWidth}px) scale(0, 0)` }
                      ], {
                        // timing options
                        duration: 200,
                        iterations: 1
                    }).finished.then(() => {
                        e.target.parentElement.remove();
                        updateTodoCount();
                    });
                } 
            }
        });

        todoListEL.addEventListener('drag', function (e) {
            if (e.target.tagName === 'LI') {
                e.target.classList.add('dragged');
                // e.dataTransfer.setData("text/plain", e.target.x);
                // this.setAttribute('data-dragged', e.target);
                e.dataTransfer.dropEffect = 'move';
                this.draggedElement = e.target;
            }
        });

        todoListEL.addEventListener('dragover',function(e) {
            if (e.target.tagName === 'LI' && this.draggedElement && e.target !== this.draggedElement) {
                if (this.lastElementChild === e.target) {
                    this.appendChild(this.draggedElement);
                } else {
                    this.insertBefore(this.draggedElement, e.target);
                }
            } 
        });

        todoListEL.addEventListener('dragend', function(e) {
            if (e.target.tagName === 'LI') {
                e.target.classList.remove('dragged');
                delete this.draggedElement;
            }
        });

        function handleTodoStates(e) {
            if(e.target.tagName === 'SPAN' && !e.target.classList.contains('active')) {
                const items = document.querySelectorAll('.todo-states span.state');
                Array.from(items).forEach(el => {
                    if (el.innerText === e.target.innerText) {
                        el.classList.toggle('active');
                    } else {
                        el.classList.remove('active'); 
                    }
                });
                const state = String(e.target.innerText).toLowerCase();
                setTodoState(state);                
            }
        }

        todoTabEL.addEventListener('click', handleTodoStates);
        todoTabDesktopEL.addEventListener('click', handleTodoStates);


        themeBtn.addEventListener('click', function (e) {
            if(e.target.tagName === 'SPAN') {
                const theme = getTheme();
                if (!theme || theme === 'light') {
                    setTheme('dark');
                } else {
                    setTheme('light');
                }
            }
        });

        clearCompletedBtn.addEventListener('click', e => {
            if(e.target.tagName === 'SPAN') {
                document.querySelectorAll('.todo-list-item.completed')
                .forEach(el => el.remove());
                updateTodoCount();
            }
        })

        function consumeRestAPI() {
            fetch('https://jsonplaceholder.typicode.com/todos')
            .then(response => response.json())
            .then(json => json.slice(0, 5).forEach(item => createNewTask(item.title)));
        }
        updateTodoCount();
        consumeRestAPI();
    }

    window.addEventListener('load', initializeApp);
})();

