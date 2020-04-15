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
                id: docsSnap.docs[0].id,
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
// Usuarios -  Crea un usuario
// ============================================
app.post('/usuarios', verificaToken, (req, res) => {
    const body = req.body;
    db.collection("usuarios").add({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        salarios: [
            {
                empresa: body.empresa,
                fecha: body.fecha,
                salarioBruto: body.salarioBruto,
                salarioNeto: body.salarioNeto,
                activo: true
            }
        ]
    })
    .then(ref => {
        return res.status(200).json({
            ok: true,
            usuarioId: ref.id,
            mensaje: 'Usuario registrado correctamente.'
        });
    })
    .catch(function(error) {
        return res.status(500).json({
            ok: false,
            errors: error
        });
    });
});

// ============================================
// Cuenta - Crea una nueva cuenta asociada a un usuario
// ============================================
app.post('/cuentas', verificaToken, (req, res) => {
    const body = req.body;
    db.collection("cuentas").add({
        mes: body.mes,
        anio: body.anio,
        usuarios: [
            {
                usuario: db.doc(`usuarios/${body.usuarioId}`),
                gastos: body.gastos
            }
        ]
    })
    .then(ref => {
        return res.status(200).json({
            ok: true,
            cuentaId: ref.id,
            mensaje: 'Cuenta registrada correctamente.'
        });
    })
    .catch(function(error) {
        return res.status(500).json({
            ok: false,
            errors: error
        });
    });
});

// ============================================
// Cuenta - Obtener las cuentas para un usuario
// ============================================
app.get('/cuentas/:id', verificaToken, async (req, res) => {
    const id = req.params.id;
    const cuentaRef = db.collection('cuentas').doc(id);
    const docsSnap = await cuentaRef.get();

    if(!docsSnap.exists){
        res.status(404).json({
            ok: false,
            mensaje: 'No existe una cuenta para el Usuario'
        });
    } else {
        const cuenta = docsSnap.data() || {};
        
        for (const key in cuenta.usuarios) {
            let u = (await db.doc(`usuarios/${cuenta.usuarios[key].usuario._path.segments[1]}`).get()).data();
            u = u || {};
            delete u.password;

            cuenta.usuarios[key].usuario = u;
        }
        
        res.json({
            ok: true,
            cuenta
        });
    }   
});

export const api = functions.https.onRequest(app);