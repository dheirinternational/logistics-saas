import {randomBytes, scrypt as _scrypt, timingSafeEqual} from "node:crypto"
import { promisify } from "node:util"

const scrypt = promisify(_scrypt)

const SALT_LENGTH = 16
const KEY_LENGTH = 64

export async function hashPassword(password: string){
    const salt = randomBytes(SALT_LENGTH).toString("hex")
    const derivedKey = (await scrypt(password.normalize(), salt, KEY_LENGTH)) as Buffer

    return{
        salt,
        hash: derivedKey.toString("hex"),
    }
}

export async function verifyPassword(password: string, storedSalt: string, storedHash: string){
    const derivedKey = (await scrypt(password.normalize(), storedSalt,KEY_LENGTH)) as Buffer
    const storedHashBuffer = Buffer.from(storedHash, "hex")

    // Prevent simple timing leaks during comparison
    if(storedHashBuffer.length !== derivedKey.length){
        return false;
    }

    return timingSafeEqual(storedHashBuffer, derivedKey)
}