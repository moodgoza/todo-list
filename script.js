const tableBody = document.getElementsByTagName("TBODY")[0];
const todoDiscription = document.getElementById("new-task");
const addButton = document.getElementById("add");
const searchButton = document.getElementById("search");
const container = document.getElementById("container");
const BASE_URL = "https://dummyjson.com/todos";
const cont = document.getElementById("cont");
const searchInput = document.getElementById("search-input");
const numOfTodo = document.getElementById("numOfTodo");
let deletedId = false;
let page = 1;
let todos = [];
let myToken = "";
container.hidden = true;

// log in api
const login = async () => {
  let res = await fetch("https://dummyjson.com/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "kminchelle",
      password: "0lelplR",
      // expiresInMins: 60, // optional
    }),
  });

  res = await res.json();
  return res;
};

// get all todos api
const getTodos = async (myToken) => {
  let res = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${myToken}`,
      "Content-type": "application/json",
    },
  });

  res = res.json();
  return res;
};

// add todo api
const addTodo = async (todo) => {
  let res = await fetch(`${BASE_URL}/add`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${myToken}`,
      "Content-type": "application/json",
    },
    body: JSON.stringify(todo),
  });

  res = res.json();
  return res;
};

//change status api
const changeStatus = (todo) => {
  let res = fetch(`${BASE_URL}/${todo.id}`, {
    headers: {
      Authorization: `Bearer ${myToken}`,
      "Content-Type": "application/json",
    },
    method: "PUT",
    body: JSON.stringify({ completed: !todo.completed }),
  });

  return res;
};

//delete Todo api
const deleteTodo = (id) => {
  let res = fetch(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${myToken}`,
      "Content-Type": "application/json",
    },
    method: "Delete",
  });

  return res;
};

// Edit content api
const updateContent = async (id, newContent) => {
  let res = fetch(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${myToken}`,
      "Content-Type": "application/json",
    },
    method: "PUT",
    body: JSON.stringify({ todo: newContent }),
  });

  return res;
};

//render todos in the container
const renderPage = (todos, fromSerach = false) => {
  if ((page < 1 || (page - 1) * 7 >= todos.length) && !fromSerach) {
    page = Math.max(1, page - 1);
    return;
  }

  tableBody.innerHTML = ` <tr>
      <td colspan="5">
        <hr />
      </td>
    </tr>`;

  for (let i = (page - 1) * 7; i < Math.min(page * 7, todos.length); i++) {
    tableBody.innerHTML += genTodo(todos[i]);
  }

  const pageNumber = document.querySelector("footer > div > span");
  pageNumber.innerHTML = `Page ${page}`;

  numOfTodo.innerHTML = `${todos.length} Task`;
};

//move to the next page
const rightArrow = () => {
  page++;
  renderPage(todos);
};

//move to the previous page
const leftArrow = () => {
  page--;
  renderPage(todos);
};

//logging
login().then(({ token }) => {
  myToken = token;

  container.hidden = false;

  if (localStorage.getItem("todos") === null) {
    getTodos(token).then((data) => {
      todos = data.todos;

      renderPage(todos);

      localStorage.setItem("todos", JSON.stringify(todos));
    });
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));

    renderPage(todos);
  }
});

// create new todo
addButton.addEventListener("click", (event) => {
  addTodo({ todo: todoDiscription.value, completed: false, userId: 2 }).then(
    (todo) => {
      if (page * 7 > todos.length) {
        tableBody.innerHTML += genTodo(todo);
      }

      todos.push(todo);

      localStorage.setItem("todos", JSON.stringify(todos));

      const numOfTodo = document.getElementById("numOfTodo");

      numOfTodo.innerHTML = `${todos.length} Task`;
    }
  );
});

// mark todo as done or unde
const changeTodoStatus = (id) => {
  const todo = todos.filter((t) => t.id === id)[0];

  changeStatus(todo).then((data) => {
    todo.completed = !todo.completed;

    localStorage.setItem("todos", JSON.stringify(todos));

    const status = document.querySelector(`#todo${todo.id}  #status`);

    console.log(status);

    status.innerHTML = todo.completed ? "Completed" : "In progress";

    const changeButton = document.querySelector(
      `#todo${todo.id} #${!todo.completed ? "undo" : "done"}`
    );

    changeButton.innerHTML = !todo.completed ? "Done" : "Undo";
    changeButton.setAttribute("id", !todo.completed ? "done" : "undo");
  });
};

