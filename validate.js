const warningMsg = document.getElementById("warning");

const expresiones = {
  password: /^.{6,12}$/, // 6 a 12 digitos.
  email: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
  task: /^[!@#^&*,/\\\\~'<>]$/,
};

const validateTask = ({ expresion = expresiones.task, input }) => {
  const arrTexto = [...input];
  let count = 0;
  errorMsg.textContent = "";
  arrTexto.map(function (e) {
    if (expresion.test(e)) {
      count++;
    }
  });
  if (count > 0) {
    warningMsg.textContent = `Caracter no permitido, ingrese texo simple, por favor, si lo deja sera reemplazado por un espacio al agregar la tarea.
        Total no permitidos ${count} .-
        `;
  } else {
    warningMsg.textContent = "";
  }
  return count;
};

const validateInputs = ({ expresion, input,error }) => {
  if (!expresion.test(input)) {
    error.classList.remove('invisible')
    return false;
  }
  error.classList.add('invisible')
  return true;
};

const transformToValidateTaskText = (texto) => {
  const arrTexto = [...texto];
  return arrTexto
    .map(function (e) {
      return expresiones.task.test(e) ? "" : e;
    })
    .join("");
};

const handleError = ({code}) =>{
    switch (code) {
        case 'auth/wrong-password':
            dangerLoginPasswordMsg.textContent='Clave Incorrecta'  
            dangerLoginPasswordMsg.classList.remove('invisible')
            break;
        case 'auth/user-not-found':
            dangerLoginEmailMsg.textContent='Correo Incorrecto'  
            dangerLoginEmailMsg.classList.remove('invisible')
            break;
        case 'auth/email-already-in-use':
            dangerSignUpEmailMsg.textContent='Correo ya existe'  
            dangerSignUpEmailMsg.classList.remove('invisible')
            break;
                    
        default:
            break;
    }
}