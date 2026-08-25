import { createPinia, setActivePinia } from 'pinia';
import { createGame } from './game/Game';
import './style.css';

setActivePinia(createPinia());

const container = document.getElementById('game-container');
if (!container) {
  throw new Error('#game-container not found');
}

createGame(container);