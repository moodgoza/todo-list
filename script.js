const tableBody = document.getElementsByTagName("TBODY")[0];
const todoDiscription = document.getElementById("new-task");
const addButton = document.getElementById("add");
const container = document.getElementById("container");
const BASE_URL = "https://dummyjson.com/todos";
const cont = document.getElementById("cont");
let deletedId = false;
let page = 1;
let todos = [];
let myToken = "";
container.hidden = true;

// log in
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

// get all todos
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

// add todo
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

//change status
const changeStatus = (todo) => {
  console.log(todo);
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

//delete Todo
const deleteTodo = (id) => {
  console.log(id);
  let res = fetch(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${myToken}`,
      "Content-Type": "application/json",
    },
    method: "Delete",
  });
  return res;
};

const renderPage = () => {

 
  if(page < 1 || (page - 1) * 7 >= todos.length)
  {
    page = Math.max(1, page - 1);
    return;
  }
  tableBody.innerHTML = ` <tr>
  <td colspan="5"><hr /></td>
</tr>`
  for(let i = (page - 1) * 7; i < Math.min((page) * 7, todos.length); i++)
  {
    tableBody.innerHTML += genTodo(todos[i]);
  }

  const pageNumber = document.querySelector('footer > div > span');
  pageNumber.innerHTML = `Page ${page}`;
  const numOfTodo = document.getElementById("numOfTodo");
  numOfTodo.innerHTML = `${todos.length} Task`;
};

const rightArrow = () => {
  page++;
  renderPage();
}

const leftArrow = () => {
  page--;
  renderPage();
}

login().then(({ token }) => {
  myToken = token;
  container.hidden = false;
  if(localStorage.getItem("todos") === null)
  {
    getTodos(token).then((data) => {
      todos = data.todos;
      renderPage();
      localStorage.setItem("todos", JSON.stringify(todos))
      console.log(JSON.parse(localStorage.getItem("todos")))
      
    });
  }
  else 
  {
    todos = JSON.parse(localStorage.getItem("todos"));

    renderPage();
  }
  
});

addButton.addEventListener("click", (event) => {
  addTodo({ todo: todoDiscription.value, completed: false, userId: 2 }).then(
    (todo) => {
      if(page * 7 > todos.length)
      tableBody.innerHTML += genTodo(todo);
      todos.push(todo);
      localStorage.setItem("todos", JSON.stringify(todos));
      const numOfTodo = document.getElementById("numOfTodo");
      numOfTodo.innerHTML = `${todos.length} Task`;
    }
  );
});

const changeTodoStatus = (id) => {
  const todo = todos.filter((t) => t.id === id)[0];

  changeStatus(todo).then((data) => {
    console.log("status changed successfully", data.ok);
    todo.completed = !todo.completed;
    localStorage.setItem("todos", JSON.stringify(todos));
    const status = document.querySelector(`#todo${todo.id}  #status`);
    console.log(status);
    status.innerHTML = todo.completed ? "Completed" : "In progress";

    const changeButton = document.querySelector(
      `#todo${todo.id} #${!todo.completed ? "undo" : "done"}`
    );
    console.log(todo.completed, changeButton);
    changeButton.innerHTML = !todo.completed ? "Done" : "Undo";
    changeButton.setAttribute("id", !todo.completed ? "done" : "undo");
    console.log(todos)
  });
};

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
    numOfTodo.innerHTML = `${todos.length} Task`;
  });
  document.getElementById("cont").style.display = "none";
};

const confirmationNo = () => {
  document.getElementById("cont").style.display = "none";
};

const deleteTodoById = async (id) => {
  deletedId = id;
  document.getElementById("cont").style.display = "flex";
};


//generate todo
const genTodo = (todo) => {
  return `
      <tr id=todo${todo.id}>
      <td><span id="todoId">${todo.id}</span></td>
      <td><span id="desc">${todo.todo}</span></td>
      <td><span id=status>${
        todo.completed ? "complete" : "In progress"
      }</span></td>
      <td><span id=userId>${todo.userId}</span></td>
      <td><span><button id=${
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
