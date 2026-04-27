import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword 
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTYP9tUmDjYFwUA5nJW4QDh2-Kx5r1JSo",
  authDomain: "intranet-firebase-ccfff.firebaseapp.com",
  projectId: "intranet-firebase-ccfff",
  storageBucket: "intranet-firebase-ccfff.firebasestorage.app",
  messagingSenderId: "733514002817",
  appId: "1:733514002817:web:40af3c247b62a5ef437880",
  measurementId: "G-Q3E6N573G5"
};

// Inicializar
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- ⚠️ PEGA AQUÍ TU UID DE ADMIN ---
const ADMIN_UID = "lfdI9RkSHrNc6tL94uhWcDgtffY2"; 

// LOGIN
window.login = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) { alert("Error: " + e.message); }
};

// LOGOUT
window.logout = () => signOut(auth);

// ESTADO DE LA SESIÓN
onAuthStateChanged(auth, (user) => {
    const loginSec = document.getElementById('login-section');
    const mainCont = document.getElementById('main-content');
    const adminBadge = document.getElementById('admin-badge');
    const adminForm = document.getElementById('admin-only-form');
    const noAdminMsg = document.getElementById('no-admin-msg');

    if (user) {
        loginSec.style.display = 'none';
        mainCont.style.display = 'block';
        
        if (user.uid === ADMIN_UID) {
            adminBadge.style.display = 'inline';
            adminForm.style.display = 'block';
            noAdminMsg.style.display = 'none';
        } else {
            adminBadge.style.display = 'none';
            adminForm.style.display = 'none';
            noAdminMsg.style.display = 'block';
        }
    } else {
        loginSec.style.display = 'flex';
        mainCont.style.display = 'none';
    }
});

// CHAT: ENVIAR
window.sendMessage = async () => {
    const input = document.getElementById('chat-input');
    if (input.value.trim() !== "") {
        await addDoc(collection(db, "mensajes"), {
            texto: input.value,
            usuario: auth.currentUser.email,
            fecha: serverTimestamp()
        });
        input.value = "";
    }
};

// CHAT: RECIBIR EN TIEMPO REAL
const q = query(collection(db, "mensajes"), orderBy("fecha", "asc"));
onSnapshot(q, (snapshot) => {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = "";
    snapshot.forEach((doc) => {
        const data = doc.data();
        chatBox.innerHTML += `<p><strong>${data.usuario}:</strong> ${data.texto}</p>`;
    });
    chatBox.scrollTop = chatBox.scrollHeight;
});

// REGISTRO DE USUARIOS (SOLO ADMIN)
window.registerUser = async () => {
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        alert("Usuario registrado!");
    } catch (e) { alert("Error: " + e.message); }
};