//confirm todo deletion by "YES"
const confirmationYes = async () => {
  await deleteTodo(deletedId).then((data) => {
    console.log("todo deleted successfully", data.ok);

    const todo = document.getElementById(`todo${deletedId}`);
    const trHr = document.querySelector(`#todo${deletedId} + tr`);

    console.log(trHr);

    todo.remove();
    trHr.remove();

    todos = todos.filter((t) => t.id != deletedId);

    localStorage.setItem("todos", JSON.stringify(todos));

    const numOfTodo = document.getElementById("numOfTodo");

    renderPage(todos);

    numOfTodo.innerHTML = `${todos.length} Task`;
  });
  document.getElementById("cont").style.display = "none";
};

//confirm todo deletion by "NO"
const confirmationNo = () => {
  document.getElementById("cont").style.display = "none";
};

//show deletion confirmation
const deleteTodoById = async (id) => {
  deletedId = id;
  document.getElementById("cont").style.display = "flex";
};

// search todo by content
searchButton.addEventListener("click", (event) => {
  const searchResult = todos.filter((t) =>
    String(t.todo).includes(String(searchInput.value))
  );
  console.log(searchResult);
  page = 1;
  renderPage(searchResult, true);
});

numOfTodo.addEventListener("click", (event) => {
  page = 1;
  renderPage(todos);
});

// replace p with input to edit content
const replaceToInput = (id) => {
  const todoInput = document.querySelector(`#todo${id} #desc #todo-input`);
  const todoP = document.querySelector(`#todo${id} #desc #todo-p`);
  todoInput.style.display = "block";
  todoP.style.display = "none";
  document.querySelector(`#todo${id} #edit`).style.display = "inline";
};

// replace input with p when you finished editing
const replaceToP = (id) => {
  const todoInput = document.querySelector(`#todo${id} #desc #todo-input`);
  const todoP = document.querySelector(`#todo${id} #desc #todo-p`);
  console.log(String(todoInput.value), String(todoP.innerHTML));
  if (String(todoInput.value) !== String(todoP.innerHTML)) {
    return false;
  }
  todoInput.style.display = "none";
  todoP.style.display = "block";
  document.querySelector(`#todo${id} #edit`).style.display = "none";
};

// edit content when click on edit icon
const editContent = (id) => {
  const todoInput = document.querySelector(`#todo${id} #desc #todo-input`);
  const todoP = document.querySelector(`#todo${id} #desc #todo-p`);
  updateContent(id, todoInput.value).then(() => {
    let todo = todos.filter((t) => t.id === id)[0];
    todo.todo = todoInput.value;
    todoP.innerHTML = todo.todo;
    todoInput.style.display = "none";
    todoP.style.display = "block";
    localStorage.setItem("todos", JSON.stringify(todos));
    document.querySelector(`#todo${id} #edit`).style.display = "none";
  });
};

//generate todo
const genTodo = (todo) => {
  return `
      <tr id=todo${todo.id}>
      <td><span id="todoId">${todo.id}</span></td>
      <td><span id="desc"><input onblur="replaceToP(${
        todo.id
      })" id='todo-input' value="${todo.todo}"> <p onclick="replaceToInput(${
    todo.id
  })" id="todo-p">${todo.todo}</p> <span id="edit"><i onclick="editContent(${
    todo.id
  })" class="fa-solid fa-pen-to-square"></i></span></span></td>
      <td><span id=status>${
        todo.completed ? "complete" : "In progress"
      }</span></td>
      <td><span id=userId>${todo.userId}</span></td>
      <td><span id="todo_action"><button id=${
        !todo.completed ? "done" : "undo"
      } onclick="changeTodoStatus(${todo.id})">${
    !todo.completed ? "Done" : "Undo"
  }</button>
      <button onclick="deleteTodoById(${todo.id})" id=delete>Delete</button>
      </span></td>
      </tr>

      <tr>
          <td colspan="5">
              <hr>
          </td>
        </tr>
   `;
};
