import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTYP9tUmDjYFwUA5nJW4QDh2-Kx5r1JSo",
  authDomain: "intranet-firebase-ccfff.firebaseapp.com",
  projectId: "intranet-firebase-ccfff",
  storageBucket: "intranet-firebase-ccfff.firebasestorage.app",
  messagingSenderId: "733514002817",
  appId: "1:733514002817:web:40af3c247b62a5ef437880",
  measurementId: "G-Q3E6N573G5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// PEGA AQUÍ TU UID después de tu primer login (lo ves en la consola de Firebase)
const ADMIN_UID = "TU_UID_REAL_AQUI"; 

// --- FUNCIONES GLOBALES ---

window.login = async () => {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const errorMsg = document.getElementById('login-error');
    
    try {
        errorMsg.innerText = "Cargando...";
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        errorMsg.innerText = "Error: " + e.message;
        console.error("Error de login:", e.code);
    }
};

window.logout = () => signOut(auth);

window.sendMessage = async () => {
    const input = document.getElementById('chat-input');
    if (input.value.trim() !== "" && auth.currentUser) {
        try {
            await addDoc(collection(db, "mensajes"), {
                texto: input.value,
                usuario: auth.currentUser.email,
                fecha: serverTimestamp()
            });
            input.value = "";
        } catch (e) { console.error("Error al enviar mensaje:", e); }
    }
};

window.registerUser = async () => {
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        alert("Usuario " + email + " creado con éxito.");
        document.getElementById('reg-email').value = "";
        document.getElementById('reg-pass').value = "";
    } catch (e) { alert("Error: " + e.message); }
};

// --- OBSERVADOR DE SESIÓN ---

onAuthStateChanged(auth, (user) => {
    const loginSec = document.getElementById('login-section');
    const mainCont = document.getElementById('main-content');
    
    if (user) {
        loginSec.style.display = 'none';
        mainCont.style.display = 'block';
        
        // Control de Admin
        const isAdmin = user.uid === ADMIN_UID;
        document.getElementById('admin-badge').style.display = isAdmin ? 'inline' : 'none';
        document.getElementById('admin-only-form').style.display = isAdmin ? 'block' : 'none';
        document.getElementById('no-admin-msg').style.display = isAdmin ? 'none' : 'block';
        
        cargarChat();
    } else {
        loginSec.style.display = 'flex';
        mainCont.style.display = 'none';
    }
});

// --- LÓGICA DEL CHAT ---

function cargarChat() {
    const q = query(collection(db, "mensajes"), orderBy("fecha", "asc"));
    onSnapshot(q, (snapshot) => {
        const chatBox = document.getElementById('chat-box');
        chatBox.innerHTML = "";
        snapshot.forEach((doc) => {
            const data = doc.data();
            const time = data.fecha ? new Date(data.fecha.toDate()).toLocaleTimeString() : "...";
            chatBox.innerHTML += `
                <div style="margin-bottom: 8px;">
                    <small style="color: #888;">[${time}]</small> 
                    <strong>${data.usuario.split('@')[0]}:</strong> ${data.texto}
                </div>`;
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}
