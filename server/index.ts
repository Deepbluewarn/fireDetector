import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from "dotenv";
import router from './router.js';
dotenv.config();

if(process.env.NODE_ENV === 'development'){
	console.log('[server] Server started with development mode.');
}
const app = express();

const port = process.env.NODE_ENV === 'development' ? 4424 : 4422;

app.use('/', router);
app.use('/', express.static(path.join(__dirname, '..', '..', 'dist')));
app.listen(port, () => {
	console.log(`Server listening on port: ${port}`);
});

export default app;