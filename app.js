const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const taskList = document.getElementById("task-list");
const taskTitle = document.getElementById("task-title");
const template = document.getElementById("template").content;
const fragment = document.createDocumentFragment();
const errorMsg = document.getElementById("error");
const taskForm = document.getElementById("form-add-task");
const inputTask = document.getElementById("input-task");
const spinner = document.getElementById("spinner");
const inputSignUpEmail = document.getElementById("signup-email");
const dangerSignUpEmailMsg = document.getElementById("danger-signup-email");
const dangerSignUpPasswordMsg = document.getElementById(
  "danger-signup-password"
);
const dangerLoginEmailMsg = document.getElementById("danger-login-email");
const dangerLoginPasswordMsg = document.getElementById("danger-login-password");

document.addEventListener("DOMContentLoaded", () => {
  errorMsg.textContent = "";
});

const isLoading = (is) => {
  if (is) {
    //spinner.textContent = "Loading ... ";
    spinner.classList.remove("invisible");
    taskList.classList.add("invisible");
    taskForm.classList.add("invisible");
  } else {
    //spinner.textContent = "";
    spinner.classList.add("invisible");
    taskList.classList.remove("invisible");
    taskForm.classList.remove("invisible");
  }
};
const loginCheck = (user) => {
  if (user) {
    loggedInLinks.forEach((link) => (link.style.display = "block"));
    loggedOutLinks.forEach((link) => (link.style.display = "none"));
    taskTitle.innerText = user.displayName
      ? `Tarea para ${user.displayName}`
      : `Tarea para ${user.email}`;
  } else {
    loggedInLinks.forEach((link) => (link.style.display = "none"));
    loggedOutLinks.forEach((link) => (link.style.display = "block"));
    taskTitle.innerText = "Tareas";
  }
};

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  addTask(e);
});

// Tasks
taskList.addEventListener("click", (e) => {
  btnAction(e);
});
const btnAction = (e) => {
  const id = e.target.dataset.id;
  const userId = e.target.dataset.userId;
  const spinner = e.target.parentNode.parentNode.querySelector(".spinner-task");
  const buttons = e.target.parentNode;
  
  const putSpinner=()=>{
    spinner.classList.remove("invisible");
    buttons.classList.add("invisible");
  }
 
  if (e.target.classList.contains("fa-check-circle")) {
    putSpinner()
    editTask(id, true).then(() => {
      getTasks(userId);
    });
  }

  if (e.target.classList.contains("fa-minus-circle")) {
    putSpinner()
    deleteTask(id).then(() => {
      getTasks(userId);
    });
  }

  if (e.target.classList.contains("fa-undo-alt")) {
    putSpinner()
    editTask(id, false).then(() => {
      getTasks(userId);
    });
  }
  e.stopPropagation();
};

// SignUp
const signUpForm = document.querySelector("#signup-form");
signUpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signUpForm["signup-email"].value;
  const password = signUpForm["signup-password"].value;
  if (
    validateInputs({
      expresion: expresiones.email,
      input: email,
      error: dangerSignUpEmailMsg,
    }) &&
    validateInputs({
      expresion: expresiones.password,
      input: password,
      error: dangerSignUpPasswordMsg,
    })
  ) {
    // Authenticate the User
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // clear the form
        signUpForm.reset();
        // close the modal
        $("#signupModal").modal("hide");
      })
      .catch((err) => {
        console.log(err.code);
        handleError({ code: err.code });
      });
  }
});

// Logout
const logout = document.querySelector("#logout");

logout.addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    console.log("signup out");
  });
});

// SingIn
const signInForm = document.querySelector("#login-form");

signInForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signInForm["login-email"].value;
  const password = signInForm["login-password"].value;
  if (
    validateInputs({
      expresion: expresiones.email,
      input: email,
      error: dangerLoginEmailMsg,
    }) &&
    validateInputs({
      expresion: expresiones.password,
      input: password,
      error: dangerLoginPasswordMsg,
    })
  ) {
    // Authenticate the User
    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // clear the form
        signInForm.reset();
        // close the modal
        $("#signinModal").modal("hide");
      })
      .catch((err) => {
        handleError({ code: err.code });
      });
  }
});

