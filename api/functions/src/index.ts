import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://personal-webapp-9a867.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
 response.json({ mensaje: "Hola desde funciones de Firebase" });
});

export const getUsuarios = functions.https.onRequest(async (request, response) => {
    //const nombre = request.query.nombre || 'Si nombre';  
    const usuariosRef = db.collection('usuarios');
    const docsSnap = await usuariosRef.get();
    const usuarios = docsSnap.docs.map(doc => doc.data());

    response.json(usuarios);
});

// Express
const app = express();
app.use(cors({ origin: true }));

app.get('/usuarios', async (req, res) => {
    const usuariosRef = db.collection('usuarios');
    const docsSnap = await usuariosRef.get();
    const usuarios = docsSnap.docs.map(doc => doc.data());

    res.json(usuarios);    
});

app.post('/usuarios/:id', async (req, res) => {
    const id = req.params.id;
    const usuarioRef = db.collection('usuarios').doc(id);
    const docsSnap = await usuarioRef.get();

    if(!docsSnap.exists){
        res.status(404).json({
            ok: false,
            mensaje: 'No existe el usuario con el Id ' + id
        });
    } else{
        const antes = docsSnap.data() || { nombre: 'Armando' };
        await usuarioRef.update({
            password: antes.nombre
        });

        res.status(200).json({
            ok: true,
            mensaje: 'Correcto'
        });
    }   
});


export const api = functions.https.onRequest(app);