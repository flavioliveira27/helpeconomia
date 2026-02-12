
import bcrypt from 'bcryptjs';

const password = 'Castr0@2715';
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);

console.log('Hash:', hash);
