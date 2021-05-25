const loggedOutLinks = document.querySelectorAll(".logged-out");
const loggedInLinks = document.querySelectorAll(".logged-in");
const taskList = document.getElementById('lista-tareas')
const template = document.getElementById('template').content
const fragment = document.createDocumentFragment()

let tasks = {}
document.addEventListener('DOMContentLoaded', () => {
  fs.collection("tasks")
    .get()
    .then((snapshot) => {
      setupTasks(snapshot.docs);
    });

})

const loginCheck = (user) => {
  if (user) {
    loggedInLinks.forEach((link) => (link.style.display = "block"));
    loggedOutLinks.forEach((link) => (link.style.display = "none"));
  } else {
    loggedInLinks.forEach((link) => (link.style.display = "none"));
    loggedOutLinks.forEach((link) => (link.style.display = "block"));
  }
}

formulario.addEventListener('submit', e => {
  e.preventDefault()
   console.log(e.target[0].value)
  // console.log(e.target.querySelector('input').value)
  addTask(e)
})

// Tasks
taskList.addEventListener('click', (e) => { btnAction(e) })
const btnAction = e => {
  if (e.target.classList.contains('fa-check-circle')) {
    editTask(e.target.dataset.id, true).then(() => {
      getTasks()
    })

  }

  if (e.target.classList.contains('fa-minus-circle')) {
    deleteTask(e.target.dataset.id).then(() => {
      console.log("deleting");
      getTasks()
    })
  }

  if (e.target.classList.contains('fa-undo-alt')) {
    editTask(e.target.dataset.id, false).then(() => {
      console.log("·······");
      getTasks()
    })

  }
  e.stopPropagation()
}

// SignUp
const signUpForm = document.querySelector("#signup-form");
signUpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signUpForm["signup-email"].value;
  const password = signUpForm["signup-password"].value;

  // Authenticate the User
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // clear the form
      signUpForm.reset();
      // close the modal
      $("#signupModal").modal("hide");
    });
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

  // Authenticate the User
  auth.signInWithEmailAndPassword(email, password).then((userCredential) => {
    // clear the form
    signInForm.reset();
    // close the modal
    $("#signinModal").modal("hide");
  });
});

// Tasks
//const taskList = document.querySelector(".tasks");
const setupTasks = (data) => {
  if (data.length) {
    taskList.innerHTML = ''

    data.forEach((doc) => {
      const task = doc.data();
      const clone = template.cloneNode(true)
      clone.querySelector('p').textContent = task.texto
      if (task.estado) {
        clone.querySelectorAll('.fas')[0].classList.replace('fa-check-circle', 'fa-undo-alt')
        clone.querySelector('.alert').classList.replace('alert-warning', 'alert-primary')
        clone.querySelector('p').style.textDecoration = 'line-through'
      }
      clone.querySelectorAll('.fas')[0].dataset.id = doc.id
      clone.querySelectorAll('.fas')[1].dataset.id = doc.id
      fragment.appendChild(clone)
    });
    taskList.appendChild(fragment)

  } else {
    taskList.innerHTML = `
    <div class="alert alert-dark text-center">
    Sin tareas pendientes 😍
    </div>
    `
  }
}

// Add Task
const addTask = e => {
  const texto = e.target.querySelector('input').value
  
  if (texto.trim() === '') {
      console.log('está vacio')
      return
  }
fs.collection("tasks").doc().set({
  texto: texto,
  estado:false
})
.then(() => {
  console.log("Document successfully written!");
})
.catch((error) => {
  console.error("Error writing document: ", error);
});
getTasks()

  formulario.reset()
  e.target.querySelector('input').focus()
}
// Edit Task
const editTask = (id, estado) => {
  const task = fs.collection("tasks").doc(id);
  return task.update({
    estado: estado
  })
    .then(() => {
      console.log("Document successfully updated!");
      // setupTasks()
    })
    .catch((error) => {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
    });
}
// Delete Task
const deleteTask = (id) =>{
  return fs.collection("tasks").doc(id).delete().then(() => {
    console.log("Document successfully deleted!");
}).catch((error) => {
    console.error("Error removing document: ", error);
});
}
// Get Tasks
const getTasks = () => {
  fs.collection("tasks")
    .get()
    .then((snapshot) => {
      setupTasks(snapshot.docs);
    });
}

// events
// list for auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    fs.collection("tasks")
      .get()
      .then((snapshot) => {
        setupTasks(snapshot.docs);
        loginCheck(user);
      });
  } else {
    console.log("signout");
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
  auth.signInWithPopup(provider).then((result) => {
    console.log(result);
    console.log("google sign in");
  })
    .catch(err => {
      console.log(err);
    })
});

// Login with Facebook
const facebookButton = document.querySelector('#facebookLogin');

facebookButton.addEventListener('click', e => {
  e.preventDefault();
  signInForm.reset();
  $("#signinModal").modal("hide");

  const provider = new firebase.auth.FacebookAuthProvider();
  auth.signInWithPopup(provider).then((result) => {
    console.log(result);
    console.log("facebook sign in");
  })
    .catch(err => {
      console.log(err);
    })

})