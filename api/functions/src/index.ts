import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const serviceAccount = require('./serviceAccountKey.json');

const SEED = require('./config/config').SEED;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://personal-webapp-9a867.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.json({ mensaje: "Hola desde funciones de Firebase" });
// });

// Express
const app = express();
app.use(cors({ origin: true }));

// *****************************************************************************
// FUNCIONES
// *****************************************************************************

// ============================================
// MIDDLEWARE - Valida Token
// ============================================
function verificaToken(req: any, res: any, next: any) {
    const token = req.headers.token;

    jwt.verify(token, SEED, (err: any, decoded: any) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errores: err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });
};

// *****************************************************************************
// RUTAS
// *****************************************************************************

// ============================================
// Login - Valida las credenciales del usuario
// ============================================
app.post('/login', async (req, res) => {
    const body = req.body;
    const usuarioRef = db.collection('usuarios');
    const docsSnap = await usuarioRef.where('email', '==', body.email.toLowerCase()).get();

    if(docsSnap.empty){
        return res.status(404).json({
            ok: false,
            mensaje: 'Credenciales inválidas'
        });
    } else {
        const usuario = docsSnap.docs.map(doc => doc.data());
        if (bcrypt.compareSync(body.password, usuario[0].password)) {
            const respUsuario = {
                id: usuario[0].id,
                email: usuario[0].email,
                nombre: usuario[0].nombre
            };
            const token = jwt.sign({ usuario: respUsuario }, SEED, { expiresIn: 14400 });

            return res.json({
                ok: true,
                token,
                usuario: respUsuario
            });
        } else {
            return res.status(404).json({
                ok: false,
                mensaje: 'Credenciales inválidas'
            });            
        }
    }
});

// ============================================
// Usuarios - Obtiene todos los usuarios
// ============================================
app.get('/usuarios', verificaToken, async (req, res) => {
    const usuariosRef = db.collection('usuarios');
    const docsSnap = await usuariosRef.get();
    const usuarios = docsSnap.docs.map(doc => {
        const usuario = doc.data();
        return {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre
        }
    });

    res.json(usuarios);    
});

// ============================================
// 
// ============================================
app.post('/usuarios/:id', verificaToken, async (req, res) => {
    const id = req.params.id;
    const usuarioRef = db.collection('usuarios').doc(id);
    const docsSnap = await usuarioRef.get();

    if(!docsSnap.exists){
        res.status(404).json({
            ok: false,
            mensaje: 'No existe el usuario con el Id ' + id
        });
    } else{
        //const antes = docsSnap.data() || { nombre: 'Armando' };
        await usuarioRef.update({
            password: bcrypt.hashSync('123456', 10)
        });

        res.status(200).json({
            ok: true,
            mensaje: 'Correcto'
        });
    }   
});

export const api = functions.https.onRequest(app);