import { io } from 'socket.io-client';

const socketURL = 'http://localhost:5000/project-management';
export const socket = io(socketURL);