// Tasks
const setupTasks = (data) => {
  if (data.length) {
    taskList.innerHTML = "";

    data.forEach((doc) => {
      const task = doc.data();
      // console.log(task);
      const clone = template.cloneNode(true);
      clone.querySelector("p").textContent = task.texto;
      if (task.estado) {
        clone
          .querySelectorAll(".fas")[0]
          .classList.replace("fa-check-circle", "fa-undo-alt");
        clone
          .querySelector(".alert")
          .classList.replace("alert-warning", "alert-primary");
        clone.querySelector("p").style.textDecoration = "line-through";
      }
      clone.querySelectorAll(".fas")[0].dataset.id = doc.id;
      clone.querySelectorAll(".fas")[1].dataset.id = doc.id;
      clone.querySelectorAll(".fas")[0].dataset.userId = task.userId;
      clone.querySelectorAll(".fas")[1].dataset.userId = task.userId;
      fragment.appendChild(clone);
    });
    taskList.appendChild(fragment);
  } else {
    taskList.innerHTML = `
    <div class="alert alert-dark text-center">
    Sin tareas pendientes 😍
    </div>
    `;
  }
};

// Add Task
const addTask = (e) => {
  const textToValidate = e.target.querySelector("input").value;
  const text = transformToValidateTaskText(textToValidate);
  if (text.trim() === "") {
    errorMsg.textContent =
      "La tarea no puede estar vacia, ingrese algo que desea realizar en algun momento.";
    return;
  }
  if (auth.currentUser) {
    isLoading(true);
    fs.collection("tasks")
      .doc()
      .set({
        texto: text,
        estado: false,
        userId: auth.currentUser.uid,
        date: Date.now(),
      })
      .then(() => {
        console.log("Document successfully written!");
        isLoading(false);
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
    getTasks(auth.currentUser.uid);
    taskForm.reset();
    e.target.querySelector("input").focus();
    warningMsg.textContent = "";
  } else {
    errorMsg.textContent =
      "Error, debes estar logueado para poder agregar tus tareas. Por favor Registrate o si ya tenes cuenta ingresa.";
  }
};
// Edit Task
const editTask = (id, estado) => {
  const task = fs.collection("tasks").doc(id);
  return task
    .update({
      estado: estado,
    })
    .then(() => {
      console.log("Document successfully updated!");
      // setupTasks()
    })
    .catch((error) => {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
    });
};
// Delete Task
const deleteTask = (id) => {
  return fs
    .collection("tasks")
    .doc(id)
    .delete()
    .then(() => {
      console.log("Document successfully deleted!");
    })
    .catch((error) => {
      console.error("Error removing document: ", error);
    });
};
// Get Tasks
const getTasks = (userId) => {
  fs.collection("tasks")
    .where("userId", "==", userId)
    .orderBy("date", "desc")
    .get()
    .then((snapshot) => {
      setupTasks(snapshot.docs);
    });
};

// list for auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    getTasks(user.uid);
    loginCheck(user);
    errorMsg.textContent = "";
  } else {
    setupTasks([]);
    loginCheck(user);
  }
});

// Login with Google
const googleButton = document.querySelector("#googleLogin");

googleButton.addEventListener("click", (e) => {
  e.preventDefault();
  signInForm.reset();
  $("#signinModal").modal("hide");

  const provider = new firebase.auth.GoogleAuthProvider();
  auth
    .signInWithPopup(provider)
    .then((result) => {
      console.log("google sign in");
    })
    .catch((err) => {
      console.log(err);
    });
});

// Login with Facebook
//const facebookButton = document.querySelector("#facebookLogin");

// facebookButton.addEventListener("click", (e) => {
//   e.preventDefault();
//   signInForm.reset();
//   $("#signinModal").modal("hide");

//   const provider = new firebase.auth.FacebookAuthProvider();
//   auth
//     .signInWithPopup(provider)
//     .then((result) => {
//       console.log(result);
//       console.log("facebook sign in");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

//Validate

inputTask.addEventListener("keyup", (e) => {
  validateTask({ expresion: expresiones.task, input: e.target.value });
});
inputTask.addEventListener("blur", (e) => {
  validateTask({ expresion: expresiones.task, input: e.target.value });
});
