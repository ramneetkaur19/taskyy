var state = {
    taskList: []
};

// DOM Objects
var taskContents = document.querySelector(".task__contents");
var taskModal = document.querySelector(".task__modal__body");

var htmlTaskContent = ({ id, title, description, type, url }) => `
    <div class='col-md-6 col-lg-4 mt-3' id=${id} key=${id}>
        <div class='card shadow-sm task__card'>
            <div class='card-header d-flex justify-content-end task__card__header'>
                <button type="button" class="btn btn-outline-info mr-2" name="${id}" onclick="editTask.apply(this,arguments)">
                    <i class="fas fa-pencil-alt" name=${id}></i>
                </button>
                <button type="button" class="btn btn-outline-danger mr-2" name="${id}" onclick="deleteTask.apply(this,arguments)">
                    <i class="fas fa-trash-alt" name=${id}></i>
                </button>
            </div>
            <div class="card-body">
                ${
                    url &&
                    `<img width='100%' src=${url} alt='card image cap' class='card-img-top md-3 rounded-lg' />`
                }
                <h4 class="card-title">${title}</h4>
                <p class="description trim-3-lines text-muted data-gram_editor='false'">${description}</p>
                <div class="tags text-white d-flex flex-wrap">
                    <span class="badge bg-primary m-1">${type}</span>
                </div>
            </div>
            <div class="card-footer">
                <button type="button" class="btn btn-outline-primary float-right open-task-btn" data-bs-toggle="modal" data-bs-target="#showtaskModal" data-task-id="${id}"
                    onclick='openTask.apply(this, arguments)'>
                    Open Task
                </button>
            </div>
        </div>
    </div>
`;



function handleSubmit(_event) {
    const id = `${Date.now()}`;
    const input = {
        url: document.getElementById("imageURL").value,
        title: document.getElementById("taskTitle").value,
        type: document.getElementById("tags").value,
        description: document.getElementById("taskDescription").value,
    };

    if (input.title === "" || input.type === "" || input.description === "") {
        return alert("Please fill in all the required fields");
    }

    taskContents.insertAdjacentHTML("beforeend", htmlTaskContent({
        ...input, id
    }));

    state.taskList.push({ ...input, id });
    updateLocalStorage();

    // Add event listener for the newly created "Open Task" button
    const newOpenTaskBtn = document.querySelector(`.open-task-btn[data-task-id="${id}"]`);
    newOpenTaskBtn.addEventListener("click", () => {
        // Handle opening the modal for the specific task 
        console.log(`Open Task button clicked for task with ID: ${id}`);
    });
}
function openTask(e) {
    if (!e) e = window.event;

    var getTask = state.taskList.find(({ id }) => id === e.target.dataset.taskId);
    taskModal.innerHTML = htmlModalContent(getTask);
}

function deleteTask(e) {
    if (!e) e = window.event;

    var targetID = e.target.getAttribute("name");
    var type = e.target.tagName;

    var updatedTaskList = state.taskList.filter(({ id }) => id !== targetID);
    state.taskList = updatedTaskList;
    updateLocalStorage();

    if (type === 'BUTTON') {
        console.log(e.target.parentNode.parentNode.parentNode);
        return e.target.parentNode.parentNode.parentNode.parentNode.removeChild(
            e.target.parentNode.parentNode.parentNode.parentNode
        );
    }

    return e.target.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(
        e.target.parentNode.parentNode.parentNode
    );
}

function editTask(e) {
    if (!e) e = window.event;
    var targetID = e.target.id;
    var type = e.target.tagName;

    var parentNode;
    let taskTitle;
    var taskDescription;
    var taskType;
    let submitButton;

    if (type === 'BUTTON') {
        parentNode = e.target.parentNode.parentNode;
    } else {
        parentNode = e.target.parentNode.parentNode.parentNode;
    }

    taskTitle = parentNode.childNodes[3];
    taskDescription = parentNode.childNodes[3].childNodes[5];
    taskType = parentNode.childNodes[3].childNodes[7].childNodes[1];
    submitButton = parentNode.childNodes[5].childNodes[1];

    taskTitle.setAttribute("contenteditable", "true");
    taskDescription.setAttribute("contenteditable", "true");
    taskType.setAttribute("contenteditable", "true");

    submitButton.setAttribute('onclick', "saveEdit.apply(this, arguments)");
    submitButton.removeAttribute("data-bs-toggle");
    submitButton.removeAttribute("data-bs-target");
    submitButton.innerHTML = "Save Changes";
}

function saveEdit(e) {
    if (!e) e = window.event;
    var targetID = e.target.id;
    var parentNode = e.target.parentNode.parentNode;

    var taskTitle = parentNode.childNodes[3].childNodes[3];
    var taskDescription = parentNode.childNodes[3].childNodes[5];
    var taskType = parentNode.childNodes[3].childNodes[7].childNodes[1];
    var submitButton = parentNode.childNodes[5].childNodes[1];

    var updateData = {
        taskTitle: taskTitle.innerHTML,
        taskDescription: taskDescription.innerHTML,
        taskType: taskType.innerHTML
    };

    var stateCopy = state.taskList.map((task) =>
        task.id === targetID
            ? {
                id: task.id,
                title: updateData.taskTitle,
                description: updateData.taskDescription,
                type: updateData.taskType,
                url: task.url,
            }
            : task
    );

    state.taskList = stateCopy;
    updateLocalStorage();

    taskTitle.setAttribute("contenteditable", "false");
    taskDescription.setAttribute("contenteditable", "false");
    taskType.setAttribute("contenteditable", "false");

    submitButton.setAttribute('onclick', "openTask.apply(this, arguments)");
    submitButton.setAttribute("data-bs-toggle", "modal");
    submitButton.setAttribute("data-bs-target", "#showtaskModal");
    submitButton.innerHTML = "Open Task";
}

var searchTask = (e) => {
    if (!e) e = window.event;

    while (taskContents.firstChild) {
        taskContents.removeChild(taskContents.firstChild);
    }

    var resultData = state.taskList.filter(({ title }) =>
        title.includes(e.target.value)
    );

    console.log(resultData);

    resultData.map((cardData) =>
        taskContents.insertAdjacentHTML("beforeend", htmlTaskContent(cardData))
    );
};

var htmlModalContent = ({ id, title, description, url }) => {
    var date = new Date(parseInt(id));
    return `
  <div id=${id}>
  ${
        url &&
        `<img width='100%' src=${url} alt='card image cap' class='card-img-top md-3 rounded-lg' />`
    }
            <strong class='text-sm text-muted'> Created on ${date.toDateString()}</strong>
            <h2 class ='my-3'>${title}</h2>
            <p class='lead'>${description}</p>
            </div>
            `;
};

var updateLocalStorage = () => {
    localStorage.setItem('task', JSON.stringify({
        tasks: state.taskList,
    }));
}

var loadInitialData = () => {
    var localStorageCopy = JSON.parse(localStorage.getItem('task'));
    if (localStorageCopy) state.taskList = localStorageCopy.tasks;
    state.taskList.map((cardData) => {
        taskContents.insertAdjacentHTML("beforeend", htmlTaskContent(cardData));
    });
};
